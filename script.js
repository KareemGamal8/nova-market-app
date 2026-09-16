const productsGrid = document.getElementById("productsGrid");

fetch("https://dummyjson.com/products?limit=12")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    console.log(data);

    productsGrid.innerHTML = data.products
      .map((product) => {
        return `<div class="product-card" id="${product.id}">
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
  });

// API
