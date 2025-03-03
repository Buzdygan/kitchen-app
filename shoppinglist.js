// Shopping list functionality
let shoppingListMealPlan = {};
let shoppingListRecipes = [];

// Initialize shopping list component
function initializeShoppingList(mealPlan, recipes) {
    shoppingListMealPlan = mealPlan;
    shoppingListRecipes = recipes;
    
    // Generate and display shopping list
    generateShoppingList();
}

// Generate shopping list based on meal plan
function generateShoppingList() {
    const shoppingListContainer = document.getElementById('shopping-list-container');
    shoppingListContainer.innerHTML = '';
    
    // Get all ingredients needed for the meal plan
    const ingredients = getIngredientsFromMealPlan();
    
    if (Object.keys(ingredients).length === 0) {
        const emptyMessage = createElement('div', { class: 'empty-message' }, 
            'No ingredients needed. Add meals to your meal plan to generate a shopping list.');
        shoppingListContainer.appendChild(emptyMessage);
        return;
    }
    
    // Create shopping list header
    const shoppingListHeader = createElement('div', { class: 'shopping-list-header' });
    shoppingListHeader.appendChild(createElement('h3', {}, 'Shopping List'));
    shoppingListContainer.appendChild(shoppingListHeader);
    
    // Create shopping list items
    for (const [ingredientName, data] of Object.entries(ingredients)) {
        const shoppingListItem = createElement('div', { class: 'shopping-list-item' });
        
        // Ingredient info
        const ingredientInfo = createElement('div', { class: 'ingredient-info' });
        
        // Quantity and unit
        const quantityText = `${data.quantity} ${data.unit}`;
        const quantitySpan = createElement('span', { class: 'item-quantity' }, quantityText);
        
        // Ingredient name
        const nameSpan = createElement('span', { class: 'item-name' }, ingredientName);
        
        ingredientInfo.appendChild(quantitySpan);
        ingredientInfo.appendChild(nameSpan);
        
        // Recipe sources
        const recipeSources = createElement('div', { class: 'recipe-sources' });
        const sourceText = data.recipes.join(', ');
        recipeSources.textContent = `Used in: ${sourceText}`;
        
        shoppingListItem.appendChild(ingredientInfo);
        shoppingListItem.appendChild(recipeSources);
        
        shoppingListContainer.appendChild(shoppingListItem);
    }
}

// Get all ingredients needed for the meal plan
function getIngredientsFromMealPlan() {
    const ingredients = {};
    
    // Loop through each day in the meal plan
    for (const date in shoppingListMealPlan) {
        // Loop through each meal type (breakfast, lunch, dinner)
        for (const mealType in shoppingListMealPlan[date]) {
            const recipeId = shoppingListMealPlan[date][mealType];
            const recipe = shoppingListRecipes.find(r => r.id === recipeId);
            
            if (recipe) {
                // Add ingredients from this recipe
                recipe.ingredients.forEach(ingredient => {
                    const name = ingredient.name;
                    const quantity = ingredient.quantity;
                    const unit = ingredient.unit;
                    
                    if (!ingredients[name]) {
                        ingredients[name] = {
                            quantity: 0,
                            unit: unit,
                            recipes: []
                        };
                    }
                    
                    // Add quantity
                    ingredients[name].quantity += quantity;
                    
                    // Add recipe to sources if not already included
                    if (!ingredients[name].recipes.includes(recipe.name)) {
                        ingredients[name].recipes.push(recipe.name);
                    }
                });
            }
        }
    }
    
    return ingredients;
} 