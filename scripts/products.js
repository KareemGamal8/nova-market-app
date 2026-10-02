const productsGrid = document.getElementById("productsGrid");

const nextBtn = document.getElementById("nextBtn");

const previousBtn = document.getElementById("previousBtn");

const categoriesSelect = document.getElementById("categories-select");

const currentPageElement = document.getElementById("current-page");

let limit = 10;

let skip = 0;

let currentPage = 1;

let categorySlug = "";

let total = null;

function fetchProducts() {
  let url = "";

  if (categorySlug) {
    url = `https://dummyjson.com/products/category/${categorySlug}?limit=${limit}&skip=${skip}`;
  } else {
    url = `https://dummyjson.com/products?limit=${limit}&skip=${skip}`;
  }

  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      productsGrid.innerHTML = data.products
        .map((product) => {
          return `<div class="product-card" key="${product.id}">
              <div class="product-image-wrapper">
                <a href="product-details.html?id=2">
                  <img loading="lazy" src="${product.images[0]}" alt=${product.title} />
                </a>
                <button class="quick-view-btn" title="Quick View" aria-label="Quick View">
                  <i class="fa-regular fa-eye"></i>
                </button>
              </div>
              <div class="product-info">
                <h3 class="product-title">
                ${product.title}</h3>
                <span class="product-brand">${product.category}</span>
                <div class="product-rating">
                  <i class="fa-solid fa-star"></i> ${product.rating.rate} <span>(${product.rating.count} reviews)</span>
                </div>
                <div class="product-price">
                  <span class="current-price">${product.price}</span>
                  <span class="original-price">$24.43</span>
                </div>
                <div class="product-actions">
                  <button class="add-to-cart-btn">
                    <i class="fa-solid fa-cart-shopping"></i> Add to Cart
                  </button>
                </div>
              </div>
            </div>`;
        })
        .join("");

      const totalPages = Math.ceil(data.total / limit);

      currentPageElement.innerHTML = `Current Page: ${currentPage}`;

      nextBtn.disabled = currentPage === totalPages;

      previousBtn.disabled = currentPage === 1;
    });
}

fetchProducts();

nextBtn.addEventListener("click", () => {
  currentPage = currentPage + 1;

  skip = (currentPage - 1) * limit;

  fetchProducts();
});

previousBtn.addEventListener("click", () => {
  currentPage = currentPage - 1;

  skip = (currentPage - 1) * limit;

  fetchProducts();
});

fetch("https://dummyjson.com/products/categories")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    categoriesSelect.innerHTML = data.map((category) => {
      return `
        <option value=${category.slug} key={${category.slug}>${category.name}</option>
      `;
    });
  });

categoriesSelect.addEventListener("change", () => {
  categorySlug = categoriesSelect.value;

  fetchProducts();
});
