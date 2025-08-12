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
        
        // Expression queue for proper PEMDAS evaluation
        this.expression = [];
        this.lastOperation = null;
        
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
            this.lastOperation = null; // Clear last operation when starting new number
        } else {
            this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
        }
        this.updateDisplay();
    }
    
    inputDecimal() {
        if (this.waitingForNewValue) {
            this.currentValue = '0.';
            this.waitingForNewValue = false;
            this.lastOperation = null; // Clear last operation when starting new number
        } else if (this.currentValue.indexOf('.') === -1) {
            this.currentValue += '.';
        }
        this.updateDisplay();
    }
    
    setOperation(nextOperation) {
        const inputValue = parseFloat(this.currentValue);
        
        // If we're changing operations on the same number, just update the operation
        if (this.waitingForNewValue && this.lastOperation) {
            // Replace the last operation in the expression
            if (this.expression.length > 0) {
                this.expression[this.expression.length - 1] = nextOperation;
            }
        } else {
            // Add the current number to the expression if it's not already there
            if (this.expression.length === 0 || typeof this.expression[this.expression.length - 1] === 'string') {
                this.expression.push(inputValue);
            }
            
            // Add the operation to the expression
            this.expression.push(nextOperation);
        }
        
        this.waitingForNewValue = true;
        this.operation = nextOperation;
        this.lastOperation = nextOperation;
        
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
                    return null; // Return null instead of 0 for error handling
                }
                result = prev / current;
                break;
            default:
                return current;
        }
        
        // Round to avoid floating point errors
        return Math.round((result + Number.EPSILON) * 1000000000000) / 1000000000000;
    }
    
    // New method: Evaluate expression with proper PEMDAS precedence
    evaluateExpression() {
        if (this.expression.length === 0) {
            return parseFloat(this.currentValue);
        }
        
        // Create a copy of the expression to work with
        let expr = [...this.expression];
        
        // Add the current value if we have a pending operation
        if (expr.length > 0 && typeof expr[expr.length - 1] === 'string') {
            expr.push(parseFloat(this.currentValue));
        }
        
        // If expression is incomplete, return current value
        if (expr.length === 0) {
            return parseFloat(this.currentValue);
        }
        
        // Handle single number
        if (expr.length === 1) {
            return expr[0];
        }
        
        try {
            // First pass: Handle multiplication and division (left to right)
            let i = 1;
            while (i < expr.length) {
                const operator = expr[i];
                if (operator === '×' || operator === '÷') {
                    const left = expr[i - 1];
                    const right = expr[i + 1];
                    let result;
                    
                    if (operator === '×') {
                        result = left * right;
                    } else { // ÷
                        if (right === 0) {
                            this.showError('Cannot divide by zero');
                            return null;
                        }
                        result = left / right;
                    }
                    
                    // Replace the three elements with the result
                    expr.splice(i - 1, 3, result);
                    // Don't increment i since we removed elements
                } else {
                    i += 2; // Skip to next operator
                }
            }
            
            // Second pass: Handle addition and subtraction (left to right)
            i = 1;
            while (i < expr.length) {
                const operator = expr[i];
                if (operator === '+' || operator === '-') {
                    const left = expr[i - 1];
                    const right = expr[i + 1];
                    const result = operator === '+' ? left + right : left - right;
                    
                    // Replace the three elements with the result
                    expr.splice(i - 1, 3, result);
                    // Don't increment i since we removed elements
                } else {
                    i += 2; // Skip to next operator
                }
            }
            
            // Should have a single result
            const finalResult = expr[0];
            
            // Round to avoid floating point errors
            return Math.round((finalResult + Number.EPSILON) * 1000000000000) / 1000000000000;
            
        } catch (error) {
            console.error('Expression evaluation error:', error);
            return parseFloat(this.currentValue);
        }
    }
    
    calculate() {
        // Evaluate the complete expression with PEMDAS precedence
        const result = this.evaluateExpression();
        
        // Handle division by zero error
        if (result === null) {
            return; // Error already shown in evaluateExpression
        }
        
        // Update state
        this.currentValue = String(result);
        this.previousValue = null;
        this.operation = null;
        this.waitingForNewValue = true;
        this.expression = []; // Clear the expression
        this.lastOperation = null;
        
        this.updateDisplay();
        this.clearActiveOperation();
    }
    
    clearAll() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForNewValue = false;
        this.expression = []; // Clear expression queue
        this.lastOperation = null;
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
        this.waitingForNewValue = true; // After storing, next input should start fresh
        this.updateMemoryIndicator();
    }
    
    memoryRecall() {
        if (this.hasMemory) {
            // Memory recall should behave like inputting a complete new number
            this.currentValue = String(this.memory);
            // Set waitingForNewValue to false so that subsequent number inputs will append
            this.waitingForNewValue = false;
            this.lastOperation = null; // Clear any operation state
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