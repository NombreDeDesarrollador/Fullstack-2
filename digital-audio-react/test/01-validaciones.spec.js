// Pruebas de lógica pura: validaciones de formularios
import { validarRun, validarLogin, validarUsuario, validarProducto, validarCheckout, esValido } from '../src/utils/validaciones';

describe('Validaciones de formularios', () => {
    describe('validarRun()', () => {
        it('acepta RUN válidos con dígito verificador numérico y K', () => {
            expect(validarRun('19011029K')).toBeTrue();
            expect(validarRun('123456785')).toBeTrue();
            expect(validarRun('12345678k')).toBeFalse(); // DV incorrecto
        });

        it('rechaza RUN con letras, muy cortos o vacíos', () => {
            expect(validarRun('12A45678K')).toBeFalse();
            expect(validarRun('123')).toBeFalse();
            expect(validarRun('')).toBeFalse();
        });
    });

    describe('validarLogin()', () => {
        it('exige correo con dominio permitido y clave de 4 a 10 caracteres', () => {
            const errores = validarLogin({ correo: 'persona@hotmail.com', clave: '12' });
            expect(errores.correo).toContain('@duoc.cl');
            expect(errores.clave).toBe('Debe tener entre 4 y 10 caracteres.');
        });

        it('no devuelve errores con datos correctos', () => {
            expect(esValido(validarLogin({ correo: 'admin@duoc.cl', clave: 'admin1' }))).toBeTrue();
        });
    });

    describe('validarUsuario()', () => {
        const base = {
            run: '19011029K', nombre: 'Ana', apellidos: 'Soto', correo: 'ana@gmail.com', correo2: 'ana@gmail.com',
            clave: 'abcd', clave2: 'abcd', region: 'Región de Valparaíso', comuna: 'Viña del Mar', direccion: 'Calle 1'
        };

        it('detecta correos y contraseñas que no coinciden al confirmar', () => {
            const errores = validarUsuario({ ...base, correo2: 'otro@gmail.com', clave2: 'zzzz' }, { confirmar: true });
            expect(errores.correo2).toBe('Los correos no coinciden.');
            expect(errores.clave2).toBe('Las contraseñas no coinciden.');
        });

        it('en modo edición no valida RUN y permite clave vacía', () => {
            const errores = validarUsuario({ ...base, run: '', clave: '' }, { edicion: true });
            expect(esValido(errores)).toBeTrue();
        });

        it('exige región y comuna', () => {
            expect(validarUsuario({ ...base, comuna: '' }).region).toBe('Selecciona región y comuna.');
        });
    });

    describe('validarProducto() y validarCheckout()', () => {
        it('rechaza precio negativo y stock decimal', () => {
            const errores = validarProducto({ codigo: 'AB1', nombre: 'X', categoria: 'Accesorios', precio: -1, stock: 1.5, stockCritico: '' });
            expect(errores.precio).toBeDefined();
            expect(errores.stock).toBeDefined();
            expect(errores.codigo).toBeUndefined();
        });

        it('checkout exige todos los datos de entrega', () => {
            const errores = validarCheckout({ nombre: 'Ana', apellidos: '', correo: 'mal', calle: '', region: '', comuna: '' });
            expect(Object.keys(errores)).toEqual(['apellidos', 'correo', 'calle', 'region', 'comuna']);
        });
    });
});
