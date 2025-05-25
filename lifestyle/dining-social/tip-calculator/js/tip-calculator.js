/*
 * FreecalcHub.com - Tip Calculator
 * Version: 1.0
 * Date Created: May 25, 2025
 * Description: Handles calculations and interactions for the Tip Calculator.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM Elements
    const billAmountInput = document.getElementById('billAmount');
    const tipPercentageInput = document.getElementById('tipPercentage');
    const numPeopleInput = document.getElementById('numPeople');
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const quickTipButtons = document.querySelectorAll('.quick-tip-buttons .btn');
    const errorMessagesDiv = document.getElementById('errorMessages');
    const resultsSection = document.getElementById('resultsSection');
    const tipAmountResult = document.getElementById('tipAmountResult');
    const totalBillResult = document.getElementById('totalBillResult');
    const perPersonResult = document.getElementById('perPersonResult');
    const perPersonSection = document.getElementById('perPersonSection');
    const calculatorForm = document.getElementById('calculatorForm');

    // --- Event Listeners ---

    calculateButton.addEventListener('click', handleCalculate);
    resetButton.addEventListener('click', handleReset);
    quickTipButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            tipPercentageInput.value = e.target.getAttribute('data-tip');
             // Optionally remove 'active' class from others and add to this one
            quickTipButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // Recalculate when inputs change for a live feel (optional)
    // [billAmountInput, tipPercentageInput, numPeopleInput].forEach(input => {
    //     input.addEventListener('input', handleCalculate);
    // });

    // --- Functions ---

    function handleCalculate() {
        clearErrors();
        
        // 1. Get and Validate Inputs
        const billAmount = parseFloat(billAmountInput.value);
        const tipPercentage = parseFloat(tipPercentageInput.value);
        const numPeople = parseInt(numPeopleInput.value, 10);

        let errors = [];
        if (isNaN(billAmount) || billAmount <= 0) {
            errors.push("Bill Amount must be a positive number.");
            billAmountInput.classList.add('input-error');
        } else {
             billAmountInput.classList.remove('input-error');
        }

        if (isNaN(tipPercentage) || tipPercentage < 0) {
            errors.push("Tip Percentage must be a non-negative number.");
            tipPercentageInput.classList.add('input-error');
        } else {
             tipPercentageInput.classList.remove('input-error');
        }

        if (isNaN(numPeople) || numPeople < 1) {
            errors.push("Number of People must be at least 1.");
            numPeopleInput.classList.add('input-error');
        } else {
            numPeopleInput.classList.remove('input-error');
        }

        // 2. Show Errors or Calculate
        if (errors.length > 0) {
            showErrors(errors);
            hideResults();
        } else {
            calculateAndShowResults(billAmount, tipPercentage, numPeople);
        }
    }

    function calculateAndShowResults(bill, tipPercent, people) {
        // 3. Perform Calculations
        const tipAmount = bill * (tipPercent / 100);
        const totalBill = bill + tipAmount;
        const amountPerPerson = totalBill / people;

        // 4. Format and Display Results
        tipAmountResult.textContent = `$${tipAmount.toFixed(2)}`;
        totalBillResult.textContent = `$${totalBill.toFixed(2)}`;

        if (people > 1) {
            perPersonResult.textContent = `$${amountPerPerson.toFixed(2)}`;
            perPersonSection.style.display = 'block';
        } else {
            perPersonSection.style.display = 'none';
        }

        resultsSection.style.display = 'block';
    }

    function handleReset() {
        calculatorForm.reset(); // Resets form fields to initial values
        clearErrors();
        hideResults();
        numPeopleInput.value = '1'; // Ensure numPeople defaults to 1
        quickTipButtons.forEach(btn => btn.classList.remove('active')); // Reset quick buttons
        [billAmountInput, tipPercentageInput, numPeopleInput].forEach(input => {
             input.classList.remove('input-error');
        });
    }

    function showErrors(errors) {
        errorMessagesDiv.innerHTML = errors.map(error => `<p>${error}</p>`).join('');
        errorMessagesDiv.style.display = 'block';
    }

    function clearErrors() {
        errorMessagesDiv.innerHTML = '';
        errorMessagesDiv.style.display = 'none';
        [billAmountInput, tipPercentageInput, numPeopleInput].forEach(input => {
             input.classList.remove('input-error');
        });
    }

    function hideResults() {
        resultsSection.style.display = 'none';
        tipAmountResult.textContent = '--';
        totalBillResult.textContent = '--';
        perPersonResult.textContent = '--';
        perPersonSection.style.display = 'none';
    }

}); // End DOMContentLoaded
