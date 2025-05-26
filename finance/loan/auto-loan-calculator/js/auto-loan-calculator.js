/*
 * FreecalcHub.com - Auto Loan Calculator
 * Version: 1.0
 * Date Created: May 26, 2025
 * Description: Calculates auto loan payments, total costs, and amortization schedule.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const vehiclePriceInput = document.getElementById('vehiclePrice');
    const downPaymentInput = document.getElementById('downPayment');
    const tradeInValueInput = document.getElementById('tradeInValue');
    const salesTaxInput = document.getElementById('salesTax'); // Percentage
    const additionalFeesInput = document.getElementById('additionalFees');
    const loanAmountInput = document.getElementById('loanAmount'); // Readonly
    const interestRateInput = document.getElementById('interestRate'); // Annual Percentage Rate
    const loanTermSelect = document.getElementById('loanTerm'); // Years

    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const calculatorForm = document.getElementById('calculatorForm');

    const errorMessagesDiv = document.getElementById('errorMessages');
    const resultsSection = document.getElementById('resultsSection');

    const monthlyPaymentResult = document.getElementById('monthlyPaymentResult');
    const totalPrincipalResult = document.getElementById('totalPrincipalResult');
    const totalInterestResult = document.getElementById('totalInterestResult');
    const totalCostResult = document.getElementById('totalCostResult');
    const payoffDateResult = document.getElementById('payoffDateResult');

    const paymentChartContainer = document.getElementById('paymentChartContainer');
    const amortizationTableContainer = document.getElementById('amortizationTableContainer');

    let paymentChart = null; // To store Chart.js instance

    // --- Auto-calculate Loan Amount ---
    function calculateLoanAmount() {
        const price = parseFloat(vehiclePriceInput.value) || 0;
        const downPayment = parseFloat(downPaymentInput.value) || 0;
        const tradeIn = parseFloat(tradeInValueInput.value) || 0;
        const taxRate = (parseFloat(salesTaxInput.value) || 0) / 100;
        const fees = parseFloat(additionalFeesInput.value) || 0;

        const taxableAmount = price - tradeIn; // Tax often applied after trade-in
        const salesTaxAmount = taxableAmount > 0 ? taxableAmount * taxRate : 0;
        
        const amountToFinance = price + salesTaxAmount + fees - downPayment - tradeIn;
        loanAmountInput.value = amountToFinance > 0 ? amountToFinance.toFixed(2) : '0.00';
    }

    [vehiclePriceInput, downPaymentInput, tradeInValueInput, salesTaxInput, additionalFeesInput].forEach(input => {
        input.addEventListener('input', calculateLoanAmount);
    });

    // --- Main Calculation ---
    function handleCalculate() {
        clearErrors();
        calculateLoanAmount(); // Ensure loan amount is up-to-date

        const P = parseFloat(loanAmountInput.value); // Principal
        const annualInterestRate = parseFloat(interestRateInput.value);
        const loanTermYears = parseInt(loanTermSelect.value);

        // Validation
        let errors = [];
        if (isNaN(P) || P <= 0) {
            errors.push("Calculated Loan Amount must be positive. Check vehicle price and other inputs.");
            // Highlight fields contributing to loan amount if P is an issue
            [vehiclePriceInput, salesTaxInput, additionalFeesInput].forEach(el => el.classList.add('input-error'));
        } else {
             [vehiclePriceInput, salesTaxInput, additionalFeesInput].forEach(el => el.classList.remove('input-error'));
        }
        if (isNaN(annualInterestRate) || annualInterestRate < 0) {
            errors.push("Interest Rate (APR) must be a non-negative number.");
            interestRateInput.classList.add('input-error');
        } else {
            interestRateInput.classList.remove('input-error');
        }
        if (isNaN(loanTermYears) || loanTermYears <= 0) {
            errors.push("Please select a valid Loan Term.");
            loanTermSelect.classList.add('input-error');
        } else {
            loanTermSelect.classList.remove('input-error');
        }

        if (parseFloat(vehiclePriceInput.value) <=0 || isNaN(parseFloat(vehiclePriceInput.value))) {
             errors.push("Vehicle price must be a positive number.");
             vehiclePriceInput.classList.add('input-error');
        } else {
            vehiclePriceInput.classList.remove('input-error');
        }


        if (errors.length > 0) {
            showErrors(errors);
            hideResults();
            return;
        }

        const i = (annualInterestRate / 100) / 12; // Monthly interest rate
        const n = loanTermYears * 12; // Total number of payments

        let M; // Monthly Payment
        if (i === 0) { // Interest rate is 0%
            M = P / n;
        } else {
            M = P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
        }
        
        if (isNaN(M) || M <= 0 || !isFinite(M)) {
            errors.push("Could not calculate a valid monthly payment. Please check your inputs (e.g., loan amount might be too low for the term).");
            showErrors(errors);
            hideResults();
            return;
        }


        const totalPaid = M * n;
        const totalInterest = totalPaid - P;

        const downPayment = parseFloat(downPaymentInput.value) || 0;
        const tradeIn = parseFloat(tradeInValueInput.value) || 0;
        // Total cost = total payments + down payment - trade-in (if trade-in reduces overall out-of-pocket)
        // Or total cost = vehicle price + sales tax + fees + total interest
        const price = parseFloat(vehiclePriceInput.value) || 0;
        const taxRate = (parseFloat(salesTaxInput.value) || 0) / 100;
        const fees = parseFloat(additionalFeesInput.value) || 0;
        const taxableAmount = price - (tradeInValueInput.value && parseFloat(tradeInValueInput.value) > 0 ? parseFloat(tradeInValueInput.value) : 0);
        const salesTaxAmount = taxableAmount > 0 ? taxableAmount * taxRate : 0;

        const totalOutOfPocketCost = totalPaid + downPayment; // Total money paid towards loan & downpayment
                                                       // This could be simplified to initial loan + interest + downpayment.

        // Display Results
        monthlyPaymentResult.textContent = `$${M.toFixed(2)}`;
        totalPrincipalResult.textContent = `$${P.toFixed(2)}`;
        totalInterestResult.textContent = `$${totalInterest.toFixed(2)}`;
        totalCostResult.textContent = `$${(price + salesTaxAmount + fees + totalInterest).toFixed(2)}`;


        // Calculate Payoff Date
        const today = new Date();
        const payoffDate = new Date(today.setMonth(today.getMonth() + n));
        payoffDateResult.textContent = payoffDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        resultsSection.style.display = 'block';
        generateAmortizationSchedule(P, i, n, M);
        generatePaymentChart(P, i, n, M);
    }

    function generateAmortizationSchedule(principal, monthlyRate, numberOfPayments, monthlyPayment) {
        let balance = principal;
        let scheduleHtml = `<table class="amortization-table">
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Payment</th>
                                        <th>Principal Paid</th>
                                        <th>Interest Paid</th>
                                        <th>Remaining Balance</th>
                                    </tr>
                                </thead>
                                <tbody>`;

        for (let month = 1; month <= numberOfPayments; month++) {
            const interestForMonth = balance * monthlyRate;
            const principalForMonth = monthlyPayment - interestForMonth;
            balance -= principalForMonth;
            // Ensure balance doesn't go negative due to floating point issues on the last payment
            if (month === numberOfPayments && Math.abs(balance) < 0.01) {
                balance = 0;
            }

            scheduleHtml += `<tr>
                                <td>${month}</td>
                                <td>$${monthlyPayment.toFixed(2)}</td>
                                <td>$${principalForMonth.toFixed(2)}</td>
                                <td>$${interestForMonth.toFixed(2)}</td>
                                <td>$${balance.toFixed(2)}</td>
                             </tr>`;
        }
        scheduleHtml += `</tbody></table>`;
        amortizationTableContainer.innerHTML = scheduleHtml;
    }

    function generatePaymentChart(principal, monthlyRate, numberOfPayments, monthlyPayment) {
        const labels = [];
        const principalData = [];
        const interestData = [];
        let remainingBalance = principal;

        for (let month = 1; month <= numberOfPayments; month++) {
            labels.push(`Month ${month}`);
            const interestForMonth = remainingBalance * monthlyRate;
            const principalForMonth = monthlyPayment - interestForMonth;
            remainingBalance -= principalForMonth;
            
            principalData.push(principalForMonth);
            interestData.push(interestForMonth);
        }
        
        // Ensure Chart.js is loaded
        if (typeof Chart === 'undefined') {
            paymentChartContainer.innerHTML = '<p class="text-muted">Chart library not loaded. Cannot display payment breakdown chart.</p>';
            return;
        }

        // Destroy previous chart instance if it exists
        if (paymentChart) {
            paymentChart.destroy();
        }

        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Principal Paid',
                    data: principalData,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Interest Paid',
                    data: interestData,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)', // Red
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        };

        const config = {
            type: 'bar', // or 'line'
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false, // Important for fixed height container
                scales: {
                    x: {
                        stacked: true,
                        title: { display: true, text: 'Month of Loan' }
                    },
                    y: {
                        stacked: true,
                        title: { display: true, text: 'Payment Amount ($)' },
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Payment Breakdown (Principal vs. Interest)'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        };
        
        // Create canvas element if it doesn't exist, or clear previous
        paymentChartContainer.innerHTML = '<canvas id="loanPaymentChart"></canvas>';
        const ctx = document.getElementById('loanPaymentChart').getContext('2d');
        paymentChart = new Chart(ctx, config);
    }


    function showErrors(errorsArray) {
        errorMessagesDiv.innerHTML = errorsArray.map(error => `<p>${error}</p>`).join('');
        errorMessagesDiv.style.display = 'block';
    }

    function clearErrors() {
        errorMessagesDiv.innerHTML = '';
        errorMessagesDiv.style.display = 'none';
        // Clear existing input-error classes
        const errorInputs = calculatorForm.querySelectorAll('.input-error');
        errorInputs.forEach(input => input.classList.remove('input-error'));
    }
    
    function hideResults() {
        resultsSection.style.display = 'none';
        amortizationTableContainer.innerHTML = '';
        paymentChartContainer.innerHTML = '';
        if (paymentChart) {
            paymentChart.destroy();
            paymentChart = null;
        }
    }

    function handleReset() {
        calculatorForm.reset();
        loanAmountInput.value = ''; // Clear readonly field
        clearErrors();
        hideResults();
    }

    // --- Event Listeners ---
    calculateButton.addEventListener('click', handleCalculate);
    resetButton.addEventListener('click', handleReset);

    // Initial calculation of loan amount
    calculateLoanAmount();
    hideResults(); // Hide results on page load
});
