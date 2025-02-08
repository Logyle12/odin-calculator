// Retrieve display elements
const expressionDisplay = document.querySelector('#expression-display');
const resultDisplay = document.querySelector('#result-display');

// Retrieve all key elements
const keyButtons = document.querySelectorAll('.key');

// Calculator object holding state and configurations
const calculator = {
    // Store latest number value
    currentOperand: expressionDisplay.value,

    // Max digits allowed
    digitLimit: 15,

    // Operator keys mapped to rank and function
    operatorRank: {
        // Multiplication
        'key-multiply': {
            'rank': 2,
            'operation': multiply,
        },
        // Division
        'key-divide': {
            'rank': 2,
            'operation': divide,
        },
        // Addition
        'key-add': {
            'rank': 1,
            'operation': add,
        },
        // Subtraction
        'key-subtract': {
            'rank': 1,
            'operation': subtract,
        }
    },

    // Store pending operations awaiting calculation
    operatorQueue: [],
};

// Math functions

// Add all numbers in the array
function add(operands) {
    // Calculate and return the sum
    const sum = operands.reduce(
        (sum, number) => sum + number,
    );
    return sum;
}

// Subtract all numbers in the array
function subtract(operands) {
    // Calculate and return the difference
    const difference = operands.reduce(
        (difference, number) => difference - number,
    );
    return difference; 
}

// Multiply all numbers in the array
function multiply(operands) {
    // Calculate and return the product
    const product = operands.reduce(
        (product, number) => product * number,
    );
    return product; 
}

// Divide the initial number by all subsequent numbers in the array
function divide(operands) {
    // Calculate and return the quotient
    const quotient = operands.reduce(
        (quotient, number) => quotient / number,
    );
    return quotient; 
}

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
        const formattedNumber = parseInt(calculator.currentOperand, 10).toLocaleString('en-GB');

        // Replace unformatted number with locale-formatted version
        expressionDisplay.value = expressionDisplay.value.replace(unformattedNumber, formattedNumber);

        // Set digit limit: 15 for integers
        calculator.digitLimit = 15;
    }

    else {
        // Set digit limit: 10 for decimals (11 for dp)
        calculator.digitLimit = 11;
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
    const simplifiedResult = calculator.operatorRank[operatorId].operation(operands);
    
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

    // Get the current size of the operator queue   
    const queueSize = calculator.operatorQueue.length;
        
    // If the queue has more than one operator, sort by precedence
    if (queueSize > 1) {
        // Arrange operators by their precedence
        calculator.operatorQueue.sort(
            (operatorA, operatorB) => calculator.operatorRank[operatorB[0]].rank - calculator.operatorRank[operatorA[0]].rank
        );    
    }

    // Log the sorted operator queue for debugging
    console.table(calculator.operatorQueue);

    // Process each expression based on operator precedence
    for (let i = 0; i < queueSize; i++) {
        // Destructure priority operator's details from queue
        const [operatorId, currentOperator] = calculator.operatorQueue[i];

        // Create a pattern to match numbers with the current operator
        const pattern = `(\\-?\\d+\\.?\\d*)\\${currentOperator}(\\-?\\d+\\.?\\d*)`;

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

    return expression;
}

// Process and format the result of a mathematical expression
function processResult(displayElement, expression) {
    // Get the last displayed character
    const lastCharacter = expression.at(-1);

    console.log(/[+−÷×]/.test(expression));

    // Evaluate if we have both operands (preceded by operator)
    if (/\d+\s[+−÷×]\s\d+/.test(expression)) {
        // // Proceed only if a complete expression
        if (/\d/.test(lastCharacter)) {
            // Evaluate the current expression and store the result
            const computedResult = evaluateExpression(expression);
    
            // Display the result using locale separators
            displayElement.value = parseFloat(computedResult, 10).toLocaleString('en-GB');
        }
    }

    // Clear the results display if the expression is incomplete  
    else {
        resultDisplay.value = '';
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
    let displayText = expressionDisplay.value;

    // Process the action based on the key type
    switch (keyType) {
        case 'key-digit':
            // If display shows only zero, overwrite it with new input
            if (expressionDisplay.value === '0') {
                // Replace the zero with the clicked digit
                displayText = keyAction
                expressionDisplay.value = displayText;
                // Reset tracked value to avoid leading zeros
                calculator.currentOperand = keyAction;
            }

            // Otherwise append digit if under limit
            else {
                if (calculator.currentOperand.length < calculator.digitLimit) {
                    // Append digit to tracked value
                    calculator.currentOperand += keyAction;

                    // Update display with current digit
                    expressionDisplay.value += keyAction;

                    // Append current digit to displayText, marking for extraction
                    displayText += keyAction.padEnd(keyAction.length + 1, '*');

                    // Apply locale formatting  
                    formatNumberDisplay(displayText);
                }
            }

            // Check if expression contains an operator
            const currentExpression = expressionDisplay.value;

            // Process if at least two operands are present
            processResult(resultDisplay, currentExpression);

            // Log current calculator value
            console.log(calculator.currentOperand);
                        
            break;
    
        case 'key-control':
            // Check for 'key-AC' press
            if (keyId === 'key-AC') {
                // Reset expression display to zero
                expressionDisplay.value = '0';

                // Clear result display 
                resultDisplay.value = '';

                // If non-empty queue
                if (calculator.operatorQueue.length !== 0) {
                    // Clear operator queue
                    calculator.operatorQueue = [];
                }

            }

            // Otherwise, on delete press
            else {  
                // Remove the last character if display is not zero  
                if (expressionDisplay.value !== '0') { 
                    // Remove all whitespace characters
                    displayText = displayText.replaceAll(/\s/g, '');
                    console.log(displayText);
                    
                    // Retrieve the last character using negative indexing
                    const lastCharacter = displayText.at(-1);

                    // Check if the last character is an operator
                    if (/[+−÷×]/.test(lastCharacter)) {
                        // Get the index of the last matching operator in the queue    
                        const operatorIndex = calculator.operatorQueue.findLastIndex(
                            (operatorEntry) => lastCharacter === operatorEntry[1]
                        );

                        // Dequeue the last matching operator
                        calculator.operatorQueue.splice(operatorIndex, 1);
                    }

                    // Trim 3 characters if operator (padded) or 1 if digit or decimal point  
                    const updatedExpression = /[+−÷×]/.test(lastCharacter)
                        ? expressionDisplay.value.slice(0, expressionDisplay.value.length - 3) 
                        : expressionDisplay.value.slice(0, -1);

                    // Update display text for further processing
                    displayText = updatedExpression;
            
                    // Append marker for number extraction
                    displayText += '*';
            
                    // Update display if there's more than one character left  
                    if (expressionDisplay.value.length > 1) {  
                        // Apply updated text to display 
                        expressionDisplay.value = updatedExpression; 
                        
                        // Compute new result and update display
                        processResult(resultDisplay, updatedExpression);
                        
                        // Log current queue state of operators
                        console.table(calculator.operatorQueue);
                    }  
            
                    else {  
                        // Reset display to zero when last digit is removed  
                        expressionDisplay.value = '0';  
                    }  
            
                    // Update tracked value, removing non-numeric characters 
                    calculator.currentOperand = displayText.match(/((?:\d+,*\.*)*)(\*)/)[1].replaceAll(',', '');             
                }

                // Check if current value exists
                if (calculator.currentOperand.length !== 0) {
                    // Format number
                    formatNumberDisplay(displayText);
                }
            }
            
            break;
            
        case 'key-operator':
            // Get the last displayed character
            const lastCharacter = expressionDisplay.value.at(-1);

            // Skip operator append for equal and decimal key
            if (keyId !== 'key-equal' && keyId !== 'key-decimal') {
                // Handle operator replacement when the last input is whitespace
                if (/\s/.test(lastCharacter)) {
                    // Extract the previous operator from the queue
                    const dequeuedOperator = calculator.operatorQueue.shift()[1];
                    
                    // Create a regex to replace the previous operator, ensuring it's not followed by a digit
                    const operatorRegex = new RegExp(`\\${dequeuedOperator}(?=\\s(?!\\d))`);
                    
                    // Replace the old operator with the new one in the display
                    const updatedExpression = expressionDisplay.value.replace(operatorRegex, keyAction);
                    
                    // Update operator queue and display
                    calculator.operatorQueue.push([keyId, keyAction]);
                    expressionDisplay.value = updatedExpression;
                }

                // Append operator if value exists
                if (calculator.currentOperand.length !== 0) {

                    // Pad operator unless it's decimal key
                    const operator = keyAction.padStart(2).padEnd(3);

                    // Append operator to display
                    expressionDisplay.value += operator;

                    // Add the operator and action to the queue
                    calculator.operatorQueue.push([keyId, keyAction]);

                    // Reset tracked value after operator added
                    calculator.currentOperand = '';
                }
            }

            // Check if the decimal key was pressed
            else if (keyId === 'key-decimal') {
                // Add decimal point if currentOperand doesn't have one yet
                if (calculator.currentOperand.includes('.') === false) {
                    // Add '0' if input not preceded by a digit
                    if (calculator.currentOperand.length === 0) {

                        // Prepend decimal point with 0 for correct notation
                        calculator.currentOperand = keyAction.padStart(keyAction.length + 1, '0');
                    
                        // Update the display to reflect the current input
                        expressionDisplay.value += calculator.currentOperand;  
                    }

                    // Otherwise, append decimal to existing number
                    else {
                        // Append the decimal point to the current input value
                        calculator.currentOperand += keyAction;

                        // Append the decimal point to the current display value
                        expressionDisplay.value += keyAction;
                    }
                    
                }
            }

            // On equal press
            else {  
                // Get the current expression from the display
                const finalExpression = expressionDisplay.value;

                // Process and format the result of the current expression
                processResult(expressionDisplay, finalExpression);

                // Reset operator queue after final calculation
                calculator.operatorQueue = [];
            }

            break;
        
        default:
            break;
    }

    // Get full width of scrollable content
    const scrollWidth = expressionDisplay.scrollWidth;

    // Auto-scroll to keep newest input visible
    expressionDisplay.scrollTo({
        left: scrollWidth, // Scroll to full width of content
        behavior: 'instant', // Immediate scroll without animation
    });
}

handleKeyActions();