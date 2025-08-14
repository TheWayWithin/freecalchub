// Rent vs Buy Calculator JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const resultsSection = document.getElementById('resultsSection');
    const errorMessages = document.getElementById('errorMessages');

    if (calculateButton) {
        calculateButton.addEventListener('click', calculateRentVsBuy);
    }

    if (resetButton) {
        resetButton.addEventListener('click', function() {
            resultsSection.style.display = 'none';
            errorMessages.style.display = 'none';
        });
    }

    function calculateRentVsBuy() {
        try {
            // Clear previous errors
            errorMessages.style.display = 'none';
            errorMessages.innerHTML = '';

            // Get input values
            const homePrice = parseFloat(document.getElementById('homePrice').value) || 0;
            const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
            const yearsToStay = parseInt(document.getElementById('yearsToStay').value) || 0;
            const interestRate = parseFloat(document.getElementById('interestRate').value) || 0;
            const loanTerm = parseInt(document.getElementById('loanTerm').value) || 30;
            const closingCosts = parseFloat(document.getElementById('closingCosts').value) || 0;
            const propertyTax = parseFloat(document.getElementById('propertyTax').value) || 0;
            const homeInsurance = parseFloat(document.getElementById('homeInsurance').value) || 0;
            const maintenance = parseFloat(document.getElementById('maintenance').value) || 1;
            const hoaFees = parseFloat(document.getElementById('hoaFees').value) || 0;
            const monthlyRent = parseFloat(document.getElementById('monthlyRent').value) || 0;
            const rentIncrease = parseFloat(document.getElementById('rentIncrease').value) || 3;
            const rentersInsurance = parseFloat(document.getElementById('rentersInsurance').value) || 0;
            const investmentReturn = parseFloat(document.getElementById('investmentReturn').value) || 7;
            const homeAppreciation = parseFloat(document.getElementById('homeAppreciation').value) || 3;

            // Validate inputs
            const errors = [];
            if (homePrice <= 0) errors.push('Home price must be greater than 0');
            if (downPayment < 0) errors.push('Down payment cannot be negative');
            if (yearsToStay <= 0) errors.push('Years to stay must be greater than 0');
            if (interestRate < 0) errors.push('Interest rate cannot be negative');
            if (monthlyRent <= 0) errors.push('Monthly rent must be greater than 0');

            if (errors.length > 0) {
                showErrors(errors);
                return;
            }

            // Calculate buying costs
            const loanAmount = homePrice - downPayment;
            const monthlyInterestRate = interestRate / 100 / 12;
            const numberOfPayments = loanTerm * 12;

            // Calculate monthly mortgage payment (principal + interest)
            let monthlyPI = 0;
            if (monthlyInterestRate > 0) {
                monthlyPI = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
                           (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
            } else {
                monthlyPI = loanAmount / numberOfPayments;
            }

            // Calculate other monthly costs
            const monthlyPropertyTax = propertyTax / 12;
            const monthlyInsurance = homeInsurance / 12;
            const monthlyMaintenance = (homePrice * maintenance / 100) / 12;
            const monthlyHOA = hoaFees;

            const totalMonthlyBuyingCosts = monthlyPI + monthlyPropertyTax + monthlyInsurance + monthlyMaintenance + monthlyHOA;

            // Calculate total buying costs over the period
            const totalMortgagePayments = totalMonthlyBuyingCosts * (yearsToStay * 12);
            
            // Calculate home value after appreciation
            const futureHomeValue = homePrice * Math.pow(1 + homeAppreciation / 100, yearsToStay);
            const equityBuilt = futureHomeValue - loanAmount + (monthlyPI * yearsToStay * 12) - (loanAmount * Math.pow(1 + monthlyInterestRate, yearsToStay * 12));
            
            // Simplified equity calculation: future home value minus remaining loan balance
            let remainingBalance = loanAmount;
            for (let month = 1; month <= yearsToStay * 12; month++) {
                const interestPayment = remainingBalance * monthlyInterestRate;
                const principalPayment = monthlyPI - interestPayment;
                remainingBalance -= principalPayment;
                if (remainingBalance < 0) remainingBalance = 0;
            }
            
            const equityGained = futureHomeValue - Math.max(remainingBalance, 0);
            const totalBuyingCosts = downPayment + closingCosts + totalMortgagePayments - equityGained;

            // Calculate renting costs
            let totalRentingCosts = 0;
            let currentRent = monthlyRent;
            
            for (let year = 1; year <= yearsToStay; year++) {
                totalRentingCosts += currentRent * 12;
                currentRent *= (1 + rentIncrease / 100);
            }
            
            totalRentingCosts += rentersInsurance * yearsToStay;

            // Calculate opportunity cost of down payment if invested
            const investmentGrowth = downPayment * Math.pow(1 + investmentReturn / 100, yearsToStay);
            const opportunityCost = investmentGrowth - downPayment;
            totalRentingCosts -= opportunityCost; // Subtract because this is a benefit of renting

            // Determine which is better
            const difference = totalBuyingCosts - totalRentingCosts;
            let recommendation, costDifference;
            
            if (difference < 0) {
                recommendation = `Buying is better by $${Math.abs(difference).toLocaleString()}`;
                costDifference = `Buying saves $${Math.abs(difference).toLocaleString()}`;
                document.getElementById('recommendation').className = 'buy-better';
                document.getElementById('costDifference').className = 'savings';
            } else {
                recommendation = `Renting is better by $${difference.toLocaleString()}`;
                costDifference = `Renting saves $${difference.toLocaleString()}`;
                document.getElementById('recommendation').className = 'rent-better';
                document.getElementById('costDifference').className = 'savings';
            }

            // Display results
            document.getElementById('totalBuyCost').textContent = `$${totalBuyingCosts.toLocaleString()}`;
            document.getElementById('totalRentCost').textContent = `$${totalRentingCosts.toLocaleString()}`;
            document.getElementById('costDifference').textContent = costDifference;
            document.getElementById('recommendation').textContent = recommendation;

            // Create detailed breakdown
            createDetailedBreakdown({
                downPayment,
                closingCosts,
                totalMortgagePayments,
                equityGained,
                totalBuyingCosts,
                totalRentingCosts,
                opportunityCost,
                rentersInsurance,
                yearsToStay,
                monthlyPI,
                monthlyPropertyTax,
                monthlyInsurance,
                monthlyMaintenance,
                monthlyHOA,
                monthlyRent
            });

            resultsSection.style.display = 'block';

        } catch (error) {
            showErrors(['An error occurred during calculation. Please check your inputs.']);
        }
    }

    function createDetailedBreakdown(data) {
        const buyingCosts = document.getElementById('buyingCosts');
        const rentingCosts = document.getElementById('rentingCosts');

        buyingCosts.innerHTML = `
            <li><span>Down Payment:</span><span>$${data.downPayment.toLocaleString()}</span></li>
            <li><span>Closing Costs:</span><span>$${data.closingCosts.toLocaleString()}</span></li>
            <li><span>Total Mortgage Payments:</span><span>$${data.totalMortgagePayments.toLocaleString()}</span></li>
            <li><span>Minus: Equity Gained:</span><span>-$${data.equityGained.toLocaleString()}</span></li>
            <li><span>Total Buying Cost:</span><span>$${data.totalBuyingCosts.toLocaleString()}</span></li>
        `;

        rentingCosts.innerHTML = `
            <li><span>Total Rent (${data.yearsToStay} years):</span><span>$${(data.totalRentingCosts + data.opportunityCost + data.rentersInsurance * data.yearsToStay).toLocaleString()}</span></li>
            <li><span>Renters Insurance:</span><span>$${(data.rentersInsurance * data.yearsToStay).toLocaleString()}</span></li>
            <li><span>Minus: Investment Growth:</span><span>-$${data.opportunityCost.toLocaleString()}</span></li>
            <li><span>Total Renting Cost:</span><span>$${data.totalRentingCosts.toLocaleString()}</span></li>
        `;
    }

    function showErrors(errors) {
        errorMessages.innerHTML = errors.map(error => `<p>${error}</p>`).join('');
        errorMessages.style.display = 'block';
        resultsSection.style.display = 'none';
    }
});