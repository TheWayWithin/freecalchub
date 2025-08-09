/**
 * Crypto Tax Calculator - JavaScript Logic
 * FreecalcHub - www.freecalchub.com
 * Version: 1.0
 * Date: 2025-01-09
 * 
 * Calculates cryptocurrency tax liability using 2024 tax brackets
 * and capital gains rates for US taxpayers.
 */

// 2024 Tax Brackets (Federal)
const TAX_BRACKETS_2024 = {
    single: [
        { min: 0, max: 11000, rate: 0.10 },
        { min: 11000, max: 44725, rate: 0.12 },
        { min: 44725, max: 95375, rate: 0.22 },
        { min: 95375, max: 197050, rate: 0.24 },
        { min: 197050, max: 364200, rate: 0.32 },
        { min: 364200, max: 462500, rate: 0.35 },
        { min: 462500, max: Infinity, rate: 0.37 }
    ],
    marriedJointly: [
        { min: 0, max: 22000, rate: 0.10 },
        { min: 22000, max: 89450, rate: 0.12 },
        { min: 89450, max: 190750, rate: 0.22 },
        { min: 190750, max: 364200, rate: 0.24 },
        { min: 364200, max: 462500, rate: 0.32 },
        { min: 462500, max: 693750, rate: 0.35 },
        { min: 693750, max: Infinity, rate: 0.37 }
    ],
    marriedSeparately: [
        { min: 0, max: 11000, rate: 0.10 },
        { min: 11000, max: 44725, rate: 0.12 },
        { min: 44725, max: 95375, rate: 0.22 },
        { min: 95375, max: 182050, rate: 0.24 },
        { min: 182050, max: 231250, rate: 0.32 },
        { min: 231250, max: 346875, rate: 0.35 },
        { min: 346875, max: Infinity, rate: 0.37 }
    ],
    headOfHousehold: [
        { min: 0, max: 15700, rate: 0.10 },
        { min: 15700, max: 59850, rate: 0.12 },
        { min: 59850, max: 95350, rate: 0.22 },
        { min: 95350, max: 182050, rate: 0.24 },
        { min: 182050, max: 364200, rate: 0.32 },
        { min: 364200, max: 462500, rate: 0.35 },
        { min: 462500, max: Infinity, rate: 0.37 }
    ]
};

// 2024 Long-Term Capital Gains Brackets
const CAPITAL_GAINS_BRACKETS_2024 = {
    single: [
        { min: 0, max: 47025, rate: 0.00 },
        { min: 47025, max: 518900, rate: 0.15 },
        { min: 518900, max: Infinity, rate: 0.20 }
    ],
    marriedJointly: [
        { min: 0, max: 94050, rate: 0.00 },
        { min: 94050, max: 583750, rate: 0.15 },
        { min: 583750, max: Infinity, rate: 0.20 }
    ],
    marriedSeparately: [
        { min: 0, max: 47025, rate: 0.00 },
        { min: 47025, max: 291875, rate: 0.15 },
        { min: 291875, max: Infinity, rate: 0.20 }
    ],
    headOfHousehold: [
        { min: 0, max: 63000, rate: 0.00 },
        { min: 63000, max: 551350, rate: 0.15 },
        { min: 551350, max: Infinity, rate: 0.20 }
    ]
};

// DOM Elements
let elements = {};

// Initialize calculator
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    elements = {
        form: document.getElementById('calculatorForm'),
        calculateBtn: document.getElementById('calculateButton'),
        resetBtn: document.getElementById('resetButton'),
        resultsSection: document.getElementById('resultsSection'),
        errorMessages: document.getElementById('errorMessages'),
        
        // Input elements
        filingStatus: document.getElementById('filingStatus'),
        annualIncome: document.getElementById('annualIncome'),
        shortTermGains: document.getElementById('shortTermGains'),
        longTermGains: document.getElementById('longTermGains'),
        
        // Result elements
        shortTermTax: document.getElementById('shortTermTax'),
        longTermTax: document.getElementById('longTermTax'),
        totalTax: document.getElementById('totalTax'),
        effectiveRate: document.getElementById('effectiveRate'),
        taxBracket: document.getElementById('taxBracket'),
        capitalGainsRate: document.getElementById('capitalGainsRate'),
        shortTermRate: document.getElementById('shortTermRate'),
        optimizationTips: document.getElementById('optimizationTips')
    };

    // Event listeners
    elements.calculateBtn.addEventListener('click', calculateTax);
    elements.resetBtn.addEventListener('click', resetCalculator);
    
    // Auto-calculate on input change (debounced)
    let debounceTimer;
    ['filingStatus', 'annualIncome', 'shortTermGains', 'longTermGains'].forEach(field => {
        elements[field].addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (validateAllInputs(false)) {
                    calculateTax();
                }
            }, 500);
        });
    });
});

/**
 * Calculate marginal tax rate for ordinary income
 */
function calculateMarginalTaxRate(income, filingStatus) {
    const brackets = TAX_BRACKETS_2024[filingStatus];
    if (!brackets) return 0;
    
    let tax = 0;
    let marginalRate = 0;
    
    for (const bracket of brackets) {
        if (income > bracket.min) {
            const taxableInThisBracket = Math.min(income, bracket.max) - bracket.min;
            tax += taxableInThisBracket * bracket.rate;
            marginalRate = bracket.rate;
        }
        if (income <= bracket.max) break;
    }
    
    return { tax, marginalRate };
}

/**
 * Calculate capital gains tax rate
 */
function getCapitalGainsRate(income, filingStatus) {
    const brackets = CAPITAL_GAINS_BRACKETS_2024[filingStatus];
    if (!brackets) return 0;
    
    for (const bracket of brackets) {
        if (income >= bracket.min && income < bracket.max) {
            return bracket.rate;
        }
    }
    return 0.20; // Default to highest rate
}

/**
 * Calculate short-term capital gains tax (ordinary income rates)
 */
function calculateShortTermTax(shortTermGains, totalIncome, filingStatus) {
    if (shortTermGains <= 0) return 0;
    
    // Short-term gains are added to ordinary income
    const incomeWithGains = totalIncome + shortTermGains;
    const taxWithGains = calculateMarginalTaxRate(incomeWithGains, filingStatus).tax;
    const taxWithoutGains = calculateMarginalTaxRate(totalIncome, filingStatus).tax;
    
    return taxWithGains - taxWithoutGains;
}

/**
 * Calculate long-term capital gains tax
 */
function calculateLongTermTax(longTermGains, income, filingStatus) {
    if (longTermGains <= 0) return 0;
    
    const capitalGainsRate = getCapitalGainsRate(income, filingStatus);
    return longTermGains * capitalGainsRate;
}

/**
 * Main calculation function
 */
function calculateTax() {
    if (!validateAllInputs(true)) return;
    
    // Get input values
    const filingStatus = elements.filingStatus.value;
    const annualIncome = parseFloat(elements.annualIncome.value) || 0;
    const shortTermGains = parseFloat(elements.shortTermGains.value) || 0;
    const longTermGains = parseFloat(elements.longTermGains.value) || 0;
    
    try {
        // Calculate taxes
        const shortTermTax = shortTermGains > 0 ? 
            calculateShortTermTax(shortTermGains, annualIncome, filingStatus) : 0;
        
        const longTermTax = longTermGains > 0 ? 
            calculateLongTermTax(longTermGains, annualIncome, filingStatus) : 0;
        
        const totalTax = shortTermTax + longTermTax;
        const totalGains = Math.max(0, shortTermGains) + Math.max(0, longTermGains);
        const effectiveRate = totalGains > 0 ? (totalTax / totalGains) * 100 : 0;
        
        // Get rates for display
        const marginalInfo = calculateMarginalTaxRate(annualIncome, filingStatus);
        const capitalGainsRate = getCapitalGainsRate(annualIncome, filingStatus);
        
        // Update results display
        updateResults({
            shortTermTax,
            longTermTax,
            totalTax,
            effectiveRate,
            marginalRate: marginalInfo.marginalRate,
            capitalGainsRate,
            filingStatus,
            annualIncome,
            shortTermGains,
            longTermGains,
            totalGains
        });
        
        // Show results section
        elements.resultsSection.style.display = 'block';
        elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (error) {
        showError('An error occurred during calculation. Please check your inputs and try again.');
        console.error('Calculation error:', error);
    }
}

/**
 * Update results display
 */
function updateResults(results) {
    // Format currency
    const formatCurrency = (amount) => {
        if (amount < 0) {
            return '-$' + Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    
    // Format percentage
    const formatPercentage = (rate) => (rate * 100).toFixed(1) + '%';
    
    // Update main results
    elements.shortTermTax.textContent = formatCurrency(results.shortTermTax);
    elements.longTermTax.textContent = formatCurrency(results.longTermTax);
    elements.totalTax.textContent = formatCurrency(results.totalTax);
    elements.effectiveRate.textContent = results.effectiveRate.toFixed(2) + '%';
    
    // Update breakdown
    elements.taxBracket.textContent = formatPercentage(results.marginalRate);
    elements.capitalGainsRate.textContent = formatPercentage(results.capitalGainsRate);
    elements.shortTermRate.textContent = formatPercentage(results.marginalRate);
    
    // Add value styling
    [elements.shortTermTax, elements.longTermTax, elements.totalTax].forEach(el => {
        el.className = '';
        const value = parseFloat(el.textContent.replace(/[$,]/g, ''));
        if (value > 0) el.classList.add('positive-value');
        else if (value < 0) el.classList.add('negative-value');
        else el.classList.add('neutral-value');
    });
    
    // Generate optimization tips
    generateOptimizationTips(results);
}

/**
 * Generate tax optimization tips based on results
 */
function generateOptimizationTips(results) {
    const tips = [];
    
    // Long-term vs short-term holding tip
    if (results.shortTermGains > 0 && results.marginalRate > results.capitalGainsRate) {
        tips.push({
            icon: 'fa-calendar-alt',
            title: 'Hold for Long-Term Gains',
            description: `Your marginal tax rate (${(results.marginalRate * 100).toFixed(1)}%) is higher than long-term capital gains rate (${(results.capitalGainsRate * 100).toFixed(1)}%). Consider holding crypto investments for over one year.`
        });
    }
    
    // Tax bracket management
    if (results.annualIncome > 200000) {
        tips.push({
            icon: 'fa-chart-line',
            title: 'Consider Tax-Loss Harvesting',
            description: 'With your income level, consider selling losing crypto positions to offset gains and reduce overall tax liability.'
        });
    }
    
    // Capital gains rate optimization
    if (results.capitalGainsRate === 0) {
        tips.push({
            icon: 'fa-star',
            title: 'You Qualify for 0% Capital Gains Rate',
            description: 'Your income level qualifies for 0% long-term capital gains tax. This is an excellent opportunity for tax-free crypto profits!'
        });
    } else if (results.capitalGainsRate === 0.15) {
        tips.push({
            icon: 'fa-info-circle',
            title: '15% Capital Gains Rate',
            description: 'You\'re in the 15% long-term capital gains bracket. Consider timing large sales to stay within this favorable rate.'
        });
    }
    
    // Loss deduction tip
    if (results.shortTermGains < 0 || results.longTermGains < 0) {
        tips.push({
            icon: 'fa-minus-circle',
            title: 'Maximize Loss Deductions',
            description: 'You can deduct up to $3,000 in net capital losses against ordinary income per year. Excess losses carry forward to future years.'
        });
    }
    
    // Professional advice tip
    if (results.totalTax > 5000) {
        tips.push({
            icon: 'fa-user-tie',
            title: 'Consider Professional Tax Advice',
            description: 'With significant tax liability, consult a tax professional familiar with cryptocurrency to explore advanced tax strategies.'
        });
    }
    
    // Default tip if no specific recommendations
    if (tips.length === 0) {
        tips.push({
            icon: 'fa-lightbulb',
            title: 'Plan Ahead',
            description: 'Keep detailed records of all crypto transactions and consider the tax implications before making trades or sales.'
        });
    }
    
    // Render tips
    elements.optimizationTips.innerHTML = tips.map(tip => `
        <div class="optimization-tip">
            <div class="tip-icon">
                <i class="fas ${tip.icon}"></i>
            </div>
            <div class="tip-content">
                <div class="tip-title">${tip.title}</div>
                <div class="tip-description">${tip.description}</div>
            </div>
        </div>
    `).join('');
}

/**
 * Validation functions
 */
function validateAllInputs(showErrors = true) {
    clearErrors();
    let isValid = true;
    
    // Validate filing status
    if (!elements.filingStatus.value) {
        if (showErrors) addFieldError('filingStatus', 'Please select a filing status');
        isValid = false;
    }
    
    // Validate annual income
    const income = parseFloat(elements.annualIncome.value);
    if (isNaN(income) || income < 0) {
        if (showErrors) addFieldError('annualIncome', 'Please enter a valid annual income');
        isValid = false;
    } else if (income > 10000000) {
        if (showErrors) addFieldError('annualIncome', 'Income amount is too large');
        isValid = false;
    }
    
    // Validate gains/losses (can be negative)
    const shortTerm = parseFloat(elements.shortTermGains.value);
    const longTerm = parseFloat(elements.longTermGains.value);
    
    if (!isNaN(shortTerm) && Math.abs(shortTerm) > 10000000) {
        if (showErrors) addFieldError('shortTermGains', 'Amount is too large');
        isValid = false;
    }
    
    if (!isNaN(longTerm) && Math.abs(longTerm) > 10000000) {
        if (showErrors) addFieldError('longTermGains', 'Amount is too large');
        isValid = false;
    }
    
    // Check if at least one gain/loss is provided
    if (isNaN(shortTerm) && isNaN(longTerm)) {
        if (showErrors) showError('Please enter at least one gain or loss amount');
        isValid = false;
    }
    
    return isValid;
}

function addFieldError(fieldId, message) {
    const field = elements[fieldId];
    const formGroup = field.closest('.form-group');
    formGroup.classList.add('error');
    
    // Create or update error message
    let errorSpan = formGroup.querySelector('.field-error');
    if (!errorSpan) {
        errorSpan = document.createElement('span');
        errorSpan.className = 'field-error';
        errorSpan.style.cssText = 'color: var(--error-color); font-size: 0.85rem; margin-top: 0.25rem; display: block;';
        formGroup.appendChild(errorSpan);
    }
    errorSpan.textContent = message;
}

function clearErrors() {
    // Clear form group errors
    document.querySelectorAll('.form-group.error').forEach(group => {
        group.classList.remove('error');
        const errorSpan = group.querySelector('.field-error');
        if (errorSpan) errorSpan.remove();
    });
    
    // Hide main error messages
    elements.errorMessages.style.display = 'none';
    elements.errorMessages.innerHTML = '';
}

function showError(message) {
    elements.errorMessages.innerHTML = `<div class="error-message">${message}</div>`;
    elements.errorMessages.style.display = 'block';
    elements.errorMessages.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Reset calculator
 */
function resetCalculator() {
    elements.form.reset();
    elements.resultsSection.style.display = 'none';
    clearErrors();
    
    // Clear form group states
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error', 'success');
    });
}