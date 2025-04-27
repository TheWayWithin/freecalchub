/**
 * Mortgage Calculator - JavaScript Implementation
 * Version: 1.0.0
 * 
 * This file contains the core functionality for the mortgage calculator,
 * including calculations, UI interactions, and visualizations.
 */

// Country-specific mortgage parameters
const COUNTRY_PARAMS = {
    US: {
        name: 'United States',
        currency: '$',
        currencyCode: 'USD',
        termOptions: [30, 20, 15, 10],
        defaultTerm: 30,
        compoundingPeriod: 'monthly',
        propertyTaxLabel: 'Annual Property Tax',
        propertyTaxDefault: 3600,
        insuranceLabel: 'Annual Home Insurance',
        insuranceDefault: 1200,
        pmiRequired: true,
        pmiThreshold: 20, // Down payment % threshold for PMI
        pmiRate: 0.5, // Annual PMI rate as percentage of loan amount
        decimalSeparator: '.',
        thousandsSeparator: ',',
        dateFormat: 'MM/YYYY'
    },
    UK: {
        name: 'United Kingdom',
        currency: '£',
        currencyCode: 'GBP',
        termOptions: [35, 30, 25, 20, 15, 10, 5],
        defaultTerm: 25,
        compoundingPeriod: 'monthly',
        propertyTaxLabel: 'Annual Council Tax',
        propertyTaxDefault: 2000,
        insuranceLabel: 'Annual Buildings Insurance',
        insuranceDefault: 400,
        pmiRequired: false,
        stampDuty: true,
        decimalSeparator: '.',
        thousandsSeparator: ',',
        dateFormat: 'MM/YYYY'
    },
    CA: {
        name: 'Canada',
        currency: 'C$',
        currencyCode: 'CAD',
        termOptions: [30, 25, 20, 15, 10, 5],
        defaultTerm: 25,
        compoundingPeriod: 'semi-annual',
        propertyTaxLabel: 'Annual Property Tax',
        propertyTaxDefault: 4000,
        insuranceLabel: 'Annual Home Insurance',
        insuranceDefault: 1000,
        pmiRequired: true,
        pmiThreshold: 20,
        pmiRate: 0.4,
        decimalSeparator: '.',
        thousandsSeparator: ',',
        dateFormat: 'MM/YYYY'
    },
    AU: {
        name: 'Australia',
        currency: 'A$',
        currencyCode: 'AUD',
        termOptions: [30, 25, 20, 15, 10],
        defaultTerm: 30,
        compoundingPeriod: 'monthly',
        propertyTaxLabel: 'Annual Council Rates',
        propertyTaxDefault: 2500,
        insuranceLabel: 'Annual Home Insurance',
        insuranceDefault: 1200,
        pmiRequired: true,
        pmiThreshold: 20,
        pmiRate: 0.5,
        stampDuty: true,
        decimalSeparator: '.',
        thousandsSeparator: ',',
        dateFormat: 'MM/YYYY'
    },
    IE: {
        name: 'Ireland',
        currency: '€',
        currencyCode: 'EUR',
        termOptions: [35, 30, 25, 20, 15, 10],
        defaultTerm: 30,
        compoundingPeriod: 'monthly',
        propertyTaxLabel: 'Annual Local Property Tax',
        propertyTaxDefault: 500,
        insuranceLabel: 'Annual Home Insurance',
        insuranceDefault: 600,
        pmiRequired: false,
        stampDuty: true,
        decimalSeparator: '.',
        thousandsSeparator: ',',
        dateFormat: 'MM/YYYY'
    },
    HK: {
        name: 'Hong Kong',
        currency: 'HK$',
        currencyCode: 'HKD',
        termOptions: [30, 25, 20, 15, 10],
        defaultTerm: 30,
        compoundingPeriod: 'monthly',
        propertyTaxLabel: 'Annual Property Tax',
        propertyTaxDefault: 12000,
        insuranceLabel: 'Annual Home Insurance',
        insuranceDefault: 3000,
        pmiRequired: false,
        stampDuty: true,
        decimalSeparator: '.',
        thousandsSeparator: ',',
        dateFormat: 'MM/YYYY'
    }
};

// Initialize charts
let paymentBreakdownChart = null;
let balanceChart = null;
let comparisonChart = null;

// Store calculation results
let calculationResults = {
    loanAmount: 0,
    monthlyPayment: 0,
    monthlyPropertyTax: 0,
    monthlyInsurance: 0,
    monthlyPMI: 0,
    monthlyHOA: 0,
    totalMonthlyPayment: 0,
    totalPrincipal: 0,
    totalInterest: 0,
    totalCost: 0,
    payoffDate: null,
    amortizationSchedule: [],
    extraPaymentResults: {
        newPayoffDate: null,
        timeSaved: 0,
        interestSaved: 0,
        amortizationSchedule: []
    }
};

// DOM elements
const elements = {
    form: document.getElementById('mortgage-calculator-form'),
    country: document.getElementById('country'),
    homePrice: document.getElementById('home-price'),
    downPaymentAmount: document.getElementById('down-payment-amount'),
    downPaymentPercent: document.getElementById('down-payment-percent'),
    loanTerm: document.getElementById('loan-term'),
    interestRate: document.getElementById('interest-rate'),
    propertyTax: document.getElementById('property-tax'),
    homeInsurance: document.getElementById('home-insurance'),
    hoaFees: document.getElementById('hoa-fees'),
    extraPayment: document.getElementById('extra-payment'),
    loanStartDate: document.getElementById('loan-start-date'),
    
    // Results elements
    principalInterest: document.getElementById('principal-interest'),
    monthlyPropertyTax: document.getElementById('monthly-property-tax'),
    monthlyInsurance: document.getElementById('monthly-insurance'),
    monthlyPMI: document.getElementById('monthly-pmi'),
    monthlyHOA: document.getElementById('monthly-hoa'),
    totalPayment: document.getElementById('total-payment'),
    loanAmount: document.getElementById('loan-amount'),
    totalPrincipal: document.getElementById('total-principal'),
    totalInterest: document.getElementById('total-interest'),
    totalCost: document.getElementById('total-cost'),
    payoffDate: document.getElementById('payoff-date'),
    
    // Extra payment results
    extraPaymentSummary: document.getElementById('extra-payment-summary'),
    newPayoffDate: document.getElementById('new-payoff-date'),
    timeSaved: document.getElementById('time-saved'),
    interestSaved: document.getElementById('interest-saved'),
    
    // PMI and HOA containers
    pmiContainer: document.getElementById('pmi-container'),
    hoaContainer: document.getElementById('hoa-container'),
    
    // Amortization schedule
    amortizationTable: document.getElementById('amortization-table'),
    amortizationTableBody: document.getElementById('amortization-table-body'),
    showYearly: document.getElementById('show-yearly'),
    showMonthly: document.getElementById('show-monthly'),
    scheduleSearch: document.getElementById('schedule-search'),
    
    // Chart containers
    paymentBreakdownChart: document.getElementById('payment-breakdown-chart'),
    balanceChart: document.getElementById('balance-chart'),
    comparisonChart: document.getElementById('comparison-chart'),
    comparisonChartWrapper: document.getElementById('comparison-chart-wrapper')
};

// Initialize the calculator
document.addEventListener('DOMContentLoaded', function() {
    // Set default loan start date to current month
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    elements.loanStartDate.value = `${year}-${month}`;
    
    // Initialize country-specific elements
    updateCountrySpecificElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Calculate initial results
    calculateMortgage();
});

/**
 * Set up event listeners for form inputs and controls
 */
function setupEventListeners() {
    // Country selection change
    elements.country.addEventListener('change', function() {
        updateCountrySpecificElements();
        calculateMortgage();
    });
    
    // Form submission
    elements.form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateMortgage();
    });
    
    // Down payment amount/percent sync
    elements.downPaymentAmount.addEventListener('input', function() {
        const homePrice = parseFloat(elements.homePrice.value) || 0;
        const downPaymentAmount = parseFloat(elements.downPaymentAmount.value) || 0;
        
        if (homePrice > 0) {
            const downPaymentPercent = (downPaymentAmount / homePrice) * 100;
            elements.downPaymentPercent.value = downPaymentPercent.toFixed(1);
        }
    });
    
    elements.downPaymentPercent.addEventListener('input', function() {
        const homePrice = parseFloat(elements.homePrice.value) || 0;
        const downPaymentPercent = parseFloat(elements.downPaymentPercent.value) || 0;
        
        const downPaymentAmount = (homePrice * downPaymentPercent) / 100;
        elements.downPaymentAmount.value = Math.round(downPaymentAmount);
    });
    
    elements.homePrice.addEventListener('input', function() {
        const homePrice = parseFloat(elements.homePrice.value) || 0;
        const downPaymentPercent = parseFloat(elements.downPaymentPercent.value) || 0;
        
        const downPaymentAmount = (homePrice * downPaymentPercent) / 100;
        elements.downPaymentAmount.value = Math.round(downPaymentAmount);
    });
    
    // Amortization schedule view toggle
    elements.showYearly.addEventListener('click', function() {
        elements.showYearly.classList.add('active');
        elements.showMonthly.classList.remove('active');
        displayAmortizationSchedule('yearly');
    });
    
    elements.showMonthly.addEventListener('click', function() {
        elements.showMonthly.classList.add('active');
        elements.showYearly.classList.remove('active');
        displayAmortizationSchedule('monthly');
    });
    
    // Amortization schedule search
    elements.scheduleSearch.addEventListener('input', function() {
        const searchTerm = elements.scheduleSearch.value.toLowerCase();
        const rows = elements.amortizationTableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
    
    // FAQ toggle
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            faqItem.classList.toggle('active');
        });
    });
    
    // Input changes for real-time calculation
    const inputElements = [
        elements.homePrice, elements.downPaymentAmount, elements.downPaymentPercent,
        elements.loanTerm, elements.interestRate, elements.propertyTax,
        elements.homeInsurance, elements.hoaFees, elements.extraPayment,
        elements.loanStartDate
    ];
    
    inputElements.forEach(input => {
        input.addEventListener('input', debounce(calculateMortgage, 500));
    });
}

/**
 * Update UI elements based on selected country
 */
function updateCountrySpecificElements() {
    const countryCode = elements.country.value;
    const countryParams = COUNTRY_PARAMS[countryCode];
    
    // Update currency symbols
    document.querySelectorAll('.currency-symbol').forEach(element => {
        element.textContent = countryParams.currency;
    });
    
    // Update loan term options
    elements.loanTerm.innerHTML = '';
    countryParams.termOptions.forEach(term => {
        const option = document.createElement('option');
        option.value = term;
        option.textContent = `${term} years`;
        elements.loanTerm.appendChild(option);
    });
    elements.loanTerm.value = countryParams.defaultTerm;
    
    // Update property tax and insurance labels
    document.querySelector('label[for="property-tax"]').textContent = countryParams.propertyTaxLabel;
    document.querySelector('label[for="home-insurance"]').textContent = countryParams.insuranceLabel;
    
    // Set default values
    elements.propertyTax.value = countryParams.propertyTaxDefault;
    elements.homeInsurance.value = countryParams.insuranceDefault;
}

/**
 * Calculate mortgage details based on form inputs
 */
function calculateMortgage() {
    // Get country parameters
    const countryCode = elements.country.value;
    const countryParams = COUNTRY_PARAMS[countryCode];
    
    // Get form values
    const homePrice = parseFloat(elements.homePrice.value) || 0;
    const downPaymentAmount = parseFloat(elements.downPaymentAmount.value) || 0;
    const loanTerm = parseInt(elements.loanTerm.value) || 30;
    const interestRate = parseFloat(elements.interestRate.value) || 0;
    const annualPropertyTax = parseFloat(elements.propertyTax.value) || 0;
    const annualInsurance = parseFloat(elements.homeInsurance.value) || 0;
    const monthlyHOA = parseFloat(elements.hoaFees.value) || 0;
    const extraPayment = parseFloat(elements.extraPayment.value) || 0;
    const loanStartDate = new Date(elements.loanStartDate.value);
    
    // Calculate loan amount
    const loanAmount = homePrice - downPaymentAmount;
    
    // Calculate monthly principal and interest payment
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    let monthlyPayment = 0;
    if (interestRate === 0) {
        monthlyPayment = loanAmount / numberOfPayments;
    } else {
        monthlyPayment = loanAmount * 
            (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
            (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    }
    
    // Calculate monthly property tax and insurance
    const monthlyPropertyTax = annualPropertyTax / 12;
    const monthlyInsurance = annualInsurance / 12;
    
    // Calculate PMI if applicable
    let monthlyPMI = 0;
    const downPaymentPercent = (downPaymentAmount / homePrice) * 100;
    
    if (countryParams.pmiRequired && downPaymentPercent < countryParams.pmiThreshold) {
        monthlyPMI = (loanAmount * (countryParams.pmiRate / 100)) / 12;
    }
    
    // Calculate total monthly payment
    const totalMonthlyPayment = monthlyPayment + monthlyPropertyTax + monthlyInsurance + monthlyPMI + monthlyHOA;
    
    // Generate amortization schedule without extra payments
    const amortizationSchedule = generateAmortizationSchedule(
        loanAmount, 
        monthlyInterestRate, 
        numberOfPayments, 
        monthlyPayment, 
        0, 
        loanStartDate
    );
    
    // Calculate total interest
    const totalInterest = amortizationSchedule.reduce((sum, payment) => sum + payment.interest, 0);
    
    // Get payoff date
    const payoffDate = amortizationSchedule[amortizationSchedule.length - 1].date;
    
    // Store results
    calculationResults = {
        loanAmount: loanAmount,
        monthlyPayment: monthlyPayment,
        monthlyPropertyTax: monthlyPropertyTax,
        monthlyInsurance: monthlyInsurance,
        monthlyPMI: monthlyPMI,
        monthlyHOA: monthlyHOA,
        totalMonthlyPayment: totalMonthlyPayment,
        totalPrincipal: loanAmount,
        totalInterest: totalInterest,
        totalCost: loanAmount + totalInterest,
        payoffDate: payoffDate,
        amortizationSchedule: amortizationSchedule,
        extraPaymentResults: {
            newPayoffDate: null,
            timeSaved: 0,
            interestSaved: 0,
            amortizationSchedule: []
        }
    };
    
    // Calculate with extra payments if applicable
    if (extraPayment > 0) {
        const extraPaymentSchedule = generateAmortizationSchedule(
            loanAmount, 
            monthlyInterestRate, 
            numberOfPayments, 
            monthlyPayment, 
            extraPayment, 
            loanStartDate
        );
        
        const extraPaymentTotalInterest = extraPaymentSchedule.reduce((sum, payment) => sum + payment.interest, 0);
        const newPayoffDate = extraPaymentSchedule[extraPaymentSchedule.length - 1].date;
        const timeSavedMonths = numberOfPayments - extraPaymentSchedule.length;
        const interestSaved = totalInterest - extraPaymentTotalInterest;
        
        calculationResults.extraPaymentResults = {
            newPayoffDate: newPayoffDate,
            timeSaved: timeSavedMonths,
            interestSaved: interestSaved,
            amortizationSchedule: extraPaymentSchedule
        };
    }
    
    // Update UI with results
    updateResultsUI();
}

/**
 * Generate amortization schedule
 * 
 * @param {number} loanAmount - Initial loan amount
 * @param {number} monthlyInterestRate - Monthly interest rate (decimal)
 * @param {number} numberOfPayments - Total number of payments
 * @param {number} monthlyPayment - Monthly principal and interest payment
 * @param {number} extraPayment - Extra monthly payment
 * @param {Date} startDate - Loan start date
 * @returns {Array} Amortization schedule
 */
function generateAmortizationSchedule(loanAmount, monthlyInterestRate, numberOfPayments, monthlyPayment, extraPayment, startDate) {
    const schedule = [];
    let balance = loanAmount;
    let paymentNumber = 1;
    let currentDate = new Date(startDate);
    
    while (balance > 0 && paymentNumber <= numberOfPayments) {
        const interest = balance * monthlyInterestRate;
        let principal = monthlyPayment - interest;
        let actualExtraPayment = 0;
        
        // Add extra payment if applicable
        if (extraPayment > 0) {
            actualExtraPayment = Math.min(extraPayment, balance - principal);
            principal += actualExtraPayment;
        }
        
        // Adjust final payment if needed
        if (principal > balance) {
            principal = balance;
        }
        
        // Calculate new balance
        balance -= principal;
        
        // Create payment object
        const payment = {
            paymentNumber: paymentNumber,
            date: new Date(currentDate),
            payment: monthlyPayment,
            principal: principal - actualExtraPayment,
            interest: interest,
            extraPayment: actualExtraPayment,
            balance: balance,
            totalPrincipal: principal
        };
        
        schedule.push(payment);
        
        // Break if balance is paid off
        if (balance <= 0) {
            break;
        }
        
        // Increment date and payment number
        currentDate.setMonth(currentDate.getMonth() + 1);
        paymentNumber++;
    }
    
    return schedule;
}

/**
 * Update UI with calculation results
 */
function updateResultsUI() {
    const countryCode = elements.country.value;
    const countryParams = COUNTRY_PARAMS[countryCode];
    
    // Format currency values
    const formatCurrency = (value) => {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: countryParams.currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };
    
    // Format date values
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long'
        }).format(date);
    };
    
    // Update payment breakdown
    elements.principalInterest.textContent = formatCurrency(calculationResults.monthlyPayment);
    elements.monthlyPropertyTax.textContent = formatCurrency(calculationResults.monthlyPropertyTax);
    elements.monthlyInsurance.textContent = formatCurrency(calculationResults.monthlyInsurance);
    
    // Show/hide PMI
    if (calculationResults.monthlyPMI > 0) {
        elements.monthlyPMI.textContent = formatCurrency(calculationResults.monthlyPMI);
        elements.pmiContainer.style.display = 'flex';
    } else {
        elements.pmiContainer.style.display = 'none';
    }
    
    // Show/hide HOA
    if (calculationResults.monthlyHOA > 0) {
        elements.monthlyHOA.textContent = formatCurrency(calculationResults.monthlyHOA);
        elements.hoaContainer.style.display = 'flex';
    } else {
        elements.hoaContainer.style.display = 'none';
    }
    
    // Update total payment
    elements.totalPayment.textContent = formatCurrency(calculationResults.totalMonthlyPayment);
    
    // Update loan summary
    elements.loanAmount.textContent = formatCurrency(calculationResults.loanAmount);
    elements.totalPrincipal.textContent = formatCurrency(calculationResults.totalPrincipal);
    elements.totalInterest.textContent = formatCurrency(calculationResults.totalInterest);
    elements.totalCost.textContent = formatCurrency(calculationResults.totalCost);
    elements.payoffDate.textContent = formatDate(calculationResults.payoffDate);
    
    // Update extra payment summary if applicable
    const extraPayment = parseFloat(elements.extraPayment.value) || 0;
    if (extraPayment > 0) {
        elements.extraPaymentSummary.style.display = 'block';
        elements.newPayoffDate.textContent = formatDate(calculationResults.extraPaymentResults.newPayoffDate);
        
        // Format time saved
        const timeSavedMonths = calculationResults.extraPaymentResults.timeSaved;
        const years = Math.floor(timeSavedMonths / 12);
        const months = timeSavedMonths % 12;
        let timeSavedText = '';
        
        if (years > 0) {
            timeSavedText += `${years} year${years !== 1 ? 's' : ''}`;
        }
        
        if (months > 0) {
            if (timeSavedText) {
                timeSavedText += ' and ';
            }
            timeSavedText += `${months} month${months !== 1 ? 's' : ''}`;
        }
        
        elements.timeSaved.textContent = timeSavedText;
        elements.interestSaved.textContent = formatCurrency(calculationResults.extraPaymentResults.interestSaved);
        
        // Show comparison chart
        elements.comparisonChartWrapper.style.display = 'block';
    } else {
        elements.extraPaymentSummary.style.display = 'none';
        elements.comparisonChartWrapper.style.display = 'none';
    }
    
    // Update amortization schedule
    displayAmortizationSchedule(elements.showYearly.classList.contains('active') ? 'yearly' : 'monthly');
    
    // Update charts
    updateCharts();
}

/**
 * Display amortization schedule
 * 
 * @param {string} viewType - 'yearly' or 'monthly'
 */
function displayAmortizationSchedule(viewType) {
    const countryCode = elements.country.value;
    const countryParams = COUNTRY_PARAMS[countryCode];
    const extraPayment = parseFloat(elements.extraPayment.value) || 0;
    
    // Choose which schedule to display
    const schedule = extraPayment > 0 ? 
        calculationResults.extraPaymentResults.amortizationSchedule : 
        calculationResults.amortizationSchedule;
    
    // Clear existing rows
    elements.amortizationTableBody.innerHTML = '';
    
    // Format currency values
    const formatCurrency = (value) => {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: countryParams.currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };
    
    // Format date values
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long'
        }).format(date);
    };
    
    if (viewType === 'yearly') {
        // Group by year
        const yearlyData = {};
        
        schedule.forEach(payment => {
            const year = payment.date.getFullYear();
            
            if (!yearlyData[year]) {
                yearlyData[year] = {
                    year: year,
                    totalPayment: 0,
                    totalPrincipal: 0,
                    totalInterest: 0,
                    totalExtraPayment: 0,
                    finalBalance: payment.balance,
                    date: payment.date
                };
            }
            
            yearlyData[year].totalPayment += payment.payment;
            yearlyData[year].totalPrincipal += payment.principal;
            yearlyData[year].totalInterest += payment.interest;
            yearlyData[year].totalExtraPayment += payment.extraPayment;
            yearlyData[year].finalBalance = payment.balance;
            yearlyData[year].date = payment.date;
        });
        
        // Create yearly rows
        Object.values(yearlyData).forEach(yearData => {
            const row = document.createElement('tr');
            row.classList.add('yearly-summary');
            
            row.innerHTML = `
                <td>${yearData.year}</td>
                <td>${formatDate(yearData.date)}</td>
                <td>${formatCurrency(yearData.totalPayment)}</td>
                <td>${formatCurrency(yearData.totalPrincipal)}</td>
                <td>${formatCurrency(yearData.totalInterest)}</td>
                <td>${formatCurrency(yearData.totalExtraPayment)}</td>
                <td>${formatCurrency(yearData.finalBalance)}</td>
            `;
            
            elements.amortizationTableBody.appendChild(row);
        });
    } else {
        // Display monthly data
        schedule.forEach(payment => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${payment.paymentNumber}</td>
                <td>${formatDate(payment.date)}</td>
                <td>${formatCurrency(payment.payment)}</td>
                <td>${formatCurrency(payment.principal)}</td>
                <td>${formatCurrency(payment.interest)}</td>
                <td>${formatCurrency(payment.extraPayment)}</td>
                <td>${formatCurrency(payment.balance)}</td>
            `;
            
            elements.amortizationTableBody.appendChild(row);
        });
    }
}

/**
 * Update charts with calculation results
 */
function updateCharts() {
    const countryCode = elements.country.value;
    const countryParams = COUNTRY_PARAMS[countryCode];
    const extraPayment = parseFloat(elements.extraPayment.value) || 0;
    
    // Destroy existing charts
    if (paymentBreakdownChart) {
        paymentBreakdownChart.destroy();
    }
    
    if (balanceChart) {
        balanceChart.destroy();
    }
    
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    // Create payment breakdown chart
    const paymentBreakdownData = {
        labels: ['Principal & Interest', 'Property Tax', 'Insurance'],
        datasets: [{
            data: [
                calculationResults.monthlyPayment,
                calculationResults.monthlyPropertyTax,
                calculationResults.monthlyInsurance
            ],
            backgroundColor: ['#4a6da7', '#a7724a', '#4aa77c']
        }]
    };
    
    // Add PMI if applicable
    if (calculationResults.monthlyPMI > 0) {
        paymentBreakdownData.labels.push('PMI');
        paymentBreakdownData.datasets[0].data.push(calculationResults.monthlyPMI);
        paymentBreakdownData.datasets[0].backgroundColor.push('#a74a6d');
    }
    
    // Add HOA if applicable
    if (calculationResults.monthlyHOA > 0) {
        paymentBreakdownData.labels.push('HOA Fees');
        paymentBreakdownData.datasets[0].data.push(calculationResults.monthlyHOA);
        paymentBreakdownData.datasets[0].backgroundColor.push('#4a9da7');
    }
    
    paymentBreakdownChart = new Chart(elements.paymentBreakdownChart, {
        type: 'doughnut',
        data: paymentBreakdownData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            return `${context.label}: ${new Intl.NumberFormat(undefined, {
                                style: 'currency',
                                currency: countryParams.currencyCode
                            }).format(value)}`;
                        }
                    }
                }
            }
        }
    });
    
    // Create balance over time chart
    const schedule = extraPayment > 0 ? 
        calculationResults.extraPaymentResults.amortizationSchedule : 
        calculationResults.amortizationSchedule;
    
    // Sample data points (every 12 months)
    const sampleInterval = Math.max(1, Math.floor(schedule.length / 20));
    const balanceLabels = [];
    const balanceData = [];
    const principalData = [];
    const interestData = [];
    
    let cumulativePrincipal = 0;
    let cumulativeInterest = 0;
    
    for (let i = 0; i < schedule.length; i += sampleInterval) {
        const payment = schedule[i];
        balanceLabels.push(new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short'
        }).format(payment.date));
        
        balanceData.push(payment.balance);
        
        // Calculate cumulative principal and interest
        if (i === 0) {
            cumulativePrincipal = payment.totalPrincipal;
            cumulativeInterest = payment.interest;
        } else {
            for (let j = i - sampleInterval + 1; j <= i; j++) {
                if (j < schedule.length) {
                    cumulativePrincipal += schedule[j].totalPrincipal;
                    cumulativeInterest += schedule[j].interest;
                }
            }
        }
        
        principalData.push(cumulativePrincipal);
        interestData.push(cumulativeInterest);
    }
    
    // Add final point if not included
    if ((schedule.length - 1) % sampleInterval !== 0) {
        const finalPayment = schedule[schedule.length - 1];
        balanceLabels.push(new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short'
        }).format(finalPayment.date));
        
        balanceData.push(finalPayment.balance);
        
        // Calculate final cumulative values
        let finalPrincipal = 0;
        let finalInterest = 0;
        
        for (const payment of schedule) {
            finalPrincipal += payment.totalPrincipal;
            finalInterest += payment.interest;
        }
        
        principalData.push(finalPrincipal);
        interestData.push(finalInterest);
    }
    
    balanceChart = new Chart(elements.balanceChart, {
        type: 'line',
        data: {
            labels: balanceLabels,
            datasets: [{
                label: 'Remaining Balance',
                data: balanceData,
                borderColor: '#4a6da7',
                backgroundColor: 'rgba(74, 109, 167, 0.1)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat(undefined, {
                                style: 'currency',
                                currency: countryParams.currencyCode,
                                maximumFractionDigits: 0
                            }).format(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Balance: ${new Intl.NumberFormat(undefined, {
                                style: 'currency',
                                currency: countryParams.currencyCode
                            }).format(context.raw)}`;
                        }
                    }
                }
            }
        }
    });
    
    // Create comparison chart if extra payments
    if (extraPayment > 0) {
        const regularSchedule = calculationResults.amortizationSchedule;
        const extraSchedule = calculationResults.extraPaymentResults.amortizationSchedule;
        
        // Sample data points
        const maxLength = Math.max(regularSchedule.length, extraSchedule.length);
        const comparisonInterval = Math.max(1, Math.floor(maxLength / 20));
        
        const comparisonLabels = [];
        const regularBalanceData = [];
        const extraBalanceData = [];
        
        for (let i = 0; i < maxLength; i += comparisonInterval) {
            // Add label from regular schedule if available, otherwise from extra schedule
            if (i < regularSchedule.length) {
                comparisonLabels.push(new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'short'
                }).format(regularSchedule[i].date));
            } else if (i < extraSchedule.length) {
                comparisonLabels.push(new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'short'
                }).format(extraSchedule[i].date));
            }
            
            // Add regular balance data if available
            if (i < regularSchedule.length) {
                regularBalanceData.push(regularSchedule[i].balance);
            } else {
                regularBalanceData.push(null);
            }
            
            // Add extra payment balance data if available
            if (i < extraSchedule.length) {
                extraBalanceData.push(extraSchedule[i].balance);
            } else {
                extraBalanceData.push(null);
            }
        }
        
        comparisonChart = new Chart(elements.comparisonChart, {
            type: 'line',
            data: {
                labels: comparisonLabels,
                datasets: [
                    {
                        label: 'Without Extra Payments',
                        data: regularBalanceData,
                        borderColor: '#4a6da7',
                        backgroundColor: 'rgba(74, 109, 167, 0.1)',
                        fill: true,
                        tension: 0.1
                    },
                    {
                        label: 'With Extra Payments',
                        data: extraBalanceData,
                        borderColor: '#a7724a',
                        backgroundColor: 'rgba(167, 114, 74, 0.1)',
                        fill: true,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat(undefined, {
                                    style: 'currency',
                                    currency: countryParams.currencyCode,
                                    maximumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${new Intl.NumberFormat(undefined, {
                                    style: 'currency',
                                    currency: countryParams.currencyCode
                                }).format(context.raw)}`;
                            }
                        }
                    }
                }
            }
        });
    }
}

/**
 * Debounce function to limit how often a function is called
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// Initialize FAQ items
document.addEventListener('DOMContentLoaded', function() {
    // Open first FAQ item by default
    const firstFaqItem = document.querySelector('.faq-item');
    if (firstFaqItem) {
        firstFaqItem.classList.add('active');
    }
});
