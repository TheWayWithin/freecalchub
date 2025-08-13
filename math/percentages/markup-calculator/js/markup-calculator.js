// Markup Calculator JavaScript

class MarkupCalculator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.calculationType = document.getElementById('calculationType');
        this.costInput = document.getElementById('cost');
        this.sellingPriceInput = document.getElementById('sellingPrice');
        this.markupPercentageInput = document.getElementById('markupPercentage');
        
        this.costGroup = document.getElementById('costGroup');
        this.sellingPriceGroup = document.getElementById('sellingPriceGroup');
        this.markupPercentageGroup = document.getElementById('markupPercentageGroup');
        
        this.calculateButton = document.getElementById('calculateButton');
        this.resetButton = document.getElementById('resetButton');
        this.resultsSection = document.getElementById('resultsSection');
        this.errorMessages = document.getElementById('errorMessages');
        
        this.resultCost = document.getElementById('resultCost');
        this.resultSellingPrice = document.getElementById('resultSellingPrice');
        this.resultMarkupPercentage = document.getElementById('resultMarkupPercentage');
        this.resultProfit = document.getElementById('resultProfit');
    }

    bindEvents() {
        this.calculationType.addEventListener('change', () => this.handleCalculationTypeChange());
        this.calculateButton.addEventListener('click', () => this.calculate());
        this.resetButton.addEventListener('click', () => this.reset());
        
        // Allow Enter key to trigger calculation
        [this.costInput, this.sellingPriceInput, this.markupPercentageInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.calculate();
                }
            });
        });
    }

    handleCalculationTypeChange() {
        const calculationType = this.calculationType.value;
        this.hideAllInputGroups();
        this.clearResults();
        this.clearErrors();

        switch (calculationType) {
            case 'sellingPrice':
                this.showInputGroups(['costGroup', 'markupPercentageGroup']);
                break;
            case 'markupPercentage':
                this.showInputGroups(['costGroup', 'sellingPriceGroup']);
                break;
            case 'cost':
                this.showInputGroups(['sellingPriceGroup', 'markupPercentageGroup']);
                break;
        }
    }

    hideAllInputGroups() {
        [this.costGroup, this.sellingPriceGroup, this.markupPercentageGroup].forEach(group => {
            group.style.display = 'none';
        });
    }

    showInputGroups(groupIds) {
        groupIds.forEach(groupId => {
            const group = document.getElementById(groupId);
            if (group) {
                group.style.display = 'block';
            }
        });
    }

    validate() {
        const calculationType = this.calculationType.value;
        const errors = [];

        if (!calculationType) {
            errors.push('Please select a calculation type.');
            return errors;
        }

        const cost = parseFloat(this.costInput.value);
        const sellingPrice = parseFloat(this.sellingPriceInput.value);
        const markupPercentage = parseFloat(this.markupPercentageInput.value);

        switch (calculationType) {
            case 'sellingPrice':
                if (isNaN(cost) || cost < 0) {
                    errors.push('Please enter a valid cost (must be 0 or greater).');
                }
                if (isNaN(markupPercentage) || markupPercentage < 0) {
                    errors.push('Please enter a valid markup percentage (must be 0 or greater).');
                }
                break;
            case 'markupPercentage':
                if (isNaN(cost) || cost <= 0) {
                    errors.push('Please enter a valid cost (must be greater than 0).');
                }
                if (isNaN(sellingPrice) || sellingPrice < 0) {
                    errors.push('Please enter a valid selling price (must be 0 or greater).');
                }
                if (!isNaN(cost) && !isNaN(sellingPrice) && sellingPrice < cost) {
                    errors.push('Selling price cannot be less than cost for markup calculation.');
                }
                break;
            case 'cost':
                if (isNaN(sellingPrice) || sellingPrice <= 0) {
                    errors.push('Please enter a valid selling price (must be greater than 0).');
                }
                if (isNaN(markupPercentage) || markupPercentage < 0) {
                    errors.push('Please enter a valid markup percentage (must be 0 or greater).');
                }
                break;
        }

        return errors;
    }

    calculate() {
        const errors = this.validate();
        
        if (errors.length > 0) {
            this.showErrors(errors);
            return;
        }

        this.clearErrors();
        
        const calculationType = this.calculationType.value;
        let cost, sellingPrice, markupPercentage, profit;

        try {
            switch (calculationType) {
                case 'sellingPrice':
                    cost = parseFloat(this.costInput.value);
                    markupPercentage = parseFloat(this.markupPercentageInput.value);
                    sellingPrice = cost * (1 + markupPercentage / 100);
                    profit = sellingPrice - cost;
                    break;
                    
                case 'markupPercentage':
                    cost = parseFloat(this.costInput.value);
                    sellingPrice = parseFloat(this.sellingPriceInput.value);
                    markupPercentage = ((sellingPrice - cost) / cost) * 100;
                    profit = sellingPrice - cost;
                    break;
                    
                case 'cost':
                    sellingPrice = parseFloat(this.sellingPriceInput.value);
                    markupPercentage = parseFloat(this.markupPercentageInput.value);
                    cost = sellingPrice / (1 + markupPercentage / 100);
                    profit = sellingPrice - cost;
                    break;
            }

            this.displayResults(cost, sellingPrice, markupPercentage, profit);
        } catch (error) {
            this.showErrors(['An error occurred during calculation. Please check your inputs.']);
        }
    }

    displayResults(cost, sellingPrice, markupPercentage, profit) {
        this.resultCost.textContent = this.formatCurrency(cost);
        this.resultSellingPrice.textContent = this.formatCurrency(sellingPrice);
        this.resultMarkupPercentage.textContent = this.formatPercentage(markupPercentage);
        this.resultProfit.textContent = this.formatCurrency(profit);
        
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    formatPercentage(percentage) {
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(percentage / 100);
    }

    showErrors(errors) {
        this.errorMessages.innerHTML = errors.map(error => `<p>${error}</p>`).join('');
        this.errorMessages.style.display = 'block';
        this.errorMessages.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    clearErrors() {
        this.errorMessages.style.display = 'none';
        this.errorMessages.innerHTML = '';
    }

    clearResults() {
        this.resultsSection.style.display = 'none';
        this.resultCost.textContent = '--';
        this.resultSellingPrice.textContent = '--';
        this.resultMarkupPercentage.textContent = '--';
        this.resultProfit.textContent = '--';
    }

    reset() {
        // Reset form fields
        this.calculationType.value = '';
        this.costInput.value = '';
        this.sellingPriceInput.value = '';
        this.markupPercentageInput.value = '';
        
        // Hide all input groups
        this.hideAllInputGroups();
        
        // Clear results and errors
        this.clearResults();
        this.clearErrors();
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new MarkupCalculator();
});