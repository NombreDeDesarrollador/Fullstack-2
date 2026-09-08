// --- FUNCIONES DE ALMACENAMIENTO Y LÓGICA DEL CARRITO ---

function getCarrito() {
  return JSON.parse(localStorage.getItem('carrito')) || [];
}

function formatCLP(value) {
  const amount = Number(value) || 0;
  return `$${new Intl.NumberFormat('es-CL', {
    maximumFractionDigits: 0
  }).format(amount)}`;
}

function saveCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  updateCarritoBadge();
}

function getStock(productId, defaultStock) {
  const stocks = JSON.parse(localStorage.getItem('stocks')) || {};
  return Object.prototype.hasOwnProperty.call(stocks, productId) ? stocks[productId] : defaultStock;
}

function saveStock(productId, stock) {
  const stocks = JSON.parse(localStorage.getItem('stocks')) || {};
  stocks[productId] = stock;
  localStorage.setItem('stocks', JSON.stringify(stocks));
}

function addToCarrito(product) {
  const carrito = getCarrito();
  const existingIndex = carrito.findIndex(item => item.id === product.id);
  const currentQuantity = existingIndex > -1 ? carrito[existingIndex].quantity : 0;
  const availableStock = getStock(product.id, product.stock);

  if (currentQuantity >= availableStock) {
    alert('No hay más unidades disponibles de este producto.');
    return false;
  }

  if (existingIndex > -1) {
    carrito[existingIndex].quantity += 1;
  } else {
    carrito.push({ ...product, quantity: 1 });
  }

  saveCarrito(carrito);
  return true;
}

function updateCarritoBadge() {
  const carrito = getCarrito();
  const totalItems = carrito.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('carrito-badge');
  if (badge) {
    badge.textContent = totalItems;
  }
}

function removeFromCarrito(productId) {
  let carrito = getCarrito();
  carrito = carrito.filter(item => item.id !== productId);
  saveCarrito(carrito);
  renderCarritoView(); // Re-renderiza la vista si estamos en carrito.html
}

function proceedToPayment() {
  const carrito = getCarrito();

  if (carrito.length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }

  const stockInsuficiente = carrito.find(item => {
    const availableStock = getStock(item.id, item.stock);
    return item.quantity > availableStock;
  });

  if (stockInsuficiente) {
    alert(`No hay stock suficiente para ${stockInsuficiente.name}.`);
    return;
  }

  carrito.forEach(item => {
    const availableStock = getStock(item.id, item.stock);
    saveStock(item.id, availableStock - item.quantity);
  });

  saveCarrito([]);
  renderCarritoView();
  const mensajePago = document.getElementById('mensaje-pago-exitoso');
  if (mensajePago) mensajePago.hidden = false;
}

// --- RENDERIZADO DEL CATÁLOGO ---

function renderProducts(products) {
  const container = document.getElementById('catalog-container');
  if (!container) return; // Evita errores si la página no tiene catálogo
  
  container.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>$${product.price}</p>
      <button class="add-to-carrito-btn" data-id="${product.id}">
        Agregar al carrito
      </button>
    </div>
  `).join('');

  document.querySelectorAll('.add-to-carrito-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.target.dataset.id;
      const product = products.find(p => p.id == productId);
      if (product) addToCarrito(product);
    });
  });
}

// --- RENDERIZADO DE LA VISTA DE LA PÁGINA CARRITO.HTML ---

function renderCarritoView() {
  const container = document.getElementById('carrito-items');
  const totalElement = document.getElementById('carrito-total');

  // Solo ejecuta si estamos en la página carrito.html
  if (!container || !totalElement) return;

  const carrito = getCarrito();

  if (carrito.length === 0) {
    container.innerHTML = '<div class="carrito-vacio"><i class="bi bi-cart3"></i><h2>Tu carrito está vacío</h2><p>Agrega instrumentos o accesorios para verlos aquí.</p></div>';
    totalElement.textContent = formatCLP(0);
    return;
  }

  let total = 0;
  container.innerHTML = carrito.map(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    return `
      <div class="carrito-item">
        <img class="carrito-item-imagen" src="${item.image}" alt="${item.name}">
        <div class="carrito-item-datos">
          <h2>${item.name}</h2>
          <p class="carrito-item-precio">${formatCLP(item.price)} cada uno</p>
          <p class="carrito-item-cantidad"><span>Cantidad</span><strong>${item.quantity}</strong></p>
        </div>
        <div class="carrito-item-resultado">
          <span>Subtotal</span>
          <strong>${formatCLP(itemTotal)}</strong>
          <button class="btn-eliminar" onclick="removeFromCarrito('${item.id}')" aria-label="Eliminar ${item.name}">
            <i class="bi bi-trash3"></i><span>Eliminar</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  totalElement.textContent = formatCLP(total);
}

// Inicialización global según el DOM cargado
document.addEventListener('DOMContentLoaded', () => {
  updateCarritoBadge();
  renderCarritoView();

  const checkoutButton = document.getElementById('checkout-btn');
  if (checkoutButton) checkoutButton.addEventListener('click', proceedToPayment);
});