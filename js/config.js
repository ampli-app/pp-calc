// Configuration and Constants
const CONFIG = {
    // Authentication credentials
    AUTH: {
        USERNAME: 'PlentiPartners',
        PASSWORD: 'admin123'
    },

    // Company logo (base64 encoded)
    COMPANY_LOGO_BASE64: 'kod64',

    // Interest rate calculation multipliers
    MULTIPLIERS: {
        // Frequency multipliers
        FREQUENCY: {
            monthly: 0.9210,
            quarterly: 0.9445,
            semiannual: 0.9810,
            annual: 1.0425
        },

        // Period multipliers (months)
        MONTHS: {
            12: 0.9700,
            18: 0.9800,
            24: 0.9900,
            30: 1.0500,
            36: 1.0850,
            48: 1.1520
        },

        // Capital multipliers (ranges)
        CAPITAL: [
            { min: 10000, max: 29999, multiplier: 1.0000 },
            { min: 30000, max: 49999, multiplier: 1.0655 },
            { min: 50000, max: 99999, multiplier: 1.0655 },
            { min: 100000, max: 199999, multiplier: 1.0990 },
            { min: 200000, max: 999999, multiplier: 1.1880 },
            { min: 1000000, max: 9999999, multiplier: 1.1880 }
        ],

        // Final payment multiplier
        FINAL_PAYMENT: 1
    },

    // Final payment percentages based on months and tax form
    FINAL_PAYMENT_PERCENT: {
        12: { liniowy: 75.0, ryczalt: 100.0 },
        18: { liniowy: 62.5, ryczalt: 90.0 },
        24: { liniowy: 50.0, ryczalt: 80.0 },
        30: { liniowy: 37.5, ryczalt: 70.0 },
        36: { liniowy: 25.0, ryczalt: 60.0 },
        48: { liniowy: 0.0, ryczalt: 40.0 }
    },

    // Settlement frequency mapping
    SETTLEMENT: {
        monthly: { freq: 1, text: 'Miesięczne' },
        quarterly: { freq: 3, text: 'Kwartalne' },
        semiannual: { freq: 6, text: 'Półroczne' },
        annual: { freq: 12, text: 'Roczne' }
    },

    // Tax rate options for different tax forms
    TAX_RATES: {
        ryczalt: [
            { value: '8.5', text: '8,5%' },
            { value: '12.5', text: '12,5%' }
        ],
        liniowy: [
            { value: '9', text: '9%' },
            { value: '19', text: '19%' }
        ]
    },

    // Bonus calculation
    BONUS: {
        RATE: 0.005, // 0.5% of capital
        DEADLINE_DAY: 15, // Must transfer before 15th day of month
        MONTHS_DELAY: 3 // Bonus paid 3 months after start date
    },

    // VAT rate for brutto calculations
    VAT_RATE: 1.23,

    // IRR calculation settings
    IRR: {
        MAX_ITERATIONS: 1000,
        TOLERANCE: 0.0000001,
        DEFAULT_GUESS: 0.1
    },

    // Default values
    DEFAULTS: {
        BASE_INTEREST_RATE: 12.5,
        CAPITAL: 100000,
        MONTHS: 36,
        SETTLEMENT: 'annual',
        TAX_FORM: 'ryczalt'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}