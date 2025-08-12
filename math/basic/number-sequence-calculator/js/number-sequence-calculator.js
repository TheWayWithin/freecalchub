/**
 * Number Sequence Calculator
 * Comprehensive pattern recognition and sequence generation tool
 */

class NumberSequenceCalculator {
    constructor() {
        this.sequences = {
            arithmetic: [],
            geometric: [],
            fibonacci: [],
            prime: [],
            square: []
        };
        this.currentSequence = [];
        this.currentPattern = null;
        this.missingIndices = [];
        
        this.initializeEventListeners();
        this.generatePrimeCache();
    }

    initializeEventListeners() {
        // Form elements
        const sequenceInput = document.getElementById('sequenceInput');
        const sequenceType = document.getElementById('sequenceType');
        const analyzeButton = document.getElementById('analyzeButton');
        const generateButton = document.getElementById('generateButton');
        const resetButton = document.getElementById('resetButton');
        const copySequenceButton = document.getElementById('copySequenceButton');
        const exportDataButton = document.getElementById('exportDataButton');

        // Event listeners
        sequenceType.addEventListener('change', this.handleSequenceTypeChange.bind(this));
        analyzeButton.addEventListener('click', this.analyzeSequence.bind(this));
        generateButton.addEventListener('click', this.generateSequence.bind(this));
        resetButton.addEventListener('click', this.resetCalculator.bind(this));
        copySequenceButton.addEventListener('click', this.copySequence.bind(this));
        exportDataButton.addEventListener('click', this.exportData.bind(this));

        // Input validation
        sequenceInput.addEventListener('input', this.validateInput.bind(this));
    }

    handleSequenceTypeChange(event) {
        const generationOptions = document.getElementById('generationOptions');
        const analysisOptions = document.getElementById('analysisOptions');
        
        if (event.target.value) {
            generationOptions.style.display = 'block';
            analysisOptions.style.display = 'none';
        } else {
            generationOptions.style.display = 'none';
            analysisOptions.style.display = 'block';
        }
    }

    validateInput(event) {
        const input = event.target.value;
        const errorMessages = document.getElementById('errorMessages');
        
        // Clear previous errors
        errorMessages.style.display = 'none';
        errorMessages.innerHTML = '';

        if (input.length > 0) {
            // Basic validation for comma-separated numbers
            const pattern = /^[\d,._\s-]+$/;
            if (!pattern.test(input)) {
                this.showError('Please enter only numbers, commas, underscores, spaces, and minus signs.');
            }
        }
    }

    showError(message) {
        const errorMessages = document.getElementById('errorMessages');
        errorMessages.innerHTML = `<ul><li>${message}</li></ul>`;
        errorMessages.style.display = 'block';
    }

    clearErrors() {
        const errorMessages = document.getElementById('errorMessages');
        errorMessages.style.display = 'none';
        errorMessages.innerHTML = '';
    }

    parseSequenceInput(input) {
        const parts = input.split(',').map(part => part.trim());
        const sequence = [];
        const missing = [];

        parts.forEach((part, index) => {
            if (part === '_' || part === '') {
                missing.push(index);
                sequence.push(null);
            } else {
                const num = parseFloat(part);
                if (isNaN(num)) {
                    throw new Error(`Invalid number: ${part}`);
                }
                sequence.push(num);
            }
        });

        return { sequence, missing };
    }

    analyzeSequence() {
        try {
            this.clearErrors();
            const input = document.getElementById('sequenceInput').value.trim();
            
            if (!input) {
                this.showError('Please enter a sequence to analyze.');
                return;
            }

            const { sequence, missing } = this.parseSequenceInput(input);
            this.currentSequence = sequence;
            this.missingIndices = missing;

            // Analyze pattern
            const analysis = this.detectPattern(sequence);
            this.currentPattern = analysis;

            // Fill missing terms if pattern detected
            if (analysis.type !== 'unknown' && missing.length > 0) {
                this.fillMissingTerms(sequence, analysis, missing);
            }

            // Generate additional terms
            const nextTerms = parseInt(document.getElementById('nextTerms').value) || 5;
            const extendedSequence = this.generateNextTerms(sequence.filter(n => n !== null), analysis, nextTerms);

            this.displayResults(analysis, extendedSequence, missing);

        } catch (error) {
            this.showError(error.message);
        }
    }

    generateSequence() {
        try {
            this.clearErrors();
            const sequenceType = document.getElementById('sequenceType').value;
            const startValue = parseInt(document.getElementById('startValue').value) || 1;
            const secondValue = parseInt(document.getElementById('secondValue').value) || 2;
            const termCount = parseInt(document.getElementById('termCount').value) || 10;

            if (!sequenceType) {
                this.showError('Please select a sequence type to generate.');
                return;
            }

            let sequence = [];
            let analysis = { type: sequenceType };

            switch (sequenceType) {
                case 'arithmetic':
                    const diff = secondValue - startValue;
                    sequence = this.generateArithmeticSequence(startValue, diff, termCount);
                    analysis.commonDifference = diff;
                    analysis.formula = `an = ${startValue} + (n-1) × ${diff}`;
                    break;

                case 'geometric':
                    const ratio = secondValue / startValue;
                    sequence = this.generateGeometricSequence(startValue, ratio, termCount);
                    analysis.commonRatio = ratio;
                    analysis.formula = `an = ${startValue} × ${ratio}^(n-1)`;
                    break;

                case 'fibonacci':
                    sequence = this.generateFibonacciSequence(termCount, startValue, secondValue);
                    analysis.formula = 'F(n) = F(n-1) + F(n-2)';
                    break;

                case 'prime':
                    sequence = this.generatePrimeSequence(termCount);
                    analysis.formula = 'Prime numbers (no simple formula)';
                    break;

                case 'square':
                    sequence = this.generateSquareSequence(termCount, startValue);
                    analysis.formula = `an = (n + ${startValue - 1})²`;
                    break;

                default:
                    this.showError('Unknown sequence type selected.');
                    return;
            }

            this.currentSequence = sequence;
            this.currentPattern = analysis;
            this.missingIndices = [];

            this.displayResults(analysis, sequence, []);

        } catch (error) {
            this.showError(error.message);
        }
    }

    detectPattern(sequence) {
        const validNumbers = sequence.filter(n => n !== null);
        
        if (validNumbers.length < 2) {
            return { type: 'unknown', reason: 'Need at least 2 numbers to detect pattern' };
        }

        // Test for arithmetic sequence
        const arithmeticResult = this.detectArithmetic(validNumbers);
        if (arithmeticResult.isValid) {
            return {
                type: 'arithmetic',
                commonDifference: arithmeticResult.difference,
                formula: `an = ${validNumbers[0]} + (n-1) × ${arithmeticResult.difference}`,
                explanation: `This is an arithmetic sequence with a common difference of ${arithmeticResult.difference}.`
            };
        }

        // Test for geometric sequence
        const geometricResult = this.detectGeometric(validNumbers);
        if (geometricResult.isValid) {
            return {
                type: 'geometric',
                commonRatio: geometricResult.ratio,
                formula: `an = ${validNumbers[0]} × ${geometricResult.ratio}^(n-1)`,
                explanation: `This is a geometric sequence with a common ratio of ${geometricResult.ratio}.`
            };
        }

        // Test for Fibonacci sequence
        const fibonacciResult = this.detectFibonacci(validNumbers);
        if (fibonacciResult.isValid) {
            return {
                type: 'fibonacci',
                formula: 'F(n) = F(n-1) + F(n-2)',
                explanation: 'This is a Fibonacci sequence where each term is the sum of the two preceding terms.'
            };
        }

        // Test for prime sequence
        const primeResult = this.detectPrimes(validNumbers);
        if (primeResult.isValid) {
            return {
                type: 'prime',
                formula: 'Prime numbers (no simple formula)',
                explanation: 'This is a sequence of prime numbers.'
            };
        }

        // Test for square sequence
        const squareResult = this.detectSquares(validNumbers);
        if (squareResult.isValid) {
            return {
                type: 'square',
                formula: 'an = n²',
                explanation: 'This is a sequence of perfect squares.',
                offset: squareResult.offset
            };
        }

        return { 
            type: 'unknown', 
            explanation: 'No common pattern detected. This may be a custom or complex sequence.',
            formula: 'Pattern not recognized'
        };
    }

    detectArithmetic(sequence) {
        if (sequence.length < 2) return { isValid: false };

        const differences = [];
        for (let i = 1; i < sequence.length; i++) {
            differences.push(sequence[i] - sequence[i - 1]);
        }

        const firstDiff = differences[0];
        const isConstant = differences.every(diff => Math.abs(diff - firstDiff) < 1e-10);

        return {
            isValid: isConstant,
            difference: firstDiff
        };
    }

    detectGeometric(sequence) {
        if (sequence.length < 2) return { isValid: false };

        const ratios = [];
        for (let i = 1; i < sequence.length; i++) {
            if (sequence[i - 1] === 0) return { isValid: false };
            ratios.push(sequence[i] / sequence[i - 1]);
        }

        const firstRatio = ratios[0];
        const isConstant = ratios.every(ratio => Math.abs(ratio - firstRatio) < 1e-10);

        return {
            isValid: isConstant && isFinite(firstRatio),
            ratio: firstRatio
        };
    }

    detectFibonacci(sequence) {
        if (sequence.length < 3) return { isValid: false };

        for (let i = 2; i < sequence.length; i++) {
            if (Math.abs(sequence[i] - (sequence[i - 1] + sequence[i - 2])) > 1e-10) {
                return { isValid: false };
            }
        }

        return { isValid: true };
    }

    detectPrimes(sequence) {
        if (sequence.length < 2) return { isValid: false };

        for (let num of sequence) {
            if (!this.isPrime(num) || num !== Math.floor(num) || num < 2) {
                return { isValid: false };
            }
        }

        // Check if they're consecutive primes
        const primes = this.getPrimesUpTo(Math.max(...sequence) + 100);
        let primeIndex = 0;

        for (let num of sequence) {
            while (primeIndex < primes.length && primes[primeIndex] < num) {
                primeIndex++;
            }
            if (primeIndex >= primes.length || primes[primeIndex] !== num) {
                return { isValid: false };
            }
            primeIndex++;
        }

        return { isValid: true };
    }

    detectSquares(sequence) {
        if (sequence.length < 2) return { isValid: false };

        const squares = sequence.map(num => Math.sqrt(num));
        
        // Check if all are perfect squares
        for (let sqrt of squares) {
            if (sqrt !== Math.floor(sqrt) || sqrt < 0) {
                return { isValid: false };
            }
        }

        // Check if they're consecutive squares
        const firstIndex = squares[0];
        for (let i = 0; i < squares.length; i++) {
            if (squares[i] !== firstIndex + i) {
                return { isValid: false };
            }
        }

        return { 
            isValid: true,
            offset: firstIndex
        };
    }

    fillMissingTerms(sequence, analysis, missingIndices) {
        missingIndices.forEach(index => {
            let value;
            
            switch (analysis.type) {
                case 'arithmetic':
                    value = sequence[0] + index * analysis.commonDifference;
                    break;
                    
                case 'geometric':
                    value = sequence[0] * Math.pow(analysis.commonRatio, index);
                    break;
                    
                case 'fibonacci':
                    if (index >= 2) {
                        value = sequence[index - 1] + sequence[index - 2];
                    }
                    break;
                    
                case 'square':
                    value = Math.pow(analysis.offset + index, 2);
                    break;
                    
                case 'prime':
                    const primes = this.getPrimesUpTo(1000);
                    value = primes[index] || null;
                    break;
            }
            
            if (value !== undefined && value !== null) {
                sequence[index] = value;
            }
        });
    }

    generateNextTerms(sequence, analysis, count) {
        const extended = [...sequence];
        const lastIndex = sequence.length - 1;

        for (let i = 1; i <= count; i++) {
            let nextTerm;

            switch (analysis.type) {
                case 'arithmetic':
                    nextTerm = sequence[lastIndex] + i * analysis.commonDifference;
                    break;
                    
                case 'geometric':
                    nextTerm = sequence[lastIndex] * Math.pow(analysis.commonRatio, i);
                    break;
                    
                case 'fibonacci':
                    nextTerm = extended[extended.length - 1] + extended[extended.length - 2];
                    break;
                    
                case 'square':
                    const nextSquareRoot = Math.sqrt(sequence[lastIndex]) + i;
                    nextTerm = nextSquareRoot * nextSquareRoot;
                    break;
                    
                case 'prime':
                    const primes = this.getPrimesUpTo(10000);
                    const lastPrimeIndex = primes.indexOf(sequence[lastIndex]);
                    nextTerm = primes[lastPrimeIndex + i] || null;
                    break;
                    
                default:
                    nextTerm = null;
            }

            if (nextTerm !== null && nextTerm !== undefined) {
                extended.push(nextTerm);
            }
        }

        return extended;
    }

    // Sequence generation methods
    generateArithmeticSequence(start, difference, count) {
        const sequence = [];
        for (let i = 0; i < count; i++) {
            sequence.push(start + i * difference);
        }
        return sequence;
    }

    generateGeometricSequence(start, ratio, count) {
        const sequence = [];
        for (let i = 0; i < count; i++) {
            sequence.push(start * Math.pow(ratio, i));
        }
        return sequence;
    }

    generateFibonacciSequence(count, first = 0, second = 1) {
        if (count <= 0) return [];
        if (count === 1) return [first];
        
        const sequence = [first, second];
        for (let i = 2; i < count; i++) {
            sequence.push(sequence[i - 1] + sequence[i - 2]);
        }
        return sequence;
    }

    generatePrimeSequence(count) {
        const primes = this.getPrimesUpTo(count * 20); // Estimate upper bound
        return primes.slice(0, count);
    }

    generateSquareSequence(count, start = 1) {
        const sequence = [];
        for (let i = 0; i < count; i++) {
            const num = start + i;
            sequence.push(num * num);
        }
        return sequence;
    }

    // Prime number utilities
    generatePrimeCache() {
        this.primeCache = this.sieveOfEratosthenes(10000);
    }

    sieveOfEratosthenes(limit) {
        const sieve = new Array(limit + 1).fill(true);
        sieve[0] = sieve[1] = false;

        for (let i = 2; i * i <= limit; i++) {
            if (sieve[i]) {
                for (let j = i * i; j <= limit; j += i) {
                    sieve[j] = false;
                }
            }
        }

        return sieve.map((isPrime, num) => isPrime ? num : null)
                   .filter(num => num !== null);
    }

    isPrime(n) {
        if (n < 2) return false;
        if (n === 2) return true;
        if (n % 2 === 0) return false;
        
        for (let i = 3; i * i <= n; i += 2) {
            if (n % i === 0) return false;
        }
        return true;
    }

    getPrimesUpTo(limit) {
        if (limit <= this.primeCache[this.primeCache.length - 1]) {
            return this.primeCache.filter(p => p <= limit);
        }
        
        // Extend cache if needed
        this.primeCache = this.sieveOfEratosthenes(Math.max(limit, 10000));
        return this.primeCache.filter(p => p <= limit);
    }

    displayResults(analysis, sequence, missingIndices) {
        const resultsSection = document.getElementById('resultsSection');
        const patternType = document.getElementById('patternType');
        const sequenceDisplay = document.getElementById('sequenceDisplay');
        const formulaSection = document.getElementById('formulaSection');
        const formulaDisplay = document.getElementById('formulaDisplay');
        const explanationSection = document.getElementById('explanationSection');
        const explanationDisplay = document.getElementById('explanationDisplay');
        const missingTermsSection = document.getElementById('missingTermsSection');
        const missingTermsDisplay = document.getElementById('missingTermsDisplay');
        const statisticsSection = document.getElementById('statisticsSection');
        const statisticsDisplay = document.getElementById('statisticsDisplay');
        const copySequenceButton = document.getElementById('copySequenceButton');
        const exportDataButton = document.getElementById('exportDataButton');

        // Show results section
        resultsSection.style.display = 'block';

        // Display pattern type
        patternType.textContent = analysis.type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

        // Display sequence
        this.displaySequenceWithHighlights(sequenceDisplay, sequence, missingIndices);

        // Show/hide formula section
        const showFormula = document.getElementById('showFormula').checked;
        if (showFormula && analysis.formula) {
            formulaSection.style.display = 'block';
            formulaDisplay.textContent = analysis.formula;
        } else {
            formulaSection.style.display = 'none';
        }

        // Show/hide explanation section
        const showExplanation = document.getElementById('showExplanation').checked;
        if (showExplanation && analysis.explanation) {
            explanationSection.style.display = 'block';
            explanationDisplay.textContent = analysis.explanation;
        } else {
            explanationSection.style.display = 'none';
        }

        // Show missing terms if any were found
        if (missingIndices.length > 0) {
            missingTermsSection.style.display = 'block';
            const missingTerms = missingIndices.map(i => `Position ${i + 1}: ${sequence[i]}`);
            missingTermsDisplay.textContent = missingTerms.join(', ');
        } else {
            missingTermsSection.style.display = 'none';
        }

        // Display statistics
        this.displayStatistics(statisticsDisplay, sequence);
        statisticsSection.style.display = 'block';

        // Show export buttons
        copySequenceButton.style.display = 'inline-block';
        exportDataButton.style.display = 'inline-block';
    }

    displaySequenceWithHighlights(container, sequence, missingIndices) {
        container.innerHTML = '';
        
        sequence.forEach((num, index) => {
            const span = document.createElement('span');
            span.className = 'sequence-number';
            span.textContent = this.formatNumber(num);
            
            if (missingIndices.includes(index)) {
                span.classList.add('missing');
            } else if (index >= this.currentSequence.length) {
                span.classList.add('generated');
            }
            
            container.appendChild(span);
        });
    }

    displayStatistics(container, sequence) {
        const validNumbers = sequence.filter(n => n !== null && isFinite(n));
        
        if (validNumbers.length === 0) {
            container.innerHTML = '<p>No valid numbers to analyze</p>';
            return;
        }

        const min = Math.min(...validNumbers);
        const max = Math.max(...validNumbers);
        const sum = validNumbers.reduce((a, b) => a + b, 0);
        const average = sum / validNumbers.length;
        const range = max - min;

        container.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Count</span>
                <span class="stat-value">${validNumbers.length}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Min</span>
                <span class="stat-value">${this.formatNumber(min)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Max</span>
                <span class="stat-value">${this.formatNumber(max)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Average</span>
                <span class="stat-value">${this.formatNumber(average)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Range</span>
                <span class="stat-value">${this.formatNumber(range)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Sum</span>
                <span class="stat-value">${this.formatNumber(sum)}</span>
            </div>
        `;
    }

    formatNumber(num) {
        if (num === null || num === undefined || !isFinite(num)) return '--';
        
        // Round to avoid floating point precision issues
        if (num % 1 === 0) return num.toString();
        
        return Number(num.toFixed(6)).toString();
    }

    copySequence() {
        const sequence = this.currentSequence.filter(n => n !== null);
        const text = sequence.map(n => this.formatNumber(n)).join(', ');
        
        navigator.clipboard.writeText(text).then(() => {
            this.showSuccessMessage('Sequence copied to clipboard!');
        }).catch(() => {
            this.showError('Failed to copy sequence to clipboard.');
        });
    }

    exportData() {
        const data = {
            sequence: this.currentSequence.filter(n => n !== null),
            pattern: this.currentPattern,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sequence-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccessMessage('Sequence data exported successfully!');
    }

    showSuccessMessage(message) {
        const errorMessages = document.getElementById('errorMessages');
        errorMessages.innerHTML = `<ul><li style="color: green;">${message}</li></ul>`;
        errorMessages.style.display = 'block';
        errorMessages.style.backgroundColor = '#d4edda';
        errorMessages.style.borderColor = '#28a745';

        setTimeout(() => {
            errorMessages.style.display = 'none';
            errorMessages.style.backgroundColor = '';
            errorMessages.style.borderColor = '';
        }, 3000);
    }

    resetCalculator() {
        // Clear all inputs
        document.getElementById('sequenceInput').value = '';
        document.getElementById('sequenceType').value = '';
        document.getElementById('startValue').value = '1';
        document.getElementById('secondValue').value = '2';
        document.getElementById('termCount').value = '10';
        document.getElementById('nextTerms').value = '5';
        
        // Hide sections
        document.getElementById('generationOptions').style.display = 'none';
        document.getElementById('analysisOptions').style.display = 'block';
        document.getElementById('resultsSection').style.display = 'none';
        
        // Clear errors
        this.clearErrors();
        
        // Reset internal state
        this.currentSequence = [];
        this.currentPattern = null;
        this.missingIndices = [];
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NumberSequenceCalculator();
});