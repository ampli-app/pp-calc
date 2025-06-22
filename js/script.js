// Main application entry point
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Global instances
let loginManager;
let autoSave;
let buttonManager;

// Auto-save configuration (moved to AutoSave class later)
const AUTOSAVE_CONFIG = {
    storageKey: 'plenti_calculator_data',
    fieldsToSave: [
        'companyName',
        'taxForm',
        'taxRate',
        'transferDate',
        'capital',
        'months',
        'settlement',
        'baseInterestRate',
        'interestRate',
        'finalPayment'
    ]
};

function initializeApp() {
    // Initialize LoginManager
    loginManager = new LoginManager({
        testMode: true, // Set to false for production
        username: 'admin',
        password: 'password123'
    });

    // Initialize login with success callback
    loginManager.initialize(() => {
        onLoginSuccess();
    });
}

/**
 * Called when login is successful
 */
function onLoginSuccess() {
    console.log('Login successful - initializing calculator...');
    
    // Initialize ButtonManager first (before loading data)
    buttonManager = new ButtonManager();
    
    // Load saved data after showing calculator
    setTimeout(() => {
        loadFormData(); // TODO: Move to AutoSave module
        setupAutoSave(); // TODO: Move to AutoSave module
        addHeaderLogoutButton(); // Keep for now, will move to HeaderManager
        
        // Initialize ButtonManager after DOM is ready
        buttonManager.initialize({
            autoSave: { saveFormData }, // Pass legacy function for now
            calculator: { calculate: calculateResults }, // Pass global function
            pdfGenerator: { generate: generatePdfmakePDF }, // Pass global function
            csvExporter: { export: exportToCSV } // Pass global function
        });
    }, 100);
    
    // Initialize calculator
    const calculator = initializeCalculator();
    calculator.addCSVExportButton();
    
    console.log('Calculator initialized successfully');
}

// Legacy functions - these will be moved to appropriate modules later

// Auto-save functions (TODO: Move to AutoSave.js)
function saveFormData() {
    const formData = {};

    AUTOSAVE_CONFIG.fieldsToSave.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            formData[fieldId] = element.value;
        }
    });

    // Save current step
    const activeStep = document.querySelector('.progress-step.active');
    if (activeStep) {
        formData.currentStep = activeStep.getAttribute('data-step');
    }

    // Save results and schedule
    const resultsDiv = document.getElementById('results');
    if (resultsDiv && !resultsDiv.classList.contains('hidden')) {
        formData.resultsVisible = true;
        formData.resultsData = {};
        const resultIds = [
            'transferDateDisplay', 'capitalAmount', 'contractPeriod',
            'interestRateValue', 'settlementType', 'totalPayments',
            'partnerMargin', 'totalMarginPercent'
        ];
        resultIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                formData.resultsData[id] = el.innerHTML;
            }
        });

        const scheduleBody = document.getElementById('scheduleBody');
        if (scheduleBody) {
            formData.scheduleHtml = scheduleBody.innerHTML;
        }

        const scheduleContainer = document.getElementById('scheduleContainer');
        if (scheduleContainer) {
            formData.scheduleVisible = scheduleContainer.classList.contains('visible');
        }

    } else {
        formData.resultsVisible = false;
    }

    localStorage.setItem(AUTOSAVE_CONFIG.storageKey, JSON.stringify(formData));
    console.log('Dane zapisane automatycznie');
}

function loadFormData() {
    const savedData = localStorage.getItem(AUTOSAVE_CONFIG.storageKey);
    if (!savedData) return;

    try {
        const formData = JSON.parse(savedData);

        // Restore form fields
        AUTOSAVE_CONFIG.fieldsToSave.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element && formData[fieldId]) {
                element.value = formData[fieldId];
                if (fieldId === 'taxForm') {
                    element.dispatchEvent(new Event('change'));
                }
            }
        });

        // Restore results if they were visible
        if (formData.resultsVisible && formData.resultsData) {
            const resultsDiv = document.getElementById('results');
            if (resultsDiv) {
                resultsDiv.classList.remove('hidden');
            }

            const resultIds = [
                'transferDateDisplay', 'capitalAmount', 'contractPeriod',
                'interestRateValue', 'settlementType', 'totalPayments',
                'partnerMargin', 'totalMarginPercent'
            ];
            resultIds.forEach(id => {
                const el = document.getElementById(id);
                if (el && formData.resultsData[id]) {
                    el.innerHTML = formData.resultsData[id];
                }
            });

            if (formData.scheduleHtml) {
                const scheduleBody = document.getElementById('scheduleBody');
                if (scheduleBody) {
                    scheduleBody.innerHTML = formData.scheduleHtml;
                }
            }

            if (formData.scheduleVisible) {
                const scheduleContainer = document.getElementById('scheduleContainer');
                if (scheduleContainer) {
                    scheduleContainer.classList.add('visible');
                }
                const toggleBtn = document.getElementById('toggleSchedule');
                if (toggleBtn) toggleBtn.textContent = 'Ukryj harmonogram wypłat';
            }
        }

        // Restore current step if saved - ButtonManager will handle this
        if (formData.currentStep && buttonManager) {
            buttonManager.setCurrentStep(parseInt(formData.currentStep));
        }

        console.log('Dane przywrócone z localStorage');
    } catch (error) {
        console.error('Błąd podczas przywracania danych:', error);
    }
}

function setupAutoSave() {
    // Add event listeners to all form fields
    AUTOSAVE_CONFIG.fieldsToSave.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            // Save on input change
            element.addEventListener('input', saveFormData);
            element.addEventListener('change', saveFormData);
        }
    });
    
    // Save step changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'class' &&
                (mutation.target.classList.contains('progress-step') || 
                 mutation.target.classList.contains('form-step'))) {
                saveFormData();
            }
        });
    });
    
    // Observe progress steps and form steps for changes
    document.querySelectorAll('.progress-step, .form-step').forEach(element => {
        observer.observe(element, { attributes: true });
    });
    
    // Also observe results div to save when it becomes visible
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) {
        observer.observe(resultsDiv, { attributes: true });
    }
    
    console.log('Auto-save skonfigurowany');
}

function clearSavedData() {
    localStorage.removeItem(AUTOSAVE_CONFIG.storageKey);
    console.log('Zapisane dane zostały wyczyszczone');
}

// Updated logout functionality - now uses LoginManager
function logout() {
    if (loginManager) {
        // Clear saved form data
        clearSavedData();
        // Use LoginManager logout
        loginManager.logout();
        // Reload page to ensure clean state
        location.reload();
    } else {
        console.error('LoginManager not available');
    }
}

// Header buttons (TODO: Move to HeaderManager)
function addHeaderLogoutButton() {
    const container = document.getElementById('calculatorContainer');
    if (container && !document.getElementById('headerLogoutBtn')) {
        // Stwórz kontener na przyciski
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = 'position: absolute; top: 10px; right: 10px; display: flex; gap: 10px;';
        
        // Przycisk czyszczenia danych
        const clearBtn = document.createElement('button');
        clearBtn.id = 'headerClearBtn';
        clearBtn.className = 'logout-icon-btn';
        clearBtn.title = 'Wyczyść dane';
        clearBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg><span>Wyczyść dane</span>`;
        
        clearBtn.addEventListener('click', function() {
            if (confirm('Czy na pewno chcesz wyczyścić wszystkie dane?')) {
                clearSavedData();
                location.reload();
            }
        });
        
        // Przycisk wylogowania
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'headerLogoutBtn';
        logoutBtn.className = 'logout-icon-btn';
        logoutBtn.title = 'Wyloguj';
        logoutBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg><span>Wyloguj</span>`;
        
        logoutBtn.addEventListener('click', function() {
            if (confirm('Czy na pewno chcesz się wylogować?')) {
                logout();
            }
        });
        
        // Dodaj przyciski do kontenera
        buttonsContainer.appendChild(clearBtn);
        buttonsContainer.appendChild(logoutBtn);
        
        container.style.position = 'relative';
        container.prepend(buttonsContainer);
    }
}

// Export functions (TODO: Move to CSVExporter and PDFGenerator)
function exportToCSV() {
    const scheduleBody = document.getElementById('scheduleBody');
    if (!scheduleBody) return;
    
    let csvContent = "Nr raty,Data płatności,Kwota netto (zł),Podatek (zł),Kwota brutto (zł)\n";
    
    Array.from(scheduleBody.children).forEach(row => {
        const cells = Array.from(row.children);
        const rowData = cells.map(cell => {
            let text = cell.textContent.trim();
            // Clean text from bonus information for CSV
            text = text.replace(/\(w tym bonus.*?\)/g, '');
            text = text.replace(/\(bonus\)/g, '');
            return `"${text}"`;
        });
        csvContent += rowData.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `harmonogram_wyplat_${Utils.getTimestamp()}.csv`;
    link.click();
}

// Legacy PDF generation function (TODO: Move to PDFGenerator.js)
function generatePdfmakePDF() {
    const companyNameInput = document.getElementById('companyName');
    const companyName = companyNameInput ? companyNameInput.value.trim() : '';
    
    const infoData = [
        ['Data startu:', document.getElementById('startDate')?.textContent || '---'],
        ['Kapitał własny:', document.getElementById('capitalAmount')?.textContent || '---'],
        ['Okres umowy:', document.getElementById('contractPeriod')?.textContent || '---'],
        ['Stopa procentowa:', document.getElementById('interestRateValue')?.textContent || '---'],
        ['Rozliczenie:', document.getElementById('settlementType')?.textContent || '---'],
        ['Forma opodatkowania:', document.getElementById('taxForm')?.value === 'ryczalt' ? 'Ryczałt' : 'Liniowy'],
        ['Stawka podatku:', document.getElementById('taxRate')?.value + '%' || '---']
    ];

    const scheduleBody = document.getElementById('scheduleBody');
    if (!scheduleBody || scheduleBody.children.length === 0) {
        alert('Harmonogram nie został jeszcze wygenerowany.');
        return;
    }

    const tableRows = [];
    // Table headers
    tableRows.push([
        { text: 'Nr raty', style: 'tableHeader' },
        { text: 'Data', style: 'tableHeader' },
        { text: 'Kwota netto (zł)', style: 'tableHeader' },
        { text: 'Podatek (zł)', style: 'tableHeader' },
        { text: 'Kwota brutto (zł)', style: 'tableHeader' }
    ]);

    // Table data
    Array.from(scheduleBody.children).forEach(row => {
        const cells = Array.from(row.children);
        const rowData = cells.map((cell, index) => {
            let text = cell.textContent.trim();
            let style = 'tableCell';

            if (row.classList.contains('bonus-month')) {
                style = 'bonusCell';
            }

            // Special formatting for amount column with bonus
            if (index === 2 && text.includes('(w tym bonus')) {
                const parts = text.split('(w tym bonus');
                return { 
                    text: [
                        parts[0].trim(), 
                        { text: '\n(w tym bonus' + parts[1], fontSize: 7, color: '#0ea5e9' }
                    ], 
                    style: style 
                };
            } else if (index === 2 && text.includes('(bonus)')) {
                return { 
                    text: [
                        text.replace('(bonus)', '').trim(), 
                        { text: '\n(bonus)', fontSize: 7, color: '#0ea5e9' }
                    ], 
                    style: style 
                };
            }
            
            return { text: text, style: style };
        });
        tableRows.push(rowData);
    });

    const docDefinition = {
        content: [
            // Logo temporarily disabled
            null,
            { text: 'Harmonogram Wypłat Partnerów', style: 'header', alignment: 'center' },
            {
                text: `Wygenerowano: ${new Date().toLocaleDateString('pl-PL', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}`,
                style: 'subheader',
                alignment: 'center',
                margin: [0, 0, 0, 20]
            },
            { text: 'Warunki współpracy', style: 'sectionHeader', margin: [0, 10, 0, 10] },
            {
                columns: [
                    {
                        width: '50%',
                        ul: infoData.filter((_, i) => i % 2 === 0).map(item => ({ 
                            text: [{ text: item[0], bold: true }, ` ${item[1]}`], 
                            margin: [0, 2] 
                        }))
                    },
                    {
                        width: '50%',
                        ul: infoData.filter((_, i) => i % 2 !== 0).map(item => ({ 
                            text: [{ text: item[0], bold: true }, ` ${item[1]}`], 
                            margin: [0, 2] 
                        }))
                    }
                ],
                columnGap: 20,
                margin: [0, 0, 0, 20]
            },
            { text: 'Harmonogram płatności', style: 'sectionHeader', margin: [0, 10, 0, 10] },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', '*', 'auto', '*'],
                    body: tableRows
                },
                layout: {
                    fillColor: function (rowIndex, node, columnIndex) {
                        if (rowIndex === 0) return '#F1F5F9';
                        const originalRow = scheduleBody.children[rowIndex - 1];
                        if (originalRow && originalRow.classList.contains('bonus-month')) {
                            return '#E0F2F7';
                        }
                        return (rowIndex % 2 === 0) ? '#FCFDFE' : null;
                    },
                    hLineWidth: function (i, node) { return (i === 0 || i === node.table.body.length) ? 0 : 0.5; },
                    vLineWidth: function (i, node) { return 0; },
                    hLineColor: function (i, node) { return '#E2E8F0'; },
                    paddingLeft: function(i, node) { return 5; },
                    paddingRight: function(i, node) { return 5; },
                    paddingTop: function(i, node) { return 8; },
                    paddingBottom: function(i, node) { return 8; }
                }
            }
        ].filter(Boolean),
        styles: {
            header: {
                fontSize: 22,
                bold: true,
                color: '#090d2e',
                margin: [0, 0, 0, 10]
            },
            subheader: {
                fontSize: 10,
                color: '#64748b',
            },
            sectionHeader: {
                fontSize: 14,
                bold: true,
                color: '#090d2e',
            },
            tableHeader: {
                bold: true,
                fontSize: 9,
                color: '#475569',
                alignment: 'left',
                fillColor: '#F1F5F9',
                margin: [0,0,0,0]
            },
            tableCell: {
                fontSize: 8,
                color: '#1e293b',
                alignment: 'left',
                margin: [0,0,0,0]
            },
            bonusCell: {
                fontSize: 8,
                color: '#0ea5e9',
                bold: true,
                alignment: 'left',
                margin: [0,0,0,0]
            }
        },
        defaultStyle: {
            font: 'Roboto'
        }
    };

    // Generate filename
    const sanitizedCompanyName = Utils.sanitizeFilename(companyName);
    const filename = `${sanitizedCompanyName}_harmonogram_${Utils.getTimestamp()}.pdf`;

    // Generate PDF using pdfmake
    pdfMake.createPdf(docDefinition).download(filename);
}

// Wrapper function for global access (ButtonManager calls this)
function calculateResults() {
    // This function should call your existing calculator logic
    // For now, assuming it exists as a global function
    if (typeof window.calculateResults === 'function') {
        window.calculateResults();
    } else {
        console.error('calculateResults function not found');
    }
}