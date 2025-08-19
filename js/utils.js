// Utility Functions
const Utils = {
    /**
     * Format date to DD.MM.YYYY format
     * @param {Date} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    },

    /**
     * Format currency to Polish format with 'zł' suffix
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount) {
        return amount.toLocaleString('pl-PL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + ' zł';
    },

    /**
     * Payment calculation using PMT formula
     * @param {number} rate - Interest rate per period
     * @param {number} nper - Number of periods
     * @param {number} pv - Present value
     * @param {number} fv - Future value (default: 0)
     * @param {number} type - Payment type (default: 0)
     * @returns {number} Payment amount
     */
    pmt(rate, nper, pv, fv = 0, type = 0) {
        if (rate === 0) return -(pv + fv) / nper;
        
        const pvif = Math.pow(1 + rate, nper);
        let pmt = rate / (pvif - 1) * -(pv * pvif + fv);
        
        if (type === 1) {
            pmt = pmt / (1 + rate);
        }
        
        return pmt;
    },

    /**
     * Calculate Internal Rate of Return (IRR) using Newton-Raphson method
     * @param {number[]} cashFlows - Array of cash flows
     * @param {number} guess - Initial guess (default: 0.1)
     * @returns {number} IRR value
     */
    calculateIRR(cashFlows, guess = CONFIG.IRR.DEFAULT_GUESS) {
        const maxIterations = CONFIG.IRR.MAX_ITERATIONS;
        const tolerance = CONFIG.IRR.TOLERANCE;
        
        let rate = guess;
        
        for (let i = 0; i < maxIterations; i++) {
            let npv = 0;
            let derivativeNpv = 0;
            
            for (let j = 0; j < cashFlows.length; j++) {
                const cashFlow = cashFlows[j];
                npv += cashFlow / Math.pow(1 + rate, j);
                derivativeNpv -= j * cashFlow / Math.pow(1 + rate, j + 1);
            }
            
            // Apply Newton-Raphson method to find zero
            const newRate = rate - npv / derivativeNpv;
            
            // Check for convergence
            if (Math.abs(newRate - rate) < tolerance) {
                return newRate;
            }
            
            rate = newRate;
        }
        
        // If no convergence, return best approximation
        return rate;
    },

    /**
     * Calculate Extended Internal Rate of Return (XIRR) using Newton-Raphson method
     * @param {Array} cashFlows - Array of objects with {date: Date, amount: number}
     * @param {number} guess - Initial guess (default: 0.1)
     * @returns {number} XIRR value
     */
    calculateXIRR(cashFlows, guess = CONFIG.IRR.DEFAULT_GUESS) {
        const maxIterations = CONFIG.IRR.MAX_ITERATIONS;
        const tolerance = CONFIG.IRR.TOLERANCE;
        
        if (cashFlows.length < 2) return 0;
        
        // Sort cash flows by date
        const sortedCashFlows = [...cashFlows].sort((a, b) => a.date - b.date);
        const firstDate = sortedCashFlows[0].date;
        
        console.log('XIRR Debug - First date:', firstDate.toISOString().split('T')[0]);
        console.log('XIRR Debug - Sorted cash flows:', sortedCashFlows.map(cf => ({
            date: cf.date.toISOString().split('T')[0],
            amount: cf.amount,
            daysDiff: (cf.date - firstDate) / (1000 * 60 * 60 * 24)
        })));
        
        let rate = guess;
        
        for (let i = 0; i < maxIterations; i++) {
            let npv = 0;
            let derivativeNpv = 0;
            
            for (const cashFlow of sortedCashFlows) {
                const daysDiff = (cashFlow.date - firstDate) / (1000 * 60 * 60 * 24);
                const yearsDiff = daysDiff / 365; // Use 365 instead of 365.25 to match Excel
                
                const discountFactor = Math.pow(1 + rate, yearsDiff);
                npv += cashFlow.amount / discountFactor;
                derivativeNpv -= yearsDiff * cashFlow.amount / Math.pow(1 + rate, yearsDiff + 1);
            }
            
            console.log(`XIRR Iteration ${i}: rate=${rate.toFixed(6)}, npv=${npv.toFixed(6)}`);
            
            // Apply Newton-Raphson method to find zero
            if (Math.abs(derivativeNpv) < tolerance) break;
            
            const newRate = rate - npv / derivativeNpv;
            
            // Check for convergence
            if (Math.abs(newRate - rate) < tolerance) {
                console.log(`XIRR Converged at iteration ${i}: ${newRate.toFixed(6)}`);
                return newRate;
            }
            
            rate = newRate;
        }
        
        console.log(`XIRR Final result: ${rate.toFixed(6)}`);
        return rate;
    },

    /**
     * Get capital multiplier based on capital amount
     * @param {number} capital - Capital amount
     * @returns {number} Multiplier value
     */
    getCapitalMultiplier(capital) {
        const ranges = CONFIG.MULTIPLIERS.CAPITAL;
        
        for (const range of ranges) {
            if (capital >= range.min && capital <= range.max) {
                return range.multiplier;
            }
        }
        
        return 1.0000; // Default multiplier
    },

    /**
     * Get settlement information by type
     * @param {string} settlement - Settlement type
     * @returns {Object} Settlement info with freq and text
     */
    getSettlementInfo(settlement) {
        return CONFIG.SETTLEMENT[settlement] || CONFIG.SETTLEMENT.annual;
    },

    /**
     * Get frequency multiplier by settlement type
     * @param {string} settlement - Settlement type
     * @returns {number} Frequency multiplier
     */
    getFrequencyMultiplier(settlement) {
        return CONFIG.MULTIPLIERS.FREQUENCY[settlement] || CONFIG.MULTIPLIERS.FREQUENCY.annual;
    },

    /**
     * Get months multiplier by period length
     * @param {number} months - Number of months
     * @returns {number} Months multiplier
     */
    getMonthsMultiplier(months) {
        return CONFIG.MULTIPLIERS.MONTHS[months] || 1.0;
    },

    /**
     * Get final payment percentage based on months and tax form
     * @param {number} months - Number of months
     * @param {string} taxForm - Tax form type
     * @returns {number} Final payment percentage
     */
    getFinalPaymentPercent(months, taxForm) {
        const monthConfig = CONFIG.FINAL_PAYMENT_PERCENT[months];
        if (monthConfig) {
            return monthConfig[taxForm] || monthConfig.ryczalt;
        }
        return taxForm === 'liniowy' ? 25.0 : 60.0;
    },

    /**
     * Calculate bonus amount if applicable
     * @param {Date} transferDate - Transfer date
     * @param {number} capital - Capital amount
     * @returns {Object} Bonus info with amount and isApplicable
     */
    calculateBonus(transferDate, capital) {
        const transferDay = transferDate.getDate();
        const isApplicable = transferDay <= CONFIG.BONUS.DEADLINE_DAY;
        const amount = isApplicable ? capital * CONFIG.BONUS.RATE : 0;
        
        return {
            isApplicable,
            amount
        };
    },

    /**
     * Calculate bonus date (3 months after start date)
     * @param {Date} startDate - Start date
     * @returns {Date} Bonus date
     */
    getBonusDate(startDate) {
        return new Date(
            startDate.getFullYear(),
            startDate.getMonth() + CONFIG.BONUS.MONTHS_DELAY,
            0
        );
    },

    /**
     * Calculate start date (last day of next month after transfer)
     * @param {Date} transferDate - Transfer date
     * @returns {Date} Start date
     */
    calculateStartDate(transferDate) {
        return new Date(
            transferDate.getFullYear(),
            transferDate.getMonth() + 2,
            0
        );
    },

    /**
     * Sanitize filename for download
     * @param {string} filename - Original filename
     * @returns {string} Sanitized filename
     */
    sanitizeFilename(filename) {
        return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    },

    /**
     * Generate timestamp for filenames
     * @returns {string} ISO date string
     */
    getTimestamp() {
        return new Date().toISOString().split('T')[0];
    },

    /**
     * Log calculation details for debugging
     * @param {string} label - Log label
     * @param {Object} data - Data to log
     */
    logCalculation(label, data) {
        if (console && console.log) {
            console.log(`${label}:`, data);
        }
    },

    /**
     * Validate required form elements
     * @param {Object} elements - Elements to validate
     * @returns {boolean} True if all elements exist
     */
    validateElements(elements) {
        const missing = [];
        
        Object.entries(elements).forEach(([key, element]) => {
            if (!element) {
                missing.push(key);
            }
        });
        
        if (missing.length > 0) {
            console.error('Missing elements:', missing);
            return false;
        }
        
        return true;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}