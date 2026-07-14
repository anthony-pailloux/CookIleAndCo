import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './style/themes.css';
import './index.css';
import App from './App.jsx';

// Point d'entrée React — monte App dans le DOM avec BrowserRouter (react-router-dom).
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
);
