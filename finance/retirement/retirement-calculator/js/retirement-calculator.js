// finance/retirement/retirement-calculator/js/retirement-calculator.js

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('retirementForm');
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const resultsSection = document.getElementById('resultsSection');
    const errorMessagesDiv = document.getElementById('errorMessages');

    // Input Fields
    const currentAgeEl = document.getElementById('currentAge');
    const retirementAgeEl = document.getElementById('retirementAge');
    const lifeExpectancyEl = document.getElementById('lifeExpectancy');
    const currentIncomeEl = document.getElementById('currentIncome');
    const retirementIncomeValueEl = document.getElementById('retirementIncomeValue');
    const retirementIncomeTypeEl = document.getElementById('retirementIncomeType');
    const currentSavingsEl = document.getElementById('currentSavings');
    const annualContributionValueEl = document.getElementById('annualContributionValue');
    const annualContributionTypeEl = document.getElementById('annualContributionType');
    const includeSocialSecurityEl = document.getElementById('includeSocialSecurity');
    const socialSecurityGroup = document.getElementById('socialSecurityGroup');
    const socialSecurityAmountEl = document.getElementById('socialSecurityAmount');
    const preRetirementReturnEl = document.getElementById('preRetirementReturn');
    const postRetirementReturnEl = document.getElementById('postRetirementReturn');
    const inflationRateEl = document.getElementById('inflationRate');

    // Result Fields
    const nestEggNeededEl = document.getElementById('nestEggNeeded');
    const projectedSavingsEl = document.getElementById('projectedSavings');
    const shortfallSurplusEl = document.getElementById('shortfallSurplus');
    const shortfallSurplusCard = document.getElementById('shortfallSurplusCard');
    const additionalSavingsEl = document.getElementById('additionalSavings');
    const additionalSavingsCard = document.getElementById('additionalSavingsCard');

    // Chart Canvases & Chart Objects
    const savingsGrowthCtx = document.getElementById('savingsGrowthChart').getContext('2d');
    const incomeSourcesCtx = document.getElementById('incomeSourcesChart').getContext('2d');
    let savingsGrowthChart = null;
    let incomeSourcesChart = null;

    // --- Event Listeners ---

    // Toggle Social Security field visibility
    includeSocialSecurityEl.addEventListener('change', () => {
        socialSecurityGroup.style.display = includeSocialSecurityEl.value === 'yes' ? 'block' : 'none';
        if (includeSocialSecurityEl.value === 'no') {
            socialSecurityAmountEl.value = ''; // Clear if set to No
        }
    });

    // Calculate button click
    calculateButton.addEventListener('click', () => {
        if (validateInputs()) {
            performCalculations();
            gtag('event', 'CalculateRetirement', {'event_category': 'Calculator', 'event_label': 'Success'});
        } else {
            gtag('event', 'CalculateRetirement', {'event_category': 'Calculator', 'event_label': 'ValidationError'});
        }
    });

    // Reset button click
    resetButton.addEventListener('click', () => {
        form.reset();
        resultsSection.style.display = 'none';
        errorMessagesDiv.style.display = 'none';
        socialSecurityGroup.style.display = 'none';
        if(savingsGrowthChart) savingsGrowthChart.destroy();
        if(incomeSourcesChart) incomeSourcesChart.destroy();
        gtag('event', 'ResetForm', {'event_category': 'Calculator', 'event_label': 'Retirement'});
    });

    // --- Input Validation ---
    function validateInputs() {
        const inputs = [
            currentAgeEl, retirementAgeEl, lifeExpectancyEl, currentIncomeEl,
            retirementIncomeValueEl, currentSavingsEl, annualContributionValueEl,
            preRetirementReturnEl, postRetirementReturnEl, inflationRateEl
        ];
        if (includeSocialSecurityEl.value === 'yes') {
            inputs.push(socialSecurityAmountEl);
        }

        let errors = [];
        errorMessagesDiv.innerHTML = '';

        inputs.forEach(input => {
            if (!input.value || parseFloat(input.value) < 0) {
                errors.push(`${input.previousElementSibling.textContent} must be a non-negative number.`);
                input.style.borderColor = 'red';
            } else {
                 input.style.borderColor = 'var(--border-color)';
            }
        });

        const currentAge = parseFloat(currentAgeEl.value);
        const retirementAge = parseFloat(retirementAgeEl.value);
        const lifeExpectancy = parseFloat(lifeExpectancyEl.value);

        if (retirementAge <= currentAge) {
            errors.push("Retirement age must be greater than current age.");
            retirementAgeEl.style.borderColor = 'red';
        }
        if (lifeExpectancy <= retirementAge) {
            errors.push("Life expectancy must be greater than retirement age.");
            lifeExpectancyEl.style.borderColor = 'red';
        }

        if (errors.length > 0) {
            let errorList = '<ul>';
            errors.forEach(err => errorList += `<li>${err}</li>`);
            errorList += '</ul>';
            errorMessagesDiv.innerHTML = errorList;
            errorMessagesDiv.style.display = 'block';
            resultsSection.style.display = 'none';
            return false;
        }

        errorMessagesDiv.style.display = 'none';
        return true;
    }

    // --- Calculation Logic ---
    function performCalculations() {
        // Get parsed values
        const currentAge = parseFloat(currentAgeEl.value);
        const retirementAge = parseFloat(retirementAgeEl.value);
        const lifeExpectancy = parseFloat(lifeExpectancyEl.value);
        const currentIncome = parseFloat(currentIncomeEl.value);
        let desiredIncome = parseFloat(retirementIncomeValueEl.value);
        const currentSavings = parseFloat(currentSavingsEl.value);
        let annualContribution = parseFloat(annualContributionValueEl.value);
        const preReturn = parseFloat(preRetirementReturnEl.value) / 100;
        const postReturn = parseFloat(postRetirementReturnEl.value) / 100;
        const inflation = parseFloat(inflationRateEl.value) / 100;
        const socialSecurity = includeSocialSecurityEl.value === 'yes' ? parseFloat(socialSecurityAmountEl.value || 0) * 12 : 0;

        const yearsToRetire = retirementAge - currentAge;
        const yearsInRetirement = lifeExpectancy - retirementAge;

        // Adjust % inputs
        if (retirementIncomeTypeEl.value === 'percent') {
            desiredIncome = currentIncome * (desiredIncome / 100);
        }
        if (annualContributionTypeEl.value === 'percent') {
            annualContribution = currentIncome * (annualContribution / 100);
        }

        // --- Core Calculations ---

        // 1. Calculate Future Value (FV) of current savings
        const fvCurrentSavings = fv(currentSavings, preReturn, yearsToRetire);

        // 2. Calculate Future Value (FV) of annual contributions
        const fvContributions = fvAnnuity(annualContribution, preReturn, yearsToRetire);

        // 3. Calculate Total Projected Savings
        const totalProjectedSavings = fvCurrentSavings + fvContributions;

        // 4. Calculate Nest Egg Needed (Present Value at retirement age)
        // We need the *real* rate of return during retirement (adjusted for inflation)
        const realPostReturn = (1 + postReturn) / (1 + inflation) - 1;
        
        // Calculate the first year's income need, adjusted for inflation
        const firstYearIncomeNeeded = desiredIncome * Math.pow(1 + inflation, yearsToRetire);

        // Calculate the total capital needed using PV of a growing annuity (if realPostReturn is ~0, handle differently)
        let nestEggNeeded;
        if (Math.abs(realPostReturn) < 0.0001) {
            nestEggNeeded = firstYearIncomeNeeded * yearsInRetirement; // Simple case if real return is ~0
        } else {
            nestEggNeeded = pvAnnuityDue(firstYearIncomeNeeded - socialSecurity, realPostReturn, yearsInRetirement);
        }

        // 5. Calculate Shortfall/Surplus
        const shortfallSurplus = totalProjectedSavings - nestEggNeeded;

        // 6. Calculate Additional Savings Needed (if shortfall)
        let additionalAnnualSavings = 0;
        if (shortfallSurplus < 0) {
            additionalAnnualSavings = pmt(preReturn, yearsToRetire, 0, -shortfallSurplus);
        }
        
        // --- Display Results ---
        displayResults(nestEggNeeded, totalProjectedSavings, shortfallSurplus, additionalAnnualSavings, socialSecurity);
        
        // --- Update Charts ---
        updateSavingsGrowthChart(currentSavings, annualContribution, preReturn, yearsToRetire, yearsInRetirement, postReturn, inflation, desiredIncome, socialSecurity, totalProjectedSavings);
        updateIncomeSourcesChart(desiredIncome * Math.pow(1 + inflation, yearsToRetire), socialSecurity);
        
        resultsSection.style.display = 'block';
    }

    // --- Financial Helper Functions ---

    // Future Value (FV)
    function fv(pv, rate, nper) {
        return pv * Math.pow(1 + rate, nper);
    }

    // Future Value of an Annuity (End of Period)
    function fvAnnuity(pmt, rate, nper) {
        if (rate === 0) return pmt * nper;
        return pmt * ((Math.pow(1 + rate, nper) - 1) / rate);
    }

    // Present Value (PV) of an Annuity Due (Payments at Beginning)
    function pvAnnuityDue(pmt, rate, nper) {
         if (rate === 0) return pmt * nper;
         // Adjust pmt for SS (already annual)
         const annualNeed = pmt > 0 ? pmt : 0; // Don't allow negative need
         return annualNeed * ((1 - Math.pow(1 + rate, -nper)) / rate) * (1 + rate);
    }
    
    // Payment (PMT) - Used to find needed savings
    function pmt(rate, nper, pv, fv) {
        if (rate === 0) return (-pv - fv) / nper;
        return (rate * (fv + pv * Math.pow(1 + rate, nper))) / ((Math.pow(1 + rate, nper) - 1) * (1 + rate));
    }


    // --- Display & Formatting ---
    function formatCurrency(value) {
        return `$${Math.round(value).toLocaleString()}`;
    }

    function displayResults(nestEgg, projected, shortfall, additional) {
        nestEggNeededEl.textContent = formatCurrency(nestEgg);
        projectedSavingsEl.textContent = formatCurrency(projected);
        
        shortfallSurplusEl.textContent = formatCurrency(Math.abs(shortfall));
        if (shortfall < 0) {
            shortfallSurplusEl.classList.add('shortfall');
            shortfallSurplusEl.classList.remove('surplus');
            shortfallSurplusCard.querySelector('h4').textContent = 'Shortfall';
            additionalSavingsEl.textContent = formatCurrency(additional);
            additionalSavingsCard.style.display = 'block';
        } else {
            shortfallSurplusEl.classList.add('surplus');
            shortfallSurplusEl.classList.remove('shortfall');
            shortfallSurplusCard.querySelector('h4').textContent = 'Surplus';
            additionalSavingsCard.style.display = 'none';
        }
    }
    
    // --- Charting ---
    
    function updateSavingsGrowthChart(pv, pmtVal, preRate, preNper, postNper, postRate, inflRate, desiredInc, ss, finalPv) {
        const labels = [];
        const data = [];
        let currentVal = pv;
        const currentYear = new Date().getFullYear();
        const retirementAge = parseFloat(currentAgeEl.value) + preNper;

        // Pre-retirement growth
        for (let i = 0; i <= preNper; i++) {
            labels.push(currentYear + i);
            data.push(currentVal);
            currentVal = fv(currentVal, preRate, 1) + pmtVal;
        }

        // Post-retirement depletion
        currentVal = finalPv; // Start with the projected value at retirement
        for (let i = 1; i <= postNper; i++) {
            labels.push(currentYear + preNper + i);
            const inflatedIncome = desiredInc * Math.pow(1 + inflRate, preNper + i - 1);
            const withdrawal = Math.max(0, inflatedIncome - ss); // Withdraw needed amount, minimum 0
            currentVal = currentVal * (1 + postRate) - withdrawal;
            data.push(Math.max(0, currentVal)); // Don't show negative balance
        }

        if (savingsGrowthChart) savingsGrowthChart.destroy(); // Destroy old chart before creating new one
        
        savingsGrowthChart = new Chart(savingsGrowthCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Projected Savings ($)',
                    data: data,
                    borderColor: 'var(--primary-color)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                             callback: function(value) {
                                return '$' + (value / 1000) + 'k';
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
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
                }
            }
        });
    }

    function updateIncomeSourcesChart(annualNeed, socialSecurity) {
        const savingsWithdrawal = Math.max(0, annualNeed - socialSecurity);
        const labels = ['From Savings', 'Social Security'];
        const data = [savingsWithdrawal, socialSecurity];
        
        if(incomeSourcesChart) incomeSourcesChart.destroy();

        incomeSourcesChart = new Chart(incomeSourcesCtx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Retirement Income Sources',
                    data: data,
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 159, 64, 0.6)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
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
                    },
                    legend: {
                        position: 'top',
                    },
                     title: {
                        display: false, // Keep h4 as title
                        text: 'Retirement Income Sources'
                    }
                }
            }
        });
    }

}); // End DOMContentLoaded
