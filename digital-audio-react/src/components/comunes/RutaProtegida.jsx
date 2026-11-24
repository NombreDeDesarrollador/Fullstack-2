// Protege rutas según el rol del usuario con sesión.
// Sin sesión -> /login (recordando a dónde quería ir). Rol no permitido -> página de inicio de su rol.
// Mientras se valida el token guardado (recarga de página) muestra "Verificando sesión...".
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Cargando from './Cargando';

function RutaProtegida({ roles, children }) {
    const { usuario, verificando } = useAuth();
    const location = useLocation();
    if (verificando) return <Cargando texto="Verificando sesión..." />;
    if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
    if (roles && !roles.includes(usuario.tipoUsuario)) {
        return <Navigate to={usuario.tipoUsuario === 'Cliente' ? '/' : '/admin'} replace />;
    }
    return children;
}

export default RutaProtegida;
