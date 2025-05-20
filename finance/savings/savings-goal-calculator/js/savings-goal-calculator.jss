document.addEventListener("DOMContentLoaded", function () {
    // --- DOM Element References ---
    const calculatorForm = document.getElementById("savingsGoalForm");
    const calculateButton = document.getElementById("calculateButton");
    const resultsSection = document.getElementById("resultsSection");

    // Inputs
    const goalAmountEl = document.getElementById("goalAmount");
    const initialSavingsEl = document.getElementById("initialSavings");
    const timeToSaveYearsEl = document.getElementById("timeToSaveYears");
    const timeToSaveMonthsEl = document.getElementById("timeToSaveMonths");
    const annualInterestRateEl = document.getElementById("annualInterestRate");
    const compoundingFrequencyEl = document.getElementById("compoundingFrequency");
    const savingFrequencyEl = document.getElementById("savingFrequency");

    // Outputs
    const regularSavingsNeededEl = document.getElementById("regularSavingsNeeded");
    const savingsFrequencyTextEl = document.getElementById("savingsFrequencyText");
    const totalPrincipalSavedEl = document.getElementById("totalPrincipalSaved");
    const totalInterestEarnedEl = document.getElementById("totalInterestEarned");
    const goalReachedDateEl = document.getElementById("goalReachedDate");
    
    const chartCanvas = document.getElementById('savingsGrowthChart');
    let savingsChartInstance = null;

    if (!chartCanvas) {
        console.error("CRITICAL: Chart canvas element with ID 'savingsGrowthChart' not found on DOMContentLoaded!");
    } else {
        chartCanvas.style.display = 'none'; // Hide chart initially
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
    function formatDate(date) {
        if (!date || !(date instanceof Date) || isNaN(date.valueOf())) return "-";
        const year = date.getFullYear();
        const month = date.toLocaleString('default', { month: 'long' }); // Get full month name
        return `${month} ${year}`;
    }

    // --- Chart Drawing Function ---
    function drawSavingsChart(schedule, savingFreqText) {
        if (savingsChartInstance) {
            savingsChartInstance.destroy();
        }
        if (!chartCanvas || !schedule || schedule.length === 0) {
            if (chartCanvas) chartCanvas.style.display = 'none';
            return;
        }
        chartCanvas.style.display = 'block';

        const labels = schedule.map(item => `Period ${item.period}`); 
        const savingsData = schedule.map(item => item.balance);
        const principalData = schedule.map(item => item.cumulativePrincipal);

        const ctx = chartCanvas.getContext('2d');
        savingsChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Savings Balance',
                        data: savingsData,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: true,
                        tension: 0.1
                    },
                    {
                        label: 'Total Principal Contributed',
                        data: principalData,
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        fill: true,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { display: true, text: `Saving Periods (${savingFreqText})` }
                    },
                    y: {
                        title: { display: true, text: 'Amount ($)' },
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) { return formatCurrency(value); }
                        }
                    }
                },
                plugins: {
                    title: { display: true, text: 'Projected Savings Growth Over Time' },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed.y !== null) { label += formatCurrency(context.parsed.y); }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }


    // --- Main Calculation Function ---
    function performCalculation() {
        const goalAmount = parseFloatSafe(goalAmountEl.value);
        let initialSavings = parseFloatSafe(initialSavingsEl.value);
        const years = parseIntSafe(timeToSaveYearsEl.value);
        const months = parseIntSafe(timeToSaveMonthsEl.value);
        const annualRate = parseFloatSafe(annualInterestRateEl.value) / 100; 
        const compoundingFrequencyValue = compoundingFrequencyEl.value;
        const savingFrequencyValue = savingFrequencyEl.value;

        let alertMessage = "";
        if (goalAmount <= 0) alertMessage += "Financial Goal Amount must be greater than zero.\n";
        if (initialSavings < 0) alertMessage += "Initial Savings cannot be negative.\n";
        if (years < 0 || months < 0 || (years === 0 && months === 0)) alertMessage += "Time to Save must be at least 1 month.\n";
        if (annualRate < 0) alertMessage += "Annual Interest Rate cannot be negative.\n";
        
        if (alertMessage) {
            alert(alertMessage.trim());
            if (savingsChartInstance) { savingsChartInstance.destroy(); savingsChartInstance = null; }
            if (chartCanvas) chartCanvas.style.display = 'none';
            resultsSection.style.display = "none";
            return;
        }

        const totalMonthsToSave = (years * 12) + months;
        if (initialSavings >= goalAmount) {
            regularSavingsNeededEl.textContent = formatCurrency(0);
            savingsFrequencyTextEl.textContent = `per ${savingFrequencyValue.replace('-', ' ')}`;
            totalPrincipalSavedEl.textContent = formatCurrency(initialSavings); // Principal is just what you started with
            totalInterestEarnedEl.textContent = formatCurrency(0);
            goalReachedDateEl.textContent = "Goal already met!";
            if (savingsChartInstance) { savingsChartInstance.destroy(); savingsChartInstance = null; }
            if (chartCanvas) chartCanvas.style.display = 'none';
            resultsSection.style.display = "block";
            resultsSection.scrollIntoView({ behavior: "smooth" });
            return;
        }

        let periodsPerYear;
        let savingFreqText = savingFrequencyValue;
        switch (savingFrequencyValue) {
            case 'weekly': periodsPerYear = 52; savingFreqText = "Week"; break;
            case 'bi-weekly': periodsPerYear = 26; savingFreqText = "Two Weeks"; break;
            case 'monthly': default: periodsPerYear = 12; savingFreqText = "Month"; break;
        }
        
        const totalSavingPeriods = Math.ceil(totalMonthsToSave / 12 * periodsPerYear);
        
        let compoundingPeriodsPerYear;
        switch (compoundingFrequencyValue) {
            case 'annually': compoundingPeriodsPerYear = 1; break;
            case 'quarterly': compoundingPeriodsPerYear = 4; break;
            case 'monthly': default: compoundingPeriodsPerYear = 12; break;
        }

        const effectiveRatePerSavingPeriod = Math.pow(1 + annualRate / compoundingPeriodsPerYear, compoundingPeriodsPerYear / periodsPerYear) - 1;
        
        let regularSaving;
        const futureValueOfPV = initialSavings * Math.pow(1 + effectiveRatePerSavingPeriod, totalSavingPeriods);
        
        if (effectiveRatePerSavingPeriod < 0.0000001) { // Effectively zero interest
            regularSaving = (goalAmount - initialSavings) / totalSavingPeriods;
        } else {
            const pmtFactor = (Math.pow(1 + effectiveRatePerSavingPeriod, totalSavingPeriods) - 1) / effectiveRatePerSavingPeriod;
            if (pmtFactor === 0) { 
                regularSaving = (goalAmount - initialSavings); 
            } else {
                 regularSaving = (goalAmount - futureValueOfPV) / pmtFactor;
            }
        }
        
        if (regularSaving < 0) regularSaving = 0; 

        const schedule = [];
        let currentBalance = initialSavings;
        let cumulativePrincipalContributions = 0; // Only contributions, not initial savings
        let cumulativeInterest = 0;

        for (let i = 1; i <= totalSavingPeriods; i++) {
            let interestThisPeriod = currentBalance * effectiveRatePerSavingPeriod;
            currentBalance += interestThisPeriod;
            currentBalance += regularSaving;
            
            cumulativePrincipalContributions += regularSaving;
            cumulativeInterest += interestThisPeriod;

            schedule.push({
                period: i,
                balance: currentBalance,
                cumulativePrincipal: initialSavings + cumulativePrincipalContributions, // Initial + contributions
                cumulativeInterest: cumulativeInterest
            });
            if (currentBalance >= goalAmount) break; 
        }
        
        const actualTotalPrincipal = initialSavings + cumulativePrincipalContributions;
        const actualTotalInterest = cumulativeInterest;

        regularSavingsNeededEl.textContent = formatCurrency(regularSaving);
        savingsFrequencyTextEl.textContent = `per ${savingFreqText.toLowerCase()}`;
        totalPrincipalSavedEl.textContent = formatCurrency(actualTotalPrincipal);
        totalInterestEarnedEl.textContent = formatCurrency(actualTotalInterest);

        const today = new Date();
        const goalDate = new Date(today.getFullYear(), today.getMonth() + totalMonthsToSave, today.getDate());
        goalReachedDateEl.textContent = formatDate(goalDate);

        resultsSection.style.display = "block";
        resultsSection.scrollIntoView({ behavior: "smooth" });
        drawSavingsChart(schedule, savingFreqText);
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
            if (savingsChartInstance) {
                savingsChartInstance.destroy();
                savingsChartInstance = null;
            }
            if (chartCanvas) {
                chartCanvas.style.display = 'none';
                 const ctx = chartCanvas.getContext('2d');
                 ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
            }
        });
    }
});
