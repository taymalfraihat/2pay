// Handles the Android/Chrome install prompt and iOS/standalone detection.
// Imported once, before the app renders, so window.triggerInstall /
// window.isIOS / window.isStandalone are ready when InstallAppCard mounts.

window.deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredInstallPrompt = e;
  window.dispatchEvent(new Event('pwa-installable'));
});

window.triggerInstall = async () => {
  const promptEvent = window.deferredInstallPrompt;
  if (!promptEvent) return false;
  promptEvent.prompt();
  const choice = await promptEvent.userChoice;
  window.deferredInstallPrompt = null;
  return choice.outcome === 'accepted';
};

window.isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

window.isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
