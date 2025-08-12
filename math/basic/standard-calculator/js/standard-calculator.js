// Standard Calculator JavaScript
class StandardCalculator {
    constructor() {
        this.display = document.getElementById('display');
        this.memoryIndicator = document.getElementById('memoryIndicator');
        
        // Calculator state
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForNewValue = false;
        this.memory = 0;
        this.hasMemory = false;
        
        // Initialize event listeners
        this.initializeButtons();
        this.initializeKeyboard();
        
        // Update display
        this.updateDisplay();
    }
    
    initializeButtons() {
        // Number buttons
        document.querySelectorAll('.btn-calc.number').forEach(button => {
            button.addEventListener('click', (e) => {
                const value = e.target.textContent;
                if (value === '.') {
                    this.inputDecimal();
                } else {
                    this.inputNumber(value);
                }
                this.addPressedEffect(e.target);
            });
        });
        
        // Operation buttons
        document.getElementById('add').addEventListener('click', () => this.setOperation('+'));
        document.getElementById('subtract').addEventListener('click', () => this.setOperation('-'));
        document.getElementById('multiply').addEventListener('click', () => this.setOperation('×'));
        document.getElementById('divide').addEventListener('click', () => this.setOperation('÷'));
        
        // Special buttons
        document.getElementById('equals').addEventListener('click', () => this.calculate());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
        document.getElementById('clearEntry').addEventListener('click', () => this.clearEntry());
        document.getElementById('backspace').addEventListener('click', () => this.backspace());
        
        // Memory buttons
        document.getElementById('memoryStore').addEventListener('click', () => this.memoryStore());
        document.getElementById('memoryRecall').addEventListener('click', () => this.memoryRecall());
        document.getElementById('memoryAdd').addEventListener('click', () => this.memoryAdd());
        document.getElementById('memoryClear').addEventListener('click', () => this.memoryClear());
        
        // Add pressed effect to operation buttons
        document.querySelectorAll('.btn-calc.operation, .btn-calc.equals, .btn-calc.clear, .btn-calc.memory').forEach(button => {
            button.addEventListener('click', (e) => this.addPressedEffect(e.target));
        });
    }
    
    initializeKeyboard() {
        document.addEventListener('keydown', (e) => {
            e.preventDefault(); // Prevent default browser behavior
            
            const key = e.key;
            
            // Numbers
            if (key >= '0' && key <= '9') {
                this.inputNumber(key);
                this.highlightButton(key);
            }
            
            // Decimal point
            else if (key === '.' || key === ',') {
                this.inputDecimal();
                this.highlightButton('decimal');
            }
            
            // Operations
            else if (key === '+') {
                this.setOperation('+');
                this.highlightButton('add');
            }
            else if (key === '-') {
                this.setOperation('-');
                this.highlightButton('subtract');
            }
            else if (key === '*') {
                this.setOperation('×');
                this.highlightButton('multiply');
            }
            else if (key === '/') {
                this.setOperation('÷');
                this.highlightButton('divide');
            }
            
            // Calculate
            else if (key === 'Enter' || key === '=') {
                this.calculate();
                this.highlightButton('equals');
            }
            
            // Clear
            else if (key === 'Escape') {
                this.clearAll();
                this.highlightButton('clearAll');
            }
            else if (key === 'Delete' || key === 'Backspace') {
                if (e.ctrlKey) {
                    this.clearAll();
                } else {
                    this.backspace();
                }
                this.highlightButton('backspace');
            }
        });
    }
    
    inputNumber(num) {
        if (this.waitingForNewValue) {
            this.currentValue = num;
            this.waitingForNewValue = false;
        } else {
            this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
        }
        this.updateDisplay();
    }
    
    inputDecimal() {
        if (this.waitingForNewValue) {
            this.currentValue = '0.';
            this.waitingForNewValue = false;
        } else if (this.currentValue.indexOf('.') === -1) {
            this.currentValue += '.';
        }
        this.updateDisplay();
    }
    
    setOperation(nextOperation) {
        const inputValue = parseFloat(this.currentValue);
        
        if (this.previousValue === null) {
            this.previousValue = inputValue;
        } else if (this.operation) {
            const currentValue = this.previousValue || 0;
            const newValue = this.performCalculation();
            
            this.currentValue = String(newValue);
            this.previousValue = newValue;
            this.updateDisplay();
        }
        
        this.waitingForNewValue = true;
        this.operation = nextOperation;
        
        // Visual feedback for active operation
        this.highlightActiveOperation(nextOperation);
    }
    
    performCalculation() {
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        
        if (isNaN(prev) || isNaN(current)) return current;
        
        let result;
        switch (this.operation) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError('Cannot divide by zero');
                    return 0;
                }
                result = prev / current;
                break;
            default:
                return current;
        }
        
        // Round to avoid floating point errors
        return Math.round((result + Number.EPSILON) * 1000000000000) / 1000000000000;
    }
    
    calculate() {
        const inputValue = parseFloat(this.currentValue);
        
        if (this.previousValue !== null && this.operation) {
            const newValue = this.performCalculation();
            this.currentValue = String(newValue);
            this.previousValue = null;
            this.operation = null;
            this.waitingForNewValue = true;
            
            this.updateDisplay();
            this.clearActiveOperation();
        }
    }
    
    clearAll() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForNewValue = false;
        this.updateDisplay();
        this.clearActiveOperation();
    }
    
    clearEntry() {
        this.currentValue = '0';
        this.updateDisplay();
    }
    
    backspace() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }
    
    // Memory functions
    memoryStore() {
        this.memory = parseFloat(this.currentValue) || 0;
        this.hasMemory = true;
        this.updateMemoryIndicator();
    }
    
    memoryRecall() {
        if (this.hasMemory) {
            this.currentValue = String(this.memory);
            this.waitingForNewValue = true;
            this.updateDisplay();
        }
    }
    
    memoryAdd() {
        if (this.hasMemory) {
            this.memory += parseFloat(this.currentValue) || 0;
        } else {
            this.memory = parseFloat(this.currentValue) || 0;
            this.hasMemory = true;
        }
        this.updateMemoryIndicator();
    }
    
    memoryClear() {
        this.memory = 0;
        this.hasMemory = false;
        this.updateMemoryIndicator();
    }
    
    updateDisplay() {
        let displayValue = this.currentValue;
        
        // Handle very large or very small numbers with scientific notation
        const numValue = parseFloat(displayValue);
        if (Math.abs(numValue) >= 1e12 || (Math.abs(numValue) < 1e-6 && numValue !== 0)) {
            displayValue = numValue.toExponential(6);
            this.display.classList.add('scientific');
        } else {
            this.display.classList.remove('scientific');
            // Limit decimal places for readability
            if (displayValue.includes('.') && displayValue.length > 12) {
                const parts = displayValue.split('.');
                if (parts[1].length > 10) {
                    displayValue = parseFloat(displayValue).toFixed(10);
                    // Remove trailing zeros
                    displayValue = displayValue.replace(/\.?0+$/, '');
                }
            }
        }
        
        this.display.value = displayValue;
    }
    
    updateMemoryIndicator() {
        if (this.hasMemory && this.memory !== 0) {
            this.memoryIndicator.style.display = 'block';
        } else {
            this.memoryIndicator.style.display = 'none';
        }
    }
    
    showError(message) {
        this.display.value = 'Error';
        this.display.classList.add('error');
        
        setTimeout(() => {
            this.display.classList.remove('error');
            this.clearAll();
        }, 2000);
        
        console.error('Calculator Error:', message);
    }
    
    addPressedEffect(button) {
        button.classList.add('pressed');
        setTimeout(() => button.classList.remove('pressed'), 100);
    }
    
    highlightButton(buttonId) {
        let button;
        if (buttonId >= '0' && buttonId <= '9') {
            const numberButtons = {
                '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
                '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'
            };
            button = document.getElementById(numberButtons[buttonId]);
        } else {
            button = document.getElementById(buttonId);
        }
        
        if (button) {
            this.addPressedEffect(button);
        }
    }
    
    highlightActiveOperation(operation) {
        // Clear previous active states
        this.clearActiveOperation();
        
        // Set new active state
        let button;
        switch (operation) {
            case '+':
                button = document.getElementById('add');
                break;
            case '-':
                button = document.getElementById('subtract');
                break;
            case '×':
                button = document.getElementById('multiply');
                break;
            case '÷':
                button = document.getElementById('divide');
                break;
        }
        
        if (button) {
            button.classList.add('active');
        }
    }
    
    clearActiveOperation() {
        document.querySelectorAll('.btn-calc.operation').forEach(button => {
            button.classList.remove('active');
        });
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StandardCalculator();
});

// Prevent context menu on calculator buttons for better UX
document.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('btn-calc')) {
        e.preventDefault();
    }
});