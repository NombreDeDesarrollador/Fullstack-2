// Sesión del usuario (Cliente, Vendedor o Administrador)
import React, { createContext, useContext, useState } from 'react';
import { autenticar, actualizarUsuario } from '../services/usuariosService';
import { leer, guardar, eliminar } from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children, usuarioInicial }) {
    const [usuario, setUsuario] = useState(() => usuarioInicial !== undefined ? usuarioInicial : leer('da_sesion', null));

    const login = (correo, clave) => {
        const encontrado = autenticar(correo, clave);
        if (encontrado) {
            setUsuario(encontrado);
            guardar('da_sesion', encontrado);
        }
        return encontrado;
    };

    const logout = () => {
        setUsuario(null);
        eliminar('da_sesion');
    };

    // Actualiza los datos del usuario con sesión (perfil)
    const actualizarPerfil = (cambios) => {
        const actualizado = actualizarUsuario(usuario.run, cambios);
        setUsuario(actualizado);
        guardar('da_sesion', actualizado);
        return actualizado;
    };

    const esPersonal = !!usuario && (usuario.tipoUsuario === 'Administrador' || usuario.tipoUsuario === 'Vendedor');

    return (
        <AuthContext.Provider value={{ usuario, login, logout, actualizarPerfil, esPersonal }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const contexto = useContext(AuthContext);
    if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    return contexto;
}
