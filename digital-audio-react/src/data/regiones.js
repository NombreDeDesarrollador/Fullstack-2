// Regiones y comunas de Chile (uso académico) para los <select> dependientes
export const regiones = [
    { nombre: 'Región Metropolitana de Santiago', comunas: ['Santiago', 'Puente Alto', 'Maipú', 'La Florida', 'Las Condes', 'Ñuñoa', 'Cerrillos'] },
    { nombre: 'Región de Valparaíso', comunas: ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'San Antonio'] },
    { nombre: 'Región del Biobío', comunas: ['Concepción', 'Talcahuano', 'Los Ángeles', 'Coronel'] },
    { nombre: 'Región de la Araucanía', comunas: ['Temuco', 'Villarrica', 'Angol', 'Padre Las Casas'] },
    { nombre: 'Región de Ñuble', comunas: ['Chillán', 'San Carlos', 'Bulnes'] },
    { nombre: 'Región del Maule', comunas: ['Talca', 'Curicó', 'Linares', 'Longaví'] }
];

export function comunasDe(nombreRegion) {
    const region = regiones.find(r => r.nombre === nombreRegion);
    return region ? region.comunas : [];
}
