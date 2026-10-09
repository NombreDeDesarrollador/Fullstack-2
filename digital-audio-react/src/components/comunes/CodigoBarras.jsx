// Código de barras simple (estándar Code 39) dibujado con SVG, sin librerías.
// Props: valor (texto a codificar), alto (px, opcional) y mostrarTexto (bool, opcional).
// Code 39 acepta números, letras mayúsculas y algunos símbolos; cada carácter
// son 9 elementos (5 barras y 4 espacios) y 3 de ellos son anchos.
// El valor siempre empieza y termina con "*", que marca el inicio y el fin.
import React from 'react';

// 1 = elemento ancho, 0 = angosto. Orden: barra, espacio, barra, espacio, ...
export const CODE39 = {
    0: '000110100', 1: '100100001', 2: '001100001', 3: '101100000', 4: '000110001',
    5: '100110000', 6: '001110000', 7: '000100101', 8: '100100100', 9: '001100100',
    A: '100001001', B: '001001001', C: '101001000', D: '000011001', E: '100011000',
    F: '001011000', G: '000001101', H: '100001100', I: '001001100', J: '000011100',
    K: '100000011', L: '001000011', M: '101000010', N: '000010011', O: '100010010',
    P: '001010010', Q: '000000111', R: '100000110', S: '001000110', T: '000010110',
    U: '110000001', V: '011000001', W: '111000000', X: '010010001', Y: '110010000',
    Z: '011010000', '-': '010000101', '.': '110000100', ' ': '011000100', '*': '010010100'
};

const ANGOSTO = 2;
const ANCHO = 5;

// Función pura (exportada para probarla): devuelve las barras { x, ancho } a dibujar
export function calcularBarras(valor) {
    const texto = String(valor || '').toUpperCase();
    if (!texto || [...texto].some(c => !CODE39[c] || c === '*')) {
        throw new Error('El código de barras solo acepta números, letras A-Z, guion, punto y espacio.');
    }
    const barras = [];
    let x = 0;
    for (const caracter of `*${texto}*`) {
        const patron = CODE39[caracter];
        for (let i = 0; i < patron.length; i++) {
            const ancho = patron[i] === '1' ? ANCHO : ANGOSTO;
            if (i % 2 === 0) barras.push({ x, ancho }); // posiciones pares = barras negras
            x += ancho;
        }
        x += ANGOSTO; // separación entre caracteres
    }
    return { barras, anchoTotal: x - ANGOSTO };
}

function CodigoBarras({ valor, alto = 50, mostrarTexto = true }) {
    let resultado;
    try {
        resultado = calcularBarras(valor);
    } catch (e) {
        return <small className="text-danger">Código no válido</small>;
    }
    const { barras, anchoTotal } = resultado;
    return (
        <figure className="d-inline-block m-0 bg-white p-2" data-testid="codigo-barras">
            <svg viewBox={`0 0 ${anchoTotal} ${alto}`} width={anchoTotal} height={alto}
                style={{ maxWidth: '100%', height: 'auto' }} role="img" aria-label={`Código de barras ${valor}`}>
                {barras.map((b, i) => <rect key={i} x={b.x} y="0" width={b.ancho} height={alto} fill="#000" />)}
            </svg>
            {mostrarTexto && <figcaption className="small font-monospace text-center">{String(valor).toUpperCase()}</figcaption>}
        </figure>
    );
}

export default CodigoBarras;
