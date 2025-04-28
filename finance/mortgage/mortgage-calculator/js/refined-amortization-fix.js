/**
 * Refined Amortization Table Fix
 * This JavaScript file ensures the amortization table is properly populated
 * and displayed when the calculator is used, with additional fallback mechanisms
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Refined amortization fix loaded');
    
    // Force create results container if it doesn't exist
    ensureResultsContainerExists();
    
    // Get the calculate button with multiple fallback selectors
    const calculateButton = document.querySelector('#calculate-button') || 
                           document.querySelector('button[type="submit"]') ||
                           document.querySelector('.btn-primary') ||
                           document.querySelector('form button');
    
    if (calculateButton) {
        console.log('Calculate button found, adding event listener');
        // Add event listener to the calculate button
        calculateButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Calculate button clicked');
            calculateMortgage();
        });
        
        // Also trigger calculation on form submission
        const form = document.querySelector('#mortgage-calculator-form') || 
                    document.querySelector('form.calculator-form') ||
                    document.querySelector('form');
        
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                console.log('Form submitted');
                calculateMortgage();
            });
        }
    } else {
        console.error('Calculate button not found');
    }
    
    // Initialize the form with default values
    initializeForm();
    
    // Force initial calculation to ensure results are shown
    setTimeout(function() {
        console.log('Forcing initial calculation');
        calculateMortgage();
    }, 500);
});

function ensureResultsContainerExists() {
    // Check if results container exists, create it if not
    let resultsContainer = document.querySelector('.results-container');
    if (!resultsContainer) {
        console.log('Creating results container');
        resultsContainer = document.createElement('div');
        resultsContainer.className = 'results-container';
        
        const calculatorContainer = document.querySelector('.calculator-container');
        if (calculatorContainer) {
            calculatorContainer.appendChild(resultsContainer);
        } else {
            console.error('Calculator container not found');
            // Fallback: append to form or main content
            const form = document.querySelector('#mortgage-calculator-form') || 
                        document.querySelector('form.calculator-form') ||
                        document.querySelector('form');
            
            if (form) {
                form.parentNode.insertBefore(resultsContainer, form.nextSibling);
            } else {
                const mainContent = document.querySelector('.main-content') || 
                                   document.querySelector('#main-content') ||
                                   document.querySelector('main');
                
                if (mainContent) {
                    mainContent.appendChild(resultsContainer);
                } else {
                    console.error('No suitable container found for results');
                    // Last resort: append to body
                    document.body.appendChild(resultsContainer);
                }
            }
        }
    }
}

function initializeForm() {
    console.log('Initializing form');
    
    // Set default values if not already set
    const homePrice = document.querySelector('input[name="home_price"]');
    if (homePrice && !homePrice.value) {
        homePrice.value = '300000';
    }
    
    const downPayment = document.querySelector('input[name="down_payment"]');
    if (downPayment && !downPayment.value) {
        downPayment.value = '60000';
    }
    
    const downPaymentPercent = document.querySelector('input[name="down_payment_percent"]');
    if (downPaymentPercent && !downPaymentPercent.value) {
        downPaymentPercent.value = '20';
    }
    
    const interestRate = document.querySelector('input[name="interest_rate"]');
    if (interestRate && !interestRate.value) {
        interestRate.value = '4.5';
    }
    
    const propertyTax = document.querySelector('input[name="property_tax"]');
    if (propertyTax && !propertyTax.value) {
        propertyTax.value = '3600';
    }
    
    const homeInsurance = document.querySelector('input[name="home_insurance"]');
    if (homeInsurance && !homeInsurance.value) {
        homeInsurance.value = '1200';
    }
    
    // Set loan start date to today if not set
    const loanStartDate = document.querySelector('input[name="loan_start_date"]');
    if (loanStartDate && !loanStartDate.value) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        loanStartDate.value = `${year}-${month}-${day}`;
    }
    
    // Add event listeners for linked fields
    if (homePrice && downPayment && downPaymentPercent) {
        homePrice.addEventListener('input', updateDownPaymentPercent);
        downPayment.addEventListener('input', updateDownPaymentPercent);
        downPaymentPercent.addEventListener('input', updateDownPayment);
    }
}

function updateDownPaymentPercent() {
    const homePrice = document.querySelector('input[name="home_price"]');
    const downPayment = document.querySelector('input[name="down_payment"]');
    const downPaymentPercent = document.querySelector('input[name="down_payment_percent"]');
    
    if (homePrice && downPayment && downPaymentPercent) {
        const homePriceValue = parseFloat(homePrice.value.replace(/[^0-9.]/g, '')) || 0;
        const downPaymentValue = parseFloat(downPayment.value.replace(/[^0-9.]/g, '')) || 0;
        
        if (homePriceValue > 0) {
            const percent = (downPaymentValue / homePriceValue) * 100;
            downPaymentPercent.value = percent.toFixed(2);
        }
    }
}

function updateDownPayment() {
    const homePrice = document.querySelector('input[name="home_price"]');
    const downPayment = document.querySelector('input[name="down_payment"]');
    const downPaymentPercent = document.querySelector('input[name="down_payment_percent"]');
    
    if (homePrice && downPayment && downPaymentPercent) {
        const homePriceValue = parseFloat(homePrice.value.replace(/[^0-9.]/g, '')) || 0;
        const percentValue = parseFloat(downPaymentPercent.value.replace(/[^0-9.]/g, '')) || 0;
        
        if (homePriceValue > 0 && percentValue > 0) {
            const downPaymentValue = (homePriceValue * percentValue) / 100;
            downPayment.value = downPaymentValue.toFixed(2);
        }
    }
}

function calculateMortgage() {
    console.log('Calculating mortgage');
    
    // Ensure results container exists
    ensureResultsContainerExists();
    
    // Get input values with fallbacks
    const homePrice = parseFloat(document.querySelector('input[name="home_price"]')?.value.replace(/[^0-9.]/g, '')) || 300000;
    const downPayment = parseFloat(document.querySelector('input[name="down_payment"]')?.value.replace(/[^0-9.]/g, '')) || 60000;
    const loanTerm = parseInt(document.querySelector('select[name="loan_term"]')?.value) || 30;
    const interestRate = parseFloat(document.querySelector('input[name="interest_rate"]')?.value.replace(/[^0-9.]/g, '')) || 4.5;
    const propertyTax = parseFloat(document.querySelector('input[name="property_tax"]')?.value.replace(/[^0-9.]/g, '')) || 3600;
    const homeInsurance = parseFloat(document.querySelector('input[name="home_insurance"]')?.value.replace(/[^0-9.]/g, '')) || 1200;
    const hoaFees = parseFloat(document.querySelector('input[name="hoa_fees"]')?.value.replace(/[^0-9.]/g, '')) || 0;
    const extraPayment = parseFloat(document.querySelector('input[name="extra_payment"]')?.value.replace(/[^0-9.]/g, '')) || 0;
    
    console.log('Input values:', {
        homePrice,
        downPayment,
        loanTerm,
        interestRate,
        propertyTax,
        homeInsurance,
        hoaFees,
        extraPayment
    });
    
    // Calculate loan amount
    const loanAmount = homePrice - downPayment;
    
    // Calculate monthly interest rate
    const monthlyInterestRate = (interestRate / 100) / 12;
    
    // Calculate number of payments
    const numberOfPayments = loanTerm * 12;
    
    // Calculate monthly principal and interest payment
    const monthlyPrincipalAndInterest = loanAmount * 
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    
    // Calculate monthly property tax
    const monthlyPropertyTax = propertyTax / 12;
    
    // Calculate monthly home insurance
    const monthlyHomeInsurance = homeInsurance / 12;
    
    // Calculate PMI (if down payment is less than 20%)
    const downPaymentPercent = (downPayment / homePrice) * 100;
    const monthlyPMI = downPaymentPercent < 20 ? (loanAmount * 0.005) / 12 : 0;
    
    // Calculate total monthly payment
    const totalMonthlyPayment = monthlyPrincipalAndInterest + monthlyPropertyTax + monthlyHomeInsurance + monthlyPMI + hoaFees;
    
    console.log('Calculated values:', {
        loanAmount,
        monthlyPrincipalAndInterest,
        monthlyPropertyTax,
        monthlyHomeInsurance,
        monthlyPMI,
        totalMonthlyPayment
    });
    
    // Generate amortization schedule
    const amortizationSchedule = generateAmortizationSchedule(loanAmount, monthlyInterestRate, numberOfPayments, monthlyPrincipalAndInterest, extraPayment);
    
    // Display results
    displayResults(
        monthlyPrincipalAndInterest,
        monthlyPropertyTax,
        monthlyHomeInsurance,
        monthlyPMI,
        hoaFees,
        totalMonthlyPayment,
        loanAmount,
        amortizationSchedule
    );
}

function generateAmortizationSchedule(loanAmount, monthlyInterestRate, numberOfPayments, monthlyPayment, extraPayment) {
    console.log('Generating amortization schedule');
    
    const schedule = [];
    let remainingBalance = loanAmount;
    let totalInterestPaid = 0;
    let year = 1;
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;
    
    for (let month = 1; month <= numberOfPayments; month++) {
        // Calculate interest for this month
        const interestPayment = remainingBalance * monthlyInterestRate;
        
        // Calculate principal for this month (including extra payment)
        let principalPayment = monthlyPayment - interestPayment + extraPayment;
        
        // Adjust principal if it's more than the remaining balance
        if (principalPayment > remainingBalance) {
            principalPayment = remainingBalance;
        }
        
        // Update remaining balance
        remainingBalance -= principalPayment;
        
        // Update total interest paid
        totalInterestPaid += interestPayment;
        
        // Update yearly totals
        yearlyPrincipal += principalPayment;
        yearlyInterest += interestPayment;
        
        // If end of year or loan is paid off, add to schedule
        if (month % 12 === 0 || remainingBalance <= 0) {
            schedule.push({
                year: year,
                principalPaid: yearlyPrincipal,
                interestPaid: yearlyInterest,
                totalPaid: yearlyPrincipal + yearlyInterest,
                remainingBalance: remainingBalance > 0 ? remainingBalance : 0
            });
            
            // Reset yearly totals and increment year
            yearlyPrincipal = 0;
            yearlyInterest = 0;
            year++;
        }
        
        // If loan is paid off, break the loop
        if (remainingBalance <= 0) {
            break;
        }
    }
    
    return {
        schedule: schedule,
        totalInterestPaid: totalInterestPaid,
        totalCost: loanAmount + totalInterestPaid,
        payoffDate: new Date(new Date().setFullYear(new Date().getFullYear() + Math.ceil(schedule.length)))
    };
}

function displayResults(principalAndInterest, propertyTax, homeInsurance, pmi, hoaFees, totalMonthlyPayment, loanAmount, amortizationData) {
    console.log('Displaying results');
    
    // Create or get results container
    let resultsContainer = document.querySelector('.results-container');
    if (!resultsContainer) {
        console.error('Results container not found, creating one');
        ensureResultsContainerExists();
        resultsContainer = document.querySelector('.results-container');
    }
    
    // Clear previous results
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    } else {
        console.error('Results container still not found after ensuring it exists');
        return;
    }
    
    // Create monthly payment breakdown section
    const paymentBreakdown = document.createElement('div');
    paymentBreakdown.className = 'payment-breakdown results-section';
    paymentBreakdown.innerHTML = `
        <h2>Monthly Payment Breakdown</h2>
        <div class="breakdown-item">
            <span>Principal & Interest:</span>
            <span>$${principalAndInterest.toFixed(2)}</span>
        </div>
        <div class="breakdown-item">
            <span>Property Tax:</span>
            <span>$${propertyTax.toFixed(2)}</span>
        </div>
        <div class="breakdown-item">
            <span>Home Insurance:</span>
            <span>$${homeInsurance.toFixed(2)}</span>
        </div>
        ${pmi > 0 ? `
        <div class="breakdown-item">
            <span>PMI:</span>
            <span>$${pmi.toFixed(2)}</span>
        </div>
        ` : ''}
        ${hoaFees > 0 ? `
        <div class="breakdown-item">
            <span>HOA Fees:</span>
            <span>$${hoaFees.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="breakdown-item total">
            <span>Total Monthly Payment:</span>
            <span>$${totalMonthlyPayment.toFixed(2)}</span>
        </div>
    `;
    resultsContainer.appendChild(paymentBreakdown);
    
    // Create loan summary section
    const loanSummary = document.createElement('div');
    loanSummary.className = 'loan-summary results-section';
    loanSummary.innerHTML = `
        <h2>Loan Summary</h2>
        <div class="summary-item">
            <span>Loan Amount:</span>
            <span>$${loanAmount.toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <span>Total Interest Paid:</span>
            <span>$${amortizationData.totalInterestPaid.toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <span>Total Cost of Loan:</span>
            <span>$${amortizationData.totalCost.toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <span>Payoff Date:</span>
            <span>${amortizationData.payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </div>
    `;
    resultsContainer.appendChild(loanSummary);
    
    // Create amortization schedule section
    const amortizationSection = document.createElement('div');
    amortizationSection.className = 'amortization-schedule results-section';
    amortizationSection.innerHTML = `
        <h2>Amortization Schedule</h2>
        <p>This table shows how your loan balance decreases over time as you make payments.</p>
        <div class="amortization-table-container">
            <table class="amortization-table">
                <thead>
                    <tr>
                        <th>Year</th>
                        <th>Principal Paid</th>
                        <th>Interest Paid</th>
                        <th>Total Paid</th>
                        <th>Remaining Balance</th>
                    </tr>
                </thead>
                <tbody>
                    ${amortizationData.schedule.map(entry => `
                        <tr>
                            <td>${entry.year}</td>
                            <td>$${entry.principalPaid.toFixed(2)}</td>
                            <td>$${entry.interestPaid.toFixed(2)}</td>
                            <td>$${entry.totalPaid.toFixed(2)}</td>
                            <td>$${entry.remainingBalance.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    resultsContainer.appendChild(amortizationSection);
    
    // Add styling to results
    const style = document.createElement('style');
    style.textContent = `
        .results-container {
            margin-top: 2rem !important;
            border-top: 1px solid #dee2e6 !important;
            padding-top: 2rem !important;
        }
        .results-section {
            margin-bottom: 2rem !important;
        }
        .results-section h2 {
            margin-top: 0 !important;
            margin-bottom: 1rem !important;
            font-size: 1.5rem !important;
            font-weight: 600 !important;
            color: #212529 !important;
        }
        .breakdown-item, .summary-item {
            display: flex !important;
            justify-content: space-between !important;
            margin-bottom: 0.5rem !important;
            padding: 0.5rem 0 !important;
            border-bottom: 1px solid #f0f0f0 !important;
        }
        .breakdown-item.total, .summary-item.total {
            font-weight: bold !important;
            border-top: 2px solid #dee2e6 !important;
            margin-top: 0.5rem !important;
        }
        .amortization-table-container {
            overflow-x: auto !important;
            margin-top: 1rem !important;
            margin-bottom: 2rem !important;
            display: block !important;
            width: 100% !important;
        }
        .amortization-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 1rem !important;
            border: 1px solid #dee2e6 !important;
        }
        .amortization-table th, .amortization-table td {
            padding: 0.75rem !important;
            vertical-align: top !important;
            border-top: 1px solid #dee2e6 !important;
            text-align: right !important;
            font-size: 0.9rem !important;
        }
        .amortization-table th {
            background-color: #f8f9fa !important;
            font-weight: 600 !important;
            text-align: center !important;
            border-bottom: 2px solid #dee2e6 !important;
        }
        .amortization-table tbody tr:nth-of-type(odd) {
            background-color: rgba(0, 0, 0, 0.05) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
    
    console.log('Results displayed successfully');
}
