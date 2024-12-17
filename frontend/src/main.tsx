
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css'
import App from './App.tsx'
import Arena from './pages/Arena.tsx';

createRoot(document.getElementById('root')!).render(

    <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/arena" element={<Arena />} />

    </Routes>
    </BrowserRouter>

)
