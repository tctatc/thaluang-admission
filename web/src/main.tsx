import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { App } from './app/App';
import './styles.css';

const container = document.getElementById('root');
if (container === null) throw new Error('ไม่พบ element #root');

createRoot(container).render(
  <StrictMode>
    {/* HashRouter: GitHub Pages ไม่มี server rewrite ถ้าใช้ BrowserRouter รีเฟรชที่ /status จะได้ 404 */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
