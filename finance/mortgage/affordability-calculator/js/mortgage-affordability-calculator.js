// finance/mortgage/affordability-calculator/js/mortgage-affordability-calculator.js

// Wait for the DOM to be fully loaded before querying elements
document.addEventListener("DOMContentLoaded", () => {
  const calculateBtn = document.getElementById("calculateAffordabilityButton");
  const resetBtn     = document.getElementById("resetButton");
  const resultsSec   = document.getElementById("results-section");

  if (!calculateBtn || !resetBtn || !resultsSec) {
    console.error(
      "Affordability Calculator: missing DOM elements",
      { calculateBtn, resetBtn, resultsSec }
    );
    return;
  }

  // When you click Calculate, run the affordability logic
  calculateBtn.addEventListener("click", () => {
    calculateAffordability();
    resultsSec.style.display = "block";
  });

  // When you click Reset, hide the results and clear any alerts
  resetBtn.addEventListener("click", () => {
    resultsSec.style.display = "none";
  });
});


// --- Your existing affordability‐calculation function, unchanged --- //

function calculateAffordability() {
  // Get input values
  const annualIncome = parseFloat(document.getElementById("annualIncome").value) || 0;
  const monthlyDebts = parseFloat(document.getElementById("monthlyDebts").value) || 0;
  const downPayment = parseFloat(document.getElementById("downPayment").value) || 0;
  const interestRateAnnual = parseFloat(document.getElementById("interestRate").value) || 0;
  const loanTermYears = parseInt(document.getElementById("loanTermYears").value) || 0;
  const propertyTaxRateAnnual = parseFloat(document.getElementById("propertyTaxRate").value) || 0;
  const homeownersInsuranceAnnual = parseFloat(document.getElementById("homeownersInsurance").value) || 0;
  const hoaFeesMonthly = parseFloat(document.getElementById("hoaFees").value) || 0;

  // --- Basic Validations ---
  if (annualIncome <= 0) {
    alert("Please enter a valid annual income.");
    return;
  }
  if (interestRateAnnual <= 0 || interestRateAnnual > 30) {
    alert("Please enter a valid interest rate.");
    return;
  }
  if (loanTermYears <= 0 || loanTermYears > 50) {
    alert("Please enter a valid loan term.");
    return;
  }

  // --- Calculations ---
  const grossMonthlyIncome = annualIncome / 12;
  const maxFrontEndRatio = 0.28;
  const maxBackEndRatio  = 0.36;

  const maxHousingPaymentByFrontEnd = grossMonthlyIncome * maxFrontEndRatio;
  const maxHousingPaymentByBackEnd  = (grossMonthlyIncome * maxBackEndRatio) - monthlyDebts;

  let affordableMonthlyPITIAndHOA = Math.min(
    maxHousingPaymentByFrontEnd,
    maxHousingPaymentByBackEnd
  );

  if (affordableMonthlyPITIAndHOA <= 0) {
    showNoAffordability("Income or DTI too low");
    return;
  }

  const affordableMonthlyPITI = affordableMonthlyPITIAndHOA - hoaFeesMonthly;
  if (affordableMonthlyPITI <= 0) {
    showNoAffordability("HOA fees exceed affordable payment");
    return;
  }

  const monthlyInsurance   = homeownersInsuranceAnnual / 12;
  const monthlyInterestRate= (interestRateAnnual / 100) / 12;
  const numberOfPayments   = loanTermYears * 12;

  // Direct formula approach (no loop)
  const K_numer = monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments);
  const K_denom = Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1;
  let K_factor = monthlyInterestRate === 0
    ? 1 / numberOfPayments
    : K_numer / K_denom;

  const monthlyTaxRate = (propertyTaxRateAnnual / 100) / 12;
  const M_piti = affordableMonthlyPITI;

  // Solve for HomePrice (HP):
  // HP = (M_piti - monthlyInsurance + K_factor * downPayment)
  //      / (K_factor + monthlyTaxRate)
  let maxAffordableHomePrice = 0;
  if (K_factor + monthlyTaxRate > 0) {
    maxAffordableHomePrice = Math.floor(
      (M_piti - monthlyInsurance + (K_factor * downPayment)) /
      (K_factor + monthlyTaxRate)
    );
  }

  // Calculate estimated PITI for display
  const loanAmt = maxAffordableHomePrice - downPayment;
  const P_and_I = loanAmt > 0
    ? (monthlyInterestRate > 0
        ? loanAmt * K_factor
        : loanAmt / numberOfPayments)
    : 0;

  const monthlyPropertyTax = (maxAffordableHomePrice * (propertyTaxRateAnnual / 100)) / 12;
  const estimatedMonthlyPayment = P_and_I + monthlyPropertyTax + monthlyInsurance + hoaFeesMonthly;

  // Compute ratios
  const actualFrontEndRatio = (estimatedMonthlyPayment / grossMonthlyIncome) * 100;
  const actualBackEndRatio  = ((estimatedMonthlyPayment + monthlyDebts) / grossMonthlyIncome) * 100;

  // Display results
  document.getElementById("maxHomePrice").textContent    = `$${maxAffordableHomePrice.toLocaleString()}`;
  document.getElementById("monthlyPayment").textContent  = `$${Math.round(estimatedMonthlyPayment).toLocaleString()}`;
  document.getElementById("frontEndRatio").textContent   = `${actualFrontEndRatio.toFixed(2)}%`;
  document.getElementById("backEndRatio").textContent    = `${actualBackEndRatio.toFixed(2)}%`;
  document.getElementById("results-section").style.display = "block";


  // Helper for “no affordability” cases
  function showNoAffordability(reason) {
    document.getElementById("maxHomePrice").textContent  = `N/A (${reason})`;
    document.getElementById("monthlyPayment").textContent= "N/A";
    document.getElementById("frontEndRatio").textContent = "N/A";
    document.getElementById("backEndRatio").textContent  = "N/A";
    document.getElementById("results-section").style.display = "block";
    alert(`Calculation error: ${reason}`);
  }
}
