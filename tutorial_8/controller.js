// CONTROLLER: listens for user actions, asks the Model for data, and hands it to the View.
const restaurantController = {
  // Which button filter is active: "all", "topRated", or "inexpensive"
  currentFilter: "all",

  init: function () {
    const controller = this;
    const showAllButton = document.querySelector("#showAll");
    const showTopRatedButton = document.querySelector("#showTopRated");
    const showInexpensiveButton = document.querySelector("#showInexpensive");
    const cuisineSelect = document.querySelector("#cuisineFilter");

    showAllButton.addEventListener("click", function () {
      controller.currentFilter = "all";
      cuisineSelect.value = "";
      controller.updateView();
    });

    showTopRatedButton.addEventListener("click", function () {
      controller.currentFilter = "topRated";
      controller.updateView();
    });

    showInexpensiveButton.addEventListener("click", function () {
      controller.currentFilter = "inexpensive";
      controller.updateView();
    });

    cuisineSelect.addEventListener("change", function () {
      controller.updateView();
    });

    controller.updateView();
  },

  // Asks the Model for the active filter, then narrows by cuisine if one is selected.
  updateView: function () {
    const selectedCuisine = document.querySelector("#cuisineFilter").value;
    let restaurants;

    if (this.currentFilter === "topRated") {
      restaurants = restaurantModel.getTopRatedRestaurants();
    } else if (this.currentFilter === "inexpensive") {
      restaurants = restaurantModel.getInexpensiveRestaurants();
    } else {
      restaurants = restaurantModel.getAllRestaurants();
    }

    if (selectedCuisine !== "") {
      restaurants = restaurantModel.getRestaurantsByCuisine(selectedCuisine, restaurants);
    }

    restaurantView.displayRestaurants(restaurants);
  }
};

restaurantController.init();
