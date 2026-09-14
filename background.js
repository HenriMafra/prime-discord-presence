// MantÃ©m conexÃ£o WebSocket com o servidor local (server.js)
// e repassa os dados recebidos do content.js. CompatÃ­vel com Firefox e Chromium.

const SERVER_URL = "ws://localhost:31415";
const extensionApi = typeof browser !== "undefined" ? browser : chrome;
let socket = null;
let reconnectTimer = null;

function connect() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  try {
    socket = new WebSocket(SERVER_URL);

    socket.onopen = () => {
      console.log("[PrimePresence] conectado ao servidor local");
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    socket.onclose = () => {
      socket = null;
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(connect, 5000);
      }
    };

    socket.onerror = () => {
      // O tratamento de erro serÃ¡ executado pelo evento onclose
    };
  } catch (e) {
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(connect, 5000);
    }
  }
}

connect();

extensionApi.runtime.onMessage.addListener((message) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
});