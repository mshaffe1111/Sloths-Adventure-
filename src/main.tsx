import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);

// Keep an installed copy fresh. The service worker swaps itself in quietly, but a page that is already open keeps
// running the old code and a phone app that is only resumed never looks for news, so check on resume and hourly.
// The app reloads into the new build at the title or the map (App.tsx), never in the middle of a stage.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) window.dispatchEvent(new Event('sloth-update-ready'));
  });
  let lastCheck = Date.now();
  const check = () => {
    lastCheck = Date.now();
    navigator.serviceWorker.getRegistration().then((r) => r?.update()).catch(() => {});
  };
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Date.now() - lastCheck > 5 * 60 * 1000) check();
  });
  window.setInterval(check, 60 * 60 * 1000);
}
