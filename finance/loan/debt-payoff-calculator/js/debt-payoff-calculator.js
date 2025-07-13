
/*
 * FreecalcHub.com - Debt Payoff Calculator
 * Version: 1.0
 * Date Created: May 26, 2025
 * Description: Calculates debt payoff using Snowball or Avalanche methods.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const debtRowsContainer = document.getElementById('debtRowsContainer');
    const addDebtButton = document.getElementById('addDebtButton');
    const totalMonthlyPaymentInput = document.getElementById('totalMonthlyPayment');
    const payoffStrategySelect = document.getElementById('payoffStrategy');
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const calculatorForm = document.getElementById('calculatorForm');

    const errorMessagesDiv = document.getElementById('errorMessages');
    const resultsSection = document.getElementById('resultsSection');

    const strategyNameDisplay = document.getElementById('strategyNameDisplay');
    const debtFreeDateResult = document.getElementById('debtFreeDate');
    const totalPrincipalResult = document.getElementById('totalPrincipal');
    const totalInterestResult = document.getElementById('totalInterest');
    const monthsToPayoffResult = document.getElementById('monthsToPayoff');

    const payoffChartContainer = document.getElementById('payoffChartContainer');
    const paymentScheduleContainer = document.getElementById('paymentScheduleContainer');

    let payoffChart = null; // To store Chart.js instance
    let debtCounter = 0; // For unique IDs

    // --- Functions ---

    function createDebtRow() {
        debtCounter++;
        const row = document.createElement('div');
        row.className = 'form-row debt-row';
        row.innerHTML = `
            <div class="form-group">
                <label for="debtName_${debtCounter}">Debt Name (Optional)</label>
                <input type="text" id="debtName_${debtCounter}" class="debt-name" placeholder="e.g., Credit Card 1">
            </div>
            <div class="form-group">
                <label for="debtBalance_${debtCounter}">Balance ($)</label>
                <input type="number" id="debtBalance_${debtCounter}" class="debt-balance" placeholder="5000" required step="0.01" min="0">
            </div>
            <div class="form-group">
                <label for="debtApr_${debtCounter}">APR (%)</label>
                <input type="number" id="debtApr_${debtCounter}" class="debt-apr" placeholder="18.9" required step="0.001" min="0">
            </div>
            <div class="form-group">
                <label for="debtMinPayment_${debtCounter}">Min. Payment ($)</label>
                <input type="number" id="debtMinPayment_${debtCounter}" class="debt-min-payment" placeholder="100" required step="0.01" min="0">
            </div>
            <button type="button" class="btn-remove-debt" aria-label="Remove Debt">X</button>
        `;
        row.querySelector('.btn-remove-debt').addEventListener('click', () => {
            row.remove();
            updateRemoveButtonsVisibility();
        });
        return row;
    }

    function addDebt() {
        debtRowsContainer.appendChild(createDebtRow());
        updateRemoveButtonsVisibility();
    }

    function updateRemoveButtonsVisibility() {
        const rows = debtRowsContainer.querySelectorAll('.debt-row');
        rows.forEach((row, index) => {
            const button = row.querySelector('.btn-remove-debt');
            if (button) {
                button.style.display = (rows.length > 1) ? 'inline-block' : 'none';
            }
        });
    }

    function getDebtData() {
        const rows = debtRowsContainer.querySelectorAll('.debt-row');
        const debts = [];
        let isValid = true;
        let totalMinimumPayments = 0;

        rows.forEach((row, index) => {
            const nameInput = row.querySelector('.debt-name');
            const balanceInput = row.querySelector('.debt-balance');
            const aprInput = row.querySelector('.debt-apr');
            const minPaymentInput = row.querySelector('.debt-min-payment');

            // Clear previous errors on these specific inputs
            [balanceInput, aprInput, minPaymentInput].forEach(el => el.classList.remove('input-error'));

            const name = nameInput.value.trim() || `Debt #${index + 1}`;
            const balance = parseFloat(balanceInput.value);
            const apr = parseFloat(aprInput.value);
            const minPayment = parseFloat(minPaymentInput.value);

            let rowValid = true;
            if (isNaN(balance) || balance <= 0) {
                balanceInput.classList.add('input-error'); 
                rowValid = false;
                isValid = false;
            }
            if (isNaN(apr) || apr < 0) {
                aprInput.classList.add('input-error'); 
                rowValid = false;
                isValid = false;
            }
            if (isNaN(minPayment) || minPayment <= 0) {
                minPaymentInput.classList.add('input-error'); 
                rowValid = false;
                isValid = false;
            }
            if (rowValid && apr > 0 && (balance * (apr / 100 / 12)) > minPayment) {
                 minPaymentInput.classList.add('input-error'); 
                 rowValid = false;
                 isValid = false;
            }

            if (rowValid) {
                debts.push({ id: index, name, balance, apr, minPayment, originalMinPayment: minPayment });
                totalMinimumPayments += minPayment;
            }
        });
        return { debts, isValid, totalMinimumPayments };
    }

    function calculatePayoff() {
        clearErrors();
        const { debts, isValid: debtsValid, totalMinimumPayments } = getDebtData();
        const totalMonthlyPayment = parseFloat(totalMonthlyPaymentInput.value);
        const strategy = payoffStrategySelect.value;

        let errors = [];
        if (!debtsValid) errors.push("Please correct the highlighted debt fields. Balance, APR, and Min. Payment are required and must be valid numbers.");
        if (debts.length === 0) errors.push("Please add at least one debt.");
        if (isNaN(totalMonthlyPayment) || totalMonthlyPayment <= 0) {
            errors.push("Total Monthly Payment must be a positive number.");
            totalMonthlyPaymentInput.classList.add('input-error');
        }
        if (debtsValid && debts.length > 0 && totalMonthlyPayment < totalMinimumPayments) {
            errors.push(`Total Monthly Payment ($${totalMonthlyPayment.toFixed(2)}) must be at least the sum of minimum payments ($${totalMinimumPayments.toFixed(2)}).`);
            totalMonthlyPaymentInput.classList.add('input-error');
        }

        if (errors.length > 0) {
            showErrors(errors);
            hideResults();
            return;
        }

        // Make copies of debts for calculation to not alter original input objects
        let workingDebts = JSON.parse(JSON.stringify(debts));
        let paymentSchedule = [];
        let months = 0;
        let totalInterestPaid = 0;
        let totalPrincipalPaid = 0; // Sum of initial balances
        workingDebts.forEach(debt => totalPrincipalPaid += debt.balance);

        const MAX_MONTHS = 50 * 12; // 50 years limit

        // Store initial balances for chart
        const initialBalancesForChart = {};
        workingDebts.forEach(d => initialBalancesForChart[d.name] = d.balance);
        const chartDataPoints = [{ month: 0, ...initialBalancesForChart }];


        while (workingDebts.some(debt => debt.balance > 0) && months < MAX_MONTHS) {
            months++;
            let paymentForThisMonth = totalMonthlyPayment;
            let monthSummary = { month: months, payments: [], totalInterestThisMonth: 0, remainingOverallBalance: 0 };

            // 1. Pay minimums on all debts (except target debt if snowball/avalanche logic dictates)
            workingDebts.forEach(debt => {
                if (debt.balance > 0) {
                    const interestThisMonth = (debt.balance * (debt.apr / 100 / 12));
                    let paymentToThisDebt = debt.minPayment;
                    
                    // If paymentForThisMonth is less than minPayment, use what's left
                    if (paymentForThisMonth < paymentToThisDebt) {
                        paymentToThisDebt = paymentForThisMonth;
                    }

                    let principalPaid = paymentToThisDebt - interestThisMonth;
                    if (principalPaid < 0) principalPaid = 0; // Interest exceeds minimum for this debt portion
                    
                    if (debt.balance < (interestThisMonth + principalPaid)) { // Final payment on this debt
                        principalPaid = debt.balance;
                        paymentToThisDebt = principalPaid + interestThisMonth;
                    }
                    
                    // This part of the logic for payment distribution needs refinement for snowball/avalanche.
                    // The current loop will just pay minimums from totalMonthlyPayment.
                    // Snowball/Avalanche logic should be applied before this loop or within it to allocate "extra" payment.
                }
            });


            // Sort debts based on strategy (inside the loop if balances change significantly, or outside if strategy is fixed)
            if (strategy === 'snowball') {
                workingDebts.sort((a, b) => a.balance === 0 ? 1 : b.balance === 0 ? -1 : a.balance - b.balance);
            } else { // avalanche
                workingDebts.sort((a, b) => a.balance === 0 ? 1 : b.balance === 0 ? -1 : b.apr - a.apr).reverse();
            }
            
            let remainingMonthlyPayment = totalMonthlyPayment;

            // Pay minimums first
            for (const debt of workingDebts) {
                if (debt.balance > 0 && remainingMonthlyPayment > 0) {
                    const interestPayment = debt.balance * (debt.apr / 100 / 12);
                    let actualMinPayment = Math.min(debt.minPayment, debt.balance + interestPayment); // Cap at what's owed
                    actualMinPayment = Math.min(actualMinPayment, remainingMonthlyPayment); // Cap at what's available

                    let principalFromMin = actualMinPayment - interestPayment;
                    if (principalFromMin < 0) principalFromMin = 0;
                     if (actualMinPayment > debt.balance + interestPayment) principalFromMin = debt.balance;


                    monthSummary.payments.push({ name: debt.name, paid: actualMinPayment, interest: interestPayment, principal: principalFromMin });
                    debt.balance -= principalFromMin;
                    totalInterestPaid += interestPayment;
                    remainingMonthlyPayment -= actualMinPayment;
                    monthSummary.totalInterestThisMonth += interestPayment;
                }
            }
            
            // Apply extra payments based on strategy
            for (const debt of workingDebts) { // Sorted order
                if (debt.balance > 0 && remainingMonthlyPayment > 0) {
                    const interestPayment = debt.balance * (debt.apr / 100 / 12); // Recalc interest on potentially reduced balance
                    let extraToThisDebt = remainingMonthlyPayment;
                    
                    if (debt.balance + interestPayment < extraToThisDebt) { // If extra payment is more than remaining on this debt
                        extraToThisDebt = debt.balance + interestPayment - (monthSummary.payments.find(p=>p.name === debt.name)?.paid || 0);
                        if(extraToThisDebt < 0) extraToThisDebt = 0;
                    }
                    
                    let principalFromExtra = extraToThisDebt; // Assume extra fully goes to principal after interest is covered by min
                     if (debt.balance < principalFromExtra) principalFromExtra = debt.balance;


                    // Update existing payment summary or add new if only extra is being paid
                    let paymentEntry = monthSummary.payments.find(p => p.name === debt.name);
                    if(paymentEntry){
                        paymentEntry.paid += extraToThisDebt;
                        paymentEntry.principal += principalFromExtra;
                    } else {
                        monthSummary.payments.push({name: debt.name, paid: extraToThisDebt, interest:0, principal: principalFromExtra});
                    }

                    debt.balance -= principalFromExtra;
                    remainingMonthlyPayment -= extraToThisDebt;
                }
                if(remainingMonthlyPayment <= 0) break;
            }
            
            workingDebts.forEach(d => monthSummary.remainingOverallBalance += d.balance);
            paymentSchedule.push(monthSummary);

            // For chart
            const currentBalancesForChart = { month: months };
            workingDebts.forEach(d => currentBalancesForChart[d.name] = d.balance);
            chartDataPoints.push(currentBalancesForChart);

            if (workingDebts.every(debt => debt.balance <= 0.005)) break; // All debts paid
        }


        if (months >= MAX_MONTHS && workingDebts.some(debt => debt.balance > 0)) {
            showErrors(["Debt will not be paid off within 50 years with current plan. Consider increasing total monthly payment."]);
            hideResults();
            return;
        }

        // Display Results
        const payoffDate = new Date();
        payoffDate.setMonth(payoffDate.getMonth() + months);
        debtFreeDateResult.textContent = payoffDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        totalPrincipalResult.textContent = `$${totalPrincipalPaid.toFixed(2)}`;
        totalInterestResult.textContent = `$${totalInterestPaid.toFixed(2)}`;
        monthsToPayoffResult.textContent = `${months} months (${(months / 12).toFixed(1)} years)`;
        strategyNameDisplay.textContent = strategy.charAt(0).toUpperCase() + strategy.slice(1); // Capitalize

        resultsSection.style.display = 'block';
        generatePaymentScheduleTable(paymentSchedule);
        generateDebtChart(chartDataPoints, debts.map(d => d.name));
    }


    function generatePaymentScheduleTable(schedule) {
        let tableHtml = `<table class="payment-schedule-table">
                            <thead><tr><th>Month</th><th>Debt Name</th><th>Payment Made</th><th>Interest Paid</th><th>Principal Paid</th><th>Remaining Balance</th></tr></thead>
                            <tbody>`;
        schedule.forEach(monthData => {
            monthData.payments.forEach(debtPayment => {
                const debtDetails = debts.find(d => d.name === debtPayment.name); // To get current balance after this payment for this debt
                const currentBalanceOfThisDebt = schedule
                    .slice(0, monthData.month)
                    .flatMap(m => m.payments)
                    .filter(p => p.name === debtPayment.name)
                    .reduce((bal, p) => bal - p.principal, (debts.find(d=>d.name === debtPayment.name)?.balance || 0) + (debts.find(d=>d.name === debtPayment.name)?.minPayment || 0) ); // complex to get current balance this way

                // Simplified: get balance from the *end* of this month for this debt
                let endOfMonthBalance = initialBalancesForChart[debtPayment.name];
                for(let m=1; m <= monthData.month; m++){
                    const monthSch = schedule.find(s => s.month === m);
                    const paymentForDebtInMonth = monthSch.payments.find(p => p.name === debtPayment.name);
                    if(paymentForDebtInMonth) endOfMonthBalance -= paymentForDebtInMonth.principal;
                }


                tableHtml += `<tr>
                                <td>${monthData.month}</td>
                                <td>${debtPayment.name}</td>
                                <td>$${debtPayment.paid.toFixed(2)}</td>
                                <td>$${debtPayment.interest.toFixed(2)}</td>
                                <td>$${debtPayment.principal.toFixed(2)}</td>
                                <td>$${(endOfMonthBalance < 0.005 ? 0 : endOfMonthBalance).toFixed(2)}</td> 
                              </tr>`;
            });
        });
        tableHtml += `</tbody></table>`;
        paymentScheduleContainer.innerHTML = tableHtml;
    }

    function generateDebtChart(chartDataPoints, debtNames) {
         if (typeof Chart === 'undefined') {
            payoffChartContainer.innerHTML = '<p class="text-muted">Chart library not loaded.</p>';
            return;
        }
        if (payoffChart) payoffChart.destroy();

        const datasets = debtNames.map((name, index) => {
            const colors = [
                'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)'
            ];
            return {
                label: name,
                data: chartDataPoints.map(dp => dp[name] < 0 ? 0 : dp[name]), // Ensure no negative balances on chart
                borderColor: colors[index % colors.length].replace('0.7', '1'),
                backgroundColor: colors[index % colors.length],
                fill: true, 
                tension: 0.1
            };
        });
        
        // Add a total balance line
        datasets.push({
            label: 'Total Debt Balance',
            data: chartDataPoints.map(dp => {
                let total = 0;
                debtNames.forEach(name => total += (dp[name] < 0 ? 0 : dp[name]));
                return total;
            }),
            borderColor: 'rgba(70, 70, 70, 1)',
            backgroundColor: 'rgba(70, 70, 70, 0.1)',
            type: 'line', // Make total a line
            fill: true,
            tension: 0.1,
            borderWidth: 2
        });


        const data = {
            labels: chartDataPoints.map(dp => dp.month === 0 ? 'Start' : `Month ${dp.month}`),
            datasets: datasets
        };

        const config = {
            type: 'line', // Changed to line, can be area if fill:true
            data: data,
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    y: { stacked: true, title: { display: true, text: 'Debt Balance ($)' }, beginAtZero: true },
                    x: { title: { display: true, text: 'Months' } }
                },
                plugins: {
                    title: { display: true, text: 'Debt Balance Reduction Over Time' },
                    tooltip: { mode: 'index', intersect: false, callbacks: { label: ctx => `${ctx.dataset.label}: $${parseFloat(ctx.raw).toFixed(2)}` } }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        };
        payoffChartContainer.innerHTML = '<canvas id="debtPayoffChartCanvas"></canvas>';
        const ctx = document.getElementById('debtPayoffChartCanvas').getContext('2d');
        payoffChart = new Chart(ctx, config);
    }


    function showErrors(errorsArray) {
        errorMessagesDiv.innerHTML = errorsArray.map(error => `<p>${error}</p>`).join('');
        errorMessagesDiv.style.display = 'block';
    }

    function clearErrors() {
        errorMessagesDiv.innerHTML = '';
        errorMessagesDiv.style.display = 'none';
        calculatorForm.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    }
    
    function hideResults() {
        resultsSection.style.display = 'none';
        paymentScheduleContainer.innerHTML = '';
        payoffChartContainer.innerHTML = '';
        if (payoffChart) { payoffChart.destroy(); payoffChart = null; }
    }

    function handleReset() {
        calculatorForm.reset();
        debtRowsContainer.innerHTML = ''; // Clear all debt rows
        addDebt(); // Add back one initial row
        clearErrors();
        hideResults();
    }

    // --- Event Listeners ---
    addDebtButton.addEventListener('click', addDebt);
    calculateButton.addEventListener('click', calculatePayoff);
    resetButton.addEventListener('click', handleReset);
    
    // --- Initial Setup ---
    addDebt(); // Add the first debt row on page load
    hideResults();
});
