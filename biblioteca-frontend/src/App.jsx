import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import Loans from './pages/Loans';
import MainLayout from './layout/MainLayout';

function App() {
  return (
    <Routes>
      {/* 1. Ruta Pública: Login */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      
      {/* 2. Rutas Privadas (Dentro del Layout) */}
      <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/books" element={<Books />} /> {/* <--- NUEVA RUTA */}
          <Route path="/members" element={<Members />} /> {/* <--- NUEVA RUTA */}
          <Route path="/loans" element={<Loans />} /> {/* <--- NUEVA RUTA */}
      </Route>
      
      {/* 3. Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;