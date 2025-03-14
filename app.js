// Main app functionality
import { initAuth, saveUserData, getCurrentUser, isUserLoggedIn } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("App initializing...");
    
    // Initialize authentication
    initAuth();
    
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
    if (typeof window.initializeRecipes === 'function') {
        window.initializeRecipes(data.recipes, data.ingredients);
    } else {
        console.error("initializeRecipes function not available");
    }
    
    if (typeof window.initializeMealPlan === 'function') {
        window.initializeMealPlan(data.mealPlan, data.recipes);
    } else {
        console.log("initializeMealPlan function not available yet");
    }
    
    if (typeof window.initializeShoppingList === 'function') {
        window.initializeShoppingList(data.mealPlan, data.recipes);
    } else {
        console.log("initializeShoppingList function not available yet");
    }
}

// Get app data from localStorage
function getAppData() {
    return JSON.parse(localStorage.getItem('kitchenPlannerData'));
}

// Save app data to localStorage and Firestore if user is logged in
function saveAppData(data) {
    // Save to localStorage first (for offline functionality)
    localStorage.setItem('kitchenPlannerData', JSON.stringify(data));
    
    // If user is logged in, also save to Firestore
    if (isUserLoggedIn()) {
        saveUserData(data);
    }
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
            if (typeof window.initializeRecipes === 'function') {
                window.initializeRecipes(data.recipes, data.ingredients);
            }
            break;
        case 'meal-plan':
            if (typeof window.initializeMealPlan === 'function') {
                window.initializeMealPlan(data.mealPlan, data.recipes);
            }
            break;
        case 'shopping-list':
            if (typeof window.initializeShoppingList === 'function') {
                window.initializeShoppingList(data.mealPlan, data.recipes);
            }
            break;
    }
}

// Modal functionality
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    
    // Add event listener to close button
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeModal(modalId);
        });
    }
    
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

// Export functions used by other modules
window.getAppData = getAppData;
window.saveAppData = saveAppData;
window.openModal = openModal;
window.closeModal = closeModal;
window.formatDate = formatDate;
window.createElement = createElement;
window.generateId = generateId;

// Add debug export to allow checking initialization
window.debugKitchenPlanner = {
    getAppData,
    saveAppData,
    getCurrentUser: () => getCurrentUser(),
    isUserLoggedIn: () => isUserLoggedIn()
}; 