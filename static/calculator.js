const expressionInput = document.getElementById('expression');
const resultOutput = document.querySelector('.calculator-result');
const calculatorForm = document.getElementById('calculator-form');
const clearButton = document.getElementById('clear');
const historyList = document.getElementById('history-list');
const historyStatus = document.getElementById('history-status');
const clearHistoryButton = document.getElementById('clear-history');
const HISTORY_STORAGE_KEY = 'calculatorHistory';
const MAX_HISTORY_ITEMS = 20;
let history = [];

function clearString() {
    expressionInput.value = '';
    resultOutput.textContent = 'Result Here';
}

function cleanExpression(expression) {
    return expression.replace(/[^0-9.+*/()-]/g, '');
}

function renderHistory() {
    historyList.replaceChildren();

    if (history.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'history-empty';
        emptyItem.textContent = 'No calculations yet.';
        historyList.append(emptyItem);
        return;
    }

    history.forEach((entry) => {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'history-entry';
        button.dataset.expression = entry.expression;
        button.dataset.result = entry.result;
        button.textContent = `${entry.expression} = ${entry.result}`;
        item.append(button);
        historyList.append(item);
    });
}

function restoreHistory() {
    let savedHistory;
    try {
        savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    } catch (error) {
        console.error('Unable to load calculation history:', error);
        historyStatus.textContent = 'Saved history is unavailable in this browser.';
        renderHistory();
        return;
    }

    if (savedHistory) {
        try {
            const parsedHistory = JSON.parse(savedHistory);
            if (!Array.isArray(parsedHistory)) {
                throw new TypeError('Saved history must be a list.');
            }
            history = parsedHistory
                .filter((entry) => (
                    entry
                    && typeof entry.expression === 'string'
                    && typeof entry.result === 'string'
                ))
                .slice(0, MAX_HISTORY_ITEMS);
        } catch (error) {
            console.error('Unable to parse calculation history:', error);
            historyStatus.textContent = 'Saved history could not be read.';
        }
    }

    renderHistory();
}

function saveHistoryEntry(expression, result) {
    history.unshift({ expression, result });
    history = history.slice(0, MAX_HISTORY_ITEMS);
    renderHistory();

    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
        historyStatus.textContent = 'Saved on this device.';
    } catch (error) {
        console.error('Unable to save calculation history:', error);
        historyStatus.textContent = 'Calculation succeeded, but history could not be saved on this device.';
    }
}

clearButton.addEventListener('click', clearString);

historyList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-expression]');
    if (!button) {
        return;
    }

    expressionInput.value = button.dataset.expression;
    resultOutput.textContent = button.dataset.result;
    expressionInput.focus();
    historyStatus.textContent = 'Loaded from history.';
});

clearHistoryButton.addEventListener('click', () => {
    history = [];
    renderHistory();

    try {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
        historyStatus.textContent = 'History cleared.';
    } catch (error) {
        console.error('Unable to clear calculation history:', error);
        historyStatus.textContent = 'History cleared for this session, but saved history could not be removed.';
    }
});

calculatorForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const expression = cleanExpression(expressionInput.value);
    if (expression === '') {
        resultOutput.textContent = 'Result';
        return;
    }

    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ expression })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Calculation failed.');
        }
        resultOutput.textContent = data.result;
        saveHistoryEntry(expression, String(data.result));
    } catch (error) {
        console.error('Calculation error:', error);
        resultOutput.textContent = error.message || 'Error';
    }
});

restoreHistory();