// 401(k) Contribution Calculator JavaScript
// Comprehensive implementation with accurate contribution formulas and projections

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('calculatorForm');
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const resultsSection = document.getElementById('resultsSection');
    const errorMessagesDiv = document.getElementById('errorMessages');
    
    // Input Elements
    const annualSalaryEl = document.getElementById('annualSalary');
    const currentAgeEl = document.getElementById('currentAge');
    const retirementAgeEl = document.getElementById('retirementAge');
    const salaryGrowthEl = document.getElementById('salaryGrowth');
    const contributionPercentageEl = document.getElementById('contributionPercentage');
    const traditionalPercentEl = document.getElementById('traditionalPercent');
    const rothPercentEl = document.getElementById('rothPercent');
    const currentBalanceEl = document.getElementById('currentBalance');
    const employerMatchEl = document.getElementById('employerMatch');
    const matchPercentageEl = document.getElementById('matchPercentage');
    const matchLimitEl = document.getElementById('matchLimit');
    const taxBracketEl = document.getElementById('taxBracket');
    const expectedReturnEl = document.getElementById('expectedReturn');
    
    // Result Elements
    const annualContributionEl = document.getElementById('annualContribution');
    const employerMatchAmountEl = document.getElementById('employerMatchAmount');
    const taxSavingsEl = document.getElementById('taxSavings');
    const retirementBalanceEl = document.getElementById('retirementBalance');
    const traditionalAmountEl = document.getElementById('traditionalAmount');
    const rothAmountEl = document.getElementById('rothAmount');
    const matchAmountEl = document.getElementById('matchAmount');
    const totalContributionEl = document.getElementById('totalContribution');
    const optimizationTipsEl = document.getElementById('optimizationTips');
    
    // Chart
    let growthChart = null;
    
    // Constants for 401(k) calculations (2025 values)
    const CONTRIBUTION_LIMIT_2025 = 23500; // Employee contribution limit
    const CATCH_UP_LIMIT_2025 = 7500; // Additional for 50+
    const TOTAL_LIMIT_2025 = 70000; // Total employee + employer limit
    const TOTAL_CATCH_UP_LIMIT_2025 = 77500; // Total with catch-up
    
    // Event Listeners
    calculateButton.addEventListener('click', calculateContribution);
    resetButton.addEventListener('click', resetCalculator);
    employerMatchEl.addEventListener('change', toggleMatchDetails);
    traditionalPercentEl.addEventListener('input', updateRothPercentage);
    rothPercentEl.addEventListener('input', updateTraditionalPercentage);
    
    // Initialize
    toggleMatchDetails();
    
    function toggleMatchDetails() {
        const matchType = employerMatchEl.value;
        const matchDetails = document.querySelectorAll('.match-details');
        const shouldShow = matchType !== 'none' && matchType !== '';
        
        matchDetails.forEach(detail => {
            detail.style.display = shouldShow ? 'block' : 'none';
        });
        
        if (!shouldShow) {
            matchPercentageEl.value = '';
            matchLimitEl.value = '';
        }
    }
    
    function updateRothPercentage() {
        const traditionalValue = parseFloat(traditionalPercentEl.value) || 0;
        const rothValue = Math.max(0, 100 - traditionalValue);
        rothPercentEl.value = rothValue;
    }
    
    function updateTraditionalPercentage() {
        const rothValue = parseFloat(rothPercentEl.value) || 0;
        const traditionalValue = Math.max(0, 100 - rothValue);
        traditionalPercentEl.value = traditionalValue;
    }
    
    function validateInputs() {
        const errors = [];
        
        const salary = parseFloat(annualSalaryEl.value);
        if (!salary || salary < 20000 || salary > 1000000) {
            errors.push('Please enter a valid annual salary between $20,000 and $1,000,000.');
        }
        
        const currentAge = parseInt(currentAgeEl.value);
        if (!currentAge || currentAge < 18 || currentAge > 65) {
            errors.push('Please enter a valid current age between 18 and 65.');
        }
        
        const retirementAge = parseInt(retirementAgeEl.value);
        if (!retirementAge || retirementAge < 55 || retirementAge > 75) {
            errors.push('Please enter a valid retirement age between 55 and 75.');
        }
        
        if (currentAge && retirementAge && retirementAge <= currentAge) {
            errors.push('Retirement age must be greater than your current age.');
        }
        
        const contributionPercent = parseFloat(contributionPercentageEl.value);
        if (!contributionPercent || contributionPercent < 1 || contributionPercent > 50) {
            errors.push('Please enter a valid contribution percentage between 1% and 50%.');
        }
        
        const traditionalPercent = parseFloat(traditionalPercentEl.value) || 0;
        const rothPercent = parseFloat(rothPercentEl.value) || 0;
        if (Math.abs((traditionalPercent + rothPercent) - 100) > 0.01) {
            errors.push('Traditional and Roth percentages must total 100%.');
        }
        
        if (!employerMatchEl.value) {
            errors.push('Please select an employer match type.');
        }
        
        if (employerMatchEl.value !== 'none' && employerMatchEl.value !== '') {
            const matchPercentage = parseFloat(matchPercentageEl.value);
            const matchLimit = parseFloat(matchLimitEl.value);
            
            if (!matchPercentage || matchPercentage < 0 || matchPercentage > 100) {
                errors.push('Please enter a valid match percentage between 0% and 100%.');
            }
            
            if (!matchLimit || matchLimit < 1 || matchLimit > 25) {
                errors.push('Please enter a valid match limit between 1% and 25%.');
            }
        }
        
        if (!taxBracketEl.value) {
            errors.push('Please select your current tax bracket.');
        }
        
        const expectedReturn = parseFloat(expectedReturnEl.value);
        if (!expectedReturn || expectedReturn < 4 || expectedReturn > 15) {
            errors.push('Please enter a valid expected return between 4% and 15%.');
        }
        
        return errors;
    }
    
    function displayErrors(errors) {
        if (errors.length > 0) {
            errorMessagesDiv.innerHTML = `
                <strong>Please correct the following errors:</strong>
                <ul>
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            `;
            errorMessagesDiv.style.display = 'block';
            return true;
        } else {
            errorMessagesDiv.style.display = 'none';
            return false;
        }
    }
    
    function calculateEmployerMatch(salary, contributionPercent, matchType, matchPercentage, matchLimit) {
        if (matchType === 'none' || !matchPercentage || !matchLimit) {
            return 0;
        }
        
        const employeeContribution = salary * (contributionPercent / 100);
        const maxMatchableContribution = salary * (matchLimit / 100);
        const actualMatchableContribution = Math.min(employeeContribution, maxMatchableContribution);
        
        let matchAmount = 0;
        
        if (matchType === 'percentage') {
            // e.g., 50% match on first 6%
            matchAmount = actualMatchableContribution * (matchPercentage / 100);
        } else if (matchType === 'dollar') {
            // e.g., 100% match on first 3%
            matchAmount = actualMatchableContribution * (matchPercentage / 100);
        } else if (matchType === 'custom') {
            // Custom formula - for simplicity, treat as percentage match
            matchAmount = actualMatchableContribution * (matchPercentage / 100);
        }
        
        return Math.round(matchAmount);
    }
    
    function calculateContributionLimits(currentAge) {
        const baseLimit = CONTRIBUTION_LIMIT_2025;
        const catchUpContribution = currentAge >= 50 ? CATCH_UP_LIMIT_2025 : 0;
        return {
            employeeLimit: baseLimit + catchUpContribution,
            totalLimit: currentAge >= 50 ? TOTAL_CATCH_UP_LIMIT_2025 : TOTAL_LIMIT_2025
        };
    }
    
    function calculateTaxSavings(traditionalContribution, taxBracket) {
        return Math.round(traditionalContribution * (taxBracket / 100));
    }
    
    function calculateFutureValue(currentBalance, annualContribution, annualReturn, years) {
        // Future value of current balance
        const fvCurrent = currentBalance * Math.pow(1 + annualReturn, years);
        
        // Future value of annuity (regular contributions)
        const fvAnnuity = annualContribution * (Math.pow(1 + annualReturn, years) - 1) / annualReturn;
        
        return fvCurrent + fvAnnuity;
    }
    
    function generateOptimizationTips(salary, currentAge, contributionPercent, employerMatch, traditionalPercent, taxBracket) {
        const tips = [];
        const limits = calculateContributionLimits(currentAge);
        const annualContribution = salary * (contributionPercent / 100);
        
        // Check contribution limit optimization
        if (annualContribution < limits.employeeLimit) {
            const additionalRoom = limits.employeeLimit - annualContribution;
            const additionalPercent = (additionalRoom / salary * 100).toFixed(1);
            tips.push(`💰 You have $${additionalRoom.toLocaleString()} remaining in contribution room. Consider increasing by ${additionalPercent}% of salary.`);
        }
        
        // Check employer match optimization
        if (employerMatch === 0) {
            tips.push(`⚠️ You're missing out on free employer matching. Contribute enough to get the full match - it's an immediate 100% return!`);
        }
        
        // Age-based recommendations
        if (currentAge < 30) {
            tips.push(`🎯 At your age, consider maximizing Roth contributions for tax-free growth over your long investment horizon.`);
        } else if (currentAge > 50) {
            tips.push(`🚀 Take advantage of catch-up contributions! You can contribute an additional $${CATCH_UP_LIMIT_2025.toLocaleString()} per year.`);
        }
        
        // Tax optimization
        if (taxBracket >= 24 && traditionalPercent < 70) {
            tips.push(`📊 In your tax bracket (${taxBracket}%), consider increasing traditional contributions for immediate tax savings.`);
        } else if (taxBracket <= 12 && traditionalPercent > 30) {
            tips.push(`💡 In your lower tax bracket, Roth contributions may provide better long-term value with tax-free withdrawals.`);
        }
        
        // General optimization tips
        if (contributionPercent < 10) {
            tips.push(`📈 Aim to contribute at least 10-15% of your salary for adequate retirement savings.`);
        }
        
        return tips;
    }
    
    function createGrowthChart(currentAge, retirementAge, currentBalance, annualContribution, expectedReturn) {
        const canvas = document.getElementById('growthChart');
        const ctx = canvas.getContext('2d');
        
        if (growthChart) {
            growthChart.destroy();
        }
        
        const years = retirementAge - currentAge;
        const ages = [];
        const balances = [];
        const contributionsData = [];
        
        // Calculate year-by-year growth
        let balance = currentBalance;
        for (let i = 0; i <= years; i++) {
            const age = currentAge + i;
            ages.push(age);
            balances.push(Math.round(balance));
            contributionsData.push(i * annualContribution);
            
            if (i < years) {
                balance = balance * (1 + expectedReturn / 100) + annualContribution;
            }
        }
        
        growthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ages,
                datasets: [{
                    label: 'Total Account Value',
                    data: balances,
                    borderColor: '#2c5aa0',
                    backgroundColor: 'rgba(44, 90, 160, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2c5aa0',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }, {
                    label: 'Total Contributions',
                    data: contributionsData,
                    borderColor: '#ff6b35',
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#ff6b35',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: '401(k) Account Growth Projection'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label;
                                const value = context.parsed.y;
                                return `${label}: $${value.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Age'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Account Value ($)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + (value >= 1000 ? (value/1000).toFixed(0) + 'K' : value.toLocaleString());
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
        
        // Set chart height
        canvas.style.height = '400px';
    }
    
    function calculateContribution() {
        // Clear previous errors
        errorMessagesDiv.style.display = 'none';
        
        // Validate inputs
        const errors = validateInputs();
        if (displayErrors(errors)) {
            return;
        }
        
        // Add loading state
        calculateButton.disabled = true;
        calculateButton.innerHTML = '<span class="loading-spinner"></span> Calculating...';
        
        try {
            // Get input values
            const salary = parseFloat(annualSalaryEl.value);
            const currentAge = parseInt(currentAgeEl.value);
            const retirementAge = parseInt(retirementAgeEl.value);
            const salaryGrowth = parseFloat(salaryGrowthEl.value) / 100;
            const contributionPercent = parseFloat(contributionPercentageEl.value);
            const traditionalPercent = parseFloat(traditionalPercentEl.value);
            const rothPercent = parseFloat(rothPercentEl.value);
            const currentBalance = parseFloat(currentBalanceEl.value) || 0;
            const matchType = employerMatchEl.value;
            const matchPercentage = parseFloat(matchPercentageEl.value) || 0;
            const matchLimit = parseFloat(matchLimitEl.value) || 0;
            const taxBracket = parseFloat(taxBracketEl.value);
            const expectedReturn = parseFloat(expectedReturnEl.value) / 100;
            
            // Calculate contribution limits
            const limits = calculateContributionLimits(currentAge);
            
            // Calculate employee contributions
            const annualContribution = Math.min(salary * (contributionPercent / 100), limits.employeeLimit);
            const traditionalContribution = annualContribution * (traditionalPercent / 100);
            const rothContribution = annualContribution * (rothPercent / 100);
            
            // Calculate employer match
            const employerMatchAmount = calculateEmployerMatch(salary, contributionPercent, matchType, matchPercentage, matchLimit);
            
            // Check total contribution limits
            const totalAnnualContribution = annualContribution + employerMatchAmount;
            const actualEmployerMatch = Math.min(employerMatchAmount, limits.totalLimit - annualContribution);
            
            // Calculate tax savings (traditional contributions only)
            const taxSavings = calculateTaxSavings(traditionalContribution, taxBracket);
            
            // Calculate projected balance at retirement
            const yearsToRetirement = retirementAge - currentAge;
            const projectedBalance = calculateFutureValue(currentBalance, totalAnnualContribution, expectedReturn, yearsToRetirement);
            
            // Display results
            annualContributionEl.textContent = '$' + Math.round(annualContribution).toLocaleString();
            employerMatchAmountEl.textContent = '$' + Math.round(actualEmployerMatch).toLocaleString();
            taxSavingsEl.textContent = '$' + taxSavings.toLocaleString();
            retirementBalanceEl.textContent = '$' + Math.round(projectedBalance).toLocaleString();
            
            // Display breakdown
            traditionalAmountEl.textContent = '$' + Math.round(traditionalContribution).toLocaleString();
            rothAmountEl.textContent = '$' + Math.round(rothContribution).toLocaleString();
            matchAmountEl.textContent = '$' + Math.round(actualEmployerMatch).toLocaleString();
            totalContributionEl.textContent = '$' + Math.round(annualContribution + actualEmployerMatch).toLocaleString();
            
            // Generate optimization tips
            const tips = generateOptimizationTips(salary, currentAge, contributionPercent, actualEmployerMatch, traditionalPercent, taxBracket);
            optimizationTipsEl.innerHTML = `
                <p>Based on your current strategy, here are some optimization recommendations:</p>
                <div class="optimization-highlight">
                    <ul class="tip-list">
                        ${tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            `;
            
            // Create growth chart
            createGrowthChart(currentAge, retirementAge, currentBalance, annualContribution + actualEmployerMatch, expectedReturn);
            
            // Show results
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Calculation error:', error);
            displayErrors(['An error occurred during calculation. Please check your inputs and try again.']);
        } finally {
            // Remove loading state
            calculateButton.disabled = false;
            calculateButton.innerHTML = 'Calculate 401(k) Strategy';
        }
    }
    
    function resetCalculator() {
        // Reset form
        form.reset();
        
        // Reset default values
        retirementAgeEl.value = '65';
        salaryGrowthEl.value = '3';
        expectedReturnEl.value = '7';
        traditionalPercentEl.value = '100';
        rothPercentEl.value = '0';
        currentBalanceEl.value = '0';
        
        // Hide results
        resultsSection.style.display = 'none';
        errorMessagesDiv.style.display = 'none';
        
        // Reset match details visibility
        toggleMatchDetails();
        
        // Destroy chart
        if (growthChart) {
            growthChart.destroy();
            growthChart = null;
        }
        
        // Scroll to top of calculator
        document.getElementById('calculator-section').scrollIntoView({ behavior: 'smooth' });
    }
});