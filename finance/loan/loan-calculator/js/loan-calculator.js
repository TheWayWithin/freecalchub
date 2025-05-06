document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loan-calculator-form");
    const resultsContainer = document.getElementById("results-container");
    const monthlyPaymentResultEl = document.getElementById("monthly_payment_result");
    const totalPrincipalPaidResultEl = document.getElementById("total_principal_paid_result");
    const totalInterestPaidResultEl = document.getElementById("total_interest_paid_result");
    const totalCostOfLoanResultEl = document.getElementById("total_cost_of_loan_result");
    const payoffDateResultEl = document.getElementById("payoff_date_result");
    const interestSavingsResultEl = document.getElementById("interest_savings_result");
    const amortizationTableBody = document.querySelector("#amortization-table tbody");
    const comparisonContainerEl = document.getElementById("comparison-container");

    let paymentBreakdownChart = null;
    let loanBalanceChart = null;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        calculateLoan();
    });

    form.addEventListener("reset", () => {
        resultsContainer.style.display = "none";
        if (paymentBreakdownChart) {
            paymentBreakdownChart.destroy();
            paymentBreakdownChart = null;
        }
        if (loanBalanceChart) {
            loanBalanceChart.destroy();
            loanBalanceChart = null;
        }
        amortizationTableBody.innerHTML = "";
        comparisonContainerEl.innerHTML = "";
        comparisonContainerEl.style.display = "none";
    });

    function calculateLoan() {
        // Get input values
        const loanAmount = parseFloat(document.getElementById("loan_amount").value.replace(/[^\d.-]/g, ""));
        const annualInterestRate = parseFloat(document.getElementById("interest_rate").value.replace(/[^\d.-]/g, ""));
        const loanTermYears = parseInt(document.getElementById("loan_term_years").value) || 0;
        const loanTermMonths = parseInt(document.getElementById("loan_term_months").value) || 0;
        // const loanType = document.getElementById("loan_type").value;
        const loanStartDateStr = document.getElementById("loan_start_date").value;
        const compoundingPeriod = document.getElementById("compounding_period").value;
        const paymentFrequency = document.getElementById("payment_frequency").value;
        const extraPayment = parseFloat(document.getElementById("extra_payment").value.replace(/[^\d.-]/g, "")) || 0;

        // --- Input Validation ---
        if (isNaN(loanAmount) || loanAmount <= 0) {
            alert("Please enter a valid loan amount.");
            return;
        }
        if (isNaN(annualInterestRate) || annualInterestRate <= 0) {
            alert("Please enter a valid interest rate.");
            return;
        }
        const totalLoanTermInMonths = loanTermYears * 12 + loanTermMonths;
        if (totalLoanTermInMonths <= 0) {
            alert("Please enter a valid loan term.");
            return;
        }
        if (!loanStartDateStr) {
            alert("Please select a loan start date.");
            return;
        }
        const loanStartDate = new Date(loanStartDateStr + "-02"); // Ensure it's parsed as local time, pick a day

        // --- Calculations ---
        let R, N_compound_per_year, N_payments_per_year;

        switch (compoundingPeriod) {
            case "daily":
                R = annualInterestRate / 36500; // Daily rate
                N_compound_per_year = 365;
                break;
            // Add other compounding periods if necessary (e.g., semi-annually, quarterly)
            case "monthly":
            default:
                R = annualInterestRate / 1200; // Monthly rate
                N_compound_per_year = 12;
                break;
        }
        
        switch (paymentFrequency) {
            case "weekly":
                N_payments_per_year = 52;
                break;
            case "bi-weekly":
                N_payments_per_year = 26;
                break;
            case "monthly":
            default:
                N_payments_per_year = 12;
                break;
        }

        // Adjust interest rate and number of periods for payment frequency if compounding is monthly
        // This is a simplification. True calculation for different compounding and payment frequencies can be complex.
        // For this version, we'll assume payment frequency aligns with compounding or use an effective rate approach.
        // For simplicity, if compounding is monthly, we'll adjust the number of payments and the payment amount.
        // A more accurate model would use the effective interest rate per payment period.

        const numPaymentsTotal = Math.ceil(totalLoanTermInMonths * (N_payments_per_year / 12));
        const ratePerPaymentPeriod = R * (N_compound_per_year / N_payments_per_year); // Approximate rate per payment period

        // Standard loan payment formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
        let paymentAmount = loanAmount * (ratePerPaymentPeriod * Math.pow(1 + ratePerPaymentPeriod, numPaymentsTotal)) / (Math.pow(1 + ratePerPaymentPeriod, numPaymentsTotal) - 1);
        
        if (!isFinite(paymentAmount) || paymentAmount <=0) { // Handle cases like zero interest rate leading to division by zero or invalid payment
            if(annualInterestRate === 0){
                paymentAmount = loanAmount / numPaymentsTotal;
            } else {
                alert("Could not calculate payment. Please check inputs, especially interest rate and term.");
                return;
            }
        }

        let totalInterestPaid = 0;
        let totalPrincipalPaid = 0;
        let remainingBalance = loanAmount;
        amortizationTableBody.innerHTML = ""; // Clear previous results

        const amortizationData = [];
        const balanceOverTime = [loanAmount];
        const paymentDates = [];

        let actualPayoffDate = new Date(loanStartDate);
        let paymentCounter = 0;

        // Amortization with extra payments
        let currentLoanBalance = loanAmount;
        let totalInterestPaidWithExtra = 0;
        let paymentNumberWithExtra = 0;
        let actualPayoffDateWithExtra = new Date(loanStartDate);
        const amortizationScheduleWithExtra = [];

        for (let i = 1; i <= numPaymentsTotal && currentLoanBalance > 0.005; i++) {
            paymentNumberWithExtra++;
            const interestForPeriod = currentLoanBalance * ratePerPaymentPeriod;
            let principalPaidThisPeriod = paymentAmount - interestForPeriod;
            const actualPaymentThisPeriod = paymentAmount + extraPayment;
            
            let principalFromActualPayment = actualPaymentThisPeriod - interestForPeriod;

            if (principalFromActualPayment > currentLoanBalance) { // Final payment adjustment
                principalFromActualPayment = currentLoanBalance;
                // actualPaymentThisPeriod = currentLoanBalance + interestForPeriod; // This would be the final payment amount
            }
            
            currentLoanBalance -= principalFromActualPayment;
            totalInterestPaidWithExtra += interestForPeriod;

            const paymentDate = new Date(loanStartDate);
            if (paymentFrequency === "monthly") {
                paymentDate.setMonth(loanStartDate.getMonth() + i -1 );
            }
            // Add logic for weekly/bi-weekly date increments
            else if (paymentFrequency === "bi-weekly") {
                paymentDate.setDate(loanStartDate.getDate() + (i - 1) * 14);
            } else if (paymentFrequency === "weekly") {
                paymentDate.setDate(loanStartDate.getDate() + (i - 1) * 7);
            }
            actualPayoffDateWithExtra = paymentDate;

            amortizationScheduleWithExtra.push({
                paymentNumber: i,
                paymentDate: paymentDate.toLocaleDateString(),
                paymentAmount: (actualPaymentThisPeriod).toFixed(2),
                principalPaid: principalFromActualPayment.toFixed(2),
                interestPaid: interestForPeriod.toFixed(2),
                remainingBalance: currentLoanBalance.toFixed(2)
            });
            
            if (currentLoanBalance <= 0.005) { // Paid off
                currentLoanBalance = 0; // Ensure it's exactly zero for display
                break;
            }
        }
        const totalPrincipalPaidWithExtra = loanAmount;
        const totalCostWithExtra = totalPrincipalPaidWithExtra + totalInterestPaidWithExtra;

        // --- Display results ---
        resultsContainer.style.display = "block";
        monthlyPaymentResultEl.innerHTML = `<strong>Regular Payment:</strong> $${paymentAmount.toFixed(2)} / ${paymentFrequency}`; 
        if(extraPayment > 0) {
             monthlyPaymentResultEl.innerHTML += `<br><strong>With Extra:</strong> $${(paymentAmount + extraPayment).toFixed(2)} / ${paymentFrequency}`;
        }

        totalPrincipalPaidResultEl.innerHTML = `<strong>Total Principal Paid:</strong> $${totalPrincipalPaidWithExtra.toFixed(2)}`;
        totalInterestPaidResultEl.innerHTML = `<strong>Total Interest Paid:</strong> $${totalInterestPaidWithExtra.toFixed(2)}`;
        totalCostOfLoanResultEl.innerHTML = `<strong>Total Loan Cost:</strong> $${totalCostWithExtra.toFixed(2)}`;
        payoffDateResultEl.innerHTML = `<strong>Payoff Date:</strong> ${actualPayoffDateWithExtra.toLocaleDateString()}`;

        // Calculate savings if extra payment is made
        if (extraPayment > 0) {
            // Recalculate without extra payment for comparison
            let totalInterestWithoutExtra = 0;
            let currentBalanceWithoutExtra = loanAmount;
            let numPaymentsWithoutExtra = 0;
            for (let i = 1; i <= numPaymentsTotal && currentBalanceWithoutExtra > 0.005; i++) {
                numPaymentsWithoutExtra++;
                const interest = currentBalanceWithoutExtra * ratePerPaymentPeriod;
                let principal = paymentAmount - interest;
                if (principal > currentBalanceWithoutExtra) principal = currentBalanceWithoutExtra;
                currentBalanceWithoutExtra -= principal;
                totalInterestWithoutExtra += interest;
                 if (currentBalanceWithoutExtra <= 0.005) break;
            }
            const interestSaved = totalInterestWithoutExtra - totalInterestPaidWithExtra;
            interestSavingsResultEl.innerHTML = `<strong>Interest Saved (Extra Pmt):</strong> $${interestSaved.toFixed(2)}`;
            interestSavingsResultEl.style.display = "block";

            // Comparison section
            comparisonContainerEl.innerHTML = `
                <h4>Comparison: Standard vs. With Extra Payments</h4>
                <p><strong>Standard Payoff:</strong> ${numPaymentsWithoutExtra} payments, Total Interest: $${totalInterestWithoutExtra.toFixed(2)}</p>
                <p><strong>With Extra Payments:</strong> ${paymentNumberWithExtra} payments, Total Interest: $${totalInterestPaidWithExtra.toFixed(2)}</p>
                <p>You save $${interestSaved.toFixed(2)} in interest and pay off the loan ${numPaymentsWithoutExtra - paymentNumberWithExtra} payments sooner.</p>
            `;
            comparisonContainerEl.style.display = "block";

        } else {
            interestSavingsResultEl.style.display = "none";
            comparisonContainerEl.style.display = "none";
        }

        // Populate amortization table
        amortizationScheduleWithExtra.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${row.paymentNumber}</td>
                <td>${row.paymentDate}</td>
                <td>$${row.paymentAmount}</td>
                <td>$${row.principalPaid}</td>
                <td>$${row.interestPaid}</td>
                <td>$${row.remainingBalance}</td>
            `;
            amortizationTableBody.appendChild(tr);
        });
        
        // --- Generate Charts ---
        // Payment Breakdown Chart (Pie Chart for the first payment with extra)
        if (paymentBreakdownChart) paymentBreakdownChart.destroy();
        if (amortizationScheduleWithExtra.length > 0) {
            paymentBreakdownChart = new Chart(
                document.getElementById('payment-breakdown-chart'),
                {
                    type: 'pie',
                    data: {
                        labels: ['Principal', 'Interest'],
                        datasets: [{
                            label: 'First Payment Breakdown',
                            data: [parseFloat(amortizationScheduleWithExtra[0].principalPaid), parseFloat(amortizationScheduleWithExtra[0].interestPaid)],
                            backgroundColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)'],
                        }]
                    }
                }
            );
        }

        // Loan Balance Over Time Chart (Line Chart)
        if (loanBalanceChart) loanBalanceChart.destroy();
        const balanceHistory = [loanAmount, ...amortizationScheduleWithExtra.map(row => parseFloat(row.remainingBalance))];
        const chartLabels = ['Start', ...amortizationScheduleWithExtra.map(row => `Pmt ${row.paymentNumber}`)];
        
        loanBalanceChart = new Chart(
            document.getElementById('loan-balance-chart'),
            {
                type: 'line',
                data: {
                    labels: chartLabels.slice(0, balanceHistory.length), // Ensure labels match data length
                    datasets: [{
                        label: 'Loan Balance',
                        data: balanceHistory,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );
    }
});

