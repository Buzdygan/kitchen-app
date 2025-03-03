// Recipe management functionality
let currentRecipes = [];
let currentIngredients = [];
let editingRecipeId = null;
let currentImageData = null;

// Initialize recipes component
function initializeRecipes(recipes, ingredients) {
    currentRecipes = recipes;
    currentIngredients = ingredients;
    
    // Display recipes
    displayRecipes();
    
    // Set up event listeners
    setupRecipeEventListeners();
}

// Display all recipes
function displayRecipes() {
    const recipesContainer = document.getElementById('recipes-container');
    recipesContainer.innerHTML = '';
    
    if (currentRecipes.length === 0) {
        const emptyMessage = createElement('div', { class: 'empty-message' }, 
            'No recipes yet. Click "Add New Recipe" to create your first recipe!');
        recipesContainer.appendChild(emptyMessage);
        return;
    }
    
    // Create recipe cards
    currentRecipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        recipesContainer.appendChild(recipeCard);
    });
}

// Create a recipe card element
function createRecipeCard(recipe) {
    const card = createElement('div', { class: 'recipe-card', 'data-id': recipe.id });
    
    // Card header
    const cardHeader = createElement('div', { class: 'recipe-card-header' });
    cardHeader.appendChild(createElement('h3', {}, recipe.name));
    card.appendChild(cardHeader);
    
    // Recipe image (if available)
    if (recipe.image) {
        const imageContainer = createElement('div', { class: 'recipe-image-container' });
        const image = createElement('img', { 
            class: 'recipe-image',
            src: recipe.image,
            alt: recipe.name
        });
        imageContainer.appendChild(image);
        card.appendChild(imageContainer);
    }
    
    // Card body
    const cardBody = createElement('div', { class: 'recipe-card-body' });
    
    // Description
    if (recipe.description) {
        const description = createElement('p', { class: 'recipe-description' }, recipe.description);
        cardBody.appendChild(description);
    }
    
    // Ingredients
    const ingredientsTitle = createElement('h4', {}, 'Ingredients:');
    cardBody.appendChild(ingredientsTitle);
    
    const ingredientsList = createElement('ul', { class: 'ingredients-list' });
    recipe.ingredients.forEach(ingredient => {
        const item = createElement('li', {}, 
            `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`);
        ingredientsList.appendChild(item);
    });
    cardBody.appendChild(ingredientsList);
    
    // Sections
    if (recipe.sections && recipe.sections.length > 0) {
        const sectionsTitle = createElement('h4', {}, 'Sections:');
        cardBody.appendChild(sectionsTitle);
        
        const sectionsList = createElement('ul', { class: 'sections-list' });
        recipe.sections.forEach(section => {
            const item = createElement('li', {}, section.name);
            sectionsList.appendChild(item);
        });
        cardBody.appendChild(sectionsList);
    }
    
    card.appendChild(cardBody);
    
    // Card footer
    const cardFooter = createElement('div', { class: 'recipe-card-footer' });
    
    const editBtn = createElement('button', { class: 'btn', 'data-action': 'edit' }, 'Edit');
    const deleteBtn = createElement('button', { class: 'btn', 'data-action': 'delete' }, 'Delete');
    
    cardFooter.appendChild(editBtn);
    cardFooter.appendChild(deleteBtn);
    card.appendChild(cardFooter);
    
    return card;
}

// Set up event listeners for recipe functionality
function setupRecipeEventListeners() {
    // Add recipe button
    const addRecipeBtn = document.getElementById('add-recipe-btn');
    addRecipeBtn.addEventListener('click', () => {
        openRecipeForm();
    });
    
    // Recipe form submission
    const recipeForm = document.getElementById('recipe-form');
    recipeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveRecipe();
    });
    
    // Cancel recipe button
    const cancelRecipeBtn = document.getElementById('cancel-recipe-btn');
    cancelRecipeBtn.addEventListener('click', () => {
        closeModal('recipe-modal');
    });
    
    // Add section button
    const addSectionBtn = document.getElementById('add-section-btn');
    addSectionBtn.addEventListener('click', addSectionField);
    
    // Add ingredient button
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    addIngredientBtn.addEventListener('click', addIngredientField);
    
    // Image file upload handler
    const imageFileInput = document.getElementById('recipe-image-file');
    imageFileInput.addEventListener('change', handleImageFileSelect);
    
    // Image URL input handler
    const imageUrlInput = document.getElementById('recipe-image-url');
    imageUrlInput.addEventListener('change', handleImageUrlInput);
    imageUrlInput.addEventListener('paste', handleImageUrlInput);
    
    // Recipe card actions (edit, delete)
    const recipesContainer = document.getElementById('recipes-container');
    recipesContainer.addEventListener('click', (e) => {
        const target = e.target;
        
        if (target.hasAttribute('data-action')) {
            const action = target.getAttribute('data-action');
            const recipeCard = target.closest('.recipe-card');
            const recipeId = recipeCard.getAttribute('data-id');
            
            if (action === 'edit') {
                openRecipeForm(recipeId);
            } else if (action === 'delete') {
                deleteRecipe(recipeId);
            }
        }
    });
}

// Handle image file selection
function handleImageFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Clear URL input
    document.getElementById('recipe-image-url').value = '';
    
    const reader = new FileReader();
    reader.onload = function(event) {
        currentImageData = event.target.result;
        updateImagePreview(currentImageData);
    };
    reader.readAsDataURL(file);
}

// Handle image URL input
function handleImageUrlInput(e) {
    const url = e.target.value;
    if (url.trim()) {
        // Clear file input
        document.getElementById('recipe-image-file').value = '';
        
        currentImageData = url;
        updateImagePreview(url);
    }
}

// Update image preview
function updateImagePreview(src) {
    const preview = document.getElementById('image-preview');
    preview.innerHTML = '';
    
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Recipe preview';
    
    preview.appendChild(img);
}

// Open recipe form for adding or editing
function openRecipeForm(recipeId = null) {
    // Reset form
    const recipeForm = document.getElementById('recipe-form');
    recipeForm.reset();
    
    // Clear sections and ingredients containers
    document.getElementById('sections-container').innerHTML = '';
    document.getElementById('ingredients-container').innerHTML = '';
    
    // Reset image preview
    document.getElementById('image-preview').innerHTML = `
        <div class="image-preview-placeholder">
            <i class="fas fa-image fa-3x"></i>
            <p>Image preview will appear here</p>
        </div>
    `;
    
    // Reset image data
    currentImageData = null;
    
    // Set form title
    const formTitle = document.getElementById('recipe-form-title');
    
    if (recipeId) {
        // Editing existing recipe
        editingRecipeId = recipeId;
        formTitle.textContent = 'Edit Recipe';
        
        // Find recipe
        const recipe = currentRecipes.find(r => r.id === recipeId);
        
        // Fill form with recipe data
        document.getElementById('recipe-name').value = recipe.name;
        document.getElementById('recipe-description').value = recipe.description || '';
        
        // Set image if exists
        if (recipe.image) {
            currentImageData = recipe.image;
            updateImagePreview(recipe.image);
        }
        
        // Add section fields
        if (recipe.sections && recipe.sections.length > 0) {
            recipe.sections.forEach(section => {
                addSectionField(null, section.name);
            });
        }
        
        // Add ingredient fields
        recipe.ingredients.forEach(ingredient => {
            addIngredientField(null, ingredient);
        });
    } else {
        // Adding new recipe
        editingRecipeId = null;
        formTitle.textContent = 'Add New Recipe';
        
        // Add one empty section and ingredient field by default
        addSectionField();
        addIngredientField();
    }
    
    // Open modal
    openModal('recipe-modal');
}

// Add a section field to the form
function addSectionField(e = null, sectionName = '') {
    if (e) e.preventDefault();
    
    const sectionsContainer = document.getElementById('sections-container');
    
    const sectionItem = createElement('div', { class: 'section-item' });
    
    const sectionInput = createElement('input', { 
        type: 'text', 
        placeholder: 'Section name (e.g., Sauce, Main Dish, Preparation)',
        value: sectionName
    });
    
    const removeBtn = createElement('button', { 
        type: 'button', 
        class: 'remove-btn',
        title: 'Remove section'
    }, '×');
    
    removeBtn.addEventListener('click', () => {
        sectionsContainer.removeChild(sectionItem);
    });
    
    sectionItem.appendChild(sectionInput);
    sectionItem.appendChild(removeBtn);
    sectionsContainer.appendChild(sectionItem);
}

// Add an ingredient field to the form
function addIngredientField(e = null, ingredientData = null) {
    if (e) e.preventDefault();
    
    const ingredientsContainer = document.getElementById('ingredients-container');
    
    const ingredientItem = createElement('div', { class: 'ingredient-item' });
    
    // Ingredient name with datalist for existing ingredients
    const nameContainer = createElement('div', { class: 'ingredient-name-container' });
    const nameInput = createElement('input', { 
        type: 'text', 
        placeholder: 'Ingredient name',
        list: 'ingredients-list',
        value: ingredientData ? ingredientData.name : ''
    });
    
    // Create datalist if it doesn't exist
    let dataList = document.getElementById('ingredients-list');
    if (!dataList) {
        dataList = createElement('datalist', { id: 'ingredients-list' });
        document.body.appendChild(dataList);
        
        // Add existing ingredients to datalist
        currentIngredients.forEach(ingredient => {
            const option = createElement('option', { value: ingredient });
            dataList.appendChild(option);
        });
    }
    
    nameContainer.appendChild(nameInput);
    
    // Quantity input
    const quantityInput = createElement('input', { 
        type: 'number', 
        placeholder: 'Quantity',
        min: '0',
        step: '0.01',
        value: ingredientData ? ingredientData.quantity : ''
    });
    
    // Unit input
    const unitInput = createElement('input', { 
        type: 'text', 
        placeholder: 'Unit (e.g., g, ml, pcs)',
        value: ingredientData ? ingredientData.unit : ''
    });
    
    // Remove button
    const removeBtn = createElement('button', { 
        type: 'button', 
        class: 'remove-btn',
        title: 'Remove ingredient'
    }, '×');
    
    removeBtn.addEventListener('click', () => {
        ingredientsContainer.removeChild(ingredientItem);
    });
    
    ingredientItem.appendChild(nameInput);
    ingredientItem.appendChild(quantityInput);
    ingredientItem.appendChild(unitInput);
    ingredientItem.appendChild(removeBtn);
    
    ingredientsContainer.appendChild(ingredientItem);
}

// Save recipe from form
function saveRecipe() {
    // Get form data
    const name = document.getElementById('recipe-name').value;
    const description = document.getElementById('recipe-description').value;
    
    // Get sections
    const sectionElements = document.querySelectorAll('#sections-container .section-item input');
    const sections = Array.from(sectionElements)
        .map(input => ({ name: input.value.trim() }))
        .filter(section => section.name !== '');
    
    // Get ingredients
    const ingredientItems = document.querySelectorAll('#ingredients-container .ingredient-item');
    const ingredients = Array.from(ingredientItems).map(item => {
        const nameInput = item.querySelector('input:nth-child(1)');
        const quantityInput = item.querySelector('input:nth-child(2)');
        const unitInput = item.querySelector('input:nth-child(3)');
        
        return {
            name: nameInput.value.trim(),
            quantity: parseFloat(quantityInput.value) || 0,
            unit: unitInput.value.trim()
        };
    }).filter(ingredient => ingredient.name !== '');
    
    // Update ingredients list for autocomplete
    ingredients.forEach(ingredient => {
        if (!currentIngredients.includes(ingredient.name)) {
            currentIngredients.push(ingredient.name);
        }
    });
    
    // Create or update recipe
    const recipe = {
        name,
        description,
        sections,
        ingredients,
        image: currentImageData,
        id: editingRecipeId || generateId()
    };
    
    // Update app data
    const appData = getAppData();
    
    if (editingRecipeId) {
        // Update existing recipe
        const index = appData.recipes.findIndex(r => r.id === editingRecipeId);
        if (index !== -1) {
            appData.recipes[index] = recipe;
        }
    } else {
        // Add new recipe
        appData.recipes.push(recipe);
    }
    
    // Update ingredients list
    appData.ingredients = [...new Set([...appData.ingredients, ...currentIngredients])];
    
    // Save data
    saveAppData(appData);
    
    // Update current data
    currentRecipes = appData.recipes;
    
    // Refresh display
    displayRecipes();
    
    // Close modal
    closeModal('recipe-modal');
    
    // Reset current image data
    currentImageData = null;
    
    // Update meal plan and shopping list views to reflect the changes
    if (typeof initializeMealPlan === 'function') {
        initializeMealPlan(appData.mealPlan, appData.recipes);
    }
    
    if (typeof initializeShoppingList === 'function') {
        initializeShoppingList(appData.mealPlan, appData.recipes);
    }
}

// Delete recipe
function deleteRecipe(recipeId) {
    if (confirm('Are you sure you want to delete this recipe?')) {
        // Update app data
        const appData = getAppData();
        appData.recipes = appData.recipes.filter(recipe => recipe.id !== recipeId);
        
        // Remove from meal plan
        let mealPlanChanged = false;
        for (const date in appData.mealPlan) {
            for (const mealType in appData.mealPlan[date]) {
                if (appData.mealPlan[date][mealType] === recipeId) {
                    delete appData.mealPlan[date][mealType];
                    mealPlanChanged = true;
                }
            }
            
            // Clean up empty dates
            if (Object.keys(appData.mealPlan[date]).length === 0) {
                delete appData.mealPlan[date];
            }
        }
        
        // Save data
        saveAppData(appData);
        
        // Update current data
        currentRecipes = appData.recipes;
        
        // Refresh display
        displayRecipes();
        
        // Refresh meal plan and shopping list
        if (typeof initializeMealPlan === 'function') {
            initializeMealPlan(appData.mealPlan, appData.recipes);
        }
        
        if (typeof initializeShoppingList === 'function') {
            initializeShoppingList(appData.mealPlan, appData.recipes);
        }
    }
} 