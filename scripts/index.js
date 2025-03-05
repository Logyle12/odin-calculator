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

// Handles implicit multiplication
function insertMultiplication() {
    // Find the multiplication key by its specific ID
    const multiplyKey = [...keyButtons].find((key) => key.id === 'key-multiply');

    // Simulate a click on the multiplication button
    multiplyKey.click();

    // Log the current state of the operator queue 
    console.log('Operator Queue:');
    console.table(calculator.operatorQueue);

    // Clear the current operand for next input
    calculator.currentOperand = '';
}

// Calculates an operator's precedence, factoring in nesting depth
function calculateOperatorRank(depthTracker, baseRank) {
    // Get current depth of nested parentheses
    const depthLevel = depthTracker.openingCount;

    // Adjust rank if inside parentheses, scaling by nesting level
    const operatorRank = depthLevel > 0  
        ? baseRank + (2 * depthLevel)  
        : baseRank;

    // Returns the adjusted precedence value
    return operatorRank;
}

// Derive the current operand from the display text  
function setCurrentOperand(displayText) {
    // Extract all numbers from display text
    const operands = displayText.replaceAll(',', '').match(/(\d+)/g);

    // Log extracted operands for debugging
    console.log('Operands:', operands);

    // Update current operand only if it differs from last number
    if (calculator.currentOperand !== operands.at(-1)) {
        // Get the latest operand 
        return operands.pop();
    }

    // Return the current operand unchanged 
    return calculator.currentOperand;
}

// Converts operand strings to numeric values with percentage handling
function processOperands(numericString, currentIndex, operandStrings) {
    // For percentage values (e.g., "50%")
    if (/(\d+)\%/.test(numericString)) {
        // First operand: direct percentage conversion
        if (currentIndex === 0) {
            // Convert percentage to decimal value (50% → 0.5)
            const percentValue = parseFloat(numericString)/100;
            
            // Return simple decimal form for first operand
            return percentValue;
        }
        
        // Subsequent operands: percentage relative to first operand
        else {
            // Calculate percentage relative to the first operand's value
            const relativePercent = (parseFloat(numericString)/100) * parseFloat(operandStrings[0]);
            
            // Return calculated relative percentage value
            return relativePercent;
        }
    }
    
    // Standard numeric conversion
    else {
        // Parse string to floating-point number
        const numericValue = parseFloat(numericString);
        
        // Return converted number for calculation
        return numericValue;
    }
}

// Format and update number display with locale separators  
function formatNumberDisplay() {
    // Extract raw number before formatting
    const unformattedNumber = calculator.currentOperand;

    console.log('Unformatted Number:', unformattedNumber);

    // Format number if it doesn't already contain a decimal point
    if (unformattedNumber.includes('.') === false) {
        // Parse and format number with UK locale separators
        const formattedNumber = parseInt(calculator.currentOperand, 10).toLocaleString('en-GB');

        // Replace unformatted number with locale-formatted version
        expressionDisplay.value = expressionDisplay.value.replace(/[\d,-]+$/g, unformattedNumber)
                                            .replace(unformattedNumber, formattedNumber);

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

// Callback that locates operator in queue by matching rank and symbol
function findOperatorIndex(operatorEntry) {
    // Destructure operator data
    const [keyId, keyAction, operatorRank] = operatorEntry;
    
    // Get operator's intrinsic precedence
    const baseRank = calculator.operatorConfig[keyId].rank;
 
    // Convert implicit 'this' to string for symbol comparison
    const operatorSymbol = String(this);
 
    // Get current parentheses depth
    const depthLevel = calculator.depthTracker.openingCount;
    
    // Calculate effective rank based on nesting
    const currentRank = baseRank + (2 * depthLevel);
 
    // For nested expressions
    if (depthLevel > 0) {
        // Match if both rank and symbol match at current nesting level
        if (operatorRank === currentRank && operatorSymbol === keyAction) {
            return true;
        }  
    }
    
    // For top-level expressions
    else if (operatorRank === baseRank && operatorSymbol === keyAction) {
        return true;
    }
}

// Simplify the expression by processing matched groups
function simplifyExpression(operatorId, operatorGroup, originalExpression) {
    // Extract and convert operands to numbers
    const [subExpression, ...operandStrings]  = operatorGroup; 

    // Get the full matched segment from the expression
    const matchedSegment = operatorGroup.input;

    // console.log('Operands Strings:', operandStrings);

    // Convert operand strings to numbers
    const operands = operandStrings.map(processOperands);

    // Log the sub-expression
    // console.log('Sub Expression:', subExpression);

    // Log the matched segment
    // console.log('Matched Segment:', matchedSegment);

    // Log the extracted operands for debugging
    // console.log('Operands:', operands);

    // Log the operator ID
    // console.log('Operator Id:', operatorId);

    // Apply the corresponding operation based on operator precedence
    const simplifiedResult = calculator.operatorConfig[operatorId].operation(operands);

    // Substitute calculated value within the matched context
    const simplifiedSegment = matchedSegment.replace(subExpression, simplifiedResult);

    // Add the simplified portion back into the full expression
    const simplifiedExpression = originalExpression.replace(matchedSegment, simplifiedSegment).replaceAll(/\((\-?\d+\.?\d*)\)/g, '$1');

    // Log the result of the operation
    // console.log('Simplified Result:', simplifiedResult);

    // Log the simplified segment
    // console.log('Simplified Segment:', simplifiedSegment);

    // Log the updated expression
    // console.log('Simplified Expression:', simplifiedExpression);
    // console.log('\n');

    // Return the simplified expression
    return simplifiedExpression;
}

// Evaluate expression by operator precedence
function evaluateExpression(expression) {
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
    // console.table(calculator.operatorQueue);

    // Process each expression based on operator precedence
    for (let i = 0; i < queueSize; i++) {
        // Simplify nested parentheses patterns
        while (/(?<=\()\((\d+(?=[+−÷×])[^()]+)(?:\)(?=\)))/g.test(expression)||/\((\-?\d+\.?\d*)\)/g.test(expression)) {
            // Unwrap redundant groups and single numbers in parentheses
            const normalizedExpression = expression.replaceAll(/(?<=\()\((\d+(?=[+−÷×])[^()]+)(?:\)(?=\)))/g, '$1')
                                            .replaceAll(/\((\-?\d+\.?\d*)\)/g, '$1');

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
            ? `(\\-?\\d+\\.?\\d*\\%?)\\${currentOperator}(\\-?\\d+\\.?\\d*\\%?)`
            : `\\(?(\\-?\\d+\\.?\\d*\\%?)\\)?\\${currentOperator}\\(?(\\-?\\d+\\.?\\d*\\%?)\\)?`;
    
        // Convert the pattern to a regular expression
        const regex = new RegExp(pattern);
        // console.log('Regex:', regex);

        // Find all matches of the pattern in the mathematical expression
        const operatorMatches = findNextOperation(regex, expression);
        
        // Log matched expressions for debugging
        // console.log('Operator Matches:');
        // console.table(operatorMatches);

        // Process the matched expressions
        const simplifiedExpression = simplifyExpression(operatorId, operatorMatches, expression).replaceAll(/\((\-?\d+\.?\d*)\)/g, '$1');

        // Update the main expression
        expression = simplifiedExpression;
    }

    return expression;
}

// Process and format the result of a mathematical expression
function processResult(displayElement, expression) {
    // Get the last displayed character
    const lastCharacter = expression.at(-1);

    // Sanitize the expression
    expression = expression.replace(/\s|\,/g, '');

    // Check if expression contains scientific notation (e.g., 1.23e+4)
    if (/\d+\.\d+\e[+-]\d+/gi.test(expression)) {
        // Extract and convert notation strings to numbers
        const exponentialValues = expression.match(/\d+\.\d+\e[+-]\d+/gi).map(Number);

        // Replace each notation instance with its numeric value
        for (const exponentialValue of exponentialValues) {
            // Substitute throughout the expression
            expression = expression.replace(/\d+\.\d+\e[+-]\d+/gi, exponentialValue);
        }
    }

    // Proceed only if there's a valid current operand  
    if (calculator.currentOperand.length !== 0) {
        // Check for a complete expression with a valid ending  
        if (/\(*\-?\d+\.?\d*\%?\)*[+−÷×]\(*\-?\d+\.?\d*\%?\)*/.test(expression) && /\d|\)|\%/.test(lastCharacter)) {
            // Get count of unclosed parentheses
            const openingCount = calculator.depthTracker.openingCount;

            // Auto-close unclosed parentheses
            expression = expression.concat(')'.repeat(openingCount));
            
            // Log the sanitized expression for debugging
            console.log('Expression:', expression);

            // Evaluate the current expression and store the result
            const computedResult = parseFloat(evaluateExpression(expression), 10);
    
            // Log the raw result for debugging
            console.log('Computed Result:', computedResult);
            
            // Switch to scientific notation if result exceeds digit limit         
            if (computedResult.toString().length > calculator.digitLimit) {
                // Format result display as exponential notation
                displayElement.value = computedResult.toExponential();
            }

            // Use comma separated notation if within digit limit
            else {
                // Display the result using locale separators
                displayElement.value = computedResult.toLocaleString('en-GB');
            }
        }

        // Clear the results display if the expression is incomplete  
        else {
            resultDisplay.value = '';
        }
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

    // Store reference to track parentheses depth
    const depthTracker = calculator.depthTracker;

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
                    // Append the padded multiplication operator
                    insertMultiplication();
                }

                    // Append digit to tracked value
                    calculator.currentOperand += keyAction;

                    // Update display with current digit
                    expressionDisplay.value += keyAction;

                    // Apply locale formatting  
                    formatNumberDisplay();
                }
            }

            // Get the current expression from the display 
            const currentExpression = expressionDisplay.value;

            // Compute new result and update display
            processResult(resultDisplay, currentExpression);

            // Log current calculator value
            // console.log('Current Operand:', calculator.currentOperand);
                        
            break;
    
        case 'key-control':
            // Check for 'key-AC' press
            if (keyId === 'key-AC') {
                // Reset expression display and current operand to zero
                expressionDisplay.value = calculator.currentOperand = '0';

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
                    // console.log(displayText);
                    
                    // Retrieve the last character using negative indexing
                    const lastCharacter = displayText.at(-1);

                    // Check if the last character is an operator
                    if (/[+−÷×]/.test(lastCharacter)) {
                        // Get the index of the last matching operator in the queue    
                        const operatorIndex = calculator.operatorQueue.findLastIndex(findOperatorIndex, lastCharacter);

                        // Dequeue the last matching operator
                        calculator.operatorQueue.splice(operatorIndex, 1);
                    }

                    // Increment opening count when deleting a closing parenthesis
                    else if (/\)/.test(lastCharacter)) {
                        // Update the opening count
                        depthTracker.openingCount += 1;

                        // Adjust nesting balance when reopening previously closed groups
                        if (depthTracker.closingCount > 0) {
                            // Update the closing count
                            depthTracker.closingCount -= 1;
                        }

                        // Update maximum nesting depth for parentheses validation
                        if (depthTracker.openingCount > depthTracker.highestDepth) {
                            // Reset to current depth
                            depthTracker.highestDepth = depthTracker.openingCount;
                        }

                        console.log('Opening Count:', depthTracker.openingCount);
                        console.log('Closing Count:', depthTracker.closingCount);
                        console.log('Highest Depth:', depthTracker.highestDepth);
                        console.log('\n');
                    }
                    
                    // Decrement opening count when deleting an opening parenthesis
                    else if (/\(/.test(lastCharacter)) {
                        // Update the opening count
                        depthTracker.openingCount -= 1;

                        // Update the closing count
                        depthTracker.closingCount += 1;

                        console.log('Opening Count:', depthTracker.openingCount);
                        console.log('Closing Count:', depthTracker.closingCount);
                        console.log('Highest Depth:', depthTracker.highestDepth);
                        console.log('\n');
                    }

                    // Trim 3 characters if operator (padded) or 1 if digit or decimal point  
                    const updatedExpression = /[+−÷×]/.test(lastCharacter)
                        ? expressionDisplay.value.slice(0, expressionDisplay.value.length - 3) 
                        : expressionDisplay.value.slice(0, -1);

                    // Update display text for further processing
                    displayText = updatedExpression;
            
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
                        displayText = expressionDisplay.value = '0';  
                    } 
                    
                    // Set current operand to last number in display  
                    calculator.currentOperand = setCurrentOperand(displayText);

                    // Log updated current operand value
                    console.log('Current Operand:', calculator.currentOperand);

                    // Check if current value exists
                    if (calculator.currentOperand.length !== 0) {
                        // Format number
                        formatNumberDisplay();
                    }
                }
            }
            
            break;
            
        case 'key-operator':
            // Remove all white spaces from displayText 
            displayText = displayText.replaceAll(/\s/g, '');
            
            // Get the last displayed character
            const lastCharacter = displayText.at(-1);

            // Skip operator append for equals and decimal key
            if  (keyId !== 'key-parentheses' && keyId !== 'key-percent' && keyId !== 'key-decimal' && keyId !== 'key-equals') {

                // Retrieve operator's inherent precedence level
                const baseRank = calculator.operatorConfig[keyId].rank;

                // Compute rank according to nesting depth
                const operatorRank = calculateOperatorRank(depthTracker, baseRank);

                // Handle operator replacement
                if (/[+−÷×]/.test(lastCharacter)) {
                    // Extract the previous operator from the queue
                    const previousOperator = lastCharacter;

                    // Log the previously entered operator for debugging
                    console.log('Previous Operator:', previousOperator);

                    // Display current operation queue for debugging
                    console.log('Current Queue:');
                    console.table(calculator.operatorQueue);

                    // Enable negative number entry 
                    if (/[÷×]/.test(previousOperator) && keyId === 'key-subtract') {
                        // Append negative sign to expression display
                        expressionDisplay.value += '\u002D';

                        // Update current operand with negative sign
                        calculator.currentOperand += '\u002D';
                    }

                    else {
                        // Create a regex to replace the previous operator, ensuring it's not followed by a digit
                        const operatorRegex = new RegExp(`(?<=\\s)\\${previousOperator}(?=\\s$)`);
                    
                        // Replace the old operator with the new one in the display
                        const updatedExpression = expressionDisplay.value.replace(operatorRegex, keyAction);
                    
                        // Update operator queue and display
                        expressionDisplay.value = updatedExpression;

                        // Get the index of the last matching operator in the queue    
                        const operatorIndex = calculator.operatorQueue.findLastIndex(findOperatorIndex, previousOperator);

                        // Dequeue the last matching operator
                        const operatorEntry = calculator.operatorQueue[operatorIndex];

                        // Update operator queue entry with new operator details
                        [operatorEntry[0], operatorEntry[1], operatorEntry[2]] = [keyId, keyAction, operatorRank];
                    }

                    // Display updated operation queue for debugging
                    console.log('Updated Queue:');
                    console.table(calculator.operatorQueue);
                }

                // Append operator if value exists
                else if (calculator.currentOperand.length !== 0 && Number.isFinite(parseFloat(calculator.currentOperand))) {

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
                // Destructure parentheses from action tuple
                const [openingParenthesis, closingParenthesis] = keyAction;

                // Match preceding operator
                if (/[+−÷×]|\(/.test(lastCharacter) || expressionDisplay.value === '0') {
                    // Replace '0' with opening parenthesis or append to existing expression
                    expressionDisplay.value = expressionDisplay.value === '0' 
                    ? openingParenthesis 
                    : expressionDisplay.value + openingParenthesis;

                    // Track opening parentheses in expression 
                    depthTracker.openingCount += 1;

                    // Adjust nesting balance when opening previously closed groups
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
                    console.log('\n');
                }
            
                // Close group after completed operand operator inside parentheses
                else if (calculator.depthTracker.openingCount > 0) {
                    // Only allow closing parenthesis if there are unclosed ones
                    if (depthTracker.closingCount < depthTracker.highestDepth) {
                        // Append closing parenthesis when there are unclosed ones
                        expressionDisplay.value += closingParenthesis;
                    
                        // Track closing parentheses in expression  
                        depthTracker.closingCount += 1;
                        depthTracker.openingCount -= 1;

                        // Reset trackers when parentheses are balanced
                        if (depthTracker.closingCount === depthTracker.highestDepth) {
                            // Zero out both depth counters
                            depthTracker.closingCount = depthTracker.highestDepth = 0;
                        }

                        // Log closing parentheses state
                        console.log('Opening Count:', depthTracker.openingCount);
                        console.log('Closing Count:', depthTracker.closingCount);
                        console.log('Highest Depth:', depthTracker.highestDepth);
                        console.log('\n');
                    }
                }

                // Implicit multiplication case
                else if (/\d|\)/.test(lastCharacter)) {
                    // Append the padded multiplication operator
                    insertMultiplication();

                    // Find the parentheses key by its specific ID
                    const parenthesesKey = [...keyButtons].find((key) => key.id === 'key-parentheses');

                    // Simulate a click on the parentheses button
                    parenthesesKey.click()
                }
            }

            else if (keyId === 'key-percent') {
                // Prevent duplicate percentage symbols
                if (calculator.currentOperand.includes(keyAction) === false) {
                    // Append the percentage symbol to the display
                    expressionDisplay.value += keyAction;

                    // Add the percentage symbol to the current operand value
                    calculator.currentOperand += keyAction;

                    // Get the current expression from the display  
                    const currentExpression = expressionDisplay.value;  

                    console.log('Current Expression:', currentExpression)

                    // Compute new result and update display 
                    processResult(resultDisplay, currentExpression);  

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
    
                    // Compute new result and update display
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