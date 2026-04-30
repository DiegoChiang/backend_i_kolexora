const socket = io();
const list = document.querySelector('#realTimeProductsList');
const form = document.querySelector('#createProductForm');
const message = document.querySelector('#realTimeMessage');

const renderProducts = (products) => {
  if (!products || products.length === 0) {
    list.innerHTML = '<p>No hay productos disponibles.</p>';
    return;
  }

  list.innerHTML = products.map((product) => {
    const image = product.thumbnails && product.thumbnails.length > 0
      ? product.thumbnails[0]
      : '/img/placeholder.png';

    return `
      <article class="product-card">
        <div class="product-image">
          <img src="${image}" alt="${product.title}" onerror="this.src='/img/placeholder.png'">
        </div>
        <div class="product-content">
          <span class="category">${product.category}</span>
          <h3>${product.title}</h3>
          <p>${product.description}</p>
          <p class="price">S/ ${Number(product.price || 0).toFixed(2)}</p>
          <p class="stock">Stock: ${product.stock}</p>
          <a class="button" href="/products/${product._id}">Ver detalle</a>
        </div>
      </article>
    `;
  }).join('');
};

const fetchProducts = async () => {
  const response = await fetch('/api/products?limit=100');
  const data = await response.json();
  renderProducts(data.payload);
};

socket.on('productsUpdated', (products) => {
  renderProducts(products);
});

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const productData = Object.fromEntries(formData.entries());

    productData.price = Number(productData.price);
    productData.stock = Number(productData.stock);
    productData.status = true;
    productData.thumbnails = productData.thumbnails ? [productData.thumbnails] : [];

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      const data = await response.json();

      if (!response.ok) {
        message.textContent = data.message || 'No se pudo crear el producto.';
        return;
      }

      message.textContent = 'Producto creado correctamente.';
      form.reset();
    } catch (error) {
      message.textContent = 'Error al conectar con el servidor.';
    }
  });
}

fetchProducts();
