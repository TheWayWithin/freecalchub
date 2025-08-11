// Roth vs Traditional IRA Calculator JavaScript
// Comprehensive implementation with 2025 rules, income limits, and tax analysis

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('calculatorForm');
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const resultsSection = document.getElementById('resultsSection');
    const errorMessagesDiv = document.getElementById('errorMessages');
    
    // Input Elements
    const currentAgeEl = document.getElementById('currentAge');
    const retirementAgeEl = document.getElementById('retirementAge');
    const filingStatusEl = document.getElementById('filingStatus');
    const annualIncomeEl = document.getElementById('annualIncome');
    const currentTaxRateEl = document.getElementById('currentTaxRate');
    const retirementTaxRateEl = document.getElementById('retirementTaxRate');
    const hasWorkplacePlanEl = document.getElementById('hasWorkplacePlan');
    const annualContributionEl = document.getElementById('annualContribution');
    const contributionGrowthEl = document.getElementById('contributionGrowth');
    const expectedReturnEl = document.getElementById('expectedReturn');
    
    // Result Elements
    const rothEligibilityEl = document.getElementById('rothEligibility');
    const traditionalDeductionEl = document.getElementById('traditionalDeduction');
    const traditionalTaxSavingsEl = document.getElementById('traditionalTaxSavings');
    const traditionalValueEl = document.getElementById('traditionalValue');
    const traditionalAfterTaxEl = document.getElementById('traditionalAfterTax');
    const traditionalTaxPaidEl = document.getElementById('traditionalTaxPaid');
    const rothTaxSavingsEl = document.getElementById('rothTaxSavings');
    const rothValueEl = document.getElementById('rothValue');
    const rothAfterTaxEl = document.getElementById('rothAfterTax');
    const rothTaxPaidEl = document.getElementById('rothTaxPaid');
    const recommendationEl = document.getElementById('recommendation');
    
    // Summary table elements
    const tradContributionEl = document.getElementById('tradContribution');
    const rothContributionEl = document.getElementById('rothContribution');
    const tradTaxNowEl = document.getElementById('tradTaxNow');
    const rothTaxNowEl = document.getElementById('rothTaxNow');
    const tradTaxRetirementEl = document.getElementById('tradTaxRetirement');
    const rothTaxRetirementEl = document.getElementById('rothTaxRetirement');
    const tradRMDEl = document.getElementById('tradRMD');
    const rothRMDEl = document.getElementById('rothRMD');
    const tradPenaltiesEl = document.getElementById('tradPenalties');
    const rothPenaltiesEl = document.getElementById('rothPenalties');
    
    // Chart
    let iraChart = null;
    
    // Constants for 2025 IRA rules
    const IRA_LIMITS_2025 = {
        CONTRIBUTION_LIMIT: 7000,        // Base contribution limit
        CATCH_UP_CONTRIBUTION: 1000,     // Additional for 50+
        
        // Roth IRA income limits (MAGI phase-out ranges)
        ROTH_INCOME_LIMITS: {
            single: { start: 146000, end: 161000 },
            marriedJoint: { start: 230000, end: 240000 },
            marriedSeparate: { start: 0, end: 10000 }
        },
        
        // Traditional IRA deduction limits with workplace plan
        TRADITIONAL_DEDUCTION_LIMITS: {
            single: { start: 77000, end: 87000 },
            marriedJoint: { start: 123000, end: 143000 },
            marriedSeparate: { start: 0, end: 10000 }
        }
    };
    
    // Event Listeners
    calculateButton.addEventListener('click', calculateIRAComparison);
    resetButton.addEventListener('click', resetCalculator);
    
    // Auto-update contribution limit based on age
    currentAgeEl.addEventListener('input', updateContributionLimit);
    
    /**
     * Update maximum contribution limit based on age
     */
    function updateContributionLimit() {
        const age = parseInt(currentAgeEl.value);
        const contributionInput = document.getElementById('annualContribution');
        const helpText = contributionInput.nextElementSibling;
        
        if (age >= 50) {
            const maxContribution = IRA_LIMITS_2025.CONTRIBUTION_LIMIT + IRA_LIMITS_2025.CATCH_UP_CONTRIBUTION;
            contributionInput.max = maxContribution;
            helpText.textContent = `2025 limit: $7,000 (under 50) or $8,000 (50+)`;
        } else {
            contributionInput.max = IRA_LIMITS_2025.CONTRIBUTION_LIMIT;
            helpText.textContent = `2025 limit: $7,000 (under 50) or $8,000 (50+)`;
        }
    }
    
    /**
     * Main calculation function
     */
    function calculateIRAComparison() {
        try {
            clearErrors();
            showLoading(true);
            
            // Get input values
            const inputs = getInputValues();
            
            // Validate inputs
            const validationErrors = validateInputs(inputs);
            if (validationErrors.length > 0) {
                showErrors(validationErrors);
                showLoading(false);
                return;
            }
            
            // Calculate eligibility
            const eligibility = calculateEligibility(inputs);
            
            // Calculate IRA projections
            const traditionalResults = calculateTraditionalIRA(inputs, eligibility);
            const rothResults = calculateRothIRA(inputs, eligibility);
            
            // Generate recommendation
            const recommendation = generateRecommendation(inputs, traditionalResults, rothResults, eligibility);
            
            // Display results
            displayResults(eligibility, traditionalResults, rothResults, recommendation);
            
            // Create chart
            createGrowthChart(inputs, traditionalResults, rothResults);
            
            // Populate summary table
            populateSummaryTable(inputs, eligibility);
            
            // Show results section
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Calculation error:', error);
            showErrors(['An error occurred during calculation. Please check your inputs and try again.']);
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * Get all input values
     */
    function getInputValues() {
        return {
            currentAge: parseInt(currentAgeEl.value),
            retirementAge: parseInt(retirementAgeEl.value),
            filingStatus: filingStatusEl.value,
            annualIncome: parseFloat(annualIncomeEl.value),
            currentTaxRate: parseFloat(currentTaxRateEl.value) / 100,
            retirementTaxRate: parseFloat(retirementTaxRateEl.value) / 100,
            hasWorkplacePlan: hasWorkplacePlanEl.value === 'yes',
            annualContribution: parseFloat(annualContributionEl.value),
            contributionGrowth: parseFloat(contributionGrowthEl.value) / 100,
            expectedReturn: parseFloat(expectedReturnEl.value) / 100
        };
    }
    
    /**
     * Validate input values
     */
    function validateInputs(inputs) {
        const errors = [];
        
        if (inputs.currentAge >= inputs.retirementAge) {
            errors.push('Retirement age must be greater than current age.');
        }
        
        if (inputs.annualIncome < 0) {
            errors.push('Annual income must be positive.');
        }
        
        if (inputs.currentTaxRate < 0 || inputs.currentTaxRate > 0.5) {
            errors.push('Current tax rate must be between 0% and 50%.');
        }
        
        if (inputs.retirementTaxRate < 0 || inputs.retirementTaxRate > 0.5) {
            errors.push('Retirement tax rate must be between 0% and 50%.');
        }
        
        // Check contribution limits
        const maxContribution = inputs.currentAge >= 50 
            ? IRA_LIMITS_2025.CONTRIBUTION_LIMIT + IRA_LIMITS_2025.CATCH_UP_CONTRIBUTION
            : IRA_LIMITS_2025.CONTRIBUTION_LIMIT;
            
        if (inputs.annualContribution > maxContribution) {
            errors.push(`Annual contribution cannot exceed $${maxContribution.toLocaleString()} for ${inputs.currentAge >= 50 ? '50+' : 'under 50'}.`);
        }
        
        if (inputs.expectedReturn < 0 || inputs.expectedReturn > 0.2) {
            errors.push('Expected return must be between 0% and 20%.');
        }
        
        return errors;
    }
    
    /**
     * Calculate IRA eligibility based on income and filing status
     */
    function calculateEligibility(inputs) {
        const rothLimits = IRA_LIMITS_2025.ROTH_INCOME_LIMITS[inputs.filingStatus];
        const tradLimits = IRA_LIMITS_2025.TRADITIONAL_DEDUCTION_LIMITS[inputs.filingStatus];
        
        // Roth IRA eligibility
        let rothEligibility = 'eligible';
        let rothContributionLimit = inputs.annualContribution;
        
        if (inputs.annualIncome >= rothLimits.end) {
            rothEligibility = 'not-eligible';
            rothContributionLimit = 0;
        } else if (inputs.annualIncome >= rothLimits.start) {
            rothEligibility = 'partial-eligible';
            const reductionFactor = (inputs.annualIncome - rothLimits.start) / (rothLimits.end - rothLimits.start);
            rothContributionLimit = inputs.annualContribution * (1 - reductionFactor);
        }
        
        // Traditional IRA deduction eligibility
        let traditionalDeduction = 'full';
        let deductionAmount = inputs.annualContribution;
        
        if (inputs.hasWorkplacePlan) {
            if (inputs.annualIncome >= tradLimits.end) {
                traditionalDeduction = 'none';
                deductionAmount = 0;
            } else if (inputs.annualIncome >= tradLimits.start) {
                traditionalDeduction = 'partial';
                const reductionFactor = (inputs.annualIncome - tradLimits.start) / (tradLimits.end - tradLimits.start);
                deductionAmount = inputs.annualContribution * (1 - reductionFactor);
            }
        }
        
        return {
            rothEligibility,
            rothContributionLimit,
            traditionalDeduction,
            deductionAmount
        };
    }
    
    /**
     * Calculate Traditional IRA projections
     */
    function calculateTraditionalIRA(inputs, eligibility) {
        const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
        const annualContribution = inputs.annualContribution;
        const deductionAmount = eligibility.deductionAmount;
        
        // Immediate tax savings
        const immediateTaxSavings = deductionAmount * inputs.currentTaxRate;
        
        // Project future value
        const futureValue = calculateFutureValue(
            annualContribution,
            inputs.expectedReturn,
            inputs.contributionGrowth,
            yearsToRetirement
        );
        
        // Calculate taxes owed in retirement
        const totalTaxInRetirement = futureValue * inputs.retirementTaxRate;
        const afterTaxValue = futureValue - totalTaxInRetirement;
        
        // Total taxes paid (current savings are negative taxes)
        const totalTaxPaid = totalTaxInRetirement - (immediateTaxSavings * yearsToRetirement);
        
        return {
            immediateTaxSavings,
            futureValue,
            afterTaxValue,
            totalTaxPaid,
            totalTaxInRetirement
        };
    }
    
    /**
     * Calculate Roth IRA projections
     */
    function calculateRothIRA(inputs, eligibility) {
        const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
        const annualContribution = eligibility.rothContributionLimit;
        
        // No immediate tax savings for Roth
        const immediateTaxSavings = 0;
        
        // Project future value (tax-free)
        const futureValue = calculateFutureValue(
            annualContribution,
            inputs.expectedReturn,
            inputs.contributionGrowth,
            yearsToRetirement
        );
        
        // No taxes in retirement for qualified withdrawals
        const afterTaxValue = futureValue;
        
        // Total taxes paid (all upfront)
        const totalTaxPaid = annualContribution * inputs.currentTaxRate * yearsToRetirement;
        
        return {
            immediateTaxSavings,
            futureValue,
            afterTaxValue,
            totalTaxPaid: totalTaxPaid,
            totalTaxInRetirement: 0
        };
    }
    
    /**
     * Calculate future value with growing contributions
     */
    function calculateFutureValue(initialContribution, returnRate, contributionGrowth, years) {
        let totalValue = 0;
        let yearlyContribution = initialContribution;
        
        for (let year = 0; year < years; year++) {
            // Add this year's contribution
            totalValue += yearlyContribution;
            
            // Compound growth on entire balance
            totalValue *= (1 + returnRate);
            
            // Increase contribution for next year
            yearlyContribution *= (1 + contributionGrowth);
        }
        
        return totalValue;
    }
    
    /**
     * Generate personalized recommendation
     */
    function generateRecommendation(inputs, traditionalResults, rothResults, eligibility) {
        let recommendation = '';
        let reasoning = [];
        
        // Primary factors for recommendation
        const afterTaxDifference = rothResults.afterTaxValue - traditionalResults.afterTaxValue;
        const taxRateDifference = inputs.currentTaxRate - inputs.retirementTaxRate;
        const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
        
        // Determine primary recommendation
        if (eligibility.rothEligibility === 'not-eligible') {
            recommendation = 'Traditional IRA';
            reasoning.push('You exceed the Roth IRA income limits, making Traditional IRA your primary option.');
        } else if (eligibility.traditionalDeduction === 'none') {
            recommendation = 'Roth IRA';
            reasoning.push('You cannot deduct Traditional IRA contributions due to high income and workplace plan coverage.');
        } else if (Math.abs(afterTaxDifference) < 5000) {
            recommendation = 'Either Option';
            reasoning.push('Both IRA types provide similar after-tax benefits for your situation.');
        } else if (afterTaxDifference > 0) {
            recommendation = 'Roth IRA';
            reasoning.push(`Roth IRA provides approximately $${Math.abs(afterTaxDifference).toLocaleString()} more in after-tax retirement value.`);
        } else {
            recommendation = 'Traditional IRA';
            reasoning.push(`Traditional IRA provides approximately $${Math.abs(afterTaxDifference).toLocaleString()} more in after-tax retirement value.`);
        }
        
        // Additional considerations
        if (taxRateDifference > 0.05) {
            reasoning.push('Your current tax rate is significantly higher than expected retirement rate, favoring Traditional IRA deductions.');
        } else if (taxRateDifference < -0.05) {
            reasoning.push('You expect higher tax rates in retirement, making Roth IRA\'s tax-free withdrawals more valuable.');
        }
        
        if (yearsToRetirement > 30) {
            reasoning.push('With decades until retirement, Roth IRA\'s tax-free growth becomes increasingly valuable.');
        }
        
        if (inputs.currentAge < 35) {
            reasoning.push('Younger investors often benefit from Roth IRA\'s flexibility and tax-free growth potential.');
        }
        
        return {
            recommendation,
            reasoning: reasoning.join(' ')
        };
    }
    
    /**
     * Display calculation results
     */
    function displayResults(eligibility, traditionalResults, rothResults, recommendation) {
        // Eligibility status
        displayEligibilityStatus(eligibility);
        
        // Traditional IRA results
        traditionalTaxSavingsEl.textContent = formatCurrency(traditionalResults.immediateTaxSavings);
        traditionalValueEl.textContent = formatCurrency(traditionalResults.futureValue);
        traditionalAfterTaxEl.textContent = formatCurrency(traditionalResults.afterTaxValue);
        traditionalTaxPaidEl.textContent = formatCurrency(traditionalResults.totalTaxPaid);
        
        // Roth IRA results
        rothTaxSavingsEl.textContent = formatCurrency(rothResults.immediateTaxSavings);
        rothValueEl.textContent = formatCurrency(rothResults.futureValue);
        rothAfterTaxEl.textContent = formatCurrency(rothResults.afterTaxValue);
        rothTaxPaidEl.textContent = formatCurrency(rothResults.totalTaxPaid);
        
        // Recommendation
        recommendationEl.innerHTML = `
            <div class="recommendation-highlight">
                <strong>Recommended: ${recommendation.recommendation}</strong>
                <br><br>
                ${recommendation.reasoning}
            </div>
        `;
    }
    
    /**
     * Display eligibility status with appropriate styling
     */
    function displayEligibilityStatus(eligibility) {
        // Roth IRA eligibility
        let rothStatus = '';
        let rothClass = '';
        
        switch (eligibility.rothEligibility) {
            case 'eligible':
                rothStatus = 'Fully Eligible';
                rothClass = 'eligible';
                break;
            case 'partial-eligible':
                rothStatus = 'Partially Eligible';
                rothClass = 'partial-eligible';
                break;
            case 'not-eligible':
                rothStatus = 'Not Eligible';
                rothClass = 'not-eligible';
                break;
        }
        
        // Traditional IRA deduction
        let tradStatus = '';
        let tradClass = '';
        
        switch (eligibility.traditionalDeduction) {
            case 'full':
                tradStatus = 'Fully Deductible';
                tradClass = 'eligible';
                break;
            case 'partial':
                tradStatus = 'Partially Deductible';
                tradClass = 'partial-eligible';
                break;
            case 'none':
                tradStatus = 'Not Deductible';
                tradClass = 'not-eligible';
                break;
        }
        
        rothEligibilityEl.textContent = rothStatus;
        rothEligibilityEl.className = rothClass;
        
        traditionalDeductionEl.textContent = tradStatus;
        traditionalDeductionEl.className = tradClass;
    }
    
    /**
     * Create growth projection chart
     */
    function createGrowthChart(inputs, traditionalResults, rothResults) {
        const ctx = document.getElementById('iraChart').getContext('2d');
        
        // Destroy existing chart
        if (iraChart) {
            iraChart.destroy();
        }
        
        // Generate data points
        const years = inputs.retirementAge - inputs.currentAge;
        const labels = [];
        const traditionalData = [];
        const rothData = [];
        
        for (let year = 0; year <= years; year += 5) {
            const currentYear = new Date().getFullYear() + year;
            labels.push(currentYear.toString());
            
            // Calculate values at this point in time
            const traditionalValue = year === years ? traditionalResults.afterTaxValue : 
                calculateFutureValue(inputs.annualContribution, inputs.expectedReturn, inputs.contributionGrowth, year) * (1 - inputs.retirementTaxRate);
            const rothValue = calculateFutureValue(inputs.annualContribution, inputs.expectedReturn, inputs.contributionGrowth, year);
            
            traditionalData.push(traditionalValue);
            rothData.push(rothValue);
        }
        
        iraChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Traditional IRA (After-Tax)',
                    data: traditionalData,
                    borderColor: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    fill: false,
                    tension: 0.4
                }, {
                    label: 'Roth IRA (Tax-Free)',
                    data: rothData,
                    borderColor: '#388e3c',
                    backgroundColor: 'rgba(56, 142, 60, 0.1)',
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'IRA Growth Projection (After-Tax Values)'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Populate comparison summary table
     */
    function populateSummaryTable(inputs, eligibility) {
        // Contribution amounts
        tradContributionEl.textContent = formatCurrency(inputs.annualContribution);
        rothContributionEl.textContent = eligibility.rothEligibility === 'not-eligible' ? 
            '$0 (Ineligible)' : formatCurrency(eligibility.rothContributionLimit);
        
        // Tax treatment now
        tradTaxNowEl.textContent = eligibility.traditionalDeduction === 'none' ? 
            'No deduction' : 'Tax deductible';
        rothTaxNowEl.textContent = 'After-tax dollars';
        
        // Tax treatment in retirement
        tradTaxRetirementEl.textContent = 'Fully taxable';
        rothTaxRetirementEl.textContent = 'Tax-free';
        
        // Required Minimum Distributions
        tradRMDEl.textContent = 'Required at age 73';
        rothRMDEl.textContent = 'None during lifetime';
        
        // Early withdrawal penalties
        tradPenaltiesEl.textContent = '10% penalty + taxes before 59½';
        rothPenaltiesEl.textContent = 'Contributions anytime, earnings after 59½';
    }
    
    /**
     * Reset calculator to default values
     */
    function resetCalculator() {
        form.reset();
        resultsSection.style.display = 'none';
        clearErrors();
        
        // Reset to default values
        currentAgeEl.value = '30';
        retirementAgeEl.value = '65';
        filingStatusEl.value = 'single';
        annualIncomeEl.value = '75000';
        currentTaxRateEl.value = '22';
        retirementTaxRateEl.value = '18';
        hasWorkplacePlanEl.value = 'yes';
        annualContributionEl.value = '6000';
        contributionGrowthEl.value = '2';
        expectedReturnEl.value = '7';
        
        updateContributionLimit();
        
        if (iraChart) {
            iraChart.destroy();
            iraChart = null;
        }
    }
    
    /**
     * Show loading state
     */
    function showLoading(loading) {
        calculateButton.disabled = loading;
        calculateButton.innerHTML = loading ? 
            'Calculating... <span class="loading-spinner"></span>' : 'Compare IRAs';
        
        if (loading) {
            resultsSection.classList.add('calculating');
        } else {
            resultsSection.classList.remove('calculating');
        }
    }
    
    /**
     * Display error messages
     */
    function showErrors(errors) {
        errorMessagesDiv.innerHTML = '<ul>' + 
            errors.map(error => `<li>${error}</li>`).join('') + 
            '</ul>';
        errorMessagesDiv.style.display = 'block';
        errorMessagesDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * Clear error messages
     */
    function clearErrors() {
        errorMessagesDiv.style.display = 'none';
        errorMessagesDiv.innerHTML = '';
    }
    
    /**
     * Format currency values
     */
    function formatCurrency(amount) {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '$0';
        }
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.round(amount));
    }
    
    // Initialize
    updateContributionLimit();
});