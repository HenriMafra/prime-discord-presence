// Mantém uma conexão WebSocket com o servidor local (server.js)
// e repassa os dados que o content.js manda.

const SERVER_URL = "ws://localhost:31415";
let socket = null;

function connect() {
  try {
    socket = new WebSocket(SERVER_URL);

    socket.onopen = () => {
      console.log("[PrimePresence] conectado ao servidor local");
    };

    socket.onclose = () => {
      socket = null;
      setTimeout(connect, 5000);
    };

    socket.onerror = () => {
      // será tratado pelo onclose
    };
  } catch (e) {
    setTimeout(connect, 5000);
  }
}

connect();

browser.runtime.onMessage.addListener((message) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
});
