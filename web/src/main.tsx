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

// เว็บแอป: ติดตั้งลงหน้าจอโฮมได้ และเปิดหน้าแอปได้แม้เน็ตหลุด (เฉพาะไฟล์หน้าเว็บ ไม่เก็บข้อมูลผู้สมัคร)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => { /* เบราว์เซอร์ไม่รองรับก็ใช้เป็นเว็บธรรมดา */ });
  });
}
