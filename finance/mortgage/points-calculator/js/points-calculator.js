document.addEventListener("DOMContentLoaded", function () {
    // --- DOM Element References ---
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
    
    // Chart specific
    const chartCanvas = document.getElementById('pointsBreakEvenChart'); // Defined once
    let breakEvenChartInstance = null; 

    // Initial check for chartCanvas
    if (!chartCanvas) {
        console.error("CRITICAL: Chart canvas element with ID 'pointsBreakEvenChart' not found on DOMContentLoaded!");
    }

    // --- Helper Functions ---
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
        if (annualRate < 0) annualRate = 0; 

        const monthlyRate = annualRate / 100 / 12;
        const numberOfPayments = termYears * 12;

        if (monthlyRate === 0) { 
            return principal > 0 && numberOfPayments > 0 ? principal / numberOfPayments : 0;
        }
        const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        return payment;
    }

    // --- Chart Drawing Function ---
    function drawBreakEvenChart(costOfPoints, monthlySaving, breakEvenTimeMonths, plannedTimeMonths) {
        if (breakEvenChartInstance) {
            breakEvenChartInstance.destroy(); 
        }
        if (!chartCanvas) { // Check the global chartCanvas variable
            console.error("Cannot draw chart: Canvas element not found.");
            return; 
        }

        const ctx = chartCanvas.getContext('2d');
        const labels = [];
        const cumulativeSavingsData = [];
        const pointsCostData = [];

        let maxChartMonths = Math.max(breakEvenTimeMonths === Infinity ? 0 : breakEvenTimeMonths, plannedTimeMonths, 12) + 24; 
        maxChartMonths = Math.min(maxChartMonths, parseIntSafe(loanTermEl.value, 30) * 12); 
        if (maxChartMonths > 360 && loanTermEl.value <=30) maxChartMonths = 360; // Cap at 30 years for very long break-evens unless term is longer
        if (maxChartMonths <=0) maxChartMonths = 60; // Default to 5 years if other values are zero


        for (let m = 0; m <= maxChartMonths; m++) {
            labels.push(m); 
            cumulativeSavingsData.push(monthlySaving > 0 ? monthlySaving * m : 0);
            pointsCostData.push(costOfPoints);
        }
        
        chartCanvas.style.display = 'block'; // Ensure canvas is visible before drawing

        breakEvenChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cumulative Savings',
                    data: cumulativeSavingsData,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1,
                    fill: true,
                }, {
                    label: 'Cost of Points',
                    data: pointsCostData,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.1,
                    borderDash: [5, 5], 
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Months'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Amount ($)'
                        },
                        beginAtZero: true 
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Break-Even Analysis: Cumulative Savings vs. Cost of Points'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += formatCurrency(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
            }
        });
    }


    // --- Main Calculation Function ---
    function performCalculation() {
        const loanAmount = parseFloatSafe(loanAmountEl.value);
        const loanTermYears = parseIntSafe(loanTermEl.value);
        const baseRate = parseFloatSafe(baseInterestRateEl.value);
        const pointsPurchased = parseFloatSafe(pointsToPurchaseEl.value);
        const costPerPointPercent = parseFloatSafe(costPerPointEl.value, 1); 
        const rateReductionPerPoint = parseFloatSafe(rateReductionPerPointEl.value);
        const plannedYears = parseIntSafe(plannedDurationYearsEl.value);
        const plannedMonths = parseIntSafe(plannedDurationMonthsEl.value);

        let isValid = true;
        let alertMessage = "";

        if (loanAmount <= 0) { alertMessage += "Loan Amount must be greater than zero.\n"; isValid = false; }
        if (loanTermYears <= 0) { alertMessage += "Loan Term must be greater than zero.\n"; isValid = false; }
        if (pointsPurchased < 0) { alertMessage += "Number of Points to Purchase cannot be negative.\n"; isValid = false; }
        if (pointsPurchased > 0 && costPerPointPercent <= 0) { alertMessage += "Cost Per Point must be greater than zero if purchasing points.\n"; isValid = false; }
        if (pointsPurchased > 0 && rateReductionPerPoint <= 0) { alertMessage += "Interest Rate Reduction Per Point must be greater than zero if purchasing points.\n"; isValid = false; }
        if (plannedYears < 0 || plannedMonths < 0 || (plannedYears === 0 && plannedMonths === 0)) { alertMessage += "Planned duration to keep the mortgage must be at least 1 month.\n"; isValid = false; }
        
        if (!isValid) {
            alert(alertMessage.trim());
            if (breakEvenChartInstance) { breakEvenChartInstance.destroy(); breakEvenChartInstance = null;} 
            if (chartCanvas) { // Use the global chartCanvas variable
                chartCanvas.style.display = 'none'; 
            } else {
                console.error("Chart canvas not found when trying to hide on validation error.");
            }
            return;
        }
        // If inputs are valid, ensure canvas is ready to be displayed (Chart.js will handle actual drawing)
        if (chartCanvas) { 
            chartCanvas.style.display = 'block'; 
        } else {
             console.error("Chart canvas not found when trying to show after validation pass.");
        }


        const totalCostOfPoints = loanAmount * (pointsPurchased * (costPerPointPercent / 100));
        const totalRateReduction = pointsPurchased * rateReductionPerPoint;
        const newRate = baseRate - totalRateReduction;

        if (newRate < 0) {
            alert("The calculated new interest rate is negative. The rate reduction from points cannot exceed the base interest rate. Please adjust your inputs.");
            newInterestRateEl.textContent = "Error: Rate < 0%";
            resultsSection.style.display = "block"; // Show results section to display error
            totalPointsCostEl.textContent = formatCurrency(totalCostOfPoints); 
            if (breakEvenChartInstance) { breakEvenChartInstance.destroy(); breakEvenChartInstance = null; }
            if (chartCanvas) { chartCanvas.style.display = 'none'; }
            // Clear other text fields too
            monthlyPaymentWithoutPointsEl.textContent = "-";
            monthlyPaymentWithPointsEl.textContent = "-";
            monthlySavingsEl.textContent = "-";
            breakEvenPointEl.textContent = "-";
            totalSavingsForDurationEl.textContent = "-";
            recommendationTextEl.textContent = "Error: New interest rate is negative.";
            recommendationTextEl.style.color = "var(--danger-color, red)";
            return;
        }

        const paymentWithoutPoints = calculateMonthlyPayment(loanAmount, baseRate, loanTermYears);
        const paymentWithPoints = calculateMonthlyPayment(loanAmount, newRate, loanTermYears);
        const monthlySaving = paymentWithoutPoints - paymentWithPoints;

        totalPointsCostEl.textContent = formatCurrency(totalCostOfPoints);
        newInterestRateEl.textContent = newRate.toFixed(3) + "%";
        monthlyPaymentWithoutPointsEl.textContent = formatCurrency(paymentWithoutPoints);
        monthlyPaymentWithPointsEl.textContent = formatCurrency(paymentWithPoints);
        
        let breakEvenMonths = Infinity; 
        if (pointsPurchased === 0 || totalCostOfPoints === 0) {
            monthlySavingsEl.textContent = formatCurrency(0);
            breakEvenPointEl.textContent = "N/A (No points)";
            totalSavingsForDurationEl.textContent = formatCurrency(0);
            recommendationTextEl.textContent = "No points are being purchased, so there's no change in payment or break-even to calculate.";
            recommendationTextEl.style.color = "var(--text-color-dark, #333)";
        } else if (monthlySaving <= 0.001) { 
            monthlySavingsEl.textContent = formatCurrency(monthlySaving);
            breakEvenPointEl.textContent = "N/A (No monthly savings or payment increased)";
            const netLoss = (monthlySaving * ((plannedYears * 12) + plannedMonths)) - totalCostOfPoints;
            totalSavingsForDurationEl.textContent = formatCurrency(netLoss);
            recommendationTextEl.textContent = "Paying points does not result in monthly savings or increases your payment. Not recommended.";
            recommendationTextEl.style.color = "var(--danger-color, red)";
        } else { 
            monthlySavingsEl.textContent = formatCurrency(monthlySaving);
            breakEvenMonths = Math.ceil(totalCostOfPoints / monthlySaving);
            const breakEvenYearsVal = Math.floor(breakEvenMonths / 12);
            const breakEvenRemainingMonthsVal = breakEvenMonths % 12;
            breakEvenPointEl.textContent = `${breakEvenYearsVal} Year(s), ${breakEvenRemainingMonthsVal} Month(s) (${breakEvenMonths} months total)`;

            const totalPlannedMonths = (plannedYears * 12) + plannedMonths;
            const totalSavingsValue = (monthlySaving * totalPlannedMonths) - totalCostOfPoints;
            totalSavingsForDurationEl.textContent = formatCurrency(totalSavingsValue);

            if (totalPlannedMonths > breakEvenMonths) {
                recommendationTextEl.textContent = "Paying points appears beneficial based on your planned duration. You'll recoup the cost of points and save money overall.";
                recommendationTextEl.style.color = "var(--success-color, green)";
            } else if (totalPlannedMonths === breakEvenMonths) {
                 recommendationTextEl.textContent = "Paying points allows you to break even exactly at your planned duration. You will recoup the cost of points, with no additional net savings or loss.";
                 recommendationTextEl.style.color = "var(--text-color-dark, #333)";
            } else { 
                recommendationTextEl.textContent = "Paying points may NOT be beneficial. You plan to keep the mortgage for less time than it takes to reach the break-even point.";
                recommendationTextEl.style.color = "var(--danger-color, red)";
            }
        }

        resultsSection.style.display = "block";
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        
        if (monthlySaving > 0 && pointsPurchased > 0 && chartCanvas) { // Ensure chartCanvas exists
            drawBreakEvenChart(totalCostOfPoints, monthlySaving, breakEvenMonths, (plannedYears * 12) + plannedMonths);
        } else {
            if (breakEvenChartInstance) { breakEvenChartInstance.destroy(); breakEvenChartInstance = null; }
            if (chartCanvas) { chartCanvas.style.display = 'none'; }
        }
    }

    // --- Event Listeners ---
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
            
            if (breakEvenChartInstance) {
                breakEvenChartInstance.destroy();
                breakEvenChartInstance = null;
            }
            if (chartCanvas) { // Use the global chartCanvas variable
                // Clear the canvas content
                const ctx = chartCanvas.getContext('2d');
                ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
                // Optionally hide it or ensure its container shows placeholder text if needed
                // For now, just clearing. The container div has placeholder text if canvas is empty.
                 chartCanvas.style.display = 'none'; // Hide it on reset, performCalculation will show it.
            }
        });
    }
});
