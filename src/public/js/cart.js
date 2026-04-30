const cartList = document.querySelector('.cart-list');
const clearCartButton = document.querySelector('#clearCartButton');
const cartMessage = document.querySelector('#cartMessage');

const CART_STORAGE_KEY = 'kolexoraCartId';

const getCartId = () => cartList?.dataset.cartId || clearCartButton?.dataset.cartId;

const showCartMessage = (message) => {
  if (cartMessage) {
    cartMessage.textContent = message;
  }
};

const reloadCart = () => {
  window.location.reload();
};

const updateProductQuantity = async (cartId, productId, quantity) => {
  const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ quantity })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo actualizar la cantidad.');
  }

  return data;
};

const removeProductFromCart = async (cartId, productId) => {
  const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
    method: 'DELETE'
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo eliminar el producto.');
  }

  return data;
};

const clearCart = async (cartId) => {
  const response = await fetch(`/api/carts/${cartId}`, {
    method: 'DELETE'
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo vaciar el carrito.');
  }

  return data;
};

if (cartList) {
  cartList.addEventListener('click', async (event) => {
    const cartItem = event.target.closest('.cart-item');
    if (!cartItem) return;

    const cartId = getCartId();
    const productId = cartItem.dataset.productId;
    const quantityInput = cartItem.querySelector('.cart-quantity-input');

    if (event.target.classList.contains('decrease-cart-quantity')) {
      const currentQuantity = Number(quantityInput.value);
      quantityInput.value = currentQuantity > 1 ? currentQuantity - 1 : 1;
    }

    if (event.target.classList.contains('increase-cart-quantity')) {
      const currentQuantity = Number(quantityInput.value);
      quantityInput.value = currentQuantity + 1;
    }

    if (event.target.classList.contains('update-quantity-button')) {
      const quantity = Number(quantityInput.value);

      if (Number.isNaN(quantity) || quantity < 1) {
        showCartMessage('La cantidad debe ser mayor a 0.');
        return;
      }

      try {
        showCartMessage('Actualizando cantidad...');
        await updateProductQuantity(cartId, productId, quantity);
        reloadCart();
      } catch (error) {
        showCartMessage(error.message);
      }
    }

    if (event.target.classList.contains('remove-product-button')) {
      const confirmDelete = confirm('¿Deseas eliminar este producto del carrito?');

      if (!confirmDelete) return;

      try {
        showCartMessage('Eliminando producto...');
        await removeProductFromCart(cartId, productId);
        reloadCart();
      } catch (error) {
        showCartMessage(error.message);
      }
    }
  });
}

if (clearCartButton) {
  clearCartButton.addEventListener('click', async () => {
    const cartId = getCartId();

    const confirmClear = confirm('¿Deseas vaciar todo el carrito?');

    if (!confirmClear) return;

    try {
      showCartMessage('Vaciando carrito...');
      await clearCart(cartId);
      localStorage.removeItem(CART_STORAGE_KEY);
      reloadCart();
    } catch (error) {
      showCartMessage(error.message);
    }
  });
}