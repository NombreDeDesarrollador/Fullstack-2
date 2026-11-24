// USO DE MOCKS: se reemplazan localStorage y fetch con espías para aislar
// los servicios del almacenamiento y de la red, y verificar cómo los usan.
import { leer, guardar } from '../services/storage';
import { guardarSesion, leerSesion, borrarSesion, tokenExpirado, leerPayload } from '../services/sesion';
import { api, ApiError } from '../services/api';
import { cargarOrdenes, obtenerOrdenes } from '../services/ordenesService';
import { tokenFalso } from './servidorFalso';
import { clienteDemo } from './helpers';

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 300, status, text: () => Promise.resolve(cuerpo ? JSON.stringify(cuerpo) : '') });

describe('Persistencia y comunicación con mocks', () => {
    it('guardar() serializa a JSON y llama a setItem con la clave correcta', () => {
        const espiaSet = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
        guardar('prueba', { a: 1 });
        expect(espiaSet).toHaveBeenCalledTimes(1);
        expect(espiaSet).toHaveBeenCalledWith('prueba', '{"a":1}');
    });

    it('leer() devuelve el valor por defecto si localStorage falla', () => {
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Almacenamiento bloqueado'); });
        expect(leer('carrito', [])).toEqual([]);
    });

    it('la sesión (tokens + usuario) se guarda en localStorage y sobrevive a una recarga', () => {
        guardarSesion({ accessToken: tokenFalso(clienteDemo), refreshToken: 'r', usuario: { nombre: 'Cliente' } });
        expect(JSON.parse(localStorage.getItem('da_sesion')).usuario.nombre).toBe('Cliente');
        expect(leerSesion().usuario.nombre).toBe('Cliente');
        borrarSesion();
        expect(leerSesion()).toBeNull();
    });

    it('lee el payload del JWT y detecta si está vencido', () => {
        const vigente = tokenFalso(clienteDemo, 'access', 600);
        expect(leerPayload(vigente).rol).toBe('Cliente');
        expect(tokenExpirado(vigente)).toBe(false);
        expect(tokenExpirado(tokenFalso(clienteDemo, 'access', -10))).toBe(true);
        expect(tokenExpirado('basura')).toBe(true);
    });

    it('cargarOrdenes() usa los datos que entrega el mock de fetch', async () => {
        const ordenFalsa = { numero: 1, estado: 'Pagada', estadoEnvio: 'Despachado', cliente: { correo: 'cliente@gmail.com' }, items: [], total: 0 };
        guardarSesion({ accessToken: tokenFalso(clienteDemo), refreshToken: 'r', usuario: clienteDemo });
        global.fetch = jest.fn(() => respuesta(200, [ordenFalsa]));
        await cargarOrdenes(clienteDemo);
        expect(fetch).toHaveBeenCalledWith('http://localhost:8083/api/v1/pedidos/mios', expect.objectContaining({
            headers: expect.objectContaining({ Authorization: expect.stringMatching(/^Bearer /) })
        }));
        expect(obtenerOrdenes()).toEqual([ordenFalsa]);
    });

    it('transforma el JSON de error del backend en un ApiError con su mensaje', async () => {
        global.fetch = jest.fn(() => respuesta(409, { mensaje: 'Stock insuficiente', errores: { stock: 'x' } }));
        const error = await api('productos', '/productos', { auth: false }).catch(e => e);
        expect(error).toBeInstanceOf(ApiError);
        expect(error.message).toBe('Stock insuficiente');
        expect(error.status).toBe(409);
        expect(error.errores).toEqual({ stock: 'x' });
    });

    it('si el servidor está apagado muestra un mensaje claro', async () => {
        global.fetch = jest.fn(() => Promise.reject(new TypeError('Failed to fetch')));
        await expect(api('productos', '/productos', { auth: false })).rejects.toThrow('No se pudo conectar con el servidor');
    });

    it('con el access token vencido lo renueva con el refresh token antes de llamar', async () => {
        guardarSesion({ accessToken: tokenFalso(clienteDemo, 'access', -60), refreshToken: tokenFalso(clienteDemo, 'refresh', 3600), usuario: clienteDemo });
        const nuevo = tokenFalso(clienteDemo, 'access', 900);
        global.fetch = jest.fn((url) => url.endsWith('/auth/refresh')
            ? respuesta(200, { accessToken: nuevo, refreshToken: 'r2', usuario: clienteDemo })
            : respuesta(200, []));
        await api('pedidos', '/pedidos/mios');
        expect(fetch.mock.calls[0][0]).toContain('/auth/refresh');
        expect(fetch.mock.calls[1][1].headers.Authorization).toBe(`Bearer ${nuevo}`);
        expect(leerSesion().refreshToken).toBe('r2');
    });

    it('si la renovación falla, la sesión se borra', async () => {
        guardarSesion({ accessToken: tokenFalso(clienteDemo, 'access', -60), refreshToken: tokenFalso(clienteDemo, 'refresh', -1), usuario: clienteDemo });
        await expect(api('pedidos', '/pedidos/mios')).rejects.toMatchObject({ status: 401 });
        expect(leerSesion()).toBeNull();
    });
});
