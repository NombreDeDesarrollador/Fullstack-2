// =====================================================================
// ARREGLO DE REGIONES Y COMUNAS DE CHILE (complementario, uso académico)
// Usado en registro.html para llenar los <select> dependientes.
// =====================================================================

const regiones = [
    {
        nombre: "Región Metropolitana de Santiago",
        comunas: ["Santiago", "Puente Alto", "Maipú", "La Florida", "Las Condes", "Ñuñoa"]
    },
    {
        nombre: "Región de Valparaíso",
        comunas: ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "San Antonio"]
    },
    {
        nombre: "Región del Biobío",
        comunas: ["Concepción", "Talcahuano", "Chillán", "Los Ángeles", "Coronel"]
    },
    {
        nombre: "Región de la Araucanía",
        comunas: ["Temuco", "Villarrica", "Angol", "Padre Las Casas"]
    },
    {
        nombre: "Región de Ñuble",
        comunas: ["Chillán", "San Carlos", "Bulnes"]
    },
    {
        nombre: "Región del Maule",
        comunas: ["Talca", "Curicó", "Linares", "Longaví"]
    }
];

function poblarRegiones() {
    const selectRegion = document.getElementById('region');
    const selectComuna = document.getElementById('comuna');
    if (!selectRegion || !selectComuna) return;

    selectRegion.innerHTML = '<option value="">-- Seleccione la región --</option>' +
        regiones.map(r => `<option value="${r.nombre}">${r.nombre}</option>`).join('');

    selectComuna.innerHTML = '<option value="">-- Seleccione la comuna --</option>';

    selectRegion.addEventListener('change', function () {
        const regionSeleccionada = regiones.find(r => r.nombre === selectRegion.value);
        if (regionSeleccionada) {
            selectComuna.innerHTML = '<option value="">-- Seleccione la comuna --</option>' +
                regionSeleccionada.comunas.map(c => `<option value="${c}">${c}</option>`).join('');
        } else {
            selectComuna.innerHTML = '<option value="">-- Seleccione la comuna --</option>';
        }
    });
}

document.addEventListener('DOMContentLoaded', poblarRegiones);
