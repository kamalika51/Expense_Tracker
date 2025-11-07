// Load Google Charts
google.charts.load('current', {'packages':['corechart']});

// Application State
const state = {
    user: null,
    expenses: [],
    categories: ['Food & Dining', 'Shopping', 'Transport', 'Entertainment', 'Bills & Utilities', 'Health', 'Education', 'Travel', 'Other'],
    monthlyBudget: 5000,
    currency: '₹',
    darkMode: false,
    themeColor: '#4361ee',
    notifications: [
        { title: 'Budget Alert', message: 'You\'ve spent 49% of your monthly budget', time: '2 hours ago', type: 'info' },
        { title: 'Unusual Spending', message: 'Your dining out expenses are 25% higher than last month', time: '1 day ago', type: 'warning' },
        { title: 'Weekly Report', message: 'Your weekly spending report is ready', time: '3 days ago', type: 'info' }
    ],
    chartsReady: false
};

// DOM Elements
const elements = {
    // Pages
    loginPage: document.getElementById('login-page'),
    appContainer: document.getElementById('app-container'),
    
    // User Info
    userName: document.getElementById('user-name'),
    userAvatar: document.getElementById('user-avatar'),
    welcomeName: document.getElementById('welcome-name'),
    
    // Views
    views: document.querySelectorAll('.view'),
    navLinks: document.querySelectorAll('.nav-link'),
    
    // Dashboard
    totalExpenses: document.getElementById('total-expenses'),
    remainingBudget: document.getElementById('remaining-budget'),
    transactionCount: document.getElementById('transaction-count'),
    avgExpense: document.getElementById('avg-expense'),
    budgetProgress: document.getElementById('budget-progress'),
    budgetUsed: document.getElementById('budget-used'),
    totalBudget: document.getElementById('total-budget'),
    budgetAlert: document.getElementById('budget-alert'),
    alertMessage: document.getElementById('alert-message'),
    insightsContainer: document.getElementById('insights-container'),
    dailyTip: document.getElementById('daily-tip'),
    
    // Forms
    expenseForm: document.getElementById('expense-form'),
    expenseCategory: document.getElementById('expense-category'),
    categoryFilter: document.getElementById('category-filter'),
    newCategory: document.getElementById('new-category'),
    addCategoryBtn: document.getElementById('add-category-btn'),
    monthlyBudgetInput: document.getElementById('monthly-budget'),
    currencySelector: document.getElementById('currency'),
    saveSettings: document.getElementById('save-settings'),
    exportCsv: document.getElementById('export-csv'),
    logoutBtn: document.getElementById('logout-btn'),
    
    // Tables
    expensesTable: document.getElementById('expenses-table').querySelector('tbody'),
    categoryList: document.getElementById('category-list'),
    
    // Theme
    themeToggle: document.getElementById('theme-toggle'),
    colorOptions: document.querySelectorAll('.color-option'),
    
    // Search
    searchInput: document.getElementById('search-input'),
    
    // Mobile menu
    mobileMenuToggle: document.querySelector('.mobile-menu-toggle'),
    sidebar: document.querySelector('.sidebar'),
    
    // Notifications
    notificationBtn: document.getElementById('notification-btn'),
    notificationPanel: document.getElementById('notification-panel'),
    closeNotifications: document.getElementById('close-notifications'),
    overlay: document.getElementById('overlay')
};

// Initialize the application
function init() {
    loadData();
    setupEventListeners();
    checkLoginStatus();
    renderCategories();
    renderExpenses();
    updateDashboard();
    checkBudgetAlert();
    showDailyTip();
    generateInsights();
    
    // Set current date as default for expense form
    document.getElementById('expense-date').valueAsDate = new Date();
    
    // Set callback for when Google Charts is loaded
    google.charts.setOnLoadCallback(() => {
        state.chartsReady = true;
        updateCharts();
    });
}

// Check if user is logged in
function checkLoginStatus() {
    const user = localStorage.getItem('user');
    if (user) {
        state.user = JSON.parse(user);
        showApp();
    } else {
        window.location.href = 'login.html';
    }
}

// Show app
function showApp() {
    if (elements.appContainer) {
        elements.appContainer.style.display = 'block';
    }
    
    // Update user info
    if (state.user) {
        if (elements.userName) elements.userName.textContent = state.user.name;
        if (elements.welcomeName) elements.welcomeName.textContent = state.user.name;
        if (elements.userAvatar) elements.userAvatar.textContent = state.user.name.charAt(0).toUpperCase();
    }
}

// Load data from localStorage
function loadData() {
    const savedUser = localStorage.getItem('user');
    const savedExpenses = localStorage.getItem('expenses');
    const savedCategories = localStorage.getItem('categories');
    const savedBudget = localStorage.getItem('monthlyBudget');
    const savedCurrency = localStorage.getItem('currency');
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedThemeColor = localStorage.getItem('themeColor');

    if (savedUser) state.user = JSON.parse(savedUser);
    if (savedExpenses) state.expenses = JSON.parse(savedExpenses);
    if (savedCategories) state.categories = JSON.parse(savedCategories);
    if (savedBudget) state.monthlyBudget = parseFloat(savedBudget);
    if (savedCurrency) state.currency = savedCurrency;
    if (savedDarkMode) state.darkMode = JSON.parse(savedDarkMode);
    if (savedThemeColor) state.themeColor = savedThemeColor;

    // Apply saved theme
    if (state.darkMode) {
        document.body.classList.add('dark-mode');
        if (elements.themeToggle) elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Apply saved theme color
    document.documentElement.style.setProperty('--primary', state.themeColor);
    
    // Update gradient
    const gradient = `linear-gradient(135deg, ${state.themeColor} 0%, ${adjustColor(state.themeColor, -40)} 100%)`;
    document.documentElement.style.setProperty('--gradient', gradient);
    
    // Update UI with saved values
    if (elements.monthlyBudgetInput) {
        elements.monthlyBudgetInput.value = state.monthlyBudget;
    }
    if (elements.currencySelector) {
        elements.currencySelector.value = state.currency;
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('user', JSON.stringify(state.user));
    localStorage.setItem('expenses', JSON.stringify(state.expenses));
    localStorage.setItem('categories', JSON.stringify(state.categories));
    localStorage.setItem('monthlyBudget', state.monthlyBudget.toString());
    localStorage.setItem('currency', state.currency);
    localStorage.setItem('darkMode', JSON.stringify(state.darkMode));
    localStorage.setItem('themeColor', state.themeColor);
}

// Set up event listeners
function setupEventListeners() {
    // Logout
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', () => {
            state.user = null;
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }

    // Navigation
    if (elements.navLinks) {
        elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.getAttribute('data-view');
                switchView(view);
                
                // Update active link
                elements.navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    // Expense form
    if (elements.expenseForm) {
        elements.expenseForm.addEventListener('submit', addExpense);
    }

    // Category management
    if (elements.addCategoryBtn) {
        elements.addCategoryBtn.addEventListener('click', addCategory);
    }

    // Settings
    if (elements.saveSettings) {
        elements.saveSettings.addEventListener('click', saveSettings);
    }
    if (elements.exportCsv) {
        elements.exportCsv.addEventListener('click', exportToCSV);
    }

    // Theme toggle
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', toggleTheme);
    }

    // Color options
    if (elements.colorOptions) {
        elements.colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                const color = option.getAttribute('data-color');
                changeThemeColor(color);
                
                // Update active color
                elements.colorOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            });
        });
    }

    // Search and filters
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', filterExpenses);
    }
    if (elements.categoryFilter) {
        elements.categoryFilter.addEventListener('change', filterExpenses);
    }
    const dateFilter = document.getElementById('date-filter');
    if (dateFilter) {
        dateFilter.addEventListener('change', filterExpenses);
    }

    // Mobile menu
    if (elements.mobileMenuToggle) {
        elements.mobileMenuToggle.addEventListener('click', () => {
            elements.sidebar.classList.toggle('active');
        });
    }

    // Notifications
    if (elements.notificationBtn) {
        elements.notificationBtn.addEventListener('click', () => {
            elements.notificationPanel.classList.add('active');
            elements.overlay.classList.add('active');
        });
    }

    if (elements.closeNotifications) {
        elements.closeNotifications.addEventListener('click', () => {
            elements.notificationPanel.classList.remove('active');
            elements.overlay.classList.remove('active');
        });
    }

    if (elements.overlay) {
        elements.overlay.addEventListener('click', () => {
            elements.notificationPanel.classList.remove('active');
            elements.overlay.classList.remove('active');
        });
    }
}

// Switch between views
function switchView(viewName) {
    if (!elements.views) return;
    
    elements.views.forEach(view => {
        view.classList.remove('active');
    });
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    // Update page title
    const pageTitle = document.querySelector('.page-title h2');
    const pageDescription = document.querySelector('.page-title p');
    
    if (pageTitle && pageDescription) {
        const titles = {
            dashboard: 'Dashboard',
            'add-expense': 'Add Expense',
            expenses: 'All Expenses',
            categories: 'Categories',
            settings: 'Settings'
        };

        const descriptions = {
            dashboard: 'Welcome back! Here\'s your financial overview',
            'add-expense': 'Add a new expense to track',
            expenses: 'View and manage all your expenses',
            categories: 'Customize your expense categories',
            settings: 'Customize your app preferences'
        };
        
        pageTitle.textContent = titles[viewName] || 'Dashboard';
        pageDescription.textContent = descriptions[viewName] || 'Welcome back!';
    }
    
    // Special handling for certain views
    if (viewName === 'dashboard') {
        updateDashboard();
    } else if (viewName === 'expenses') {
        renderExpenses();
    }
}

// Render category dropdowns and lists
function renderCategories() {
    if (!elements.expenseCategory) return;
    
    // Clear existing options
    elements.expenseCategory.innerHTML = '<option value="">Select Category</option>';
    if (elements.categoryFilter) {
        elements.categoryFilter.innerHTML = '<option value="">All Categories</option>';
    }
    if (elements.categoryList) {
        elements.categoryList.innerHTML = '';
    }

    // Add categories to dropdowns
    state.categories.forEach(category => {
        // Expense form dropdown
        const option1 = document.createElement('option');
        option1.value = category;
        option1.textContent = category;
        elements.expenseCategory.appendChild(option1);

        // Filter dropdown
        if (elements.categoryFilter) {
            const option2 = document.createElement('option');
            option2.value = category;
            option2.textContent = category;
            elements.categoryFilter.appendChild(option2);
        }

        // Category list
        if (elements.categoryList) {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.innerHTML = `
                <span>${category}</span>
                <button class="btn btn-danger btn-sm delete-category" data-category="${category}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            `;
            elements.categoryList.appendChild(categoryItem);
        }
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-category').forEach(button => {
        button.addEventListener('click', (e) => {
            const category = e.target.closest('button').getAttribute('data-category');
            deleteCategory(category);
        });
    });
}

// Add a new expense
function addExpense(e) {
    e.preventDefault();
    
    const title = document.getElementById('expense-title').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const payment = document.getElementById('expense-payment').value;
    const date = document.getElementById('expense-date').value;
    const notes = document.getElementById('expense-notes').value;
    
    const expense = {
        id: Date.now(),
        title,
        amount,
        category,
        payment,
        date,
        notes
    };
    
    state.expenses.push(expense);
    saveData();
    renderExpenses();
    updateDashboard();
    checkBudgetAlert();
    generateInsights();
    
    // Reset form
    elements.expenseForm.reset();
    document.getElementById('expense-date').valueAsDate = new Date();
    
    // Show success message
    alert('Expense added successfully!');
}

// Render expenses table
function renderExpenses(expensesToRender = state.expenses) {
    if (!elements.expensesTable) return;
    
    elements.expensesTable.innerHTML = '';
    
    if (expensesToRender.length === 0) {
        elements.expensesTable.innerHTML = '<tr><td colspan="6" style="text-align: center;">No expenses found</td></tr>';
        return;
    }
    
    expensesToRender.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.title}</td>
            <td>${state.currency}${expense.amount.toFixed(2)}</td>
            <td>${expense.category}</td>
            <td>${expense.payment}</td>
            <td>${formatDate(expense.date)}</td>
            <td class="action-buttons">
                <button class="action-btn edit" data-id="${expense.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete delete-expense" data-id="${expense.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        elements.expensesTable.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('button').getAttribute('data-id'));
            editExpense(id);
        });
    });
    
    document.querySelectorAll('.delete-expense').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('button').getAttribute('data-id'));
            deleteExpense(id);
        });
    });
}

// Edit an expense
function editExpense(id) {
    const expense = state.expenses.find(exp => exp.id === id);
    if (!expense) return;
    
    // Populate form with expense data
    document.getElementById('expense-title').value = expense.title;
    document.getElementById('expense-amount').value = expense.amount;
    document.getElementById('expense-category').value = expense.category;
    document.getElementById('expense-payment').value = expense.payment;
    document.getElementById('expense-date').value = expense.date;
    document.getElementById('expense-notes').value = expense.notes;
    
    // Remove the expense from the list
    deleteExpense(id, false);
    
    // Switch to add expense view
    switchView('add-expense');
    
    // Update active nav link
    elements.navLinks.forEach(link => link.classList.remove('active'));
    document.querySelector('[data-view="add-expense"]').classList.add('active');
}

// Delete an expense
function deleteExpense(id, confirm = true) {
    if (confirm && !window.confirm('Are you sure you want to delete this expense?')) {
        return;
    }
    
    state.expenses = state.expenses.filter(exp => exp.id !== id);
    saveData();
    renderExpenses();
    updateDashboard();
    checkBudgetAlert();
    generateInsights();
}

// Add a new category
function addCategory() {
    const categoryName = elements.newCategory.value.trim();
    
    if (!categoryName) {
        alert('Please enter a category name');
        return;
    }
    
    if (state.categories.includes(categoryName)) {
        alert('Category already exists');
        return;
    }
    
    state.categories.push(categoryName);
    saveData();
    renderCategories();
    elements.newCategory.value = '';
}

// Delete a category
function deleteCategory(category) {
    if (!window.confirm(`Are you sure you want to delete the category "${category}"?`)) {
        return;
    }
    
    // Check if category is used in any expenses
    const isUsed = state.expenses.some(expense => expense.category === category);
    
    if (isUsed) {
        alert('This category is used in existing expenses and cannot be deleted');
        return;
    }
    
    state.categories = state.categories.filter(cat => cat !== category);
    saveData();
    renderCategories();
}

// Update dashboard with current data
function updateDashboard() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = state.expenses.filter(exp => exp.date.startsWith(currentMonth));
    
    // Calculate totals
    const total = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = Math.max(0, state.monthlyBudget - total);
    const transactionCount = monthlyExpenses.length;
    const avgDaily = transactionCount > 0 ? total / new Date().getDate() : 0;
    
    // Update UI
    if (elements.totalExpenses) elements.totalExpenses.textContent = `${state.currency}${total.toFixed(2)}`;
    if (elements.remainingBudget) elements.remainingBudget.textContent = `${state.currency}${remaining.toFixed(2)}`;
    if (elements.transactionCount) elements.transactionCount.textContent = transactionCount;
    if (elements.avgExpense) elements.avgExpense.textContent = `${state.currency}${avgDaily.toFixed(2)}`;
    
    // Update budget progress
    const budgetPercentage = state.monthlyBudget > 0 ? (total / state.monthlyBudget) * 100 : 0;
    if (elements.budgetProgress) elements.budgetProgress.style.width = `${Math.min(budgetPercentage, 100)}%`;
    if (elements.budgetUsed) elements.budgetUsed.textContent = `${state.currency}${total.toFixed(2)}`;
    if (elements.totalBudget) elements.totalBudget.textContent = `${state.currency}${state.monthlyBudget.toFixed(2)}`;
    
    // Update charts
    if (state.chartsReady) {
        updateCharts();
    }
}

// Update charts with current data using Google Charts
function updateCharts() {
    if (!state.chartsReady) return;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = state.expenses.filter(exp => exp.date.startsWith(currentMonth));
    
    // Category chart data
    const categoryData = {};
    state.categories.forEach(category => {
        categoryData[category] = 0;
    });
    
    monthlyExpenses.forEach(expense => {
        if (categoryData.hasOwnProperty(expense.category)) {
            categoryData[expense.category] += expense.amount;
        }
    });
    
    // Prepare data for Pie Chart
    const pieData = [['Category', 'Amount']];
    for (const [category, amount] of Object.entries(categoryData)) {
        if (amount > 0) {
            pieData.push([category, amount]);
        }
    }
    
    // Category Pie Chart
    const categoryChartDiv = document.getElementById('category-chart');
    if (categoryChartDiv && pieData.length > 1) {
        const data = google.visualization.arrayToDataTable(pieData);
        
        const options = {
            title: '',
            pieHole: 0.4,
            colors: ['#4361ee', '#3a86ff', '#fb5607', '#8338ec', '#06d6a0', '#ff006e', '#ffbe0b', '#4cc9f0', '#7209b7', '#f72585'],
            legend: { 
                position: 'bottom',
                textStyle: {
                    color: state.darkMode ? '#e9ecef' : '#333333',
                    fontSize: 12
                }
            },
            pieSliceText: 'percentage',
            pieSliceTextStyle: {
                color: 'white',
                fontSize: 14
            },
            chartArea: { width: '90%', height: '75%' },
            backgroundColor: 'transparent',
            tooltip: {
                text: 'both',
                textStyle: {
                    fontSize: 12
                }
            }
        };
        
        const chart = new google.visualization.PieChart(categoryChartDiv);
        chart.draw(data, options);
    }
    
    // Trend chart data (last 6 months)
    const months = [];
    const monthlyTotals = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthYear = date.toISOString().slice(0, 7);
        const monthName = date.toLocaleString('default', { month: 'short' });
        
        months.push(monthName);
        
        const monthlyTotal = state.expenses
            .filter(exp => exp.date.startsWith(monthYear))
            .reduce((sum, exp) => sum + exp.amount, 0);
        
        monthlyTotals.push(monthlyTotal);
    }
    
    // Prepare data for Line Chart
    const lineData = [['Month', 'Expenses']];
    for (let i = 0; i < months.length; i++) {
        lineData.push([months[i], monthlyTotals[i]]);
    }
    
    // Trend Line Chart
    const trendChartDiv = document.getElementById('trend-chart');
    if (trendChartDiv) {
        const data = google.visualization.arrayToDataTable(lineData);
        
        const options = {
            title: '',
            curveType: 'function',
            legend: { position: 'bottom' },
            colors: ['#4361ee'],
            chartArea: { width: '85%', height: '70%' },
            backgroundColor: 'transparent',
            titleTextStyle: {
                color: state.darkMode ? '#e9ecef' : '#333333'
            },
            legendTextStyle: {
                color: state.darkMode ? '#e9ecef' : '#333333'
            },
            hAxis: {
                textStyle: {
                    color: state.darkMode ? '#e9ecef' : '#333333'
                }
            },
            vAxis: {
                textStyle: {
                    color: state.darkMode ? '#e9ecef' : '#333333'
                },
                gridlines: {
                    color: state.darkMode ? '#333' : '#e0e0e0'
                }
            }
        };
        
        const chart = new google.visualization.LineChart(trendChartDiv);
        chart.draw(data, options);
    }
}

// Check budget and show alert if needed
function checkBudgetAlert() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = state.expenses.filter(exp => exp.date.startsWith(currentMonth));
    const total = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    if (state.monthlyBudget > 0) {
        const percentage = (total / state.monthlyBudget) * 100;
        
        if (percentage >= 80 && percentage < 100) {
            if (elements.alertMessage) elements.alertMessage.textContent = `⚠ You've spent ${percentage.toFixed(0)}% of your budget!`;
            if (elements.budgetAlert) elements.budgetAlert.style.display = 'flex';
        } else if (percentage >= 100) {
            if (elements.alertMessage) elements.alertMessage.textContent = `⚠ You've exceeded your budget by ${(percentage - 100).toFixed(0)}%!`;
            if (elements.budgetAlert) elements.budgetAlert.style.display = 'flex';
        } else {
            if (elements.budgetAlert) elements.budgetAlert.style.display = 'none';
        }
    } else {
        if (elements.budgetAlert) elements.budgetAlert.style.display = 'none';
    }
}

// Generate smart insights
function generateInsights() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().slice(0, 7);
    
    const currentMonthExpenses = state.expenses.filter(exp => exp.date.startsWith(currentMonth));
    const lastMonthExpenses = state.expenses.filter(exp => exp.date.startsWith(lastMonthStr));
    
    // Calculate totals
    const currentTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const lastTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Calculate category changes
    const categoryChanges = {};
    state.categories.forEach(category => {
        const currentCatTotal = currentMonthExpenses
            .filter(exp => exp.category === category)
            .reduce((sum, exp) => sum + exp.amount, 0);
        
        const lastCatTotal = lastMonthExpenses
            .filter(exp => exp.category === category)
            .reduce((sum, exp) => sum + exp.amount, 0);
        
        if (lastCatTotal > 0) {
            const change = ((currentCatTotal - lastCatTotal) / lastCatTotal) * 100;
            categoryChanges[category] = change;
        }
    });
    
    // Find highest spending category
    let highestCategory = '';
    let highestAmount = 0;
    
    state.categories.forEach(category => {
        const total = currentMonthExpenses
            .filter(exp => exp.category === category)
            .reduce((sum, exp) => sum + exp.amount, 0);
        
        if (total > highestAmount) {
            highestAmount = total;
            highestCategory = category;
        }
    });
    
    // Generate insights
    const insights = [];
    
    // Budget insight
    if (state.monthlyBudget > 0) {
        const budgetPercentage = (currentTotal / state.monthlyBudget) * 100;
        if (budgetPercentage < 50) {
            insights.push({title: 'Budget Status', message: 'You are on track to save money this month!'});
        } else if (budgetPercentage < 80) {
            insights.push({title: 'Budget Status', message: 'You are spending at a moderate pace this month.'});
        } else {
            insights.push({title: 'Budget Alert', message: 'Consider reducing non-essential expenses to stay within budget.'});
        }
    }
    
    // Category insights
    for (const [category, change] of Object.entries(categoryChanges)) {
        if (change > 25) {
            insights.push({title: 'Spending Alert', message: `You spent ${change.toFixed(0)}% more on ${category} this month than last month.`});
        } else if (change < -25) {
            insights.push({title: 'Savings Achievement', message: `You spent ${Math.abs(change).toFixed(0)}% less on ${category} this month. Good job!`});
        }
    }
    
    // Highest spending insight
    if (highestCategory) {
        insights.push({title: 'Spending Analysis', message: `Your highest spending category is ${highestCategory} (${state.currency}${highestAmount.toFixed(2)}).`});
    }
    
    // Default insight if none generated
    if (insights.length === 0) {
        insights.push({title: 'Getting Started', message: 'Keep tracking your expenses to get personalized insights.'});
    }
    
    // Render insights
    if (elements.insightsContainer) {
        elements.insightsContainer.innerHTML = '';
        insights.forEach(insight => {
            const insightCard = document.createElement('div');
            insightCard.className = 'card insight-card';
            insightCard.innerHTML = `
                <div class="insight-icon">
                    <i class="fas fa-lightbulb"></i>
                </div>
                <div class="insight-text">
                    <h4>${insight.title}</h4>
                    <p>${insight.message}</p>
                </div>
            `;
            elements.insightsContainer.appendChild(insightCard);
        });
    }
}

// Show daily saving tip
function showDailyTip() {
    const tips = [
        "Set a monthly budget and track your spending against it.",
        "Review your expenses weekly to identify spending patterns.",
        "Use cash for discretionary spending to better feel the impact.",
        "Automate savings by setting up automatic transfers to a savings account.",
        "Cook at home more often to save on food expenses.",
        "Cancel unused subscriptions to reduce recurring costs.",
        "Use public transportation or carpool to save on travel costs.",
        "Shop with a list to avoid impulse purchases.",
        "Compare prices before making significant purchases.",
        "Set financial goals to stay motivated with saving."
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    if (elements.dailyTip) {
        elements.dailyTip.innerHTML = `<p>${randomTip}</p>`;
    }
}

// Filter expenses based on search and filters
function filterExpenses() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const categoryFilter = elements.categoryFilter ? elements.categoryFilter.value : '';
    const dateFilter = document.getElementById('date-filter').value;
    
    let filteredExpenses = state.expenses;
    
    // Apply search filter
    if (searchTerm) {
        filteredExpenses = filteredExpenses.filter(exp => 
            exp.title.toLowerCase().includes(searchTerm) || 
            exp.notes.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply category filter
    if (categoryFilter) {
        filteredExpenses = filteredExpenses.filter(exp => exp.category === categoryFilter);
    }
    
    // Apply date filter
    if (dateFilter) {
        filteredExpenses = filteredExpenses.filter(exp => exp.date.startsWith(dateFilter));
    }
    
    renderExpenses(filteredExpenses);
}

// Save settings
function saveSettings() {
    const budget = parseFloat(elements.monthlyBudgetInput.value) || 0;
    const currency = elements.currencySelector.value;
    
    state.monthlyBudget = budget;
    state.currency = currency;
    
    saveData();
    updateDashboard();
    checkBudgetAlert();
    
    alert('Settings saved successfully!');
}

// Toggle dark/light mode
function toggleTheme() {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle('dark-mode');
    
    if (state.darkMode) {
        elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    saveData();
    
    // Redraw charts with new theme
    if (state.chartsReady) {
        updateCharts();
    }
}

// Change theme color
function changeThemeColor(color) {
    state.themeColor = color;
    document.documentElement.style.setProperty('--primary', color);
    
    // Update gradient
    const gradient = `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -40)} 100%)`;
    document.documentElement.style.setProperty('--gradient', gradient);
    
    saveData();
    
    // Redraw charts with new color
    if (state.chartsReady) {
        updateCharts();
    }
}

// Helper function to adjust color brightness
function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

// Export expenses to CSV
function exportToCSV() {
    if (state.expenses.length === 0) {
        alert('No expenses to export');
        return;
    }
    
    const headers = ['Title', 'Amount', 'Category', 'Payment Method', 'Date', 'Notes'];
    const csvContent = [
        headers.join(','),
        ...state.expenses.map(exp => [
            `"${exp.title}"`,
            exp.amount,
            exp.category,
            exp.payment,
            exp.date,
            `"${exp.notes}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);