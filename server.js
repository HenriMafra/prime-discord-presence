require("dotenv").config();
const { WebSocketServer } = require("ws");
const { Client } = require("@xhayper/discord-rpc");

const PORT = 31415;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const IDLE_TIMEOUT_MS = 15000;

if (!CLIENT_ID) {
  console.error("Defina DISCORD_CLIENT_ID no arquivo .env (veja .env.example)");
  process.exit(1);
}

const rpc = new Client({ clientId: CLIENT_ID });
let rpcReady = false;
let clearTimer = null;

rpc.on("ready", () => {
  rpcReady = true;
  console.log("[server] conectado ao Discord");
});

rpc.login().catch((err) => {
  console.error("[server] falha ao conectar no Discord:", err.message);
});

function clearActivity() {
  if (rpcReady) rpc.user?.clearActivity().catch(() => {});
}

function updateActivity(data) {
  if (!rpcReady) return;

  clearTimeout(clearTimer);
  clearTimer = setTimeout(clearActivity, IDLE_TIMEOUT_MS);

  const now = Date.now();
  const startTimestamp = now - Math.floor((data.currentTime || 0) * 1000);
  const endTimestamp = data.duration
    ? startTimestamp + Math.floor(data.duration * 1000)
    : undefined;

  rpc.user
    ?.setActivity({
      details: data.title || "Assistindo na Prime Video",
      state: data.paused ? "Pausado" : "Assistindo",
      startTimestamp: data.paused ? undefined : startTimestamp,
      endTimestamp: data.paused ? undefined : endTimestamp,
      largeImageKey: "prime_video",
      largeImageText: "Amazon Prime Video",
      instance: false,
    })
    .catch((err) => console.error("[server] erro ao atualizar presence:", err.message));
}

const wss = new WebSocketServer({ port: PORT });
console.log(`[server] aguardando a extensão em ws://localhost:${PORT}`);

wss.on("connection", (socket) => {
  console.log("[server] extensão conectada");

  socket.on("message", (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }
    updateActivity(data);
  });

  socket.on("close", () => {
    console.log("[server] extensão desconectada");
    clearTimeout(clearTimer);
    clearActivity();
  });
});

process.on("SIGINT", () => {
  clearActivity();
  process.exit(0);
});
