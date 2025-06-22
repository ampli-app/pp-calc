// Main application entry point
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    const loginContainer = document.getElementById('loginContainer');
    const calculatorContainer = document.getElementById('calculatorContainer');
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');

    // Initialize login functionality
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const username = usernameInput.value;
            const password = passwordInput.value;

            if (username === CONFIG.AUTH.USERNAME && password === CONFIG.AUTH.PASSWORD) {
                // Hide login, show calculator
                loginContainer.classList.add('hidden');
                calculatorContainer.classList.remove('hidden');
                
                // Initialize calculator after successful login
                const calculator = initializeCalculator();
                
                // Add CSV export button
                calculator.addCSVExportButton();
                
                console.log('Calculator initialized successfully');
            } else {
                loginError.style.display = 'block';
            }
        });
    } else {
        console.error('Login button not found');
    }
}

// Legacy PDF generation function (to be moved to PDFGenerator.js)
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

// Legacy CSV export function (to be moved to CSVExporter.js)
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