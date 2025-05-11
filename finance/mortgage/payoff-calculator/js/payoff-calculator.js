document.addEventListener("DOMContentLoaded", function () {
    // --- Get references to DOM elements ---
    const calculatorForm = document.getElementById("payoffCalculatorForm");
    const calculateButton = document.getElementById("calculateButton");
    const resultsSection = document.getElementById("resultsSection");

    // Input Fields
    const originalLoanAmountEl = document.getElementById("originalLoanAmount");
    const annualInterestRateEl = document.getElementById("annualInterestRate");
    const originalLoanTermEl = document.getElementById("originalLoanTerm");
    const loanStartDateEl = document.getElementById("loanStartDate"); // YYYY-MM
    const currentOutstandingBalanceEl = document.getElementById("currentOutstandingBalance");

    const extraMonthlyPaymentEl = document.getElementById("extraMonthlyPayment");
    const extraAnnualPaymentEl = document.getElementById("extraAnnualPayment");
    const extraAnnualPaymentMonthEl = document.getElementById("extraAnnualPaymentMonth"); // 1-12
    const oneTimeExtraPaymentEl = document.getElementById("oneTimeExtraPayment");
    const oneTimeExtraPaymentDateEl = document.getElementById("oneTimeExtraPaymentDate"); // YYYY-MM
    const extraPaymentsStartDateEl = document.getElementById("extraPaymentsStartDate"); // YYYY-MM

    // Output Fields
    const originalPayoffDateEl = document.getElementById("originalPayoffDate");
    const newPayoffDateEl = document.getElementById("newPayoffDate");
    const timeSavedEl = document.getElementById("timeSaved");
    const totalInterestOriginalEl = document.getElementById("totalInterestOriginal");
    const totalInterestNewEl = document.getElementById("totalInterestNew");
    const totalInterestSavingsEl = document.getElementById("totalInterestSavings");
    const amortizationTableBodyEl = document.getElementById("amortizationTableBody");

    // --- Helper Functions ---
    function parseFloatSafe(value) {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    }

    function formatDate(date) {
        if (!date || !(date instanceof Date) || isNaN(date)) return "-";
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${year}-${month}`;
    }
    
    function formatCurrency(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) return "-";
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    function calculateMonthlyPayment(principal, annualRate, termYears) {
        if (principal <= 0 || annualRate < 0 || termYears <= 0) return 0;
        const monthlyRate = annualRate / 100 / 12;
        if (monthlyRate === 0) return principal / (termYears * 12); // Interest-free
        const numberOfPayments = termYears * 12;
        return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    function parseDateFromYYYYMM(yyyymm) {
        if (!yyyymm || yyyymm.split('-').length !== 2) return null;
        const [year, month] = yyyymm.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, 1); // Day is 1st of month
    }
    
    // --- Main Calculation Logic ---
    function performCalculation() {
        // 1. Get Input Values
        const loanAmount = parseFloatSafe(originalLoanAmountEl.value);
        const annualRate = parseFloatSafe(annualInterestRateEl.value);
        const loanTermYears = parseInt(originalLoanTermEl.value);
        const loanStartDate = parseDateFromYYYYMM(loanStartDateEl.value);

        let currentBalanceOpt = parseFloatSafe(currentOutstandingBalanceEl.value);
        
        const extraMonthly = parseFloatSafe(extraMonthlyPaymentEl.value);
        const extraAnnual = parseFloatSafe(extraAnnualPaymentEl.value);
        const extraAnnualMonth = parseInt(extraAnnualPaymentMonthEl.value); // 1-12
        const oneTimePayment = parseFloatSafe(oneTimeExtraPaymentEl.value);
        const oneTimePaymentDate = parseDateFromYYYYMM(oneTimeExtraPaymentDateEl.value);
        let extraPaymentsStartDate = parseDateFromYYYYMM(extraPaymentsStartDateEl.value);

        // 2. Validate Inputs
        if (loanAmount <= 0 || annualRate < 0 || loanTermYears <= 0 || !loanStartDate) {
            alert("Please fill in all required mortgage information fields with valid values (Loan Amount, Interest Rate, Term, Start Date).");
            return;
        }
        if (annualRate > 50) { // Arbitrary high rate check
             alert("Please enter a realistic annual interest rate.");
            return;
        }
         if (oneTimePayment > 0 && !oneTimePaymentDate) {
            alert("Please provide a date for the one-time extra payment.");
            return;
        }
        if (!extraPaymentsStartDate) {
            extraPaymentsStartDate = new Date(loanStartDate); // Default to loan start date
        }


        const monthlyRate = annualRate / 100 / 12;
        let initialMonthlyPayment = calculateMonthlyPayment(loanAmount, annualRate, loanTermYears);

        // --- Scenario 1: Original Loan ---
        let originalResults = calculateAmortization(loanAmount, annualRate, loanTermYears, loanStartDate, initialMonthlyPayment, currentBalanceOpt, {});
        
        // --- Scenario 2: Loan with Extra Payments ---
        const extraPaymentDetails = {
            monthly: extraMonthly,
            annual: extraAnnual,
            annualMonth: extraAnnualMonth, // 1-12
            oneTime: oneTimePayment,
            oneTimeDate: oneTimePaymentDate,
            startDate: extraPaymentsStartDate
        };
        let newResults = calculateAmortization(loanAmount, annualRate, loanTermYears, loanStartDate, initialMonthlyPayment, currentBalanceOpt, extraPaymentDetails);

        // 4. Update Output Display Elements
        originalPayoffDateEl.textContent = formatDate(originalResults.payoffDate);
        totalInterestOriginalEl.textContent = formatCurrency(originalResults.totalInterestPaid);

        newPayoffDateEl.textContent = formatDate(newResults.payoffDate);
        totalInterestNewEl.textContent = formatCurrency(newResults.totalInterestPaid);
        
        const interestSavings = originalResults.totalInterestPaid - newResults.totalInterestPaid;
        totalInterestSavingsEl.textContent = formatCurrency(interestSavings > 0 ? interestSavings : 0);

        if (originalResults.payoffDate && newResults.payoffDate) {
            let yearsSaved = originalResults.payoffDate.getFullYear() - newResults.payoffDate.getFullYear();
            let monthsSaved = originalResults.payoffDate.getMonth() - newResults.payoffDate.getMonth();
            if (monthsSaved < 0) {
                yearsSaved--;
                monthsSaved += 12;
            }
            if (yearsSaved < 0) { // New loan is longer
                timeSavedEl.textContent = "Loan term extended";
            } else {
                 timeSavedEl.textContent = `${yearsSaved} Year(s), ${monthsSaved} Month(s)`;
            }
        } else {
            timeSavedEl.textContent = "-";
        }

        // 5. Display Amortization Table
        displayAmortizationTable(originalResults.schedule, newResults.schedule);

        // 6. Show the results section
        resultsSection.style.display = "block";
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function calculateAmortization(principal, annualRate, termYears, loanStartDate, baseMonthlyPayment, currentBalanceOpt, extras) {
        let balance = principal;
        let monthlyRate = annualRate / 100 / 12;
        let payments = termYears * 12;
        
        let totalInterestPaid = 0;
        let schedule = [];
        let currentDate = new Date(loanStartDate);

        let effectiveMonthlyPayment = baseMonthlyPayment;

        // Adjust if currentOutstandingBalance is provided
        let paymentsMadeCount = 0;
        if (currentBalanceOpt > 0 && currentBalanceOpt < principal) {
            // Estimate payments made to reach current balance
            // This is a simplification. A more accurate approach would re-calculate based on remaining term from "now".
            // For this version, we assume the provided start date is the true start, and current balance implies some payments were made.
            // We will start tracking from the loanStartDate, but if the extraPaymentsStartDate is in the future, extras will only apply then.
            balance = currentBalanceOpt; // Start with current balance if provided.
            
            // Estimate how many payments were made to get to this balance.
            // This requires iterating from loan start to "today" or assuming extraPaymentsStartDate is "today"
            // For simplicity, if currentBalanceOpt is given, we assume this is the balance AT the extraPaymentsStartDate or loanStartDate if earlier.
            // More complex logic might be needed if user wants to see history before current balance.

            // If current balance is provided, assume we are starting calculations from loanStartDate (or extraPaymentsStartDate if later and balance applies there)
            // The effective number of payments *remaining* from this point is what matters.
            // Let's recalculate the monthly payment if currentBalance is given and loanStartDate is in the past
            // This is a complex part if we want to truly reflect a loan in progress.
            // For now, if currentBalanceOpt is provided, we assume it's the balance at the *effective* start of our simulation (loanStartDate or extras.startDate).
            // The baseMonthlyPayment may need to be recalculated based on the currentOutstandingBalance and *remaining* term.
            
            // Simplified approach: If currentBalanceOpt is used, assume it's the balance at loanStartDate for calculation purposes,
            // implying the user wants to see the projection from this point forward.
            // A more robust solution would involve calculating remaining term from current date.
            // The current spec is a bit ambiguous on this. Let's assume currentBalanceOpt is the starting point of simulation if provided.
            if(currentBalanceOpt !== principal && currentDate < new Date()){ // If loan has started and current balance is different
                 // We'd need to know the *remaining* term accurately or current date to calculate payment for given balance
                 // For now, we use the initial monthly payment, but this could be inaccurate if partial payments or different terms were applied.
                 // This is a point for future refinement.
            }
        }


        for (let i = 0; i < payments * 2 && balance > 0.01; i++) { // *2 to allow for longer terms due to underpayment (not typical here)
            if (i > payments && extras.monthly <= 0) { // Original term exceeded, no extras to shorten
                 if(balance > effectiveMonthlyPayment * 0.01 ) { // Still significant balance
                    //This means the initial parameters might have been off or loan longer than expected
                 }
            }

            let interestPayment = balance * monthlyRate;
            let principalPayment = effectiveMonthlyPayment - interestPayment;
            
            let currentExtraPayment = 0;
            
            // Apply extra payments only from their start date
            if (currentDate >= extras.startDate) {
                currentExtraPayment += extras.monthly || 0;

                if (extras.annual > 0 && (currentDate.getMonth() + 1) === extras.annualMonth) {
                    currentExtraPayment += extras.annual || 0;
                }
            }
            // One-time payment check needs to be careful about month/year matching
            if (extras.oneTime > 0 && extras.oneTimeDate && 
                currentDate.getFullYear() === extras.oneTimeDate.getFullYear() &&
                currentDate.getMonth() === extras.oneTimeDate.getMonth()) {
                currentExtraPayment += extras.oneTime || 0;
                extras.oneTime = 0; // Apply only once
            }

            principalPayment += currentExtraPayment;
            if (principalPayment < 0) principalPayment = 0; // Avoid negative principal payment if interest is very high / payment low

            if (balance < (principalPayment + interestPayment - currentExtraPayment)) { // Final payment adjustment
                principalPayment = balance;
                effectiveMonthlyPayment = principalPayment + interestPayment - currentExtraPayment; // Total payment becomes what's needed
            }
            
            balance -= principalPayment;
            totalInterestPaid += interestPayment;

            schedule.push({
                month: i + 1,
                date: formatDate(currentDate),
                payment: effectiveMonthlyPayment + currentExtraPayment, // Total outflow for "new" schedule
                standardPayment: effectiveMonthlyPayment, // Base payment for "original" schedule comparison
                interest: interestPayment,
                principal: principalPayment - currentExtraPayment, // Principal from standard payment
                extra: currentExtraPayment,
                balance: balance < 0.01 ? 0 : balance // Ensure balance doesn't go negative small amounts
            });

            if (balance <= 0.01) {
                break;
            }

            currentDate.setMonth(currentDate.getMonth() + 1);
             if (i > payments * 1.5 && balance > 0.01) { // Safety break for very long calculation
                console.warn("Breaking amortization early, potential issue with parameters.");
                break;
            }
        }
        
        return {
            schedule: schedule,
            totalInterestPaid: totalInterestPaid,
            payoffDate: balance <= 0.01 ? new Date(currentDate) : null, // Payoff date is the month *after* the last payment
            totalPayments: schedule.length
        };
    }

    function displayAmortizationTable(originalSchedule, newSchedule) {
        amortizationTableBodyEl.innerHTML = ""; // Clear previous results
        const maxLength = Math.max(originalSchedule.length, newSchedule.length);

        for (let i = 0; i < maxLength; i++) {
            const row = amortizationTableBodyEl.insertRow();
            const orig = originalSchedule[i] || {};
            const newS = newSchedule[i] || {};

            row.insertCell().textContent = i + 1; // Payment #
            row.insertCell().textContent = newS.date || orig.date || '-'; // Date (use new schedule date if available)

            // Original Loan Columns
            row.insertCell().textContent = formatCurrency(orig.standardPayment);
            row.insertCell().textContent = formatCurrency(orig.interest);
            row.insertCell().textContent = formatCurrency(orig.principal);
            row.insertCell().textContent = formatCurrency(orig.balance);

            // New Loan Columns
            row.insertCell().textContent = formatCurrency(newS.extra);
            row.insertCell().textContent = formatCurrency(newS.standardPayment + newS.extra); // Total payment
            row.insertCell().textContent = formatCurrency(newS.interest);
            row.insertCell().textContent = formatCurrency(newS.principal + newS.extra); // Total principal reduction
            row.insertCell().textContent = formatCurrency(newS.balance);
        }
    }

    // --- Event Listeners ---
    if (calculateButton) {
        calculateButton.addEventListener("click", function (event) {
            event.preventDefault(); 
            performCalculation();
        });
    }

    if (calculatorForm) {
        calculatorForm.addEventListener("reset", function() {
            resultsSection.style.display = "none";
            originalPayoffDateEl.textContent = "-";
            newPayoffDateEl.textContent = "-";
            timeSavedEl.textContent = "-";
            totalInterestOriginalEl.textContent = "-";
            totalInterestNewEl.textContent = "-";
            totalInterestSavingsEl.textContent = "-";
            amortizationTableBodyEl.innerHTML = "";
            // Reset any chart placeholders if they were populated
            document.getElementById('loanBalanceChartPlaceholder').innerHTML = '<p>Loan Balance Over Time Chart (to be implemented)</p>';
            document.getElementById('interestPrincipalChartPlaceholder').innerHTML = '<p>Total Principal vs. Interest Chart (to be implemented)</p>';
        });
    }
});
