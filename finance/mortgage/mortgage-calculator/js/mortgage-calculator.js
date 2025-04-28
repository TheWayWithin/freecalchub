// Mortgage Calculator JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Set current date as default for loan start date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    document.getElementById('loan-start-date').value = `${year}-${month}`;
    
    // Connect down payment amount and percentage fields
    const homePriceInput = document.getElementById('home-price');
    const downPaymentAmountInput = document.getElementById('down-payment-amount');
    const downPaymentPercentInput = document.getElementById('down-payment-percent');
    
    // Update down payment amount when percentage changes
    downPaymentPercentInput.addEventListener('input', function() {
        const homePrice = parseFloat(homePriceInput.value) || 0;
        const downPaymentPercent = parseFloat(this.value) || 0;
        const downPaymentAmount = (homePrice * downPaymentPercent / 100).toFixed(0);
        downPaymentAmountInput.value = downPaymentAmount;
        console.log('Updated down payment amount:', downPaymentAmount);
    });
    
    // Update down payment percentage when amount changes
    downPaymentAmountInput.addEventListener('input', function() {
        const homePrice = parseFloat(homePriceInput.value) || 0;
        const downPaymentAmount = parseFloat(this.value) || 0;
        if (homePrice > 0) {
            const downPaymentPercent = (downPaymentAmount / homePrice * 100).toFixed(1);
            downPaymentPercentInput.value = downPaymentPercent;
            console.log('Updated down payment percent:', downPaymentPercent);
        }
    });
    
    // Update down payment amount when home price changes
    homePriceInput.addEventListener('input', function() {
        const homePrice = parseFloat(this.value) || 0;
        const downPaymentPercent = parseFloat(downPaymentPercentInput.value) || 0;
        const downPaymentAmount = (homePrice * downPaymentPercent / 100).toFixed(0);
        downPaymentAmountInput.value = downPaymentAmount;
        console.log('Updated down payment amount after home price change:', downPaymentAmount);
    });
    
    // Initialize FAQ accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            faqItem.classList.toggle('active');
        });
    });

    // Add form submission handler to process calculations
    const mortgageForm = document.getElementById('mortgage-calculator-form');
    mortgageForm.addEventListener('submit', function(event) {
        // Prevent the default form submission
        event.preventDefault();
        
        // Force refresh all input values directly from the DOM elements
        const homePrice = parseFloat(document.getElementById('home-price').value) || 0;
        const downPaymentAmount = parseFloat(document.getElementById('down-payment-amount').value) || 0;
        const loanTerm = parseInt(document.getElementById('loan-term').value) || 30;
        const interestRate = parseFloat(document.getElementById('interest-rate').value) || 4.5;
        const propertyTax = parseFloat(document.getElementById('property-tax').value) || 0;
        const homeInsurance = parseFloat(document.getElementById('home-insurance').value) || 0;
        const hoaFees = parseFloat(document.getElementById('hoa-fees').value) || 0;
        const extraPayment = parseFloat(document.getElementById('extra-payment').value) || 0;
        const loanStartDate = document.getElementById('loan-start-date').value;
        
        // Log input values for debugging
        console.log('Calculation inputs:', {
            homePrice,
            downPaymentAmount,
            loanTerm,
            interestRate,
            propertyTax,
            homeInsurance,
            hoaFees,
            extraPayment,
            loanStartDate
        });
        
        // Calculate loan amount
        const loanAmount = homePrice - downPaymentAmount;
        console.log('Calculated loan amount:', loanAmount);
        
        // Calculate monthly interest rate
        const monthlyInterestRate = interestRate / 100 / 12;
        
        // Calculate number of payments
        const numberOfPayments = loanTerm * 12;
        
        // Calculate monthly principal and interest payment
        const monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
                              (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
        
        // Calculate monthly property tax and insurance
        const monthlyPropertyTax = propertyTax / 12;
        const monthlyInsurance = homeInsurance / 12;
        
        // Calculate total monthly payment
        const totalMonthlyPayment = monthlyPayment + monthlyPropertyTax + monthlyInsurance + hoaFees;
        
        // Calculate total interest paid
        const totalInterest = (monthlyPayment * numberOfPayments) - loanAmount;
        
        // Log calculation results for debugging
        console.log('Calculation results:', {
            monthlyPayment,
            monthlyPropertyTax,
            monthlyInsurance,
            totalMonthlyPayment,
            totalInterest
        });
        
        // Update results in the UI
        document.getElementById('principal-interest').textContent = '$' + monthlyPayment.toFixed(2);
        document.getElementById('monthly-property-tax').textContent = '$' + monthlyPropertyTax.toFixed(2);
        document.getElementById('monthly-insurance').textContent = '$' + monthlyInsurance.toFixed(2);
        document.getElementById('total-payment').textContent = '$' + totalMonthlyPayment.toFixed(2);
        document.getElementById('loan-amount').textContent = '$' + loanAmount.toFixed(2);
        document.getElementById('total-interest').textContent = '$' + totalInterest.toFixed(2);
        document.getElementById('total-cost').textContent = '$' + (loanAmount + totalInterest).toFixed(2);
        
        // Show/hide HOA fees in results
        const hoaContainer = document.getElementById('hoa-container');
        const monthlyHoa = document.getElementById('monthly-hoa');
        if (hoaFees > 0) {
            hoaContainer.style.display = 'flex';
            monthlyHoa.textContent = '$' + hoaFees.toFixed(2);
        } else {
            hoaContainer.style.display = 'none';
            monthlyHoa.textContent = '$0.00';
        }
        
        // Calculate and display loan payoff date
        const startDate = new Date(loanStartDate);
        const payoffDate = new Date(startDate);
        payoffDate.setMonth(payoffDate.getMonth() + numberOfPayments);
        const payoffDateString = payoffDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        document.getElementById('payoff-date').textContent = payoffDateString;
        
        // Handle extra payment calculations
        if (extraPayment > 0) {
            // Calculate new payoff time with extra payments
            let balance = loanAmount;
            let month = 0;
            let totalInterestWithExtra = 0;
            
            while (balance > 0 && month < 1200) { // Cap at 100 years to prevent infinite loops
                month++;
                const interestPayment = balance * monthlyInterestRate;
                const principalPayment = Math.min(monthlyPayment - interestPayment + extraPayment, balance);
                totalInterestWithExtra += interestPayment;
                balance -= principalPayment;
                
                if (balance <= 0) break;
            }
            
            // Calculate new payoff date
            const newPayoffDate = new Date(startDate);
            newPayoffDate.setMonth(newPayoffDate.getMonth() + month);
            const newPayoffDateString = newPayoffDate.toLocaleString('default', { month: 'long', year: 'numeric' });
            
            // Calculate time saved
            const monthsSaved = numberOfPayments - month;
            const yearsSaved = Math.floor(monthsSaved / 12);
            const remainingMonths = monthsSaved % 12;
            let timeSavedText = '';
            if (yearsSaved > 0) {
                timeSavedText += yearsSaved + (yearsSaved === 1 ? ' year' : ' years');
            }
            if (remainingMonths > 0) {
                if (timeSavedText) timeSavedText += ' and ';
                timeSavedText += remainingMonths + (remainingMonths === 1 ? ' month' : ' months');
            }
            
            // Calculate interest saved
            const interestSaved = totalInterest - totalInterestWithExtra;
            
            // Update extra payment summary
            document.getElementById('extra-payment-summary').style.display = 'block';
            document.getElementById('new-payoff-date').textContent = newPayoffDateString;
            document.getElementById('time-saved').textContent = timeSavedText;
            document.getElementById('interest-saved').textContent = '$' + interestSaved.toFixed(2);
            document.getElementById('comparison-chart-wrapper').style.display = 'block';
        } else {
            document.getElementById('extra-payment-summary').style.display = 'none';
            document.getElementById('comparison-chart-wrapper').style.display = 'none';
        }
        
        // Generate amortization schedule
        generateAmortizationSchedule(loanAmount, monthlyInterestRate, monthlyPayment, numberOfPayments, extraPayment, loanStartDate);
        
        // Update charts
        updateCharts(monthlyPayment, monthlyPropertyTax, monthlyInsurance, hoaFees, loanAmount, interestRate, loanTerm, extraPayment);
    });
    
    // Function to generate amortization schedule
    function generateAmortizationSchedule(loanAmount, monthlyInterestRate, monthlyPayment, numberOfPayments, extraPayment, loanStartDate) {
        const tableBody = document.getElementById('amortization-table-body');
        tableBody.innerHTML = ''; // Clear existing rows
        
        let balance = loanAmount;
        let totalInterestPaid = 0;
        let totalPrincipalPaid = 0;
        let totalPaid = 0;
        
        // Create yearly amortization data
        const yearlyData = [];
        const startDate = new Date(loanStartDate);
        const currentYear = startDate.getFullYear();
        
        for (let year = 1; year <= Math.ceil(numberOfPayments / 12); year++) {
            let yearlyPrincipalPaid = 0;
            let yearlyInterestPaid = 0;
            
            // Process 12 months for each year (or fewer for the final year)
            const monthsInYear = (year === Math.ceil(numberOfPayments / 12)) ? (numberOfPayments % 12 || 12) : 12;
            
            for (let month = 1; month <= monthsInYear; month++) {
                if (balance <= 0) break;
                
                // Calculate interest for this month
                const interestPayment = balance * monthlyInterestRate;
                
                // Calculate principal for this month (including any extra payment)
                let principalPayment = monthlyPayment - interestPayment;
                if (extraPayment > 0) {
                    principalPayment += extraPayment;
                }
                
                // Ensure we don't pay more than the remaining balance
                principalPayment = Math.min(principalPayment, balance);
                
                // Update running totals
                yearlyInterestPaid += interestPayment;
                yearlyPrincipalPaid += principalPayment;
                balance -= principalPayment;
                
                if (balance <= 0) {
                    balance = 0;
                    break;
                }
            }
            
            // Update totals
            totalInterestPaid += yearlyInterestPaid;
            totalPrincipalPaid += yearlyPrincipalPaid;
            totalPaid = totalPrincipalPaid + totalInterestPaid;
            
            // Add yearly data to array
            yearlyData.push({
                year: currentYear + year - 1,
                principalPaid: yearlyPrincipalPaid,
                interestPaid: yearlyInterestPaid,
                totalPaid: yearlyPrincipalPaid + yearlyInterestPaid,
                remainingBalance: balance
            });
            
            // Stop if balance is paid off
            if (balance <= 0) break;
        }
        
        // Create table rows for each year
        yearlyData.forEach(data => {
            const row = document.createElement('tr');
            
            // Year
            const yearCell = document.createElement('td');
            yearCell.textContent = data.year;
            row.appendChild(yearCell);
            
            // Principal Paid
            const principalCell = document.createElement('td');
            principalCell.textContent = '$' + data.principalPaid.toFixed(2);
            row.appendChild(principalCell);
            
            // Interest Paid
            const interestCell = document.createElement('td');
            interestCell.textContent = '$' + data.interestPaid.toFixed(2);
            row.appendChild(interestCell);
            
            // Total Paid
            const totalPaidCell = document.createElement('td');
            totalPaidCell.textContent = '$' + data.totalPaid.toFixed(2);
            row.appendChild(totalPaidCell);
            
            // Remaining Balance
            const balanceCell = document.createElement('td');
            balanceCell.textContent = '$' + data.remainingBalance.toFixed(2);
            row.appendChild(balanceCell);
            
            tableBody.appendChild(row);
        });
    }
    
    // Function to update charts
    function updateCharts(monthlyPayment, monthlyPropertyTax, monthlyInsurance, hoaFees, loanAmount, interestRate, loanTerm, extraPayment) {
        // Implementation would go here
        // For now, we'll just add a placeholder
        console.log('Charts would be updated here');
    }
    
    // Trigger calculation on page load to initialize with default values
    const calculateButton = document.querySelector('#mortgage-calculator-form button[type="submit"]');
    calculateButton.click();
});
