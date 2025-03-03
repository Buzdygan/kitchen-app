// Main app functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize data from localStorage or set defaults
    initializeApp();
    
    // Set up navigation
    setupNavigation();
});

// Initialize the application data
function initializeApp() {
    // Check if we have data in localStorage
    if (!localStorage.getItem('kitchenPlannerData')) {
        // Initialize with empty data
        const initialData = {
            recipes: [],
            mealPlan: {},
            ingredients: []
        };
        
        // Save to localStorage
        localStorage.setItem('kitchenPlannerData', JSON.stringify(initialData));
    }
    
    // Load data and initialize components
    const data = getAppData();
    
    // Initialize each component
    initializeRecipes(data.recipes, data.ingredients);
    initializeMealPlan(data.mealPlan, data.recipes);
    initializeShoppingList(data.mealPlan, data.recipes);
}

// Get app data from localStorage
function getAppData() {
    return JSON.parse(localStorage.getItem('kitchenPlannerData'));
}

// Save app data to localStorage
function saveAppData(data) {
    localStorage.setItem('kitchenPlannerData', JSON.stringify(data));
}

// Setup navigation between views
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.view');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links and views
            navLinks.forEach(l => l.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Show the corresponding view
            const viewId = link.getAttribute('data-view') + '-view';
            document.getElementById(viewId).classList.add('active');
            
            // Refresh the content of the view that is now active
            const viewType = link.getAttribute('data-view');
            refreshView(viewType);
        });
    });
}

// Refresh a specific view with the latest data
function refreshView(viewType) {
    const data = getAppData();
    
    switch (viewType) {
        case 'recipes':
            initializeRecipes(data.recipes, data.ingredients);
            break;
        case 'meal-plan':
            initializeMealPlan(data.mealPlan, data.recipes);
            break;
        case 'shopping-list':
            initializeShoppingList(data.mealPlan, data.recipes);
            break;
    }
}

// Modal functionality
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    
    // Add event listener to close button
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        closeModal(modalId);
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modalId);
        }
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Helper function to format date
function formatDate(date) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Helper function to create DOM element with attributes and content
function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    // Set attributes
    for (const key in attributes) {
        if (key === 'classList' && Array.isArray(attributes[key])) {
            attributes[key].forEach(cls => element.classList.add(cls));
        } else {
            element.setAttribute(key, attributes[key]);
        }
    }
    
    // Set content
    if (content) {
        element.textContent = content;
    }
    
    return element;
}

// Helper function to generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
} 