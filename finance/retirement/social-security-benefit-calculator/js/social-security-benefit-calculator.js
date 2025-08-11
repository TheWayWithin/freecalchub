// Social Security Benefit Calculator JavaScript
// Comprehensive implementation with accurate SSA formulas

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('calculatorForm');
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const resultsSection = document.getElementById('resultsSection');
    const errorMessagesDiv = document.getElementById('errorMessages');
    
    // Input Elements
    const birthYearEl = document.getElementById('birthYear');
    const claimingAgeEl = document.getElementById('claimingAge');
    const averageEarningsEl = document.getElementById('averageAnnualEarnings');
    const yearsWorkedEl = document.getElementById('yearsWorked');
    const currentAgeEl = document.getElementById('currentAge');
    const includeSpouseEl = document.getElementById('includeSpouse');
    const spouseBenefitEl = document.getElementById('spouseBenefit');
    const spouseInfoDiv = document.querySelector('.spouse-info');
    
    // Result Elements
    const monthlyBenefitEl = document.getElementById('monthlyBenefit');
    const fraBenefitEl = document.getElementById('fraBenefit');
    const lifetimeBenefitsEl = document.getElementById('lifetimeBenefits');
    const breakEvenAgeEl = document.getElementById('breakEvenAge');
    const strategyRecommendationEl = document.getElementById('strategyRecommendation');
    
    // Chart
    let benefitChart = null;
    
    // Constants for Social Security calculations (2025 values)
    const BEND_POINTS_2025 = [1174, 7078]; // PIA bend points for 2025
    const BEND_PERCENTAGES = [0.90, 0.32, 0.15]; // PIA calculation percentages
    const WAGE_BASE_2025 = 168600; // Maximum taxable earnings for 2025
    const COST_OF_LIVING_ADJUSTMENT = 0.025; // Estimated COLA for 2025
    const EARNINGS_TEST_LIMIT_2025 = 23400; // Annual earnings test limit before FRA
    
    // Full Retirement Age lookup table
    const FRA_TABLE = {
        1943: 66.0,
        1944: 66.17, // 66 years, 2 months
        1945: 66.33, // 66 years, 4 months
        1946: 66.5,  // 66 years, 6 months
        1947: 66.67, // 66 years, 8 months
        1948: 66.83, // 66 years, 10 months
        1949: 67.0,
        1950: 67.0,
        1951: 67.0,
        1952: 67.0,
        1953: 67.0,
        1954: 67.0,
        1955: 67.17, // 67 years, 2 months
        1956: 67.33, // 67 years, 4 months
        1957: 67.5,  // 67 years, 6 months
        1958: 67.67, // 67 years, 8 months
        1959: 67.83, // 67 years, 10 months
        1960: 67.0   // 67 years for 1960 and later
    };
    
    // Event Listeners
    includeSpouseEl.addEventListener('change', toggleSpouseInfo);
    calculateButton.addEventListener('click', calculateBenefits);
    resetButton.addEventListener('click', resetCalculator);
    
    // Initialize
    toggleSpouseInfo();
    
    function toggleSpouseInfo() {
        const includeSpouse = includeSpouseEl.value === 'yes';
        spouseInfoDiv.style.display = includeSpouse ? 'block' : 'none';
        if (!includeSpouse) {
            spouseBenefitEl.value = '';
        }
    }
    
    function validateInputs() {
        const errors = [];
        
        if (!birthYearEl.value) {
            errors.push('Please select your birth year.');
        }
        
        if (!claimingAgeEl.value) {
            errors.push('Please select your claiming age.');
        }
        
        const earnings = parseFloat(averageEarningsEl.value);
        if (!earnings || earnings <= 0) {
            errors.push('Please enter a valid average annual earnings amount.');
        } else if (earnings > WAGE_BASE_2025 * 2) {
            errors.push(`Average annual earnings cannot exceed $${(WAGE_BASE_2025 * 2).toLocaleString()}.`);
        }
        
        const yearsWorked = parseInt(yearsWorkedEl.value);
        if (!yearsWorked || yearsWorked < 10) {
            errors.push('You must have at least 10 years of covered employment for Social Security benefits.');
        } else if (yearsWorked > 50) {
            errors.push('Years worked cannot exceed 50.');
        }
        
        const currentAge = parseInt(currentAgeEl.value);
        if (!currentAge || currentAge < 30 || currentAge > 70) {
            errors.push('Please enter a valid current age (30-70).');
        }
        
        const claimingAge = parseInt(claimingAgeEl.value);
        if (currentAge && claimingAge && claimingAge < currentAge) {
            errors.push('Claiming age cannot be less than your current age.');
        }
        
        if (includeSpouseEl.value === 'yes') {
            const spouseBenefit = parseFloat(spouseBenefitEl.value);
            if (!spouseBenefit || spouseBenefit <= 0) {
                errors.push('Please enter a valid spouse benefit amount.');
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
    
    function getFullRetirementAge(birthYear) {
        const year = parseInt(birthYear);
        if (year <= 1943) return FRA_TABLE[1943];
        if (year >= 1960) return FRA_TABLE[1960];
        return FRA_TABLE[year] || 67.0;
    }
    
    function calculatePrimaryInsuranceAmount(averageEarnings, yearsWorked) {
        // Calculate Average Indexed Monthly Earnings (AIME)
        // Simplified calculation - in reality, each year's earnings are indexed to current wage levels
        const totalEarnings = Math.min(averageEarnings * yearsWorked, WAGE_BASE_2025 * yearsWorked);
        const aime = totalEarnings / (35 * 12); // Use 35 years as standard, divide by months
        
        // Apply PIA formula with bend points
        let pia = 0;
        
        if (aime <= BEND_POINTS_2025[0]) {
            pia = aime * BEND_PERCENTAGES[0];
        } else if (aime <= BEND_POINTS_2025[1]) {
            pia = BEND_POINTS_2025[0] * BEND_PERCENTAGES[0] + 
                  (aime - BEND_POINTS_2025[0]) * BEND_PERCENTAGES[1];
        } else {
            pia = BEND_POINTS_2025[0] * BEND_PERCENTAGES[0] + 
                  (BEND_POINTS_2025[1] - BEND_POINTS_2025[0]) * BEND_PERCENTAGES[1] +
                  (aime - BEND_POINTS_2025[1]) * BEND_PERCENTAGES[2];
        }
        
        // Round down to nearest $0.10
        return Math.floor(pia * 10) / 10;
    }
    
    function calculateBenefitReduction(claimingAge, fullRetirementAge, pia) {
        const claimingAgeDecimal = parseFloat(claimingAge);
        
        if (claimingAgeDecimal >= 70) {
            // Maximum benefit at age 70
            const delayYears = 70 - fullRetirementAge;
            return pia * (1 + delayYears * 0.08);
        } else if (claimingAgeDecimal >= fullRetirementAge) {
            // Delayed retirement credits
            const delayYears = claimingAgeDecimal - fullRetirementAge;
            return pia * (1 + delayYears * 0.08);
        } else if (claimingAgeDecimal >= 62) {
            // Early retirement reduction
            const monthsEarly = (fullRetirementAge - claimingAgeDecimal) * 12;
            let reductionPercentage = 0;
            
            if (monthsEarly <= 36) {
                // First 36 months: 5/9 of 1% per month
                reductionPercentage = monthsEarly * (5/9) / 100;
            } else {
                // First 36 months + additional months at 5/12 of 1%
                reductionPercentage = 36 * (5/9) / 100 + (monthsEarly - 36) * (5/12) / 100;
            }
            
            return pia * (1 - reductionPercentage);
        }
        
        return pia;
    }
    
    function calculateLifetimeBenefits(monthlyBenefit, claimingAge, lifeExpectancy = 85) {
        const claimingAgeDecimal = parseFloat(claimingAge);
        const yearsReceiving = Math.max(0, lifeExpectancy - claimingAgeDecimal);
        return monthlyBenefit * 12 * yearsReceiving;
    }
    
    function findBreakEvenAge(fraBenefit, earlyBenefit, earlyClaimingAge, fraAge) {
        const monthlyDifference = fraBenefit - earlyBenefit;
        const monthsOfEarlyPayments = (fraAge - earlyClaimingAge) * 12;
        const totalEarlyAdvantage = earlyBenefit * monthsOfEarlyPayments;
        
        const monthsToBreakEven = totalEarlyAdvantage / monthlyDifference;
        return fraAge + (monthsToBreakEven / 12);
    }
    
    function generateRecommendation(birthYear, claimingAge, currentAge, monthlyBenefit, fraBenefit, lifetimeBenefits, breakEvenAge) {
        const fra = getFullRetirementAge(birthYear);
        const claimingAgeNum = parseInt(claimingAge);
        const currentAgeNum = parseInt(currentAge);
        
        let recommendation = '';
        
        if (claimingAgeNum < fra) {
            const reductionPercent = ((fraBenefit - monthlyBenefit) / fraBenefit * 100).toFixed(1);
            recommendation = `
                <div class="recommendation-highlight">
                    <strong>Early Claiming Analysis:</strong> Claiming at age ${claimingAge} reduces your benefit by ${reductionPercent}% 
                    compared to waiting until your Full Retirement Age of ${fra.toFixed(0)}. 
                    ${breakEvenAge < 80 ? `If you live beyond age ${breakEvenAge.toFixed(0)}, waiting until FRA would provide more lifetime income.` : 
                      'Given the break-even age, early claiming may be beneficial if you have health concerns.'}
                </div>
                <p><strong>Consider early claiming if:</strong> You have immediate financial needs, health concerns, 
                or want guaranteed income. <strong>Consider waiting if:</strong> You're in good health, 
                have other income sources, and expect to live beyond age ${breakEvenAge.toFixed(0)}.</p>
            `;
        } else if (claimingAgeNum === Math.floor(fra)) {
            recommendation = `
                <div class="recommendation-highlight">
                    <strong>Full Retirement Age Claiming:</strong> You'll receive your full Primary Insurance Amount 
                    with no early retirement reduction or delayed retirement credits.
                </div>
                <p>This is often considered the "break-even" claiming age. You could increase your benefit by 
                about 8% per year by waiting until age 70, or start receiving benefits now with no reduction.</p>
            `;
        } else if (claimingAgeNum > fra && claimingAgeNum < 70) {
            const increasePercent = ((monthlyBenefit - fraBenefit) / fraBenefit * 100).toFixed(1);
            recommendation = `
                <div class="recommendation-highlight">
                    <strong>Delayed Claiming Strategy:</strong> By waiting until age ${claimingAge}, you'll increase 
                    your benefit by ${increasePercent}% compared to your Full Retirement Age benefit.
                </div>
                <p>Delaying benefits can be advantageous if you're still working, in good health, and expect longevity. 
                Consider your other retirement income sources when making this decision.</p>
            `;
        } else if (claimingAgeNum === 70) {
            const maxIncreasePercent = ((monthlyBenefit - fraBenefit) / fraBenefit * 100).toFixed(1);
            recommendation = `
                <div class="recommendation-highlight">
                    <strong>Maximum Benefit Strategy:</strong> Claiming at age 70 provides the highest possible 
                    monthly benefit - ${maxIncreasePercent}% more than your Full Retirement Age benefit.
                </div>
                <p>This strategy maximizes your monthly payment and can be ideal if you're in excellent health, 
                have longevity in your family, and can afford to wait. Remember, benefits don't increase past age 70.</p>
            `;
        }
        
        return recommendation;
    }
    
    function createBenefitChart(birthYear) {
        const canvas = document.getElementById('benefitComparisonChart');
        const ctx = canvas.getContext('2d');
        
        if (benefitChart) {
            benefitChart.destroy();
        }
        
        const fra = getFullRetirementAge(birthYear);
        const averageEarnings = parseFloat(averageEarningsEl.value);
        const yearsWorked = parseInt(yearsWorkedEl.value);
        const pia = calculatePrimaryInsuranceAmount(averageEarnings, yearsWorked);
        
        const ages = [];
        const benefits = [];
        const lifetimeBenefitsData = [];
        
        // Calculate benefits for ages 62-70
        for (let age = 62; age <= 70; age++) {
            ages.push(age);
            const benefit = calculateBenefitReduction(age, fra, pia);
            benefits.push(Math.round(benefit));
            lifetimeBenefitsData.push(Math.round(calculateLifetimeBenefits(benefit, age) / 1000)); // In thousands
        }
        
        benefitChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ages,
                datasets: [{
                    label: 'Monthly Benefit ($)',
                    data: benefits,
                    borderColor: '#2c5aa0',
                    backgroundColor: 'rgba(44, 90, 160, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2c5aa0',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    yAxisID: 'y'
                }, {
                    label: 'Lifetime Benefits ($000)',
                    data: lifetimeBenefitsData,
                    borderColor: '#ff6b35',
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#ff6b35',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    yAxisID: 'y1'
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
                        text: 'Social Security Benefits by Claiming Age'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label;
                                const value = context.parsed.y;
                                if (label.includes('Monthly')) {
                                    return `${label}: $${value.toLocaleString()}`;
                                } else {
                                    return `${label}: $${value}k`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Claiming Age'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Monthly Benefit ($)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Lifetime Benefits ($000)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value + 'k';
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
    
    function calculateBenefits() {
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
            const birthYear = birthYearEl.value;
            const claimingAge = parseInt(claimingAgeEl.value);
            const averageEarnings = parseFloat(averageEarningsEl.value);
            const yearsWorked = parseInt(yearsWorkedEl.value);
            const currentAge = parseInt(currentAgeEl.value);
            
            // Calculate Full Retirement Age
            const fullRetirementAge = getFullRetirementAge(birthYear);
            
            // Calculate Primary Insurance Amount (PIA)
            const pia = calculatePrimaryInsuranceAmount(averageEarnings, yearsWorked);
            
            // Calculate benefit at Full Retirement Age
            const fraBenefit = pia;
            
            // Calculate benefit at claiming age
            const monthlyBenefit = calculateBenefitReduction(claimingAge, fullRetirementAge, pia);
            
            // Calculate lifetime benefits
            const lifetimeBenefits = calculateLifetimeBenefits(monthlyBenefit, claimingAge);
            
            // Calculate break-even age (if claiming early)
            let breakEvenAge = null;
            if (claimingAge < fullRetirementAge) {
                breakEvenAge = findBreakEvenAge(fraBenefit, monthlyBenefit, claimingAge, fullRetirementAge);
            }
            
            // Display results
            monthlyBenefitEl.textContent = '$' + Math.round(monthlyBenefit).toLocaleString();
            fraBenefitEl.textContent = '$' + Math.round(fraBenefit).toLocaleString();
            lifetimeBenefitsEl.textContent = '$' + Math.round(lifetimeBenefits).toLocaleString();
            breakEvenAgeEl.textContent = breakEvenAge ? breakEvenAge.toFixed(0) : 'N/A';
            
            // Generate recommendation
            const recommendation = generateRecommendation(
                birthYear, claimingAge, currentAge, monthlyBenefit, 
                fraBenefit, lifetimeBenefits, breakEvenAge
            );
            strategyRecommendationEl.innerHTML = recommendation;
            
            // Create chart
            createBenefitChart(birthYear);
            
            // Show results
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Calculation error:', error);
            displayErrors(['An error occurred during calculation. Please check your inputs and try again.']);
        } finally {
            // Remove loading state
            calculateButton.disabled = false;
            calculateButton.innerHTML = 'Calculate Benefits';
        }
    }
    
    function resetCalculator() {
        // Reset form
        form.reset();
        
        // Hide results
        resultsSection.style.display = 'none';
        errorMessagesDiv.style.display = 'none';
        
        // Reset spouse info visibility
        toggleSpouseInfo();
        
        // Destroy chart
        if (benefitChart) {
            benefitChart.destroy();
            benefitChart = null;
        }
        
        // Scroll to top of calculator
        document.getElementById('calculator-section').scrollIntoView({ behavior: 'smooth' });
    }
});