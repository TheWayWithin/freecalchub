document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("compound-interest-form");
    const resultsSection = document.getElementById("results-section");

    // Result display elements
    const futureValueNominalEl = document.getElementById("future_value_nominal");
    const futureValueInflationAdjustedContainerEl = document.getElementById("future_value_inflation_adjusted_container");
    const futureValueInflationAdjustedEl = document.getElementById("future_value_inflation_adjusted");
    const totalPrincipalInvestedEl = document.getElementById("total_principal_invested");
    const totalInterestEarnedEl = document.getElementById("total_interest_earned");
    const effectiveAnnualRateEl = document.getElementById("effective_annual_rate");
    const afterTaxFutureValueContainerEl = document.getElementById("after_tax_future_value_container");
    const afterTaxFutureValueEl = document.getElementById("after_tax_future_value");
    const yearlyGrowthTableBodyEl = document.querySelector("#yearlyGrowthTable tbody");

    let investmentGrowthChartInstance = null;
    let principalInterestChartInstance = null;

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        calculateAndDisplay();
    });

    form.addEventListener("reset", () => {
        resultsSection.style.display = "none";
        yearlyGrowthTableBodyEl.innerHTML = "";
        if (investmentGrowthChartInstance) investmentGrowthChartInstance.destroy();
        if (principalInterestChartInstance) principalInterestChartInstance.destroy();
    });

    function getNumericValue(id, allowZero = false, isRate = false) {
        const value = document.getElementById(id).value.trim();
        if (value === "" && !document.getElementById(id).hasAttribute("required")) {
            return 0; // Optional fields can be empty, treat as 0
        }
        const number = parseFloat(value.replace(/,/g, ""));
        if (isNaN(number) || (!allowZero && number <= 0 && document.getElementById(id).hasAttribute("required")) || (number < 0)) {
            alert(`Please enter a valid positive number for ${document.querySelector("label[for='" + id + "']").textContent}.`);
            document.getElementById(id).focus();
            throw new Error("Invalid input");
        }
        if (isRate && number > 200) { // Arbitrary upper limit for rates
             alert(`Please enter a realistic interest/inflation/tax rate for ${document.querySelector("label[for='" + id + "']").textContent}.`);
            document.getElementById(id).focus();
            throw new Error("Invalid rate input");
        }
        return number;
    }

    function calculateAndDisplay() {
        try {
            const initialInvestment = getNumericValue("initial_investment", true);
            const annualContribution = getNumericValue("annual_contribution", true);
            const contributionFrequencyStr = document.getElementById("contribution_frequency").value;
            const annualInterestRate = getNumericValue("annual_interest_rate", false, true);
            const compoundingFrequencyStr = document.getElementById("compounding_frequency").value;
            const investmentPeriodYears = getNumericValue("investment_period_years");
            const inflationRate = getNumericValue("inflation_rate", true, true);
            const taxRate = getNumericValue("tax_rate", true, true);

            const contributionFrequencyMap = { monthly: 12, quarterly: 4, annually: 1 };
            const compoundingFrequencyMap = { daily: 365, monthly: 12, quarterly: 4, annually: 1 };

            const contribFreqVal = contributionFrequencyMap[contributionFrequencyStr];
            const compFreqVal = compoundingFrequencyMap[compoundingFrequencyStr];

            let balance = initialInvestment;
            let totalPrincipal = initialInvestment;
            let totalInterest = 0;
            const yearlyData = [];

            const periodicInterestRate = (annualInterestRate / 100) / compFreqVal;
            const contributionPerEvent = (annualContribution > 0 && contribFreqVal > 0) ? annualContribution / contribFreqVal : 0;
            
            let yearStartBalance = balance;
            let yearInterest = 0;
            let yearContributions = 0;

            for (let year = 1; year <= investmentPeriodYears; year++) {
                yearStartBalance = balance;
                yearInterest = 0;
                yearContributions = 0;

                for (let period = 1; period <= compFreqVal; period++) {
                    const interestForPeriod = balance * periodicInterestRate;
                    balance += interestForPeriod;
                    totalInterest += interestForPeriod;
                    yearInterest += interestForPeriod;

                    // Handle contributions at the end of the compounding period that aligns with contribution frequency
                    if (contributionPerEvent > 0) {
                        // Check if this compounding period 'period' marks the end of a contribution interval for the current year
                        // This simplified model assumes compFreqVal is a multiple of contribFreqVal or alignment is handled by user choice.
                        // E.g. Monthly contrib (12 p.a) & Monthly compound (12 p.a) -> contrib every period (12/12=1)
                        // E.g. Annual contrib (1 p.a) & Monthly compound (12 p.a) -> contrib at 12th period (12/1=12)
                        // E.g. Quarterly contrib (4 p.a) & Monthly compound (12 p.a) -> contrib at 3rd, 6th, 9th, 12th period (12/4=3)
                        if (contribFreqVal > 0 && compFreqVal % contribFreqVal === 0) {
                            if (period % (compFreqVal / contribFreqVal) === 0) {
                                balance += contributionPerEvent;
                                totalPrincipal += contributionPerEvent;
                                yearContributions += contributionPerEvent;
                            }
                        } else if (contribFreqVal > 0 && compFreqVal === 365 && contribFreqVal === 12) {
                            // Special handling for daily compounding with monthly contributions (approximate)
                            // Assume contribution at the end of roughly each month's worth of days
                            const daysInPseudoMonth = 365 / 12;
                            if (period % Math.round(daysInPseudoMonth) === 0 || period === compFreqVal) { // also ensure last period of year if it's close
                                // This is an approximation. For exact month ends, a date library would be needed.
                                // For now, distribute it at these intervals.
                                if (yearContributions < annualContribution) { // ensure not to over-contribute within a year
                                    const actualContributionThisTime = Math.min(contributionPerEvent, annualContribution - yearContributions);
                                    balance += actualContributionThisTime;
                                    totalPrincipal += actualContributionThisTime;
                                    yearContributions += actualContributionThisTime;
                                }
                            }
                        } else if (contribFreqVal > 0 && period === compFreqVal) {
                            // Fallback: if frequencies don't align well, add total annual contribution at year end if not already handled
                            // This is a simplification if the above conditions didn't catch all contributions for the year.
                            if (yearContributions < annualContribution) {
                                const remainingAnnualContrib = annualContribution - yearContributions;
                                balance += remainingAnnualContrib;
                                totalPrincipal += remainingAnnualContrib;
                                yearContributions += remainingAnnualContrib;
                            }
                        }
                    }
                }
                yearlyData.push({
                    year: year,
                    startingBalance: yearStartBalance,
                    contributions: yearContributions,
                    interestEarned: yearInterest,
                    endingBalance: balance
                });
            }

            const futureValueNominal = balance;
            const effectiveAnnualRate = (Math.pow(1 + (annualInterestRate / 100) / compFreqVal, compFreqVal) - 1) * 100;

            futureValueNominalEl.textContent = formatCurrency(futureValueNominal);
            totalPrincipalInvestedEl.textContent = formatCurrency(totalPrincipal);
            totalInterestEarnedEl.textContent = formatCurrency(totalInterest);
            effectiveAnnualRateEl.textContent = effectiveAnnualRate.toFixed(2) + "%";

            if (inflationRate > 0) {
                const futureValueInflationAdjusted = futureValueNominal / Math.pow(1 + inflationRate / 100, investmentPeriodYears);
                futureValueInflationAdjustedEl.textContent = formatCurrency(futureValueInflationAdjusted);
                futureValueInflationAdjustedContainerEl.style.display = "block";
            } else {
                futureValueInflationAdjustedContainerEl.style.display = "none";
            }

            if (taxRate > 0) {
                const taxableGain = totalInterest; // Simplified: tax on total interest earned
                const taxAmount = taxableGain * (taxRate / 100);
                const afterTaxFutureValue = futureValueNominal - taxAmount;
                afterTaxFutureValueEl.textContent = formatCurrency(afterTaxFutureValue);
                afterTaxFutureValueContainerEl.style.display = "block";
            } else {
                afterTaxFutureValueContainerEl.style.display = "none";
            }

            populateYearlyTable(yearlyData);
            createOrUpdateCharts(yearlyData, totalPrincipal, totalInterest, initialInvestment);
            resultsSection.style.display = "block";
            resultsSection.scrollIntoView({ behavior: "smooth" });

        } catch (error) {
            console.error(error);
            // Alert was shown in getNumericValue or other validation
            resultsSection.style.display = "none";
        }
    }

    function formatCurrency(value) {
        return "$" + value.toFixed(2).replace(/
B(?=(\d{3})+(?!\d))/g, ",");
    }

    function populateYearlyTable(data) {
        yearlyGrowthTableBodyEl.innerHTML = ""; // Clear previous data
        data.forEach(item => {
            const row = yearlyGrowthTableBodyEl.insertRow();
            row.insertCell().textContent = item.year;
            row.insertCell().textContent = formatCurrency(item.startingBalance);
            row.insertCell().textContent = formatCurrency(item.contributions);
            row.insertCell().textContent = formatCurrency(item.interestEarned);
            row.insertCell().textContent = formatCurrency(item.endingBalance);
        });
    }

    function createOrUpdateCharts(yearlyData, totalPrincipal, totalInterest, initialInvestment) {
        const growthChartCtx = document.getElementById("investmentGrowthChart").getContext("2d");
        const principalInterestCtx = document.getElementById("principalInterestChart").getContext("2d");

        const labels = ["Start", ...yearlyData.map(d => `Year ${d.year}`)];
        const balanceData = [initialInvestment, ...yearlyData.map(d => d.endingBalance)];

        if (investmentGrowthChartInstance) {
            investmentGrowthChartInstance.destroy();
        }
        investmentGrowthChartInstance = new Chart(growthChartCtx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Investment Value",
                    data: balanceData,
                    borderColor: "#007bff",
                    backgroundColor: "rgba(0, 123, 255, 0.1)",
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: { callback: value => formatCurrency(value) }
                    }
                }
            }
        });

        if (principalInterestChartInstance) {
            principalInterestChartInstance.destroy();
        }
        principalInterestChartInstance = new Chart(principalInterestCtx, {
            type: "pie",
            data: {
                labels: ["Total Principal Invested", "Total Interest Earned"],
                datasets: [{
                    data: [totalPrincipal, totalInterest],
                    backgroundColor: ["#28a745", "#ffc107"],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += formatCurrency(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
});

