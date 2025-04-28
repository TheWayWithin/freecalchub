/**
 * Aggressive Amortization Table Fix
 * This JavaScript file ensures the amortization table is properly populated
 * and displayed when the calculator is used
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get the calculate button
    const calculateButton = document.querySelector('#calculate-button') || 
                           document.querySelector('button[type="submit"]') ||
                           document.querySelector('.btn-primary');
    
    if (calculateButton) {
        // Add event listener to the calculate button
        calculateButton.addEventListener('click', function(e) {
            e.preventDefault();
            calculateMortgage();
        });
    }
    
    // Initialize the form with default values
    initializeForm();
});

function initializeForm() {
    // Set default values if not already set
    if (!document.querySelector('input[name="home_price"]').value) {
        document.querySelector('input[name="home_price"]').value = '300000';
    }
    
    if (!document.querySelector('input[name="down_payment"]').value) {
        document.querySelector('input[name="down_payment"]').value = '60000';
    }
    
    if (!document.querySelector('input[name="down_payment_percent"]').value) {
        document.querySelector('input[name="down_payment_percent"]').value = '20';
    }
    
    if (!document.querySelector('input[name="interest_rate"]').value) {
        document.querySelector('input[name="interest_rate"]').value = '4.5';
    }
    
    if (!document.querySelector('input[name="property_tax"]').value) {
        document.querySelector('input[name="property_tax"]').value = '3600';
    }
    
    if (!document.querySelector('input[name="home_insurance"]').value) {
        document.querySelector('input[name="home_insurance"]').value = '1200';
    }
    
    // Add event listeners for linked fields
    document.querySelector('input[name="home_price"]').addEventListener('input', updateDownPaymentPercent);
    document.querySelector('input[name="down_payment"]').addEventListener('input', updateDownPaymentPercent);
    document.querySelector('input[name="down_payment_percent"]').addEventListener('input', updateDownPayment);
}

function updateDownPaymentPercent() {
    const homePrice = parseFloat(document.querySelector('input[name="home_price"]').value.replace(/[^0-9.]/g, '')) || 0;
    const downPayment = parseFloat(document.querySelector('input[name="down_payment"]').value.replace(/[^0-9.]/g, '')) || 0;
    
    if (homePrice > 0) {
        const percent = (downPayment / homePrice) * 100;
        document.querySelector('input[name="down_payment_percent"]').value = percent.toFixed(2);
    }
}

function updateDownPayment() {
    const homePrice = parseFloat(document.querySelector('input[name="home_price"]').value.replace(/[^0-9.]/g, '')) || 0;
    const percent = parseFloat(document.querySelector('input[name="down_payment_percent"]').value.replace(/[^0-9.]/g, '')) || 0;
    
    if (homePrice > 0 && percent > 0) {
        const downPayment = (homePrice * percent) / 100;
        document.querySelector('input[name="down_payment"]').value = downPayment.toFixed(2);
    }
}

function calculateMortgage() {
    // Get input values
    const homePrice = parseFloat(document.querySelector('input[name="home_price"]').value.replace(/[^0-9.]/g, '')) || 0;
    const downPayment = parseFloat(document.querySelector('input[name="down_payment"]').value.replace(/[^0-9.]/g, '')) || 0;
    const loanTerm = parseInt(document.querySelector('select[name="loan_term"]').value) || 30;
    const interestRate = parseFloat(document.querySelector('input[name="interest_rate"]').value.replace(/[^0-9.]/g, '')) || 0;
    const propertyTax = parseFloat(document.querySelector('input[name="property_tax"]').value.replace(/[^0-9.]/g, '')) || 0;
    const homeInsurance = parseFloat(document.querySelector('input[name="home_insurance"]').value.replace(/[^0-9.]/g, '')) || 0;
    const hoaFees = parseFloat(document.querySelector('input[name="hoa_fees"]')?.value.replace(/[^0-9.]/g, '')) || 0;
    const extraPayment = parseFloat(document.querySelector('input[name="extra_payment"]')?.value.replace(/[^0-9.]/g, '')) || 0;
    
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
    // Create or get results container
    let resultsContainer = document.querySelector('.results-container');
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.className = 'results-container';
        document.querySelector('.calculator-container').appendChild(resultsContainer);
    }
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
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
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}
