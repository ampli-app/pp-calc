class CSVExporter {
    static exportToCSV() {
        const scheduleBody = document.getElementById('scheduleBody');
        if (!scheduleBody || scheduleBody.children.length === 0) {
            alert('Harmonogram nie został jeszcze wygenerowany.');
            return;
        }
        
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
        
        // Generate filename
        const companyName = document.getElementById('companyName')?.value?.trim() || 'harmonogram';
        const sanitizedCompanyName = companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${sanitizedCompanyName}_harmonogram_${new Date().toISOString().split('T')[0]}.csv`;
        
        link.download = filename;
        link.click();
        
        // Cleanup
        URL.revokeObjectURL(link.href);
    }
}

// Legacy function for backwards compatibility
function exportToCSV() {
    CSVExporter.exportToCSV();
}