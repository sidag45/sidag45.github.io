// VIEW: renders whatever list of restaurants it is given. No filtering logic here.
const restaurantView = {
  displayRestaurants: function (restaurants) {
    const container = document.querySelector("#restaurantList");
    container.innerHTML = "";

    if (restaurants.length === 0) {
      container.innerHTML = "<p class=\"no-results\">No restaurants found.</p>";
      return;
    }

    restaurants.forEach(function (restaurant) {
      const card = document.createElement("div");
      card.classList.add("restaurant-card");
      card.innerHTML = `
        <h2>${restaurant.name}</h2>
        <p>${restaurant.cuisine}</p>
        <p>Rating: ${restaurant.rating}</p>
        <p>Price: ${restaurant.priceRange}</p>
      `;
      container.appendChild(card);
    });
  }
};
