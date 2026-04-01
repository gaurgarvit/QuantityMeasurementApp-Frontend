const API_BASE_URL = 'http://localhost:8080';
let currentToken = localStorage.getItem('token');

// DOM Elements
const authSection = document.getElementById('auth-section');
const historySection = document.getElementById('history-section');
const showAuthBtn = document.getElementById('show-auth-btn');
const logoutBtn = document.getElementById('logout-btn');
const cancelAuthBtn = document.getElementById('cancel-auth');

const authForm = document.getElementById('auth-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const authBtn = document.getElementById('auth-btn');
const authMessage = document.getElementById('auth-message');

const measurementType = document.getElementById('measurement-type');
const fromUnit = document.getElementById('from-unit');
const toUnit = document.getElementById('to-unit');
const targetUnit = document.getElementById('target-unit');
const fromValue = document.getElementById('from-value');
const toValue = document.getElementById('to-value');
const resultArea = document.getElementById('result-area');
const resultText = document.getElementById('result-text');

const historyTable = document.getElementById('history-table').querySelector('tbody');
const refreshHistoryBtn = document.getElementById('refresh-history');
const showErroredBtn = document.getElementById('show-errored');

// State
let isLogin = true;

const UNITS_CONFIG = {
    LENGTH: ['INCH', 'FEET', 'YARD', 'MILE', 'CENTIMETER', 'METER', 'KILOMETER'],
    VOLUME: ['LITRE', 'GALLON', 'MILLILITRE'],
    WEIGHT: ['GRAM', 'KILOGRAM', 'TONNE'],
    TEMPERATURE: ['CELSIUS', 'FAHRENHEIT', 'KELVIN']
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('App Initialized');
    updateUIState();
    updateUnitOptions();
});

function updateUIState() {
    if (currentToken) {
        console.log('User is logged in');
        showAuthBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        historySection.classList.remove('hidden');
        authSection.classList.add('hidden');
        loadHistory();
    } else {
        console.log('User is not logged in');
        showAuthBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        historySection.classList.add('hidden');
    }
}

// Auth Logic
showAuthBtn.addEventListener('click', () => {
    authSection.classList.toggle('hidden');
    authMessage.textContent = '';
});

cancelAuthBtn.addEventListener('click', () => {
    authSection.classList.add('hidden');
});

loginTab.addEventListener('click', () => {
    isLogin = true;
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    authBtn.textContent = 'Login';
    authMessage.textContent = '';
});

registerTab.addEventListener('click', () => {
    isLogin = false;
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    authBtn.textContent = 'Register';
    authMessage.textContent = '';
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    console.log(`Attempting ${isLogin ? 'Login' : 'Registration'} for user: ${username}`);
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.text();

        if (response.ok) {
            if (isLogin) {
                console.log('Login successful, token received');
                currentToken = data;
                localStorage.setItem('token', currentToken);
                updateUIState();
            } else {
                console.log('Registration successful');
                authMessage.textContent = 'Registration successful! Please login.';
                authMessage.style.color = 'green';
                isLogin = true;
                loginTab.click();
            }
        } else {
            console.error('Auth failed:', data);
            authMessage.textContent = data || 'Authentication failed';
            authMessage.style.color = 'red';
        }
    } catch (err) {
        console.error('Network error during auth:', err);
        authMessage.textContent = 'Error connecting to server';
        authMessage.style.color = 'red';
    }
});

logoutBtn.addEventListener('click', () => {
    console.log('Logging out');
    localStorage.removeItem('token');
    currentToken = null;
    updateUIState();
});

// Measurement Logic
measurementType.addEventListener('change', () => {
    console.log('Measurement type changed to:', measurementType.value);
    updateUnitOptions();
});

function updateUnitOptions() {
    const type = measurementType.value;
    const units = UNITS_CONFIG[type] || [];
    
    const options = units.map(u => `<option value="${u}">${u}</option>`).join('');
    fromUnit.innerHTML = options;
    toUnit.innerHTML = options;
    targetUnit.innerHTML = options;
}

document.querySelectorAll('.op-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        console.log(`Button clicked for operation: ${btn.dataset.op}`);
        performOperation(btn.dataset.op);
    });
});

async function performOperation(op) {
    const payload = {
        thisValue: parseFloat(fromValue.value) || 0,
        thisUnit: fromUnit.value,
        thisMeasurementType: measurementType.value,
        thatValue: parseFloat(toValue.value) || 0,
        thatUnit: toUnit.value,
        thatMeasurementType: measurementType.value,
        targetUnit: targetUnit.value,
        targetMeasurementType: measurementType.value
    };

    console.log(`Sending payload for ${op}:`, payload);

    const headers = { 'Content-Type': 'application/json' };
    if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/quantities/${op}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        console.log(`Response status for ${op}:`, response.status);

        if (response.ok) {
            const data = await response.json();
            console.log(`Data received for ${op}:`, data);
            
            resultArea.classList.remove('hidden');
            if (data.error) {
                resultText.textContent = `Error: ${data.errorMessage}`;
                resultText.style.color = 'red';
            } else {
                resultText.textContent = data.resultString || `Result: ${data.resultValue} ${data.resultUnit || ''}`;
                resultText.style.color = '#166534';
            }
            if (currentToken) loadHistory();
        } else if (response.status === 403) {
            console.error('403 Forbidden - Token might be invalid or expired');
            alert('Session expired or unauthorized. Please login again.');
            logoutBtn.click();
        } else {
            const errorData = await response.text();
            console.error('Operation failed:', errorData);
            alert(`Operation failed: ${errorData}`);
        }
    } catch (err) {
        console.error(`Error during ${op} operation:`, err);
        alert('Error connecting to server. Check console for details.');
    }
}

// History Logic
refreshHistoryBtn.addEventListener('click', () => {
    console.log('Refreshing history');
    loadHistory();
});

showErroredBtn.addEventListener('click', () => {
    console.log('Loading errored history');
    loadHistory('/history/errored');
});

async function loadHistory(endpoint = '/history/type/' + measurementType.value) {
    if (!currentToken) return;

    console.log(`Loading history from: ${endpoint}`);
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/quantities${endpoint}`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        if (response.ok) {
            const history = await response.json();
            console.log(`Loaded ${history.length} history items`);
            renderHistory(history);
        } else {
            console.error('Failed to load history, status:', response.status);
        }
    } catch (err) {
        console.error('Failed to load history:', err);
    }
}

function renderHistory(history) {
    historyTable.innerHTML = history.map(item => `
        <tr>
            <td>${item.measurementType}</td>
            <td>${item.operation}</td>
            <td>${item.inputValue1} ${item.inputUnit1}</td>
            <td>${item.inputValue2 ? item.inputValue2 + ' ' + item.inputUnit2 : '-'}</td>
            <td>${item.error ? '<span style="color:red">Error</span>' : (item.resultValue !== null ? item.resultValue + ' ' + (item.resultUnit || '') : item.resultString)}</td>
            <td>${new Date(item.timestamp).toLocaleString()}</td>
        </tr>
    `).join('');
}
