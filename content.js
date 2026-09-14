// Roda dentro da página da Prime Video e lê informações do player.
// Não modifica nada na página, só observa.

function getVideoElement() {
  return document.querySelector("video");
}

function getTitleInfo() {
  let title = document.title || "";
  title = title
    .replace(/^Amazon\.com:\s*/i, "")
    .replace(/^Prime Video:\s*/i, "")
    .replace(/\s*\|\s*Prime Video.*$/i, "")
    .replace(/\s*-\s*Amazon\.com.*$/i, "")
    .replace(/\s*-\s*Amazon Prime Video.*$/i, "")
    .trim();
  return title || "Assistindo na Prime Video";
}

function sendUpdate() {
  const video = getVideoElement();
  if (!video || Number.isNaN(video.duration)) return;

  const data = {
    title: getTitleInfo(),
    currentTime: video.currentTime || 0,
    duration: video.duration || 0,
    paused: video.paused,
    url: location.href,
    timestamp: Date.now(),
  };

  try {
    browser.runtime.sendMessage(data).catch(() => {});
  } catch (e) {
    // extensão pode ter sido recarregada; ignora silenciosamente
  }
}

let watching = false;
function startWatching() {
  if (watching) return;
  watching = true;
  setInterval(sendUpdate, 5000);
  sendUpdate();
}

// A Prime Video carrega o player dinamicamente, então observamos o DOM
// até o elemento <video> aparecer.
const observer = new MutationObserver(() => {
  if (getVideoElement()) {
    startWatching();
  }
});
observer.observe(document.documentElement, { childList: true, subtree: true });

if (getVideoElement()) {
  startWatching();
}
