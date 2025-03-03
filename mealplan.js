// Meal planning functionality
let currentMealPlan = {};
let availableRecipes = [];
let selectedDate = null;
let selectedMealType = null;

// Initialize meal plan component
function initializeMealPlan(mealPlan, recipes) {
    currentMealPlan = mealPlan;
    availableRecipes = recipes;
    
    // Generate and display calendar
    generateCalendar();
    
    // Set up event listeners
    setupMealPlanEventListeners();
}

// Generate calendar for meal planning
function generateCalendar() {
    const calendarContainer = document.getElementById('calendar-container');
    calendarContainer.innerHTML = '';
    
    // Create calendar header
    const calendarHeader = createElement('div', { class: 'calendar-header' });
    calendarHeader.appendChild(createElement('h3', {}, 'Next 10 Days'));
    calendarContainer.appendChild(calendarHeader);
    
    // Create calendar days container
    const calendarDays = createElement('div', { class: 'calendar-days' });
    
    // Generate 10 days starting from today
    const today = new Date();
    
    for (let i = 0; i < 10; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Create day element
        const dayElement = createDayElement(date, dateString);
        calendarDays.appendChild(dayElement);
    }
    
    calendarContainer.appendChild(calendarDays);
}

// Create a day element for the calendar
function createDayElement(date, dateString) {
    const dayElement = createElement('div', { class: 'calendar-day', 'data-date': dateString });
    
    // Day header with date
    const dayHeader = createElement('div', { class: 'day-header' }, formatDate(date));
    dayElement.appendChild(dayHeader);
    
    // Meal slots (breakfast, lunch, dinner)
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    
    mealTypes.forEach(mealType => {
        const mealSlot = createElement('div', { class: 'meal-slot', 'data-meal-type': mealType });
        
        // Meal type label with icon
        const mealTypeLabel = createElement('div', { class: 'meal-type' });
        
        // Add appropriate icon for each meal type
        let icon = '';
        if (mealType === 'breakfast') {
            icon = '<i class="fas fa-coffee"></i> ';
        } else if (mealType === 'lunch') {
            icon = '<i class="fas fa-utensils"></i> ';
        } else if (mealType === 'dinner') {
            icon = '<i class="fas fa-moon"></i> ';
        }
        
        mealTypeLabel.innerHTML = icon + mealType.charAt(0).toUpperCase() + mealType.slice(1);
        mealSlot.appendChild(mealTypeLabel);
        
        // Check if there's a meal planned for this slot
        const plannedMeal = currentMealPlan[dateString] && currentMealPlan[dateString][mealType];
        
        if (plannedMeal) {
            // Find recipe details
            const recipe = availableRecipes.find(r => r.id === plannedMeal);
            
            if (recipe) {
                // Display planned meal
                const selectedMeal = createElement('div', { class: 'selected-meal' });
                
                // If recipe has an image, show a small thumbnail
                if (recipe.image) {
                    const imgContainer = createElement('div', { class: 'meal-thumb-container' });
                    const img = createElement('img', { 
                        class: 'meal-thumb',
                        src: recipe.image,
                        alt: recipe.name
                    });
                    imgContainer.appendChild(img);
                    selectedMeal.appendChild(imgContainer);
                }
                
                const nameSpan = createElement('span', { class: 'meal-name' }, recipe.name);
                selectedMeal.appendChild(nameSpan);
                
                mealSlot.appendChild(selectedMeal);
            } else {
                // Recipe not found, show placeholder
                const placeholder = createElement('div', { class: 'meal-placeholder' }, 
                    '<i class="fas fa-plus"></i> Select a meal');
                placeholder.innerHTML = '<i class="fas fa-plus"></i> Select a meal';
                mealSlot.appendChild(placeholder);
            }
        } else {
            // No meal planned, show placeholder
            const placeholder = createElement('div', { class: 'meal-placeholder' });
            placeholder.innerHTML = '<i class="fas fa-plus"></i> Select a meal';
            mealSlot.appendChild(placeholder);
        }
        
        dayElement.appendChild(mealSlot);
    });
    
    return dayElement;
}

// Set up event listeners for meal planning
function setupMealPlanEventListeners() {
    // Meal selection
    const calendarContainer = document.getElementById('calendar-container');
    calendarContainer.addEventListener('click', (e) => {
        const mealPlaceholder = e.target.closest('.meal-placeholder');
        const selectedMeal = e.target.closest('.selected-meal');
        
        if (mealPlaceholder || selectedMeal) {
            const mealSlot = (mealPlaceholder || selectedMeal).closest('.meal-slot');
            const dayElement = mealSlot.closest('.calendar-day');
            
            selectedDate = dayElement.getAttribute('data-date');
            selectedMealType = mealSlot.getAttribute('data-meal-type');
            
            openMealSelectionModal();
        }
    });
    
    // Recipe selection in modal
    const recipeSelectionContainer = document.getElementById('recipe-selection-container');
    recipeSelectionContainer.addEventListener('click', (e) => {
        const recipeItem = e.target.closest('.recipe-selection-item');
        
        if (recipeItem) {
            const recipeId = recipeItem.getAttribute('data-id');
            selectMealForSlot(recipeId);
            closeModal('meal-selection-modal');
        }
    });
}

// Open meal selection modal
function openMealSelectionModal() {
    const recipeSelectionContainer = document.getElementById('recipe-selection-container');
    recipeSelectionContainer.innerHTML = '';
    
    // Get the latest recipes data
    const appData = getAppData();
    availableRecipes = appData.recipes;
    
    if (availableRecipes.length === 0) {
        const emptyMessage = createElement('div', { class: 'empty-message' }, 
            'No recipes available. Please add recipes first.');
        recipeSelectionContainer.appendChild(emptyMessage);
    } else {
        // Create recipe grid for selection
        const recipeGrid = createElement('div', { class: 'recipe-selection-grid' });
        
        // Add option to clear selection
        const clearOption = createElement('div', { class: 'recipe-selection-item clear-selection' });
        clearOption.innerHTML = '<i class="fas fa-times"></i> Clear selection';
        clearOption.addEventListener('click', () => {
            selectMealForSlot(null);
            closeModal('meal-selection-modal');
        });
        recipeSelectionContainer.appendChild(clearOption);
        
        // Add recipes
        availableRecipes.forEach(recipe => {
            const recipeItem = createElement('div', { 
                class: 'recipe-selection-item', 
                'data-id': recipe.id 
            });
            
            // If recipe has an image, show it
            if (recipe.image) {
                const imgContainer = createElement('div', { class: 'recipe-selection-image' });
                const img = createElement('img', { 
                    src: recipe.image,
                    alt: recipe.name
                });
                imgContainer.appendChild(img);
                recipeItem.appendChild(imgContainer);
            } else {
                // If no image, show a placeholder icon
                const imgPlaceholder = createElement('div', { class: 'recipe-selection-image no-image' });
                imgPlaceholder.innerHTML = '<i class="fas fa-utensils"></i>';
                recipeItem.appendChild(imgPlaceholder);
            }
            
            // Recipe name
            const nameContainer = createElement('div', { class: 'recipe-selection-name' }, recipe.name);
            recipeItem.appendChild(nameContainer);
            
            recipeGrid.appendChild(recipeItem);
        });
        
        recipeSelectionContainer.appendChild(recipeGrid);
    }
    
    openModal('meal-selection-modal');
}

// Select a meal for a slot
function selectMealForSlot(recipeId) {
    // Update meal plan data
    const appData = getAppData();
    
    // Initialize date in meal plan if it doesn't exist
    if (!appData.mealPlan[selectedDate]) {
        appData.mealPlan[selectedDate] = {};
    }
    
    if (recipeId) {
        // Set recipe for meal slot
        appData.mealPlan[selectedDate][selectedMealType] = recipeId;
    } else {
        // Clear meal slot
        delete appData.mealPlan[selectedDate][selectedMealType];
        
        // Remove date if empty
        if (Object.keys(appData.mealPlan[selectedDate]).length === 0) {
            delete appData.mealPlan[selectedDate];
        }
    }
    
    // Save data
    saveAppData(appData);
    
    // Update current data
    currentMealPlan = appData.mealPlan;
    
    // Refresh calendar
    generateCalendar();
    
    // Always refresh the shopping list when meal plan changes
    if (typeof initializeShoppingList === 'function') {
        initializeShoppingList(appData.mealPlan, appData.recipes);
    }
} 