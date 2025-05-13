document.addEventListener("DOMContentLoaded", function () {
    // --- DOM Element References ---
    const calculatorForm = document.getElementById("biweeklyCalculatorForm");
    const calculateButton = document.getElementById("calculateButton");
    const resultsSection = document.getElementById("resultsSection");

    // Inputs
    const loanAmountEl = document.getElementById("loanAmount");
    const annualInterestRateEl = document.getElementById("annualInterestRate");
    const originalLoanTermEl = document.getElementById("originalLoanTerm");
    const loanStartDateEl = document.getElementById("loanStartDate");
    const annualPropertyTaxesEl = document.getElementById("annualPropertyTaxes");
    const annualHomeInsuranceEl = document.getElementById("annualHomeInsurance");

    // Outputs
    const standardMonthlyPaymentEl = document.getElementById("standardMonthlyPayment");
    const biweeklyPaymentAmountEl = document.getElementById("biweeklyPaymentAmount");
    const originalPayoffDateEl = document.getElementById("originalPayoffDate");
    const newPayoffDateEl = document.getElementById("newPayoffDate");
    const timeSavedEl = document.getElementById("timeSaved");
    const totalInterestMonthlyEl = document.getElementById("totalInterestMonthly");
    const totalInterestBiweeklyEl = document.getElementById("totalInterestBiweekly");
    const totalInterestSavingsEl = document.getElementById("totalInterestSavings");
    
    const pitiResultsEl = document.getElementById("pitiResults");
    const monthlyPITIEl = document.getElementById("monthlyPITI");
    const biweeklyPITIEl = document.getElementById("biweeklyPITI");

    const monthlyAmortizationTableBodyEl = document.getElementById("monthlyAmortizationTableBody");
    const biweeklyAmortizationTableBodyEl = document.getElementById("biweeklyAmortizationTableBody");

    // --- Helper Functions ---
    function parseFloatSafe(value, defaultValue = 0) {
        const num = parseFloat(value);
        return isNaN(num) ? defaultValue : num;
    }

    function formatDate(date) {
        if (!date || !(date instanceof Date) || isNaN(date.valueOf())) return "-";
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${year}-${month}`;
    }
    
    function formatCurrency(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) return "-";
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    function parseDateFromYYYYMM(yyyymm) {
        if (!yyyymm || yyyymm.split('-').length !== 2) return null;
        const [year, month] = yyyymm.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, 1); // Day is 1st of month
    }

    function calculateMonthlyPandI(principal, annualRate, termYears) {
        if (principal <= 0 || annualRate < 0 || termYears <= 0) return 0;
        const monthlyRate = annualRate / 100 / 12;
        if (monthlyRate === 0) return principal / (termYears * 12);
        const numberOfPayments = termYears * 12;
        return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    // --- Amortization Calculation Function ---
    function generateAmortizationSchedule(principal, annualRate, termYears, startDate, monthlyPandI, isBiweekly = false) {
        let balance = principal;
        const monthlyInterestRate = annualRate / 100 / 12;
        let currentDate = new Date(startDate); // Clone to avoid modifying original
        const schedule = [];
        let totalInterestPaid = 0;
        let paymentNumber = 0;

        const biweeklyPayment = monthlyPandI / 2;
        const paymentsPerYear = isBiweekly ? 26 : 12;
        const maxPayments = termYears * paymentsPerYear * 1.5; // Safety break

        for (let i = 0; i < maxPayments && balance > 0.005; i++) {
            paymentNumber++;
            let interestForPeriod;
            let principalForPeriod;
            let paymentForPeriod;

            if (isBiweekly) {
                // For biweekly, interest accrues for approx 1/26th of a year, or roughly for 2 weeks.
                // A common simplification is to calculate interest based on monthly rate / 2, or more accurately, daily rate * 14.
                // Or, calculate monthly interest and divide by 2 if payment is exactly half monthly.
                // For this model, true biweekly application of principal:
                // Interest for two weeks: balance * (annualRate / 100 / 365.25 * 14) - can be complex with varying days.
                // Simpler: Assume interest accrues monthly, but principal is paid down more frequently.
                // The "13th payment" effect is key.
                // Let's model it as 26 payments, where each payment reduces principal.
                // Interest for a biweekly period is approx. balance * (monthlyInterestRate / 2)
                // This is an approximation. A more precise method would use daily compounding or more complex interest period calculations.
                // For simplicity and common understanding of biweekly effect (1 extra payment):
                // We'll run it as if 13 monthly payments are made, but spread out.
                // A true biweekly means payment is made every 2 weeks.
                
                // Let's use the 13-payment-a-year model by effectively adding 1/12 of a payment extra each month,
                // but paid in biweekly installments.
                // Or, more simply, calculate a monthly schedule with an extra payment, then derive biweekly.
                // No, the true biweekly effect is paying principal down slightly faster *within* the month.

                // Recalculate for true biweekly:
                // Interest for 2 weeks: balance * (annualRate / 100 / 26) - approximation
                // This gets complex because interest is usually compounded monthly by lenders.
                // The common understanding: 26 half-payments means one extra *monthly* payment per year.
                // We'll simulate it by making 26 payments.
                
                paymentForPeriod = biweeklyPayment;
                // Calculate interest for the 2-week period. A common way is to take monthly interest / 2.
                // However, lenders usually compound monthly. The benefit comes from the extra principal payment.
                // So, we'll model it as making 26 payments.
                // On the 13th and 26th biweekly payment, it completes a "full" monthly cycle for interest calculation.
                
                // Simplified model for biweekly:
                // Each month, two biweekly payments are made. The "13th" payment effect comes from the sum of 26 biweekly payments.
                // Let's simulate a standard monthly amortization but with an accelerated principal reduction.
                // This is tricky. The most common effect is 13 full payments.
                // We will simulate it by making 26 payments, each being half of monthly P&I.
                // Interest is still calculated based on the outstanding balance for that period.

                // For this iteration, let's calculate based on a monthly schedule, then show how biweekly would accelerate it.
                // The core logic for biweekly is that you make 13 monthly payments over 12 months.
                // So, we calculate monthly, then for biweekly, we effectively make an extra monthly payment per year.

                // Let's use a more direct biweekly simulation:
                // Interest for a 2-week period (approx):
                interestForPeriod = balance * (monthlyInterestRate / 2); // Approximation
                principalForPeriod = paymentForPeriod - interestForPeriod;


            } else { // Monthly
                paymentForPeriod = monthlyPandI;
                interestForPeriod = balance * monthlyInterestRate;
                principalForPeriod = paymentForPeriod - interestForPeriod;
            }

            if (balance < paymentForPeriod && balance > interestForPeriod) { // Final payment adjustment
                principalForPeriod = balance;
                paymentForPeriod = principalForPeriod + interestForPeriod;
            } else if (balance <= interestForPeriod) { // Only interest or less is due
                 principalForPeriod = 0;
                 interestForPeriod = balance;
                 paymentForPeriod = balance;
            }


            balance -= principalForPeriod;
            totalInterestPaid += interestForPeriod;

            schedule.push({
                paymentNumber: paymentNumber,
                date: formatDate(currentDate),
                payment: paymentForPeriod,
                principal: principalForPeriod,
                interest: interestForPeriod,
                balance: balance < 0.005 ? 0 : balance // Ensure balance doesn't go slightly negative
            });

            if (balance <= 0.005) {
                break;
            }

            if (isBiweekly) {
                const newDate = new Date(currentDate);
                newDate.setDate(currentDate.getDate() + 14); // Advance by 14 days
                currentDate = newDate;
            } else {
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }
        // The payoff date is the date of the last payment.
        const payoffDate = schedule.length > 0 ? parseDateFromYYYYMM(schedule[schedule.length - 1].date) : null;
        if (payoffDate) payoffDate.setMonth(payoffDate.getMonth()); // if last payment is e.g. 2045-03, payoff is end of 2045-03

        return { schedule, totalInterestPaid, payoffDate };
    }


    // --- Main Calculation Function ---
    function performCalculation() {
        const loanAmount = parseFloatSafe(loanAmountEl.value);
        const annualRate = parseFloatSafe(annualInterestRateEl.value);
        const loanTermYears = parseInt(originalLoanTermEl.value);
        const loanStartDate = parseDateFromYYYYMM(loanStartDateEl.value);
        const annualTaxes = parseFloatSafe(annualPropertyTaxesEl.value);
        const annualInsurance = parseFloatSafe(annualHomeInsuranceEl.value);

        if (loanAmount <= 0 || annualRate < 0 || loanTermYears <= 0 || !loanStartDate) {
            alert("Please fill in all required loan information fields with valid values.");
            return;
        }

        const monthlyPandI = calculateMonthlyPandI(loanAmount, annualRate, loanTermYears);
        const biweeklyPandI = monthlyPandI / 2;

        standardMonthlyPaymentEl.textContent = formatCurrency(monthlyPandI);
        biweeklyPaymentAmountEl.textContent = formatCurrency(biweeklyPandI);

        // Monthly Schedule
        const monthlyData = generateAmortizationSchedule(loanAmount, annualRate, loanTermYears, loanStartDate, monthlyPandI, false);
        originalPayoffDateEl.textContent = formatDate(monthlyData.payoffDate);
        totalInterestMonthlyEl.textContent = formatCurrency(monthlyData.totalInterestPaid);
        displayAmortizationTable(monthlyAmortizationTableBodyEl, monthlyData.schedule);

        // Biweekly Schedule - effectively makes 13 monthly payments a year
        // To simulate this, we can calculate a loan with a slightly higher effective payment or shorter term.
        // Or, more accurately, simulate 26 payments a year.
        const biweeklyData = generateAmortizationSchedule(loanAmount, annualRate, loanTermYears, loanStartDate, monthlyPandI, true); // Pass monthly P&I, function will use half
        newPayoffDateEl.textContent = formatDate(biweeklyData.payoffDate);
        totalInterestBiweeklyEl.textContent = formatCurrency(biweeklyData.totalInterestPaid);
        displayAmortizationTable(biweeklyAmortizationTableBodyEl, biweeklyData.schedule);
        
        const interestSaved = monthlyData.totalInterestPaid - biweeklyData.totalInterestPaid;
        totalInterestSavingsEl.textContent = formatCurrency(interestSaved > 0 ? interestSaved : 0);

        if (monthlyData.payoffDate && biweeklyData.payoffDate) {
            const originalDate = monthlyData.payoffDate;
            const newDate = biweeklyData.payoffDate;

            let yearsDiff = originalDate.getFullYear() - newDate.getFullYear();
            let monthsDiff = originalDate.getMonth() - newDate.getMonth();

            if (monthsDiff < 0) {
                yearsDiff--;
                monthsDiff += 12;
            }
            if (yearsDiff < 0 || (yearsDiff === 0 && monthsDiff <=0 && interestSaved <=0) ) { // If biweekly is not shorter or no savings
                 timeSavedEl.textContent = "0 Years, 0 Months";
                 if (interestSaved < 0) totalInterestSavingsEl.textContent = formatCurrency(0);
            } else {
                timeSavedEl.textContent = `${yearsDiff} Year(s), ${monthsDiff} Month(s)`;
            }
        } else {
            timeSavedEl.textContent = "-";
        }

        // PITI Calculation (Optional)
        if (annualTaxes > 0 || annualInsurance > 0) {
            const monthlyTaxes = annualTaxes / 12;
            const monthlyInsurance = annualInsurance / 12;
            
            const totalMonthlyPITI = monthlyPandI + monthlyTaxes + monthlyInsurance;
            const totalBiweeklyPITI = biweeklyPandI + (monthlyTaxes / 2) + (monthlyInsurance / 2); // Biweekly portion of T&I

            monthlyPITIEl.textContent = formatCurrency(totalMonthlyPITI);
            biweeklyPITIEl.textContent = formatCurrency(totalBiweeklyPITI);
            pitiResultsEl.style.display = "block";
        } else {
            pitiResultsEl.style.display = "none";
        }

        resultsSection.style.display = "block";
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function displayAmortizationTable(tbodyEl, schedule) {
        tbodyEl.innerHTML = ""; // Clear previous results
        schedule.forEach(item => {
            const row = tbodyEl.insertRow();
            row.insertCell().textContent = item.paymentNumber;
            row.insertCell().textContent = item.date;
            row.insertCell().textContent = formatCurrency(item.payment);
            row.insertCell().textContent = formatCurrency(item.principal);
            row.insertCell().textContent = formatCurrency(item.interest);
            row.insertCell().textContent = formatCurrency(item.balance);
        });
    }
    
    // --- Tabbed Interface for Amortization Schedules ---
    window.openSchedule = function(evt, scheduleName) {
        let i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tab-content");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tab-link");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(scheduleName).style.display = "block";
        if (evt) evt.currentTarget.className += " active";
    }
    // Initialize first tab
    if(document.getElementsByClassName("tab-link")[0]) {
         document.getElementsByClassName("tab-link")[0].click();
    }


    // --- Event Listeners ---
    if (calculateButton) {
        calculateButton.addEventListener("click", function(event) {
            event.preventDefault();
            performCalculation();
        });
    }

    if (calculatorForm) {
        calculatorForm.addEventListener("reset", function() {
            resultsSection.style.display = "none";
            pitiResultsEl.style.display = "none";
            // Reset output fields to default
            standardMonthlyPaymentEl.textContent = "-";
            biweeklyPaymentAmountEl.textContent = "-";
            originalPayoffDateEl.textContent = "-";
            newPayoffDateEl.textContent = "-";
            timeSavedEl.textContent = "-";
            totalInterestMonthlyEl.textContent = "-";
            totalInterestBiweeklyEl.textContent = "-";
            totalInterestSavingsEl.textContent = "-";
            monthlyAmortizationTableBodyEl.innerHTML = "";
            biweeklyAmortizationTableBodyEl.innerHTML = "";
             if(document.getElementsByClassName("tab-link")[0]) {
                document.getElementsByClassName("tab-link")[0].click(); // Reset to first tab
            }
        });
    }
});
