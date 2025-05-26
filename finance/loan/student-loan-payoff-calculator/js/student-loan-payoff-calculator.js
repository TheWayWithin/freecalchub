/*
 * FreecalcHub.com - Student Loan Payoff Calculator
 * Version: 1.0
 * Date Created: May 26, 2025
 * Description: Calculates student loan payoff with and without extra payments.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const loanBalanceInput = document.getElementById('loanBalance');
    const interestRateInput = document.getElementById('interestRate'); // Annual Percentage Rate
    const minMonthlyPaymentInput = document.getElementById('minMonthlyPayment');
    const extraMonthlyPaymentInput = document.getElementById('extraMonthlyPayment');
    const oneTimePaymentInput = document.getElementById('oneTimePayment');

    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const calculatorForm = document.getElementById('calculatorForm');

    const errorMessagesDiv = document.getElementById('errorMessages');
    const resultsSection = document.getElementById('resultsSection');

    // Original Plan Results
    const originalPayoffDateResult = document.getElementById('originalPayoffDate');
    const originalInterestResult = document.getElementById('originalInterest');

    // New Plan Results
    const newPayoffDateResult = document.getElementById('newPayoffDate');
    const newInterestResult = document.getElementById('newInterest');

    // Savings Results
    const timeSavedResult = document.getElementById('timeSaved');
    const interestSavedResult = document.getElementById('interestSaved');

    const payoffChartContainer = document.getElementById('payoffChartContainer');
    const amortizationTableContainer = document.getElementById('amortizationTableContainer');

    let payoffChart = null; // To store Chart.js instance

    // --- Calculation Core Function ---
    function calculateLoanDetails(principal, annualRate, monthlyPayment, extraMonthly = 0, oneTimeExtra = 0) {
        if (principal <= 0 || annualRate < 0 || monthlyPayment <= 0) {
            return null; // Invalid base inputs for calculation
        }

        const monthlyRate = (annualRate / 100) / 12;
        let balance = principal;
        let totalInterestPaid = 0;
        let months = 0;
        const MAX_MONTHS = 40 * 12; // Max 40 years to prevent infinite loops for very small payments
        const amortizationSchedule = [];

        // Apply one-time payment upfront if provided
        if (oneTimeExtra > 0 && balance > 0) {
            if (oneTimeExtra >= balance) {
                balance = 0;
            } else {
                balance -= oneTimeExtra;
            }
            // Log this initial extra payment for amortization details
             amortizationSchedule.push({
                month: 0, // Or indicate as initial payment
                payment: oneTimeExtra,
                principalPaid: oneTimeExtra,
                interestPaid: 0,
                extraPayment: oneTimeExtra,
                balance: balance
            });
        }
        
        const actualMonthlyPayment = monthlyPayment + extraMonthly;

        // Check if minimum payment covers interest
        if (monthlyRate > 0 && principal * monthlyRate >= monthlyPayment && extraMonthly <= 0) {
             // If only min payment is made and it doesn't cover interest, loan will grow.
             // For this calculator, we'll assume standard payoff or accelerated payoff.
             // This check is more for standard loan calculators. Here, we expect payoff.
        }


        while (balance > 0 && months < MAX_MONTHS) {
            months++;
            let interestForMonth = balance * monthlyRate;
            if (interestForMonth < 0) interestForMonth = 0; // Safety for 0% rate

            let principalPaidThisMonth = actualMonthlyPayment - interestForMonth;

            if (balance < actualMonthlyPayment) { // Final payment
                principalPaidThisMonth = balance;
                // actualMonthlyPaymentForThisMonth = balance + interestForMonth; // This is what the actual final payment would be
            }
            
            if (principalPaidThisMonth < 0 && monthlyRate > 0) { // Payment doesn't even cover interest
                // This scenario implies the loan balance would grow if only this payment is made.
                // For a payoff calculator, this is an edge case usually prevented by minimum payment requirements.
                // If we reach here with extra payments, it means min payment itself was insufficient.
                // For simplicity, if actualMonthlyPayment doesn't cover interest, we stop or flag error.
                // Let's assume minMonthlyPayment from input is always supposed to be >= interest for original plan.
                return { error: "Minimum payment may not cover interest. Please check inputs." };
            }


            balance -= principalPaidThisMonth;
            totalInterestPaid += interestForMonth;

            amortizationSchedule.push({
                month: months,
                payment: actualMonthlyPayment, // This is the target payment, actual final payment might be less
                principalPaid: principalPaidThisMonth,
                interestPaid: interestForMonth,
                extraPayment: extraMonthly + (months === 1 && oneTimeExtra > 0 && amortizationSchedule.length > 1 ? oneTimeExtra : 0), // Show one time payment application in context of first month of regular payments
                balance: balance < 0.005 ? 0 : balance // Round small balances to 0
            });

            if (balance <= 0.005) { // Consider loan paid if balance is negligible
                balance = 0;
                break;
            }
        }
        
        if (months >= MAX_MONTHS && balance > 0) {
            return { error: "Loan will not be paid off within 40 years with the provided payments. Please increase payments." };
        }

        const payoffDate = new Date();
        payoffDate.setMonth(payoffDate.getMonth() + months);

        return {
            monthsToPayoff: months,
            totalInterestPaid: totalInterestPaid,
            totalAmountPaid: principal + totalInterestPaid + (oneTimeExtra > 0 && amortizationSchedule[0]?.principalPaid === oneTimeExtra ? 0 : oneTimeExtra), // Adjust total paid by one-time if it was separate
            payoffDate: payoffDate,
            amortizationSchedule: amortizationSchedule
        };
    }


    // --- Main Calculation Handler ---
    function handleCalculate() {
        clearErrors();

        const P = parseFloat(loanBalanceInput.value);
        const annualRate = parseFloat(interestRateInput.value);
        const minPayment = parseFloat(minMonthlyPaymentInput.value);
        const extraMonthly = parseFloat(extraMonthlyPaymentInput.value) || 0;
        const oneTime = parseFloat(oneTimePaymentInput.value) || 0;

        let errors = [];
        if (isNaN(P) || P <= 0) { errors.push("Loan Balance must be a positive number."); loanBalanceInput.classList.add('input-error'); }
        if (isNaN(annualRate) || annualRate < 0) { errors.push("Interest Rate must be a non-negative number."); interestRateInput.classList.add('input-error'); }
        if (isNaN(minPayment) || minPayment <= 0) { errors.push("Minimum Monthly Payment must be positive."); minMonthlyPaymentInput.classList.add('input-error'); }
        if (extraMonthly < 0) { errors.push("Extra Monthly Payment cannot be negative."); extraMonthlyPaymentInput.classList.add('input-error'); }
        if (oneTime < 0) { errors.push("One-Time Extra Payment cannot be negative."); oneTimePaymentInput.classList.add('input-error');}
        
        if (annualRate > 0 && P * (annualRate / 100 / 12) > minPayment && extraMonthly <= 0 && oneTime <= 0) {
            errors.push("Minimum monthly payment does not cover the accrued interest. Loan balance will grow. Please increase payment or add extra payments.");
        }


        if (errors.length > 0) {
            showErrors(errors);
            hideResults();
            return;
        }

        // Calculate Original Plan
        const originalPlan = calculateLoanDetails(P, annualRate, minPayment);
        if (originalPlan && originalPlan.error) {
            showErrors([originalPlan.error]);
            hideResults();
            return;
        }
        
        // Calculate New Plan
        const newPlan = calculateLoanDetails(P, annualRate, minPayment, extraMonthly, oneTime);
         if (newPlan && newPlan.error) {
            showErrors([newPlan.error]); // Show error from new plan calculation if any
            // Still display original plan if it was successful
            if(originalPlan){
                originalPayoffDateResult.textContent = originalPlan.payoffDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                originalInterestResult.textContent = `$${originalPlan.totalInterestPaid.toFixed(2)}`;
                resultsSection.style.display = 'block'; // Show at least original plan details
            }
            // Clear new plan and savings sections
            newPayoffDateResult.textContent = '--';
            newInterestResult.textContent = '--';
            timeSavedResult.textContent = '--';
            interestSavedResult.textContent = '--';
            amortizationTableContainer.innerHTML = '';
            if(payoffChart) payoffChart.destroy();
            payoffChartContainer.innerHTML = '';
            return;
        }


        if (!originalPlan || !newPlan) {
            showErrors(["Could not calculate payoff. Please check inputs."]);
            hideResults();
            return;
        }

        // Display Results
        originalPayoffDateResult.textContent = originalPlan.payoffDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        originalInterestResult.textContent = `$${originalPlan.totalInterestPaid.toFixed(2)}`;

        newPayoffDateResult.textContent = newPlan.payoffDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        newInterestResult.textContent = `$${newPlan.totalInterestPaid.toFixed(2)}`;

        const monthsSaved = originalPlan.monthsToPayoff - newPlan.monthsToPayoff;
        const yearsSaved = Math.floor(monthsSaved / 12);
        const remainingMonthsSaved = monthsSaved % 12;
        timeSavedResult.textContent = `${yearsSaved > 0 ? yearsSaved + (yearsSaved === 1 ? ' year' : ' years') : ''} ${remainingMonthsSaved > 0 ? remainingMonthsSaved + (remainingMonthsSaved === 1 ? ' month' : ' months') : ''}`.trim() || '0 months';
        
        const totalInterestSaved = originalPlan.totalInterestPaid - newPlan.totalInterestPaid;
        interestSavedResult.textContent = `$${totalInterestSaved.toFixed(2)}`;

        resultsSection.style.display = 'block';
        generateAmortizationSchedule(newPlan.amortizationSchedule);
        generatePayoffChart(originalPlan.amortizationSchedule, newPlan.amortizationSchedule);
    }

    function generateAmortizationSchedule(schedule) {
        let scheduleHtml = `<table class="amortization-table">
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Payment</th>
                                        <th>Extra Payment</th>
                                        <th>Principal Paid</th>
                                        <th>Interest Paid</th>
                                        <th>Remaining Balance</th>
                                    </tr>
                                </thead>
                                <tbody>`;
        
        schedule.forEach(item => {
             // If month is 0, it's the initial one-time payment
            const displayMonth = item.month === 0 ? "Initial Extra" : item.month;
            const displayPayment = item.month === 0 ? item.payment : (item.payment - item.extraPayment); // Show base payment if not initial
            const displayExtra = item.month === 0 ? 0 : item.extraPayment; // Don't show extra again if initial

            scheduleHtml += `<tr>
                                <td>${displayMonth}</td>
                                <td>$${(item.month > 0 ? displayPayment.toFixed(2) : item.payment.toFixed(2))}</td>
                                <td class="${item.extraPayment > 0 && item.month > 0 ? 'extra-payment-highlight' : ''}">$${(item.month > 0 ? item.extraPayment.toFixed(2) : '0.00')}</td>
                                <td>$${item.principalPaid.toFixed(2)}</td>
                                <td>$${item.interestPaid.toFixed(2)}</td>
                                <td>$${item.balance.toFixed(2)}</td>
                             </tr>`;
        });
        scheduleHtml += `</tbody></table>`;
        amortizationTableContainer.innerHTML = scheduleHtml;
    }

    function generatePayoffChart(originalSchedule, newSchedule) {
        if (typeof Chart === 'undefined') {
            payoffChartContainer.innerHTML = '<p class="text-muted">Chart library not loaded.</p>';
            return;
        }
        if (payoffChart) {
            payoffChart.destroy();
        }

        const originalLabels = originalSchedule.map(item => `Month ${item.month}`);
        const originalData = originalSchedule.map(item => item.balance);

        const newLabels = newSchedule.map(item => `Month ${item.month === 0 ? 'Start' : item.month}`);
        const newData = newSchedule.map(item => item.balance);
        
        // Ensure first point of new schedule starts with original balance if one-time payment applied
        const P = parseFloat(loanBalanceInput.value);
        if(newSchedule.length > 0 && newSchedule[0].month === 0) { // one-time payment was made
            newData.unshift(P); // Add initial balance before one-time payment
            newLabels.unshift("Start");
        }


        const data = {
            labels: originalLabels.length > newLabels.length ? originalLabels : newLabels, // Use the longer label set
            datasets: [
                {
                    label: 'Original Plan Balance',
                    data: originalData,
                    borderColor: 'rgba(255, 99, 132, 1)', // Red
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'New Plan Balance (with Extras)',
                    data: newData,
                    borderColor: 'rgba(54, 162, 235, 1)', // Blue
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    fill: false,
                    tension: 0.1
                }
            ]
        };
        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { title: { display: true, text: 'Loan Balance ($)' }, beginAtZero: true },
                    x: { title: { display: true, text: 'Months' } }
                },
                plugins: {
                    title: { display: true, text: 'Loan Balance Over Time: Original vs. New Plan' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: $${parseFloat(context.raw).toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        };
        payoffChartContainer.innerHTML = '<canvas id="loanPayoffChartCanvas"></canvas>';
        const ctx = document.getElementById('loanPayoffChartCanvas').getContext('2d');
        payoffChart = new Chart(ctx, config);
    }

    function showErrors(errorsArray) {
        errorMessagesDiv.innerHTML = errorsArray.map(error => `<p>${error}</p>`).join('');
        errorMessagesDiv.style.display = 'block';
    }

    function clearErrors() {
        errorMessagesDiv.innerHTML = '';
        errorMessagesDiv.style.display = 'none';
        const errorInputs = calculatorForm.querySelectorAll('.input-error');
        errorInputs.forEach(input => input.classList.remove('input-error'));
    }
    
    function hideResults() {
        resultsSection.style.display = 'none';
        amortizationTableContainer.innerHTML = '';
        payoffChartContainer.innerHTML = '';
        if (payoffChart) {
            payoffChart.destroy();
            payoffChart = null;
        }
    }

    function handleReset() {
        calculatorForm.reset();
        clearErrors();
        hideResults();
    }

    // --- Event Listeners ---
    calculateButton.addEventListener('click', handleCalculate);
    resetButton.addEventListener('click', handleReset);
    
    hideResults(); // Hide results on page load
});
