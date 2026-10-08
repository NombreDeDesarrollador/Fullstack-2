// Protege rutas según el rol del usuario con sesión.
// Sin sesión -> /login. Rol no permitido -> página de inicio de su rol.
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function RutaProtegida({ roles, children }) {
    const { usuario } = useAuth();
    if (!usuario) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(usuario.tipoUsuario)) {
        return <Navigate to={usuario.tipoUsuario === 'Cliente' ? '/' : '/admin'} replace />;
    }
    return children;
}

export default RutaProtegida;
