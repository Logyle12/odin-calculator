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

     // Track count of opening and closing parentheses
    depthTracker: {
        'openingCount': 0,
        'closingCount': 0,
        'highestDepth': 0,
    },

    // Operator keys mapped to rank and function
    operatorConfig: {
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

// Extracts the next operation to be evaluated based on "PEMDAS" order
function findNextOperation(operatorRegex, expression) {
    // Will store our target operation once we find it
    let currentOperation;
    
    // Finds any expressions within parentheses - they get priority
    const groupedExpressions = expression.match(/\(\d+[+−÷×]+[^()]+\)/g);
 
    // Process any parenthesized expressions first
    if (groupedExpressions !== null) {
        // Iterate through each parenthesized expression
        for (const subExpression of groupedExpressions) {
            
            // lLog grouped expression for debugging
            console.log('Groups:', groupedExpressions);
            
            // Check if sub-expression contains target operation
            if (operatorRegex.test(subExpression)) {
                
                // Extract and return first matching operation
                currentOperation = subExpression.match(operatorRegex);
                return currentOperation;
            }
        }
    }
 
    // Find and return operation from main expression if no parenthesized matches
    currentOperation = expression.match(operatorRegex);
    return currentOperation;
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
    console.log('Operands:', operands);

    // Log the operator ID
    console.log('Operator Id:', operatorId);

    // Apply the corresponding operation based on operator precedence
    const simplifiedResult = calculator.operatorConfig[operatorId].operation(operands);
    
    // Log the result of the operation
    console.log('Simplified Result:', simplifiedResult);

    // Replace sub-expression with result
    const simplifiedExpression = expression.replace(subExpression, simplifiedResult);

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
            (operatorA, operatorB) => operatorB[2] - operatorA[2]
        );    
    }

    // Log the sorted operator queue for debugging
    console.table(calculator.operatorQueue);

    // Process each expression based on operator precedence
    for (let i = 0; i < queueSize; i++) {
        // Get count of unclosed parentheses
        const openingCount = calculator.depthTracker.openingCount;

        // Auto-close unclosed parentheses
        expression = expression.concat(')'.repeat(openingCount));

        // Simplify nested parentheses patterns
        while (/(?<=\()\(+([^()]+)(?:\)+(?=\)))/g.test(expression)||/\((\d+)\)/g.test(expression)) {
            // Unwrap redundant groups and single numbers in parentheses
            const normalizedExpression = expression.replaceAll(/(?<=\()\(([^()]+)(?:\)(?=\)))/g, '$1')
                                            .replaceAll(/\((\d+)\)/g, '$1');

            // Log simplified expression for debugging
            console.log('Normalized Expression', normalizedExpression);

            // Update with normalized version
            expression = normalizedExpression;
        }

        // Destructure priority operator's details from queue
        const [operatorId, currentOperator, operatorRank] = calculator.operatorQueue[i];

        // Get default rank for current operator
        const baseRank = calculator.operatorConfig[operatorId].rank;

        // Match numbers around operator, with optional parentheses if precedence was boosted
        const pattern = operatorRank > baseRank
            ? `(\\-?\\d+\\.?\\d*)\\${currentOperator}(\\-?\\d+\\.?\\d*)`
            : `\\(?(\\-?\\d+\\.?\\d*)\\)?\\${currentOperator}\\(?(\\-?\\d+\\.?\\d*)\\)?`;
    
        // Convert the pattern to a regular expression
        const regex = new RegExp(pattern);
        console.log('Regex:', regex);

        // Find all matches of the pattern in the mathematical expression
        const operatorMatches = findNextOperation(regex, expression);
        
        // Log matched expressions for debugging
        console.log('Operator Matches:');
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

    // Evaluate if we have both operands (preceded by operator)
    if (/\(?\d+\)?\s[+−÷×]\s\(?\d+\)?/.test(expression)) {
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

    // Remove commas to standardize number formatting 
    calculator.currentOperand = calculator.currentOperand.replaceAll(',', '');

    // If result display has transitions active
    if (resultDisplay.id === 'transition-result') {
        // Remove transition animations  
        resultDisplay.id = 'result-display';

        // Reset result display
        resultDisplay.value = '';

        // Show expression input field
        expressionDisplay.style['display'] = 'inline-block';
    }

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

                // Check if the last character is a closing parenthesis
                if (displayText.at(-1) === '\u0029') {
                    // Create a padded multiplication operator
                    const timesOperator = '\u00D7'.padStart(2).padEnd(3);
                    
                    // Append the padded multiplication operator
                    expressionDisplay.value += timesOperator;
                    
                    // Update the display text to reflect the change
                    displayText = expressionDisplay.value;
                    
                    // Clear the current operand
                    calculator.currentOperand = '';
                }

                    // Append digit to tracked value
                    calculator.currentOperand += keyAction;

                    // Update display with current digit
                    expressionDisplay.value += keyAction;

                    // Append current digit to displayText, marking for extraction
                    displayText += keyAction.padEnd(keyAction.length + 1, '*');

                    // console.log('Display Text:', displayText);

                    // Apply locale formatting  
                    formatNumberDisplay(displayText);
                }
            }

            // Check if expression contains an operator
            const currentExpression = expressionDisplay.value;

            // Process if at least two operands are present
            processResult(resultDisplay, currentExpression);

            // Log current calculator value
            // console.log(calculator.currentOperand);
                        
            break;
    
        case 'key-control':
            // Check for 'key-AC' press
            if (keyId === 'key-AC') {
                // Reset expression display to zero
                expressionDisplay.value = '0';

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

                    // Check if current value exists
                    if (calculator.currentOperand.length !== 0) {
                        // Format number
                        formatNumberDisplay(displayText);
                    }
                }

            }
            
            break;
            
        case 'key-operator':
            // Mark end for extraction  
            displayText += '*';

            // Remove all white spaces from displayText 
            displayText = displayText.replaceAll(/\s/g, '');
            
            // Get the last displayed character
            const lastCharacter = expressionDisplay.value.at(-1);

            // Check if the operator is inside parentheses  
            const inParentheses = /\([\(\)+−÷×\d,\s]*\*/g.test(displayText);

            // Store reference to track parentheses depth
            const depthTracker = calculator.depthTracker;

            // Skip operator append for equals and decimal key
            if  (keyId !== 'key-parentheses' && keyId !== 'key-decimal' && keyId !== 'key-equals') {

                // Get current depth of nested parentheses
                const nestingLevel = depthTracker.openingCount;

                // Adjust rank if inside parentheses - rank increases per nesting level
                const operatorRank = nestingLevel > 0  
                    ? calculator.operatorConfig[keyId].rank + 2 + nestingLevel  
                    : calculator.operatorConfig[keyId].rank;

                // Handle operator replacement when the last input is whitespace
                if (/\s/.test(lastCharacter)) {
                    // Extract the previous operator from the queue
                    const dequeuedOperator = calculator.operatorQueue.shift()[1];
                    
                    // Create a regex to replace the previous operator, ensuring it's not followed by a digit
                    const operatorRegex = new RegExp(`\\${dequeuedOperator}(?=\\s(?!\\d))`);
                    
                    // Replace the old operator with the new one in the display
                    const updatedExpression = expressionDisplay.value.replace(operatorRegex, keyAction);
                    
                    // Update operator queue and display
                    calculator.operatorQueue.push([keyId, keyAction, operatorRank]);
                    expressionDisplay.value = updatedExpression;
                }

                // Append operator if value exists
                if (calculator.currentOperand.length !== 0) {

                    // Pad operator unless it's decimal key
                    const operator = keyAction.padStart(2).padEnd(3);

                    // Append operator to display
                    expressionDisplay.value += operator;

                    // Add the operator and action to the queue
                    calculator.operatorQueue.push([keyId, keyAction, operatorRank]);

                    // Reset tracked value after operator added
                    calculator.currentOperand = '';
                }
            }

            // Handle parentheses key press logic
            else if (keyId === 'key-parentheses') {
                // Debug current expression state
                // console.log('Display Text:', displayText);
                
                // Destructure parentheses from action tuple
                const [openingParenthesis, closingParenthesis] = keyAction;

                // Match whitespace character indicating preceding operator
                if (/\s|\(/.test(lastCharacter)) {
                    // Begin new explicit group after operator
                    expressionDisplay.value += openingParenthesis;

                    // Track opening parentheses in expression 
                    depthTracker.openingCount += 1;

                    // Adjust nesting balance when reopening previously closed groups
                    if (depthTracker.closingCount > 0) {
                        // Decrement closing count to maintain proper parentheses tracking
                        depthTracker.closingCount -= 1;
                    }
                    
                    // Update maximum nesting depth for parentheses validation
                    if (depthTracker.openingCount > depthTracker.highestDepth) {
                        // Record new highest depth to ensure proper closing of all parentheses
                        depthTracker.highestDepth = depthTracker.openingCount;
                    }

                    // Log opening parentheses state
                    console.log('Opening Count:', depthTracker.openingCount);
                    console.log('Closing Count:', depthTracker.closingCount);
                    console.log('Highest Depth:', depthTracker.highestDepth);
                }
            
                // Close group after completed operand operator inside parentheses
                else if (inParentheses) {
                    // Only allow closing parenthesis if there are unclosed ones
                    if (depthTracker.closingCount < depthTracker.highestDepth) {
                        // Append closing parenthesis when there are unclosed ones
                        expressionDisplay.value += closingParenthesis;
                    
                        // Track closing parentheses in expression  
                        depthTracker.closingCount += 1;
                        depthTracker.openingCount -= 1;
                    
                        // Log closing parentheses state
                        console.log('Opening Count:', depthTracker.openingCount);
                        console.log('Closing Count:', depthTracker.closingCount);
                        console.log('Highest Depth:', depthTracker.highestDepth);

                        // Reset trackers when parentheses are balanced
                        if (depthTracker.closingCount === depthTracker.highestDepth) {
                            // Zero out both depth counters
                            depthTracker.closingCount = depthTracker.highestDepth = 0;
                        }
                    }

                    // Implicit multiplication case
                    else if (/\d|\)/.test(lastCharacter)) {
                        // Create padded multiplication symbol for display
                        const timesOperator = '\u00D7'.padStart(2).padEnd(3);
    
                        // Insert implicit multiplication before new group
                        expressionDisplay.value += `${timesOperator}${openingParenthesis}`;
                        
                        // Clear current operand
                        calculator.currentOperand = '';

                        // Reset nesting counts for new parentheses group
                        depthTracker.openingCount = 1;
                        depthTracker.closingCount = 0;
                    }
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

            // On equals press
            else { 
                // Process expression only if a result is displayed
                if (resultDisplay.value.length > 0) {
                    // Get the current expression from the display
                    const finalExpression = expressionDisplay.value;
    
                    // Process and format the result of the current expression
                    processResult(expressionDisplay, finalExpression);
    
                    // Update the current operand to the computed result
                    calculator.currentOperand = resultDisplay.value;
    
                    // Hide the expression input field
                    expressionDisplay.style['display'] = 'none';
    
                    // Apply transition animations
                    resultDisplay.id = 'transition-result';
    
                    // Reset operator queue after final calculation
                    calculator.operatorQueue = [];
                } 
            }

            // console.table(calculator.operatorQueue);

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