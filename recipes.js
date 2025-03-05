// Recipe management functionality
let currentRecipes = [];
let currentIngredients = [];
let editingRecipeId = null;
let currentImageData = null;
let activeAutocompleteField = null;
let selectedAutocompleteIndex = -1;
let autoSaveTimeout = null;

// Add a flag to track deletion actions
let isRemovingIngredient = false;

// Add a flag to track if we're currently editing or adding a new ingredient
let isAddingNewIngredient = false;
let initialInputValue = '';

// Initialize recipes component
function initializeRecipes(recipes, ingredients) {
    currentRecipes = recipes;
    currentIngredients = ingredients;
    
    // Display recipes
    displayRecipes();
}

// Display all recipes
function displayRecipes() {
    const recipesContainer = document.getElementById('recipes-container');
    recipesContainer.innerHTML = '';
    
    // Add "New Recipe" card as the first item
    const newRecipeCard = createNewRecipeCard();
    recipesContainer.appendChild(newRecipeCard);
    
    if (currentRecipes.length === 0) {
        // Still show the new recipe card, but no "no recipes" message since we have the card
        return;
    }
    
    // Create recipe cards
    currentRecipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        recipesContainer.appendChild(recipeCard);
    });
}

// Create a "New Recipe" card
function createNewRecipeCard() {
    const card = createElement('div', { class: 'recipe-card new-recipe-card' });
    
    // Add click event to open new recipe form
    card.addEventListener('click', () => {
        openRecipeForm();
    });
    
    // New recipe icon container
    const iconContainer = createElement('div', { class: 'recipe-image-container new-recipe-icon' });
    const icon = createElement('div', { class: 'recipe-placeholder-icon' });
    icon.innerHTML = '<i class="fas fa-plus fa-2x"></i>';
    iconContainer.appendChild(icon);
    card.appendChild(iconContainer);
    
    // Card header with text
    const cardHeader = createElement('div', { class: 'recipe-card-header' });
    cardHeader.appendChild(createElement('h3', {}, 'Add New Recipe'));
    card.appendChild(cardHeader);
    
    return card;
}

// Create a recipe card element
function createRecipeCard(recipe) {
    const card = createElement('div', { class: 'recipe-card', 'data-id': recipe.id });
    
    // Add click event to open recipe editor
    card.addEventListener('click', (e) => {
        // Only handle click if not clicking on action buttons
        if (!e.target.closest('.recipe-action-btn')) {
            openRecipeForm(recipe.id);
        }
    });
    
    // Recipe image or placeholder
    const imageContainer = createElement('div', { class: 'recipe-image-container' });
    if (recipe.image) {
        const image = createElement('img', { 
            class: 'recipe-image',
            src: recipe.image,
            alt: recipe.name
        });
        imageContainer.appendChild(image);
    } else {
        const placeholderIcon = createElement('div', { class: 'recipe-placeholder-icon' });
        placeholderIcon.innerHTML = '<i class="fas fa-utensils"></i>';
        imageContainer.appendChild(placeholderIcon);
    }
    card.appendChild(imageContainer);
    
    // Card header with recipe name
    const cardHeader = createElement('div', { class: 'recipe-card-header' });
    cardHeader.appendChild(createElement('h3', {}, recipe.name));
    card.appendChild(cardHeader);
    
    // Card actions (edit, delete)
    const cardActions = createElement('div', { class: 'recipe-card-actions' });
    
    const editBtn = createElement('button', { 
        class: 'recipe-action-btn edit', 
        title: 'Edit recipe'
    });
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openRecipeForm(recipe.id);
    });
    
    const deleteBtn = createElement('button', { 
        class: 'recipe-action-btn delete', 
        title: 'Delete recipe'
    });
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showDeleteConfirmation(recipe.id, recipe.name);
    });
    
    cardActions.appendChild(editBtn);
    cardActions.appendChild(deleteBtn);
    card.appendChild(cardActions);
    
    return card;
}

// Show delete confirmation dialog
function showDeleteConfirmation(recipeId, recipeName) {
    // Create confirmation dialog
    const dialog = createElement('div', { class: 'confirmation-dialog' });
    
    const content = createElement('div', { class: 'confirmation-content' });
    
    const title = createElement('h3', { class: 'confirmation-title' }, 'Delete Recipe?');
    
    const message = createElement('p', { class: 'confirmation-message' }, 
        `Are you sure you want to delete "${recipeName}"? This action cannot be undone.`);
    
    const actions = createElement('div', { class: 'confirmation-actions' });
    
    const cancelBtn = createElement('button', { class: 'confirmation-btn cancel' }, 'Cancel');
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
    
    const confirmBtn = createElement('button', { class: 'confirmation-btn confirm' }, 'Delete');
    confirmBtn.addEventListener('click', () => {
        document.body.removeChild(dialog);
        deleteRecipe(recipeId);
    });
    
    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    
    content.appendChild(title);
    content.appendChild(message);
    content.appendChild(actions);
    dialog.appendChild(content);
    
    // Close when clicking outside
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            document.body.removeChild(dialog);
        }
    });
    
    // Add to body
    document.body.appendChild(dialog);
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
    
    // Global key handler for autocomplete navigation
    document.addEventListener('keydown', (e) => {
        if (!activeAutocompleteField) return;
        
        const resultsContainer = activeAutocompleteField.nextElementSibling;
        if (!resultsContainer || !resultsContainer.classList.contains('active')) return;
        
        const items = resultsContainer.querySelectorAll('.autocomplete-item');
        if (items.length === 0) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedAutocompleteIndex = Math.min(selectedAutocompleteIndex + 1, items.length - 1);
                updateSelectedAutocompleteItem(items);
                break;
            case 'ArrowUp':
                e.preventDefault();
                selectedAutocompleteIndex = Math.max(selectedAutocompleteIndex - 1, 0);
                updateSelectedAutocompleteItem(items);
                break;
            case 'Enter':
                if (selectedAutocompleteIndex >= 0 && selectedAutocompleteIndex < items.length) {
                    e.preventDefault();
                    items[selectedAutocompleteIndex].click();
                }
                break;
            case 'Escape':
                e.preventDefault();
                // Handle Escape key - cancel current editing and restore original value
                handleEscapeKeyForAutocomplete();
                break;
        }
    });
}

// Handle global click and right-click events
function handleGlobalClick(e) {
    // If no autocomplete field is active or we're removing an ingredient, do nothing
    if (!activeAutocompleteField || isRemovingIngredient) return;

    
    const resultsContainer = activeAutocompleteField.nextElementSibling;
    if (!resultsContainer || !resultsContainer.classList.contains('active')) return;

    // Get the clicked element
    const clickedElement = e.target;
    
    // Check if the click is on the active autocomplete field itself
    const clickedOnActiveField = activeAutocompleteField === clickedElement || 
                                activeAutocompleteField.contains(clickedElement);
    
    // Check if the click is on the dropdown
    const clickedOnDropdown = resultsContainer === clickedElement || 
                             resultsContainer.contains(clickedElement);
    
    // If click is outside both the input field and its dropdown, dismiss it
    if (!clickedOnActiveField && !clickedOnDropdown) {
        // For right-click (context menu), prevent the default menu
        if (e.type === 'contextmenu') {
            e.preventDefault();
        }
        
        // Cancel editing just like pressing Escape
        handleEscapeKeyForAutocomplete();
        
        // Ensure the dropdown is closed
        closeAllAutocompleteDropdowns();
    }
}

// Extracted function to handle Escape key behavior for reuse with clicks
function handleEscapeKeyForAutocomplete() {
    if (!activeAutocompleteField) return;
    
    const ingredientItem = activeAutocompleteField.closest('.ingredient-item');
    
    // If adding a new ingredient, clear the input
    if (isAddingNewIngredient) {
        activeAutocompleteField.value = '';
    } else {
        // For existing ingredient, restore to original value
        activeAutocompleteField.value = initialInputValue;
    }
    
    // Close the dropdown
    closeAllAutocompleteDropdowns();
    
    // Reset the adding flag
    isAddingNewIngredient = false;
}

// Update selected autocomplete item
function updateSelectedAutocompleteItem(items) {
    // Remove selected class from all items
    items.forEach(item => item.classList.remove('selected'));
    
    // Add selected class to current item
    if (selectedAutocompleteIndex >= 0 && selectedAutocompleteIndex < items.length) {
        items[selectedAutocompleteIndex].classList.add('selected');
        items[selectedAutocompleteIndex].scrollIntoView({ block: 'nearest' });
    }
}

// Close all autocomplete dropdowns
function closeAllAutocompleteDropdowns() {
    // Find and close all active dropdowns
    document.querySelectorAll('.autocomplete-results.active').forEach(dropdown => {
        dropdown.classList.remove('active');
        dropdown.classList.remove('preserving');
    });
    
    // Reset active field and selection index
    activeAutocompleteField = null;
    selectedAutocompleteIndex = -1;
}

// Position autocomplete dropdown relative to input
function positionAutocompleteDropdown(inputField, dropdown) {
    if (!inputField || !dropdown) return;
    
    const rect = inputField.getBoundingClientRect();
    dropdown.style.width = `${rect.width}px`;
    dropdown.style.left = `${rect.left}px`;
    dropdown.style.top = `${rect.bottom + window.scrollY}px`;
}

// Fuzzy match function for ingredients
function fuzzyMatch(pattern, str) {
    pattern = pattern.toLowerCase();
    str = str.toLowerCase();
    
    if (pattern === str) return { match: true, score: 1, highlighted: str };
    if (str.startsWith(pattern)) return { match: true, score: 0.9, highlighted: `<span class="highlight">${str.substring(0, pattern.length)}</span>${str.substring(pattern.length)}` };
    if (str.includes(pattern)) return { match: true, score: 0.8, highlighted: str.replace(new RegExp(pattern, 'gi'), match => `<span class="highlight">${match}</span>`) };
    
    // More advanced fuzzy matching
    let score = 0;
    let patternIdx = 0;
    let highlightedParts = [];
    let currentPart = '';
    
    for (let i = 0; i < str.length; i++) {
        if (patternIdx < pattern.length && str[i].toLowerCase() === pattern[patternIdx].toLowerCase()) {
            if (currentPart) {
                highlightedParts.push(currentPart);
                currentPart = '';
            }
            highlightedParts.push(`<span class="highlight">${str[i]}</span>`);
            patternIdx++;
            score += 1 / str.length;
        } else {
            currentPart += str[i];
        }
    }
    
    if (currentPart) {
        highlightedParts.push(currentPart);
    }
    
    // Adjust score based on adjacency
    if (patternIdx === pattern.length) {
        return { 
            match: true, 
            score: score * 0.7, // Fuzzy matches get lower score
            highlighted: highlightedParts.join('')
        };
    }
    
    return { match: false };
}

// Check if an ingredient is used in any recipe
function isIngredientUsedInRecipes(ingredientName) {
    // Check in all recipes except the currently editing recipe
    // This allows removing unused ingredients even if they're in the current recipe form
    return currentRecipes.some(recipe => {
        // Skip the current recipe being edited (we don't want to consider it when checking)
        if (editingRecipeId && recipe.id === editingRecipeId) {
            return false;
        }
        
        // Check if the ingredient is used in this recipe
        return recipe.ingredients.some(ingredient => 
            ingredient.name.toLowerCase() === ingredientName.toLowerCase()
        );
    });
}

// Remove an ingredient from the list
function removeIngredient(ingredientName) {
    // Update app data
    const appData = window.getAppData();
    appData.ingredients = appData.ingredients.filter(ingr => 
        ingr.toLowerCase() !== ingredientName.toLowerCase()
    );
    
    // Update current ingredients array
    currentIngredients = currentIngredients.filter(ingr => 
        ingr.toLowerCase() !== ingredientName.toLowerCase()
    );
    
    // Save updated data
    window.saveAppData(appData);
    
    console.log(`Removed ingredient: ${ingredientName}`);
}

// Show confirmation dialog for ingredient removal
function showIngredientRemovalConfirmation(ingredientName, event) {
    // Set the removing flag to true to prevent other events from processing
    isRemovingIngredient = true;
    
    // Prevent any default action and stop event propagation
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    // Create confirmation dialog
    const dialog = createElement('div', { class: 'confirmation-dialog' });
    
    const content = createElement('div', { class: 'confirmation-content ingredient-removal' });
    
    const title = createElement('h3', { class: 'confirmation-title' }, 'Remove Ingredient?');
    
    const message = createElement('p', { class: 'confirmation-message' }, 
        `Are you sure you want to remove "${ingredientName}" from your ingredients list?`);
    
    const actions = createElement('div', { class: 'confirmation-actions' });
    
    const cancelBtn = createElement('button', { class: 'confirmation-btn cancel' }, 'Cancel');
    cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.body.removeChild(dialog);
        
        // Reset the removing flag after a short delay to ensure other events are handled properly
        setTimeout(() => {
            isRemovingIngredient = false;
        }, 100);
        
        return false;
    });
    
    const confirmBtn = createElement('button', { class: 'confirmation-btn confirm' }, 'Remove');
    confirmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.body.removeChild(dialog);
        removeIngredient(ingredientName);
        
        // If the active input contains this ingredient name, clear it
        if (activeAutocompleteField && 
            activeAutocompleteField.value.toLowerCase() === ingredientName.toLowerCase()) {
            activeAutocompleteField.value = '';
        }
        
        // Refresh the autocomplete dropdown if there's an active field
        if (activeAutocompleteField) {
            handleIngredientInput({ target: activeAutocompleteField });
        }
        
        // Reset the removing flag after a short delay
        setTimeout(() => {
            isRemovingIngredient = false;
        }, 100);
        
        return false;
    });
    
    // Add close handler that also resets the flag
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            e.preventDefault();
            e.stopPropagation();
            document.body.removeChild(dialog);
            
            // Reset the removing flag
            setTimeout(() => {
                isRemovingIngredient = false;
            }, 100);
            
            return false;
        }
    });
    
    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    
    content.appendChild(title);
    content.appendChild(message);
    content.appendChild(actions);
    dialog.appendChild(content);
    
    // Add to body
    document.body.appendChild(dialog);
}

// Handle ingredient input for autocomplete
function handleIngredientInput(e) {
    const input = e.target;
    const query = input.value.trim();
    const autocompleteContainer = input.closest('.autocomplete-container');
    const resultsContainer = autocompleteContainer.querySelector('.autocomplete-results');
    
    // Set as active field
    activeAutocompleteField = input;
    selectedAutocompleteIndex = -1;
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    if (query.length < 1) {
        resultsContainer.classList.remove('active');
        return;
    }
    
    // Filter ingredients with fuzzy matching
    const matches = currentIngredients
        .map(ingredient => {
            const result = fuzzyMatch(query, ingredient);
            return result.match ? { ingredient, ...result } : null;
        })
        .filter(result => result !== null)
        .sort((a, b) => b.score - a.score);
    
    // Always add option to create new ingredient if we have a query
    if (query.length > 0) {
        const newOption = createElement('div', { class: 'autocomplete-item new-ingredient-option' });
        newOption.innerHTML = `<i class="fas fa-plus"></i> Add new ingredient: <strong>${query}</strong>`;
        
        newOption.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            input.value = query;
            resultsContainer.classList.remove('active');
            activeAutocompleteField = null;
            
            // If this is the empty row, convert it to a regular row
            const ingredientItem = input.closest('.ingredient-item');
            if (ingredientItem.classList.contains('empty-row')) {
                ingredientItem.classList.remove('empty-row');
                convertPlaceholderToDeleteButton(ingredientItem);
                ensureEmptyIngredientRow();
            }
            
            // Trigger save
            triggerAutoSave();
        });
        
        resultsContainer.appendChild(newOption);
    }
    
    // Add matching ingredients
    if (matches.length > 0) {
        matches.forEach(match => {
            const item = createElement('div', { class: 'autocomplete-item' });
            
            // Create a container for the ingredient name to allow for the delete button
            const nameContainer = createElement('span', { class: 'autocomplete-item-name' });
            nameContainer.innerHTML = match.highlighted;
            item.appendChild(nameContainer);
            
            // Add delete button for unused ingredients
            const isUsed = isIngredientUsedInRecipes(match.ingredient);
            if (!isUsed) {
                const deleteBtn = createElement('button', { 
                    class: 'ingredient-delete-btn',
                    title: 'Remove this ingredient'
                }, '×');
                
                // We need a separate mousedown handler that prevents the blur event
                deleteBtn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
                
                deleteBtn.addEventListener('click', (e) => {
                    // Explicitly prevent default action and stop propagation
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Prevent the dropdown from closing
                    e.currentTarget.closest('.autocomplete-results').classList.add('preserving');
                    
                    // Show confirmation dialog, passing the event
                    showIngredientRemovalConfirmation(match.ingredient, e);
                    
                    // Return false to prevent bubbling
                    return false;
                });
                
                item.appendChild(deleteBtn);
                item.classList.add('with-delete-btn');
            }
            
            if (match.score < 0.8) {
                const scoreElement = createElement('span', { class: 'ingredient-match-score' }, 
                    `${Math.round(match.score * 100)}%`);
                item.appendChild(scoreElement);
            }
            
            // Main click handler for the item itself
            item.addEventListener('click', (e) => {
                // Skip if we're in the middle of removing an ingredient
                if (isRemovingIngredient) return false;
                
                // Only handle clicks directly on the item or the name, not on buttons
                if (e.target === item || e.target === nameContainer || 
                    e.target.closest('.autocomplete-item-name')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    input.value = match.ingredient;
                    resultsContainer.classList.remove('active');
                    activeAutocompleteField = null;
                    
                    // If this is the empty row, convert it to a regular row
                    const ingredientItem = input.closest('.ingredient-item');
                    if (ingredientItem.classList.contains('empty-row')) {
                        ingredientItem.classList.remove('empty-row');
                        convertPlaceholderToDeleteButton(ingredientItem);
                        ensureEmptyIngredientRow();
                    }
                    
                    triggerAutoSave();
                }
            });
            
            resultsContainer.appendChild(item);
        });
    }
    
    if (resultsContainer.childNodes.length > 0) {
        resultsContainer.classList.add('active');
        // Position the dropdown
        positionAutocompleteDropdown(input, resultsContainer);
        
        // Add a one-time document click handler to close the dropdown
        // when clicking outside (removed after first use)
        const documentClickHandler = function(e) {
            // If we're removing an ingredient, ignore the click
            if (isRemovingIngredient) return;
            
            // Check if the click is on the active input or its dropdown
            if (!e.target.closest('.autocomplete-container') && 
                !e.target.closest('.autocomplete-results')) {
                // Click outside - handle like Escape key
                handleEscapeKeyForAutocomplete();
                
                // Clean up by removing this handler
                document.removeEventListener('click', documentClickHandler);
            }
        };
        
        // Remove any existing document click handlers and add a new one
        document.removeEventListener('click', documentClickHandler);
        document.removeEventListener('contextmenu', documentClickHandler);
        
        // Use setTimeout to ensure this handler runs after current event cycle
        setTimeout(() => {
            document.addEventListener('click', documentClickHandler);
            document.addEventListener('contextmenu', documentClickHandler);
        }, 0);
        
    } else {
        resultsContainer.classList.remove('active');
    }
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
        triggerAutoSave(); // Auto-save after image change
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
        triggerAutoSave(); // Auto-save after image change
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
    // Find the modal content element
    const modalContent = document.querySelector('#recipe-modal .modal-content');
    
    // Clear existing content
    modalContent.innerHTML = '';
    
    // Create new modern layout
    const formContainer = createElement('div', { class: 'recipe-form-container' });
    
    // Form header
    const formHeader = createElement('div', { class: 'recipe-form-header' });
    const closeButton = createElement('span', { class: 'close-modal' }, '×');
    closeButton.addEventListener('click', () => closeModal('recipe-modal'));
    
    const title = editingRecipeId ? 'Edit Recipe' : 'New Recipe';
    const formTitle = createElement('h2', { id: 'recipe-form-title' }, title);
    
    formHeader.appendChild(closeButton);
    formHeader.appendChild(formTitle);
    formContainer.appendChild(formHeader);
    
    // Form body
    const formBody = createElement('div', { class: 'recipe-form-body' });
    const form = createElement('form', { id: 'recipe-form' });
    
    // Main content column
    const mainContent = createElement('div', { class: 'form-main-content' });
    
    // Recipe name input
    const nameGroup = createElement('div', { class: 'form-group' });
    const nameInput = createElement('input', { 
        type: 'text', 
        id: 'recipe-name', 
        placeholder: 'Recipe Name',
        required: 'required'
    });
    nameGroup.appendChild(nameInput);
    mainContent.appendChild(nameGroup);
    
    // Ingredients section
    const ingredientsGroup = createElement('div', { class: 'form-group' });
    const ingredientsWrapper = createElement('div', { class: 'ingredients-container-wrapper' });
    
    const ingredientsHeader = createElement('div', { class: 'ingredients-header' });
    ingredientsHeader.appendChild(createElement('h3', {}, 'Ingredients'));
    
    ingredientsWrapper.appendChild(ingredientsHeader);
    
    const ingredientsContainer = createElement('div', { id: 'ingredients-container' });
    ingredientsWrapper.appendChild(ingredientsContainer);
    
    ingredientsGroup.appendChild(ingredientsWrapper);
    mainContent.appendChild(ingredientsGroup);
    
    // Description textarea
    const descriptionGroup = createElement('div', { class: 'form-group description-container' });
    const descriptionLabel = createElement('label', { for: 'recipe-description' }, 'Recipe Description and Preparation Steps');
    const descriptionTextarea = createElement('textarea', { 
        id: 'recipe-description', 
        placeholder: 'Enter your recipe description and preparation steps here. Use line breaks to separate different sections.'
    });
    
    descriptionGroup.appendChild(descriptionLabel);
    descriptionGroup.appendChild(descriptionTextarea);
    mainContent.appendChild(descriptionGroup);
    
    // Side content column
    const sideContent = createElement('div', { class: 'form-side-content' });
    
    // Image upload
    const imageGroup = createElement('div', { class: 'form-group' });
    const imageContainer = createElement('div', { class: 'image-upload-container' });
    
    const imagePreview = createElement('div', { class: 'image-preview', id: 'image-preview' });
    const previewPlaceholder = createElement('div', { class: 'image-preview-placeholder' });
    previewPlaceholder.innerHTML = '<i class="fas fa-image"></i><p>Recipe Image</p>';
    imagePreview.appendChild(previewPlaceholder);
    
    const imageOptions = createElement('div', { class: 'image-upload-options' });
    
    const fileInputContainer = createElement('div', { class: 'file-input-container' });
    const uploadButton = createElement('div', { class: 'image-upload-button' });
    uploadButton.innerHTML = '<i class="fas fa-upload"></i> Upload Image';
    
    const fileInput = createElement('input', { 
        type: 'file', 
        id: 'recipe-image-file', 
        accept: 'image/*'
    });
    fileInput.addEventListener('change', handleImageFileSelect);
    
    fileInputContainer.appendChild(uploadButton);
    fileInputContainer.appendChild(fileInput);
    
    const urlInput = createElement('input', {
        type: 'text',
        id: 'recipe-image-url',
        placeholder: 'Or paste image URL'
    });
    urlInput.addEventListener('change', handleImageUrlInput);
    urlInput.addEventListener('paste', handleImageUrlInput);
    
    imageOptions.appendChild(fileInputContainer);
    imageOptions.appendChild(urlInput);
    
    imageContainer.appendChild(imagePreview);
    imageContainer.appendChild(imageOptions);
    
    imageGroup.appendChild(imageContainer);
    sideContent.appendChild(imageGroup);
    
    // Form actions - now just a close button
    const actionsGroup = createElement('div', { class: 'form-actions' });
    
    const closeFormBtn = createElement('button', { 
        type: 'button', 
        class: 'btn close-recipe'
    });
    closeFormBtn.innerHTML = '<i class="fas fa-times"></i> Close';
    closeFormBtn.addEventListener('click', () => closeModal('recipe-modal'));
    
    actionsGroup.appendChild(closeFormBtn);
    
    // Auto-save indicator
    const autoSaveIndicator = createElement('div', { 
        class: 'auto-save-indicator',
        id: 'auto-save-indicator'
    });
    autoSaveIndicator.innerHTML = '<i class="fas fa-check-circle"></i> Saved';
    
    // Add columns to form
    form.appendChild(mainContent);
    form.appendChild(sideContent);
    form.appendChild(actionsGroup);
    
    // Add form to body
    formBody.appendChild(form);
    formBody.appendChild(autoSaveIndicator);
    formContainer.appendChild(formBody);
    
    // Add to modal
    modalContent.appendChild(formContainer);
    
    // Reset image data
    currentImageData = null;
    
    // Open modal first to make sure the DOM is updated
    window.openModal('recipe-modal');
    
    // Only set up auto-save when the modal is in the DOM
    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
        setupAutoSave();
    });
    
    // Populate form if editing
    if (recipeId) {
        // Find recipe
        const recipe = currentRecipes.find(r => r.id === recipeId);
        editingRecipeId = recipeId;
        
        if (recipe) {
            // Fill form with recipe data
            nameInput.value = recipe.name;
            descriptionTextarea.value = recipe.description || '';
            
            // Set image if exists
            if (recipe.image) {
                currentImageData = recipe.image;
                updateImagePreview(recipe.image);
            }
            
            // Add ingredient fields
            recipe.ingredients.forEach(ingredient => {
                addIngredientField(null, ingredient);
            });
            
            // Add empty row at the end for new ingredients
            ensureEmptyIngredientRow();
        }
    } else {
        // Adding new recipe
        editingRecipeId = null;
        
        // Add an empty ingredient row
        ensureEmptyIngredientRow();
        
        // Auto-save empty recipe to get ID
        autoSaveRecipe();
    }
}

// Ensure there's always one empty ingredient row at the bottom
function ensureEmptyIngredientRow() {
    const ingredientsContainer = document.getElementById('ingredients-container');
    
    // Check if we already have an empty row
    const emptyRows = ingredientsContainer.querySelectorAll('.ingredient-item.empty-row');
    
    if (emptyRows.length === 0) {
        // Add an empty row
        addIngredientField(null, null, true);
    }
}

// Setup auto-save for form fields
function setupAutoSave() {
    const form = document.getElementById('recipe-form');
    if (!form) return; // Early return if form doesn't exist yet
    
    // Listen for changes on input fields
    form.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            triggerAutoSave();
        }
    });
    
    // Add a delegated event listener to the form itself for ingredient container events
    // This is more reliable than trying to access the ingredients container directly
    form.addEventListener('click', (e) => {
        // Check if the click was on a remove button
        if (e.target.closest('.remove-btn')) {
            triggerAutoSave();
        }
    });
}

// Trigger auto-save with debounce
function triggerAutoSave() {
    // Show saving indicator
    const indicator = document.getElementById('auto-save-indicator');
    if (indicator) {
        indicator.classList.add('visible', 'saving');
        indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    }
    
    // Clear existing timeout
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }
    
    // Set new timeout for 1 second
    autoSaveTimeout = setTimeout(() => {
        autoSaveRecipe();
    }, 1000);
}

// Auto-save recipe
function autoSaveRecipe() {
    // Get form data
    const name = document.getElementById('recipe-name').value.trim();
    const description = document.getElementById('recipe-description').value;
    
    // If recipe has no name yet, don't save
    if (!name) {
        updateSaveIndicator(false);
        return;
    }
    
    // Get ingredients - exclude the empty row
    const ingredientItems = document.querySelectorAll('#ingredients-container .ingredient-item:not(.empty-row)');
    const ingredients = Array.from(ingredientItems).map(item => {
        const nameInput = item.querySelector('.autocomplete-container input');
        const quantityInput = item.querySelector('input[type="number"]');
        const unitSelect = item.querySelector('select');
        
        return {
            name: nameInput.value.trim(),
            quantity: parseFloat(quantityInput.value) || 0,
            unit: unitSelect.value
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
        ingredients,
        image: currentImageData,
        id: editingRecipeId || window.generateId()
    };
    
    // If this is a new recipe, set the ID
    if (!editingRecipeId) {
        editingRecipeId = recipe.id;
    }
    
    // Update app data
    const appData = window.getAppData();
    
    if (editingRecipeId) {
        // Update existing recipe or add new
        const index = appData.recipes.findIndex(r => r.id === editingRecipeId);
        if (index !== -1) {
            appData.recipes[index] = recipe;
        } else {
            appData.recipes.push(recipe);
        }
    }
    
    // Update ingredients list
    appData.ingredients = [...new Set([...appData.ingredients, ...currentIngredients])];
    
    // Save data
    window.saveAppData(appData);
    
    // Update current data
    currentRecipes = appData.recipes;
    
    // Refresh display in background
    displayRecipes();
    
    // Update meal plan and shopping list views to reflect the changes
    if (typeof window.initializeMealPlan === 'function') {
        window.initializeMealPlan(appData.mealPlan, appData.recipes);
    }
    
    if (typeof window.initializeShoppingList === 'function') {
        window.initializeShoppingList(appData.mealPlan, appData.recipes);
    }
    
    // Update save indicator
    updateSaveIndicator(true);
}

// Update auto-save indicator
function updateSaveIndicator(success) {
    const indicator = document.getElementById('auto-save-indicator');
    
    if (success) {
        indicator.classList.remove('saving');
        indicator.innerHTML = '<i class="fas fa-check-circle"></i> Saved';
        
        // Hide indicator after 2 seconds
        setTimeout(() => {
            indicator.classList.remove('visible');
        }, 2000);
    } else {
        indicator.classList.remove('saving');
        indicator.innerHTML = '<i class="fas fa-exclamation-circle"></i> Enter recipe name to save';
    }
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
function addIngredientField(e = null, ingredientData = null, isEmptyRow = false) {
    if (e) e.preventDefault();
    
    const ingredientsContainer = document.getElementById('ingredients-container');
    
    const ingredientItem = createElement('div', { 
        class: isEmptyRow ? 'ingredient-item empty-row' : 'ingredient-item'
    });
    
    // Ingredient name with autocomplete
    const nameContainer = createElement('div', { class: 'autocomplete-container' });
    
    const nameInput = createElement('input', { 
        type: 'text', 
        placeholder: 'Ingredient name',
        value: ingredientData ? ingredientData.name : ''
    });
    
    // Autocomplete results container
    const resultsContainer = createElement('div', { class: 'autocomplete-results' });
    
    // Track input focus to know when we're starting to edit
    nameInput.addEventListener('focus', (e) => {
        // Save the initial value when focusing, so we can restore if needed
        initialInputValue = nameInput.value;
        isAddingNewIngredient = ingredientItem.classList.contains('empty-row');
        
        // Trigger autocomplete if we have content
        handleIngredientInput(e);
    });
    
    // Add event listeners for autocomplete
    nameInput.addEventListener('input', handleIngredientInput);
    nameInput.addEventListener('click', (e) => {
        e.stopPropagation();
        if (nameInput.value.trim()) {
            handleIngredientInput(e);
        }
    });
    
    // Add event listeners for completing/confirming an ingredient
    nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            // Only proceed if there's an actual value
            if (nameInput.value.trim()) {
                // If this is the empty row, create a new one and convert this to a regular row
                if (ingredientItem.classList.contains('empty-row')) {
                    ingredientItem.classList.remove('empty-row');
                    
                    // Replace the placeholder button with a delete button
                    convertPlaceholderToDeleteButton(ingredientItem);
                    
                    // Add a new empty row
                    ensureEmptyIngredientRow();
                }
                
                // Close the dropdown
                closeAllAutocompleteDropdowns();
                
                nameInput.blur(); // Unfocus to trigger a save
                triggerAutoSave();
            }
        } else if (e.key === 'Escape') {
            // Cancel ingredient selection using our shared function
            e.preventDefault();
            handleEscapeKeyForAutocomplete();
        }
    });
    
    // Save when input loses focus, but only if it has content
    nameInput.addEventListener('blur', (e) => {
        // Skip processing if we're in the middle of removing an ingredient
        if (isRemovingIngredient) return;
        
        // Check if we're clicking on the autocomplete dropdown - but only if coordinates are valid
        let isClickingOnDropdown = false;
        
        // Check if coordinates are valid finite numbers before using elementFromPoint
        if (e.clientX && e.clientY && isFinite(e.clientX) && isFinite(e.clientY)) {
            const clickedElement = document.elementFromPoint(e.clientX, e.clientY);
            isClickingOnDropdown = clickedElement && 
                (clickedElement.closest('.autocomplete-results') || 
                 clickedElement.closest('.ingredient-delete-btn'));
        }
             
        // Skip processing if clicking on dropdown
        if (isClickingOnDropdown) return;
        
        // Check if the dropdown is being preserved (during delete operation)
        const dropdown = nameInput.nextElementSibling;
        if (dropdown && dropdown.classList.contains('preserving')) {
            dropdown.classList.remove('preserving');
            return;
        }
        
        // Note: We don't need to handle the cancel logic here anymore
        // as the global click handler will take care of it
        
        // For non-empty rows with content, trigger a save
        if (!ingredientItem.classList.contains('empty-row') && nameInput.value.trim()) {
            triggerAutoSave();
        }
    });
    
    nameContainer.appendChild(nameInput);
    nameContainer.appendChild(resultsContainer);
    
    // Quantity input
    const quantityInput = createElement('input', { 
        type: 'number', 
        placeholder: 'Quantity',
        min: '0',
        step: '0.01',
        value: ingredientData ? ingredientData.quantity : ''
    });
    
    // Add blur event to quantity input to trigger save
    quantityInput.addEventListener('blur', () => {
        if (nameInput.value.trim() && ingredientItem.classList.contains('empty-row')) {
            // If this was the empty row and now has a value, convert it
            ingredientItem.classList.remove('empty-row');
            convertPlaceholderToDeleteButton(ingredientItem);
            ensureEmptyIngredientRow();
            triggerAutoSave();
        } else if (nameInput.value.trim()) {
            triggerAutoSave();
        }
    });
    
    // Unit selection dropdown
    const unitSelect = createElement('select');
    
    // Add unit options
    const units = ['pcs', 'g', 'ml'];
    units.forEach(unit => {
        const option = createElement('option', { value: unit }, unit);
        unitSelect.appendChild(option);
    });
    
    // Set the selected value if editing, otherwise default to 'pcs'
    if (ingredientData && ingredientData.unit) {
        // If the ingredient has a unit that's in our list, select it
        if (units.includes(ingredientData.unit)) {
            unitSelect.value = ingredientData.unit;
        } else {
            // If it's a custom unit, add it to the dropdown
            const customOption = createElement('option', { value: ingredientData.unit }, ingredientData.unit);
            unitSelect.appendChild(customOption);
            unitSelect.value = ingredientData.unit;
        }
    } else {
        unitSelect.value = 'pcs'; // Default unit
    }
    
    // Add change event to unit select to trigger save
    unitSelect.addEventListener('change', () => {
        if (nameInput.value.trim() && ingredientItem.classList.contains('empty-row')) {
            // If this was the empty row and now has a value, convert it
            ingredientItem.classList.remove('empty-row');
            convertPlaceholderToDeleteButton(ingredientItem);
            ensureEmptyIngredientRow();
            triggerAutoSave();
        } else if (nameInput.value.trim()) {
            triggerAutoSave();
        }
    });
    
    // First append all the basic elements to the ingredient item
    ingredientItem.appendChild(nameContainer);
    ingredientItem.appendChild(quantityInput);
    ingredientItem.appendChild(unitSelect);
    
    // Remove button - only for non-empty rows
    if (!isEmptyRow) {
        // Add a delete button for regular ingredient rows
        const removeBtn = createElement('button', { 
            type: 'button', 
            class: 'remove-btn',
            title: 'Remove ingredient'
        }, '×');
        
        removeBtn.addEventListener('click', () => {
            const ingredientsContainer = document.getElementById('ingredients-container');
            ingredientsContainer.removeChild(ingredientItem);
            // Trigger auto-save after removing ingredient
            triggerAutoSave();
            
            // Make sure we still have an empty row
            ensureEmptyIngredientRow();
        });
        
        ingredientItem.appendChild(removeBtn);
    } else {
        // For empty row, add a placeholder button that does nothing
        const placeholderBtn = createElement('button', { 
            type: 'button', 
            class: 'remove-btn placeholder-btn',
            title: 'New ingredient',
            disabled: 'disabled'
        }, '+');
        
        ingredientItem.appendChild(placeholderBtn);
    }
    
    ingredientsContainer.appendChild(ingredientItem);
    
    // Focus the input if this is a new empty row
    if (isEmptyRow && !ingredientData) {
        nameInput.focus();
    }
    
    return ingredientItem;
}

// Convert a placeholder button to a delete button
function convertPlaceholderToDeleteButton(ingredientItem) {
    // Find the placeholder button
    const placeholderBtn = ingredientItem.querySelector('.placeholder-btn');
    if (placeholderBtn) {
        // Remove it
        placeholderBtn.remove();
        
        // Create and add a delete button
        const removeBtn = createElement('button', { 
            type: 'button', 
            class: 'remove-btn',
            title: 'Remove ingredient'
        }, '×');
        
        removeBtn.addEventListener('click', () => {
            const ingredientsContainer = document.getElementById('ingredients-container');
            if (ingredientsContainer.contains(ingredientItem)) {
                ingredientsContainer.removeChild(ingredientItem);
                // Trigger auto-save after removing ingredient
                triggerAutoSave();
                
                // Make sure we still have an empty row
                ensureEmptyIngredientRow();
            }
        });
        
        ingredientItem.appendChild(removeBtn);
    }
}

// Save recipe from form
function saveRecipe() {
    // Get form data
    const name = document.getElementById('recipe-name').value;
    const description = document.getElementById('recipe-description').value;
    
    // Get ingredients
    const ingredientItems = document.querySelectorAll('#ingredients-container .ingredient-item');
    const ingredients = Array.from(ingredientItems).map(item => {
        const nameInput = item.querySelector('.autocomplete-container input');
        const quantityInput = item.querySelector('input[type="number"]');
        const unitSelect = item.querySelector('select');
        
        return {
            name: nameInput.value.trim(),
            quantity: parseFloat(quantityInput.value) || 0,
            unit: unitSelect.value
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
        ingredients,
        image: currentImageData,
        id: editingRecipeId || window.generateId()
    };
    
    // Update app data
    const appData = window.getAppData();
    
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
    window.saveAppData(appData);
    
    // Update current data
    currentRecipes = appData.recipes;
    
    // Refresh display
    displayRecipes();
    
    // Close modal
    closeModal('recipe-modal');
    
    // Reset current image data
    currentImageData = null;
    
    // Update meal plan and shopping list views to reflect the changes
    if (typeof window.initializeMealPlan === 'function') {
        window.initializeMealPlan(appData.mealPlan, appData.recipes);
    }
    
    if (typeof window.initializeShoppingList === 'function') {
        window.initializeShoppingList(appData.mealPlan, appData.recipes);
    }
}

// Delete recipe
function deleteRecipe(recipeId) {
    // Update app data
    const appData = window.getAppData();
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
    window.saveAppData(appData);
    
    // Update current data
    currentRecipes = appData.recipes;
    
    // Refresh display
    displayRecipes();
    
    // Refresh meal plan and shopping list
    if (typeof window.initializeMealPlan === 'function') {
        window.initializeMealPlan(appData.mealPlan, appData.recipes);
    }
    
    if (typeof window.initializeShoppingList === 'function') {
        window.initializeShoppingList(appData.mealPlan, appData.recipes);
    }
}

// Make the functions available globally
window.initializeRecipes = initializeRecipes;
window.displayRecipes = displayRecipes;
window.openRecipeForm = openRecipeForm;
window.deleteRecipe = deleteRecipe; 