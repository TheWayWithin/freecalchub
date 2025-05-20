document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const calculatorForm = document.getElementById("pointsCalculatorForm");
    const calculateButton = document.getElementById("calculateButton");
    const resultsSection = document.getElementById("resultsSection");

    // Inputs
    const loanAmountEl = document.getElementById("loanAmount");
    const loanTermEl = document.getElementById("loanTerm");
    const baseInterestRateEl = document.getElementById("baseInterestRate");
    const pointsToPurchaseEl = document.getElementById("pointsToPurchase");
    const costPerPointEl = document.getElementById("costPerPoint");
    const rateReductionPerPointEl = document.getElementById("rateReductionPerPoint");
    const plannedDurationYearsEl = document.getElementById("plannedDurationYears");
    const plannedDurationMonthsEl = document.getElementById("plannedDurationMonths");

    // Outputs
    const totalPointsCostEl = document.getElementById("totalPointsCost");
    const newInterestRateEl = document.getElementById("newInterestRate");
    const monthlyPaymentWithoutPointsEl = document.getElementById("monthlyPaymentWithoutPoints");
    const monthlyPaymentWithPointsEl = document.getElementById("monthlyPaymentWithPoints");
    const monthlySavingsEl = document.getElementById("monthlySavings");
    const breakEvenPointEl = document.getElementById("breakEvenPoint");
    const totalSavingsForDurationEl = document.getElementById("totalSavingsForDuration");
    const recommendationTextEl = document.getElementById("recommendationText");

    // Helper Functions
    function parseFloatSafe(value, defaultValue = 0) {
        const num = parseFloat(value);
        return isNaN(num) ? defaultValue : num;
    }

    function parseIntSafe(value, defaultValue = 0) {
        const num = parseInt(value, 10);
        return isNaN(num) ? defaultValue : num;
    }
    
    function formatCurrency(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) return "-";
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    function calculateMonthlyPayment(principal, annualRate, termYears) {
        if (principal <= 0 || termYears <= 0) return 0;
        // Allow zero interest rate for calculation, but negative rates are problematic
        if (annualRate < 0) { 
            console.warn("Negative annual rate provided, treating as 0% for payment calculation.");
            annualRate = 0;
        }

        const monthlyRate = annualRate / 100 / 12;
        const numberOfPayments = termYears * 12;

        if (monthlyRate === 0) { // Interest-free loan
            return principal > 0 && numberOfPayments > 0 ? principal / numberOfPayments : 0;
        }
        // M = P [r(1+r)^n] / [(1+r)^n – 1]
        const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        return payment;
    }

    // Main Calculation
    function performCalculation() {
        const loanAmount = parseFloatSafe(loanAmountEl.value);
        const loanTermYears = parseIntSafe(loanTermEl.value);
        const baseRate = parseFloatSafe(baseInterestRateEl.value);
        const pointsPurchased = parseFloatSafe(pointsToPurchaseEl.value);
        const costPerPointPercent = parseFloatSafe(costPerPointEl.value, 1); // Default to 1% if blank
        const rateReductionPerPoint = parseFloatSafe(rateReductionPerPointEl.value);
        const plannedYears = parseIntSafe(plannedDurationYearsEl.value);
        const plannedMonths = parseIntSafe(plannedDurationMonthsEl.value);

        // --- Input Validations & Edge Cases ---
        if (loanAmount <= 0) {
            alert("Please enter a valid Loan Amount greater than zero.");
            return;
        }
        if (loanTermYears <= 0) {
            alert("Please select a valid Loan Term.");
            return;
        }
        if (baseRate <= 0) { // Base rate can be 0, but usually positive
            alert("Please enter a valid Base Interest Rate (usually greater than zero).");
            // Allow calculation with 0 base rate if user insists, but it's unusual.
        }
         if (pointsPurchased < 0) {
            alert("Number of Points to Purchase cannot be negative.");
            return;
        }
        if (costPerPointPercent <= 0 && pointsPurchased > 0) {
            alert("Cost Per Point must be greater than zero if purchasing points.");
            return;
        }
        if (rateReductionPerPoint <= 0 && pointsPurchased > 0) {
            alert("Interest Rate Reduction Per Point must be greater than zero if purchasing points.");
            return;
        }
         if (plannedYears < 0 || plannedMonths < 0 || (plannedYears === 0 && plannedMonths === 0)) {
            alert("Please enter a valid planned duration (at least 1 month).");
            return;
        }

        // --- Calculations ---
        const totalCostOfPoints = loanAmount * (pointsPurchased * (costPerPointPercent / 100));
        const totalRateReduction = pointsPurchased * rateReductionPerPoint;
        const newRate = baseRate - totalRateReduction;

        if (newRate < 0) {
            alert("The calculated new interest rate is negative. Please check your inputs for points and rate reduction per point. The rate reduction cannot exceed the base rate.");
            newInterestRateEl.textContent = "Invalid Inputs";
            // Clear other results or show error state
            monthlyPaymentWithoutPointsEl.textContent = "-";
            monthlyPaymentWithPointsEl.textContent = "-";
            monthlySavingsEl.textContent = "-";
            breakEvenPointEl.textContent = "-";
            totalSavingsForDurationEl.textContent = "-";
            recommendationTextEl.textContent = "Error: New rate is negative.";
            recommendationTextEl.style.color = "var(--danger-color, red)";
            resultsSection.style.display = "block";
            totalPointsCostEl.textContent = formatCurrency(totalCostOfPoints); // Still show cost of points
            return;
        }

        const paymentWithoutPoints = calculateMonthlyPayment(loanAmount, baseRate, loanTermYears);
        const paymentWithPoints = calculateMonthlyPayment(loanAmount, newRate, loanTermYears);
        const monthlySaving = paymentWithoutPoints - paymentWithPoints;

        // --- Display Core Results ---
        totalPointsCostEl.textContent = formatCurrency(totalCostOfPoints);
        newInterestRateEl.textContent = newRate.toFixed(3) + "%";
        monthlyPaymentWithoutPointsEl.textContent = formatCurrency(paymentWithoutPoints);
        monthlyPaymentWithPointsEl.textContent = formatCurrency(paymentWithPoints);
        
        // --- Break-Even and Recommendation Logic ---
        if (pointsPurchased === 0 || totalCostOfPoints === 0) {
            monthlySavingsEl.textContent = formatCurrency(0);
            breakEvenPointEl.textContent = "N/A (No points purchased/no cost)";
            totalSavingsForDurationEl.textContent = formatCurrency(0);
            recommendationTextEl.textContent = "No points are being purchased, so there's no change in payment or break-even to calculate.";
            recommendationTextEl.style.color = "var(--text-color-dark, #333)";
        } else if (monthlySaving <= 0) { // Edge case: if points somehow increase payment (e.g., negative rate reduction entered by mistake)
            monthlySavingsEl.textContent = formatCurrency(monthlySaving);
            breakEvenPointEl.textContent = "N/A (No monthly savings or payment increased)";
            const netLoss = (monthlySaving * ((plannedYears * 12) + plannedMonths)) - totalCostOfPoints;
            totalSavingsForDurationEl.textContent = formatCurrency(netLoss);
            recommendationTextEl.textContent = "Paying points does not result in monthly savings or increases your payment. Not recommended.";
            recommendationTextEl.style.color = "var(--danger-color, red)";
        } else { // Positive monthly savings
            monthlySavingsEl.textContent = formatCurrency(monthlySaving);
            const breakEvenMonths = Math.ceil(totalCostOfPoints / monthlySaving);
            const breakEvenYears = Math.floor(breakEvenMonths / 12);
            const breakEvenRemainingMonths = breakEvenMonths % 12;
            breakEvenPointEl.textContent = `${breakEvenYears} Year(s), ${breakEvenRemainingMonths} Month(s) (${breakEvenMonths} months total)`;

            const totalPlannedMonths = (plannedYears * 12) + plannedMonths;
            const totalSavingsValue = (monthlySaving * totalPlannedMonths) - totalCostOfPoints;
            totalSavingsForDurationEl.textContent = formatCurrency(totalSavingsValue);

            if (totalPlannedMonths > breakEvenMonths) {
                recommendationTextEl.textContent = "Paying points appears beneficial based on your planned duration. You'll recoup the cost of points and save money overall.";
                recommendationTextEl.style.color = "var(--success-color, green)";
            } else if (totalPlannedMonths === breakEvenMonths) {
                 recommendationTextEl.textContent = "Paying points allows you to break even exactly at your planned duration. You will recoup the cost of points, with no additional net savings or loss.";
                 recommendationTextEl.style.color = "var(--text-color-dark, #333)";
            } else { // totalPlannedMonths < breakEvenMonths
                recommendationTextEl.textContent = "Paying points may NOT be beneficial. You plan to keep the mortgage for less time than it takes to reach the break-even point.";
                recommendationTextEl.style.color = "var(--danger-color, red)";
            }
        }

        resultsSection.style.display = "block";
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Event Listeners
    if (calculateButton) {
        calculateButton.addEventListener("click", function(event) {
            event.preventDefault();
            performCalculation();
        });
    }

    if (calculatorForm) {
        calculatorForm.addEventListener("reset", function() {
            resultsSection.style.display = "none";
            totalPointsCostEl.textContent = "-";
            newInterestRateEl.textContent = "-";
            monthlyPaymentWithoutPointsEl.textContent = "-";
            monthlyPaymentWithPointsEl.textContent = "-";
            monthlySavingsEl.textContent = "-";
            breakEvenPointEl.textContent = "-";
            totalSavingsForDurationEl.textContent = "-";
            recommendationTextEl.textContent = "-";
            recommendationTextEl.style.color = "var(--text-color-dark, #333)"; // Reset color
        });
    }
});
