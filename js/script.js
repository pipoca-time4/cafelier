import { mockProducts } from "./productsData.js"; // --- 3. Lógica de Negócio ---
const formatPrice = (price) => {
  const formattedPrice = `R$ ${price.toFixed(2).replace(".", ",")}`;
  return `<strong>${formattedPrice}</strong>`;
};

const API_BASE_URL = window.API_BASE_URL;
document.addEventListener("DOMContentLoaded", () => {
  let cart = JSON.parse(localStorage.getItem("cart")) || []; // Carrega do localStorage

  // --- 2. DOM ---
  const productListContainer = document.getElementById("product-list");
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
  const checkoutSection = document.getElementById("checkout-section");
  const checkoutForm = document.getElementById("checkout-form");
  const orderItemsList = document.getElementById("order-items");
  const orderSummaryTotal = document.getElementById("order-summary-total");
  const categoryListUl = document.getElementById("category-list");

  // Carrinho flutuante
  const floatingCart = document.getElementById("floating-cart");
  const floatingCartCount = document.getElementById("floating-cart-count");

  // Endereço
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const cepInput = document.getElementById("zipcode");
  const addressInput = document.getElementById("address");
  const neighborhoodInput = document.getElementById("neighborhood");
  const cityInput = document.getElementById("city");
  const stateInput = document.getElementById("state");
  const numberInput = document.getElementById("number");
  const complementInput = document.getElementById("complement");

  // frete
  const shippingCostElement = document.getElementById("shipping-cost");
  const orderSummaryGrandTotal = document.getElementById(
    "order-summary-grand-total"
  ); // valor total + frete

  // Referências para mensagens de erro
  const nameError = document.getElementById("name-error");
  const emailError = document.getElementById("email-error");
  const zipcodeError = document.getElementById("zipcode-error");
  const numberError = document.getElementById("number-error");

  // --- 3. Lógica de Negócio ---
  const formatPrice = (price) => `R$ ${price.toFixed(2).replace(".", ",")}`;

  // Função para salvar carrinho no localStorage
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function showCartMessage(productName) {
    cartMessage.innerHTML = `<img src="imagens/cart-icon.png" alt="Carrinho" class="cart-animation-icon"> "${productName}" adicionado!`;
    cartMessage.classList.add("show");

    const cartIcon = cartMessage.querySelector(".cart-animation-icon");
    if (cartIcon) {
      cartIcon.classList.add("animate");
    }

    setTimeout(() => {
      cartMessage.classList.remove("show");
      if (cartIcon) {
        cartIcon.classList.remove("animate");
      }
    }, 3000);
  }

  function createProductCard(product) {
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");
    productCard.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}">
                <div class="product-info"> <h3>${product.name}</h3>
                    
                    <p class="category">Categoria: ${product.category}</p>
                    <p class="description">${product.description}</p> 
                    <p class="price">${formatPrice(product.price)}</p>
                    <button class="add-to-cart-btn button" data-product-id="${
                      product.id
                    }">
                        Adicionar ao Carrinho
                    </button>
                </div>
            `;

    const addButton = productCard.querySelector(".add-to-cart-btn");
    addButton.addEventListener("click", () => {
      addToCart(product);
    });

    return productCard;
  }

  function addToCart(product) {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    saveCart(); // Salvar no localStorage
    renderCart();
    showCartMessage(product.name);

    // Animar o carrinho flutuante
    floatingCart.classList.add("pulse");
    setTimeout(() => {
      floatingCart.classList.remove("pulse");
    }, 600);
  }

  function increaseQuantity(productId) {
    const item = cart.find((item) => item.id === productId);
    if (item) {
      item.quantity++;
      saveCart(); // Salvar no localStorage
      renderCart();
      updateOrderSummary(); // Atualizar o resumo do pedido se estiver visível
    }
  }

  function decreaseQuantity(productId) {
    const item = cart.find((item) => item.id === productId);
    if (item && item.quantity > 1) {
      item.quantity--;
      saveCart(); // Salvar no localStorage
      renderCart();
      updateOrderSummary(); // Atualizar o resumo do pedido se estiver visível
    } else if (item && item.quantity === 1) {
      // Se a quantidade for 1, remover o item completamente
      removeFromCart(productId);
    }
  }

  function removeFromCart(productId) {
    const itemIndex = cart.findIndex((item) => item.id === productId);
    if (itemIndex > -1) {
      const removedItem = cart[itemIndex];
      cart.splice(itemIndex, 1);
      saveCart(); // Salvar no localStorage
      renderCart();
      updateOrderSummary(); // Atualizar o resumo do pedido se estiver visível

      // Mostrar mensagem de remoção
      cartMessage.innerHTML = `<span class="remove-message">❌ "${removedItem.name}" removido do carrinho!</span>`;
      cartMessage.classList.add("show");

      setTimeout(() => {
        cartMessage.classList.remove("show");
      }, 2500);
    }
  }

  function renderCart() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      emptyCartMessage.style.display = "block";
      proceedToCheckoutBtn.disabled = true;
    } else {
      emptyCartMessage.style.display = "none";
      proceedToCheckoutBtn.disabled = false;

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
             <p class="cart-item-description">${item.description}</p>
            <p class="cart-item-unit-price"><b>Valor Unitário: ${formatPrice(
              item.price
            )}</b></p>
           
            <div class="quantity-controls">
                <button class="quantity-btn decrease-btn" data-product-id="${
                  item.id
                }">-</button>
                <span class="quantity-display"> ${item.quantity}</span>
                <button class="quantity-btn increase-btn" data-product-id="${
                  item.id
                }">+</button>
            </div>
        </div>
    </div>
    <div class="cart-item-actions">
        <span class="cart-item-price">${formatPrice(
          item.price * item.quantity
        )}</span>
        <button data-product-id="${item.id}">
            <span class="remove-item-btn">
                <img src="imagens/lixeira.png" class="remove-item-btn" style="width:30px; height:30px; background:transparent;">
            </span>
        </button>
    </div>
`;

        // Adicionar event listeners para os botões
        const decreaseBtn = cartItemDiv.querySelector(".decrease-btn");
        const increaseBtn = cartItemDiv.querySelector(".increase-btn");
        const removeBtn = cartItemDiv.querySelector(".remove-item-btn");

        decreaseBtn.addEventListener("click", () => decreaseQuantity(item.id));
        increaseBtn.addEventListener("click", () => increaseQuantity(item.id));
        removeBtn.addEventListener("click", () => removeFromCart(item.id));

        cartItemsContainer.appendChild(cartItemDiv);
        total += item.price * item.quantity;
      });
    }

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    // Atualizar contadores
    cartItemCount.textContent = totalItems;
    floatingCartCount.textContent = totalItems;

    // Mostrar/esconder o contador do carrinho flutuante
    if (totalItems === 0) {
      floatingCartCount.classList.add("hidden");
    } else {
      floatingCartCount.classList.remove("hidden");
    }

    cartTotalElement.innerHTML = formatPrice(total);
  }

  // --- CEP na ViaCEP ---
  async function fetchAddressByCep(cep) {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      return null;
    }
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );
      if (!response.ok) {
        throw new Error("Erro ao buscar CEP. Verifique o número digitado.");
      }
      const data = await response.json();
      if (data.erro) {
        return null;
      }
      return data;
    } catch (error) {
      console.error("Erro na requisição ViaCEP:", error);
      return null;
    }
  }

  // calculo do frete
  async function calculateShippingFromBackend(cep, cartTotal) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/calculate-shipping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep, cartTotal }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Erro ao calcular frete." }));
        throw new Error(
          `Erro no servidor ao calcular frete: ${JSON.stringify(errorData)}`
        );
      }
      const data = await response.json();
      return data.shippingCost;
    } catch (error) {
      console.error("Erro ao calcular frete:", error);
      alert("Não foi possível calcular o frete. Por favor, tente novamente.");
      return 0;
    }
  }

  // incluir
  async function updateOrderSummary() {
    orderItemsList.innerHTML = "";
    let productsTotal = 0;
    let currentShippingCost = 0;

    cart.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
                        <span class="item-name">${item.name} (x${
        item.quantity
      })</span>
                        <span class="item-price">${formatPrice(
                          item.price * item.quantity
                        )}</span>
                    `;
      orderItemsList.appendChild(listItem);
      productsTotal += item.price * item.quantity;
    });

    orderSummaryTotal.innerHTML = formatPrice(productsTotal); // Total dos produtos

    // Se o CEP já estiver preenchido E o cartTotal for maior que 0, tenta calcular o frete
    const cep = cepInput.value;
    if (cep && cep.replace(/\D/g, "").length === 8 && productsTotal > 0) {
      currentShippingCost = await calculateShippingFromBackend(
        cep,
        productsTotal
      );
      shippingCostElement.innerHTML = formatPrice(currentShippingCost);
    } else if (productsTotal === 0) {
      shippingCostElement.innerHTML = formatPrice(0); // Frete 0 se não houver produtos
    } else {
      shippingCostElement.textContent = "Aguardando CEP...";
    }

    const grandTotal = productsTotal + currentShippingCost;
    orderSummaryGrandTotal.innerHTML = formatPrice(grandTotal); // Total Final (produtos + frete)
  }

  // Gerar as categorias dinamicamente
  function generateCategoryLinks() {
    // Pega todas as categorias únicas do mockProducts
    const categories = [
      "Todos", // Adiciona a opção "Todos" manualmente primeiro
      ...new Set(mockProducts.map((product) => product.category)),
    ];

    // Limpa a lista existente
    categoryListUl.innerHTML = "";

    categories.forEach((category) => {
      const listItem = document.createElement("li");
      listItem.textContent = category;
      // Armazena a categoria no data-attribute
      listItem.dataset.category = category;

      // Adiciona um listener para filtrar produtos quando a categoria é clicada
      listItem.addEventListener("click", () => {
        // Remove a classe 'active' de todos os itens e adiciona ao clicado
        document.querySelectorAll("#category-list li").forEach((item) => {
          item.classList.remove("active");
        });
        listItem.classList.add("active");
        filterProductsByCategory(category);
      });
      categoryListUl.appendChild(listItem);
    });

    const allCategoryItem = categoryListUl.querySelector(
      '[data-category="Todos"]'
    );
    if (allCategoryItem) {
      allCategoryItem.classList.add("active");
    }
  }

  // Filtrar produtos por categoria
  function filterProductsByCategory(selectedCategory) {
    // Limpa a lista de produtos atual
    productListContainer.innerHTML = "";

    let filteredProducts;
    if (selectedCategory === "Todos") {
      filteredProducts = mockProducts; // Mostra todos se "Todos" for selecionado
    } else {
      // Filtra os produtos pela categoria selecionada
      filteredProducts = mockProducts.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Exibe os produtos filtrados
    if (filteredProducts.length > 0) {
      filteredProducts.forEach((product) => {
        const card = createProductCard(product);
        productListContainer.appendChild(card);
      });
    } else {
      productListContainer.innerHTML =
        "<p>Nenhum produto encontrado nesta categoria.</p>";
    }
  }

  function initProductsDisplay() {
    // filtro inicial para "Todos"
    filterProductsByCategory("Todos");
    console.log("Produtos exibidos a partir do mockProducts.");
  }

  // --- FUNÇÃO DE VALIDAÇÃO DE FORMULÁRIO ---
  function validateForm() {
    let isValid = true; // Assume que o formulário é válido inicialmente

    // Função auxiliar para mostrar/ocultar erros
    function showError(element, errorSpan, message) {
      if (message) {
        errorSpan.textContent = message;
        errorSpan.style.display = "block";
        element.classList.add("invalid"); // Adiciona classe para borda vermelha
      } else {
        errorSpan.textContent = "";
        errorSpan.style.display = "none";
        element.classList.remove("invalid"); // Remove a classe
      }
    }

    // Validação do Nome Completo
    if (nameInput.value.trim() === "") {
      showError(nameInput, nameError, "Por favor, digite seu nome completo.");
      isValid = false;
    } else if (nameInput.value.trim().length < 3) {
      showError(
        nameInput,
        nameError,
        "O nome deve ter pelo menos 3 caracteres."
      );
      isValid = false;
    } else {
      showError(nameInput, nameError, "");
    }

    // Validação do E-mail
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput.value.trim() === "") {
      showError(emailInput, emailError, "Por favor, digite seu e-mail.");
      isValid = false;
    } else if (!emailPattern.test(emailInput.value.trim())) {
      showError(emailInput, emailError, "Por favor, digite um e-mail válido.");
      isValid = false;
    } else {
      showError(emailInput, emailError, "");
    }

    // Validação do CEP
    const cleanCep = cepInput.value.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      showError(
        cepInput,
        zipcodeError,
        "Por favor, digite um CEP válido (8 dígitos)."
      );
      isValid = false;
    } else if (
      addressInput.value.trim() === "" ||
      neighborhoodInput.value.trim() === ""
    ) {
      // Se o CEP está ok, mas o endereço não foi preenchido (ViaCEP falhou ou ainda não preencheu)
      showError(
        cepInput,
        zipcodeError,
        "CEP inválido ou endereço não preenchido automaticamente."
      );
      isValid = false;
    } else {
      showError(cepInput, zipcodeError, "");
    }

    // Validação do Número (do endereço)
    if (numberInput.value.trim() === "") {
      showError(
        numberInput,
        numberError,
        "Por favor, digite o número do endereço."
      );
      isValid = false;
    } else if (isNaN(numberInput.value.trim())) {
      // Verifica se é um número
      showError(
        numberInput,
        numberError,
        "O número deve conter apenas dígitos."
      );
      isValid = false;
    } else {
      showError(numberInput, numberError, "");
    }

    return isValid; // Retorna true se tudo estiver válido, false caso contrário
  }

  // Chame a função para gerar os links de categoria APÓS os produtos estarem definidos
  generateCategoryLinks();

  // Inicializa a exibição dos produtos (agora filtrando por "Todos")
  initProductsDisplay();

  // Inicializa a renderização do carrinho (mesmo que vazio)
  renderCart();
  // Garante que o resumo do pedido é atualizado ao carregar a página (se já tiver itens no carrinho)
  updateOrderSummary(); // Chamada inicial para mostrar "Total Produtos" e "Aguardando CEP..."

  // Listener para o botão "Prosseguir para o Checkout"
  proceedToCheckoutBtn.addEventListener("click", () => {
    checkoutSection.style.display = "block";
    window.scrollTo({
      top: checkoutSection.offsetTop - 80,
      behavior: "smooth",
    });
    // Chame updateOrderSummary aqui para garantir que o frete seja calculado quando o checkout é aberto
    updateOrderSummary();
  });

  // Listener para o carrinho flutuante
  floatingCart.addEventListener("click", () => {
    const cartSection = document.querySelector(".cart-section");
    window.scrollTo({
      top: cartSection.offsetTop - 80,
      behavior: "smooth",
    });
  });

  // Listener para o campo de CEP
  cepInput.addEventListener("blur", async () => {
    const cep = cepInput.value;
    const addressData = await fetchAddressByCep(cep);

    if (addressData) {
      addressInput.value = addressData.logradouro || "";
      neighborhoodInput.value = addressData.bairro || "";
      cityInput.value = addressData.localidade || "";
      stateInput.value = addressData.uf || "";
      // Após preencher o endereço, atualiza o resumo do pedido para recalcular o frete
      await updateOrderSummary();
    } else {
      // Limpa os campos se o CEP for inválido ou não encontrado
      addressInput.value = "";
      neighborhoodInput.value = "";
      cityInput.value = "";
      stateInput.value = "";
      shippingCostElement.textContent = "Inválido"; // Limpa o frete se o CEP for inválido
      orderSummaryGrandTotal.innerHTML = formatPrice(
        cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
      ); // Reseta o total final
      alert("CEP não encontrado ou inválido. Por favor, verifique.");
    }
  });

  // Listener para o formulário de checkout
  checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Chamar a função de validação antes de prosseguir
    if (!validateForm()) {
      // Se a validação falhar, para a execução da função
      alert(
        "Por favor, preencha todos os campos obrigatórios e corrija os erros."
      );
      return;
    }

    // Se a validação passar, o código abaixo será executado normalmente
    const customerName = nameInput.value; // Usar a referência direta
    const customerEmail = emailInput.value; // Usar a referência direta

    const street = addressInput.value;
    const number = numberInput.value;
    const complement = complementInput.value;
    const neighborhood = neighborhoodInput.value;
    const city = cityInput.value;
    const state = stateInput.value;
    const zipcode = cepInput.value;

    let customerAddress = `${street}, ${number}`;
    if (complement && complement.trim() !== "") {
      customerAddress += ` - ${complement}`;
    }
    customerAddress += ` - ${neighborhood}, ${city} - ${state} - CEP: ${zipcode}`;

    const orderItems = cart.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    const productsTotal = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const finalShippingCost =
      productsTotal > 0
        ? await calculateShippingFromBackend(zipcode, productsTotal)
        : 0;

    try {
      const backendBaseUrl = API_BASE_URL;
      const checkoutEndpoint = "/api/checkout";

      const response = await fetch(`${API_BASE_URL}${checkoutEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerAddress,
          totalAmount: productsTotal,
          shippingCost: finalShippingCost,
          orderItems,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Erro desconhecido no servidor." }));
        throw new Error(
          `Erro ao finalizar pedido: ${
            response.statusText
          }. Detalhes: ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();
      const orderId = data.orderId;

      const encodedItems = encodeURIComponent(JSON.stringify(orderItems));

      const grandTotal = productsTotal + finalShippingCost;

      const confirmationUrl = `confirmation.html?orderId=${orderId}&name=${encodeURIComponent(
        customerName
      )}&email=${encodeURIComponent(
        customerEmail
      )}&address=${encodeURIComponent(
        customerAddress
      )}&shippingCost=${finalShippingCost}&items=${encodedItems}&grandTotal=${grandTotal.toFixed(
        2
      )}`;

      cart = [];
      saveCart(); // Salvar carrinho vazio no localStorage
      renderCart();
      checkoutForm.reset();

      window.location.href = confirmationUrl;
    } catch (error) {
      console.error("Erro ao processar o checkout:", error);
      alert(
        "Ocorreu um erro ao finalizar seu pedido. Por favor, tente novamente."
      );
    }
  });
});
