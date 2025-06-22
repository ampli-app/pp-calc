/**
 * ButtonManager Module
 * Handles all button visibility, states and interactions
 * Manages navigation buttons, action buttons, and their logic
 */
class ButtonManager {
    constructor(dependencies = {}) {
        this.dependencies = dependencies;
        this.config = {
            // Button IDs
            buttons: {
                prev: 'prevBtn',
                next: 'nextBtn',
                calculate: 'calculate',
                editData: 'editDataBtn',
                generatePDF: 'generatePDF',
                exportCSV: 'exportCSV',
                toggleSchedule: 'toggleSchedule'
            },
            
            // Container IDs
            containers: {
                results: 'results',
                formContainer: '.form-container',
                scheduleContainer: 'scheduleContainer'
            },
            
            // Step configuration
            totalSteps: 3,
            
            // Button texts
            texts: {
                showSchedule: 'Pokaż harmonogram wypłat',
                hideSchedule: 'Ukryj harmonogram wypłat',
                editData: 'Zmień dane',
                calculate: 'Oblicz'
            }
        };
        
        this.currentStep = 1;
        this.isResultsVisible = false;
        this.isInitialized = false;
        this.eventListeners = [];
    }

    /**
     * Initialize button manager
     * @param {Object} dependencies - Required dependencies
     */
    initialize(dependencies = {}) {
        if (this.isInitialized) {
            console.warn('ButtonManager already initialized');
            return;
        }

        this.dependencies = { ...this.dependencies, ...dependencies };
        
        this.setupNavigationButtons();
        this.setupActionButtons();
        this.detectCurrentState();
        this.updateButtonVisibility();
        
        this.isInitialized = true;
        console.log('ButtonManager initialized successfully');
    }

    /**
     * Setup navigation buttons (prev, next, calculate)
     */
    setupNavigationButtons() {
        // Previous button
        this.addEventListenerWithTracking(
            this.config.buttons.prev,
            'click',
            () => this.handlePreviousStep()
        );

        // Next button
        this.addEventListenerWithTracking(
            this.config.buttons.next,
            'click',
            () => this.handleNextStep()
        );

        // Calculate button
        this.addEventListenerWithTracking(
            this.config.buttons.calculate,
            'click',
            () => this.handleCalculate()
        );

        // Edit data button
        this.addEventListenerWithTracking(
            this.config.buttons.editData,
            'click',
            () => this.handleEditData()
        );
    }

    /**
     * Setup action buttons (PDF, CSV, toggle schedule)
     */
    setupActionButtons() {
        // PDF generation button
        this.addEventListenerWithTracking(
            this.config.buttons.generatePDF,
            'click',
            () => this.handleGeneratePDF()
        );

        // CSV export button
        this.addEventListenerWithTracking(
            this.config.buttons.exportCSV,
            'click',
            () => this.handleExportCSV()
        );

        // Toggle schedule button
        this.addEventListenerWithTracking(
            this.config.buttons.toggleSchedule,
            'click',
            () => this.handleToggleSchedule()
        );
    }

    /**
     * Add event listener and keep track for cleanup
     */
    addEventListenerWithTracking(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        } else {
            console.warn(`Button element '${elementId}' not found`);
        }
    }

    /**
     * Handle previous step navigation
     */
    handlePreviousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.navigateToStep(this.currentStep);
            console.log(`Navigated to step ${this.currentStep}`);
        }
    }

    /**
     * Handle next step navigation
     */
    handleNextStep() {
        if (this.currentStep < this.config.totalSteps) {
            if (this.validateCurrentStep()) {
                this.currentStep++;
                this.navigateToStep(this.currentStep);
                console.log(`Navigated to step ${this.currentStep}`);
            }
        }
    }

    /**
     * Handle calculate button click
     */
    handleCalculate() {
        if (this.validateCurrentStep()) {
            // Call calculator function (dependency injection)
            if (this.dependencies.calculator && typeof this.dependencies.calculator.calculate === 'function') {
                this.dependencies.calculator.calculate();
            } else if (typeof calculateResults === 'function') {
                // Fallback to global function
                calculateResults();
            } else {
                console.error('Calculator function not available');
                return;
            }
            
            // Show results
            this.showResults();
            
            // Hide the calculate button after successful calculation
            const calculateBtn = document.getElementById(this.config.buttons.calculate);
            if (calculateBtn) {
                calculateBtn.style.display = 'none';
            }
            
            console.log('Calculation completed and results shown');
        }
    }

    /**
     * Handle PDF generation
     */
    handleGeneratePDF() {
        try {
            if (this.dependencies.pdfGenerator && typeof this.dependencies.pdfGenerator.generate === 'function') {
                this.dependencies.pdfGenerator.generate();
            } else if (typeof generatePdfmakePDF === 'function') {
                // Fallback to global function
                generatePdfmakePDF();
            } else {
                console.error('PDF generator not available');
                alert('Funkcja generowania PDF nie jest dostępna.');
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Wystąpił błąd podczas generowania PDF.');
        }
    }

    /**
     * Handle CSV export
     */
    handleExportCSV() {
        try {
            if (this.dependencies.csvExporter && typeof this.dependencies.csvExporter.export === 'function') {
                this.dependencies.csvExporter.export();
            } else if (typeof exportToCSV === 'function') {
                // Fallback to global function
                exportToCSV();
            } else {
                console.error('CSV exporter not available');
                alert('Funkcja eksportu CSV nie jest dostępna.');
            }
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Wystąpił błąd podczas eksportu CSV.');
        }
    }

    /**
     * Handle schedule toggle
     */
    handleToggleSchedule() {
        const scheduleContainer = document.getElementById(this.config.containers.scheduleContainer);
        const toggleBtn = document.getElementById(this.config.buttons.toggleSchedule);
        
        if (!scheduleContainer || !toggleBtn) {
            console.warn('Schedule container or toggle button not found');
            return;
        }

        scheduleContainer.classList.toggle('visible');
        
        if (scheduleContainer.classList.contains('visible')) {
            toggleBtn.textContent = this.config.texts.hideSchedule;
        } else {
            toggleBtn.textContent = this.config.texts.showSchedule;
        }

        // Save state if autoSave is available
        if (this.dependencies.autoSave && typeof this.dependencies.autoSave.saveFormData === 'function') {
            this.dependencies.autoSave.saveFormData();
        }

        console.log('Schedule visibility toggled');
    }

    /**
     * Navigate to specific step
     * @param {number} stepNumber - Step to navigate to
     */
    navigateToStep(stepNumber) {
        // Remove active class from all steps
        document.querySelectorAll('.progress-step').forEach(step => {
            step.classList.remove('active');
        });
        document.querySelectorAll('.form-step').forEach(section => {
            section.classList.remove('active');
        });
        
        // Add active class to target step
        const targetStep = document.querySelector(`.progress-step[data-step="${stepNumber}"]`);
        const targetSection = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        
        if (targetStep) targetStep.classList.add('active');
        if (targetSection) targetSection.classList.add('active');
        
        this.currentStep = stepNumber;
        this.updateButtonVisibility();

        // Save state if autoSave is available
        if (this.dependencies.autoSave && typeof this.dependencies.autoSave.saveFormData === 'function') {
            this.dependencies.autoSave.saveFormData();
        }
    }

    /**
     * Show results and hide form
     */
    showResults() {
        const resultsDiv = document.getElementById(this.config.containers.results);
        const formContainer = document.querySelector(this.config.containers.formContainer);
        
        if (resultsDiv) {
            resultsDiv.classList.remove('hidden');
        }
        
        if (formContainer) {
            formContainer.style.display = 'none';
        }
        
        this.isResultsVisible = true;
        this.updateButtonVisibility();
    }

    /**
     * Hide results and show form
     */
    hideResults() {
        const resultsDiv = document.getElementById(this.config.containers.results);
        
        if (resultsDiv) {
            resultsDiv.classList.add('hidden');
        }
        
        this.isResultsVisible = false;
        this.updateButtonVisibility();
    }

    /**
     * Show form container
     */
    showForm() {
        const formContainer = document.querySelector(this.config.containers.formContainer);
        
        if (formContainer) {
            formContainer.style.display = 'block';
        }
    }

    /**
     * Update button visibility based on current state
     */
    updateButtonVisibility() {
        const buttons = {
            prev: document.getElementById(this.config.buttons.prev),
            next: document.getElementById(this.config.buttons.next),
            calculate: document.getElementById(this.config.buttons.calculate),
            editData: document.getElementById(this.config.buttons.editData)
        };

        if (this.isResultsVisible) {
            // Results view - hide navigation, show edit
            if (buttons.prev) buttons.prev.style.display = 'none';
            if (buttons.next) buttons.next.style.display = 'none';
            if (buttons.calculate) buttons.calculate.style.display = 'none';
            if (buttons.editData) buttons.editData.style.display = 'inline-block';
        } else {
            // Form view - show appropriate navigation buttons
            if (buttons.editData) buttons.editData.style.display = 'none';
            
            // Previous button - show if not on first step
            if (buttons.prev) {
                buttons.prev.style.display = this.currentStep > 1 ? 'inline-block' : 'none';
            }
            
            // Next button - show if not on last step
            if (buttons.next) {
                buttons.next.style.display = this.currentStep < this.config.totalSteps ? 'inline-block' : 'none';
            }
            
            // Calculate button - show only on last step
            if (buttons.calculate) {
                buttons.calculate.style.display = this.currentStep === this.config.totalSteps ? 'inline-block' : 'none';
            }
        }

        console.log(`Button visibility updated - Step: ${this.currentStep}, Results: ${this.isResultsVisible}`);
    }

    /**
     * Detect current state from DOM
     */
    detectCurrentState() {
        // Detect current step
        const activeStep = document.querySelector('.progress-step.active');
        if (activeStep) {
            this.currentStep = parseInt(activeStep.getAttribute('data-step')) || 1;
        }

        // Detect if results are visible
        const resultsDiv = document.getElementById(this.config.containers.results);
        this.isResultsVisible = resultsDiv && !resultsDiv.classList.contains('hidden');

        console.log(`Current state detected - Step: ${this.currentStep}, Results: ${this.isResultsVisible}`);
    }

    /**
     * Validate current step before proceeding
     * @returns {boolean} True if current step is valid
     */
    validateCurrentStep() {
        // Basic validation - can be extended
        const currentSection = document.querySelector(`.form-step[data-step="${this.currentStep}"].active`);
        if (!currentSection) {
            console.warn('Current step section not found');
            return false;
        }

        // Check required fields in current step
        const requiredFields = currentSection.querySelectorAll('input[required], select[required]');
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                field.focus();
                alert(`Proszę wypełnić pole: ${field.previousElementSibling?.textContent || field.name || 'wymagane pole'}`);
                return false;
            }
        }

        return true;
    }

    /**
     * Set current step manually
     * @param {number} stepNumber - Step number to set
     */
    setCurrentStep(stepNumber) {
        if (stepNumber >= 1 && stepNumber <= this.config.totalSteps) {
            this.navigateToStep(stepNumber);
        } else {
            console.warn(`Invalid step number: ${stepNumber}`);
        }
    }

    /**
     * Get current state
     * @returns {Object} Current state information
     */
    getCurrentState() {
        return {
            currentStep: this.currentStep,
            isResultsVisible: this.isResultsVisible,
            totalSteps: this.config.totalSteps
        };
    }

    /**
     * Force refresh button states
     */
    refresh() {
        this.detectCurrentState();
        this.updateButtonVisibility();
        console.log('ButtonManager refreshed');
    }

    /**
     * Cleanup - remove all event listeners
     */
    cleanup() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        this.isInitialized = false;
        console.log('ButtonManager cleaned up');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ButtonManager;
} else if (typeof window !== 'undefined') {
    window.ButtonManager = ButtonManager;
}