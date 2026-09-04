function buscarProducto() {
    var input = document.getElementById('buscarProducto');
    var resultado = document.getElementById('resultado-busqueda');

    if (input.value.trim() === '') {
        input.style.borderColor = 'red';
        resultado.innerHTML = 'Escribe algo para buscar';
        resultado.style.color = 'red';
        return;
    }

    input.style.borderColor = '';
    resultado.innerHTML = 'Buscando: "' + input.value.trim() + '"...';
    resultado.style.color = 'green';
}