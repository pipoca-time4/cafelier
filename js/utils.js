// utils.js - Funções utilitárias compartilhadas
export function formatPrice(price) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

export function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

export function clearCart() {
  localStorage.removeItem("cart");
}
