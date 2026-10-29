// MODEL: owns the restaurant data and the business rules for filtering it.
const restaurantModel = {
  // priceRange: "$" = inexpensive, "$$" = moderate, "$$$" = expensive
  restaurants: [
    { name: "Milano's", cuisine: "Italian", rating: 4.5, priceRange: "$$" },
    { name: "Sakura Sushi", cuisine: "Japanese", rating: 4.2, priceRange: "$$$" },
    { name: "The Brass Elephant", cuisine: "American", rating: 4.8, priceRange: "$$$" },
    { name: "Pho Corner", cuisine: "Vietnamese", rating: 4.3, priceRange: "$" },
    { name: "Tandoor Palace", cuisine: "Indian", rating: 4.1, priceRange: "$" },
    { name: "Luigi's Slice", cuisine: "Italian", rating: 3.9, priceRange: "$" }
  ],

  getAllRestaurants: function () {
    return this.restaurants;
  },

  getTopRatedRestaurants: function () {
    return this.restaurants.filter(function (restaurant) {
      return restaurant.rating >= 4.5;
    });
  },

  getInexpensiveRestaurants: function () {
    return this.restaurants.filter(function (restaurant) {
      return restaurant.priceRange === "$";
    });
  },

  // Optional second argument lets the cuisine filter combine with another
  // filter (e.g. inexpensive). Defaults to the full restaurant list.
  getRestaurantsByCuisine: function (cuisine, restaurants) {
    const source = restaurants || this.restaurants;
    return source.filter(function (restaurant) {
      return restaurant.cuisine === cuisine;
    });
  }
};
