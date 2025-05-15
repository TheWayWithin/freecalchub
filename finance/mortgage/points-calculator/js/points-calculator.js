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
        if (annualRate < 0) annualRate = 0; // Treat negative rate as 0 for payment calc

        const monthlyRate = annualRate / 100 / 12;
        const numberOfPayments = termYears * 12;

        if (monthlyRate === 0) { // Interest-free loan
            return principal / numberOfPayments;
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
        const costPerPointPercent = parseFloatSafe(costPerPointEl.value, 1); // Default to 1%
        const rateReductionPerPoint = parseFloatSafe(rateReductionPerPointEl.value);
        const plannedYears = parseIntSafe(plannedDurationYearsEl.value);
        const plannedMonths = parseIntSafe(plannedDurationMonthsEl.value);

        // Validations
        if (loanAmount <= 0 || loanTermYears <= 0 || baseRate <= 0 || pointsPurchased < 0 || costPerPointPercent <= 0 || rateReductionPerPoint <= 0) {
            alert("Please enter valid positive numbers for all required fields (Loan Amount, Term, Base Rate, Points, Cost per Point, Rate Reduction).");
            return;
        }
        if (plannedYears === 0 && plannedMonths === 0) {
            alert("Please enter how long you plan to keep this mortgage.");
            return;
        }

        const totalCostOfPoints = loanAmount * (pointsPurchased * (costPerPointPercent / 100));
        const totalRateReduction = pointsPurchased * rateReductionPerPoint;
        const newRate = baseRate - totalRateReduction;

        if (newRate < 0) {
            alert("The rate reduction results in a negative interest rate. Please check your inputs for points and rate reduction.");
            return;
        }

        const paymentWithoutPoints = calculateMonthlyPayment(loanAmount, baseRate, loanTermYears);
        const paymentWithPoints = calculateMonthlyPayment(loanAmount, newRate, loanTermYears);
        const monthlySaving = paymentWithoutPoints - paymentWithPoints;

        totalPointsCostEl.textContent = formatCurrency(totalCostOfPoints);
        newInterestRateEl.textContent = newRate.toFixed(3) + "%";
        monthlyPaymentWithoutPointsEl.textContent = formatCurrency(paymentWithoutPoints);
        monthlyPaymentWithPointsEl.textContent = formatCurrency(paymentWithPoints);
        
        if (monthlySaving > 0) {
            monthlySavingsEl.textContent = formatCurrency(monthlySaving);
            const breakEvenMonths = Math.ceil(totalCostOfPoints / monthlySaving);
            const breakEvenYears = Math.floor(breakEvenMonths / 12);
            const breakEvenRemainingMonths = breakEvenMonths % 12;
            breakEvenPointEl.textContent = `${breakEvenYears} Year(s), ${breakEvenRemainingMonths} Month(s) (${breakEvenMonths} months total)`;

            const totalPlannedMonths = (plannedYears * 12) + plannedMonths;
            const totalSavings = (monthlySaving * totalPlannedMonths) - totalCostOfPoints;
            totalSavingsForDurationEl.textContent = formatCurrency(totalSavings);

            if (totalPlannedMonths > breakEvenMonths) {
                recommendationTextEl.textContent = "Paying points may be beneficial based on your planned duration, as you'll recoup the cost and save money overall.";
                recommendationTextEl.style.color = "var(--success-color, green)";
            } else if (totalPlannedMonths === breakEvenMonths) {
                 recommendationTextEl.textContent = "Paying points allows you to break even exactly at your planned duration. No net savings or loss beyond recouping points cost.";
                 recommendationTextEl.style.color = "var(--text-color-dark, #333)";
            }
            else {
                recommendationTextEl.textContent = "Paying points may NOT be beneficial. You plan to keep the mortgage for less time than the break-even point.";
                recommendationTextEl.style.color = "var(--danger-color, red)";
            }

        } else if (monthlySaving === 0 && totalCostOfPoints > 0) {
            monthlySavingsEl.textContent = formatCurrency(0);
            breakEvenPointEl.textContent = "N/A (No monthly savings to offset point costs)";
            totalSavingsForDurationEl.textContent = formatCurrency(-totalCostOfPoints); // Show as a loss
            recommendationTextEl.textContent = "Paying points is NOT beneficial as there are no monthly savings.";
            recommendationTextEl.style.color = "var(--danger-color, red)";
        } 
        else if (monthlySaving < 0) { // Payment with points is higher (should not happen if rate reduction is positive)
            monthlySavingsEl.textContent = formatCurrency(monthlySaving) + " (Higher Payment!)";
            breakEvenPointEl.textContent = "N/A (Payment increases)";
            totalSavingsForDurationEl.textContent = formatCurrency( (monthlySaving * ((plannedYears * 12) + plannedMonths)) - totalCostOfPoints);
            recommendationTextEl.textContent = "Paying points results in a HIGHER monthly payment. Check inputs.";
            recommendationTextEl.style.color = "var(--danger-color, red)";
        }
        else { // No points cost, no savings
             monthlySavingsEl.textContent = formatCurrency(0);
             breakEvenPointEl.textContent = "N/A (No points cost)";
             totalSavingsForDurationEl.textContent = formatCurrency(0);
             recommendationTextEl.textContent = "No points being purchased or no cost associated with points.";
             recommendationTextEl.style.color = "var(--text-color-dark, #333)";
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
            recommendationTextEl.style.color = "var(--text-color-dark, #333)";
        });
    }
});
