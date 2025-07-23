// index.js - JavaScript simplificado para a página principal
import { mockProducts } from "./productsData.js";

document.addEventListener("DOMContentLoaded", () => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // DOM Elements
  const productListContainer = document.getElementById("product-list");
  const cartMessage = document.getElementById("cart-message");
  const categoryListUl = document.getElementById("category-list");
  const floatingCart = document.getElementById("floating-cart");
  const floatingCartCount = document.getElementById("floating-cart-count");

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

  // Função para criar card do produto
  function createProductCard(product) {
    // Criar uma descrição resumida (primeiras 60 caracteres)
    const shortDescription = product.description.length > 60 
      ? product.description.substring(0, 60) + "..." 
      : product.description;

    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${shortDescription}</p>
        <p class="product-price">${formatPrice(product.price)}</p>
        <button class="view-details-btn" data-product-id="${product.id}">
          Ver Detalhes
        </button>
        <button class="add-to-cart-btn" data-product-id="${product.id}">
          Adicionar ao Carrinho
        </button>
      </div>
    `;

    const viewDetailsBtn = card.querySelector(".view-details-btn");
    const addToCartBtn = card.querySelector(".add-to-cart-btn");
    
    viewDetailsBtn.addEventListener("click", () => {
      window.location.href = `product-detail.html?id=${product.id}`;
    });

    addToCartBtn.addEventListener("click", () => {
      addToCart(product);
    });

    return card;
  }

  // Função para adicionar produto ao carrinho
  function addToCart(product) {
    const existingItem = cart.find((item) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
      showCartMessage(`Quantidade de ${product.name} aumentada!`);
    } else {
      cart.push({ ...product, quantity: 1 });
      showCartMessage(`${product.name} adicionado ao carrinho!`);
    }
    
    saveCart();
    updateFloatingCartCount();
  }

  // Função para gerar links de categoria
  function generateCategoryLinks() {
    const categories = [
      "Todos",
      ...new Set(mockProducts.map((product) => product.category)),
    ];

    categoryListUl.innerHTML = "";

    categories.forEach((category) => {
      const listItem = document.createElement("li");
      listItem.textContent = category;
      listItem.dataset.category = category;

      listItem.addEventListener("click", () => {
        document.querySelectorAll("#category-list li").forEach((item) => {
          item.classList.remove("active");
        });
        listItem.classList.add("active");
        filterProductsByCategory(category);
      });
      categoryListUl.appendChild(listItem);
    });

    const allCategoryItem = categoryListUl.querySelector('[data-category="Todos"]');
    if (allCategoryItem) {
      allCategoryItem.classList.add("active");
    }
  }

  // Função para filtrar produtos por categoria
  function filterProductsByCategory(selectedCategory) {
    productListContainer.innerHTML = "";

    let filteredProducts;
    if (selectedCategory === "Todos") {
      filteredProducts = mockProducts;
    } else {
      filteredProducts = mockProducts.filter(
        (product) => product.category === selectedCategory
      );
    }

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

  // Função para inicializar exibição dos produtos
  function initProductsDisplay() {
    filterProductsByCategory("Todos");
    console.log("Produtos exibidos a partir do mockProducts.");
  }

  // Event listener para o carrinho flutuante
  floatingCart.addEventListener("click", () => {
    window.location.href = "cart.html";
  });

  // Inicialização
  generateCategoryLinks();
  initProductsDisplay();
  updateFloatingCartCount();
});
