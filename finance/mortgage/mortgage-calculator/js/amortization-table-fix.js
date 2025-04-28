/**
 * Amortization Table Display Fix
 * Ensures the amortization table is properly displayed and populated
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("Amortization table fix script loaded");
  
  // Create amortization table if it doesn't exist
  function ensureAmortizationTableExists() {
    console.log("Ensuring amortization table exists");
    
    const amortizationSection = document.getElementById('amortization-section');
    if (!amortizationSection) {
      console.log("Creating amortization section");
      
      // Create the section if it doesn't exist
      const resultsSection = document.getElementById('results');
      if (resultsSection) {
        const newSection = document.createElement('div');
        newSection.id = 'amortization-section';
        newSection.innerHTML = `
          <h2>Amortization Schedule</h2>
          <p>This table shows how your loan balance decreases over time as you make payments.</p>
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Principal Paid</th>
                  <th>Interest Paid</th>
                  <th>Total Paid</th>
                  <th>Remaining Balance</th>
                </tr>
              </thead>
              <tbody id="amortization-table-body">
                <!-- Table rows will be populated by JavaScript -->
              </tbody>
            </table>
          </div>
        `;
        
        resultsSection.appendChild(newSection);
        console.log("Amortization section created");
      }
    }
  }
  
  // Hook into the calculate button click event
  const calculateButton = document.getElementById('calculate-button');
  if (calculateButton) {
    console.log("Adding event listener to calculate button");
    
    calculateButton.addEventListener('click', function() {
      console.log("Calculate button clicked, ensuring table exists");
      ensureAmortizationTableExists();
      
      // Set a timeout to check if the table was populated
      setTimeout(function() {
        const tableBody = document.getElementById('amortization-table-body');
        if (tableBody && tableBody.children.length === 0) {
          console.log("Table not populated, manually triggering calculation");
          
          // Get input values
          const homePrice = parseFloat(document.getElementById('home-price').value) || 300000;
          const downPaymentAmount = parseFloat(document.getElementById('down-payment-amount').value) || 60000;
          const loanTerm = parseInt(document.getElementById('loan-term').value) || 30;
          const interestRate = parseFloat(document.getElementById('interest-rate').value) || 4.5;
          const extraPayment = parseFloat(document.getElementById('extra-payment').value) || 0;
          
          // Calculate loan amount
          const loanAmount = homePrice - downPaymentAmount;
          
          // Generate amortization data
          const amortizationData = generateAmortizationSchedule(loanAmount, interestRate, loanTerm, extraPayment);
          
          // Populate the table
          populateAmortizationTable(amortizationData);
        }
      }, 500);
    });
  }
  
  // Also hook into form submission
  const calculatorForm = document.getElementById('mortgage-calculator-form');
  if (calculatorForm) {
    console.log("Adding event listener to calculator form");
    
    calculatorForm.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log("Form submitted, ensuring table exists");
      ensureAmortizationTableExists();
    });
  }
  
  // Initial check for table
  ensureAmortizationTableExists();
  
  console.log("Amortization table fix initialization complete");
});
