// Enhanced PDF Generator Module
class PDFGenerator {
    static generate(companyName = '') {
        const infoData = this.collectInfoData();
        const scheduleBody = document.getElementById('scheduleBody');
        
        if (!this.validateSchedule(scheduleBody)) {
            return;
        }

        const tableRows = this.buildTableRows(scheduleBody);
        const docDefinition = this.createDocDefinition(infoData, tableRows, scheduleBody, companyName);
        const filename = this.generateFilename(companyName);

        // Generate PDF using pdfmake
        pdfMake.createPdf(docDefinition).download(filename);
    }

    static collectInfoData() {
        return [
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
        
        // Enhanced table headers with better styling
        tableRows.push([
            { text: 'Nr raty', style: 'tableHeader', alignment: 'center' },
            { text: 'Data', style: 'tableHeader', alignment: 'center' },
            { text: 'Kwota netto', style: 'tableHeader', alignment: 'right' },
            { text: 'Kwota brutto', style: 'tableHeader', alignment: 'right' }
        ]);

        // Table data with improved formatting
        Array.from(scheduleBody.children).forEach(row => {
            const cells = Array.from(row.children).filter(cell => !cell.classList.contains('tax-column'));
            const rowData = cells.map((cell, index) => {
                let text = cell.textContent.trim();
                let style = 'tableCell';
                let alignment = 'left';

                // Apply bonus style if row has bonus-month class
                if (row.classList.contains('bonus-month')) {
                    style = 'bonusCell';
                }

                // Set alignment based on column type & clean up text for column 0
                if (index === 0) { // Nr raty
                    text = text.replace('🎁', '').trim();
                    alignment = 'center';
                } else if (index === 1) { // Data
                    alignment = 'center';
                } else if (index >= 2) { // Amount columns
                    alignment = 'right';
                }

                // Special formatting for amount column with bonus information
                if (index === 2) {
                    return this.formatAmountCell(text, style, alignment);
                }
                
                return { text: text, style: style, alignment: alignment };
            });
            tableRows.push(rowData);
        });

        return tableRows;
    }

    static formatAmountCell(text, style, alignment) {
        if (text.includes('(w tym bonus')) {
            const parts = text.split('(w tym bonus');
            return { 
                text: [
                    { text: parts[0].trim(), fontSize: 9 }, 
                    { text: '\n(w tym bonus' + parts[1], fontSize: 7, color: '#059669', italics: true }
                ], 
                style: style,
                alignment: alignment
            };
        } else if (text.includes('(bonus)')) {
            return { 
                text: [
                    { text: text.replace('(bonus)', '').trim(), fontSize: 9 }
                ], 
                style: style,
                alignment: alignment
            };
        }
        
        return { text: text, style: style, alignment: alignment };
    }

    static createDocDefinition(infoData, tableRows, scheduleBody, companyName) {
        const totalPaymentsText = document.getElementById('totalPayments')?.textContent || '---';

        return {
            pageSize: 'A4',
            pageOrientation: 'portrait',
            pageMargins: [40, 80, 40, 60],
            
            // Font definitions - using safe built-in fonts
            fonts: {
                Roboto: {
                    normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf',
                    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf',
                    italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf',
                    bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-MediumItalic.ttf'
                }
            },
            
            // Enhanced header and footer
            header: this.createHeader(),
            footer: this.createFooter(),
            content: [
                // Enhanced title section with company name
                this.createTitleSection(companyName),

                // Logo section
                this.createLogoSection(),

                // Basic Info with improved layout
                this.createInfoSection(infoData),

                // Enhanced payment table
                this.createEnhancedPaymentTable(tableRows, scheduleBody),

                // Summary section with better formatting
                this.createSummarySection(totalPaymentsText),

                // Disclaimer with improved styling
                this.createDisclaimer()
            ],
            styles: this.getEnhancedDocumentStyles(),
            defaultStyle: {
                font: 'Roboto',
                fontSize: 10,
                lineHeight: 1.2
            }
        };
    }

    static createHeader() {
        return function(currentPage, pageCount, pageSize) {
            if (currentPage === 1) return null; // No header on first page
            
            return {
                columns: [
                    { text: 'Harmonogram Wypłat Partnerów', style: 'headerText' },
                    { text: `Strona ${currentPage} z ${pageCount}`, style: 'headerText', alignment: 'right' }
                ],
                margin: [40, 20, 40, 0]
            };
        };
    }

    static createFooter() {
        return function(currentPage, pageCount) {
            return {
                stack: [
                    // Separator line
                    {
                        canvas: [{
                            type: 'line',
                            x1: 0, y1: 0,
                            x2: 515, y2: 0,
                            lineWidth: 0.5,
                            lineColor: '#e2e8f0'
                        }],
                        margin: [40, 0, 40, 8]
                    },
                    // Footer content with updated text
                    {
                        columns: [
                            { text: 'Dokument ma charakter informacyjny', style: 'footerText' },
                            { text: `Dokument wygenerowano ${new Date().toLocaleString('pl-PL')}`, style: 'footerText', alignment: 'right' }
                        ],
                        margin: [40, 0, 40, 0]
                    }
                ]
            };
        };
    }

    static createLogoSection() {
        if (CONFIG.COMPANY_LOGO_BASE64 && CONFIG.COMPANY_LOGO_BASE64 !== 'kod64') {
            return {
                image: CONFIG.COMPANY_LOGO_BASE64,
                width: 120,
                alignment: 'center',
                margin: [0, 0, 0, 30]
            };
        }
        return { text: '', margin: [0, 0, 0, 20] }; // Spacer if no logo
    }

    static createDocumentInfoBar() {
        return {
            table: {
                widths: ['*', '*'],
                body: [[
                    { text: `Wygenerowano: ${this.getFormattedTimestamp()}`, style: 'infoBarText' },
                    { text: 'Dokument informacyjny', style: 'infoBarText', alignment: 'right' }
                ]]
            },
            layout: 'noBorders',
            fillColor: '#f8fafc',
            margin: [0, 0, 0, 25]
        };
    }

    static createInfoSection(infoData) {
        return {
            stack: [
                { text: 'Podstawowe informacje', style: 'sectionTitle' },
                {
                    table: {
                        widths: ['*', '*'],
                        body: this.createInfoTableBody(infoData)
                    },
                    layout: {
                        hLineWidth: () => 0,
                        vLineWidth: () => 0,
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 4,
                        paddingBottom: () => 4
                    },
                    margin: [10, 0, 10, 0]
                }
            ],
            margin: [0, 0, 0, 25]
        };
    }

    static createInfoTableBody(infoData) {
        const tableBody = [];
        for (let i = 0; i < infoData.length; i += 2) {
            const leftColumn = infoData[i];
            const rightColumn = infoData[i + 1] || ['', ''];
            
            tableBody.push([
                { 
                    text: [
                        { text: leftColumn[0], style: 'infoLabel' },
                        { text: ` ${leftColumn[1]}`, style: 'infoValue' }
                    ]
                },
                { 
                    text: [
                        { text: rightColumn[0], style: 'infoLabel' },
                        { text: ` ${rightColumn[1]}`, style: 'infoValue' }
                    ]
                }
            ]);
        }
        return tableBody;
    }

    static createEnhancedPaymentTable(tableRows, scheduleBody) {
        return {
            stack: [
                { text: 'Harmonogram płatności', style: 'sectionTitle' },
                {
                    alignment: 'center',
                    table: {
                        headerRows: 1,
                        widths: [60, 80, '*', '*'],
                        body: tableRows
                    },
                    layout: {
                        fillColor: (rowIndex, node, columnIndex) => {
                            if (rowIndex === 0) return '#1e40af'; // Header
                            
                            const originalRow = scheduleBody.children[rowIndex - 1];
                            if (originalRow && originalRow.classList.contains('bonus-month')) {
                                return '#ecfdf5'; // Light green for bonus rows
                            }
                            
                            return (rowIndex % 2 === 0) ? '#f8fafc' : '#ffffff';
                        },
                        hLineWidth: (i, node) => {
                            if (i === 0 || i === 1) return 1;
                            return 0.5;
                        },
                        vLineWidth: () => 0,
                        hLineColor: () => '#e2e8f0',
                        paddingLeft: () => 8,
                        paddingRight: () => 8,
                        paddingTop: () => 6,
                        paddingBottom: () => 6
                    }
                }
            ],
            margin: [0, 0, 0, 20]
        };
    }

    static createSummarySection(totalPaymentsText) {
        return {
            table: {
                widths: ['*', 'auto'],
                body: [[
                    { text: 'Suma wypłat netto:', style: 'summaryLabel' },
                    { text: totalPaymentsText, style: 'summaryValue' }
                ]]
            },
            layout: {
                fillColor: () => '#eff6ff',
                hLineWidth: () => 1,
                vLineWidth: () => 1,
                hLineColor: () => '#3b82f6',
                vLineColor: () => '#3b82f6',
                paddingLeft: () => 15,
                paddingRight: () => 15,
                paddingTop: () => 10,
                paddingBottom: () => 10
            },
            margin: [0, 0, 0, 30]
        };
    }

    static createDisclaimer() {
        return {
            stack: [
                {
                    canvas: [{
                        type: 'line',
                        x1: 0, y1: 0,
                        x2: 515, y2: 0,
                        lineWidth: 0.5,
                        lineColor: '#d1d5db'
                    }],
                    margin: [0, 0, 0, 10]
                },
                {
                    text: 'Powyższy harmonogram ma charakter informacyjny i nie stanowi oferty w rozumieniu przepisów Kodeksu Cywilnego.',
                    style: 'disclaimer'
                }
            ]
        };
    }

    static createTitleSection(companyName = '') {
        const titleStack = [
            {
                text: 'Harmonogram Wypłat Partnerów',
                style: 'mainTitle'
            }
        ];

        // Add company name subtitle if provided
        if (companyName && companyName.trim()) {
            titleStack.push({
                text: `Przykładowa oferta dla ${companyName.trim()}`,
                style: 'subtitle'
            });
        }

        return {
            stack: titleStack,
            margin: [0, 0, 0, 15]
        };
    }

    static getEnhancedDocumentStyles() {
        return {
            // Title styles
            mainTitle: {
                fontSize: 24,
                bold: true,
                color: '#1e40af',
                alignment: 'center',
                margin: [0, 0, 0, 10]
            },
            subtitle: {
                fontSize: 16,
                color: '#374151',
                alignment: 'center',
                margin: [0, 5, 0, 0],
                italics: true
            },
            sectionTitle: {
                fontSize: 14,
                bold: true,
                color: '#1f2937',
                margin: [0, 0, 0, 10]
            },
            
            // Header and footer
            headerText: {
                fontSize: 9,
                color: '#6b7280'
            },
            footerText: {
                fontSize: 8,
                color: '#9ca3af'
            },
            
            // Info section
            infoBarText: {
                fontSize: 9,
                color: '#4b5563',
                margin: [8, 8, 8, 8]
            },
            infoLabel: {
                fontSize: 9,
                bold: true,
                color: '#374151'
            },
            infoValue: {
                fontSize: 9,
                color: '#1f2937'
            },
            
            // Table styles
            tableHeader: {
                bold: true,
                fontSize: 10,
                color: '#ffffff',
                alignment: 'center'
            },
            tableCell: {
                fontSize: 9,
                color: '#1f2937'
            },
            bonusCell: {
                fontSize: 9,
                color: '#059669',
                bold: true
            },
            
            // Summary styles
            summaryLabel: {
                fontSize: 12,
                bold: true,
                color: '#1e40af',
                alignment: 'right'
            },
            summaryValue: {
                fontSize: 14,
                bold: true,
                color: '#1e40af',
                alignment: 'right'
            },
            
            // Disclaimer
            disclaimer: {
                fontSize: 9,
                color: '#6b7280',
                alignment: 'center',
                italics: true,
                lineHeight: 1.3
            }
        };
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