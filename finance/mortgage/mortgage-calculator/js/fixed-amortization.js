/**
 * Fixed Amortization Schedule Functionality
 * This script ensures the amortization schedule is properly populated with data
 */

// Function to generate amortization schedule
function generateAmortizationSchedule(loanAmount, annualInterestRate, loanTermYears, extraPayment = 0) {
  console.log("Generating amortization schedule with:", {
    loanAmount,
    annualInterestRate,
    loanTermYears,
    extraPayment
  });
  
  // Convert annual values to monthly
  const monthlyInterestRate = annualInterestRate / 100 / 12;
  const totalPayments = loanTermYears * 12;
  
  // Calculate monthly payment using the formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
  // Where P = payment, L = loan amount, c = monthly interest rate, n = total number of payments
  let monthlyPayment = 0;
  if (monthlyInterestRate > 0) {
    monthlyPayment = loanAmount * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) / 
      (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
  } else {
    monthlyPayment = loanAmount / totalPayments;
  }
  
  console.log("Monthly payment calculated:", monthlyPayment);
  
  // Initialize variables for tracking
  let remainingBalance = loanAmount;
  let totalInterestPaid = 0;
  let yearlyData = {};
  let currentYear = new Date().getFullYear();
  
  // Process each payment
  for (let paymentNumber = 1; paymentNumber <= totalPayments && remainingBalance > 0; paymentNumber++) {
    // Calculate interest for this payment
    const interestPayment = remainingBalance * monthlyInterestRate;
    
    // Calculate principal for this payment (including any extra payment)
    let principalPayment = monthlyPayment - interestPayment + extraPayment;
    
    // Adjust principal if it's more than remaining balance
    if (principalPayment > remainingBalance) {
      principalPayment = remainingBalance;
    }
    
    // Update remaining balance
    remainingBalance -= principalPayment;
    
    // Update total interest paid
    totalInterestPaid += interestPayment;
    
    // Calculate year for this payment
    const paymentYear = currentYear + Math.floor((paymentNumber - 1) / 12);
    
    // Initialize year data if not exists
    if (!yearlyData[paymentYear]) {
      yearlyData[paymentYear] = {
        principalPaid: 0,
        interestPaid: 0,
        totalPaid: 0,
        remainingBalance: remainingBalance
      };
    }
    
    // Update yearly data
    yearlyData[paymentYear].principalPaid += principalPayment;
    yearlyData[paymentYear].interestPaid += interestPayment;
    yearlyData[paymentYear].totalPaid += (principalPayment + interestPayment);
    yearlyData[paymentYear].remainingBalance = remainingBalance;
    
    // If balance is paid off, break the loop
    if (remainingBalance <= 0) {
      break;
    }
  }
  
  console.log("Yearly data calculated:", yearlyData);
  
  // Convert yearly data to array for table
  const amortizationData = Object.keys(yearlyData).map(year => {
    return {
      year: year,
      principalPaid: yearlyData[year].principalPaid.toFixed(2),
      interestPaid: yearlyData[year].interestPaid.toFixed(2),
      totalPaid: yearlyData[year].totalPaid.toFixed(2),
      remainingBalance: yearlyData[year].remainingBalance.toFixed(2)
    };
  });
  
  console.log("Amortization data prepared:", amortizationData);
  return amortizationData;
}

// Function to populate the amortization table
function populateAmortizationTable(amortizationData) {
  console.log("Populating amortization table with data:", amortizationData);
  
  // Get the table body element
  const tableBody = document.getElementById('amortization-table-body');
  
  // Clear existing content
  if (tableBody) {
    tableBody.innerHTML = '';
    
    // Check if we have data
    if (!amortizationData || amortizationData.length === 0) {
      console.error("No amortization data to display");
      tableBody.innerHTML = '<tr><td colspan="5">No data available</td></tr>';
      return;
    }
    
    // Add rows to the table
    amortizationData.forEach(yearData => {
      const row = document.createElement('tr');
      
      // Add cells for each data point
      row.innerHTML = `
        <td>${yearData.year}</td>
        <td>$${Number(yearData.principalPaid).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td>$${Number(yearData.interestPaid).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td>$${Number(yearData.totalPaid).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td>$${Number(yearData.remainingBalance).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
      `;
      
      tableBody.appendChild(row);
    });
    
    console.log("Amortization table populated successfully");
  } else {
    console.error("Amortization table body element not found");
  }
}

// Fixed calculate function to ensure amortization schedule is populated
function calculateMortgage() {
  console.log("Calculate mortgage function called");
  
  // Get input values
  const homePrice = parseFloat(document.getElementById('home-price').value) || 0;
  const downPaymentAmount = parseFloat(document.getElementById('down-payment-amount').value) || 0;
  const loanTerm = parseInt(document.getElementById('loan-term').value) || 30;
  const interestRate = parseFloat(document.getElementById('interest-rate').value) || 0;
  const propertyTax = parseFloat(document.getElementById('property-tax').value) || 0;
  const homeInsurance = parseFloat(document.getElementById('home-insurance').value) || 0;
  const hoaFees = parseFloat(document.getElementById('hoa-fees').value) || 0;
  const extraPayment = parseFloat(document.getElementById('extra-payment').value) || 0;
  
  console.log("Input values:", {
    homePrice,
    downPaymentAmount,
    loanTerm,
    interestRate,
    propertyTax,
    homeInsurance,
    hoaFees,
    extraPayment
  });
  
  // Calculate loan amount
  const loanAmount = homePrice - downPaymentAmount;
  
  // Calculate monthly principal and interest payment
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;
  
  let monthlyPayment = 0;
  if (interestRate > 0) {
    monthlyPayment = loanAmount * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  } else {
    monthlyPayment = loanAmount / numberOfPayments;
  }
  
  // Calculate monthly property tax and insurance
  const monthlyPropertyTax = propertyTax / 12;
  const monthlyHomeInsurance = homeInsurance / 12;
  
  // Calculate PMI (Private Mortgage Insurance) if down payment is less than 20%
  const downPaymentPercent = (downPaymentAmount / homePrice) * 100;
  let monthlyPMI = 0;
  if (downPaymentPercent < 20) {
    monthlyPMI = (loanAmount * 0.005) / 12; // Assuming 0.5% annual PMI rate
  }
  
  // Calculate total monthly payment
  const totalMonthlyPayment = monthlyPayment + monthlyPropertyTax + monthlyHomeInsurance + monthlyPMI + hoaFees;
  
  // Update results in the UI
  document.getElementById('principal-interest').textContent = '$' + monthlyPayment.toFixed(2);
  document.getElementById('property-tax-result').textContent = '$' + monthlyPropertyTax.toFixed(2);
  document.getElementById('home-insurance-result').textContent = '$' + monthlyHomeInsurance.toFixed(2);
  document.getElementById('pmi-result').textContent = '$' + monthlyPMI.toFixed(2);
  document.getElementById('hoa-fees-result').textContent = '$' + hoaFees.toFixed(2);
  document.getElementById('total-payment').textContent = '$' + totalMonthlyPayment.toFixed(2);
  
  // Update loan summary
  document.getElementById('loan-amount').textContent = '$' + loanAmount.toFixed(2);
  
  // Calculate total interest paid
  const totalInterest = (monthlyPayment * numberOfPayments) - loanAmount;
  document.getElementById('total-interest').textContent = '$' + totalInterest.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  
  // Calculate total cost of loan
  const totalCost = loanAmount + totalInterest;
  document.getElementById('total-cost').textContent = '$' + totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  
  // Calculate payoff date
  const startDate = new Date(document.getElementById('loan-start-date').value);
  if (!isNaN(startDate.getTime())) {
    const payoffDate = new Date(startDate);
    payoffDate.setMonth(payoffDate.getMonth() + numberOfPayments);
    const options = { month: 'long', year: 'numeric' };
    document.getElementById('payoff-date').textContent = payoffDate.toLocaleDateString('en-US', options);
  }
  
  // Generate and populate amortization schedule
  const amortizationData = generateAmortizationSchedule(loanAmount, interestRate, loanTerm, extraPayment);
  populateAmortizationTable(amortizationData);
  
  // Show results section
  document.getElementById('results').style.display = 'block';
  
  // Ensure the amortization table is visible
  const amortizationSection = document.getElementById('amortization-section');
  if (amortizationSection) {
    amortizationSection.style.display = 'block';
  }
  
  console.log("Mortgage calculation completed successfully");
  return false; // Prevent form submission
}

// Make sure the DOM is fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded, initializing mortgage calculator");
  
  // Get the form and attach the calculate function to its submit event
  const calculatorForm = document.getElementById('mortgage-calculator-form');
  if (calculatorForm) {
    calculatorForm.addEventListener('submit', function(e) {
      e.preventDefault();
      calculateMortgage();
    });
    
    // Also attach to the calculate button directly
    const calculateButton = document.getElementById('calculate-button');
    if (calculateButton) {
      calculateButton.addEventListener('click', function(e) {
        e.preventDefault();
        calculateMortgage();
      });
    }
    
    // Initialize form with current date for loan start date
    const loanStartDateInput = document.getElementById('loan-start-date');
    if (loanStartDateInput) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      loanStartDateInput.value = `${year}-${month}`;
    }
    
    // Link down payment amount and percentage
    const homePrice = document.getElementById('home-price');
    const downPaymentAmount = document.getElementById('down-payment-amount');
    const downPaymentPercent = document.getElementById('down-payment-percent');
    
    if (homePrice && downPaymentAmount && downPaymentPercent) {
      // Update percentage when amount changes
      downPaymentAmount.addEventListener('input', function() {
        const amount = parseFloat(this.value) || 0;
        const price = parseFloat(homePrice.value) || 0;
        if (price > 0) {
          const percent = (amount / price) * 100;
          downPaymentPercent.value = percent.toFixed(1);
        }
      });
      
      // Update amount when percentage changes
      downPaymentPercent.addEventListener('input', function() {
        const percent = parseFloat(this.value) || 0;
        const price = parseFloat(homePrice.value) || 0;
        const amount = (percent / 100) * price;
        downPaymentAmount.value = amount.toFixed(0);
      });
      
      // Update both when home price changes
      homePrice.addEventListener('input', function() {
        const price = parseFloat(this.value) || 0;
        const percent = parseFloat(downPaymentPercent.value) || 0;
        const amount = (percent / 100) * price;
        downPaymentAmount.value = amount.toFixed(0);
      });
    }
    
    // Perform initial calculation to show default values
    calculateMortgage();
  } else {
    console.error("Mortgage calculator form not found");
  }
});
