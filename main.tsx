import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { auth } from './firebase';

const originalFetch = globalThis.fetch;
Object.defineProperty(globalThis, 'fetch', {
  value: async (input, init) => {
    let url = '';
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.href;
    } else if (input instanceof Request) {
      url = input.url;
    }


    if (url.startsWith('/api/') && !url.startsWith('/api/auth/login') && !url.startsWith('/api/health') && !url.startsWith('/api/db-status')) {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      let res;
      if (input instanceof Request) {
        const newHeaders = new Headers(input.headers);
        if (token) {
          newHeaders.set('Authorization', `Bearer ${token}`);
        }
        const newRequest = new Request(input, { headers: newHeaders });
        res = await originalFetch(newRequest, init);
      } else {
        const newInit = { ...init };
        newInit.headers = new Headers(newInit.headers || {});
        if (token) {
          newInit.headers.set('Authorization', `Bearer ${token}`);
        }
        res = await originalFetch(input, newInit);
      }
      
      if (res.status === 403) {
        window.dispatchEvent(new CustomEvent('ip-blocked'));
      }
      return res;
    }

    return originalFetch(input, init);
  },
  writable: true,
  configurable: true
});



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
