const expressionInput = document.getElementById('expression');
const resultOutput = document.querySelector('.calculator-result');
const calculatorForm = document.getElementById('calculator-form');
const clearButton = document.getElementById('clear');

function clearString() {
    expressionInput.value = '';
    resultOutput.textContent = 'Result Here';
}

function cleanExpression(expression) {
    return expression.replace(/[^0-9.+*/()-]/g, '');
}

clearButton.addEventListener('click', clearString);

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
    } catch (error) {
        console.error('Calculation error:', error);
        resultOutput.textContent = error.message || 'Error';
    }
});