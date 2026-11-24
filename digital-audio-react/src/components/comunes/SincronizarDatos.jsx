// Pide los datos al backend según quién tiene la sesión:
//   - Todos: catálogo y categorías (públicos).
//   - Cliente: solo sus pedidos.  Vendedor: todos los pedidos.  Administrador: pedidos y usuarios.
// Si el backend no responde, muestra un aviso arriba de la página.
import React, { useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { recargarCatalogo } from '../../services/productosService';
import { cargarOrdenes } from '../../services/ordenesService';
import { cargarUsuarios } from '../../services/usuariosService';
import { registrarError, errorCarga, limpiar, useDatos } from '../../services/cache';

function SincronizarDatos() {
    const { usuario } = useAuth();
    useDatos();

    useEffect(() => {
        recargarCatalogo().catch(e => registrarError(e.message));
    }, []);

    useEffect(() => {
        if (!usuario) {
            limpiar(['ordenes', 'usuarios']);
            return;
        }
        cargarOrdenes(usuario).catch(e => registrarError(e.message));
        if (usuario.tipoUsuario === 'Administrador') cargarUsuarios().catch(e => registrarError(e.message));
    }, [usuario]);

    const error = errorCarga();
    if (!error) return null;
    return (
        <Alert variant="warning" className="m-0 rounded-0 text-center small no-imprimir" data-testid="aviso-conexion">
            <i className="bi bi-wifi-off me-1"></i>{error}
        </Alert>
    );
}

export default SincronizarDatos;
