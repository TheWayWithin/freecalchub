document.addEventListener("DOMContentLoaded", function () {
    const refinanceForm = document.getElementById("refinanceForm");
    const calculateButton = document.getElementById("calculateRefinance");
    const resultsSection = document.getElementById("refinanceResults");

    // Result display elements
    const newMonthlyPaymentResultEl = document.getElementById("newMonthlyPaymentResult");
    const monthlySavingsResultEl = document.getElementById("monthlySavingsResult");
    const lifetimeSavingsResultEl = document.getElementById("lifetimeSavingsResult");
    const breakEvenPointResultEl = document.getElementById("breakEvenPointResult");
    const totalInterestCurrentResultEl = document.getElementById("totalInterestCurrentResult");
    const totalInterestNewResultEl = document.getElementById("totalInterestNewResult");
    // const amortizationChartContainer = document.getElementById("amortizationChartContainer"); // For future chart

    function calculateMonthlyPayment(principal, annualInterestRate, loanTermYears) {
        if (principal <= 0 || annualInterestRate < 0 || loanTermYears <= 0) return 0;
        const monthlyInterestRate = annualInterestRate / 100 / 12;
        const numberOfPayments = loanTermYears * 12;
        if (monthlyInterestRate === 0) return principal / numberOfPayments; // Interest-free loan
        const payment = principal * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
        return payment;
    }

    function calculateTotalInterest(principal, monthlyPayment, loanTermYears) {
        const numberOfPayments = loanTermYears * 12;
        const totalPaid = monthlyPayment * numberOfPayments;
        return totalPaid - principal;
    }

    calculateButton.addEventListener("click", function () {
        // Get Current Mortgage Info
        const currentOriginalLoanAmount = parseFloat(document.getElementById("currentOriginalLoanAmount").value) || 0;
        const currentBalance = parseFloat(document.getElementById("currentBalance").value) || 0;
        const currentOriginalLoanTerm = parseFloat(document.getElementById("currentOriginalLoanTerm").value) || 0;
        const currentTimeRemainingYears = parseFloat(document.getElementById("currentTimeRemaining").value) || 0;
        const currentInterestRate = parseFloat(document.getElementById("currentInterestRate").value) || 0;
        const currentMonthlyPaymentPI = parseFloat(document.getElementById("currentMonthlyPayment").value) || 0;

        // Get New Mortgage Info
        let newLoanAmount = parseFloat(document.getElementById("newLoanAmount").value) || 0;
        const newLoanTermYears = parseFloat(document.getElementById("newLoanTerm").value) || 0;
        const newInterestRate = parseFloat(document.getElementById("newInterestRate").value) || 0;
        const closingCosts = parseFloat(document.getElementById("closingCosts").value) || 0;
        const pointsPaidPercent = parseFloat(document.getElementById("pointsPaid").value) || 0;

        // Basic Validations
        if (currentBalance <= 0 || currentTimeRemainingYears <= 0 || currentInterestRate < 0 || currentMonthlyPaymentPI <= 0 || newLoanTermYears <= 0 || newInterestRate < 0) {
            alert("Please fill in all required fields with valid numbers for current and new mortgage details.");
            return;
        }
        
        if (newLoanAmount <= 0) {
             newLoanAmount = currentBalance; // Default new loan amount to current balance if not specified
             document.getElementById("newLoanAmount").value = newLoanAmount;
        }

        const pointsCost = (pointsPaidPercent / 100) * newLoanAmount;
        const totalClosingCosts = closingCosts + pointsCost;

        // Calculate New Monthly Payment
        const newMonthlyPaymentPI = calculateMonthlyPayment(newLoanAmount, newInterestRate, newLoanTermYears);
        if (isNaN(newMonthlyPaymentPI) || newMonthlyPaymentPI <= 0) {
            alert("Could not calculate the new monthly payment. Please check new loan inputs.");
            return;
        }

        // Calculate Monthly Savings
        const monthlySavings = currentMonthlyPaymentPI - newMonthlyPaymentPI;

        // Calculate Total Interest for Current Loan (remaining)
        const totalRemainingPaymentsCurrent = currentTimeRemainingYears * 12;
        const totalInterestCurrentRemaining = (currentMonthlyPaymentPI * totalRemainingPaymentsCurrent) - currentBalance;

        // Calculate Total Interest for New Loan
        const totalInterestNew = calculateTotalInterest(newLoanAmount, newMonthlyPaymentPI, newLoanTermYears);
        
        // Calculate Lifetime Savings
        // This considers the total cost of keeping the current loan vs. the total cost of the new loan (including closing costs)
        const totalCostCurrentLoanRemaining = (currentMonthlyPaymentPI * totalRemainingPaymentsCurrent);
        const totalCostNewLoan = (newMonthlyPaymentPI * newLoanTermYears * 12) + totalClosingCosts;
        const lifetimeSavings = totalCostCurrentLoanRemaining - totalCostNewLoan;

        // Calculate Break-Even Point
        let breakEvenPointMonths = "N/A";
        if (monthlySavings > 0 && totalClosingCosts > 0) {
            breakEvenPointMonths = Math.ceil(totalClosingCosts / monthlySavings);
        } else if (totalClosingCosts === 0 && monthlySavings > 0) {
            breakEvenPointMonths = "0 (Immediate savings, no costs)";
        } else if (monthlySavings <= 0) {
            breakEvenPointMonths = "N/A (No monthly savings)";
        }

        // Display Results
        newMonthlyPaymentResultEl.textContent = `$${newMonthlyPaymentPI.toFixed(2)}`;
        monthlySavingsResultEl.textContent = `$${monthlySavings.toFixed(2)}`;
        lifetimeSavingsResultEl.textContent = `$${lifetimeSavings.toFixed(2)}`;
        breakEvenPointResultEl.textContent = typeof breakEvenPointMonths === "number" ? `${breakEvenPointMonths} months` : breakEvenPointMonths;
        totalInterestCurrentResultEl.textContent = `$${totalInterestCurrentRemaining.toFixed(2)} (remaining)`;
        totalInterestNewResultEl.textContent = `$${totalInterestNew.toFixed(2)}`;

        resultsSection.style.display = "block";
        resultsSection.scrollIntoView({ behavior: "smooth" });
    });

    refinanceForm.addEventListener("reset", function() {
        resultsSection.style.display = "none";
        newMonthlyPaymentResultEl.textContent = "$0.00";
        monthlySavingsResultEl.textContent = "$0.00";
        lifetimeSavingsResultEl.textContent = "$0.00";
        breakEvenPointResultEl.textContent = "N/A months";
        totalInterestCurrentResultEl.textContent = "$0.00";
        totalInterestNewResultEl.textContent = "$0.00";
    });
});

