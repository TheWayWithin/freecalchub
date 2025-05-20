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
    const chartCanvas = document.getElementById('pointsBreakEvenChart');
    let breakEvenChartInstance = null; // To store the chart instance

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
            breakEvenChartInstance.destroy(); // Destroy previous chart instance
        }
        if (!chartCanvas) return; // Ensure canvas element exists

        const ctx = chartCanvas.getContext('2d');
        const labels = [];
        const cumulativeSavingsData = [];
        const pointsCostData = [];

        // Determine the maximum number of months to show on the chart
        // Show a bit beyond the longer of break-even or planned time, up to a reasonable max (e.g., 10 years = 120 months if break-even is far)
        let maxChartMonths = Math.max(breakEvenTimeMonths, plannedTimeMonths, 12) + 24; // Show 2 years beyond
        if (breakEvenTimeMonths === Infinity) { // If no break-even due to no savings
            maxChartMonths = Math.max(plannedTimeMonths, 12) + 24;
        }
        maxChartMonths = Math.min(maxChartMonths, loanTermEl.value * 12); // Don't exceed loan term
        if (maxChartMonths > 360) maxChartMonths = 360; // Cap at 30 years for very long break-evens

        for (let m = 0; m <= maxChartMonths; m++) {
            labels.push(m); // Months
            cumulativeSavingsData.push(monthlySaving > 0 ? monthlySaving * m : 0);
            pointsCostData.push(costOfPoints);
        }

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
                    borderDash: [5, 5], // Dashed line for cost
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
                // Annotation for break-even point (requires chartjs-plugin-annotation)
                // For simplicity, we'll rely on the visual intersection and the text output for now.
                // To add a vertical line at breakEvenTimeMonths:
                // You would typically use a plugin or draw directly on the canvas.
                // Chart.js v3 doesn't have built-in annotation as easily as v2.
                // We can add a point on the datasets for emphasis if needed.
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
        // baseRate can be 0, but points are then not useful.
        if (pointsPurchased < 0) { alertMessage += "Number of Points to Purchase cannot be negative.\n"; isValid = false; }
        if (pointsPurchased > 0 && costPerPointPercent <= 0) { alertMessage += "Cost Per Point must be greater than zero if purchasing points.\n"; isValid = false; }
        if (pointsPurchased > 0 && rateReductionPerPoint <= 0) { alertMessage += "Interest Rate Reduction Per Point must be greater than zero if purchasing points.\n"; isValid = false; }
        if (plannedYears < 0 || plannedMonths < 0 || (plannedYears === 0 && plannedMonths === 0)) { alertMessage += "Planned duration to keep the mortgage must be at least 1 month.\n"; isValid = false; }
        
        if (!isValid) {
            alert(alertMessage.trim());
            if (breakEvenChartInstance) { breakEvenChartInstance.destroy(); } // Clear chart on error
            document.getElementById('pointsBreakEvenChart').style.display = 'none'; // Hide canvas
            return;
        }
        document.getElementById('pointsBreakEvenChart').style.display = 'block'; // Show canvas

        const totalCostOfPoints = loanAmount * (pointsPurchased * (costPerPointPercent / 100));
        const totalRateReduction = pointsPurchased * rateReductionPerPoint;
        const newRate = baseRate - totalRateReduction;

        if (newRate < 0) {
            alert("The calculated new interest rate is negative. The rate reduction from points cannot exceed the base interest rate. Please adjust your inputs.");
            newInterestRateEl.textContent = "Error: Rate < 0%";
            resultsSection.style.display = "block";
            totalPointsCostEl.textContent = formatCurrency(totalCostOfPoints); 
            if (breakEvenChartInstance) { breakEvenChartInstance.destroy(); }
            document.getElementById('pointsBreakEvenChart').style.display = 'none';
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
        } else if (monthlySaving <= 0.001) { // Check for negligible or negative savings
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
        
        if (monthlySaving > 0 && pointsPurchased > 0) {
            drawBreakEvenChart(totalCostOfPoints, monthlySaving, breakEvenMonths, (plannedYears * 12) + plannedMonths);
        } else {
            if (breakEvenChartInstance) { breakEvenChartInstance.destroy(); }
            document.getElementById('pointsBreakEvenChart').style.display = 'none';
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
            document.getElementById('pointsBreakEvenChart').style.display = 'block'; // Keep canvas visible but empty
            const chartPlaceholder = document.getElementById("breakEvenChartContainer");
            if(chartPlaceholder) { // Re-add placeholder text if needed, or just ensure canvas is cleared
                const canvas = document.getElementById('pointsBreakEvenChart');
                if(canvas) {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
                // Or, if you want the text back:
                // chartPlaceholder.innerHTML = '<canvas id="pointsBreakEvenChart"></canvas>'; // This recreates canvas, might not be best
                // Better: just ensure chart is destroyed. User will see empty canvas or placeholder div styling.
            }
        });
    }
});
