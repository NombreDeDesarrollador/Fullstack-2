// Vistas críticas que faltaban: Registro, Catálogo (filtros) y formularios del panel
// (ProductoForm y UsuarioForm). Se prueban el renderizado, el estado de los
// formularios, la validación, los eventos y la persistencia en localStorage.
import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import Registro from '../src/pages/tienda/Registro';
import Catalogo from '../src/pages/tienda/Catalogo';
import ProductoForm from '../src/pages/admin/ProductoForm';
import UsuarioForm from '../src/pages/admin/UsuarioForm';
import { productosIniciales } from '../src/data/productos';
import { buscarUsuarioPorRun } from '../src/services/usuariosService';
import { obtenerProducto } from '../src/services/productosService';
import { precioFinal } from '../src/services/productosService';
import { renderConApp, clienteDemo } from './helpers';

const admin = { ...clienteDemo, run: '156782343', nombre: 'Administrador', tipoUsuario: 'Administrador' };

// Escribe en un campo controlado (dispara onChange y actualiza el estado)
const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
const nombresVisibles = () => screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent);

describe('Registro', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => jasmine.clock().uninstall());

    function llenarRegistro(run) {
        escribir(/^RUN/, run);
        escribir(/^Nombre/, 'Ana');
        escribir(/^Apellidos/, 'Soto');
        escribir(/^Correo/, 'ana@gmail.com');
        escribir(/^Confirmar correo/, 'ana@gmail.com');
        escribir(/^Contraseña/, 'abcd1');
        escribir(/^Confirmar contraseña/, 'abcd1');
        escribir(/^Región/, 'Región de Valparaíso');
        escribir(/^Comuna/, 'Viña del Mar');
        escribir(/^Dirección/, 'Calle 1');
    }

    it('al enviar vacío muestra los errores de los campos requeridos', () => {
        renderConApp(<Registro />);
        fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }));
        expect(screen.getByText('El RUN es requerido.')).toBeTruthy();
        expect(screen.getByText('El nombre es requerido.')).toBeTruthy();
        expect(screen.getByText('Selecciona región y comuna.')).toBeTruthy();
    });

    it('rechaza un RUN con dígito verificador incorrecto', () => {
        renderConApp(<Registro />);
        llenarRegistro('1-8');
        fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }));
        expect(screen.getByText('El RUN ingresado no es válido.')).toBeTruthy();
        expect(buscarUsuarioPorRun('18')).toBeNull();
    });

    it('la comuna se habilita solo después de elegir región (selects dependientes)', () => {
        renderConApp(<Registro />);
        expect(screen.getByLabelText(/^Comuna/).disabled).toBeTrue();
        escribir(/^Región/, 'Región del Biobío');
        expect(screen.getByLabelText(/^Comuna/).disabled).toBeFalse();
        expect(screen.getByRole('option', { name: 'Concepción' })).toBeTruthy();
    });

    it('con datos válidos crea el cliente (RUN con puntos y guion) y redirige al login', () => {
        jasmine.clock().install();
        renderConApp(<Registro />, { ruta: '/registro', path: '/registro' });
        llenarRegistro('19.011.029-K');
        fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }));
        expect(screen.getByText(/Registro exitoso/)).toBeTruthy();
        const creado = buscarUsuarioPorRun('19011029K');
        expect(creado.tipoUsuario).toBe('Cliente');
        expect(creado.correo2).toBeUndefined(); // no guarda los campos de confirmación
        act(() => jasmine.clock().tick(1500));
        expect(screen.getByTestId('ubicacion').textContent).toBe('/login');
    });

    it('no permite registrar dos veces el mismo RUN', () => {
        renderConApp(<Registro />);
        llenarRegistro('18.765.432-7'); // RUN del cliente de prueba
        fireEvent.click(screen.getByRole('button', { name: 'Registrarme' }));
        expect(screen.getByText('Ya existe un usuario con ese RUN.')).toBeTruthy();
    });
});

describe('Catálogo con filtros', () => {
    beforeEach(() => localStorage.clear());

    it('muestra todos los productos y el total', () => {
        renderConApp(<Catalogo />);
        expect(nombresVisibles().length).toBe(productosIniciales.length);
        expect(screen.getByText(`${productosIniciales.length} productos`)).toBeTruthy();
    });

    it('filtra por categoría al cambiar el select', () => {
        renderConApp(<Catalogo />);
        escribir('Categoría', 'Baterías');
        const esperados = productosIniciales.filter(p => p.categoria === 'Baterías').map(p => p.nombre);
        expect(nombresVisibles()).toEqual(esperados);
    });

    it('ordena por menor precio', () => {
        renderConApp(<Catalogo />);
        escribir('Ordenar por', 'precio-asc');
        const masBarato = [...productosIniciales].sort((a, b) => precioFinal(a) - precioFinal(b))[0];
        expect(nombresVisibles()[0]).toBe(masBarato.nombre);
    });

    it('usa el término de búsqueda de la URL (?buscar=)', () => {
        renderConApp(<Catalogo />, { ruta: '/catalogo?buscar=zildjian', path: '/catalogo' });
        expect(screen.getByText('zildjian')).toBeTruthy();
        expect(nombresVisibles().length).toBe(productosIniciales.filter(p => p.marca === 'Zildjian').length);
    });

    it('muestra el mensaje vacío si ningún producto coincide', () => {
        renderConApp(<Catalogo />, { ruta: '/catalogo?buscar=xyz123', path: '/catalogo' });
        expect(screen.getByTestId('sin-productos')).toBeTruthy();
    });
});

describe('ProductoForm (panel)', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => jasmine.clock().uninstall());

    it('valida precio negativo, stock decimal y categoría vacía', () => {
        renderConApp(<ProductoForm />, { usuario: admin });
        escribir(/^Código/, 'NU001');
        escribir(/^Nombre/, 'Ukelele');
        escribir(/^Precio/, '-5');
        escribir(/^Stock\*?$/, '1.5');
        fireEvent.click(screen.getByRole('button', { name: /Guardar producto/ }));
        expect(screen.getByText('El precio no puede ser negativo.')).toBeTruthy();
        expect(screen.getByText('Debe ser un entero mayor o igual a 0.')).toBeTruthy();
        expect(screen.getByText('Selecciona una categoría.')).toBeTruthy();
        expect(obtenerProducto('NU001')).toBeNull();
    });

    it('crea un producto nuevo y vuelve al listado', () => {
        jasmine.clock().install();
        renderConApp(<ProductoForm />, { usuario: admin, ruta: '/admin/productos/nuevo', path: '/admin/productos/nuevo' });
        escribir(/^Código/, 'NU001');
        escribir(/^Nombre/, 'Ukelele Soprano');
        escribir(/^Categoría/, 'Accesorios');
        escribir(/^Precio/, '39990');
        escribir(/^Stock\*?$/, '6');
        fireEvent.click(screen.getByRole('button', { name: /Guardar producto/ }));
        expect(screen.getByText('Producto creado correctamente.')).toBeTruthy();
        expect(obtenerProducto('NU001')).toEqual(jasmine.objectContaining({ precio: 39990, stock: 6, stockCritico: 0 }));
        act(() => jasmine.clock().tick(800));
        expect(screen.getByTestId('ubicacion').textContent).toBe('/admin/productos');
    });

    it('no permite crear un código repetido', () => {
        renderConApp(<ProductoForm />, { usuario: admin });
        escribir(/^Código/, 'ga001');
        escribir(/^Nombre/, 'Copia');
        escribir(/^Categoría/, 'Accesorios');
        escribir(/^Precio/, '100');
        escribir(/^Stock\*?$/, '1');
        fireEvent.click(screen.getByRole('button', { name: /Guardar producto/ }));
        expect(screen.getByText('Ya existe un producto con ese código.')).toBeTruthy();
    });

    it('en modo edición carga los datos, bloquea el código y guarda los cambios', () => {
        renderConApp(<ProductoForm />, { usuario: admin, ruta: '/admin/productos/GA001/editar', path: '/admin/productos/:codigo/editar' });
        expect(screen.getByText('Editar producto: GA001')).toBeTruthy();
        expect(screen.getByLabelText(/^Código/).disabled).toBeTrue();
        expect(screen.getByLabelText(/^Nombre/).value).toBe('Guitarra Acústica Folk');
        escribir(/^Precio/, '139990');
        fireEvent.click(screen.getByRole('button', { name: /Guardar producto/ }));
        expect(screen.getByText('Producto actualizado correctamente.')).toBeTruthy();
        expect(obtenerProducto('GA001').precio).toBe(139990);
    });
});

describe('UsuarioForm (panel)', () => {
    beforeEach(() => localStorage.clear());

    function llenarUsuario({ run, correo }) {
        escribir(/^RUN/, run);
        escribir(/^Nombre/, 'Pedro');
        escribir(/^Apellidos/, 'Rojas');
        escribir(/^Correo/, correo);
        escribir(/^Contraseña/, 'clave1');
        escribir(/^Región/, 'Región del Maule');
        escribir(/^Comuna/, 'Talca');
        escribir(/^Dirección/, 'Calle 2');
    }

    it('crea un Vendedor con el rol elegido', () => {
        renderConApp(<UsuarioForm />, { usuario: admin });
        llenarUsuario({ run: '12.345.678-5', correo: 'pedro@duoc.cl' });
        escribir(/^Tipo de usuario/, 'Vendedor');
        fireEvent.click(screen.getByRole('button', { name: /Guardar usuario/ }));
        expect(screen.getByText('Usuario guardado correctamente.')).toBeTruthy();
        expect(buscarUsuarioPorRun('123456785').tipoUsuario).toBe('Vendedor');
    });

    it('rechaza correos de dominios no permitidos y correos repetidos', () => {
        renderConApp(<UsuarioForm />, { usuario: admin });
        llenarUsuario({ run: '12.345.678-5', correo: 'pedro@hotmail.com' });
        fireEvent.click(screen.getByRole('button', { name: /Guardar usuario/ }));
        expect(screen.getByText(/Solo se aceptan correos/)).toBeTruthy();

        escribir(/^Correo/, 'admin@duoc.cl');
        fireEvent.click(screen.getByRole('button', { name: /Guardar usuario/ }));
        expect(screen.getByText('Ya existe un usuario con ese correo.')).toBeTruthy();
        expect(buscarUsuarioPorRun('123456785')).toBeNull();
    });

    it('en edición bloquea el RUN y mantiene la clave si se deja en blanco', () => {
        renderConApp(<UsuarioForm />, { usuario: admin, ruta: '/admin/usuarios/187654327/editar', path: '/admin/usuarios/:run/editar' });
        expect(screen.getByLabelText(/^RUN/).disabled).toBeTrue();
        expect(screen.getByLabelText(/^Contraseña/).value).toBe('');
        escribir(/^Nombre/, 'Cliente Editado');
        fireEvent.click(screen.getByRole('button', { name: /Guardar usuario/ }));
        const editado = buscarUsuarioPorRun('187654327');
        expect(editado.nombre).toBe('Cliente Editado');
        expect(editado.clave).toBe('cliente1');
    });
});
