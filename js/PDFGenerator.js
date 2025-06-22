// PDF Generator Module
class PDFGenerator {
    static generate(companyName = '') {
        const infoData = this.collectInfoData();
        const scheduleBody = document.getElementById('scheduleBody');
        
        if (!this.validateSchedule(scheduleBody)) {
            return;
        }

        const tableRows = this.buildTableRows(scheduleBody);
        const docDefinition = this.createDocDefinition(infoData, tableRows, scheduleBody);
        const filename = this.generateFilename(companyName);

        // Generate PDF using pdfmake
        pdfMake.createPdf(docDefinition).download(filename);
    }

    static collectInfoData() {
        return [
            ['Data startu:', document.getElementById('startDate')?.textContent || '---'],
            ['Kapitał własny:', document.getElementById('capitalAmount')?.textContent || '---'],
            ['Okres umowy:', document.getElementById('contractPeriod')?.textContent || '---'],
            ['Stopa procentowa:', document.getElementById('interestRateValue')?.textContent || '---'],
            ['Rozliczenie:', document.getElementById('settlementType')?.textContent || '---'],
            ['Forma opodatkowania:', document.getElementById('taxForm')?.value === 'ryczalt' ? 'Ryczałt' : 'Liniowy'],
            ['Stawka podatku:', (document.getElementById('taxRate')?.value || '0') + '%']
        ];
    }

    static validateSchedule(scheduleBody) {
        if (!scheduleBody || scheduleBody.children.length === 0) {
            alert('Harmonogram nie został jeszcze wygenerowany.');
            return false;
        }
        return true;
    }

    static buildTableRows(scheduleBody) {
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

                // Apply bonus style if row has bonus-month class
                if (row.classList.contains('bonus-month')) {
                    style = 'bonusCell';
                }

                // Special formatting for amount column with bonus information
                if (index === 2) {
                    return this.formatAmountCell(text, style);
                }
                
                return { text: text, style: style };
            });
            tableRows.push(rowData);
        });

        return tableRows;
    }

    static formatAmountCell(text, style) {
        if (text.includes('(w tym bonus')) {
            const parts = text.split('(w tym bonus');
            return { 
                text: [
                    parts[0].trim(), 
                    { text: '\n(w tym bonus' + parts[1], fontSize: 7, color: '#0ea5e9' }
                ], 
                style: style 
            };
        } else if (text.includes('(bonus)')) {
            return { 
                text: [
                    text.replace('(bonus)', '').trim(), 
                    { text: '\n(bonus)', fontSize: 7, color: '#0ea5e9' }
                ], 
                style: style 
            };
        }
        
        return { text: text, style: style };
    }

    static createDocDefinition(infoData, tableRows, scheduleBody) {
        const totalPaymentsText = document.getElementById('totalPayments')?.textContent || '---';

        return {
            content: [
                // Logo section - conditionally included
                this.createLogoSection(),
                
                // Header
                { 
                    text: 'Harmonogram Wypłat Partnerów', 
                    style: 'header', 
                    alignment: 'center' 
                },
                
                // Timestamp and info section
                {
                    columns: [
                        { text: `Wygenerowano: ${this.getFormattedTimestamp()}`, style: 'subheader' },
                        { text: 'Dokument informacyjny', style: 'subheader', alignment: 'right' }
                    ],
                    margin: [0, 2, 0, 20]
                },

                // Basic Info
                { text: 'Podstawowe informacje - warunki współpracy', style: 'sectionHeader', margin: [0, 0, 0, 10] },
                this.createInfoColumns(infoData),

                // Payment table
                this.createPaymentTable(tableRows, scheduleBody),

                // Summary Section
                {
                    text: `Łącznie do wypłaty - kwota netto marża: ${totalPaymentsText}`,
                    style: 'summary',
                    alignment: 'right',
                    margin: [0, 20, 0, 0]
                },

                // Footer
                {
                    text: 'Powyższy harmonogram ma charakter informacyjny i nie stanowi oferty w rozumieniu przepisów Kodeksu Cywilnego.',
                    style: 'subheader',
                    alignment: 'center',
                    margin: [0, 40, 0, 0]
                }
            ],
            styles: this.getDocumentStyles(),
            defaultStyle: {
                font: 'Roboto'
            }
        };
    }

    static createLogoSection() {
        // Check if logo is available and valid
        if (CONFIG.COMPANY_LOGO_BASE64 && CONFIG.COMPANY_LOGO_BASE64 !== 'kod64') {
            return {
                image: CONFIG.COMPANY_LOGO_BASE64,
                width: 100,
                alignment: 'center',
                margin: [0, 0, 0, 20]
            };
        }
        return null; // No logo to display
    }

    static getFormattedTimestamp() {
        return new Date().toLocaleDateString('pl-PL', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static createInfoColumns(infoData) {
        return {
            columns: [
                {
                    width: '50%',
                    ul: infoData
                        .filter((_, i) => i % 2 === 0)
                        .map(item => ({ 
                            text: [{ text: item[0], bold: true }, ` ${item[1]}`], 
                            margin: [0, 2] 
                        }))
                },
                {
                    width: '50%',
                    ul: infoData
                        .filter((_, i) => i % 2 !== 0)
                        .map(item => ({ 
                            text: [{ text: item[0], bold: true }, ` ${item[1]}`], 
                            margin: [0, 2] 
                        }))
                }
            ],
            columnGap: 20,
            margin: [0, 0, 0, 20]
        };
    }

    static createPaymentTable(tableRows, scheduleBody) {
        return {
            table: {
                headerRows: 1,
                widths: ['auto', 'auto', '*', 'auto', '*'],
                body: tableRows
            },
            layout: {
                fillColor: (rowIndex, node, columnIndex) => {
                    if (rowIndex === 0) return '#F1F5F9'; // Header row
                    
                    const originalRow = scheduleBody.children[rowIndex - 1];
                    if (originalRow && originalRow.classList.contains('bonus-month')) {
                        return '#E0F2F7'; // Bonus row highlight
                    }
                    
                    return (rowIndex % 2 === 0) ? '#FCFDFE' : null; // Alternating rows
                },
                hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 0 : 0.5,
                vLineWidth: (i, node) => 0,
                hLineColor: (i, node) => '#E2E8F0',
                paddingLeft: (i, node) => 5,
                paddingRight: (i, node) => 5,
                paddingTop: (i, node) => 8,
                paddingBottom: (i, node) => 8
            }
        };
    }

    static getDocumentStyles() {
        return {
            header: {
                fontSize: 22,
                bold: true,
                color: '#090d2e',
                margin: [0, 0, 0, 10]
            },
            subheader: {
                fontSize: 10,
                color: '#64748b'
            },
            sectionHeader: {
                fontSize: 14,
                bold: true,
                color: '#090d2e'
            },
            summary: {
                fontSize: 12,
                bold: true,
                color: '#090d2e',
                margin: [0, 10, 0, 10]
            },
            tableHeader: {
                bold: true,
                fontSize: 9,
                color: '#475569',
                alignment: 'left',
                fillColor: '#F1F5F9',
                margin: [0, 0, 0, 0]
            },
            tableCell: {
                fontSize: 8,
                color: '#1e293b',
                alignment: 'left',
                margin: [0, 0, 0, 0]
            },
            bonusCell: {
                fontSize: 8,
                color: '#0ea5e9',
                bold: true,
                alignment: 'left',
                margin: [0, 0, 0, 0]
            }
        };
    }

    static generateFilename(companyName) {
        const sanitizedCompanyName = Utils.sanitizeFilename(companyName);
        const timestamp = Utils.getTimestamp();
        return `${sanitizedCompanyName}_harmonogram_${timestamp}.pdf`;
    }

    // Static method for backward compatibility
    static generatePdfmakePDF() {
        const companyNameInput = document.getElementById('companyName');
        const companyName = companyNameInput ? companyNameInput.value.trim() : '';
        return this.generate(companyName);
    }
}

// Export for global access
window.PDFGenerator = PDFGenerator;

// Legacy function for backward compatibility
function generatePdfmakePDF() {
    return PDFGenerator.generatePdfmakePDF();
}