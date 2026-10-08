// Formatos reutilizables (pesos chilenos y fechas)

export function formatoCLP(valor) {
    return '$' + new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(Number(valor) || 0);
}

export function formatoFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    if (isNaN(fecha)) return '-';
    return fecha.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
        fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

export function formatoFechaLarga(fechaISO) {
    const fecha = new Date(String(fechaISO).length === 10 ? fechaISO + 'T12:00:00' : fechaISO);
    return fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
}
