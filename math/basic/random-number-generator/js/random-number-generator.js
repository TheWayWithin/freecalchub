// Random Number Generator JavaScript
class RandomNumberGenerator {
    constructor() {
        this.generatedNumbers = [];
        this.initializeElements();
        this.initializeEventListeners();
    }
    
    initializeElements() {
        this.minValue = document.getElementById('minValue');
        this.maxValue = document.getElementById('maxValue');
        this.numberType = document.getElementById('numberType');
        this.decimalPlaces = document.getElementById('decimalPlaces');
        this.decimalPlacesGroup = document.getElementById('decimalPlacesGroup');
        this.quantity = document.getElementById('quantity');
        this.noDuplicates = document.getElementById('noDuplicates');
        this.useSeed = document.getElementById('useSeed');
        this.seedValue = document.getElementById('seedValue');
        this.seedGroup = document.getElementById('seedGroup');
        this.generateButton = document.getElementById('generateButton');
        this.resetButton = document.getElementById('resetButton');
        this.resultsSection = document.getElementById('resultsSection');
        this.numbersGrid = document.getElementById('numbersGrid');
        this.resultsSummary = document.getElementById('resultsSummary');
        this.errorMessages = document.getElementById('errorMessages');
        this.copyButton = document.getElementById('copyButton');
        this.exportCsvButton = document.getElementById('exportCsvButton');
        this.exportTxtButton = document.getElementById('exportTxtButton');
    }
    
    initializeEventListeners() {
        this.numberType.addEventListener('change', () => this.toggleDecimalPlaces());
        this.useSeed.addEventListener('change', () => this.toggleSeedInput());
        this.generateButton.addEventListener('click', () => this.generateNumbers());
        this.resetButton.addEventListener('click', () => this.reset());
        this.copyButton.addEventListener('click', () => this.copyToClipboard());
        this.exportCsvButton.addEventListener('click', () => this.exportCSV());
        this.exportTxtButton.addEventListener('click', () => this.exportTXT());
        
        // Real-time validation
        [this.minValue, this.maxValue, this.quantity].forEach(input => {
            input.addEventListener('input', () => this.clearErrors());
        });
    }
    
    toggleDecimalPlaces() {
        const isDecimal = this.numberType.value === 'decimal';
        this.decimalPlacesGroup.style.display = isDecimal ? 'block' : 'none';
    }
    
    toggleSeedInput() {
        const useSeed = this.useSeed.checked;
        this.seedGroup.style.display = useSeed ? 'block' : 'none';
        if (!useSeed) {
            this.seedValue.value = '';
        }
    }
    
    validateInputs() {
        const errors = [];
        const min = parseFloat(this.minValue.value);
        const max = parseFloat(this.maxValue.value);
        const qty = parseInt(this.quantity.value);
        
        // Basic validation
        if (isNaN(min)) errors.push('Minimum value must be a valid number');
        if (isNaN(max)) errors.push('Maximum value must be a valid number');
        if (!isNaN(min) && !isNaN(max) && min >= max) {
            errors.push('Maximum value must be greater than minimum value');
        }
        if (isNaN(qty) || qty < 1) errors.push('Quantity must be at least 1');
        if (qty > 10000) errors.push('Quantity cannot exceed 10,000');
        
        // No duplicates validation
        if (this.noDuplicates.checked && this.numberType.value === 'integer') {
            const range = Math.floor(max) - Math.ceil(min) + 1;
            if (qty > range) {
                errors.push(`Cannot generate ${qty} unique integers in range ${Math.ceil(min)} to ${Math.floor(max)} (only ${range} possible values)`);
            }
        }
        
        return errors;
    }
    
    showErrors(errors) {
        if (errors.length > 0) {
            const errorHtml = '<ul>' + errors.map(error => `<li>${error}</li>`).join('') + '</ul>';
            this.errorMessages.innerHTML = errorHtml;
            this.errorMessages.style.display = 'block';
            return true;
        }
        return false;
    }
    
    clearErrors() {
        this.errorMessages.style.display = 'none';
    }
    
    // Seeded random number generator (Linear Congruential Generator)
    seedRandom(seed) {
        let currentSeed = seed % 2147483647;
        if (currentSeed <= 0) currentSeed += 2147483646;
        
        return function() {
            currentSeed = currentSeed * 16807 % 2147483647;
            return (currentSeed - 1) / 2147483646;
        };
    }
    
    // Secure random number generator
    getRandomValue() {
        if (this.useSeed.checked && this.seedValue.value) {
            if (!this.seededRandom) {
                this.seededRandom = this.seedRandom(parseInt(this.seedValue.value));
            }
            return this.seededRandom();
        }
        
        // Use crypto.getRandomValues if available, otherwise Math.random
        if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            return array[0] / (0xFFFFFFFF + 1);
        }
        return Math.random();
    }
    
    generateRandomNumber(min, max, isInteger, decimalPlaces) {
        const random = this.getRandomValue();
        const value = min + (random * (max - min));
        
        if (isInteger) {
            return Math.floor(value);
        } else {
            return parseFloat(value.toFixed(decimalPlaces));
        }
    }
    
    generateNumbers() {
        // Clear previous results and reset seeded random if using seed
        this.seededRandom = null;
        
        const errors = this.validateInputs();
        if (this.showErrors(errors)) return;
        
        this.clearErrors();
        
        const min = parseFloat(this.minValue.value);
        const max = parseFloat(this.maxValue.value);
        const qty = parseInt(this.quantity.value);
        const isInteger = this.numberType.value === 'integer';
        const decimalPlaces = parseInt(this.decimalPlaces.value);
        const noDuplicates = this.noDuplicates.checked;
        
        this.generatedNumbers = [];
        const usedNumbers = new Set();
        
        // Generate numbers
        let attempts = 0;
        const maxAttempts = qty * 100; // Prevent infinite loops
        
        while (this.generatedNumbers.length < qty && attempts < maxAttempts) {
            attempts++;
            const number = this.generateRandomNumber(min, max, isInteger, decimalPlaces);
            
            if (noDuplicates) {
                if (!usedNumbers.has(number)) {
                    usedNumbers.add(number);
                    this.generatedNumbers.push(number);
                }
            } else {
                this.generatedNumbers.push(number);
            }
        }
        
        this.displayResults();
    }
    
    displayResults() {
        // Clear previous results
        this.numbersGrid.innerHTML = '';
        
        // Create number items
        this.generatedNumbers.forEach((number, index) => {
            const numberItem = document.createElement('div');
            numberItem.className = 'number-item';
            numberItem.textContent = number.toString();
            numberItem.style.animationDelay = `${index * 0.05}s`;
            this.numbersGrid.appendChild(numberItem);
        });
        
        // Update summary
        this.updateSummary();
        
        // Show results section
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    updateSummary() {
        const count = this.generatedNumbers.length;
        const min = Math.min(...this.generatedNumbers);
        const max = Math.max(...this.generatedNumbers);
        const sum = this.generatedNumbers.reduce((a, b) => a + b, 0);
        const average = (sum / count).toFixed(3);
        
        const summaryHTML = `
            <strong>Summary:</strong><br>
            Numbers Generated: ${count}<br>
            Range: ${min} to ${max}<br>
            Sum: ${sum}<br>
            Average: ${average}
        `;
        
        this.resultsSummary.innerHTML = summaryHTML;
    }
    
    copyToClipboard() {
        const numbersText = this.generatedNumbers.join(', ');
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(numbersText).then(() => {
                this.showSuccessMessage('Numbers copied to clipboard!');
            }).catch(() => {
                this.fallbackCopy(numbersText);
            });
        } else {
            this.fallbackCopy(numbersText);
        }
    }
    
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showSuccessMessage('Numbers copied to clipboard!');
        } catch (err) {
            this.showSuccessMessage('Please manually select and copy the numbers.');
        }
        
        document.body.removeChild(textArea);
    }
    
    exportCSV() {
        const csvContent = 'Number\\n' + this.generatedNumbers.join('\\n');
        this.downloadFile(csvContent, 'random_numbers.csv', 'text/csv');
    }
    
    exportTXT() {
        const txtContent = this.generatedNumbers.join('\\n');
        this.downloadFile(txtContent, 'random_numbers.txt', 'text/plain');
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        this.showSuccessMessage(`File ${filename} downloaded successfully!`);
    }
    
    showSuccessMessage(message) {
        // Create temporary success message
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 3000);
    }
    
    reset() {
        // Reset form values to defaults
        this.minValue.value = '1';
        this.maxValue.value = '100';
        this.numberType.value = 'integer';
        this.decimalPlaces.value = '2';
        this.quantity.value = '1';
        this.noDuplicates.checked = false;
        this.useSeed.checked = false;
        this.seedValue.value = '';
        
        // Hide conditional fields
        this.toggleDecimalPlaces();
        this.toggleSeedInput();
        
        // Clear results and errors
        this.resultsSection.style.display = 'none';
        this.clearErrors();
        this.generatedNumbers = [];
        this.seededRandom = null;
    }
}

// Initialize generator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RandomNumberGenerator();
});