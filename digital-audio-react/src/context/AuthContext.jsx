// =====================================================================
// SESIÓN DEL USUARIO (Cliente, Vendedor o Administrador) con JWT
// - login(): envía correo y clave a ms-usuarios y guarda los tokens que responde.
// - Al recargar la página se lee la sesión guardada y se valida con /auth/me
//   (si el access token venció, api.js lo renueva con el refresh token).
// - Si la renovación falla, la sesión se cierra sola en todas las pestañas.
// - logout() revoca el refresh token en el backend (POST /auth/logout).
// =====================================================================
import React, { createContext, useContext, useEffect, useState } from 'react';
import { iniciarSesion, registrar, usuarioActual, actualizarMiPerfil, cerrarSesion } from '../services/usuariosService';
import { leerSesion, guardarSesion, borrarSesion, actualizarUsuarioSesion, suscribirSesion } from '../services/sesion';
import { limpiar } from '../services/cache';

const AuthContext = createContext(null);
const CLAVE_SESION = 'da_sesion';

export function AuthProvider({ children, usuarioInicial }) {
    // usuarioInicial solo se usa en las pruebas; en la app real la sesión se lee de localStorage
    const enPrueba = usuarioInicial !== undefined;
    const [usuario, setUsuario] = useState(() => enPrueba ? usuarioInicial : (leerSesion()?.usuario || null));
    const [verificando, setVerificando] = useState(() => !enPrueba && !!leerSesion());

    // 1) Al cargar la app: validar contra el backend la sesión guardada
    useEffect(() => {
        if (enPrueba || !leerSesion()) return undefined;
        let vigente = true;
        usuarioActual()
            .then(datos => {
                if (!vigente) return;
                actualizarUsuarioSesion(datos);   // el rol siempre se toma del backend
                setUsuario(datos);
            })
            .catch(error => {
                // 401/403 = token inválido o cuenta desactivada. Si es error de red se mantiene la sesión.
                if (vigente && (error.status === 401 || error.status === 403)) borrarSesion();
            })
            .finally(() => { if (vigente) setVerificando(false); });
        return () => { vigente = false; };
    }, [enPrueba]);

    // 2) Escuchar cambios de la sesión: renovación fallida o login/logout en otra pestaña
    useEffect(() => {
        const quitar = suscribirSesion(sesion => setUsuario(sesion ? sesion.usuario : null));
        const otraPestana = (e) => {
            if (e.key !== CLAVE_SESION) return;
            const sesion = leerSesion();
            setUsuario(sesion ? sesion.usuario : null);
        };
        window.addEventListener('storage', otraPestana);
        return () => { quitar(); window.removeEventListener('storage', otraPestana); };
    }, []);

    const iniciar = (respuesta) => {
        guardarSesion(respuesta);
        setUsuario(respuesta.usuario);
        return respuesta.usuario;
    };

    // Lanza un Error con el mensaje del backend si las credenciales no son válidas
    const login = async (correo, clave) => iniciar(await iniciarSesion(correo, clave));

    const registrarCliente = async (datos) => iniciar(await registrar(datos));

    const logout = () => {
        const sesion = leerSesion();
        // Se avisa al backend para revocar el refresh token; la sesión local se borra igual aunque falle la red
        if (sesion && sesion.refreshToken) cerrarSesion(sesion.refreshToken).catch(() => {});
        borrarSesion();
        limpiar(['ordenes', 'usuarios']); // los datos privados no quedan en memoria
        setUsuario(null);
    };

    // Actualiza los datos del usuario con sesión (perfil)
    const actualizarPerfil = async (cambios) => {
        const actualizado = await actualizarMiPerfil({ ...usuario, ...cambios });
        actualizarUsuarioSesion(actualizado);
        setUsuario(actualizado);
        return actualizado;
    };

    const esPersonal = !!usuario && (usuario.tipoUsuario === 'Administrador' || usuario.tipoUsuario === 'Vendedor');

    return (
        <AuthContext.Provider value={{ usuario, login, registrarCliente, logout, actualizarPerfil, esPersonal, verificando }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const contexto = useContext(AuthContext);
    if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    return contexto;
}
