/**
 * LoginManager Module
 * Handles login functionality and view switching between login, contract selection and calculator
 */
class LoginManager {
    constructor(config = {}) {
        this.config = {
            // Auth credentials (should be moved to separate config)
            username: config.username || 'admin',
            password: config.password || 'password123',
            
            // DOM element IDs
            elements: {
                loginContainer: 'loginContainer',
                contractSelectionContainer: 'contractSelectionContainer',
                calculatorContainer: 'calculatorContainer',
                loginBtn: 'loginBtn',
                usernameInput: 'username',
                passwordInput: 'password',
                loginError: 'loginError',
                newContractCard: 'newContractCard',
                extensionCard: 'extensionCard',
                backToContractSelection: 'backToContractSelection'
            },
            
            // Session storage key
            sessionKey: 'isLoggedIn',
            
            // Testing mode (bypasses actual login)
            testMode: config.testMode || true
        };
        
        this.elements = {};
        this.isInitialized = false;
        this.onLoginSuccess = null;
    }

    /**
     * Initialize login manager
     * @param {Function} onLoginSuccess - Callback function to execute on successful login
     */
    initialize(onLoginSuccess) {
        if (this.isInitialized) {
            console.warn('LoginManager already initialized');
            return;
        }

        this.onLoginSuccess = onLoginSuccess;
        this.cacheElements();
        
        // Check if user is already logged in
        if (this.isLoggedIn()) {
            this.showContractSelection();
            if (this.onLoginSuccess) {
                this.onLoginSuccess();
            }
            console.log('User restored from session');
            return;
        }

        // Setup login form
        this.setupLoginForm();
        this.setupContractSelection();
        this.showLogin();
        
        this.isInitialized = true;
        console.log('LoginManager initialized successfully');
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        Object.entries(this.config.elements).forEach(([key, id]) => {
            this.elements[key] = document.getElementById(id);
            if (!this.elements[key]) {
                console.warn(`Element with ID '${id}' not found`);
            }
        });
    }

    /**
     * Setup login form event listeners
     */
    setupLoginForm() {
        if (!this.elements.loginBtn) {
            console.error('Login button not found');
            return;
        }

        // Login button click handler
        this.elements.loginBtn.addEventListener('click', () => {
            this.handleLogin();
        });

        // Enter key support for password field
        if (this.elements.passwordInput) {
            this.elements.passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin();
                }
            });
        }

        // Enter key support for username field
        if (this.elements.usernameInput) {
            this.elements.usernameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin();
                }
            });
        }
    }

    /**
     * Setup contract selection event listeners
     */
    setupContractSelection() {
        if (!this.elements.newContractCard) {
            console.error('New contract card not found');
            return;
        }

        if (!this.elements.extensionCard) {
            console.error('Extension card not found');
            return;
        }

        // New contract card click handler
        this.elements.newContractCard.addEventListener('click', () => {
            this.showCalculator();
        });

        // Extension card click handler
        this.elements.extensionCard.addEventListener('click', () => {
            this.showCalculator();
        });

        // Back to contract selection button click handler
        if (this.elements.backToContractSelection) {
            this.elements.backToContractSelection.addEventListener('click', () => {
                this.showContractSelection();
            });
        }
    }

    /**
     * Handle login attempt
     */
    handleLogin() {
        if (this.config.testMode) {
            // Testing mode - bypass actual login
            this.processSuccessfulLogin();
            console.log('Login bypassed (test mode)');
            return;
        }

        // Get credentials
        const username = this.elements.usernameInput?.value || '';
        const password = this.elements.passwordInput?.value || '';

        // Validate credentials
        if (this.validateCredentials(username, password)) {
            this.processSuccessfulLogin();
        } else {
            this.showLoginError();
        }
    }

    /**
     * Validate user credentials
     * @param {string} username - Entered username
     * @param {string} password - Entered password
     * @returns {boolean} True if credentials are valid
     */
    validateCredentials(username, password) {
        return username === this.config.username && password === this.config.password;
    }

    /**
     * Process successful login
     */
    processSuccessfulLogin() {
        // Set session
        this.setSession();
        
        // Hide login, show contract selection
        this.showContractSelection();
        
        // Clear any error messages
        this.hideLoginError();
        
        // Execute success callback
        if (this.onLoginSuccess) {
            this.onLoginSuccess();
        }
        
        console.log('Login successful');
    }

    /**
     * Show login container
     */
    showLogin() {
        if (this.elements.loginContainer) {
            this.elements.loginContainer.classList.remove('hidden');
        }
        if (this.elements.contractSelectionContainer) {
            this.elements.contractSelectionContainer.classList.add('hidden');
        }
        if (this.elements.calculatorContainer) {
            this.elements.calculatorContainer.classList.add('hidden');
        }
    }

    /**
     * Show contract selection container
     */
    showContractSelection() {
        if (this.elements.loginContainer) {
            this.elements.loginContainer.classList.add('hidden');
        }
        if (this.elements.contractSelectionContainer) {
            this.elements.contractSelectionContainer.classList.remove('hidden');
        }
        if (this.elements.calculatorContainer) {
            this.elements.calculatorContainer.classList.add('hidden');
        }
    }

    /**
     * Show calculator container
     */
    showCalculator() {
        if (this.elements.loginContainer) {
            this.elements.loginContainer.classList.add('hidden');
        }
        if (this.elements.contractSelectionContainer) {
            this.elements.contractSelectionContainer.classList.add('hidden');
        }
        if (this.elements.calculatorContainer) {
            this.elements.calculatorContainer.classList.remove('hidden');
        }
    }

    /**
     * Show login error message
     */
    showLoginError() {
        if (this.elements.loginError) {
            this.elements.loginError.style.display = 'block';
            this.elements.loginError.textContent = 'Nieprawidłowa nazwa użytkownika lub hasło';
        }
    }

    /**
     * Hide login error message
     */
    hideLoginError() {
        if (this.elements.loginError) {
            this.elements.loginError.style.display = 'none';
        }
    }

    /**
     * Set user session
     */
    setSession() {
        try {
            sessionStorage.setItem(this.config.sessionKey, 'true');
        } catch (error) {
            console.error('Error setting session:', error);
        }
    }

    /**
     * Check if user is logged in
     * @returns {boolean} True if user is logged in
     */
    isLoggedIn() {
        try {
            return sessionStorage.getItem(this.config.sessionKey) === 'true';
        } catch (error) {
            console.error('Error checking session:', error);
            return false;
        }
    }

    /**
     * Logout user
     */
    logout() {
        try {
            // Clear session
            sessionStorage.removeItem(this.config.sessionKey);
            
            // Show login form
            this.showLogin();
            
            // Clear form fields
            this.clearLoginForm();
            
            console.log('User logged out successfully');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    /**
     * Clear login form fields
     */
    clearLoginForm() {
        if (this.elements.usernameInput) {
            this.elements.usernameInput.value = '';
        }
        if (this.elements.passwordInput) {
            this.elements.passwordInput.value = '';
        }
        this.hideLoginError();
    }

    /**
     * Update configuration
     * @param {Object} newConfig - New configuration options
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Enable/disable test mode
     * @param {boolean} enabled - Whether to enable test mode
     */
    setTestMode(enabled) {
        this.config.testMode = enabled;
        console.log(`Test mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Force login (for testing purposes)
     */
    forceLogin() {
        this.processSuccessfulLogin();
        console.log('Force login executed');
    }

    /**
     * Get current session status
     * @returns {Object} Session information
     */
    getSessionInfo() {
        return {
            isLoggedIn: this.isLoggedIn(),
            sessionKey: this.config.sessionKey,
            testMode: this.config.testMode
        };
    }

    /**
     * Cleanup - remove event listeners
     */
    cleanup() {
        // Note: In a production app, you'd want to store references to event listeners
        // to properly remove them. For now, we'll just reset the initialization flag.
        this.isInitialized = false;
        console.log('LoginManager cleaned up');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginManager;
} else if (typeof window !== 'undefined') {
    window.LoginManager = LoginManager;
}