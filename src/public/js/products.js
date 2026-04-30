const detailSection = document.querySelector(".detail");
const addToCartButton = document.querySelector("#addToCartButton");
const viewCartButton = document.querySelector("#viewCartButton");
const cartMessage = document.querySelector("#cartMessage");
const quantityInput = document.querySelector("#quantity");
const decreaseQuantityButton = document.querySelector("#decreaseQuantity");
const increaseQuantityButton = document.querySelector("#increaseQuantity");

const CART_STORAGE_KEY = "kolexoraCartId";

const getStoredCartId = () => localStorage.getItem(CART_STORAGE_KEY);

const saveCartId = (cartId) => {
  localStorage.setItem(CART_STORAGE_KEY, cartId);
};

const removeStoredCartId = () => {
  localStorage.removeItem(CART_STORAGE_KEY);
};

const updateCartLink = (cartId) => {
  if (!viewCartButton || !cartId) return;

  viewCartButton.href = `/carts/${cartId}`;
  viewCartButton.classList.remove("hidden");
};

const createCart = async () => {
  const response = await fetch("/api/carts", {
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo crear el carrito.");
  }

  const cartId = data.payload._id;
  saveCartId(cartId);

  return cartId;
};

const getOrCreateCartId = async () => {
  const storedCartId = getStoredCartId();

  if (storedCartId) {
    return storedCartId;
  }

  return createCart();
};

const getSelectedQuantity = () => {
  const quantity = Number(quantityInput.value);
  const stock = Number(quantityInput.dataset.stock);

  if (Number.isNaN(quantity) || quantity < 1) {
    return 1;
  }

  if (!Number.isNaN(stock) && stock > 0 && quantity > stock) {
    return stock;
  }

  return quantity;
};

const setSelectedQuantity = (newQuantity) => {
  const stock = Number(quantityInput.dataset.stock);
  let quantity = Number(newQuantity);

  if (Number.isNaN(quantity) || quantity < 1) {
    quantity = 1;
  }

  if (!Number.isNaN(stock) && stock > 0 && quantity > stock) {
    quantity = stock;
  }

  quantityInput.value = quantity;
};

const initialCartId = getStoredCartId();
updateCartLink(initialCartId);

if (decreaseQuantityButton && quantityInput) {
  decreaseQuantityButton.addEventListener("click", () => {
    setSelectedQuantity(Number(quantityInput.value) - 1);
  });
}

if (increaseQuantityButton && quantityInput) {
  increaseQuantityButton.addEventListener("click", () => {
    setSelectedQuantity(Number(quantityInput.value) + 1);
  });
}

if (quantityInput) {
  quantityInput.addEventListener("change", () => {
    setSelectedQuantity(quantityInput.value);
  });
}

if (addToCartButton && detailSection) {
  addToCartButton.addEventListener("click", async () => {
    const productId = detailSection.dataset.productId;
    const quantity = getSelectedQuantity();

    addToCartButton.disabled = true;
    cartMessage.textContent = "Agregando producto al carrito...";

    try {
      const cartId = await getOrCreateCartId();

      const response = await fetch(
        `/api/carts/${cartId}/products/${productId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        removeStoredCartId();
        cartMessage.textContent =
          data.message || "No se pudo agregar el producto.";
        return;
      }

      updateCartLink(cartId);

      cartMessage.textContent =
        quantity === 1
          ? "Producto agregado al carrito correctamente."
          : `${quantity} unidades agregadas al carrito correctamente.`;
    } catch (error) {
      cartMessage.textContent =
        error.message || "Error al conectar con el servidor.";
    } finally {
      addToCartButton.disabled = false;
    }
  });
}
