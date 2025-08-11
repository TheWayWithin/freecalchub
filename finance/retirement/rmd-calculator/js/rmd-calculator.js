// finance/retirement/rmd-calculator/js/rmd-calculator.js
// Required Minimum Distribution Calculator

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('rmdForm');
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const resultsSection = document.getElementById('resultsSection');
    const errorMessagesDiv = document.getElementById('errorMessages');
    const addAccountBtn = document.getElementById('addAccountBtn');
    const accountsContainer = document.getElementById('accountsContainer');

    // Input Fields
    const currentAgeEl = document.getElementById('currentAge');
    const birthYearEl = document.getElementById('birthYear');
    const annualGrowthRateEl = document.getElementById('annualGrowthRate');
    const projectionYearsEl = document.getElementById('projectionYears');

    // Result Fields
    const totalRmdAmountEl = document.getElementById('totalRmdAmount');
    const totalAccountBalanceEl = document.getElementById('totalAccountBalance');
    const totalWithdrawnEl = document.getElementById('totalWithdrawn');
    const remainingToWithdrawEl = document.getElementById('remainingToWithdraw');
    const accountRmdDetailsEl = document.getElementById('accountRmdDetails');
    const penaltyWarningEl = document.getElementById('penaltyWarning');
    const penaltyMessageEl = document.getElementById('penaltyMessage');
    const penaltyAmountEl = document.getElementById('penaltyAmount');

    // Chart
    let rmdProjectionChart = null;

    // Account counter for unique IDs
    let accountCounter = 1;

    // IRS Uniform Lifetime Table (2022 and later)
    const uniformLifetimeTable = {
        70: 27.4, 71: 26.5, 72: 25.6, 73: 24.7, 74: 23.8, 75: 22.9, 76: 22.0, 77: 21.2, 78: 20.3, 79: 19.5,
        80: 18.7, 81: 17.9, 82: 17.1, 83: 16.3, 84: 15.5, 85: 14.8, 86: 14.1, 87: 13.4, 88: 12.7, 89: 12.0,
        90: 11.4, 91: 10.8, 92: 10.2, 93: 9.6, 94: 9.1, 95: 8.6, 96: 8.1, 97: 7.6, 98: 7.1, 99: 6.7,
        100: 6.3, 101: 5.9, 102: 5.5, 103: 5.2, 104: 4.9, 105: 4.5, 106: 4.2, 107: 3.9, 108: 3.7, 109: 3.4,
        110: 3.1, 111: 2.9, 112: 2.6, 113: 2.4, 114: 2.1, 115: 1.9, 116: 1.9, 117: 1.9, 118: 1.9, 119: 1.9, 120: 1.9
    };

    // RMD start ages based on birth year
    const getRmdStartAge = (birthYear) => {
        if (birthYear <= 1950) return 72;
        if (birthYear >= 1951 && birthYear <= 1959) return 73;
        if (birthYear >= 1960) return 75;
        return 73; // default
    };

    // Event Listeners
    calculateButton.addEventListener('click', calculateRMD);
    resetButton.addEventListener('click', resetForm);
    addAccountBtn.addEventListener('click', addAccount);
    
    // Auto-calculate birth year from age
    currentAgeEl.addEventListener('input', updateBirthYear);
    birthYearEl.addEventListener('input', updateCurrentAge);

    // Account management
    accountsContainer.addEventListener('click', handleAccountRemoval);

    function updateBirthYear() {
        const age = parseInt(currentAgeEl.value);
        if (age && age > 0) {
            const currentYear = new Date().getFullYear();
            birthYearEl.value = currentYear - age;
        }
    }

    function updateCurrentAge() {
        const birthYear = parseInt(birthYearEl.value);
        if (birthYear && birthYear > 1900) {
            const currentYear = new Date().getFullYear();
            currentAgeEl.value = currentYear - birthYear;
        }
    }

    function addAccount() {
        const accountIndex = accountCounter++;
        const accountHtml = `
            <div class="account-entry" data-account-index="${accountIndex}">
                <div class="account-header">
                    <h4>Account #${accountIndex + 1}</h4>
                    <button type="button" class="remove-account-btn">
                        <i class="fas fa-trash"></i> Remove Account
                    </button>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="accountType${accountIndex}">Account Type:</label>
                        <select id="accountType${accountIndex}" required>
                            <option value="">Select Account Type</option>
                            <option value="traditional-ira">Traditional IRA</option>
                            <option value="401k">401(k)</option>
                            <option value="403b">403(b)</option>
                            <option value="457">457(b)</option>
                            <option value="sep-ira">SEP-IRA</option>
                            <option value="simple-ira">SIMPLE IRA</option>
                            <option value="inherited-ira">Inherited IRA</option>
                            <option value="other">Other Qualified Plan</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="accountBalance${accountIndex}">Account Balance (Dec 31, 2024):</label>
                        <input type="number" id="accountBalance${accountIndex}" min="0" step="0.01" placeholder="e.g., 500000" required>
                        <small class="form-help">Balance as of December 31st of the previous year</small>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="accountName${accountIndex}">Account Name/Description (Optional):</label>
                        <input type="text" id="accountName${accountIndex}" placeholder="e.g., Fidelity Traditional IRA">
                    </div>
                    <div class="form-group">
                        <label for="alreadyWithdrawn${accountIndex}">Amount Already Withdrawn This Year:</label>
                        <input type="number" id="alreadyWithdrawn${accountIndex}" min="0" step="0.01" value="0" placeholder="0">
                        <small class="form-help">Enter 0 if no withdrawals made yet</small>
                    </div>
                </div>
            </div>
        `;
        accountsContainer.insertAdjacentHTML('beforeend', accountHtml);
        
        // Update remove button visibility
        updateRemoveButtonVisibility();
    }

    function handleAccountRemoval(event) {
        if (event.target.closest('.remove-account-btn')) {
            const accountEntry = event.target.closest('.account-entry');
            accountEntry.remove();
            updateRemoveButtonVisibility();
            renumberAccounts();
        }
    }

    function updateRemoveButtonVisibility() {
        const accountEntries = accountsContainer.querySelectorAll('.account-entry');
        accountEntries.forEach((entry, index) => {
            const removeBtn = entry.querySelector('.remove-account-btn');
            removeBtn.style.display = accountEntries.length > 1 ? 'inline-flex' : 'none';
        });
    }

    function renumberAccounts() {
        const accountEntries = accountsContainer.querySelectorAll('.account-entry');
        accountEntries.forEach((entry, index) => {
            const header = entry.querySelector('.account-header h4');
            header.textContent = `Account #${index + 1}`;
        });
    }

    function validateInputs() {
        const errors = [];
        const currentAge = parseInt(currentAgeEl.value);
        const birthYear = parseInt(birthYearEl.value);

        // Age validation
        if (!currentAge || currentAge < 70 || currentAge > 120) {
            errors.push('Please enter a valid current age between 70 and 120.');
        }

        // Birth year validation
        if (!birthYear || birthYear < 1900 || birthYear > 1980) {
            errors.push('Please enter a valid birth year between 1900 and 1980.');
        }

        // Check if RMDs are required yet
        if (currentAge && birthYear) {
            const rmdStartAge = getRmdStartAge(birthYear);
            if (currentAge < rmdStartAge) {
                errors.push(`Based on your birth year (${birthYear}), you won't need to start taking RMDs until age ${rmdStartAge}.`);
            }
        }

        // Account validation
        const accountEntries = accountsContainer.querySelectorAll('.account-entry');
        if (accountEntries.length === 0) {
            errors.push('Please add at least one retirement account.');
        }

        accountEntries.forEach((entry, index) => {
            const accountIndex = entry.dataset.accountIndex;
            const accountType = document.getElementById(`accountType${accountIndex}`).value;
            const accountBalance = parseFloat(document.getElementById(`accountBalance${accountIndex}`).value);

            if (!accountType) {
                errors.push(`Please select an account type for Account #${index + 1}.`);
            }

            if (!accountBalance || accountBalance <= 0) {
                errors.push(`Please enter a valid account balance for Account #${index + 1}.`);
            }

            // Check if account requires RMDs
            if (accountType === 'roth-ira') {
                errors.push(`Roth IRAs do not require RMDs during the owner's lifetime. Please remove Account #${index + 1} or change the account type.`);
            }
        });

        return errors;
    }

    function calculateRMD() {
        // Clear previous errors
        errorMessagesDiv.style.display = 'none';
        errorMessagesDiv.innerHTML = '';

        // Validate inputs
        const errors = validateInputs();
        if (errors.length > 0) {
            showErrors(errors);
            return;
        }

        // Get input values
        const currentAge = parseInt(currentAgeEl.value);
        const birthYear = parseInt(birthYearEl.value);
        const growthRate = parseFloat(annualGrowthRateEl.value) / 100 || 0.06;
        const projectionYears = parseInt(projectionYearsEl.value) || 10;

        // Calculate RMDs for each account
        const accounts = [];
        const accountEntries = accountsContainer.querySelectorAll('.account-entry');

        accountEntries.forEach((entry, index) => {
            const accountIndex = entry.dataset.accountIndex;
            const accountType = document.getElementById(`accountType${accountIndex}`).value;
            const accountBalance = parseFloat(document.getElementById(`accountBalance${accountIndex}`).value);
            const accountName = document.getElementById(`accountName${accountIndex}`).value || `${accountType.replace('-', ' ').toUpperCase()} Account`;
            const alreadyWithdrawn = parseFloat(document.getElementById(`alreadyWithdrawn${accountIndex}`).value) || 0;

            const rmd = calculateAccountRMD(currentAge, accountBalance);
            
            accounts.push({
                name: accountName,
                type: accountType,
                balance: accountBalance,
                rmd: rmd,
                alreadyWithdrawn: alreadyWithdrawn,
                remainingRmd: Math.max(0, rmd - alreadyWithdrawn)
            });
        });

        // Calculate totals
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
        const totalRmd = accounts.reduce((sum, acc) => sum + acc.rmd, 0);
        const totalWithdrawn = accounts.reduce((sum, acc) => sum + acc.alreadyWithdrawn, 0);
        const totalRemaining = Math.max(0, totalRmd - totalWithdrawn);

        // Display results
        displayResults(accounts, totalBalance, totalRmd, totalWithdrawn, totalRemaining);

        // Check for penalties
        checkPenalties(accounts, totalRmd, totalWithdrawn);

        // Generate projections and chart
        generateProjections(accounts, currentAge, growthRate, projectionYears);

        // Show results section
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function calculateAccountRMD(age, balance) {
        const lifeFactor = uniformLifetimeTable[age] || uniformLifetimeTable[120];
        return balance / lifeFactor;
    }

    function displayResults(accounts, totalBalance, totalRmd, totalWithdrawn, totalRemaining) {
        // Update summary
        totalRmdAmountEl.textContent = formatCurrency(totalRmd);
        totalAccountBalanceEl.textContent = formatCurrency(totalBalance);
        totalWithdrawnEl.textContent = formatCurrency(totalWithdrawn);
        remainingToWithdrawEl.textContent = formatCurrency(totalRemaining);

        // Update account details
        accountRmdDetailsEl.innerHTML = '';
        accounts.forEach(account => {
            const accountDiv = document.createElement('div');
            accountDiv.className = 'account-rmd-item';
            accountDiv.innerHTML = `
                <div class="account-name">${account.name}</div>
                <div class="account-details">
                    <div class="account-detail">
                        <span class="account-detail-label">Account Balance:</span>
                        <span class="account-detail-value">${formatCurrency(account.balance)}</span>
                    </div>
                    <div class="account-detail">
                        <span class="account-detail-label">Required RMD:</span>
                        <span class="account-detail-value">${formatCurrency(account.rmd)}</span>
                    </div>
                    <div class="account-detail">
                        <span class="account-detail-label">Already Withdrawn:</span>
                        <span class="account-detail-value">${formatCurrency(account.alreadyWithdrawn)}</span>
                    </div>
                    <div class="account-detail">
                        <span class="account-detail-label">Remaining RMD:</span>
                        <span class="account-detail-value ${account.remainingRmd > 0 ? 'text-danger' : 'text-success'}">${formatCurrency(account.remainingRmd)}</span>
                    </div>
                </div>
            `;
            accountRmdDetailsEl.appendChild(accountDiv);
        });
    }

    function checkPenalties(accounts, totalRmd, totalWithdrawn) {
        const shortfall = Math.max(0, totalRmd - totalWithdrawn);
        
        if (shortfall > 0) {
            const penalty = shortfall * 0.25; // 25% penalty
            const reducedPenalty = shortfall * 0.10; // 10% if corrected promptly
            
            penaltyWarningEl.style.display = 'block';
            penaltyMessageEl.innerHTML = `
                <strong>Warning:</strong> You have a shortfall of ${formatCurrency(shortfall)} in your required minimum distributions. 
                If not corrected by December 31st, you may face an IRS penalty.
                <br><br>
                The penalty is 25% of the shortfall amount, but can be reduced to 10% if corrected promptly and proper documentation is filed.
            `;
            penaltyAmountEl.textContent = `${formatCurrency(penalty)} (reducible to ${formatCurrency(reducedPenalty)})`;
        } else {
            penaltyWarningEl.style.display = 'none';
        }
    }

    function generateProjections(accounts, startAge, growthRate, years) {
        const projections = [];
        const currentYear = new Date().getFullYear();
        
        for (let year = 0; year <= years; year++) {
            const age = startAge + year;
            const projectionYear = currentYear + year;
            
            if (age > 120) break; // Practical limit
            
            let totalProjectedBalance = 0;
            let totalProjectedRmd = 0;
            
            accounts.forEach(account => {
                // Project account balance with growth, minus previous year's RMD
                let projectedBalance = account.balance;
                
                for (let i = 1; i <= year; i++) {
                    const ageForYear = startAge + i - 1;
                    const rmdForYear = calculateAccountRMD(ageForYear, projectedBalance);
                    projectedBalance = (projectedBalance - rmdForYear) * (1 + growthRate);
                }
                
                const projectedRmd = calculateAccountRMD(age, projectedBalance);
                
                totalProjectedBalance += projectedBalance;
                totalProjectedRmd += projectedRmd;
            });
            
            projections.push({
                year: projectionYear,
                age: age,
                totalBalance: totalProjectedBalance,
                totalRmd: totalProjectedRmd
            });
        }
        
        createProjectionChart(projections);
    }

    function createProjectionChart(projections) {
        const ctx = document.getElementById('rmdProjectionChart').getContext('2d');
        
        // Destroy existing chart
        if (rmdProjectionChart) {
            rmdProjectionChart.destroy();
        }
        
        const labels = projections.map(p => `${p.year} (Age ${p.age})`);
        const rmdData = projections.map(p => p.totalRmd);
        const balanceData = projections.map(p => p.totalBalance);
        
        rmdProjectionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Required Minimum Distribution',
                        data: rmdData,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1
                    },
                    {
                        label: 'Total Account Balance',
                        data: balanceData,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Projected RMDs and Account Balance Over Time'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Year (Age)'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'RMD Amount ($)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Account Balance ($)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    function showErrors(errors) {
        errorMessagesDiv.innerHTML = `
            <div class="alert alert-danger">
                <strong>Please correct the following errors:</strong>
                <ul>
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            </div>
        `;
        errorMessagesDiv.style.display = 'block';
        errorMessagesDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    function resetForm() {
        form.reset();
        resultsSection.style.display = 'none';
        errorMessagesDiv.style.display = 'none';
        
        // Reset to single account
        const accountEntries = accountsContainer.querySelectorAll('.account-entry');
        accountEntries.forEach((entry, index) => {
            if (index > 0) {
                entry.remove();
            }
        });
        
        accountCounter = 1;
        updateRemoveButtonVisibility();
        
        // Destroy chart
        if (rmdProjectionChart) {
            rmdProjectionChart.destroy();
            rmdProjectionChart = null;
        }
        
        // Reset default values
        annualGrowthRateEl.value = '6';
        projectionYearsEl.value = '10';
        
        // Focus on first input
        currentAgeEl.focus();
    }

    // Initialize
    updateRemoveButtonVisibility();
    
    // Set default focus
    currentAgeEl.focus();
});