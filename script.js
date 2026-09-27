const categoriesGrid = document.getElementById("categoriesGrid");
const productsGrid = document.getElementById("productsGrid");
const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");
const productDetailsContainer = document.getElementById("productDetails");
const cartLayout = document.getElementById("cartLayout");

/* Local Storage Cart Helpers */
const getCart = () => {
  return JSON.parse(localStorage.getItem("cart")) || [];
};

const saveCart = (cart) => {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
};

const updateCartBadge = () => {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach((el) => {
    if (totalCount > 0) {
      el.textContent = totalCount;
      el.style.display = "inline-flex";
    } else {
      el.textContent = "";
      el.style.display = "none";
    }
  });
};

/* LocalStorage Cart Management */
const addToCart = async (productId, quantity = 1) => {
  try {
    let cart = getCart();
    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      saveCart(cart);
      alert(`"${existingItem.title}" quantity updated in cart!`);
    } else {
      // Fetch product details for cart item data
      const prodRes = await fetch(
        `https://dummyjson.com/products/${productId}`,
      );
      const product = await prodRes.json();

      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.thumbnail || product.images?.[0] || "",
        quantity: quantity,
      });

      saveCart(cart);
      alert(`"${product.title}" added to cart!`);
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
  }
};

const updateQuantity = (productId, change) => {
  let cart = getCart();
  const item = cart.find((i) => i.id === productId);

  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter((i) => i.id !== productId);
    }
    saveCart(cart);
    renderCartPage();
  }
};

const removeFromCart = (productId) => {
  let cart = getCart();
  const item = cart.find((i) => i.id === productId);
  cart = cart.filter((i) => i.id !== productId);
  saveCart(cart);
  renderCartPage();
  alert(`"${item.title}" removed from cart!`);
};

const renderCartPage = () => {
  if (!cartLayout) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartLayout.innerHTML = `
      <div class="empty-cart">
        <i class="fa-solid fa-cart-shopping"></i>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added any products to your cart yet.</p>
        <a href="products.html" class="btn-shop">Explore Products</a>
      </div>
    `;
    return;
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = 10.0;
  const netPrice = subtotal + shipping;
  const tax = subtotal * 0.1;
  const total = netPrice + tax;

  cartLayout.innerHTML = `
    <div class="cart-items-list">
      ${cart
        .map(
          (item) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.title}" class="cart-item-image">
          <div class="cart-item-details">
            <h4 class="cart-item-title">${item.title}</h4>
            <span class="cart-item-price">$${Number(item.price).toFixed(2)} each</span>
          </div>
          <div class="cart-item-quantity">
            <button onclick="updateQuantity(${item.id}, -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateQuantity(${item.id}, 1)">+</button>
          </div>
          <span class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</span>
          <button class="cart-remove-btn" onclick="removeFromCart(${item.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `,
        )
        .join("")}
    </div>
    <div class="cart-summary">
      <h3>Order Summary</h3>
      <div class="summary-row">
        <span>Subtotal</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Estimated Shipping</span>
        <span>$${shipping.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Net Price</span>
        <span>$${netPrice.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Estimated Tax (10%)</span>
        <span>$${tax.toFixed(2)}</span>
      </div>
      <div class="summary-row total-row">
        <span>Total</span>
        <span>$${total.toFixed(2)}</span>
      </div>
      <button class="checkout-btn" onclick="checkout()">
        Proceed to Checkout
      </button>
    </div>
  `;
};

function checkout() {
  alert("Thank you for your purchase!");
  localStorage.removeItem("cart");
  updateCartBadge();
  renderCartPage();
}

const createCategoryCard = (category) => {
  return `
    <div class="category-card" data-slug="${category.slug}">
      <div class="category-info">
        <h3 class="category-name">${category.name}</h3>
        <a href="./products.html?category=${category.slug}" class="category-link-text">Explore Products <i class="fa-solid fa-arrow-right"></i></a>
      </div>
    </div>
  `;
};

const fetchCategories = async () => {
  if (!categoriesGrid) return;

  try {
    const response = await fetch("https://dummyjson.com/products/categories");
    const data = await response.json();

    categoriesGrid.innerHTML = data
      .map((category) => createCategoryCard(category))
      .join("");
  } catch (error) {
    console.error("Error fetching categories:", error);
    categoriesGrid.innerHTML = `
      <div class="categories-error">
        <p>Failed to load categories. Please try again.</p>
      </div>
    `;
  }
};

fetchCategories();

const createProductCard = (product) => {
  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-image-wrapper">
        <a href="product-details.html?id=${product.id}">
          <img src="${product.images[0]}" alt="${product.title}" class="product-image">
        </a>
        <a href="product-details.html?id=${product.id}" class="quick-view-btn" aria-label="Quick View">
          <i class="fa-solid fa-eye"></i>
        </a>
      </div>
      <div class="product-info">
        <a href="product-details.html?id=${product.id}">
          <h3 class="product-title">${product.title}</h3>
        </a>
        <p class="product-brand">${product.brand || "Brand"}</p>
        <div class="product-rating">
          <i class="fa-solid fa-star"></i>
          <span>${product.rating} (${product.reviews?.length || 0} reviews)</span>
        </div>
        <div class="product-price">
          <span class="current-price">$${product.price}</span>
          <span class="original-price">$${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}</span>
        </div>
          <button class="add-to-cart-btn" id="addToCartBtn-${product.id}" data-id="${product.id}">
            <i class="fa-solid fa-cart-plus"></i> Add to Cart
          </button>
      </div>
    </div>
  `;
};

let currentPage = 1;
const LIMIT = 10;
let totalProducts = 0;

const getProductsState = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    search: params.get("search") || params.get("q") || "",
    category: params.get("category") || "",
    sort: params.get("sort") || "",
    page: parseInt(params.get("page"), 10) || 1,
  };
};

const updateProductsURL = (newState) => {
  const state = { ...getProductsState(), ...newState };
  const url = new URL(window.location);

  if (state.search) url.searchParams.set("search", state.search);
  else url.searchParams.delete("search");

  if (state.category) url.searchParams.set("category", state.category);
  else url.searchParams.delete("category");

  if (state.sort) url.searchParams.set("sort", state.sort);
  else url.searchParams.delete("sort");

  if (state.page && state.page > 1) url.searchParams.set("page", state.page);
  else url.searchParams.delete("page");

  window.history.pushState({}, "", url);
};

const syncUIWithURL = () => {
  const { search, category, sort, page } = getProductsState();
  const sortBySelect = document.getElementById("sortBy");
  const categoryFilterSelect = document.getElementById("categoryFilter");

  if (sortBySelect) sortBySelect.value = sort;
  if (categoryFilterSelect) categoryFilterSelect.value = category;

  document.querySelectorAll(".search-input").forEach((input) => {
    input.value = search;
  });

  currentPage = page || 1;
};

const updatePaginationState = () => {
  if (previousBtn) previousBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage * LIMIT >= totalProducts;
};

const getProductsURL = () => {
  const { search, category, sort } = getProductsState();
  const skip = (currentPage - 1) * LIMIT;
  let url = "https://dummyjson.com/products";

  if (category) {
    url = `https://dummyjson.com/products/category/${category}`;
  }

  if (search) {
    url = "https://dummyjson.com/products/search";
  }

  const params = new URLSearchParams({
    limit: LIMIT,
    skip,
  });

  if (search) {
    params.set("q", search);
  }

  if (sort === "title-asc") {
    params.set("sortBy", "title");
    params.set("order", "asc");
  }

  if (sort === "title-desc") {
    params.set("sortBy", "title");
    params.set("order", "desc");
  }

  return `${url}?${params.toString()}`;
};

const renderProducts = (products) => {
  if (!productsGrid) return;

  const countTextEl = document.getElementById("productsCount");
  if (countTextEl) {
    if (totalProducts === 0) {
      countTextEl.textContent = "0 products found";
    } else {
      const startIdx = (currentPage - 1) * LIMIT + 1;
      const endIdx = Math.min(currentPage * LIMIT, totalProducts);
      countTextEl.textContent = `Showing ${startIdx}-${endIdx} of ${totalProducts} products`;
    }
  }

  if (products.length === 0) {
    productsGrid.innerHTML = `
      <div class="no-products" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 1rem;">
        <i class="fa-solid fa-face-frown" style="font-size: 3rem; color: var(--primary-color);"></i>
        <p style="font-size: 1.1rem; font-weight: 600;">No products found matching your filters.</p>
      </div>
    `;
    updatePaginationState();
    return;
  }

  productsGrid.innerHTML = products
    .map((product) => createProductCard(product))
    .join("");
  updatePaginationState();
};

const loadProductsData = async () => {
  if (!productsGrid) return;

  productsGrid.innerHTML = `
    <div class="loading-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: var(--text-muted); font-size: 1.2rem;">
      <i class="fa-solid fa-spinner fa-spin" style="margin-right: 0.5rem; color: var(--primary-color);"></i> Loading products...
    </div>
  `;

  try {
    const res = await fetch(getProductsURL());
    const data = await res.json();
    totalProducts = data.total || 0;
    renderProducts(data.products || []);
  } catch (error) {
    console.error("Error loading products:", error);
    productsGrid.innerHTML = `
      <div class="products-error" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
        <p>Failed to load products. Please try again.</p>
      </div>
    `;
  }
};

const initFilters = async () => {
  const categoryFilterSelect = document.getElementById("categoryFilter");
  if (!categoryFilterSelect) return;

  try {
    const res = await fetch("https://dummyjson.com/products/categories");
    const categories = await res.json();

    categories.sort((a, b) => a.name.localeCompare(b.name));

    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.slug;
      option.textContent = cat.name;
      categoryFilterSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error populating category dropdown:", error);
  }

  categoryFilterSelect.addEventListener("change", () => {
    currentPage = 1;
    updateProductsURL({
      category: categoryFilterSelect.value,
      search: "",
      page: 1,
    });
    loadProductsData();
  });

  const sortBySelect = document.getElementById("sortBy");
  if (sortBySelect) {
    sortBySelect.addEventListener("change", () => {
      currentPage = 1;
      updateProductsURL({ sort: sortBySelect.value, page: 1 });
      loadProductsData();
    });
  }

  const resetFiltersBtn = document.getElementById("resetFiltersBtn");
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      currentPage = 1;
      window.history.pushState({}, "", "products.html");
      syncUIWithURL();
      loadProductsData();
    });
  }

  // Mobile filters drawer controls
  const mobileFiltersBtn = document.getElementById("mobileFiltersBtn");
  const closeFiltersBtn = document.getElementById("closeFiltersBtn");
  const filtersSidebar = document.getElementById("filtersSidebar");
  const filtersBackdrop = document.getElementById("filtersBackdrop");

  if (mobileFiltersBtn && filtersSidebar && filtersBackdrop) {
    mobileFiltersBtn.addEventListener("click", () => {
      filtersSidebar.classList.add("active");
      filtersBackdrop.classList.add("active");
    });
  }

  const closeDrawer = () => {
    if (filtersSidebar && filtersBackdrop) {
      filtersSidebar.classList.remove("active");
      filtersBackdrop.classList.remove("active");
    }
  };

  if (closeFiltersBtn) closeFiltersBtn.addEventListener("click", closeDrawer);
  if (filtersBackdrop) filtersBackdrop.addEventListener("click", closeDrawer);
};

const initProductsPage = async () => {
  if (!productsGrid) return;
  currentPage = getProductsState().page;
  await initFilters();
  syncUIWithURL();
  await loadProductsData();
};

if (productsGrid) {
  initProductsPage();
}

window.addEventListener("popstate", async () => {
  if (!productsGrid) return;
  currentPage = getProductsState().page;
  syncUIWithURL();
  await loadProductsData();
});

if (previousBtn && nextBtn) {
  previousBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      updateProductsURL({ page: currentPage });
      loadProductsData();
      const productsSection = document.getElementById("products");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentPage * LIMIT < totalProducts) {
      currentPage++;
      updateProductsURL({ page: currentPage });
      loadProductsData();
      const productsSection = document.getElementById("products");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  });
}

/* Product Details Page Functionality */
const fetchProductDetails = async () => {
  if (!productDetailsContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    productDetailsContainer.innerHTML = `
      <div class="error-message">
        <p>No product specified. <a href="products.html">Browse Products</a></p>
      </div>
    `;
    return;
  }

  try {
    const response = await fetch(`https://dummyjson.com/products/${productId}`);
    if (!response.ok) throw new Error("Product not found");

    const product = await response.json();
    renderProductDetails(product);
  } catch (error) {
    console.error("Error fetching product details:", error);
    productDetailsContainer.innerHTML = `
      <div class="error-message">
        <p>Product not found. <a href="products.html">Return to Products</a></p>
      </div>
    `;
  }
};

const renderProductDetails = (product) => {
  if (!productDetailsContainer) return;

  const originalPrice = (
    product.price /
    (1 - product.discountPercentage / 100)
  ).toFixed(2);
  const productImage = product.thumbnail || product.images?.[0] || "";

  productDetailsContainer.innerHTML = `
    <div class="product-details-wrapper">
      <div class="product-details-gallery">
        <div class="main-image-container">
          <img src="${productImage}" alt="${product.title}" id="mainProductImage" class="main-details-image">
        </div>
      </div>
      <div class="product-details-info">
        <span class="details-category">${product.category}</span>
        <h1 class="details-title">${product.title}</h1>
        <p class="details-brand">Brand: <span>${product.brand || "N/A"}</span></p>
        
        <div class="details-rating">
          <i class="fa-solid fa-star"></i>
          <span>${product.rating} (${product.reviews?.length || 0} reviews)</span>
        </div>

        <div class="details-price">
          <span class="details-current-price">$${product.price}</span>
          <span class="details-original-price">$${originalPrice}</span>
          <span class="details-discount">${product.discountPercentage}% OFF</span>
        </div>

        <p class="details-description">${product.description}</p>

        <div class="details-stock">
          Status: <span class="stock-badge ${product.stock > 0 ? "in-stock" : "out-of-stock"}">
            ${product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
          </span>
        </div>
          <button class="add-to-cart-btn btn-large" id="addToCartBtnDetails" data-id="${product.id}">
            <i class="fa-solid fa-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
};

fetchProductDetails();

/* Global Add to Cart Click Handler */
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".add-to-cart-btn");
  if (!btn) return;

  const productId = btn.dataset.id;
  if (productId) {
    await addToCart(Number(productId));
  }
});

/* Search Form Event Handler for Desktop & Mobile */
document.addEventListener("DOMContentLoaded", () => {
  const { search } = getProductsState();

  document.querySelectorAll(".search-form").forEach((form) => {
    const input = form.querySelector(".search-input");
    if (input && search) {
      input.value = search;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = input ? input.value.trim() : "";
      const isProductsPage = !!document.getElementById("categoryFilter");

      if (isProductsPage) {
        currentPage = 1;
        updateProductsURL({ search: query, category: "", page: 1 });
        syncUIWithURL();
        loadProductsData();
      } else {
        if (query) {
          window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        } else {
          window.location.href = `products.html`;
        }
      }
    });
  });
});

/* Mobile Navigation Toggle */
const mobileToggle = document.getElementById("mobileNavToggle");
const mobileNav = document.getElementById("mobileNav");

if (mobileToggle && mobileNav) {
  mobileToggle.addEventListener("click", () => {
    mobileNav.classList.toggle("active");
  });
}

/* Initialize Cart UI on Load */
updateCartBadge();
renderCartPage();
