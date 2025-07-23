// cart.js - Gerenciamento do carrinho de compras
const API_BASE_URL = window.API_BASE_URL;

document.addEventListener("DOMContentLoaded", () => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // DOM Elements
  const cartMessage = document.getElementById("cart-message");
  const cartItemCount = document.getElementById("cart-item-count");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalElement = document.getElementById("cart-total");
  const emptyCartMessage = cartItemsContainer.querySelector(
    ".empty-cart-message"
  );
  const proceedToCheckoutBtn = document.getElementById(
    "proceed-to-checkout-btn"
  );
  const clearCartBtn = document.getElementById("clear-cart-btn");
  const backBtn = document.getElementById("back-btn");

  // Função para formatar preço
  function formatPrice(price) {
    const formattedPrice = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
    return `<strong>${formattedPrice}</strong>`;
  }

  // Função para atualizar contador do carrinho
  function updateCartCount() {
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartItemCount.textContent = totalItems;
  }

  // Função para salvar carrinho no localStorage
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Função para mostrar mensagem
  function showCartMessage(message, type = "success") {
    cartMessage.textContent = message;
    cartMessage.className = `cart-message ${type} show`;
    setTimeout(() => {
      cartMessage.classList.remove("show");
    }, 2500);
  }

  // Função para renderizar o carrinho
  function renderCart() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      emptyCartMessage.style.display = "block";
      proceedToCheckoutBtn.disabled = true;
      clearCartBtn.disabled = true;
    } else {
      emptyCartMessage.style.display = "none";
      proceedToCheckoutBtn.disabled = false;
      clearCartBtn.disabled = false;

      cart.forEach((item) => {
        const cartItemDiv = document.createElement("div");
        cartItemDiv.classList.add("cart-item");
        cartItemDiv.innerHTML = `
          <div class="cart-item-details">
            <img src="${item.imageUrl}" alt="${
          item.name
        }" class="cart-item-thumbnail">
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              <p class="cart-item-description">${item.description.substring(
                0,
                80
              )}${item.description.length > 80 ? "..." : ""}</p>
              <p class="cart-item-unit-price"><b>Valor Unitário: ${formatPrice(
                item.price
              )}</b></p>
              
              <div class="quantity-controls">
                <button class="quantity-btn decrease-btn" data-product-id="${
                  item.id
                }" title="${
          item.quantity === 1
            ? "Remover item do carrinho"
            : "Diminuir quantidade"
        }">-</button>
                <span class="quantity-display ${
                  item.quantity === 1 ? "quantity-warning" : ""
                }">${item.quantity}</span>
                <button class="quantity-btn increase-btn" data-product-id="${
                  item.id
                }" title="Aumentar quantidade">+</button>
              </div>
            </div>
          </div>
          <div class="cart-item-actions">
            <span class="cart-item-price">${formatPrice(
              item.price * item.quantity
            )}</span>
            <button class="remove-item-btn" data-product-id="${
              item.id
            }" title="Remover item do carrinho">
              <img src="imagens/lixeira.png" alt="Remover item" style="width:30px; height:30px;">
            </button>
          </div>
        `;

        cartItemsContainer.appendChild(cartItemDiv);
        total += item.price * item.quantity;
      });
    }

    cartTotalElement.innerHTML = formatPrice(total);
    updateCartCount();
  }

  // Função para aumentar quantidade
  function increaseQuantity(productId) {
    const item = cart.find((item) => item.id === productId);
    if (item) {
      // Limitar quantidade máxima para evitar problemas
      if (item.quantity >= 99) {
        showCartMessage("Quantidade máxima atingida (99 unidades)", "warning");
        return;
      }

      item.quantity += 1;
      saveCart();
      renderCart();
      showCartMessage(`${item.name}: ${item.quantity} unidade(s)`, "success");
    }
  }

  // Função para diminuir quantidade
  function decreaseQuantity(productId) {
    const item = cart.find((item) => item.id === productId);
    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1;
        saveCart();
        renderCart();
        showCartMessage(`${item.name}: ${item.quantity} unidade(s)`, "success");
      } else if (item.quantity === 1) {
        // Calcular total de itens no carrinho (considerando quantidades)
        const totalItemsInCart = cart.reduce(
          (acc, cartItem) => acc + cartItem.quantity,
          0
        );

        if (totalItemsInCart > 1) {
          // Há mais de 1 item total no carrinho, remove sem perguntar
          removeItemDirectly(productId);
        } else {
          // Este é o único item no carrinho, perguntar antes de remover
          if (
            confirm(
              `"${item.name}" é o último item no carrinho.\n\nDeseja remover e esvaziar o carrinho?`
            )
          ) {
            removeItemDirectly(productId);
          }
          // Se cancelar, não faz nada e mantém quantidade 1
        }
      }
    }
  }

  // Função para remover item diretamente (sem confirmação adicional)
  function removeItemDirectly(productId) {
    const itemIndex = cart.findIndex((item) => item.id === productId);
    if (itemIndex > -1) {
      const removedItem = cart[itemIndex];
      cart.splice(itemIndex, 1);
      saveCart();
      renderCart();
      showCartMessage(`${removedItem.name} removido do carrinho!`, "info");
    }
  }

  // Função para remover item do carrinho (apenas via botão lixeira)
  function removeFromCart(productId) {
    const itemIndex = cart.findIndex((item) => item.id === productId);
    if (itemIndex > -1) {
      const removedItem = cart[itemIndex];

      // Confirmar remoção do item
      if (
        confirm(
          `Tem certeza que deseja remover "${removedItem.name}" do carrinho?`
        )
      ) {
        cart.splice(itemIndex, 1);
        saveCart();
        renderCart();
        showCartMessage(`${removedItem.name} removido do carrinho!`, "info");
      }
    }
  }

  // Função para limpar carrinho
  function clearCart() {
    if (cart.length > 0) {
      if (confirm("Tem certeza que deseja limpar todo o carrinho?")) {
        cart = [];
        saveCart();
        renderCart();
        showCartMessage("Carrinho limpo!", "info");
      }
    }
  }

  // Event Listeners
  proceedToCheckoutBtn.addEventListener("click", () => {
    if (cart.length > 0) {
      window.location.href = "checkout.html";
    }
  });

  clearCartBtn.addEventListener("click", clearCart);

  // Event listener para o botão voltar
  backBtn.addEventListener("click", () => {
    // Verifica se há histórico para voltar
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Se não há histórico, redireciona para a página inicial
      window.location.href = "index.html";
    }
  });

  // Event listeners para botões do carrinho (registrado apenas uma vez)
  cartItemsContainer.addEventListener("click", (event) => {
    // Tenta obter o ID do produto do elemento clicado ou de seus pais
    let productId = parseInt(event.target.getAttribute("data-product-id"));

    // Se não encontrou no elemento clicado, tenta no botão pai
    if (!productId && event.target.closest("button")) {
      productId = parseInt(
        event.target.closest("button").getAttribute("data-product-id")
      );
    }

    if (!productId) return;

    if (
      event.target.classList.contains("increase-btn") ||
      event.target.closest(".increase-btn")
    ) {
      increaseQuantity(productId);
    } else if (
      event.target.classList.contains("decrease-btn") ||
      event.target.closest(".decrease-btn")
    ) {
      decreaseQuantity(productId);
    } else if (
      event.target.classList.contains("remove-item-btn") ||
      event.target.closest(".remove-item-btn")
    ) {
      removeFromCart(productId);
    }
  });

  // Inicializar carrinho
  renderCart();
});
