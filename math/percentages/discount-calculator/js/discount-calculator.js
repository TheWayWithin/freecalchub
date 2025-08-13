// Discount Calculator JavaScript

class DiscountCalculator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.calculationType = document.getElementById('calculationType');
        this.originalPriceInput = document.getElementById('originalPrice');
        this.finalPriceInput = document.getElementById('finalPrice');
        this.discountPercentageInput = document.getElementById('discountPercentage');
        
        this.originalPriceGroup = document.getElementById('originalPriceGroup');
        this.finalPriceGroup = document.getElementById('finalPriceGroup');
        this.discountPercentageGroup = document.getElementById('discountPercentageGroup');
        this.multipleDiscountsSection = document.getElementById('multipleDiscountsSection');
        
        this.enableMultipleDiscounts = document.getElementById('enableMultipleDiscounts');
        this.additionalDiscounts = document.getElementById('additionalDiscounts');
        this.secondDiscountInput = document.getElementById('secondDiscount');
        this.thirdDiscountInput = document.getElementById('thirdDiscount');
        
        this.calculateButton = document.getElementById('calculateButton');
        this.resetButton = document.getElementById('resetButton');
        this.resultsSection = document.getElementById('resultsSection');
        this.errorMessages = document.getElementById('errorMessages');
        
        this.resultOriginalPrice = document.getElementById('resultOriginalPrice');
        this.resultFinalPrice = document.getElementById('resultFinalPrice');
        this.resultDiscountPercentage = document.getElementById('resultDiscountPercentage');
        this.resultTotalSavings = document.getElementById('resultTotalSavings');
        
        this.discountBreakdown = document.getElementById('discountBreakdown');
        this.breakdownDetails = document.getElementById('breakdownDetails');
    }

    bindEvents() {
        this.calculationType.addEventListener('change', () => this.handleCalculationTypeChange());
        this.enableMultipleDiscounts.addEventListener('change', () => this.handleMultipleDiscountsToggle());
        this.calculateButton.addEventListener('click', () => this.calculate());
        this.resetButton.addEventListener('click', () => this.reset());
        
        // Allow Enter key to trigger calculation
        [this.originalPriceInput, this.finalPriceInput, this.discountPercentageInput, 
         this.secondDiscountInput, this.thirdDiscountInput].forEach(input => {
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
            case 'finalPrice':
                this.showInputGroups(['originalPriceGroup', 'discountPercentageGroup']);
                this.multipleDiscountsSection.style.display = 'block';
                break;
            case 'discountPercentage':
                this.showInputGroups(['originalPriceGroup', 'finalPriceGroup']);
                this.multipleDiscountsSection.style.display = 'none';
                this.enableMultipleDiscounts.checked = false;
                this.additionalDiscounts.style.display = 'none';
                break;
            case 'originalPrice':
                this.showInputGroups(['finalPriceGroup', 'discountPercentageGroup']);
                this.multipleDiscountsSection.style.display = 'none';
                this.enableMultipleDiscounts.checked = false;
                this.additionalDiscounts.style.display = 'none';
                break;
        }
    }

    handleMultipleDiscountsToggle() {
        if (this.enableMultipleDiscounts.checked) {
            this.additionalDiscounts.style.display = 'block';
        } else {
            this.additionalDiscounts.style.display = 'none';
            this.secondDiscountInput.value = '';
            this.thirdDiscountInput.value = '';
        }
    }

    hideAllInputGroups() {
        [this.originalPriceGroup, this.finalPriceGroup, this.discountPercentageGroup].forEach(group => {
            group.style.display = 'none';
        });
        this.multipleDiscountsSection.style.display = 'none';
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

        const originalPrice = parseFloat(this.originalPriceInput.value);
        const finalPrice = parseFloat(this.finalPriceInput.value);
        const discountPercentage = parseFloat(this.discountPercentageInput.value);

        switch (calculationType) {
            case 'finalPrice':
                if (isNaN(originalPrice) || originalPrice <= 0) {
                    errors.push('Please enter a valid original price (must be greater than 0).');
                }
                if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
                    errors.push('Please enter a valid discount percentage (0-100%).');
                }
                break;
            case 'discountPercentage':
                if (isNaN(originalPrice) || originalPrice <= 0) {
                    errors.push('Please enter a valid original price (must be greater than 0).');
                }
                if (isNaN(finalPrice) || finalPrice < 0) {
                    errors.push('Please enter a valid final price (must be 0 or greater).');
                }
                if (!isNaN(originalPrice) && !isNaN(finalPrice) && finalPrice > originalPrice) {
                    errors.push('Final price cannot be greater than original price for discount calculation.');
                }
                break;
            case 'originalPrice':
                if (isNaN(finalPrice) || finalPrice <= 0) {
                    errors.push('Please enter a valid final price (must be greater than 0).');
                }
                if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage >= 100) {
                    errors.push('Please enter a valid discount percentage (0-99%).');
                }
                break;
        }

        // Validate additional discounts if enabled
        if (this.enableMultipleDiscounts.checked && calculationType === 'finalPrice') {
            const secondDiscount = parseFloat(this.secondDiscountInput.value);
            const thirdDiscount = parseFloat(this.thirdDiscountInput.value);
            
            if (!isNaN(secondDiscount) && (secondDiscount < 0 || secondDiscount > 100)) {
                errors.push('Second discount must be between 0-100%.');
            }
            if (!isNaN(thirdDiscount) && (thirdDiscount < 0 || thirdDiscount > 100)) {
                errors.push('Third discount must be between 0-100%.');
            }
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
        let originalPrice, finalPrice, totalDiscountPercentage, totalSavings;
        let discountBreakdown = [];

        try {
            switch (calculationType) {
                case 'finalPrice':
                    originalPrice = parseFloat(this.originalPriceInput.value);
                    const result = this.calculateWithMultipleDiscounts(originalPrice);
                    finalPrice = result.finalPrice;
                    totalDiscountPercentage = result.totalDiscountPercentage;
                    totalSavings = result.totalSavings;
                    discountBreakdown = result.breakdown;
                    break;
                    
                case 'discountPercentage':
                    originalPrice = parseFloat(this.originalPriceInput.value);
                    finalPrice = parseFloat(this.finalPriceInput.value);
                    totalSavings = originalPrice - finalPrice;
                    totalDiscountPercentage = (totalSavings / originalPrice) * 100;
                    break;
                    
                case 'originalPrice':
                    finalPrice = parseFloat(this.finalPriceInput.value);
                    const discountPercentage = parseFloat(this.discountPercentageInput.value);
                    originalPrice = finalPrice / (1 - discountPercentage / 100);
                    totalSavings = originalPrice - finalPrice;
                    totalDiscountPercentage = discountPercentage;
                    break;
            }

            this.displayResults(originalPrice, finalPrice, totalDiscountPercentage, totalSavings, discountBreakdown);
        } catch (error) {
            this.showErrors(['An error occurred during calculation. Please check your inputs.']);
        }
    }

    calculateWithMultipleDiscounts(originalPrice) {
        const discounts = [parseFloat(this.discountPercentageInput.value)];
        
        if (this.enableMultipleDiscounts.checked) {
            const secondDiscount = parseFloat(this.secondDiscountInput.value);
            const thirdDiscount = parseFloat(this.thirdDiscountInput.value);
            
            if (!isNaN(secondDiscount) && secondDiscount > 0) {
                discounts.push(secondDiscount);
            }
            if (!isNaN(thirdDiscount) && thirdDiscount > 0) {
                discounts.push(thirdDiscount);
            }
        }

        let currentPrice = originalPrice;
        const breakdown = [];
        let totalDiscountAmount = 0;

        discounts.forEach((discount, index) => {
            const discountAmount = currentPrice * (discount / 100);
            const newPrice = currentPrice - discountAmount;
            
            breakdown.push({
                step: index + 1,
                discount: discount,
                priceBeforeDiscount: currentPrice,
                discountAmount: discountAmount,
                priceAfterDiscount: newPrice
            });

            totalDiscountAmount += discountAmount;
            currentPrice = newPrice;
        });

        const finalPrice = currentPrice;
        const totalSavings = originalPrice - finalPrice;
        const totalDiscountPercentage = (totalSavings / originalPrice) * 100;

        return {
            finalPrice,
            totalDiscountPercentage,
            totalSavings,
            breakdown
        };
    }

    displayResults(originalPrice, finalPrice, totalDiscountPercentage, totalSavings, discountBreakdown = []) {
        this.resultOriginalPrice.textContent = this.formatCurrency(originalPrice);
        this.resultFinalPrice.textContent = this.formatCurrency(finalPrice);
        this.resultDiscountPercentage.textContent = this.formatPercentage(totalDiscountPercentage);
        this.resultTotalSavings.textContent = this.formatCurrency(totalSavings);
        
        // Show breakdown for multiple discounts
        if (discountBreakdown.length > 1) {
            this.displayDiscountBreakdown(discountBreakdown);
            this.discountBreakdown.style.display = 'block';
        } else {
            this.discountBreakdown.style.display = 'none';
        }
        
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    displayDiscountBreakdown(breakdown) {
        this.breakdownDetails.innerHTML = '';
        
        breakdown.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'breakdown-step';
            
            const description = document.createElement('span');
            description.className = 'step-description';
            description.textContent = `Step ${step.step}: ${this.formatPercentage(step.discount)} off ${this.formatCurrency(step.priceBeforeDiscount)}`;
            
            const amount = document.createElement('span');
            amount.className = 'step-amount';
            amount.textContent = `= ${this.formatCurrency(step.priceAfterDiscount)}`;
            
            stepElement.appendChild(description);
            stepElement.appendChild(amount);
            this.breakdownDetails.appendChild(stepElement);
        });
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
        this.discountBreakdown.style.display = 'none';
        this.resultOriginalPrice.textContent = '--';
        this.resultFinalPrice.textContent = '--';
        this.resultDiscountPercentage.textContent = '--';
        this.resultTotalSavings.textContent = '--';
    }

    reset() {
        // Reset form fields
        this.calculationType.value = '';
        this.originalPriceInput.value = '';
        this.finalPriceInput.value = '';
        this.discountPercentageInput.value = '';
        this.secondDiscountInput.value = '';
        this.thirdDiscountInput.value = '';
        this.enableMultipleDiscounts.checked = false;
        
        // Hide all input groups
        this.hideAllInputGroups();
        this.additionalDiscounts.style.display = 'none';
        
        // Clear results and errors
        this.clearResults();
        this.clearErrors();
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new DiscountCalculator();
});