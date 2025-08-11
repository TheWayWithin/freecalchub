// Long-Term Care Cost Calculator JavaScript
// Comprehensive implementation with regional costs and inflation projections

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('calculatorForm');
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const resultsSection = document.getElementById('resultsSection');
    const errorMessagesDiv = document.getElementById('errorMessages');
    
    // Input Elements
    const currentAgeEl = document.getElementById('currentAge');
    const genderEl = document.getElementById('gender');
    const stateEl = document.getElementById('state');
    const careStartAgeEl = document.getElementById('careStartAge');
    const careDurationEl = document.getElementById('careDuration');
    const preferredCareEl = document.getElementById('preferredCare');
    const inflationRateEl = document.getElementById('inflationRate');
    const hasInsuranceEl = document.getElementById('hasInsurance');
    const dailyBenefitEl = document.getElementById('dailyBenefit');
    const benefitPeriodEl = document.getElementById('benefitPeriod');
    const eliminationPeriodEl = document.getElementById('eliminationPeriod');
    const insuranceDetailsDiv = document.querySelector('.insurance-details');
    
    // Result Elements
    const totalCostsEl = document.getElementById('totalCosts');
    const insuranceCoverageEl = document.getElementById('insuranceCoverage');
    const coverageGapEl = document.getElementById('coverageGap');
    const monthlySavingsEl = document.getElementById('monthlySavings');
    const currentCostEl = document.getElementById('currentCost');
    const projectedCostEl = document.getElementById('projectedCost');
    const durationCostEl = document.getElementById('durationCost');
    const netCostEl = document.getElementById('netCost');
    const planningTipsEl = document.getElementById('planningTips');
    
    // Chart
    let costChart = null;
    
    // 2025 Long-Term Care Cost Data (national averages)
    const CARE_COSTS_2025 = {
        home: {
            name: 'Home Health Care',
            hourlyRate: 65,
            hoursPerDay: 8,
            description: 'Personal care and health services in your home'
        },
        assisted: {
            name: 'Assisted Living Facility',
            monthlyRate: 4800,
            description: 'Independent living with assistance for daily activities'
        },
        memory: {
            name: 'Memory Care Facility',
            monthlyRate: 6200,
            description: 'Specialized care for Alzheimer\'s and dementia'
        },
        nursing: {
            name: 'Skilled Nursing Facility',
            monthlyRate: 9200,
            description: 'Round-the-clock medical and personal care'
        },
        mixed: {
            name: 'Mixed/Progressive Care',
            description: 'Combination of care types over time'
        }
    };
    
    // Regional cost multipliers
    const REGIONAL_MULTIPLIERS = {
        'national': 1.0,
        'northeast': 1.25,
        'west': 1.30,
        'southeast': 0.85,
        'midwest': 0.80,
        'southwest': 0.90
    };
    
    // Care duration statistics (years) by gender
    const CARE_DURATION_STATS = {
        male: { average: 2.2, median: 1.5 },
        female: { average: 3.7, median: 2.5 }
    };
    
    // Event Listeners
    calculateButton.addEventListener('click', calculateCareCosts);
    resetButton.addEventListener('click', resetCalculator);
    hasInsuranceEl.addEventListener('change', toggleInsuranceDetails);
    
    // Initialize
    toggleInsuranceDetails();
    
    function toggleInsuranceDetails() {
        const hasInsurance = hasInsuranceEl.value === 'yes';
        insuranceDetailsDiv.style.display = hasInsurance ? 'block' : 'none';
        if (!hasInsurance) {
            dailyBenefitEl.value = '';
            benefitPeriodEl.value = '';
            eliminationPeriodEl.value = '';
        }
    }
    
    function validateInputs() {
        const errors = [];
        
        const currentAge = parseInt(currentAgeEl.value);
        if (!currentAge || currentAge < 40 || currentAge > 80) {
            errors.push('Please enter a valid current age between 40 and 80.');
        }
        
        if (!genderEl.value) {
            errors.push('Please select your gender.');
        }
        
        if (!stateEl.value) {
            errors.push('Please select your state or region.');
        }
        
        const careStartAge = parseInt(careStartAgeEl.value);
        if (!careStartAge || careStartAge < 65 || careStartAge > 95) {
            errors.push('Please enter a valid care start age between 65 and 95.');
        }
        
        if (currentAge && careStartAge && careStartAge <= currentAge) {
            errors.push('Care start age must be greater than your current age.');
        }
        
        const careDuration = parseFloat(careDurationEl.value);
        if (!careDuration || careDuration < 1 || careDuration > 15) {
            errors.push('Please enter a valid care duration between 1 and 15 years.');
        }
        
        if (!preferredCareEl.value) {
            errors.push('Please select your preferred care type.');
        }
        
        const inflationRate = parseFloat(inflationRateEl.value);
        if (!inflationRate || inflationRate < 3 || inflationRate > 8) {
            errors.push('Please enter a valid inflation rate between 3% and 8%.');
        }
        
        if (hasInsuranceEl.value === 'yes') {
            const dailyBenefit = parseFloat(dailyBenefitEl.value);
            const benefitPeriod = parseFloat(benefitPeriodEl.value);
            const eliminationPeriod = parseInt(eliminationPeriodEl.value);
            
            if (!dailyBenefit || dailyBenefit < 50 || dailyBenefit > 1000) {
                errors.push('Please enter a valid daily benefit amount between $50 and $1,000.');
            }
            
            if (!benefitPeriod || benefitPeriod < 1 || benefitPeriod > 10) {
                errors.push('Please enter a valid benefit period between 1 and 10 years.');
            }
            
            if (eliminationPeriod < 0 || eliminationPeriod > 365) {
                errors.push('Please enter a valid elimination period between 0 and 365 days.');
            }
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
    
    function calculateCurrentCost(careType, region) {
        const baseCost = CARE_COSTS_2025[careType];
        const multiplier = REGIONAL_MULTIPLIERS[region];
        
        let annualCost = 0;
        
        if (careType === 'home') {
            annualCost = baseCost.hourlyRate * baseCost.hoursPerDay * 365;
        } else if (careType === 'mixed') {
            // Mixed care: 2 years assisted living, 2 years nursing
            const assistedCost = CARE_COSTS_2025.assisted.monthlyRate * 12;
            const nursingCost = CARE_COSTS_2025.nursing.monthlyRate * 12;
            annualCost = (assistedCost + nursingCost) / 2;
        } else {
            annualCost = baseCost.monthlyRate * 12;
        }
        
        return annualCost * multiplier;
    }
    
    function calculateProjectedCost(currentCost, yearsUntilCare, inflationRate) {
        return currentCost * Math.pow(1 + inflationRate / 100, yearsUntilCare);
    }
    
    function calculateTotalCareCosts(projectedAnnualCost, careDuration, inflationRate) {
        let totalCost = 0;
        for (let year = 0; year < careDuration; year++) {
            const yearCost = projectedAnnualCost * Math.pow(1 + inflationRate / 100, year);
            totalCost += yearCost;
        }
        return totalCost;
    }
    
    function calculateInsuranceBenefits(dailyBenefit, benefitPeriod, eliminationPeriod, careDuration) {
        if (!dailyBenefit || !benefitPeriod) return 0;
        
        const actualBenefitPeriod = Math.min(benefitPeriod, careDuration);
        const eliminationDays = eliminationPeriod || 0;
        const payingDays = Math.max(0, (actualBenefitPeriod * 365) - eliminationDays);
        
        return dailyBenefit * payingDays;
    }
    
    function calculateMonthlySavingsNeeded(totalCost, currentAge, careStartAge) {
        const yearsToSave = careStartAge - currentAge;
        const monthsToSave = yearsToSave * 12;
        
        // Assuming 5% annual return on savings
        const monthlyReturn = 0.05 / 12;
        
        if (monthsToSave <= 0) return totalCost;
        
        // Future value of annuity formula to calculate monthly payment needed
        const monthlyPayment = totalCost * monthlyReturn / (Math.pow(1 + monthlyReturn, monthsToSave) - 1);
        
        return monthlyPayment;
    }
    
    function generatePlanningTips(careType, totalCost, insuranceCoverage, coverageGap, currentAge, careStartAge) {
        const tips = [];
        const yearsToSave = careStartAge - currentAge;
        
        // Cost-specific recommendations
        if (totalCost > 400000) {
            tips.push(`💰 Your projected care costs are high ($${Math.round(totalCost).toLocaleString()}). Consider long-term care insurance or dedicated savings strategy.`);
        }
        
        // Coverage gap analysis
        if (coverageGap > 200000) {
            tips.push(`⚠️ Significant coverage gap of $${Math.round(coverageGap).toLocaleString()}. Review insurance options or increase savings.`);
        } else if (insuranceCoverage === 0) {
            tips.push(`🏥 Consider long-term care insurance. Purchasing while healthy can provide substantial coverage at reasonable premiums.`);
        }
        
        // Time-based recommendations
        if (yearsToSave > 15) {
            tips.push(`⏰ With ${yearsToSave} years to plan, you have time for a comprehensive savings and insurance strategy.`);
        } else if (yearsToSave < 10) {
            tips.push(`🚨 Limited time to save. Consider immediate long-term care insurance and aggressive savings plan.`);
        }
        
        // Care type specific tips
        if (careType === 'home') {
            tips.push(`🏠 Home care preference noted. Consider home modifications and family care coordination to reduce costs.`);
        } else if (careType === 'assisted') {
            tips.push(`🏘️ Assisted living facilities vary widely in cost. Research options in your preferred area early.`);
        } else if (careType === 'nursing') {
            tips.push(`🏥 Skilled nursing is expensive but may be covered by Medicare for short-term needs. Long-term coverage requires planning.`);
        }
        
        // General planning advice
        tips.push(`📈 Healthcare costs typically inflate 1-2% above general inflation. Plan accordingly for rising costs.`);
        
        if (currentAge < 60) {
            tips.push(`✅ Starting care planning early gives you the most options. Consider hybrid life insurance with LTC benefits.`);
        }
        
        return tips;
    }
    
    function createCostChart(currentAge, careStartAge, projectedAnnualCost, careDuration, inflationRate) {
        const canvas = document.getElementById('costProjectionChart');
        const ctx = canvas.getContext('2d');
        
        if (costChart) {
            costChart.destroy();
        }
        
        const ages = [];
        const costs = [];
        
        // Create projection from care start to end of care period
        for (let year = 0; year <= careDuration; year++) {
            const age = careStartAge + year;
            ages.push(age);
            
            if (year === 0) {
                costs.push(Math.round(projectedAnnualCost));
            } else {
                const yearCost = projectedAnnualCost * Math.pow(1 + inflationRate / 100, year);
                costs.push(Math.round(yearCost));
            }
        }
        
        costChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ages.map(age => `Age ${age}`),
                datasets: [{
                    label: 'Annual Care Cost',
                    data: costs,
                    backgroundColor: 'rgba(44, 90, 160, 0.7)',
                    borderColor: '#2c5aa0',
                    borderWidth: 2
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
                        text: 'Projected Annual Care Costs'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Annual Cost: $' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Annual Cost ($)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + (value >= 1000 ? (value/1000).toFixed(0) + 'K' : value.toLocaleString());
                            }
                        }
                    },
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Age During Care Period'
                        }
                    }
                }
            }
        });
        
        // Set chart height
        canvas.style.height = '400px';
    }
    
    function calculateCareCosts() {
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
            const currentAge = parseInt(currentAgeEl.value);
            const gender = genderEl.value;
            const state = stateEl.value;
            const careStartAge = parseInt(careStartAgeEl.value);
            const careDuration = parseFloat(careDurationEl.value);
            const preferredCare = preferredCareEl.value;
            const inflationRate = parseFloat(inflationRateEl.value);
            
            // Insurance details
            const hasInsurance = hasInsuranceEl.value === 'yes';
            const dailyBenefit = hasInsurance ? parseFloat(dailyBenefitEl.value) || 0 : 0;
            const benefitPeriod = hasInsurance ? parseFloat(benefitPeriodEl.value) || 0 : 0;
            const eliminationPeriod = hasInsurance ? parseInt(eliminationPeriodEl.value) || 0 : 0;
            
            // Calculate costs
            const yearsUntilCare = careStartAge - currentAge;
            const currentAnnualCost = calculateCurrentCost(preferredCare, state);
            const projectedAnnualCost = calculateProjectedCost(currentAnnualCost, yearsUntilCare, inflationRate);
            const totalCareCosts = calculateTotalCareCosts(projectedAnnualCost, careDuration, inflationRate);
            
            // Calculate insurance benefits
            const totalInsuranceBenefits = calculateInsuranceBenefits(dailyBenefit, benefitPeriod, eliminationPeriod, careDuration);
            
            // Calculate coverage gap
            const coverageGap = Math.max(0, totalCareCosts - totalInsuranceBenefits);
            
            // Calculate monthly savings needed
            const monthlySavingsNeeded = calculateMonthlySavingsNeeded(coverageGap, currentAge, careStartAge);
            
            // Display results
            totalCostsEl.textContent = '$' + Math.round(totalCareCosts).toLocaleString();
            insuranceCoverageEl.textContent = '$' + Math.round(totalInsuranceBenefits).toLocaleString();
            coverageGapEl.textContent = '$' + Math.round(coverageGap).toLocaleString();
            monthlySavingsEl.textContent = '$' + Math.round(monthlySavingsNeeded).toLocaleString();
            
            // Display breakdown
            currentCostEl.textContent = '$' + Math.round(currentAnnualCost).toLocaleString();
            projectedCostEl.textContent = '$' + Math.round(projectedAnnualCost).toLocaleString();
            durationCostEl.textContent = '$' + Math.round(totalCareCosts).toLocaleString();
            netCostEl.textContent = '$' + Math.round(coverageGap).toLocaleString();
            
            // Generate planning tips
            const tips = generatePlanningTips(preferredCare, totalCareCosts, totalInsuranceBenefits, coverageGap, currentAge, careStartAge);
            planningTipsEl.innerHTML = `
                <p>Based on your care planning preferences, here are personalized recommendations:</p>
                <div class="planning-highlight">
                    <ul class="tip-list">
                        ${tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            `;
            
            // Create cost projection chart
            createCostChart(currentAge, careStartAge, projectedAnnualCost, careDuration, inflationRate);
            
            // Show results
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Calculation error:', error);
            displayErrors(['An error occurred during calculation. Please check your inputs and try again.']);
        } finally {
            // Remove loading state
            calculateButton.disabled = false;
            calculateButton.innerHTML = 'Calculate Care Costs';
        }
    }
    
    function resetCalculator() {
        // Reset form
        form.reset();
        
        // Reset default values
        inflationRateEl.value = '5.5';
        
        // Hide results
        resultsSection.style.display = 'none';
        errorMessagesDiv.style.display = 'none';
        
        // Reset insurance details visibility
        toggleInsuranceDetails();
        
        // Destroy chart
        if (costChart) {
            costChart.destroy();
            costChart = null;
        }
        
        // Scroll to top of calculator
        document.getElementById('calculator-section').scrollIntoView({ behavior: 'smooth' });
    }
});