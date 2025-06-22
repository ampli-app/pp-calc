// Calculator Business Logic
class Calculator {
    constructor() {
        this.elements = {};
        this.currentStep = 1;
        this.initializeElements();
        this.bindEvents();
        this.goToStep(1); 
        this.calculateInterestRate();
    }

    initializeElements() {
        this.elements = {
            // Step navigation
            nextBtn: document.getElementById('nextBtn'),
            prevBtn: document.getElementById('prevBtn'),
            formSteps: document.querySelectorAll('.form-step'),
            progressSteps: document.querySelectorAll('.progress-step'),

            // Form inputs
            companyNameInput: document.getElementById('companyName'),
            taxFormSelect: document.getElementById('taxForm'),
            taxRateSelect: document.getElementById('taxRate'),
            transferDate: document.getElementById('transferDate'),
            capitalInput: document.getElementById('capital'),
            monthsSelect: document.getElementById('months'),
            settlementSelect: document.getElementById('settlement'),

            // Action buttons
            calculateBtn: document.getElementById('calculate'),
            toggleScheduleBtn: document.getElementById('toggleSchedule'),
            downloadPdfBtn: document.getElementById('downloadPdf'),
            exportCSVBtn: document.getElementById('exportCSV'),

            // Display elements
            scheduleContainer: document.getElementById('scheduleContainer'),
            resultsDiv: document.getElementById('results'),
            showCalculationsBtn: document.getElementById('showCalculations'),
            calculationDetails: document.getElementById('calculationDetails'),
            calculationStep: document.getElementById('calculationStep'),
        };

        if (this.elements.transferDate) {
            this.elements.transferDate.min = new Date().toISOString().split('T')[0];
        }
    }

    bindEvents() {
        // Step navigation
        this.elements.nextBtn.addEventListener('click', () => this.handleNext());
        this.elements.prevBtn.addEventListener('click', () => this.handlePrev());
        this.elements.progressSteps.forEach(step => {
            step.addEventListener('click', () => this.goToStep(parseInt(step.dataset.step)));
        });

        // Original event bindings
        if (this.elements.taxFormSelect) {
            this.elements.taxFormSelect.addEventListener('change', () => this.handleTaxFormChange());
        }
        if (this.elements.toggleScheduleBtn) {
            this.elements.toggleScheduleBtn.addEventListener('click', () => this.handleToggleSchedule());
        }
        if (this.elements.showCalculationsBtn) {
            this.elements.showCalculationsBtn.addEventListener('click', () => this.handleShowCalculations());
        }
        if (this.elements.calculateBtn) {
            this.elements.calculateBtn.addEventListener('click', () => this.handleCalculate());
        }
        if (this.elements.downloadPdfBtn) {
            this.elements.downloadPdfBtn.addEventListener('click', () => this.generatePDF());
        }
        if (this.elements.exportCSVBtn) {
            this.elements.exportCSVBtn.addEventListener('click', () => this.exportToCSV());
        }

        // Prevent decimal numbers in capital input
        const capitalInput = document.getElementById('capital');
        if (capitalInput) {
            capitalInput.addEventListener('input', (e) => {
                // Replace any non-digit characters
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }

        // Clear validation errors on input/change
        const fieldsToClear = [
            this.elements.companyNameInput,
            this.elements.taxFormSelect,
            this.elements.taxRateSelect,
            this.elements.transferDate,
            this.elements.capitalInput,
            this.elements.monthsSelect,
            this.elements.settlementSelect
        ];

        fieldsToClear.forEach(element => {
            if (element) {
                const eventType = (element.tagName.toLowerCase() === 'select' || element.type === 'date') ? 'change' : 'input';
                element.addEventListener(eventType, () => this._clearError(element));
            }
        });

        // Interest rate calculation triggers
        ['baseInterestRate', 'months', 'capital', 'settlement', 'taxForm', 'taxRate'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.calculateInterestRate());
            }
        });
    }

    handleNext() {
        let isStepValid = true;

        // Clear previous errors for the current step before re-validating
        this.elements.formSteps[this.currentStep - 1].querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('input-error');
        });
        this.elements.formSteps[this.currentStep - 1].querySelectorAll('.error-message').forEach(el => {
            el.remove();
        });

        if (this.currentStep === 1) {
            const fieldsToValidate = [
                { element: this.elements.companyNameInput, message: 'Pole Nazwa przedsiębiorstwa nie może być puste' },
                { element: this.elements.taxFormSelect, message: 'Proszę wybrać formę opodatkowania' },
                { element: this.elements.taxRateSelect, message: 'Proszę wybrać stawkę podatku' }
            ];
            fieldsToValidate.forEach(field => {
                if (!this._validateField(field.element, field.message)) {
                    isStepValid = false;
                }
            });
        } else if (this.currentStep === 2) {
            const fieldsToValidate = [
                { element: this.elements.transferDate, message: 'Proszę wybrać datę' },
                { element: this.elements.capitalInput, message: 'Proszę wprowadzić kapitał' },
                { element: this.elements.monthsSelect, message: 'Proszę wybrać okres' },
                { element: this.elements.settlementSelect, message: 'Proszę wybrać rodzaj rozliczenia' }
            ];
            fieldsToValidate.forEach(field => {
                if (!this._validateField(field.element, field.message)) {
                    isStepValid = false;
                }
            });
        }

        if (isStepValid && this.currentStep < this.elements.formSteps.length) {
            this.goToStep(this.currentStep + 1);
        }
    }

    handlePrev() {
        if (this.currentStep > 1) {
            this.goToStep(this.currentStep - 1);
        }
    }

    _clearError(element) {
        element.classList.remove('input-error');
        const parent = element.parentElement;
        let errorElement;

        if (parent.classList.contains('input-group')) {
            errorElement = parent.nextElementSibling;
        } else {
            errorElement = element.nextElementSibling;
        }

        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.remove();
        }
    }

    _validateField(element, errorMessage) {
        const value = element.value.trim();
        let error = null;

        if (value === '') {
            error = errorMessage;
        } else if (element.id === 'capital' && parseInt(value, 10) <= 0) {
            error = 'Kapitał własny musi być liczbą większą od zera.';
        }

        if (error) {
            element.classList.add('input-error');
            const errorElement = document.createElement('p');
            errorElement.textContent = error;
            errorElement.className = 'error-message';
            const parent = element.parentElement;
            if (parent.classList.contains('input-group')) {
                parent.after(errorElement);
            } else {
                element.after(errorElement);
            }
            return false;
        }
        return true;
    }

    goToStep(stepNumber) {
        this.currentStep = stepNumber;

        this.elements.formSteps.forEach(step => {
            step.classList.toggle('active', parseInt(step.dataset.step) === this.currentStep);
        });

        this.elements.progressSteps.forEach(step => {
            step.classList.toggle('active', parseInt(step.dataset.step) === this.currentStep);
        });

        this.elements.prevBtn.style.display = this.currentStep > 1 ? 'inline-block' : 'none';
        this.elements.nextBtn.style.display = this.currentStep < this.elements.formSteps.length ? 'inline-block' : 'none';
        this.elements.calculateBtn.style.display = this.currentStep === this.elements.formSteps.length ? 'inline-block' : 'none';
    }

    handleTaxFormChange() {
        const taxForm = this.elements.taxFormSelect.value;
        const taxRateSelect = this.elements.taxRateSelect;
        const taxRates = CONFIG.TAX_RATES[taxForm];

        // Enable or disable the tax rate select based on tax form selection
        taxRateSelect.disabled = !taxForm;

        taxRateSelect.innerHTML = ''; // Clear existing options

        // Add placeholder
        const placeholder = document.createElement('option');
        placeholder.value = "";
        placeholder.textContent = "Wybierz stawkę...";
        placeholder.disabled = true;
        placeholder.selected = true;
        taxRateSelect.appendChild(placeholder);

        if (taxRates) {
            taxRates.forEach(rate => {
                const option = document.createElement('option');
                option.value = rate.value;
                option.textContent = rate.text;
                taxRateSelect.appendChild(option);
            });
        }
        this.calculateInterestRate(); // Recalculate on change
    }

    handleToggleSchedule() {
        this.elements.toggleScheduleBtn.classList.toggle('open');
        if (this.elements.scheduleContainer) {
            this.elements.scheduleContainer.classList.toggle('open');
        } else {
            console.error('Element scheduleContainer is null');
            alert('Błąd: Kontener harmonogramu nie został znaleziony. Odśwież stronę.');
        }
        
        const isOpen = this.elements.toggleScheduleBtn.classList.contains('open');
        this.elements.toggleScheduleBtn.textContent = isOpen ? 'Ukryj harmonogram wypłat' : 'Pokaż harmonogram wypłat';
    }

    handleShowCalculations() {
        const calculationDetails = this.elements.calculationDetails;
        
        if (!calculationDetails) {
            console.error('Element calculationDetails is null');
            alert('Błąd: Sekcja obliczeń nie została znaleziona. Odśwież stronę.');
            return;
        }

        this.elements.showCalculationsBtn.classList.toggle('open');
        const isCurrentlyVisible = calculationDetails.style.display === 'block';
        
        if (isCurrentlyVisible) {
            calculationDetails.style.display = 'none';
            this.elements.showCalculationsBtn.textContent = 'Pokaż obliczenia';
        } else {
            this.displayCalculationDetails();
            calculationDetails.style.display = 'block';
            this.elements.showCalculationsBtn.textContent = 'Ukryj obliczenia';
        }
    }

    displayCalculationDetails() {
        const inputs = this.getCalculationInputs();
        if (!inputs.isValid) return;

        const multipliers = this.getMultipliers(inputs);
        const interestRate = this.calculateFinalInterestRate(inputs.baseInterestRate, multipliers);
        
        inputs.finalPaymentElement.value = multipliers.finalPaymentPercent;
        
        if (this.elements.calculationStep) {
            this.elements.calculationStep.textContent = `
                Bazowa stopa: ${inputs.baseInterestRate}%
                × Mnożnik okresu: ${multipliers.multiplierMonths.toFixed(8)}
                × Mnożnik kapitału: ${multipliers.multiplierCapital.toFixed(8)}
                × Mnożnik procentu spłaty: ${multipliers.multiplierFinalPayment}
                × Mnożnik częstotliwości: ${multipliers.multiplierFreq.toFixed(8)}
                = Stopa procentowa: ${interestRate.toFixed(8)}%
            `;
        }
    }

    handleCalculate() {
        const inputs = this.getPaymentCalculationInputs();
        if (!inputs.isValid) return;

        const schedule = this.calculatePaymentSchedule(inputs);
        this.displayResults(inputs, schedule);
        this.generateScheduleTable(schedule);
        this.showResults();
    }

    getCalculationInputs() {
        const elements = {
            baseInterestRateElement: document.getElementById('baseInterestRate'),
            monthsElement: document.getElementById('months'),
            capitalElement: document.getElementById('capital'),
            finalPaymentElement: document.getElementById('finalPayment'),
            settlementElement: document.getElementById('settlement'),
            taxFormElement: document.getElementById('taxForm')
        };

        // Validation
        const missingElements = Object.entries(elements).filter(([key, element]) => !element);
        if (missingElements.length > 0) {
            console.error('Missing elements:', missingElements);
            alert('Błąd: Jedno lub więcej pól formularza nie zostało znalezione. Sprawdź formularz lub odśwież stronę.');
            return { isValid: false };
        }

        return {
            isValid: true,
            baseInterestRate: parseFloat(elements.baseInterestRateElement.value) || 0,
            months: parseInt(elements.monthsElement.value) || 12,
            capital: parseFloat(elements.capitalElement.value) || 0,
            settlement: elements.settlementElement.value,
            taxForm: elements.taxFormElement.value,
            finalPaymentElement: elements.finalPaymentElement
        };
    }

    getPaymentCalculationInputs() {
        const elements = {
            transferDateElement: document.getElementById('transferDate'),
            capitalElement: document.getElementById('capital'),
            monthsElement: document.getElementById('months'),
            settlementElement: document.getElementById('settlement'),
            finalPaymentElement: document.getElementById('finalPayment'),
            interestRateElement: document.getElementById('interestRate'),
            taxRateElement: document.getElementById('taxRate')
        };

        // Validation
        const missingElements = Object.entries(elements).filter(([key, element]) => !element);
        if (missingElements.length > 0) {
            console.error('Missing elements:', missingElements);
            alert('Wprowadź poprawną datę, kapitał własny, stopę procentową, procent spłaty i stawkę podatku!');
            return { isValid: false };
        }

        const transferDate = new Date(elements.transferDateElement.value);
        const capital = parseFloat(elements.capitalElement.value) || 0;
        const months = parseInt(elements.monthsElement.value) || 12;
        const settlement = elements.settlementElement.value;
        const finalPaymentPercent = parseFloat(elements.finalPaymentElement.value) || 0;
        const interestRate = parseFloat(elements.interestRateElement.getAttribute('data-full-value') || elements.interestRateElement.value) || 0;
        const taxRate = parseFloat(elements.taxRateElement.value) || 0;

        // Data validation
        if (isNaN(transferDate.getTime()) || capital <= 0 || isNaN(interestRate) || isNaN(finalPaymentPercent) || isNaN(taxRate)) {
            alert('Wprowadź poprawną datę, kapitał własny, stopę procentową, procent spłaty i stawkę podatku!');
            return { isValid: false };
        }

        return {
            isValid: true,
            transferDate,
            capital,
            months,
            settlement,
            finalPaymentPercent,
            interestRate,
            taxRate
        };
    }

    getMultipliers(inputs) {
        // Get frequency multiplier from CONFIG
        const settlementConfig = CONFIG.SETTLEMENT[inputs.settlement] || CONFIG.SETTLEMENT.annual;
        const freq = settlementConfig.freq;
        const multiplierFreq = CONFIG.MULTIPLIERS.FREQUENCY[inputs.settlement] || CONFIG.MULTIPLIERS.FREQUENCY.annual;

        // Get months multiplier from CONFIG
        const multiplierMonths = CONFIG.MULTIPLIERS.MONTHS[inputs.months] || 1.0;

        // Get capital multiplier from CONFIG
        const multiplierCapital = this.getCapitalMultiplier(inputs.capital);

        // Get final payment percent from CONFIG
        const finalPaymentPercent = this.getFinalPaymentPercent(inputs.months, inputs.taxForm);

        return {
            freq,
            multiplierFreq,
            multiplierMonths,
            multiplierCapital,
            finalPaymentPercent,
            multiplierFinalPayment: CONFIG.MULTIPLIERS.FINAL_PAYMENT
        };
    }

    getCapitalMultiplier(capital) {
        const capitalRange = CONFIG.MULTIPLIERS.CAPITAL.find(range => 
            capital >= range.min && capital <= range.max
        );
        return capitalRange ? capitalRange.multiplier : 1.0000;
    }

    getFinalPaymentPercent(months, taxForm) {
        const monthConfig = CONFIG.FINAL_PAYMENT_PERCENT[months];
        if (!monthConfig) {
            return taxForm === 'liniowy' ? 25.0 : 60.0;
        }
        return monthConfig[taxForm] || (taxForm === 'liniowy' ? 25.0 : 60.0);
    }

    calculateFinalInterestRate(baseRate, multipliers) {
        return baseRate * multipliers.multiplierMonths * multipliers.multiplierCapital * 
               multipliers.multiplierFinalPayment * multipliers.multiplierFreq;
    }

    calculateInterestRate() {
        const inputs = this.getCalculationInputs();
        if (!inputs.isValid) return 0;

        const multipliers = this.getMultipliers(inputs);
        const interestRate = this.calculateFinalInterestRate(inputs.baseInterestRate, multipliers);
        
        // Update final payment percentage
        inputs.finalPaymentElement.value = multipliers.finalPaymentPercent;
        
        const interestRateElement = document.getElementById('interestRate');
        if (interestRateElement) {
            interestRateElement.value = interestRate.toFixed(2);
            interestRateElement.setAttribute('data-full-value', interestRate.toFixed(8));
        }
        
        return interestRate;
    }

    calculatePaymentSchedule(inputs) {
        const startDate = new Date(inputs.transferDate.getFullYear(), inputs.transferDate.getMonth() + 2, 0);
        const settlementConfig = CONFIG.SETTLEMENT[inputs.settlement];
        const freq = settlementConfig.freq;
        const numberOfPayments = Math.ceil(inputs.months / freq);
        
        const finalPaymentAmount = (inputs.capital * inputs.finalPaymentPercent) / 100;
        const adjustedRate = (inputs.interestRate / 100) / 12 * freq;
        const pv = -(inputs.capital - finalPaymentAmount);
        
        let paymentPerPeriod = 0;
        if (inputs.interestRate > 0) {
            paymentPerPeriod = Utils.pmt(adjustedRate, numberOfPayments, pv, 0);
        } else {
            paymentPerPeriod = -pv / numberOfPayments;
        }
        
        const interestOnFinalPayment = adjustedRate * finalPaymentAmount;
        const standardPayment = paymentPerPeriod + interestOnFinalPayment;
        
        // Bonus calculation
        const transferDay = inputs.transferDate.getDate();
        const isBonusApplicable = transferDay <= CONFIG.BONUS.DEADLINE_DAY;
        const bonusAmount = isBonusApplicable ? inputs.capital * CONFIG.BONUS.RATE : 0;
        
        const payments = this.generatePayments({
            startDate,
            settlement: inputs.settlement,
            freq,
            numberOfPayments,
            standardPayment,
            finalPaymentAmount,
            taxRate: inputs.taxRate,
            isBonusApplicable,
            bonusAmount,
            transferDate: inputs.transferDate
        });

        return {
            startDate,
            payments,
            settlementText: settlementConfig.text,
            totalPayments: payments.reduce((sum, payment) => sum + payment.amountNetto, 0),
            partnerMargin: null, // Will be calculated after total
            totalMarginPercent: null // Will be calculated after total
        };
    }

    generatePayments(params) {
        const {
            startDate, settlement, freq, numberOfPayments, standardPayment,
            finalPaymentAmount, taxRate, isBonusApplicable, bonusAmount, transferDate
        } = params;

        let payments = [];
        const bonusDate = new Date(startDate.getFullYear(), startDate.getMonth() + CONFIG.BONUS.MONTHS_DELAY, 0);
        
        // Calculate first payment date
        let firstPaymentCalculatedDate = this.calculateFirstPaymentDate(startDate, settlement, freq, transferDate);
        
        // Generate regular payments
        for (let i = 0; i < numberOfPayments; i++) {
            const paymentDate = new Date(
                firstPaymentCalculatedDate.getFullYear(),
                firstPaymentCalculatedDate.getMonth() + (i * freq) + 1,
                0
            );
            
            let currentPaymentAmountNetto;
            const isLastPayment = i === numberOfPayments - 1;
            
            if (isLastPayment) {
                currentPaymentAmountNetto = standardPayment + finalPaymentAmount;
            } else {
                currentPaymentAmountNetto = standardPayment;
            }

            const taxAmount = (currentPaymentAmountNetto * taxRate) / 100;
            
            // Add bonus for monthly and quarterly
            const isBonusMonth = isBonusApplicable && 
                ((settlement === 'monthly' && i === 2) || 
                (settlement === 'quarterly' && i === 0));
            
            if (isBonusMonth) {
                currentPaymentAmountNetto += bonusAmount;
            }

            payments.push({
                date: paymentDate,
                amountNetto: currentPaymentAmountNetto,
                taxAmount: taxAmount,
                isLast: isLastPayment,
                isBonus: isBonusMonth,
                isBonusOnly: false
            });
        }
        
        // Add separate bonus payment for semiannual and annual
        if (isBonusApplicable && (settlement === 'semiannual' || settlement === 'annual')) {
            const bonusTaxAmount = (bonusAmount * taxRate) / 100;
            payments.push({
                date: bonusDate,
                amountNetto: bonusAmount,
                taxAmount: bonusTaxAmount,
                isLast: false,
                isBonus: true,
                isBonusOnly: true
            });
        }
        
        // Sort payments by date
        payments.sort((a, b) => a.date - b.date);
        
        return payments;
    }

    calculateFirstPaymentDate(startDate, settlement, freq, transferDate) {
        if (settlement === 'monthly') {
            return new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        } else {
            let currentMonth = transferDate.getMonth() + 1;
            let currentYear = transferDate.getFullYear();
            
            let nextPaymentMonth;
            if (settlement === 'quarterly') {
                nextPaymentMonth = Math.ceil(currentMonth / 3) * 3;
            } else if (settlement === 'semiannual') {
                nextPaymentMonth = Math.ceil(currentMonth / 6) * 6;
            } else if (settlement === 'annual') {
                // Dla rozliczeń rocznych - pierwsza wypłata dokładnie rok po transferze
                nextPaymentMonth = currentMonth;
                currentYear++; // Przesuwamy na następny rok
            }
    
            // Dla rozliczeń innych niż roczne - sprawdzamy czy nie minął już termin
            if (settlement !== 'annual' && nextPaymentMonth <= currentMonth) {
                currentYear++;
                if (settlement === 'semiannual') nextPaymentMonth = 6;
                else if (settlement === 'quarterly') nextPaymentMonth = 3;
            }
    
            // Tworzymy datę wypłaty (ostatni dzień miesiąca)
            let firstPaymentCalculatedDate = new Date(currentYear, nextPaymentMonth, 0);
            
            // Upewniamy się, że data wypłaty jest po startDate
            while(firstPaymentCalculatedDate <= startDate) {
                firstPaymentCalculatedDate.setMonth(firstPaymentCalculatedDate.getMonth() + freq);
                firstPaymentCalculatedDate.setDate(0);
            }
            
            return firstPaymentCalculatedDate;
        }
    }

    displayResults(inputs, schedule) {
        document.getElementById('transferDateDisplay').textContent = Utils.formatDate(inputs.transferDate);
        document.getElementById('capitalAmount').textContent = Utils.formatCurrency(inputs.capital);
        document.getElementById('contractPeriod').textContent = inputs.months + ' miesięcy';
        document.getElementById('interestRateValue').textContent = parseFloat(inputs.interestRate).toFixed(2) + '%';
        document.getElementById('settlementType').textContent = schedule.settlementText;
        
        // Calculate margins
        const partnerMargin = schedule.totalPayments - inputs.capital;
        const totalMarginPercent = (partnerMargin / inputs.capital) * 100;
        
        document.getElementById('totalPayments').textContent = Utils.formatCurrency(schedule.totalPayments);
        document.getElementById('partnerMargin').textContent = Utils.formatCurrency(partnerMargin);
        document.getElementById('totalMarginPercent').textContent = totalMarginPercent.toFixed(2) + '%';
    }

    generateScheduleTable(schedule) {
        const scheduleBody = document.getElementById('scheduleBody');
        if (!scheduleBody) {
            console.error('Element scheduleBody is null');
            alert('Błąd: Kontener harmonogramu nie został znaleziony. Odśwież stronę.');
            return;
        }

        scheduleBody.innerHTML = '';
        let paymentIndex = 1;
        
        // Calculate bonus amount from capital (not from payment amount)
        const capitalElement = document.getElementById('capital');
        const capital = parseFloat(capitalElement?.value) || 0;
        const bonusAmount = capital * CONFIG.BONUS.RATE;

        schedule.payments.forEach((payment, index) => {
            const row = document.createElement('tr');
            const currentPaymentAmountBrutto = payment.amountNetto * CONFIG.VAT_RATE;

            let displayPaymentNumber;
            if (payment.isBonusOnly) {
                displayPaymentNumber = '🎁 Bonus';
            } else if (payment.isBonus && !payment.isBonusOnly) {
                displayPaymentNumber = `🎁 ${paymentIndex}`;
            } else {
                displayPaymentNumber = paymentIndex;
            }

            if (!payment.isBonusOnly) {
                paymentIndex++;
            }
            
            row.innerHTML = `
                <td>${displayPaymentNumber}</td>
                <td>${Utils.formatDate(payment.date)}</td>
                <td>${Utils.formatCurrency(payment.amountNetto)}${payment.isBonus && !payment.isBonusOnly ? ' (bonus ' + Utils.formatCurrency(bonusAmount) + ')' : payment.isBonusOnly ? ' (bonus)' : ''}</td>
                <td>${Utils.formatCurrency(payment.taxAmount)}</td>
                <td>${Utils.formatCurrency(currentPaymentAmountBrutto)}</td>
            `;
            
            if(payment.isBonus) {
                row.classList.add('bonus-month');
            }

            scheduleBody.appendChild(row);
        });
    }

    showResults() {
        if (this.elements.resultsDiv) {
            this.elements.resultsDiv.classList.remove('hidden');
        }
        
        if (this.elements.toggleScheduleBtn) {
            this.elements.toggleScheduleBtn.classList.remove('open');
            this.elements.toggleScheduleBtn.textContent = 'Pokaż harmonogram wypłat';
        }
        
        if (this.elements.scheduleContainer) {
            this.elements.scheduleContainer.classList.remove('open');
        }
    }

    generatePDF() {
        PDFGenerator.generate(this.elements.companyNameInput.value.trim());
    }

    exportToCSV() {
        CSVExporter.exportToCSV();
    }



    addCSVExportButton() {
        const buttonRow = document.querySelector('.button-row-results');
        if (buttonRow && !document.getElementById('exportCSV')) {
            const csvButton = document.createElement('button');
            csvButton.id = 'exportCSV';
            csvButton.className = 'btn btn-secondary';
            csvButton.textContent = 'Eksportuj do CSV';
            csvButton.addEventListener('click', () => this.exportToCSV());
            buttonRow.appendChild(csvButton);
        }
    }
}

// Initialize calculator when DOM is ready
function initializeCalculator() {
    return new Calculator();
}