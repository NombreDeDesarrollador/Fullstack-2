// Componente de ejemplo de la guía "Informe de cobertura" (DSY1104, guías 2.3.3 y 2.3.4).
// Tiene dos comportamientos que se pueden probar: con nombre y sin nombre.
function Saludo({ nombre }) {
    if (!nombre) {
        return <h1>Bienvenido, invitado</h1>;
    }

    return <h1>Hola, {nombre}</h1>;
}

export default Saludo;
