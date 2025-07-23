// product-detail.js - JavaScript para página de detalhes do produto
import { mockProducts } from "./productsData.js";

document.addEventListener("DOMContentLoaded", () => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let currentProduct = null;

  // DOM Elements
  const loadingMessage = document.getElementById("loading-message");
  const productDetailContent = document.getElementById(
    "product-detail-content"
  );
  const productNotFound = document.getElementById("product-not-found");
  const cartMessage = document.getElementById("cart-message");
  const floatingCart = document.getElementById("floating-cart");
  const floatingCartCount = document.getElementById("floating-cart-count");
  const backBtn = document.getElementById("back-btn");

  // Product detail elements
  const productImage = document.getElementById("product-image");
  const productName = document.getElementById("product-name");
  const productCategory = document.getElementById("product-category");
  const productDescription = document.getElementById("product-description");
  const productPrice = document.getElementById("product-price");

  // Aplicar estilos ao preço do produto
  productPrice.style.fontSize = "1.8rem";
  productPrice.style.fontWeight = "bold";
  productPrice.style.color = "#2c3e50";
  productPrice.style.marginTop = "1rem";
  productPrice.style.marginBottom = "1.5rem";

  const quantityInput = document.getElementById("quantity-input");
  const decreaseQuantityBtn = document.getElementById("decrease-quantity");
  const increaseQuantityBtn = document.getElementById("increase-quantity");
  const addToCartBtn = document.getElementById("add-to-cart-btn");

  // Função para formatar preço
  function formatPrice(price) {
    const formattedPrice = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
    return `<strong>${formattedPrice}</strong>`;
  }

  // Função para salvar carrinho no localStorage
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Função para atualizar contador do carrinho flutuante
  function updateFloatingCartCount() {
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    floatingCartCount.textContent = totalItems;
  }

  // Função para mostrar mensagem
  function showCartMessage(message, type = "success") {
    cartMessage.textContent = message;
    cartMessage.className = `cart-message ${type} show`;
    setTimeout(() => {
      cartMessage.classList.remove("show");
    }, 2500);
  }

  // Função para obter ID do produto da URL
  function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get("id"));
  }

  // Função para carregar detalhes do produto
  function loadProductDetails() {
    const productId = getProductIdFromUrl();

    if (!productId) {
      showProductNotFound();
      return;
    }

    currentProduct = mockProducts.find((product) => product.id === productId);

    if (!currentProduct) {
      showProductNotFound();
      return;
    }

    // Preencher dados do produto
    productImage.src = currentProduct.imageUrl;
    productImage.alt = currentProduct.name;
    productName.textContent = currentProduct.name;
    productCategory.textContent = currentProduct.category;
    productDescription.textContent = currentProduct.description;
    productPrice.innerHTML = formatPrice(currentProduct.price);

    // Atualizar título da página
    document.title = `${currentProduct.name} - Cafélier (Loja Mokada)`;

    // Mostrar conteúdo e esconder loading
    loadingMessage.style.display = "none";
    productDetailContent.style.display = "block";
  }

  // Função para mostrar produto não encontrado
  function showProductNotFound() {
    loadingMessage.style.display = "none";
    productNotFound.style.display = "block";
  }

  // Função para atualizar quantidade
  function updateQuantity(newQuantity) {
    if (newQuantity >= 1 && newQuantity <= 99) {
      quantityInput.value = newQuantity;
    }
  }

  // Função para adicionar ao carrinho
  function addToCart(quantity = 1) {
    if (!currentProduct) return;

    const existingItem = cart.find((item) => item.id === currentProduct.id);

    if (existingItem) {
      existingItem.quantity += quantity;
      showCartMessage(`Quantidade de ${currentProduct.name} aumentada!`);
    } else {
      cart.push({ ...currentProduct, quantity: quantity });
      showCartMessage(`${currentProduct.name} adicionado ao carrinho!`);
    }

    saveCart();
    updateFloatingCartCount();

    // Adicionar animação ao carrinho flutuante
    floatingCart.classList.add("pulse");
    setTimeout(() => {
      floatingCart.classList.remove("pulse");
    }, 600);
  }

  // Event Listeners

  // Controles de quantidade
  decreaseQuantityBtn.addEventListener("click", () => {
    const currentQuantity = parseInt(quantityInput.value);
    updateQuantity(currentQuantity - 1);
  });

  increaseQuantityBtn.addEventListener("click", () => {
    const currentQuantity = parseInt(quantityInput.value);
    updateQuantity(currentQuantity + 1);
  });

  // Input de quantidade
  quantityInput.addEventListener("change", () => {
    const newQuantity = parseInt(quantityInput.value);
    if (isNaN(newQuantity) || newQuantity < 1) {
      quantityInput.value = 1;
    } else if (newQuantity > 99) {
      quantityInput.value = 99;
    }
  });

  // Botão adicionar ao carrinho
  addToCartBtn.addEventListener("click", () => {
    const quantity = parseInt(quantityInput.value);
    addToCart(quantity);
  });

  // Carrinho flutuante
  floatingCart.addEventListener("click", () => {
    window.location.href = "cart.html";
  });

  // Botão voltar
  backBtn.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "index.html";
    }
  });

  // Inicialização
  updateFloatingCartCount();
  loadProductDetails();
});
