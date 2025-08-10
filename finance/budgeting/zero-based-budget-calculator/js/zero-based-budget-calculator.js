/*
 * FreecalcHub.com - Zero-Based Budget Calculator
 * Version: 1.0
 * Date: January 12, 2025
 * Description: Create zero-based budgets where every dollar has a purpose
 */

document.addEventListener("DOMContentLoaded", () => {
    // DOM Element References
    const monthlyIncomeEl = document.getElementById("monthlyIncome");
    const totalIncomeEl = document.getElementById("totalIncome");
    const totalAllocatedEl = document.getElementById("totalAllocated");
    const remainingBalanceEl = document.getElementById("remainingBalance");
    const categoryTemplateEl = document.getElementById("categoryTemplate");
    const addCategoryButtonEl = document.getElementById("addCategoryButton");
    const categoriesListEl = document.getElementById("categoriesList");
    const calculateButton = document.getElementById("calculateButton");
    const resetButton = document.getElementById("resetButton");
    const exportButton = document.getElementById("exportButton");
    const resultsSection = document.getElementById("resultsSection");
    const errorMessagesDiv = document.getElementById("errorMessages");

    // Results elements
    const budgetStatusEl = document.getElementById("budgetStatus");
    const summaryIncomeEl = document.getElementById("summaryIncome");
    const summaryAllocatedEl = document.getElementById("summaryAllocated");
    const summaryBalanceEl = document.getElementById("summaryBalance");

    // State variables
    let categories = [];
    let categoryCounter = 0;
    let budgetChart = null;

    // Preset category templates
    const categoryTemplates = {
        housing: { name: "Housing", icon: "fas fa-home", description: "Rent/mortgage, property taxes" },
        transportation: { name: "Transportation", icon: "fas fa-car", description: "Car payment, gas, maintenance" },
        food: { name: "Food & Groceries", icon: "fas fa-utensils", description: "Groceries, dining out" },
        utilities: { name: "Utilities", icon: "fas fa-lightbulb", description: "Electric, water, gas, internet" },
        insurance: { name: "Insurance", icon: "fas fa-shield-alt", description: "Health, auto, life insurance" },
        debt: { name: "Debt Payments", icon: "fas fa-credit-card", description: "Credit cards, loans" },
        entertainment: { name: "Entertainment", icon: "fas fa-film", description: "Movies, streaming, hobbies" },
        personal: { name: "Personal Care", icon: "fas fa-user", description: "Healthcare, clothing, personal items" },
        savings: { name: "Savings", icon: "fas fa-piggy-bank", description: "General savings account" },
        emergency: { name: "Emergency Fund", icon: "fas fa-exclamation-triangle", description: "Emergency fund contributions" },
        retirement: { name: "Retirement", icon: "fas fa-chart-line", description: "401k, IRA contributions" }
    };

    // Initialize Event Listeners
    initializeEventListeners();

    function initializeEventListeners() {
        monthlyIncomeEl.addEventListener("input", updateTotals);
        addCategoryButtonEl.addEventListener("click", handleAddCategory);
        calculateButton.addEventListener("click", handleCalculate);
        resetButton.addEventListener("click", handleReset);
        exportButton.addEventListener("click", handleExport);

        // Real-time calculation on income change
        monthlyIncomeEl.addEventListener("input", debounce(updateDisplays, 300));
    }

    function handleAddCategory() {
        const template = categoryTemplateEl.value;
        
        if (!template) {
            showError("Please select a category to add.");
            return;
        }

        if (template === "custom") {
            showCustomCategoryModal();
            return;
        }

        const categoryData = categoryTemplates[template];
        if (categoryData) {
            addCategory(categoryData.name, categoryData.icon, categoryData.description);
        }

        // Reset select
        categoryTemplateEl.value = "";
        clearErrors();
    }

    function addCategory(name, icon, description, amount = 0) {
        const categoryId = `category-${categoryCounter++}`;
        
        const category = {
            id: categoryId,
            name: name,
            icon: icon,
            description: description,
            amount: amount
        };

        categories.push(category);
        renderCategory(category);
        updateTotals();
        return categoryId;
    }

    function renderCategory(category) {
        const categoryEl = document.createElement("div");
        categoryEl.className = "category-item";
        categoryEl.id = category.id;
        categoryEl.innerHTML = `
            <div class="category-icon">
                <i class="${category.icon}"></i>
            </div>
            <div class="category-details">
                <div class="category-name">${category.name}</div>
                <div class="category-description">${category.description}</div>
            </div>
            <input type="number" 
                   class="category-amount-input" 
                   placeholder="0.00" 
                   min="0" 
                   step="0.01" 
                   value="${category.amount}"
                   data-category-id="${category.id}">
            <button class="category-remove" data-category-id="${category.id}" aria-label="Remove ${category.name}">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add event listeners
        const amountInput = categoryEl.querySelector(".category-amount-input");
        const removeButton = categoryEl.querySelector(".category-remove");

        amountInput.addEventListener("input", (e) => {
            updateCategoryAmount(category.id, parseFloat(e.target.value) || 0);
        });

        removeButton.addEventListener("click", () => {
            removeCategory(category.id);
        });

        categoriesListEl.appendChild(categoryEl);
        
        // Show empty state message if needed
        updateEmptyState();
    }

    function updateCategoryAmount(categoryId, amount) {
        const category = categories.find(cat => cat.id === categoryId);
        if (category) {
            category.amount = amount;
            updateTotals();
        }
    }

    function removeCategory(categoryId) {
        const categoryEl = document.getElementById(categoryId);
        if (categoryEl) {
            categoryEl.classList.add("removing");
            setTimeout(() => {
                categories = categories.filter(cat => cat.id !== categoryId);
                categoryEl.remove();
                updateTotals();
                updateEmptyState();
            }, 300);
        }
    }

    function updateEmptyState() {
        const hasCategories = categories.length > 0;
        
        if (!hasCategories) {
            if (!categoriesListEl.querySelector(".categories-empty")) {
                const emptyEl = document.createElement("div");
                emptyEl.className = "categories-empty";
                emptyEl.innerHTML = "No categories added yet. Select a category above and click 'Add Category' to start building your budget.";
                categoriesListEl.appendChild(emptyEl);
            }
        } else {
            const emptyEl = categoriesListEl.querySelector(".categories-empty");
            if (emptyEl) {
                emptyEl.remove();
            }
        }
    }

    function updateTotals() {
        const income = parseFloat(monthlyIncomeEl.value) || 0;
        const totalAllocated = categories.reduce((sum, cat) => sum + cat.amount, 0);
        const remaining = income - totalAllocated;

        // Update display
        totalIncomeEl.textContent = formatCurrency(income);
        totalAllocatedEl.textContent = formatCurrency(totalAllocated);
        remainingBalanceEl.textContent = formatCurrency(remaining);

        // Update remaining balance styling
        remainingBalanceEl.classList.remove("zero", "positive", "negative");
        if (Math.abs(remaining) < 0.01) {
            remainingBalanceEl.classList.add("zero");
        } else if (remaining > 0) {
            remainingBalanceEl.classList.add("positive");
        } else {
            remainingBalanceEl.classList.add("negative");
        }

        return { income, totalAllocated, remaining };
    }

    function updateDisplays() {
        updateTotals();
        if (resultsSection.style.display !== "none") {
            handleCalculate();
        }
    }

    function validateInputs() {
        clearErrors();

        const income = parseFloat(monthlyIncomeEl.value);
        if (isNaN(income) || income <= 0) {
            showError("Please enter a valid monthly income greater than $0.");
            monthlyIncomeEl.focus();
            return false;
        }

        if (categories.length === 0) {
            showError("Please add at least one budget category.");
            return false;
        }

        // Check for negative amounts
        const negativeCategories = categories.filter(cat => cat.amount < 0);
        if (negativeCategories.length > 0) {
            showError("Category amounts cannot be negative.");
            return false;
        }

        return true;
    }

    function handleCalculate() {
        if (!validateInputs()) {
            return;
        }

        const totals = updateTotals();
        displayResults(totals);
        displayChart();
        
        resultsSection.style.display = "block";
        exportButton.style.display = "inline-block";
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function displayResults(totals) {
        const { income, totalAllocated, remaining } = totals;

        // Update summary
        summaryIncomeEl.textContent = formatCurrency(income);
        summaryAllocatedEl.textContent = formatCurrency(totalAllocated);
        summaryBalanceEl.textContent = formatCurrency(Math.abs(remaining));

        // Update budget status
        budgetStatusEl.classList.remove("balanced", "unbalanced", "over-allocated");
        
        if (Math.abs(remaining) < 0.01) {
            budgetStatusEl.textContent = "🎉 Perfect! Your budget is balanced. Every dollar has been allocated.";
            budgetStatusEl.classList.add("balanced");
        } else if (remaining > 0) {
            budgetStatusEl.textContent = `You have ${formatCurrency(remaining)} remaining. Add more categories or increase existing allocations to reach zero.`;
            budgetStatusEl.classList.add("unbalanced");
        } else {
            budgetStatusEl.textContent = `You're over-allocated by ${formatCurrency(Math.abs(remaining))}. Reduce category amounts to balance your budget.`;
            budgetStatusEl.classList.add("over-allocated");
        }
    }

    function displayChart() {
        const ctx = document.getElementById('budgetBreakdownChart').getContext('2d');
        
        // Destroy existing chart
        if (budgetChart) {
            budgetChart.destroy();
        }

        // Prepare data
        const categoryNames = categories.map(cat => cat.name);
        const categoryAmounts = categories.map(cat => cat.amount);
        const colors = generateColors(categories.length);

        const data = {
            labels: categoryNames,
            datasets: [{
                data: categoryAmounts,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 11 },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const amount = data.datasets[0].data[i];
                                    const percentage = ((amount / categoryAmounts.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                    return {
                                        text: `${label}: ${formatCurrency(amount)} (${percentage}%)`,
                                        fillStyle: colors[i],
                                        strokeStyle: colors[i],
                                        lineWidth: 2,
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const amount = context.parsed;
                            const percentage = ((amount / categoryAmounts.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(amount)} (${percentage}%)`;
                        }
                    }
                }
            }
        };

        budgetChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: options
        });
    }

    function generateColors(count) {
        const baseColors = [
            '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
            '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#f1c40f'
        ];
        
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(baseColors[i % baseColors.length]);
        }
        return colors;
    }

    function handleReset() {
        // Clear form
        monthlyIncomeEl.value = "";
        categoryTemplateEl.value = "";
        
        // Clear categories
        categories = [];
        categoriesListEl.innerHTML = "";
        updateEmptyState();
        
        // Update totals
        updateTotals();
        
        // Hide results
        resultsSection.style.display = "none";
        exportButton.style.display = "none";
        
        // Clear errors
        clearErrors();
        
        // Destroy chart
        if (budgetChart) {
            budgetChart.destroy();
            budgetChart = null;
        }
    }

    function handleExport() {
        const totals = updateTotals();
        let exportText = "Zero-Based Budget\n";
        exportText += "==================\n\n";
        exportText += `Monthly Income: ${formatCurrency(totals.income)}\n\n`;
        exportText += "Budget Categories:\n";
        exportText += "------------------\n";
        
        categories.forEach(cat => {
            const percentage = ((cat.amount / totals.income) * 100).toFixed(1);
            exportText += `${cat.name}: ${formatCurrency(cat.amount)} (${percentage}%)\n`;
        });
        
        exportText += "\n";
        exportText += `Total Allocated: ${formatCurrency(totals.totalAllocated)}\n`;
        exportText += `Remaining Balance: ${formatCurrency(totals.remaining)}\n`;
        exportText += `Status: ${Math.abs(totals.remaining) < 0.01 ? 'BALANCED ✓' : 'NEEDS ADJUSTMENT'}\n`;
        exportText += "\n";
        exportText += `Generated by FreecalcHub.com on ${new Date().toLocaleDateString()}`;

        // Create and trigger download
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'zero-based-budget.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    function showCustomCategoryModal() {
        // Simple prompt-based custom category for now
        // In a full implementation, you'd create a proper modal
        const name = prompt("Enter category name:");
        if (!name) return;
        
        const description = prompt("Enter category description (optional):") || "Custom category";
        
        addCategory(name, "fas fa-tag", description);
        clearErrors();
    }

    // Utility Functions
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.round(amount));
    }

    function showError(message) {
        errorMessagesDiv.innerHTML = `<div class="error-message">${message}</div>`;
        errorMessagesDiv.style.display = "block";
        errorMessagesDiv.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function clearErrors() {
        errorMessagesDiv.innerHTML = "";
        errorMessagesDiv.style.display = "none";
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize empty state
    updateEmptyState();
    updateTotals();
});