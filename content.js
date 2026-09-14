// Roda dentro da pÃ¡gina da Prime Video e lÃª informaÃ§Ãµes do player.
// Suporta reproduÃ§Ã£o padrÃ£o e transmissÃµes ao vivo.

const extensionApi = typeof browser !== "undefined" ? browser : chrome;

function getVideoElement() {
  return document.querySelector("video");
}

function getPlayerMetadata() {
  // 1. Tenta extrair elementos de texto da interface do player da Prime Video
  const playerTitleEl = document.querySelector(".atvwebplayersdk-title-text, [data-automation-id='title']");
  const playerSubtitleEl = document.querySelector(".atvwebplayersdk-subtitle-text, [data-automation-id='subtitle']");

  let mainTitle = playerTitleEl ? playerTitleEl.textContent.trim() : "";
  let subtitle = playerSubtitleEl ? playerSubtitleEl.textContent.trim() : "";

  // 2. Fallback para document.title caso o DOM do player nÃ£o exponha as classes
  if (!mainTitle) {
    let rawTitle = document.title || "";
    mainTitle = rawTitle
      .replace(/^Amazon\.com:\s*/i, "")
      .replace(/^Prime Video:\s*/i, "")
      .replace(/\s*\|\s*Prime Video.*$/i, "")
      .replace(/\s*-\s*Amazon\.com.*$/i, "")
      .replace(/\s*-\s*Amazon Prime Video.*$/i, "")
      .trim();
  }

  return {
    title: mainTitle || "Assistindo na Prime Video",
    subtitle: subtitle,
  };
}

function sendUpdate() {
  const video = getVideoElement();
  if (!video) return;

  const isLive = !Number.isFinite(video.duration) || location.href.includes("/live/");
  const meta = getPlayerMetadata();

  const data = {
    title: meta.title,
    subtitle: meta.subtitle,
    currentTime: Number.isFinite(video.currentTime) ? video.currentTime : 0,
    duration: isLive ? 0 : (Number.isFinite(video.duration) ? video.duration : 0),
    isLive: isLive,
    paused: video.paused,
    url: location.href,
    timestamp: Date.now(),
  };

  try {
    extensionApi.runtime.sendMessage(data).catch(() => {});
  } catch (e) {
    // ExtensÃ£o recarregada ou em segundo plano
  }
}

let watching = false;
function startWatching() {
  if (watching) return;
  watching = true;
  setInterval(sendUpdate, 5000);
  sendUpdate();
}

const observer = new MutationObserver(() => {
  if (getVideoElement()) {
    startWatching();
  }
});
observer.observe(document.documentElement, { childList: true, subtree: true });

if (getVideoElement()) {
  startWatching();
}