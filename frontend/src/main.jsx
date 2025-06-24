import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from "react-router";


import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import Home from './pages/Home';
import GenerarCuadrante from './components/GenerarCuadrante';
import CreateCenterScreen from './components/CrearCentro';

let router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/generarcuadrante",
    element: <GenerarCuadrante />,
  },
  {
    path: "/crearcentro",
    element: <CreateCenterScreen />,
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
