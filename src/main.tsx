import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure service worker updates immediately across app loads
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.update();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
