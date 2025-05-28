/*
 * FreecalcHub.com - Loan Comparison Calculator
 * Version: 1.0
 * Date Created: May 27, 2025
 * Description: Compares multiple loan offers side-by-side.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const calculatorForm = document.getElementById('calculatorForm');
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const errorMessagesDiv = document.getElementById('errorMessages');
    const resultsSection = document.getElementById('resultsSection');
    const comparisonTableContainer = document.getElementById('comparisonTableContainer');
    const comparisonChartContainer = document.getElementById('comparisonChartContainer');
    const amortizationTabsContainer = document.getElementById('amortizationTabsContainer');

    let comparisonChart = null; // To store Chart.js instance

    const loanInputs = [
        { name: 'loan1Name', amount: 'loan1Amount', rate: 'loan1Rate', term: 'loan1Term', fees: 'loan1Fees' },
        { name: 'loan2Name', amount: 'loan2Amount', rate: 'loan2Rate', term: 'loan2Term', fees: 'loan2Fees' },
        { name: 'loan3Name', amount: 'loan3Amount', rate: 'loan3Rate', term: 'loan3Term', fees: 'loan3Fees' }
    ];

    // --- Calculation Functions ---
    function calculateMonthlyPayment(principal, annualRate, termYears) {
        if (principal <= 0) return 0;
        const monthlyRate = (annualRate / 100) / 12;
        const numberOfPayments = termYears * 12;

        if (monthlyRate === 0) { // 0% interest
            return principal / numberOfPayments;
        }
        return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    function calculateLoanDetails(loanData) {
        const principal = parseFloat(loanData.amount) || 0;
        const annualRate = parseFloat(loanData.rate) || 0;
        const termYears = parseInt(loanData.term) || 0;
        const fees = parseFloat(loanData.fees) || 0;
        const name = loanData.name || `Loan ${loanData.id +1}`;

        if (principal <= 0 || annualRate < 0 || termYears <= 0) {
            return null; // Invalid for calculation
        }

        const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears);
        const numberOfPayments = termYears * 12;
        const totalPaid = monthlyPayment * numberOfPayments;
        const totalInterest = totalPaid - principal;
        const totalCost = principal + totalInterest + fees;

        const amortizationSchedule = [];
        let balance = principal;
        const monthlyRate = (annualRate / 100) / 12;

        for (let month = 1; month <= numberOfPayments; month++) {
            const interestForMonth = balance * monthlyRate;
            let principalForMonth = monthlyPayment - interestForMonth;
            
            if (balance < monthlyPayment) { // Final payment adjustment
                principalForMonth = balance;
                // monthlyPayment = balance + interestForMonth; // Actual final payment might be less
            }
            balance -= principalForMonth;
            if (balance < 0.005) balance = 0; // Round down small balances

            amortizationSchedule.push({
                month,
                payment: monthlyPayment, // Or adjusted final payment
                principalPaid: principalForMonth,
                interestPaid: interestForMonth,
                balance
            });
            if (balance === 0) break;
        }

        return {
            name: name,
            loanAmount: principal,
            interestRate: annualRate,
            loanTermYears: termYears,
            originationFees: fees,
            monthlyPayment: monthlyPayment,
            totalInterestPaid: totalInterest,
            totalFeesPaid: fees,
            totalCost: totalCost,
            amortizationSchedule: amortizationSchedule
        };
    }

    // --- Display Functions ---
    function displayResults(loanDetailsArray) {
        comparisonTableContainer.innerHTML = ''; // Clear previous
        amortizationTabsContainer.innerHTML = ''; // Clear previous

        if (loanDetailsArray.length === 0) {
            hideResults();
            return;
        }

        // Create Comparison Table
        let tableHTML = '<table class="comparison-table"><thead><tr><th>Feature</th>';
        loanDetailsArray.forEach(loan => { tableHTML += `<th>${loan.name || 'Loan'}</th>`; });
        tableHTML += '</tr></thead><tbody>';

        const features = [
            { label: 'Monthly Payment', key: 'monthlyPayment', currency: true },
            { label: 'Total Interest Paid', key: 'totalInterestPaid', currency: true },
            { label: 'Total Fees Paid', key: 'totalFeesPaid', currency: true },
            { label: 'Total Cost (Principal + Interest + Fees)', key: 'totalCost', currency: true },
            { label: 'Loan Term (Years)', key: 'loanTermYears', currency: false },
            { label: 'Interest Rate (APR %)', key: 'interestRate', currency: false, suffix: '%' },
            { label: 'Loan Amount', key: 'loanAmount', currency: true }
        ];

        features.forEach(feature => {
            tableHTML += `<tr><td>${feature.label}</td>`;
            loanDetailsArray.forEach(loan => {
                let value = loan[feature.key];
                if (feature.currency) value = `$${value.toFixed(2)}`;
                if (feature.suffix) value += feature.suffix;
                tableHTML += `<td>${value}</td>`;
            });
            tableHTML += '</tr>';
        });
        tableHTML += '</tbody></table>';
        comparisonTableContainer.innerHTML = tableHTML;

        // Create Amortization Tabs
        const tabsNav = document.createElement('div');
        tabsNav.className = 'amortization-tabs-nav';
        const panelsContainer = document.createElement('div');

        loanDetailsArray.forEach((loan, index) => {
            // Tab Link
            const tabLink = document.createElement('button');
            tabLink.className = 'tab-link';
            tabLink.textContent = loan.name || `Loan ${index + 1} Schedule`;
            tabLink.setAttribute('data-tab', `amortization-panel-${index}`);
            if (index === 0) tabLink.classList.add('active');
            tabsNav.appendChild(tabLink);

            // Tab Panel
            const tabPanel = document.createElement('div');
            tabPanel.id = `amortization-panel-${index}`;
            tabPanel.className = 'amortization-tab-panel';
            if (index === 0) tabPanel.classList.add('active');
            
            let amortTableHTML = `<h4>Amortization for ${loan.name || `Loan ${index + 1}`}</h4>
                                 <div class="table-responsive">
                                 <table class="amortization-table"><thead><tr>
                                 <th>Month</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th>
                                 </tr></thead><tbody>`;
            loan.amortizationSchedule.forEach(p => {
                amortTableHTML += `<tr>
                                    <td>${p.month}</td>
                                    <td>$${p.payment.toFixed(2)}</td>
                                    <td>$${p.principalPaid.toFixed(2)}</td>
                                    <td>$${p.interestPaid.toFixed(2)}</td>
                                    <td>$${p.balance.toFixed(2)}</td>
                                  </tr>`;
            });
            amortTableHTML += '</tbody></table></div>';
            tabPanel.innerHTML = amortTableHTML;
            panelsContainer.appendChild(tabPanel);
        });

        amortizationTabsContainer.appendChild(tabsNav);
        amortizationTabsContainer.appendChild(panelsContainer);

        // Add event listeners for new tabs
        tabsNav.querySelectorAll('.tab-link').forEach(link => {
            link.addEventListener('click', (e) => {
                tabsNav.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
                panelsContainer.querySelectorAll('.amortization-tab-panel').forEach(p => p.classList.remove('active'));
                
                e.target.classList.add('active');
                document.getElementById(e.target.getAttribute('data-tab')).classList.add('active');
            });
        });
        
        generateComparisonChart(loanDetailsArray);
        resultsSection.style.display = 'block';
    }
    
    function generateComparisonChart(loanDetailsArray) {
        if (typeof Chart === 'undefined') {
            comparisonChartContainer.innerHTML = '<p class="text-muted">Chart library not loaded.</p>';
            return;
        }
        if (comparisonChart) {
            comparisonChart.destroy();
        }

        const labels = loanDetailsArray.map(loan => loan.name || `Loan`);
        const totalCostData = loanDetailsArray.map(loan => loan.totalCost);

        const backgroundColors = [
            'rgba(54, 162, 235, 0.7)', // Blue
            'rgba(255, 159, 64, 0.7)',// Orange
            'rgba(75, 192, 192, 0.7)' // Green
        ];
        const borderColors = [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(75, 192, 192, 1)'
        ];

        const data = {
            labels: labels,
            datasets: [{
                label: 'Total Loan Cost (Principal + Interest + Fees)',
                data: totalCostData,
                backgroundColor: backgroundColors.slice(0, loanDetailsArray.length),
                borderColor: borderColors.slice(0, loanDetailsArray.length),
                borderWidth: 1
            }]
        };
        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { title: { display: true, text: 'Total Cost ($)' }, beginAtZero: true }
                },
                plugins: {
                    title: { display: true, text: 'Loan Offer Total Cost Comparison' },
                    tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: $${parseFloat(ctx.raw).toFixed(2)}` } }
                }
            }
        };
        comparisonChartContainer.innerHTML = '<canvas id="loanComparisonChartCanvas"></canvas>';
        const ctx = document.getElementById('loanComparisonChartCanvas').getContext('2d');
        comparisonChart = new Chart(ctx, config);
    }

    // --- Event Handlers ---
    function handleCalculate() {
        clearErrors();
        let validLoanInputs = [];
        let errors = [];

        for (let i = 0; i < 3; i++) {
            const amountEl = document.getElementById(loanInputs[i].amount);
            const rateEl = document.getElementById(loanInputs[i].rate);
            const termEl = document.getElementById(loanInputs[i].term);
            const feesEl = document.getElementById(loanInputs[i].fees);
            const nameEl = document.getElementById(loanInputs[i].name);

            // Clear previous errors on these specific inputs
            [amountEl, rateEl, termEl, feesEl].forEach(el => { if(el) el.classList.remove('input-error');});

            const amount = parseFloat(amountEl.value);
            const rate = parseFloat(rateEl.value);
            const term = parseInt(termEl.value);
            const fees = parseFloat(feesEl.value) || 0; // Fees are optional for data collection, default to 0
            const name = nameEl.value.trim() || `Loan ${i + 1}`;

            // Validate Loan 1 fully, Loan 2 & 3 only if amount is entered
            if (i === 0) { // Loan 1 is required
                if (isNaN(amount) || amount <= 0) { errors.push(`Loan 1: Amount must be positive.`); amountEl.classList.add('input-error'); }
                if (isNaN(rate) || rate < 0) { errors.push(`Loan 1: Interest Rate must be non-negative.`); rateEl.classList.add('input-error'); }
                if (isNaN(term) || term <= 0) { errors.push(`Loan 1: Term must be positive.`); termEl.classList.add('input-error'); }
                if (fees < 0) { errors.push(`Loan 1: Fees cannot be negative.`); feesEl.classList.add('input-error');}

                if (!isNaN(amount) && amount > 0 && !isNaN(rate) && rate >=0 && !isNaN(term) && term > 0 && fees >= 0) {
                    validLoanInputs.push({id: i, name, amount, rate, term, fees });
                }
            } else if (!isNaN(amount) && amount > 0) { // Loan 2 or 3, only process if amount is entered
                let loanValid = true;
                if (isNaN(rate) || rate < 0) { errors.push(`Loan ${i+1}: Interest Rate must be non-negative if Amount is entered.`); rateEl.classList.add('input-error'); loanValid = false; }
                if (isNaN(term) || term <= 0) { errors.push(`Loan ${i+1}: Term must be positive if Amount is entered.`); termEl.classList.add('input-error'); loanValid = false; }
                if (fees < 0) { errors.push(`Loan ${i+1}: Fees cannot be negative.`); feesEl.classList.add('input-error'); loanValid = false;}
                
                if (loanValid) {
                    validLoanInputs.push({ id: i, name, amount, rate, term, fees });
                }
            } else if (amountEl.value.trim() !== '') { // If amount field has non-numeric text but is not empty
                 errors.push(`Loan ${i+1}: Amount must be a valid number if details are provided.`); amountEl.classList.add('input-error');
            }
        }

        if (errors.length > 0) {
            showErrors(errors);
            hideResults();
            return;
        }
        if (validLoanInputs.length === 0) {
            showErrors(["Please enter details for at least Loan 1."]);
            hideResults();
            return;
        }

        const loanDetailsArray = validLoanInputs.map(input => calculateLoanDetails(input)).filter(details => details !== null);
        
        if (loanDetailsArray.length > 0) {
            displayResults(loanDetailsArray);
        } else {
            showErrors(["Could not calculate details for any loan. Check inputs."]);
            hideResults();
        }
    }

    function showErrors(errorsArray) {
        errorMessagesDiv.innerHTML = errorsArray.map(error => `<p>${error}</p>`).join('');
        errorMessagesDiv.style.display = 'block';
    }

    function clearErrors() {
        errorMessagesDiv.innerHTML = '';
        errorMessagesDiv.style.display = 'none';
        loanInputs.forEach(loanSet => {
            [loanSet.amount, loanSet.rate, loanSet.term, loanSet.fees].forEach(id => {
                const el = document.getElementById(id);
                if(el) el.classList.remove('input-error');
            });
        });
    }
    
    function hideResults() {
        resultsSection.style.display = 'none';
        comparisonTableContainer.innerHTML = '';
        amortizationTabsContainer.innerHTML = '';
        comparisonChartContainer.innerHTML = '';
        if (comparisonChart) {
            comparisonChart.destroy();
            comparisonChart = null;
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
