// Retrieve display value
const displayValue = document.querySelector('#display-value-text');

// Retrieve all key elements
const keyButtons = document.querySelectorAll('.key');

// Global variables
let currentValue = displayValue.textContent;
let digitLimit = 15;

// Math functions

// Add all numbers in the array
function add(operands) {
    // Calculate and return the sum
    const sum = operands.reduce(
        (sum, currentValue) => sum + currentValue,
    );
    return sum;
}

// Subtract all numbers in the array
function subtract(operands) {
    // Calculate and return the difference
    const difference = operands.reduce(
        (difference, currentValue) => difference - currentValue,
    );
    return difference; 
}

// Multiply all numbers in the array
function multiply(operands) {
    // Calculate and return the product
    const product = operands.reduce(
        (product, currentValue) => product * currentValue,
    );
    return product; 
}

// Divide the initial number by all subsequent numbers in the array
function divide(operands) {
    // Calculate and return the quotient
    const quotient = operands.reduce(
        (quotient, currentValue) => quotient / currentValue,
    );
    return quotient; 
}

// Store pending operations awaiting calculation
const operatorQueue = [];

// Define operator precedence: multiply=4, divide=3, add=2, subtract=1
const operatorRank = {
    'key-multiply': {
        'rank': 2,
        'operation': multiply,
    },
    'key-divide': {
        'rank': 2,
        'operation': divide,
    },
    'key-add': {
        'rank': 1,
        'operation': add,
    },
    'key-subtract': {
        'rank': 1,
        'operation': subtract,
    }
};

// Handle key button clicks
function handleKeyActions() {
    // Iterate through each key button
    keyButtons.forEach((key) => {
        // Add click event handler
        key.onclick = () => {            
            // Update display with key action
            updateDisplay(key);
        }
    });
}

// Format and update number display with locale separators  
function formatNumberDisplay(displayText) {
    // Extract raw number before formatting
    const unformattedNumber = displayText.match(/((?:\d+,*\.*)*)(\*)/)[1];

    // Format number if it doesn't already contain a decimal point
    if (unformattedNumber.includes('.') === false) {
        // Parse and format number with UK locale separators
        const formattedNumber = parseInt(currentValue, 10).toLocaleString('en-GB');

        // Replace unformatted number with locale-formatted version
        displayValue.textContent = displayValue.textContent.replace(unformattedNumber, formattedNumber);

        // Set digit limit: 15 for integers
        digitLimit = 15;
    }

    else {
        // Set digit limit: 10 for decimals
        digitLimit = 10;
    }
}

// Simplify the expression by processing matched groups
function simplifyExpression(operatorId, operatorGroup, expression) {
    // Extract and convert operands to numbers
    const [subExpression, ...operandStrings]  = operatorGroup; 

    // Convert operand strings to numbers
    const operands = operandStrings.map(Number);

    // Log the sub-expression
    console.log('Sub Expression:', subExpression);

    // Log the extracted operands for debugging
    console.log(operands);

    // Log the operator ID
    console.log('Operator Id:', operatorId);

    // Apply the corresponding operation based on operator precedence
    const simplifiedResult = operatorRank[operatorId].operation(operands);
    
    // Log the result of the operation
    console.log('Simplified Result:', simplifiedResult);

    // Replace sub-expression with result
    const simplifiedExpression = expression.replace(subExpression, simplifiedResult, expression);

    // Log the updated expression
    console.log('Simplified Expression:', simplifiedExpression);

    // Update and return the expression
    expression = simplifiedExpression;
    return expression;
}

// Evaluate expression by operator precedence
function evaluateExpression(expression) {
    // Sanitize the expression by removing whitespace and commas
    expression = expression.replace(/\s|\,/g, '');

    // Log the sanitized expression for debugging
    console.log(expression);

    // Log the sorted operator queue for debugging
    console.table(operatorQueue);

    // Get the current size of the operator queue   
    const queueSize = operatorQueue.length;
        
    // If the queue has more than one operator, sort by precedence
    if (queueSize > 1) {
        // Arrange operators by their precedence
        operatorQueue.sort(
            (operatorA, operatorB) => operatorRank[operatorB[0]].rank - operatorRank[operatorA[0]].rank
        );    
    }

    // Process each expression based on operator precedence
    for (let i = 0; i < queueSize; i++) {
        // Get the current operator and its ID from the FIFO queue
        const [operatorId, currentOperator] = operatorQueue.shift();

        // Create a pattern to match numbers with the current operator
        const pattern = `(\\d+)\\${currentOperator}(\\d+)`;

        // Convert the pattern to a regular expression
        const regex = new RegExp(pattern);

        // Log the generated regular expression for debugging
        console.log(regex);

        // Find all matches of the pattern in the mathematical expression
        const operatorMatches = expression.match(regex);

        // Log matched expressions for debugging
        console.table(operatorMatches);

        // Process the matched expressions
        const simplifiedExpression = simplifyExpression(operatorId, operatorMatches, expression);

        // Update the main expression
        expression = simplifiedExpression;
    }
}

// Update display with pressed key
function updateDisplay(key) {
    // Get key action
    const keyAction = key.firstElementChild.textContent;

    // Get the key type (digit, control, or operator)
    const keyType = key.classList[1];

    // Get the key ID for reference in actions
    const keyId = key.id;

    // Copy of display content for manipulation
    let displayText = displayValue.textContent;

    // Process the action based on the key type
    switch (keyType) {
        case 'key-digit':
            // If display shows only zero, overwrite it with new input
            if (displayValue.textContent === '0') {
                // Replace the zero with the clicked digit
                displayText = keyAction
                displayValue.textContent = displayText;
                // Reset tracked value to avoid leading zeros
                currentValue = keyAction;
            }

            // Otherwise append digit if under limit
            else {
                if (currentValue.length < digitLimit) {
                    // Append digit to tracked value
                    currentValue += keyAction;

                    // Update display with current digit
                    displayValue.textContent += keyAction;

                    // Append current digit to displayText, marking for extraction
                    displayText += keyAction.padEnd(keyAction.length + 1, '*');

                    // Apply locale formatting  
                    formatNumberDisplay(displayText);
                }
            }
            
            break;
    
        case 'key-control':
            // Check for 'key-AC' press
            if (keyId === 'key-AC') {
                // Reset display to zero
                displayValue.textContent = '0';
            }

            // Otherwise, on delete press
            else {  
                // Remove the last character if display is not zero  
                if (displayValue.textContent !== '0') { 
                    
                    // Retrieve the last character using negative indexing
                    const lastCharacter = displayValue.textContent.at(-1);

                    // Trim 3 characters if operator (padded) or 1 if digit or decimal point  
                    const updatedDisplayText = /\s/.test(lastCharacter)
                        ? displayValue.textContent.slice(0, displayValue.textContent.length - 3) 
                        : displayValue.textContent.slice(0, -1);

                    // Update display text for further processing
                    displayText = updatedDisplayText;
            
                    // Append marker for number extraction
                    displayText += '*';
            
                    // Update display if there's more than one character left  
                    if (displayValue.textContent.length > 1) {  
                        // Apply updated text to display 
                        displayValue.textContent = updatedDisplayText;  
                    }  
            
                    else {  
                        // Reset display to zero when last digit is removed  
                        displayValue.textContent = '0';  
                    }  
            
                    // Update tracked value, removing non-numeric characters 
                    currentValue = displayText.match(/((?:\d+,*\.*)*)(\*)/)[1].replaceAll(',', '');             
                }

                // Check if current value exists
                if (currentValue.length !== 0) {
                    // Format number
                    formatNumberDisplay(displayText);
                }
            }
            
            break;
            
        case 'key-operator':
            // Skip operator append for equal key
            if (keyId !== 'key-equal') {
                // Append operator if value exists
                if (currentValue.length !== 0) {

                    // Pad operator unless it's decimal key
                    const operator = keyId !== 'key-decimal' 
                        ? keyAction.padStart(2).padEnd(3) 
                        : keyAction;

                    // Append operator to display
                    displayValue.textContent += operator;

                    // If the key pressed is not the 'decimal' key
                    if (keyId !== 'key-decimal') {
                        // Add the operator and action to the queue
                        operatorQueue.push([keyId, keyAction]);
                    }

                    // Reset tracked value after operator added
                    currentValue = '';
                }
            }

            else {
                // Get the current expression from the display
                const currentExpression = displayValue.textContent;

                // Evaluate the current expression
                evaluateExpression(currentExpression);
            }
            break;
        
        default:
            break;
    }

    // Get full width of scrollable content
    const scrollWidth = displayValue.parentElement.scrollWidth;

    // Auto-scroll to keep newest input visible
    displayValue.parentElement.scrollTo({
        left: scrollWidth, // Scroll to full width of content
        behavior: 'instant', // Immediate scroll without animation
    });
}

handleKeyActions();