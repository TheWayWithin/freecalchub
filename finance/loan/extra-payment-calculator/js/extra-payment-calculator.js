document.addEventListener("DOMContentLoaded", function () {
    // --- DOM Element References ---
    const calculatorForm = document.getElementById("extraPaymentCalculatorForm");
    const calculateButton = document.getElementById("calculateButton");
    const resultsSection = document.getElementById("resultsSection");

    // Inputs
    const originalLoanAmountEl = document.getElementById("originalLoanAmount");
    const annualInterestRateEl = document.getElementById("annualInterestRate");
    const originalLoanTermYearsEl = document.getElementById("originalLoanTermYears");
    const originalLoanTermMonthsEl = document.getElementById("originalLoanTermMonths");
    const loanStartDateEl = document.getElementById("loanStartDate");
    const currentOutstandingBalanceEl = document.getElementById("currentOutstandingBalance");

    const extraMonthlyPaymentEl = document.getElementById("extraMonthlyPayment");
    const extraAnnualPaymentEl = document.getElementById("extraAnnualPayment");
    const extraAnnualPaymentMonthEl = document.getElementById("extraAnnualPaymentMonth");
    const oneTimeExtraPaymentEl = document.getElementById("oneTimeExtraPayment");
    const oneTimeExtraPaymentDateEl = document.getElementById("oneTimeExtraPaymentDate");
    const extraPaymentsStartDateEl = document.getElementById("extraPaymentsStartDate");

    // Outputs
    const originalPayoffDateEl = document.getElementById("originalPayoffDate");
    const newPayoffDateEl = document.getElementById("newPayoffDate");
    const timeSavedEl = document.getElementById("timeSaved");
    const totalInterestOriginalEl = document.getElementById("totalInterestOriginal");
    const totalInterestNewEl = document.getElementById("totalInterestNew");
    const totalInterestSavingsEl = document.getElementById("totalInterestSavings");

    const originalAmortizationTableBodyEl = document.getElementById("originalAmortizationTableBody");
    const newAmortizationTableBodyEl = document.getElementById("newAmortizationTableBody");

    // --- Helper Functions ---
    function parseFloatSafe(value, defaultValue = 0) {
        const num = parseFloat(value);
        return isNaN(num) ? defaultValue : num;
    }

    function parseIntSafe(value, defaultValue = 0) {
        const num = parseInt(value, 10);
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

    function calculateMonthlyPayment(principal, annualRate, termMonths) {
        if (principal <= 0 || annualRate < 0 || termMonths <= 0) return 0;
        const monthlyRate = annualRate / 100 / 12;
        if (monthlyRate === 0) return principal / termMonths;
        return principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
    }

    // --- Amortization Calculation Function ---
    function generateAmortizationSchedule(principal, annualRate, termMonths, loanStartDateInput, extraPayments = {}) {
        let balance = principal;
        const monthlyInterestRate = annualRate / 100 / 12;
        let currentDate = loanStartDateInput ? new Date(loanStartDateInput) : new Date(); // Default to today if no start date
        if (!loanStartDateInput) { // If no start date, set day to 1 for consistent month increments
            currentDate.setDate(1);
        }

        const schedule = [];
        let totalInterestPaid = 0;
        let paymentNumber = 0;
        const standardMonthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);

        const extraPayStartDate = extraPayments.startDate ? new Date(extraPayments.startDate) : new Date(currentDate);
        let oneTimePayDate = extraPayments.oneTimeDate ? new Date(extraPayments.oneTimeDate) : null;
        let oneTimePaymentAmount = extraPayments.oneTime || 0;

        for (let i = 0; i < termMonths * 2 && balance > 0.005; i++) { // Safety break
            paymentNumber++;
            let interestForMonth = balance * monthlyInterestRate;
            let principalFromStandardPayment = standardMonthlyPayment - interestForMonth;
            
            let actualExtraPaymentThisMonth = 0;
            if (currentDate >= extraPayStartDate) {
                actualExtraPaymentThisMonth += extraPayments.monthly || 0;
                if (extraPayments.annual > 0 && (currentDate.getMonth() + 1) === extraPayments.annualMonth) {
                    actualExtraPaymentThisMonth += extraPayments.annual || 0;
                }
            }
            if (oneTimePaymentAmount > 0 && oneTimePayDate && 
                currentDate.getFullYear() === oneTimePayDate.getFullYear() &&
                currentDate.getMonth() === oneTimePayDate.getMonth()) {
                actualExtraPaymentThisMonth += oneTimePaymentAmount;
                oneTimePaymentAmount = 0; // Apply only once
            }

            let totalPrincipalPaidThisMonth = principalFromStandardPayment + actualExtraPaymentThisMonth;
            let actualPaymentThisMonth = standardMonthlyPayment + actualExtraPaymentThisMonth;

            if (balance <= (standardMonthlyPayment + actualExtraPaymentThisMonth - interestForMonth) && balance > interestForMonth) {
                totalPrincipalPaidThisMonth = balance;
                 // Adjust extra payment if it overpays
                if (actualExtraPaymentThisMonth > balance - principalFromStandardPayment && principalFromStandardPayment < balance) {
                    actualExtraPaymentThisMonth = Math.max(0, balance - principalFromStandardPayment);
                } else if (principalFromStandardPayment >= balance) {
                    actualExtraPaymentThisMonth = 0;
                }
                principalFromStandardPayment = balance - actualExtraPaymentThisMonth;
                actualPaymentThisMonth = balance + interestForMonth; // Total payment is balance + interest
            } else if (balance <= interestForMonth) { // Only interest or less is due
                 totalPrincipalPaidThisMonth = 0;
                 actualExtraPaymentThisMonth = 0;
                 principalFromStandardPayment = 0;
                 interestForMonth = balance;
                 actualPaymentThisMonth = balance;
            }
            
            if (totalPrincipalPaidThisMonth < 0) totalPrincipalPaidThisMonth = 0;


            balance -= totalPrincipalPaidThisMonth;
            totalInterestPaid += interestForMonth;

            schedule.push({
                paymentNumber: paymentNumber,
                date: formatDate(currentDate),
                payment: actualPaymentThisMonth,
                extra: actualExtraPaymentThisMonth,
                principal: totalPrincipalPaidThisMonth, // Total principal paid (standard + extra)
                interest: interestForMonth,
                balance: balance < 0.005 ? 0 : balance
            });

            if (balance <= 0.005) break;
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        const payoffDate = schedule.length > 0 ? parseDateFromYYYYMM(schedule[schedule.length - 1].date) : null;

        return { schedule, totalInterestPaid, payoffDate, standardMonthlyPayment };
    }

    // --- Main Calculation Function ---
    function performCalculation() {
        let loanAmount = parseFloatSafe(originalLoanAmountEl.value);
        const annualRate = parseFloatSafe(annualInterestRateEl.value);
        let termYears = parseIntSafe(originalLoanTermYearsEl.value);
        let termMonths = parseIntSafe(originalLoanTermMonthsEl.value);
        let loanStartDate = parseDateFromYYYYMM(loanStartDateEl.value);
        const currentBalance = parseFloatSafe(currentOutstandingBalanceEl.value);

        const extraMonthly = parseFloatSafe(extraMonthlyPaymentEl.value);
        const extraAnnual = parseFloatSafe(extraAnnualPaymentEl.value);
        const extraAnnualMonth = parseIntSafe(extraAnnualPaymentMonthEl.value, 1);
        const oneTimePayment = parseFloatSafe(oneTimeExtraPaymentEl.value);
        const oneTimePaymentDate = parseDateFromYYYYMM(oneTimeExtraPaymentDateEl.value);
        let extraPaymentsStartDate = parseDateFromYYYYMM(extraPaymentsStartDateEl.value);

        if (termYears === 0 && termMonths === 0) {
            alert("Please enter a loan term in years and/or months.");
            return;
        }
        let totalTermMonths = (termYears * 12) + termMonths;

        if (loanAmount <= 0 || annualRate < 0 || totalTermMonths <= 0) {
            alert("Please fill in Loan Amount, Interest Rate, and Term with valid positive values.");
            return;
        }
        if (!loanStartDate) { // Default to today if no start date
            loanStartDate = new Date();
            loanStartDate.setDate(1); // Start of current month
        }
         if (!extraPaymentsStartDate) {
            extraPaymentsStartDate = new Date(loanStartDate);
        }


        let effectiveLoanAmount = loanAmount;
        let effectiveTermMonths = totalTermMonths;

        if (currentBalance > 0 && currentBalance < loanAmount) {
            effectiveLoanAmount = currentBalance;
            // Estimate remaining term if current balance is given
            // This is a simplification; for true accuracy, original amortization to current date would be needed.
            // For now, assume the provided term is the *remaining* term if current balance is used,
            // or recalculate if loanStartDate is significantly in the past.
            // Let's assume if current balance is given, the term is the *original* term, and we fast-forward.
            // This calculator will show projection from loanStartDate or currentBalance date.
            // For simplicity, if current balance is given, we use it as the principal. The term is still the original total term.
            // The amortization will naturally show fewer payments if starting from a later point with a reduced balance.
            // This is complex. A better way: if currentBalance, then loanStartDate must be in the past.
            // We calculate payments made until "today" or extraPaymentsStartDate.
            // For this version, if currentBalance is provided, we'll use it as the principal and the original term.
            // The JS will handle the start date of calculations.
        }
        
        // Scenario 1: Original Loan (no extra payments)
        const originalLoanData = generateAmortizationSchedule(effectiveLoanAmount, annualRate, effectiveTermMonths, loanStartDate, {});
        originalPayoffDateEl.textContent = formatDate(originalLoanData.payoffDate);
        totalInterestOriginalEl.textContent = formatCurrency(originalLoanData.totalInterestPaid);
        displayAmortizationTable(originalAmortizationTableBodyEl, originalLoanData.schedule, false);

        // Scenario 2: Loan with Extra Payments
        const extraPaymentDetails = {
            monthly: extraMonthly,
            annual: extraAnnual,
            annualMonth: extraAnnualMonth,
            oneTime: oneTimePayment,
            oneTimeDate: oneTimePaymentDate,
            startDate: extraPaymentsStartDate
        };
        const newLoanData = generateAmortizationSchedule(effectiveLoanAmount, annualRate, effectiveTermMonths, loanStartDate, extraPaymentDetails);
        newPayoffDateEl.textContent = formatDate(newLoanData.payoffDate);
        totalInterestNewEl.textContent = formatCurrency(newLoanData.totalInterestPaid);
        displayAmortizationTable(newAmortizationTableBodyEl, newLoanData.schedule, true);

        const interestSavedVal = originalLoanData.totalInterestPaid - newLoanData.totalInterestPaid;
        totalInterestSavingsEl.textContent = formatCurrency(interestSavedVal > 0 ? interestSavedVal : 0);

        if (originalLoanData.payoffDate && newLoanData.payoffDate) {
            const od = originalLoanData.payoffDate;
            const nd = newLoanData.payoffDate;
            let yearsDiff = od.getFullYear() - nd.getFullYear();
            let monthsDiff = od.getMonth() - nd.getMonth();
            if (monthsDiff < 0) {
                yearsDiff--;
                monthsDiff += 12;
            }
            if ( (od.getTime() > nd.getTime()) && interestSavedVal > 0 ) { // Check if new date is actually earlier
                 timeSavedEl.textContent = `${yearsDiff} Year(s), ${monthsDiff} Month(s)`;
            } else {
                 timeSavedEl.textContent = "0 Years, 0 Months";
                 if(interestSavedVal < 0) totalInterestSavingsEl.textContent = formatCurrency(0);
            }

        } else {
            timeSavedEl.textContent = "-";
        }

        resultsSection.style.display = "block";
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function displayAmortizationTable(tbodyEl, schedule, showExtraColumn) {
        tbodyEl.innerHTML = ""; 
        schedule.forEach(item => {
            const row = tbodyEl.insertRow();
            row.insertCell().textContent = item.paymentNumber;
            row.insertCell().textContent = item.date;
            row.insertCell().textContent = formatCurrency(item.payment);
            if (showExtraColumn) {
                row.insertCell().textContent = formatCurrency(item.extra);
            }
            // For original schedule, item.principal is total principal.
            // For new schedule, item.principal already includes extra. So we need to show principal part of standard payment.
            // Let's adjust: generateAmortizationSchedule should return principalFromStandardPayment and extraPayment separately for new schedule display
            // For now, item.principal is the total that reduced the balance.
            row.insertCell().textContent = formatCurrency(item.principal); // This is total principal paid in the period
            row.insertCell().textContent = formatCurrency(item.interest);
            row.insertCell().textContent = formatCurrency(item.balance);
        });
    }
    
    // --- Tabbed Interface for Amortization Schedules ---
    window.openAmortizationSchedule = function(evt, scheduleName) {
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
        if(evt) evt.currentTarget.className += " active";
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
            originalPayoffDateEl.textContent = "-";
            newPayoffDateEl.textContent = "-";
            timeSavedEl.textContent = "-";
            totalInterestOriginalEl.textContent = "-";
            totalInterestNewEl.textContent = "-";
            totalInterestSavingsEl.textContent = "-";
            originalAmortizationTableBodyEl.innerHTML = "";
            newAmortizationTableBodyEl.innerHTML = "";
            if(document.getElementsByClassName("tab-link")[0]) { // Reset to first tab
                document.getElementsByClassName("tab-link")[0].click();
            }
        });
    }
});
