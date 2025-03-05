// auth.js - Handles authentication functionality
import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// Store the currently logged in user
let currentUser = null;

// Initialize auth state listener
export function initAuth() {
    console.log("Initializing auth...");
    
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            currentUser = user;
            showLoggedInUI(user);
            console.log("User is logged in:", user.displayName || user.email);
            
            // Load user data
            loadUserData();
        } else {
            // User is signed out
            currentUser = null;
            showLoginUI();
            console.log("User is logged out");
        }
    });

    // Set up login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            loginWithEmail(email, password);
        });
    } else {
        console.error("Login form not found in the DOM");
    }

    // Set up signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            signupWithEmail(name, email, password);
        });
    } else {
        console.error("Signup form not found in the DOM");
    }

    // Set up Google login
    const googleLoginBtn = document.getElementById('google-login');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            loginWithGoogle();
        });
    }

    // Set up logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            logoutUser();
        });
    }

    // Set up switch to signup view
    const toSignupBtn = document.getElementById('to-signup');
    if (toSignupBtn) {
        toSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-container').classList.remove('active');
            document.getElementById('signup-container').classList.add('active');
        });
    }

    // Set up switch to login view
    const toLoginBtn = document.getElementById('to-login');
    if (toLoginBtn) {
        toLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('signup-container').classList.remove('active');
            document.getElementById('login-container').classList.add('active');
        });
    }
}

// Login with email and password
async function loginWithEmail(email, password) {
    try {
        console.log("Attempting login with email:", email);
        showLoginLoading(true);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // No need to call showLoggedInUI here - the onAuthStateChanged listener will handle it
        showLoginMessage('', false);
    } catch (error) {
        console.error("Login error:", error);
        showLoginMessage(`Login failed: ${error.message}`, true);
    } finally {
        showLoginLoading(false);
    }
}

// Signup with email and password
async function signupWithEmail(name, email, password) {
    try {
        console.log("Attempting signup with email:", email);
        showSignupLoading(true);
        // Create the user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        console.log("User created, updating profile...");
        // Set display name
        await updateProfile(userCredential.user, {
            displayName: name
        });
        
        console.log("Creating user document...");
        // Create user document in Firestore
        await createUserDocument(userCredential.user);
        
        showSignupMessage('Account created successfully!', false);
    } catch (error) {
        console.error("Signup error:", error);
        showSignupMessage(`Signup failed: ${error.message}`, true);
    } finally {
        showSignupLoading(false);
    }
}

// Login with Google
async function loginWithGoogle() {
    try {
        console.log("Attempting Google login");
        showLoginLoading(true);
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        
        console.log("Google login successful, checking user document");
        // Check if this is a new user and create document if needed
        await createUserDocumentIfNeeded(userCredential.user);
        
        showLoginMessage('', false);
    } catch (error) {
        console.error("Google login error:", error);
        showLoginMessage(`Google login failed: ${error.message}`, true);
    } finally {
        showLoginLoading(false);
    }
}

// Logout user
async function logoutUser() {
    try {
        await signOut(auth);
        // No need to call showLoginUI - the onAuthStateChanged listener will handle it
    } catch (error) {
        console.error("Logout error:", error);
    }
}

// Create initial user document in Firestore
async function createUserDocument(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        
        // Check if the document already exists
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            console.log("Creating new user document");
            // Create initial user data
            await setDoc(userRef, {
                displayName: user.displayName || '',
                email: user.email,
                createdAt: new Date(),
                // Initialize with empty data structures
                kitchenPlannerData: {
                    recipes: [],
                    mealPlan: {},
                    ingredients: []
                }
            });
            console.log("User document created");
        }
    } catch (error) {
        console.error("Error creating user document:", error);
        throw error; // Re-throw to handle in the calling function
    }
}

// Create user document if it doesn't exist (for Google sign in)
async function createUserDocumentIfNeeded(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            console.log("New Google user, creating document");
            await createUserDocument(user);
        } else {
            console.log("Existing Google user, document found");
        }
    } catch (error) {
        console.error("Error checking user document:", error);
        throw error; // Re-throw to handle in the calling function
    }
}

// Load user's data from Firestore
async function loadUserData() {
    if (!currentUser) return;
    
    try {
        console.log("Loading user data from Firestore");
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // If user has kitchen planner data, initialize the app with it
            if (userData.kitchenPlannerData) {
                // Store data in localStorage for compatibility with current app code
                localStorage.setItem('kitchenPlannerData', JSON.stringify(userData.kitchenPlannerData));
                
                // Re-initialize app components with the loaded data
                const data = userData.kitchenPlannerData;
                
                if (typeof window.initializeRecipes === 'function') {
                    window.initializeRecipes(data.recipes, data.ingredients);
                }
                
                if (typeof window.initializeMealPlan === 'function') {
                    window.initializeMealPlan(data.mealPlan, data.recipes);
                }
                
                if (typeof window.initializeShoppingList === 'function') {
                    window.initializeShoppingList(data.mealPlan, data.recipes);
                }
            }
            
            console.log("User data loaded successfully");
        } else {
            console.warn("No user document found, creating one");
            await createUserDocument(currentUser);
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

// Save user's data to Firestore
export async function saveUserData(data) {
    if (!currentUser) return;
    
    try {
        console.log("Saving user data to Firestore");
        const userRef = doc(db, "users", currentUser.uid);
        await setDoc(userRef, {
            kitchenPlannerData: data
        }, { merge: true });
        
        console.log("User data saved to Firestore");
    } catch (error) {
        console.error("Error saving user data:", error);
    }
}

// UI Helper Functions
function showLoginUI() {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const loginContainer = document.getElementById('login-container');
    const signupContainer = document.getElementById('signup-container');
    const userProfile = document.getElementById('user-profile');
    
    if (authContainer) authContainer.classList.add('active');
    if (appContainer) appContainer.classList.add('blur');
    if (loginContainer) loginContainer.classList.add('active');
    if (signupContainer) signupContainer.classList.remove('active');
    if (userProfile) userProfile.classList.remove('active');
}

function showLoggedInUI(user) {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const userProfile = document.getElementById('user-profile');
    
    if (authContainer) authContainer.classList.remove('active');
    if (appContainer) appContainer.classList.remove('blur');
    if (userProfile) userProfile.classList.add('active');
    
    // Update user profile display
    const userDisplayName = document.getElementById('user-display-name');
    if (userDisplayName) {
        userDisplayName.textContent = user.displayName || user.email;
    }
}

function showLoginLoading(isLoading) {
    const loginBtn = document.getElementById('login-button');
    if (!loginBtn) return;
    
    if (isLoading) {
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        loginBtn.disabled = true;
    } else {
        loginBtn.innerHTML = 'Login';
        loginBtn.disabled = false;
    }
}

function showSignupLoading(isLoading) {
    const signupBtn = document.getElementById('signup-button');
    if (!signupBtn) return;
    
    if (isLoading) {
        signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        signupBtn.disabled = true;
    } else {
        signupBtn.innerHTML = 'Sign Up';
        signupBtn.disabled = false;
    }
}

function showLoginMessage(message, isError) {
    const loginMessage = document.getElementById('login-message');
    if (!loginMessage) return;
    
    loginMessage.textContent = message;
    loginMessage.className = isError ? 'error-message' : 'success-message';
    
    if (message) {
        loginMessage.style.display = 'block';
    } else {
        loginMessage.style.display = 'none';
    }
}

function showSignupMessage(message, isError) {
    const signupMessage = document.getElementById('signup-message');
    if (!signupMessage) return;
    
    signupMessage.textContent = message;
    signupMessage.className = isError ? 'error-message' : 'success-message';
    
    if (message) {
        signupMessage.style.display = 'block';
    } else {
        signupMessage.style.display = 'none';
    }
}

// Get current user
export function getCurrentUser() {
    return currentUser;
}

// Check if user is logged in
export function isUserLoggedIn() {
    return !!currentUser;
} 