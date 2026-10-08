// Estado global del carrito: se comparte entre Header, Carrito, Checkout, etc.
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { carritoReducer, ACCIONES, totalCarrito, cantidadCarrito } from './carritoReducer';
import { leer, guardar } from '../services/storage';
import { precioFinal } from '../services/productosService';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, dispatch] = useReducer(carritoReducer, [], () => leer('da_carrito', []));

    // Cada cambio del carrito se guarda en localStorage
    useEffect(() => { guardar('da_carrito', items); }, [items]);

    // Devuelve true si se pudo agregar (respeta el stock)
    const agregar = (producto) => {
        const enCarrito = items.find(i => i.codigo === producto.codigo);
        if ((enCarrito ? enCarrito.cantidad : 0) >= producto.stock) return false;
        dispatch({ type: ACCIONES.AGREGAR, producto: { ...producto, precio: precioFinal(producto) } });
        return true;
    };

    const valor = {
        items,
        total: totalCarrito(items),
        cantidad: cantidadCarrito(items),
        agregar,
        cambiarCantidad: (codigo, delta) => dispatch({ type: ACCIONES.CAMBIAR_CANTIDAD, codigo, delta }),
        eliminar: (codigo) => dispatch({ type: ACCIONES.ELIMINAR, codigo }),
        vaciar: () => dispatch({ type: ACCIONES.VACIAR })
    };

    return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}

export function useCarrito() {
    const contexto = useContext(CartContext);
    if (!contexto) throw new Error('useCarrito debe usarse dentro de <CartProvider>');
    return contexto;
}
