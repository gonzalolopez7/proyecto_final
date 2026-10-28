import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App.jsx';

// Punto de entrada de la aplicación React.
//
// Busca el elemento #root definido en index.html
// y monta dentro de él el componente principal App.
createRoot(document.getElementById('root')).render(

  // StrictMode ayuda a detectar problemas potenciales
  // durante el desarrollo.
  <StrictMode>
    <App />
  </StrictMode>

);