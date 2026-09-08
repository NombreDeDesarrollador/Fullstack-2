
function validarRun(run) {
    run = run.trim().toUpperCase();
    if (run.length < 7 || run.length > 9) return false;
    const cuerpo = run.slice(0, -1);
    const dv = run.slice(-1);
    if (!/^\d+$/.test(cuerpo)) return false;

    let suma = 0, multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplo;
        multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }
    const resto = 11 - (suma % 11);
    const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
    return dv === dvEsperado;
}
