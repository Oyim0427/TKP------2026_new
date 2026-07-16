import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Intercept all image source updates to prepend the base URL if deployed to a subdirectory
const originalSrcDesc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
if (originalSrcDesc && originalSrcDesc.set) {
  const originalSet = originalSrcDesc.set;
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    ...originalSrcDesc,
    set: function (val) {
      if (typeof val === 'string' && val.startsWith('/assets/')) {
        const base = import.meta.env.BASE_URL;
        const newVal = base + val.slice(1);
        originalSet.call(this, newVal);
      } else {
        originalSet.call(this, val);
      }
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
