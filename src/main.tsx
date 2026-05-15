import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { SettingsProvider } from './context/SettingsContext.tsx';
import './index.css';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import { initTracking } from './lib/trackingInit';

// Initialize tracking systems
initTracking();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
