// Las pruebas de Karma usan las mismas utilidades que las de Jest
// (render con Router + sesión JWT falsa + carrito, y los usuarios de prueba).
import { waitFor as waitForRTL } from '@testing-library/react';

export * from '../src/pruebas/helpers';

// En Jasmine un expect() que falla NO lanza una excepción (solo se anota), así que waitFor()
// creería que la condición ya se cumplió. Este waitFor usa, mientras espera, un expect
// pequeño que sí lanza error, para que waitFor vuelva a intentar hasta que se cumpla.
function expectQueLanza(real) {
    const comprobar = (ok, mensaje) => { if (!ok) throw new Error(mensaje); };
    const matchers = (negado) => ({
        toBe: (esperado) => comprobar(Object.is(real, esperado) !== negado, `Se esperaba ${negado ? 'distinto de ' : ''}${esperado} y llegó ${real}`),
        toEqual: (esperado) => comprobar(jasmine.matchersUtil.equals(real, esperado) !== negado, 'Los valores no coinciden'),
        toBeNull: () => comprobar((real === null) !== negado, `Se esperaba ${negado ? 'algo' : 'null'}`),
        toBeTruthy: () => comprobar(!!real !== negado, 'Se esperaba un valor verdadero'),
        toContain: (parte) => comprobar(real.includes(parte) !== negado, `No contiene ${parte}`)
    });
    return { ...matchers(false), not: matchers(true) };
}

export async function waitFor(callback, opciones) {
    return waitForRTL(() => {
        const original = window.expect;
        window.expect = expectQueLanza;
        try {
            return callback();
        } finally {
            window.expect = original;
        }
    }, opciones);
}
