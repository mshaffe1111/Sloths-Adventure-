import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';
import './gameUi.css';
import { checkForUpdate, markUpdateAvailable } from './game/updates.ts';
import { armFullscreen } from './game/fullscreen.ts';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);

// full screen from the first tap on, unless the player turned it off (game/fullscreen.ts)
armFullscreen();

// Keep an open copy fresh. The service worker swaps itself in quietly, but a page that is already open keeps running the old code and a phone
// app that is only resumed never looks for news, so look on resume, every few minutes, and whenever the title shows. A second, plainer check
// (the published version file, game/updates.ts) does not depend on the service worker. The app reloads into the new build at the title or the
// map (App.tsx), never in the middle of a stage; the pause menu and the title carry a button for it.
if (import.meta.env.PROD) {
  let lastCheck = Date.now();
  const check = () => {
    lastCheck = Date.now();
    void checkForUpdate();
    if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistration().then((r) => r?.update()).catch(() => {});
  };
  if ('serviceWorker' in navigator) {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController) markUpdateAvailable();
    });
  }
  window.addEventListener('sloth-check-update', () => {
    if (Date.now() - lastCheck > 15 * 1000) check();
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Date.now() - lastCheck > 2 * 60 * 1000) check();
  });
  window.setInterval(check, 5 * 60 * 1000);
}
