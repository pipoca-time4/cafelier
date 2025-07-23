// checkout.js - Gerenciamento do checkout e validação de endereço
const API_BASE_URL = window.API_BASE_URL;

document.addEventListener("DOMContentLoaded", () => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Verifica se há itens no carrinho
  if (cart.length === 0) {
    alert("Seu carrinho está vazio! Redirecionando para a página de produtos.");
    window.location.href = "index.html";
    return;
  }

  // DOM Elements
  const checkoutForm = document.getElementById("checkout-form");
  const orderItemsList = document.getElementById("order-items");
  const orderSummaryTotal = document.getElementById("order-summary-total");

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

  // Frete
  const shippingCostElement = document.getElementById("shipping-cost");
  const orderSummaryGrandTotal = document.getElementById(
    "order-summary-grand-total"
  );

  // Referências para mensagens de erro
  const nameError = document.getElementById("name-error");
  const emailError = document.getElementById("email-error");
  const zipcodeError = document.getElementById("zipcode-error");
  const numberError = document.getElementById("number-error");
  const backBtn = document.getElementById("back-btn");

  // Função para formatar preço
  function formatPrice(price) {
    const formattedPrice = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
    return `<strong>${formattedPrice}</strong>`;
  }

  // Função para buscar endereço pelo CEP
  async function fetchAddressByCep(cep) {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return null;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );
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

  // Função para calcular frete
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

  // Função para atualizar resumo do pedido
  async function updateOrderSummary() {
    orderItemsList.innerHTML = "";
    let productsTotal = 0;
    let currentShippingCost = 0;

    cart.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <span class="item-name">${item.name} (x${item.quantity})</span>
        <span class="item-price">${formatPrice(
          item.price * item.quantity
        )}</span>
      `;
      orderItemsList.appendChild(listItem);
      productsTotal += item.price * item.quantity;
    });

    orderSummaryTotal.innerHTML = formatPrice(productsTotal);

    // Se o CEP já estiver preenchido E o cartTotal for maior que 0, tenta calcular o frete
    const cep = cepInput.value;
    if (cep && cep.replace(/\D/g, "").length === 8 && productsTotal > 0) {
      currentShippingCost = await calculateShippingFromBackend(
        cep,
        productsTotal
      );
      shippingCostElement.innerHTML = formatPrice(currentShippingCost);
    } else if (productsTotal === 0) {
      shippingCostElement.innerHTML = formatPrice(0);
    } else {
      shippingCostElement.textContent = "Aguardando CEP...";
    }

    const grandTotal = productsTotal + currentShippingCost;
    orderSummaryGrandTotal.innerHTML = formatPrice(grandTotal);
  }

  // Função de validação do formulário
  function validateForm() {
    let isValid = true;

    // Função auxiliar para mostrar/ocultar erros
    function showError(element, errorSpan, message) {
      if (message) {
        errorSpan.textContent = message;
        errorSpan.style.display = "block";
        element.classList.add("invalid");
      } else {
        errorSpan.textContent = "";
        errorSpan.style.display = "none";
        element.classList.remove("invalid");
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
      showError(
        numberInput,
        numberError,
        "O número deve conter apenas dígitos."
      );
      isValid = false;
    } else {
      showError(numberInput, numberError, "");
    }

    return isValid;
  }

  // Event Listeners

  // Listener para o campo de CEP
  cepInput.addEventListener("blur", async () => {
    const cep = cepInput.value;
    const addressData = await fetchAddressByCep(cep);

    if (addressData) {
      addressInput.value = addressData.logradouro || "";
      neighborhoodInput.value = addressData.bairro || "";
      cityInput.value = addressData.localidade || "";
      stateInput.value = addressData.uf || "";
      await updateOrderSummary();
    } else {
      addressInput.value = "";
      neighborhoodInput.value = "";
      cityInput.value = "";
      stateInput.value = "";
      shippingCostElement.textContent = "Inválido";
      orderSummaryGrandTotal.innerHTML = formatPrice(
        cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
      );
      alert("CEP não encontrado ou inválido. Por favor, verifique.");
    }
  });

  // Listener para o formulário de checkout
  checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      alert(
        "Por favor, preencha todos os campos obrigatórios e corrija os erros."
      );
      return;
    }

    const customerName = nameInput.value;
    const customerEmail = emailInput.value;
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
      const response = await fetch(`${API_BASE_URL}/api/checkout`, {
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

      // Limpa o carrinho após finalizar a compra
      localStorage.removeItem("cart");

      window.location.href = confirmationUrl;
    } catch (error) {
      console.error("Erro ao processar o checkout:", error);
      alert(
        "Ocorreu um erro ao finalizar seu pedido. Por favor, tente novamente."
      );
    }
  });

  // Event listener para o botão voltar
  backBtn.addEventListener("click", () => {
    // Verifica se há histórico para voltar
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Se não há histórico, redireciona para o carrinho
      window.location.href = "cart.html";
    }
  });

  // Inicializar resumo do pedido
  updateOrderSummary();
});
