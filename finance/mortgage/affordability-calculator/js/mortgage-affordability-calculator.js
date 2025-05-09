document.addEventListener("DOMContentLoaded", function () {
    // Event listeners for input fields can be added here if needed for real-time feedback
    // or to trigger calculations automatically on input change.
});

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
    if (interestRateAnnual <= 0 || interestRateAnnual > 30) { // Basic check for interest rate
        alert("Please enter a valid interest rate.");
        return;
    }
    if (loanTermYears <= 0 || loanTermYears > 50) { // Basic check for loan term
        alert("Please enter a valid loan term.");
        return;
    }

    // --- Calculations ---
    const grossMonthlyIncome = annualIncome / 12;

    // Lender guidelines (can be adjusted)
    const maxFrontEndRatio = 0.28; // Max housing payment as % of GMI
    const maxBackEndRatio = 0.36;  // Max total debt as % of GMI (some lenders go higher, e.g., 0.43)

    // Calculate affordable monthly housing payment based on DTI ratios
    const maxHousingPaymentByFrontEnd = grossMonthlyIncome * maxFrontEndRatio;
    const maxHousingPaymentByBackEnd = (grossMonthlyIncome * maxBackEndRatio) - monthlyDebts;

    // The lower of the two determines the max affordable PITI + HOA
    let affordableMonthlyPITIAndHOA = Math.min(maxHousingPaymentByFrontEnd, maxHousingPaymentByBackEnd);

    if (affordableMonthlyPITIAndHOA <= 0) {
        document.getElementById("maxHomePrice").textContent = "N/A (Income or DTI too low)";
        document.getElementById("monthlyPayment").textContent = "N/A";
        document.getElementById("frontEndRatio").textContent = "N/A";
        document.getElementById("backEndRatio").textContent = "N/A";
        document.getElementById("results-section").style.display = "block";
        alert("Based on the provided income and debts, the affordable monthly payment is too low or negative. Please review your inputs.");
        return;
    }

    // Subtract HOA fees to get affordable PITI
    const affordableMonthlyPITI = affordableMonthlyPITIAndHOA - hoaFeesMonthly;

    if (affordableMonthlyPITI <= 0) {
        document.getElementById("maxHomePrice").textContent = "N/A (HOA fees exceed affordable housing payment)";
        document.getElementById("monthlyPayment").textContent = "N/A";
        document.getElementById("frontEndRatio").textContent = "N/A";
        document.getElementById("backEndRatio").textContent = "N/A";
        document.getElementById("results-section").style.display = "block";
        alert("The HOA fees exceed the calculated affordable monthly housing payment. Please review your inputs.");
        return;
    }

    // Estimate property tax and insurance monthly payment from the PITI portion
    // This is an iterative process or a simplification. For simplicity, we estimate based on a target home price.
    // To find the affordable home price, we need to work backwards from the affordable PITI.
    // PITI = P + I + T + I_ins
    // P + I = M = L * [r(1+r)^n] / [(1+r)^n-1]
    // T = (HomePrice * propertyTaxRateAnnual / 100) / 12
    // I_ins = homeownersInsuranceAnnual / 12 (This is a fixed annual amount in the input, not a % of home price)

    const monthlyInsurance = homeownersInsuranceAnnual / 12;
    const monthlyInterestRate = (interestRateAnnual / 100) / 12;
    const numberOfPayments = loanTermYears * 12;

    // Affordable Principal & Interest (P&I) payment
    // To find this, we need to estimate the monthly tax based on an *unknown* home price.
    // Let HP = Home Price. Monthly Tax = HP * (propertyTaxRateAnnual / 100) / 12
    // affordableMonthlyPITI = P_and_I + HP * (propertyTaxRateAnnual / 100) / 12 + monthlyInsurance
    // P_and_I = affordableMonthlyPITI - monthlyInsurance - HP * (propertyTaxRateAnnual / 100) / 12

    // To solve for HP, we use an iterative approach or a formula rearrangement.
    // Max Loan Amount (L) = P_and_I * [(1+r)^n - 1] / [r(1+r)^n]
    // Home Price (HP) = Max Loan Amount + Down Payment

    // Iterative approach to find home price:
    let maxAffordableHomePrice = 0;
    let estimatedMonthlyPayment = 0;

    // Start with a guess for P&I based on affordablePITI minus a rough estimate for T&I
    // This is a simplified iterative approach. A more robust solution might use a goal-seek algorithm.
    for (let estimatedHomePrice = downPayment + 50000; estimatedHomePrice < annualIncome * 10; estimatedHomePrice += 1000) {
        const monthlyPropertyTax = (estimatedHomePrice * (propertyTaxRateAnnual / 100)) / 12;
        const currentPITI = affordableMonthlyPITI; // Target PITI

        const affordablePrincipalAndInterest = currentPITI - monthlyPropertyTax - monthlyInsurance;

        if (affordablePrincipalAndInterest <= 0) continue;

        let loanAmount = 0;
        if (monthlyInterestRate > 0) {
            loanAmount = affordablePrincipalAndInterest * (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1) / (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments));
        } else { // For 0% interest rate
            loanAmount = affordablePrincipalAndInterest * numberOfPayments;
        }

        const calculatedHomePrice = loanAmount + downPayment;

        if (calculatedHomePrice >= estimatedHomePrice - 500 && calculatedHomePrice <= estimatedHomePrice + 500) { // Found a close match
            maxAffordableHomePrice = Math.max(0, Math.floor(calculatedHomePrice));
            estimatedMonthlyPayment = currentPITI; // This is the PITI we aimed for
            break;
        }
        if (calculatedHomePrice > estimatedHomePrice) {
             // If we can afford more than current estimate, try higher
        } else {
            // If we afford less, the previous step was closer or this is the best we can do.
            // This simple iteration might not be perfect, but gives an estimate.
            // A more common approach is to directly solve for HP:
            // HP = ( (AffordablePITI - monthlyInsurance) * 12 * 100 / propertyTaxRateAnnual + DownPayment * (r(1+r)^n / ((1+r)^n-1)) ) / (1 + (r(1+r)^n / ((1+r)^n-1)) * 12 * 100 / propertyTaxRateAnnual)
            // This gets complex. The iterative approach is simpler to implement here.
            // For a more direct calculation without iteration:
            // Let M_pi = P&I payment. M_piti = P&I + T + I_ins.
            // T = HP * tax_rate_monthly. I_ins = fixed_insurance_monthly.
            // M_pi = M_piti - (HP * tax_rate_monthly) - fixed_insurance_monthly.
            // HP - DP = L = M_pi / ( r(1+r)^n / ((1+r)^n-1) ). Let K = ( r(1+r)^n / ((1+r)^n-1) ).
            // HP - DP = (M_piti - (HP * tax_rate_monthly) - fixed_insurance_monthly) / K
            // K(HP - DP) = M_piti - HP * tax_rate_monthly - fixed_insurance_monthly
            // K*HP - K*DP = M_piti - HP * tax_rate_monthly - fixed_insurance_monthly
            // K*HP + HP * tax_rate_monthly = M_piti + K*DP - fixed_insurance_monthly
            // HP * (K + tax_rate_monthly) = M_piti + K*DP - fixed_insurance_monthly
            // HP = (M_piti + K*DP - fixed_insurance_monthly) / (K + tax_rate_monthly)

            const K_factor_numerator = monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments);
            const K_factor_denominator = Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1;
            let K_factor = 0;
            if (K_factor_denominator > 0 && monthlyInterestRate > 0) {
                 K_factor = K_factor_numerator / K_factor_denominator;
            } else if (monthlyInterestRate === 0 && numberOfPayments > 0) {
                K_factor = 1 / numberOfPayments; // if interest is 0, P&I is L/n
            } else {
                // handle error or edge case, for now assume valid inputs lead to K_factor_denominator > 0
            }

            const monthlyPropertyTaxRate = (propertyTaxRateAnnual / 100) / 12;

            if (K_factor + monthlyPropertyTaxRate > 0) {
                 maxAffordableHomePrice = (affordableMonthlyPITI - monthlyInsurance + (K_factor * downPayment)) / (K_factor + monthlyPropertyTaxRate);
                 maxAffordableHomePrice = Math.max(0, Math.floor(maxAffordableHomePrice));
            } else {
                maxAffordableHomePrice = downPayment; // Cannot afford more than downpayment if K_factor + monthlyPropertyTaxRate is not positive
            }

            // Recalculate PITI based on this home price
            const finalLoanAmount = maxAffordableHomePrice - downPayment;
            let finalMonthlyPandI = 0;
            if (finalLoanAmount > 0) {
                if (monthlyInterestRate > 0) {
                    finalMonthlyPandI = finalLoanAmount * K_factor;
                } else {
                    finalMonthlyPandI = finalLoanAmount / numberOfPayments;
                }
            }
            const finalMonthlyPropertyTax = (maxAffordableHomePrice * (propertyTaxRateAnnual / 100)) / 12;
            estimatedMonthlyPayment = finalMonthlyPandI + finalMonthlyPropertyTax + monthlyInsurance + hoaFeesMonthly;
            break; // Exit loop after direct calculation
        }
    }
     if (maxAffordableHomePrice === 0 && downPayment > 0 && affordableMonthlyPITI > monthlyInsurance + hoaFeesMonthly) {
        // Fallback if loop didn't converge, try direct calculation
        const K_factor_numerator = monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments);
        const K_factor_denominator = Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1;
        let K_factor = 0;
        if (K_factor_denominator > 0 && monthlyInterestRate > 0) {
             K_factor = K_factor_numerator / K_factor_denominator;
        } else if (monthlyInterestRate === 0 && numberOfPayments > 0) {
            K_factor = 1 / numberOfPayments;
        }

        const monthlyPropertyTaxRate = (propertyTaxRateAnnual / 100) / 12;
        if (K_factor + monthlyPropertyTaxRate > 0) {
             maxAffordableHomePrice = (affordableMonthlyPITI - monthlyInsurance + (K_factor * downPayment)) / (K_factor + monthlyPropertyTaxRate);
             maxAffordableHomePrice = Math.max(0, Math.floor(maxAffordableHomePrice));
        } else {
            maxAffordableHomePrice = downPayment;
        }
        const finalLoanAmount = maxAffordableHomePrice - downPayment;
        let finalMonthlyPandI = 0;
        if (finalLoanAmount > 0) {
            if (monthlyInterestRate > 0) {
                finalMonthlyPandI = finalLoanAmount * K_factor;
            } else {
                finalMonthlyPandI = finalLoanAmount / numberOfPayments;
            }
        }
        const finalMonthlyPropertyTax = (maxAffordableHomePrice * (propertyTaxRateAnnual / 100)) / 12;
        estimatedMonthlyPayment = finalMonthlyPandI + finalMonthlyPropertyTax + monthlyInsurance + hoaFeesMonthly;
    }


    // Calculate actual DTI ratios based on the estimated monthly payment
    const actualFrontEndRatio = (estimatedMonthlyPayment / grossMonthlyIncome) * 100;
    const actualBackEndRatio = ((estimatedMonthlyPayment + monthlyDebts) / grossMonthlyIncome) * 100;

    // Display results
    document.getElementById("maxHomePrice").textContent = `$${maxAffordableHomePrice.toLocaleString()}`;
    document.getElementById("monthlyPayment").textContent = `$${Math.round(estimatedMonthlyPayment).toLocaleString()}`;
    document.getElementById("frontEndRatio").textContent = `${actualFrontEndRatio.toFixed(2)}%`;
    document.getElementById("backEndRatio").textContent = `${actualBackEndRatio.toFixed(2)}%`;

    document.getElementById("results-section").style.display = "block";
}

