// Retrieve display elements
const expressionDisplay = document.querySelector('#expression-display');
const resultDisplay = document.querySelector('#result-display');

// Retrieve all key elements
const keyButtons = document.querySelectorAll('.key');

// Calculator object holding state and configurations
const calculator = {
    // Store latest number value
    currentOperand: expressionDisplay.value,

    // Track max digits allowed
    digitLimit: 15,

    // Track count of opening and closing parentheses
    depthTracker: {
        'openingCount': 0,
        'closingCount': 0,
        'highestDepth': 0,
    },

    // Operator keys mapped to rank and function
    operators: {
        // Power (a^b)
        'key-power': {
            'rank': 3,
            'symbol': '^',
            'operation': raiseToPower,
        },

        // Powers of 10 (10^n)
        'key-exponent': {
            'rank': 3,
            'symbol': 'E',
            'operation': powerOfTen,
        },

        // Multiplication (a*b)
        'key-multiply': {
            'rank': 2,
            'symbol': '\u00D7',
            'operation': multiply,
        },

        // Division (a/b)
        'key-divide': {
            'rank': 2,
            'symbol': '\u00F7',
            'operation': divide,
        },

        // Addition (a+b)
        'key-add': {
            'rank': 1,
            'symbol': '\u002B',
            'operation': add,
        },

        // Subtraction (a-b)
        'key-subtract': {
            'rank': 1,
            'symbol': '\u2212',
            'operation': subtract,
        },
    },

    // Mathematical function keys mapped to symbols and operations
    mathFunctions: {
        // Natural logarithm (base e)
        'key-natural-log': {
            'rank': 3,
            'symbol': 'ln',
            'operation': naturalLog,
        },
        
        // Common logarithm (base 10)
        'key-log10': {
            'rank': 3,
            'symbol': 'log',
            'operation': log10,
        },
        
        // Square root function (√x)
        'key-square-root': {
            'rank': 3,
            'symbol': '√',
            'operation': squareRoot,
        },
    },

    // Store pending operations awaiting calculation
    operatorQueue: [],
};

// Operator functions

// Returns the result of raising a number to a given power
function raiseToPower(operands) {
    // Extract base number and exponent from operands
    const [base, exponent] = operands;
    
    // Computes the operand raised to the given exponent
    const powerValue = Math.pow(base, exponent);
    
    // Returns the computed power value
    return powerValue;
}

// Multiplies a number by 10 raised to the given exponent
function powerOfTen(operands) {
    // Extract multiplier and exponent from operands
    const [multiplier, exponent] = operands;

    // Calculate multiplier × 10^exponent
    const powerValue = multiplier * raiseToPower([10, exponent])

    // Returns the computed power value
    return powerValue;
}

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

// Math functions

// Returns the natural logarithm (base e) of a number
function naturalLog(operands) {
    // Computes the natural logarithm of the operand
    const lnValue = Math.log(operands);

    // Returns the computed natural logarithm
    return lnValue;
}

// Returns the base-10 logarithm of a number
function log10(operands) {
    // Computes log base 10 of the operand
    const log10Value = Math.log10(operands);

    // Returns the computed log10 value
    return log10Value;
}

// Returns the square root of a number
function squareRoot(operands) {
    // Computes the square root of the operand
    const sqrtValue = Math.sqrt(operands);

    // Returns the computed square root
    return sqrtValue;
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

    // Compute operator rank scaling by nesting level
    const operatorRank = baseRank + (3 * depthLevel);

    // Returns the adjusted precedence value
    return operatorRank;
}

// Derive the current operand from the display text  
function setCurrentOperand(displayText) {
    // Remove all whitespace from the display text
    displayText = displayText.replaceAll(/\s/g, '');

    // Proceed only if the display ends with a valid operand  
    if (/\d+$/g.test(displayText)) {
        // Extract all numbers from display text
        const operands = displayText.replaceAll(',', '').match(/(\-?\d+\.?\d*)/g);
    
        // Update current operand only if it differs from last number
        if (calculator.currentOperand !== operands.at(-1)) {
            // Get the latest operand 
            return operands.pop();
        }
    }

    // No valid operand detected
    else {
        // Clear the current operand
        calculator.currentOperand = '';
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

    // console.log('Unformatted Number:', unformattedNumber);

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
            // console.log('Groups:', groupedExpressions);
            
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
    const [keyId, keySymbol, operatorRank] = operatorEntry;
    
    // Get operator's intrinsic precedence
    const baseRank = calculator.operators[keyId].rank;
 
    // Convert implicit 'this' to string for symbol comparison
    const operatorSymbol = String(this);
 
    // Get current parentheses depth
    const depthLevel = calculator.depthTracker.openingCount;
    
    // Calculate effective rank based on nesting
    const currentRank = baseRank + (3 * depthLevel);
 
    // For nested expressions
    if (depthLevel > 0) {
        // Match if both rank and symbol match at current nesting level
        if (operatorRank === currentRank && operatorSymbol === keySymbol) {
            return true;
        }  
    }
    
    // For top-level expressions
    else if (operatorRank === baseRank && operatorSymbol === keySymbol) {
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

    // Chooses between arithmetic and function handlers based on input
    const operationHandler = /[+−÷×^E]/g.test(subExpression)  
        ? calculator.operators  
        : calculator.mathFunctions;

    // Apply operation and round to current precision level
    const simplifiedResult = parseFloat(
        operationHandler[operatorId].operation(operands).toFixed(calculator.digitLimit)
    );

    // Substitute calculated value within the matched context
    const simplifiedSegment = matchedSegment.replace(subExpression, simplifiedResult);

    // Add the simplified portion back into the full expression
    const simplifiedExpression = originalExpression
        .replace(matchedSegment, simplifiedSegment)
        .replaceAll(/\((\-?\d+\.?\d*)\)/g, '$1');

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
            // console.log('Normalized Expression', normalizedExpression);

            // Update with normalized version
            expression = normalizedExpression;
        }

        // Destructure priority operator's details from queue
        const [operatorId, currentOperator] = calculator.operatorQueue[i];

        // Match operands around operator or functions
        const pattern = /[+−÷×^E]/.test(currentOperator)
            ? `([^()+−÷×]+)\\${currentOperator}([^()+−÷×]+)`
            : `\\${currentOperator}([^()+−÷×]+)`;
    
        // Convert the pattern to a regular expression
        const regex = new RegExp(pattern);
        // console.log('Regex:', regex);

        // Find all matches of the pattern in the mathematical expression
        const operatorMatches = findNextOperation(regex, expression);
        
        // Log matched expressions for debugging
        // console.log('Operator Matches:');
        // console.table(operatorMatches);

        // Process the matched expressions
        const simplifiedExpression = simplifyExpression(operatorId, operatorMatches, expression);

        // Update the main expression
        expression = simplifiedExpression;
    }

    return expression;
}

// Process and format the result of a mathematical expression
function processResult(displayElement, expression) {
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
        if (/^(?:.+)(?:\d+|\)|\%)$/g.test(expressionDisplay.value)) {
            // Get count of unclosed parentheses
            const openingCount = calculator.depthTracker.openingCount;

            // Auto-close unclosed parentheses
            expression = expression.concat(')'.repeat(openingCount));
            
            // Log the sanitized expression for debugging
            // console.log('Expression:', expression);

            // Evaluate the current expression and store the result
            const computedResult = parseFloat(evaluateExpression(expression), 10);
    
            // Log the raw result for debugging
            // console.log('Computed Result:', computedResult);
            
            // Switch to scientific notation if result exceeds digit limit         
            if (computedResult.toString().length > calculator.digitLimit) {
                // Format result display as exponential notation
                displayElement.value = computedResult.toExponential();
            }

            // Use comma separated notation if within digit limit
            else {
                // Display the result using locale separators and display to current precision
                displayElement.value = computedResult.toLocaleString('en-GB', {
                    maximumFractionDigits: calculator.digitLimit
                });
            }
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

    // Store reference to track parentheses depth
    const depthTracker = calculator.depthTracker;

    // Find the parentheses key by its specific ID
    const parenthesesKey = [...keyButtons].find((key) => key.id === 'key-parentheses');

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
          
            break;
    
        case 'key-control':
            // Check for 'key-AC' press
            if (keyId === 'key-AC') {
                // Reset expression display and current operand to zero
                expressionDisplay.value = calculator.currentOperand = '0';

                // Clear result display
                resultDisplay.value = '';

                // Reset depth counts
                depthTracker.openingCount = depthTracker.closingCount = depthTracker.highestDepth = 0;

                // Clear console
                console.clear();

                // Log depth details for debugging
                console.log('Opening Count:', depthTracker.openingCount);
                console.log('Closing Count:', depthTracker.closingCount);
                console.log('Highest Depth:', depthTracker.highestDepth);
                console.log('\n');

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
                    if (/[+−÷×^E]/.test(lastCharacter)) {
                        // Get the index of the last matching operator in the queue    
                        const operatorIndex = calculator.operatorQueue.findLastIndex(findOperatorIndex, lastCharacter);

                        // Log queue before dequeueing operator
                        console.log('Queue (Before):');
                        // Log current queue state of operators
                        console.table(calculator.operatorQueue);

                        // Dequeue the last matching operator
                        calculator.operatorQueue.splice(operatorIndex, 1);

                        // Log queue after dequeueing operator
                        console.log('Queue (After):');
                        // Log current queue state of operators
                        console.table(calculator.operatorQueue);
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

                        // Log depth details for debugging
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

                        // Reset depth tracking when no opening parentheses remain  
                        if (depthTracker.openingCount === 0) {  
                            // Clear depth state  
                            depthTracker.closingCount = depthTracker.highestDepth = 0;
                        }  

                        // Log depth details for debugging
                        console.log('Opening Count:', depthTracker.openingCount);
                        console.log('Closing Count:', depthTracker.closingCount);
                        console.log('Highest Depth:', depthTracker.highestDepth);
                        console.log('\n');
                    }

                    // Trim 3 characters if operator (padded) or 1 if digit or decimal point  
                    const updatedExpression = /[+−÷×]/.test(lastCharacter)
                        ? expressionDisplay.value.slice(0, expressionDisplay.value.length - 3) 
                        : expressionDisplay.value.slice(0, -1);

                    // Update display text; reset to '0' if expression is empty  
                    displayText = expressionDisplay.value = 
                        updatedExpression.length >= 1 ? updatedExpression : '0';

                    // Set current operand to last number in display  
                    calculator.currentOperand = setCurrentOperand(displayText);

                    // Log updated current operand value
                    console.log('Current Operand:', calculator.currentOperand); 
            
                    // Update the display if the current expression is not just '0'  
                    if (expressionDisplay.value !== '0') {                         
                        // Compute new result and update display
                        processResult(resultDisplay, updatedExpression);
                        
                        // Check if current value exists
                        if (calculator.currentOperand.length !== 0) {
                            // Format number
                            formatNumberDisplay();
                        }
                    }  
                }
            }
            
            break;
            
        case 'key-operator':
            // Remove all white spaces from displayText 
            displayText = displayText.replaceAll(/\s/g, '');
            
            // Extract the previous operator 
            const previousOperator = displayText.at(-1);

            // Log the previously entered operator for debugging
            // console.log('Previous Operator:', previousOperator);

            // Only proceed for arithmetic operators
            if  (key.classList.contains('arithmetic-operator')) {
                // Retrieve operator's inherent precedence level
                const baseRank = calculator.operators[keyId].rank;

                // Compute rank according to nesting depth
                const operatorRank = calculateOperatorRank(depthTracker, baseRank);

                // Enable negative number entry 
                if (/[÷×^E]|\(|0/.test(previousOperator) && keyId === 'key-subtract') {
                    // If display shows only a zero
                    if (expressionDisplay.value == '0') {
                        // Replace '0' with negative sign
                        expressionDisplay.value = '\u002D';

                        // Reset current operand
                        calculator.currentOperand = '';
                    }

                    // Otherwise append to existing expression
                    else {
                        // Append negative sign to expression display
                        expressionDisplay.value += '\u002D';
                    }

                    // Update current operand with negative sign
                    calculator.currentOperand += '\u002D';
                }

                // Handle operator replacement
                else if (/[+−÷×^E]/.test(previousOperator)) {
                    // Display current operation queue for debugging
                    console.log('Current Queue:');
                    console.table(calculator.operatorQueue);

                    // Regex to match and replace the previous operator
                    const operatorRegex =
                        keyId !== 'key-power' && keyId !== 'key-exponent'
                            ? new RegExp(`(?<=\\s)\\${previousOperator}(?=\\s$)`)
                            : new RegExp(`\\s\\${previousOperator}\\s$`);
                            
                    // Retrieve operator symbol for pressed key
                    const keySymbol = calculator.operators[keyId].symbol;
                
                    // Replace the old operator with the new one in the display
                    const updatedExpression = expressionDisplay.value.replace(operatorRegex, keySymbol);
                
                    // Update operator queue and display
                    expressionDisplay.value = updatedExpression;

                    // Get the index of the last matching operator in the queue    
                    const operatorIndex = calculator.operatorQueue.findLastIndex(findOperatorIndex, previousOperator);

                    // Dequeue the last matching operator
                    const operatorEntry = calculator.operatorQueue[operatorIndex];

                    // Update operator queue entry with new operator details
                    [operatorEntry[0], operatorEntry[1], operatorEntry[2]] = [keyId, keySymbol, operatorRank];
                
                    // Display updated operation queue for debugging
                    console.log('Updated Queue:');
                    console.table(calculator.operatorQueue);
                }

                // Append operator if value exists
                else if (calculator.currentOperand.length !== 0 && Number.isFinite(parseFloat(calculator.currentOperand))) {
                    // Retrieve operator symbol for pressed key
                    const keySymbol = calculator.operators[keyId].symbol;

                    // Pad operator unless it's a power key
                    const operator = keyId !== 'key-power' && keyId !== 'key-exponent' 
                        ? keySymbol.padStart(2).padEnd(3) 
                        : keySymbol;

                    // Append operator to display
                    expressionDisplay.value += operator;

                    // Add the operator and action to the queue
                    calculator.operatorQueue.push([keyId, keySymbol, operatorRank]);

                    // Reset tracked value after operator added
                    calculator.currentOperand = '';
                }
            }

            // Handle parentheses key press logic
            else if (keyId === 'key-parentheses') {                
                // Destructure parentheses from action tuple
                const [openingParenthesis, closingParenthesis] = keyAction;

                // Match preceding operator or math function (e.g. sqrt or log)
                if (/(?:[+−÷×^(]|log|ln|√)$/g.test(displayText) || expressionDisplay.value === '0') {
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
                else if (/\d|\)/.test(previousOperator)) {
                    // Append the padded multiplication operator
                    insertMultiplication();

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

        case 'math-function':
            // Retrieve mathematical function symbol (e.g., 'ln', 'log', '√')
            const keySymbol = calculator.mathFunctions[keyId].symbol;

            // Get function's inherent precedence level before nesting adjustment
            const baseRank = calculator.mathFunctions[keyId].rank;

            // Compute function's effective precedence based on parentheses depth
            const operatorRank = calculateOperatorRank(depthTracker, baseRank);

            // Log base precedence for debugging
            console.log('Base Rank:', baseRank);

            // Log adjusted precedence for debugging
            console.log('Operator Rank:', operatorRank);

            // Replace zero or append function symbol to display
            expressionDisplay.value = expressionDisplay.value === '0' 
            ? keySymbol
            : expressionDisplay.value + keySymbol;

            // Simulate a click on the parentheses button
            parenthesesKey.click();

            // Enqueue function with its symbol and precedence for later evaluation
            calculator.operatorQueue.push([keyId, keySymbol, operatorRank]); 

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