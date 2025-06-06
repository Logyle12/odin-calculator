// Store reference to buttons and sidebars
const menuButtons = document.querySelectorAll('.menu-btn');  
const historySidebar = document.querySelector('#history-sidebar');  
const keyboardSidebar = document.querySelector('#keyboard-sidebar');   

// Get reference to mobile history section
const historyMobile = document.querySelector('.history-mobile');

// Get reference to keypad columns
const keypadColumns = document.querySelectorAll('.keypad-column');

// Get reference to the history lists in the DOM
const historyLists = document.querySelectorAll('.history-list');

// Get device-specific history list 
const historyList = [...historyLists].find(findHistoryList);

// Get reference to clear history buttons
const clearHistoryButtons = document.querySelectorAll('.clear-history-btn');

// Get device-specific clear button
const clearHistoryButton = [...clearHistoryButtons].find(findClearButton);

// Get the theme switch input to detect user selection
const themeSwitch = document.querySelector('#theme-switch');

// Get the calculator container to update its theme
const calculatorUI = document.querySelector('.calc-container');

// Get icon elements for toggling between history and keyboard views
const historyIcon = document.querySelector('#history-icon');
const keyboardIcon = document.querySelector('#keyboard-icon');

// Map switch values to corresponding theme class names
const themeOptions = {
    '1': 'theme-default', 
    '2': 'theme-light',   
    '3': 'theme-dark',    
};

// Retrieve display elements
const expressionDisplay = document.querySelector('#expression-display');
const resultDisplay = document.querySelector('#result-display');

// Retrieve all key elements
const keyButtons = document.querySelectorAll('.key');

// Calculator object holding state and configurations
const calculator = {
    // Holds the result of the expression validation
    validationData: {
        isValid: null,
        errorMessage: null,
    },

    // Stores the history of previous calculations
    calculationHistory: [],

    // Store latest number value
    currentOperand: expressionDisplay.value,

    // Track max digits allowed
    digitLimits: {
        'INTEGER': 15,
        'DECIMAL': 10,
        'EXPONENT': 3,
    },

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
            'rank': 4,
            'symbol': 'ln',
            'operation': naturalLog,
        },
        
        // Common logarithm (base 10)
        'key-log10': {
            'rank': 4,
            'symbol': 'log',
            'operation': log10,
        },
        
        // Square root function (√x)
        'key-square-root': {
            'rank': 4,
            'symbol': '√',
            'operation': squareRoot,
        },
    },

    // Store pending operations awaiting calculation
    operationsQueue: [],
};

// Maps keyboard keys to their corresponding calculator buttons
const keyMap = {
    // Percent (%)
    'Digit5': { shift: 'key-percent' },

    // Decimal (.)
    'Period': { normal: 'key-decimal' },

    // Power (a^b)
    'Digit6': { shift: 'key-power' },

    // Powers of 10 (10^n)
    'KeyE': { normal: 'key-exponent', shift: 'key-exponent' },

    // Multiplication (a*b)
    'Digit8': { shift: 'key-multiply' },

    // Division (a/b)
    'Slash': { normal: 'key-divide' },

    // Addition (a+b)
    'Equal': { normal: 'key-equals', shift: 'key-add' },
    'Enter': {normal: 'key-equals', shift: 'key-equals'},

    // Subtraction (a-b)
    'Minus': { normal: 'key-subtract' },

    // Natural logarithm (base e)
    'KeyL': { normal: 'key-natural-log', shift: 'key-natural-log' },

    // Common logarithm (base 10)
    'KeyG': { normal: 'key-log10', shift: 'key-log10' },

    // Square root function (√x)
    'KeyR': { normal: 'key-square-root', shift: 'key-square-root' },

    // Clear (AC)
    'Escape': { normal: 'key-AC', shift: 'key-AC' },
    'KeyA': { normal: 'key-AC', shift: 'key-AC' },

    // Delete (DEL)
    'Backspace': { normal: 'key-del', shift: 'key-del' },
    'Delete':    { normal: 'key-del', shift: 'key-del' },
};

// Helper functions

// Determines whether the user is browsing from a desktop computer
function isDesktop() {    
    // Get the device and browser information string
    const userAgent = navigator.userAgent;

    // Common identifiers found in mobile device browsers
    const mobilePattern = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/gi;
    // Identifiers specific to Windows desktop computers
    const windowsPattern = /Windows NT|Win32|Win64/gi;
    // Identifiers specific to Mac desktop computers
    const macPattern = /Macintosh|Mac OS/gi;

    // Determine if this is a mobile device
    const isMobile = mobilePattern.test(userAgent);
    // Determine if this is a Windows PC
    const isWindows = windowsPattern.test(userAgent);
    // Determine if this is a Mac (excluding touch-capable devices like iPads)
    const isMac = macPattern.test(userAgent) && navigator.maxTouchPoints === 0;

    // A desktop is any non-mobile device running Windows or Mac OS
    return !isMobile && (isWindows || isMac);
}

// Finds history list element matching device-specific ID
function findHistoryList(listElement) {
    // Choose ID based on device type
    const targetListId = isDesktop() ? 'desktop-list' : 'mobile-list';

    // Debug output of target ID
    console.log(`Target list ID: ${targetListId}`);
    
    // Check if element ID matches target
    return listElement.id === targetListId; 
}

// Finds clear button element matching device-specific ID
function findClearButton(buttonElement) {
    // Choose ID based on device type
    const targetButtonId = isDesktop() ? 'desktop-btn' : 'mobile-btn';

    // Debug output of target ID
    console.log(`Target button ID: ${targetButtonId}`);
    
    // Check if element ID matches target
    return buttonElement.id === targetButtonId; 
}

// Check if an expression ends with a number or closing parenthesis
function endsWithValidToken(expression) {
    // Verify expression ends with a valid token
    return /(?:\-?\d+\.?\d*\%?)$|\)$/gi.test(expression);
}

// Ensures newest input is visible by auto-scrolling to the end
function scrollToLatestInput() {
    // Get full width of scrollable content
    const scrollWidth = expressionDisplay.scrollWidth;

    // Auto-scroll to keep newest input visible
    expressionDisplay.scrollTo({
        // Scroll to full width of content
        left: scrollWidth, 
        // Immediate scroll without animation
        behavior: 'instant', 
    });
}

// Determines the appropriate digit limit 
function getDigitLimit(valueString) {
    // Default to the integer digit limit for whole numbers
    let digitLimit = calculator.digitLimits.INTEGER;

    // Log value string for debugging
    // console.log('Value String:', valueString);

    // Check if operand in scientific notation
    if (/\E/gi.test(valueString)) {
        // Use exponent digit limit
        digitLimit = calculator.digitLimits.EXPONENT
    }
 
    // Check if the operand contains a decimal point
    else if (/\./g.test(valueString)) {
        // Use fractional digit limit
        digitLimit = calculator.digitLimits.DECIMAL;
    }

    // Log digit limit for debugging
    // console.log('Digit Limit:', digitLimit);
    
    // Return the digit limit 
    return digitLimit;
}

// Counts total digits for integers or decimal places for floats
function getDigitCount(valueString) {
    // Log value string for debugging
    // console.log('Value String:', valueString);

    // Extract digit part based on exponent or decimal format
    const digitPart = /\E/gi.test(valueString) 
        ? valueString.replace(/.+\E[+-]?(?=\d+|$)/gi, '') 
        : valueString.replace(/\d+\./g, '');

    // Log digit part for debugging
    // console.log('Digit Part:', digitPart);

    // Count digits after decimal point or total digits if integer
    const digitCount = digitPart.length;

    // Log digit count for debugging
    // console.log('Digit Count:', digitCount);

    // Return the computed digit count 
    return digitCount;
}

// Removes the last input element based on expression type
function removeLastInput(expression) {
    // Remove just the final character (digit, decimal, parenthesis, etc.)
    let updatedExpression = expression.slice(0, -1);
    
    // Handle operators which have special formatting
    if (/\s[+−÷×]\s$/.test(expression)) {
      // Remove the operator and its surrounding spaces (3 characters total)
      updatedExpression = expression.slice(0, expression.length - 3);
    } 
    
    // Handle mathematical functions that end with an opening parenthesis
    else if (/(?:log|ln|√)\($/.test(expression)) {
      // Remove the entire function call syntax
      updatedExpression = expression.replace(/(?:log|ln|√)\($/gi, '');
    } 
    
    // Return the expression with last input removed
    return updatedExpression;
}

// History functions

// Adds a calculation to the history sidebar
function saveHistory(expression, result) {
    // Create main list item container
    const entryItem = document.createElement('li');
    
    // Create separate spans for each component of the history entry
    const expressionSpan = document.createElement('span');
    const equalsSpan = document.createElement('span');
    const resultSpan = document.createElement('span');
    
    // Create text nodes with the calculation values
    const expressionText = document.createTextNode(`${expression}`);
    const equalsText = document.createTextNode(' = ');
    const resultText = document.createTextNode(`${result}`);
    
    // Add appropriate CSS classes for styling and extraction
    entryItem.className = 'history-item';
    equalsSpan.className = 'history-equals';
    expressionSpan.classList.add('history-expression', 'history-entry');
    resultSpan.classList.add('history-result', 'history-entry');
    
    // Append text nodes to their respective span elements
    expressionSpan.appendChild(expressionText);
    equalsSpan.appendChild(equalsText);
    resultSpan.appendChild(resultText);
    
    // Assemble the history item by adding all spans
    entryItem.appendChild(expressionSpan);
    entryItem.appendChild(equalsSpan);
    entryItem.appendChild(resultSpan);
    
    // Add the complete history item to the history list
    historyList.appendChild(entryItem);

    // Checks if the history sidebar is active
    if (historySidebar.classList.contains('calc-help-sidebar-active')) {
        // Scrolls the latest entry item into view
        historyList.scrollTop = historyList.scrollHeight - historyList.clientHeight;
    }
}

// Clear all saved history from the calculator
function clearHistory() {
    // Only clear if there's something in history
    if (calculator.calculationHistory.length > 0) {
        // Reset the history data
        calculator.calculationHistory = [];

        // Remove all history items from the sidebar
        historyList.replaceChildren();

        // Remove visibility class to animate button out of view
        clearHistoryButton.classList.remove('active-btn');
    }
}

// Loads a previous calculation when a history item is clicked
function loadFromHistory(event) {
    // Gets the clicked history element
    const historyEntry = event.target;

    // Checks if the clicked element is a valid history entry
    if (historyEntry.classList.contains('history-entry')) {
        // Scrolls the selected history item into view
        historyEntry.scrollIntoView({behavior: 'smooth', block: 'center'});
        
        // Sets expression field to history item's text
        expressionDisplay.value = historyEntry.textContent;
        
        // Only proceed if a calculation expression was clicked
        if (historyEntry.classList.contains('history-expression')) {
            // Finds matching calculation in history
            const currentEntry = calculator.calculationHistory.find(
                // Matches based on expression text
                (record) => record.inputExpression === expressionDisplay.value
            );
            
            // Debug log header
            console.log('Retrieved Calculation');
            
            // Shows full details in console
            console.table(currentEntry);
            
            // Restores operation sequence
            calculator.operationsQueue = currentEntry.operationsQueue;
            
            // Shows saved result
            resultDisplay.value = currentEntry.computedResult;
        }
    
        // Otherwise it's a result string
        else {
            // Clear result display if it contains any value
            if (resultDisplay.value.length > 0) {
                // Reset operations queue if any operations exist
                if (calculator.operationsQueue.length > 0) {
                    // Empty the queue of pending operations
                    calculator.operationsQueue = [];   
                }
                
                // Clear the result display completely
                resultDisplay.value = '';
            }
        }
    
        // Set current operand to last number in display  
        setCurrentOperand(expressionDisplay.value);
    
        // Log current operand for debugging
        console.log('Current Operand:', calculator.currentOperand);
    }

}

// Event Listener Callbacks

// Handles keydown events and triggers corresponding button clicks  
function processKeyEvent(event) {  
    // Get the event's key code  
    const keyCode = event.code;
    // Log the key code for debugging  
    console.log('Key Code:', keyCode);

    // Get the key's actual value  
    const keyValue = event.key; 
    // Log the key value for debugging  
    console.log('Key Value:', keyValue);

    // If a digit key (0-9) is pressed without Shift, find the matching button  
    if (/[0-9]/.test(keyValue) && !event.shiftKey && (keyCode.includes('Digit') || keyCode.includes('Numpad'))) {  
        // Locate the button corresponding to the pressed digit  
        const digitButton = [...keyButtons].find((key) => key.id === `key-${keyValue}`);
        
        // Log the matched button for debugging  
        console.log('Digit Button:', digitButton);  
        
        // Simulate a click on the digit button  
        digitButton.click();  
        
        // Exit the function after handling the digit input  
        return;  
    }  

    // If the key exists in keyMap, determine the correct key ID  
    else if (keyMap[keyCode]) {  
        // Get the appropriate key ID based on whether Shift is pressed  
        const keyId = event.shiftKey ? keyMap[keyCode].shift : keyMap[keyCode].normal;  
        
        // Locate the button corresponding to the mapped key  
        const keyButton = [...keyButtons].find((key) => key.id === keyId);  
        
        // Log the matched button for debugging  
        console.log('Key Button');  
        
        // Simulate a click on the mapped key button  
        keyButton.click();
        
        // Log the resolved key ID for debugging  
        console.log('Key Id:', keyId);  
    }  

    // Otherwise handle parentheses entry
    else {
        // Store depth tracker reference to track parentheses depth
        const depthTracker = calculator.depthTracker;

        // Only process when shift key is held down
        if (event.shiftKey) {
            // Check which key was pressed with shift
            switch (keyCode) {
                // Opening parenthesis (shift+9)
                case 'Digit9':
                    // Implicit multiplication case
                    if (/(?:\d|\))$/g.test(expressionDisplay.value) && expressionDisplay.value !== '0') {
                        // Append the padded multiplication operator
                        insertMultiplication();
                    }

                    // Add opening parenthesis and update depth counter
                    addOpeningParenthesis(keyValue, depthTracker);
                    break;

                // Closing parenthesis (shift+0)
                case 'Digit0':
                    // Add closing parenthesis if balance allows and update depth counter
                    addClosingParenthesis(keyValue, depthTracker);
                    break;

                // Ignore other shift key combinations
                default:
                    break;
            }
        }
    }

    // Print a newline for log separation  
    console.log('\n');
}

// Updates the calculator theme based on user selection
function applyTheme() {
    // Get the currently applied theme 
    const currentTheme = calculatorUI.classList[1];
    
    // Determine the theme corresponding to the selected switch value
    const selectedTheme = themeOptions[themeSwitch.value];

    // Change icon colors based on selected theme  
    switch (selectedTheme) {  
        // Use dark icons for light theme for better contrast  
        case 'theme-light':  
            historyIcon.src = 'assets/icons/history-icon-dark.png';  
            keyboardIcon.src = 'assets/icons/keyboard-icon-dark.png';  
            break;  
    
        // Use light icons by default for dark or default themes  
        default:  
            historyIcon.src = 'assets/icons/history-icon-light.png';  
            keyboardIcon.src = 'assets/icons/keyboard-icon-light.png';  
            break;  
    }
    
    // Replace the old theme with the new one to reflect the change
    calculatorUI.classList.replace(currentTheme, selectedTheme);  
}

// Function to handle sidebar visibility 
function toggleSidebar(sidebarPanel) {
    // Remove active state if currently active  
    if (sidebarPanel.classList.contains('calc-help-sidebar-active')) { 
        // Hide the sidebar 
        sidebarPanel.classList.remove('calc-help-sidebar-active');  
    }  
    // Otherwise, toggled the active state  
    else {  
        // Toggle sidebar visibility
        sidebarPanel.classList.toggle('calc-help-sidebar-active');  
    }  
}

// Remove history-mode class from all keypad columns on mobile
function toggleHistoryMobile() {
    // Only apply this on mobile devices
    if (isDesktop() === false) {
        // Loop through all keypad columns
        keypadColumns.forEach((keypadColumn) => {
            // Merge the history layout into the keypad
            keypadColumn.classList.toggle('history-mode');
        });
        
        // Toggle active state on history mobile element
        historyMobile.classList.toggle('active');
    }
}

// Event listeners

// Handle key button clicks
function handleKeyActions() {
    // Iterate through each key button
    keyButtons.forEach((key) => {
        // Add click event handler
        key.onclick = () => {           
            // Update display with key action
            updateDisplay(key);

            // Keep view scrolled to show the newest input
            scrollToLatestInput();
        }
    });
}

// Sets up a listener for keyboard input events  
function handleKeyboardInput() {  
    // Attach the keydown event listener to trigger processKeyEvent  
    document.addEventListener('keydown', (event) => {
        // Converts keyboard press into appropriate calculator action
        processKeyEvent(event);

        // Keep view scrolled to show the newest input
        scrollToLatestInput();
    });
}

// Initializes history sidebar event listeners
function setupHistoryListeners() {
    // Handles clicks on history items to restore calculations
    historyList.addEventListener('click', loadFromHistory);
    
    // Handles clicks on clear button to remove all history
    clearHistoryButton.addEventListener('click', clearHistory);
}

// Sets up event handler for sidebar toggle buttons
function handleSidebar() {
    // Hide keyboard button and sidebars on mobile devices
    if (isDesktop() === false) {
        // Find the keyboard button from the menu button list
        const keyboardBtn = [...menuButtons].find((button) => button.id === 'keyboard-btn');
        
        // Hide the keyboard button on mobile
        keyboardBtn.style.display = 'none';
        
        // Remove the history sidebar from the DOM
        historySidebar.remove();
        
        // Remove the keyboard sidebar from the DOM
        keyboardSidebar.remove();
    }

    // Handle desktop case
    else {
        // Find mobile history element in the DOM
        const mobileHistory = document.querySelector('.history-mobile');

        // Remove mobile history from the page
        mobileHistory.remove();
    }

    // Maps button IDs to sidebar elements
    const sidebarControls = {
        'history-btn': historySidebar,
        'keyboard-btn': keyboardSidebar,
    }

    // Iterates through each menu button to attach click handlers
    menuButtons.forEach((menuButton) => {
        // Defines the click event behavior for each button
        menuButton.onclick = () => {
            // Finds currently active button in the UI
            const activeButton = document.querySelector('.menu-btn-active');

            // Gets the ID of the clicked button to determine which sidebar to toggle
            const buttonId = menuButton.id;

            // Retrieves the corresponding sidebar panel from mapping object
            const sidebarPanel = sidebarControls[buttonId];

            // Check if a different button was clicked
            if (activeButton !== menuButton) {
                // Verifies there is an active button to deactivate
                if (activeButton) {
                    // Gets the previously active sidebar panel
                    const activePanel = sidebarControls[activeButton.id];
                    
                    // Removes active state from previous button
                    activeButton.classList.toggle('menu-btn-active');  

                    // Hides the previously active sidebar
                    toggleSidebar(activePanel);
                }

                // Sets the clicked button as active
                menuButton.classList.add('menu-btn-active');

                // Scrolls to bottom of history list when opening the sidebar
                if (buttonId === 'history-btn') {
                    // Switch to mobile layout for history
                    toggleHistoryMobile();

                    // Set scroll position to show the most recent history entry
                    historyList.scrollTop = historyList.scrollHeight - historyList.clientHeight;
                }
            }

            // Otherwise if the clicked button is already active
            else {
                // Deactivates the button if it was already active
                activeButton.classList.remove('menu-btn-active');

                // Switch to mobile layout for history
                toggleHistoryMobile();
            }

            // Shows or hides the sidebar panel associated with clicked button
            toggleSidebar(sidebarPanel);
        }
    });

    // Initialize event listeners for history feature
    setupHistoryListeners();
}

// Adds an event listener to update the theme on user input
function handleThemeSwitch() {
    // Listen for input on the switch and apply the chosen theme
    themeSwitch.addEventListener('input', applyTheme);
}

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
    const powerValue = multiplier * raiseToPower([10, exponent]);

    // Returns the computed power value
    return powerValue;
}

// Add all numbers in the array
function add(operands) {
    // Calculate and return the sum
    const sum = operands.reduce(
        (sum, number) => sum + number,
    );

    // Return the computed sum
    return sum;
}

// Subtract all numbers in the array
function subtract(operands) {
    // Calculate and return the difference
    const difference = operands.reduce(
        (difference, number) => difference - number,
    );

    // Return the computed difference
    return difference; 
}

// Multiply all numbers in the array
function multiply(operands) {
    // Calculate and return the product
    const product = operands.reduce(
        (product, number) => product * number,
    );

    // Return the computed product
    return product; 
}

// Divide the initial number by all subsequent numbers in the array
function divide(operands) {
    // Calculate and return the quotient
    const quotient = operands.reduce(
        (quotient, number) => quotient / number,
    );

    // Return the computed quotient
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

// Handles implicit multiplication
function insertMultiplication() {
    // Find the multiplication key by its specific ID
    const multiplyKey = [...keyButtons].find((key) => key.id === 'key-multiply');

    // Simulate a click on the multiplication button
    multiplyKey.click();

    // Log the current state of the operator queue 
    console.log('Operator Queue:');
    console.table(calculator.operationsQueue);

    // Clear the current operand for next input
    calculator.currentOperand = '';
}

// Adds an opening parenthesis to start a nested expression
function addOpeningParenthesis(openingSymbol, depthTracker) {    
    // Update the opening count
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

    // Replace '0' with opening parenthesis or append to existing expression
    expressionDisplay.value = expressionDisplay.value === '0' 
        ? openingSymbol 
        : expressionDisplay.value + openingSymbol;

    // Log opening count for debugging
    console.log('Opening Count:', depthTracker.openingCount);
}

// Adds a closing parenthesis to complete expression
function addClosingParenthesis(closingSymbol, depthTracker) {
    // Check if expression ends with a number or closing parenthesis
    const isValidEnd = endsWithValidToken(expressionDisplay.value);

    // Close parenthesis if there are unclosed ones and expression ends properly
    if (depthTracker.closingCount < depthTracker.highestDepth && isValidEnd) {
        // Append closing parenthesis when there are unclosed ones
        expressionDisplay.value += closingSymbol;

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

// Calculates an operator's precedence, factoring in nesting depth
function calculateOperatorRank(baseRank) {
    // Get current depth of nested parentheses
    const depthLevel = calculator.depthTracker.openingCount;

    // Compute operator rank scaling by nesting level
    const operatorRank = baseRank + (4 * depthLevel);

    // Returns the adjusted precedence value
    return operatorRank;
}

// Derive the current operand from the display text  
function setCurrentOperand(displayText) {
    // Remove all whitespace from the display text
    displayText = displayText.replaceAll(/\s/g, '');

    // Proceed only if the display ends with a valid operand  
    if (/\d+$|\E[+-]/gi.test(displayText)) {
        // Extract all numbers from display text
        const operands = displayText.replaceAll(',', '').match(/(\-?\d+\.?\d*\E?[+-]?\d*)/gi);
    
        // Update current operand only if it differs from last number
        if (calculator.currentOperand !== operands.at(-1)) {
            // Set to the latest operand 
            calculator.currentOperand = operands.pop();

            // Exit operand search
            return;
        }
    }

    // No valid operand detected
    else {
        // Clear the current operand
        calculator.currentOperand = '';
    }

    // Return the current operand unchanged 
    return;
}

// Converts operand strings to numeric values with percentage handling
function processOperands(numericString, currentIndex, operandStrings) {
    // Get operator ID from function context
    const operatorId = String(this);

    console.log('Operator Id:', operatorId);

    // For percentage values (e.g., "50%")
    if (/(\d+)\%/.test(numericString)) {
        // Convert percentage to decimal value (50% → 0.5)
        const percentValue = parseFloat(numericString)/100;

        // First operand: direct percentage conversion
        if (currentIndex === 0) {
            // Return simple decimal form for percentage
            return percentValue;
        }
        
        // Subsequent operands: percentage relative to first operand
        else {
              // Apply percentage change based on the first operand  
            if (operatorId === 'key-add' || operatorId === 'key-subtract') {
                // Calculate percentage relative to the first operand's value
                const relativePercent = (parseFloat(numericString)/100) * parseFloat(operandStrings[0]);
            
                // Return calculated relative percentage value
                return relativePercent;
            }

            // Check if operator is exponentiation
            else if (operatorId === 'key-exponent') {
                // Adjust exponent value by subtracting 2 (division by 10^2)
                const adjustedExponent = parseFloat(operandStrings[1]) - 2;

                // Return the adjusted exponent for further calculation
                return adjustedExponent;
            }

            // Return simple decimal form for percentage
            return percentValue;
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

    // Format number if not a decimal number or in scientific notation
    if (unformattedNumber.includes('.') === false && /E/gi.test(unformattedNumber) === false) {
        // Parse and format number with UK locale separators
        const formattedNumber = parseInt(calculator.currentOperand, 10).toLocaleString('en-GB');

        // Replace unformatted number with locale-formatted version
        expressionDisplay.value = expressionDisplay.value.replace(/[\d,-]+$/g, unformattedNumber)
                                            .replace(unformattedNumber, formattedNumber);

    }
}

// Ensure operators are evenly spaced for alignment
function formatOperator(keySymbol) {
    // Pad only non-exponential operators for consistent width  
    const operator = /[+−÷×]/.test(keySymbol) 
        ? keySymbol.padStart(2).padEnd(3) 
        : keySymbol;

    // Return formatted operator  
    return operator;
}

// Centralized function for validating expressions and handling errors
function validateExpression(expression) {
    // Store error messages
    let errorMessage = '';
    
    // Check for division by zero in expression
    if (/÷0(?!\.)/g.test(expression)) {
        // Human-readable error for division by zero
        errorMessage = "Error: Division by Zero";
    } 

    // Check for logarithm of zero or negative number
    else if (/(?:log|ln)\(?(?:0(?!\.)|\-)/g.test(expression)) {
        // More concise error for invalid logarithm input
        errorMessage = "Error: Invalid log Input";
    }

    // Check for square root of negative number
    else if (/√\(?\-/g.test(expression)) {
        // Human-readable error for invalid square root input
        errorMessage = "Error: Negative Square Root";
    }

    // Check for other calculation errors
    else if (/[+−÷×^E]$|\((?!.+)/gi.test(expression)){
        // Generic error message for other mathematical errors
        errorMessage = "Error: Well... This is Awkward";
    }

    // Check for value overflow beyond number limits
    else if (Math.abs(parseFloat(expression)) === (Number.POSITIVE_INFINITY)) {
        // Concise error for exceeding numeric range
        errorMessage = "Value Out of Range";
    }
    
    // Build validation outcome with status and message
    const validationData = {
        isValid: errorMessage === '',
        errorMessage: errorMessage
    };

    // Attach validation data to calculator for future access
    calculator.validationData = validationData;

    // Log validation outcome for debugging
    console.log('validation Data:');
    console.table(validationData);
}

// Reset error styling on all display elements
function clearErrorState() {
    // Check if expression display has error styling
    if (expressionDisplay.classList.contains('error-state')) {
        // Remove error state styling from expression display
        expressionDisplay.classList.remove('error-state');
    }
 
    // Check if result display has error styling
    if (resultDisplay.classList.contains('error-state')) {
        // Remove error state styling from result display
        resultDisplay.classList.remove('error-state');

        // Clear result display to refresh for the next entry
        resultDisplay.value = '';
    }
}

// Function to create a shake animation effect on a DOM element
function shakeDisplay(displayElement) {
    // Define sequence of positions for the shake animation
    const shakePositions = [
        {left: '-12px'}, {left: '12px'}, 
        {left: '-8px'}, {left: '8px'}, 
        {left: '-4px'}, {left: '4px'},
        {left: '-2px'}, {left: '2px'}, 
        {left: '0px'}
    ];
    
    // Loop through each position in the sequence
    for (let i = 0; i < shakePositions.length; i++) {
        // Get the current position value
        const position = shakePositions[i].left;
        
        // Calculate delay with increasing time between movements
        const delay = 100 + (i * 25);
        
        // Set element position after calculated delay
        const timer = setTimeout(() => {
            // Apply the position to the element's style
            displayElement.style.left = position;
            
            // Clean up the timer to prevent memory leaks
            clearTimeout(timer);
        }, delay);
    }
}

// Extracts the next operation to be evaluated based on "PEMDAS" order
function findNextOperation(operatorRegex, expression) {
    // Will store our target operation once we find it
    let currentOperation;
    
    // Finds any expressions within parentheses - they get priority
    const groupedExpressions = Array.from(expression.matchAll(/\(.+?\)+/g));
 
    // Process any parenthesized expressions first
    if (groupedExpressions !== null) {
        // Loop through each matched group of parenthesized expressions
        for (let i = 0; i < groupedExpressions.length; i++) {
            // Track how deeply nested each expression is
            let depthLevel = 0;

            // Extract just the sub expression string
            const subExpression = groupedExpressions[i][0];

            // Loop through each character in the sub expression
            for (let charIndex = 0; charIndex < subExpression.length; charIndex++) {
                // Get the current character
                const character = subExpression[charIndex];

                // Increase depth level for every opening parenthesis
                if (character === '(') {
                    // Track nesting level
                    depthLevel += 1;
                }

                // Assign depth once end of expression is reached
                if (charIndex + 1 === subExpression.length) {
                    // Store the calculated depth value in the array
                    groupedExpressions[i][1] = depthLevel;
                }
            }
        }

        // Sort groups by nesting depth, deepest first
        groupedExpressions.sort((matchA, matchB) => matchB[1] - matchA[1]);

        // Log grouped matches for debugging
        console.log('Groups:');
        
        // Visualize grouped expressions and their depth
        console.table(groupedExpressions);

        // Loop through each group starting with the deepest
        for (const group of groupedExpressions) {
            // Get the sub expression from the group
            const subExpression = group[0];

            // If it contains a valid operator, extract and return it
            if (operatorRegex.test(subExpression)) {
                // Extract and store the operation matching our pattern 
                currentOperation = subExpression.match(operatorRegex);

                // Return the matched operation for processing
                return currentOperation;
            }
        }
    }
 
    // Match the operation pattern in the main expression when no groups exist
    currentOperation = expression.match(operatorRegex);

    // Return the matched operation for processing
    return currentOperation;
}

// Callback that locates operator in queue by matching rank and symbol
function findOperatorIndex(operatorEntry) {
    // Destructure operator data
    const [keyId, keySymbol, operatorRank] = operatorEntry;

    console.log('Key Id:', keyId);
    console.log('Key Symbol:', keySymbol);
    console.log('Operator Rank:', operatorRank);

    // Chooses between arithmetic and function handlers based on input
    const operationHandler = /[+−÷×^E]/g.test(keySymbol)  
        ? calculator.operators  
        : calculator.mathFunctions;
    
    // Get operator's intrinsic precedence
    const baseRank = operationHandler[keyId].rank;
 
    console.log('Base Rank:', baseRank);

    // Convert implicit 'this' to string for symbol comparison
    const operatorSymbol = String(this);

    console.log('Operator Symbol:', operatorSymbol);
    // Calculate effective rank based on nesting
    const currentRank = calculateOperatorRank(baseRank);

    console.log('Current Rank:', currentRank);
    console.log('\n');

    // Store depth tracker reference to track parentheses depth
    const depthTracker = calculator.depthTracker;

    // For nested expressions
    if (depthTracker.openingCount > 0) {
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
    const operands = operandStrings.map(processOperands, operatorId);

    // Log the sub-expression
    console.log('Sub Expression:', subExpression);

    // Log the matched segment
    console.log('Matched Segment:', matchedSegment);

    // Log the extracted operands for debugging
    // console.log('Operands:', operands);

    // Log the operator ID
    // console.log('Operator Id:', operatorId);

    // Chooses between arithmetic and function handlers based on input
    const operationHandler = /[+−÷×^E]/g.test(subExpression)  
        ? calculator.operators  
        : calculator.mathFunctions;

    // Apply respective operation
    const simplifiedResult = parseFloat(
        operationHandler[operatorId].operation(operands)
    );

    // Determine maximum digits allowed for the result
    const digitLimit = getDigitLimit(simplifiedResult);

    // console.log('Digit Limit:', digitLimit);

    // Keep scientific notation or fix decimal precision as needed
    const formattedResult = simplifiedResult.toString().includes('e') 
        ? simplifiedResult 
        : parseFloat(simplifiedResult.toFixed(digitLimit));

    // Substitute calculated value within the matched context
    const simplifiedSegment = matchedSegment.replace(subExpression, formattedResult);

    // Add the simplified portion back into the full expression
    const simplifiedExpression = originalExpression
        .replace(matchedSegment, simplifiedSegment);

    // Log the result of the operation
    // console.log('Simplified Result:', simplifiedResult);

    // Log the formatted result
    console.log('Formatted Result:', formattedResult);

    // Log the simplified segment
    console.log('Simplified Segment:', simplifiedSegment);

    // Return the simplified expression
    return simplifiedExpression;
}

// Evaluate expression by operator precedence
function evaluateExpression(expression) {
    // Get the current size of the operator queue   
    const queueSize = calculator.operationsQueue.length;
        
    // If the queue has more than one operator, sort by precedence
    if (queueSize > 1) {
        // Arrange operators by their precedence
        calculator.operationsQueue.sort(
            (operatorA, operatorB) => operatorB[2] - operatorA[2]
        );    
    }

    // Log the sorted operator queue for debugging
    // console.log('Queue');
    // console.table(calculator.operationsQueue);

    // Check if the expression is a lone number in parentheses 
    if (/^\(*\-?\d+\.?\d*\%?\)*$/g.test(expression)) {
        // Remove the parentheses and extract the number 
        const unwrappedNumber = expression.replaceAll(/[()]/g, '');

        // Convert percentage to decimal if the number ends with '%' 
        if (/\%$/g.test(unwrappedNumber)) {
            // Divide by 100 to get the decimal value 
            return parseFloat(unwrappedNumber) / 100;
        }

        // Return the unwrapped number
        return unwrappedNumber;
    }

    // Process each expression based on operator precedence
    for (let i = 0; i < queueSize; i++) {
        // Matches nested expressions enclosed in redundant parentheses
        const nestedGroupRegex = /(?<=\()\((.+?)\)(?=\))/gi;

        // Matches single numbers wrapped in parentheses
        const singleNumberRegex = /\((\-?\d+\.?\d*(?:\E?(?<=\E)[+-]\d+)?\%?)\)/gi;

        // Simplify nested parentheses patterns
        while (nestedGroupRegex.test(expression) || singleNumberRegex.test(expression)) {
            // Unwrap redundant groups and single numbers in parentheses
            const normalizedExpression = expression.replaceAll(nestedGroupRegex, '$1')
                                            .replaceAll(singleNumberRegex, '$1');

            // Log simplified expression for debugging
            console.log('Normalized Expression', normalizedExpression);

            // Update with normalized version
            expression = normalizedExpression;
        }

        // Destructure priority operator's details from queue
        const [operatorId, currentOperator] = calculator.operationsQueue[i];

        // Match operands around operator or functions
        const pattern = /[+−÷×^E]/.test(currentOperator)
            ? `([^()+−÷×^logn√]+(?:\\E?(?<=\\E)[+-]\\d+)?)\\${currentOperator}([^()+−÷×^logn√]+(?:\\E?(?<=\\E)[+-]\\d+)?)`
            : `${currentOperator}([^()+−÷×^]+)`;
    
        // Convert the pattern to a regular expression
        const regex = new RegExp(pattern, 'i');
        console.log('Regex:', regex);

        // Find all matches of the pattern in the mathematical expression
        const operatorMatches = findNextOperation(regex, expression);
        
        // Log matched expressions for debugging
        console.log('Operator Matches:');
        console.table(operatorMatches);

        // Process the matched expressions unwrapping single-number parentheses if present 
        const simplifiedExpression = simplifyExpression(operatorId, operatorMatches, expression).replaceAll(singleNumberRegex, '$1');

        // Log the updated expression
        console.log('Simplified Expression:', simplifiedExpression);
        console.log('\n');

        // Validate simplified expression for calculation errors
        validateExpression(simplifiedExpression);

        // Retrieve the validation outcome from the calculator
        const validationData = calculator.validationData;

        // Check if the expression is structurally valid before proceeding
        if (validationData.isValid) {
            // Update expression 
            expression = simplifiedExpression;
        }

        // Otherwise exit evaluation
        else {
            // Prevent further evaluation of an invalid expression
            return;
        }
    }

    return expression;
}

// Remove spaces and commas from the expression
function sanitizeExpression(expression) {
    // Replace spaces and commas with an empty string
    return expression.replace(/\s|\,/g, '');
}

// Extract and convert notation strings to numbers, replacing them in the expression
function handleScientificNotation(expression) {
    // Match scientific notation patterns in the expression
    const exponentialValues = expression.match(/\d+\.\d+\e[+-]\d+/gi);
    
    // If matches exist, replace each with its numeric equivalent
    if (exponentialValues) {
        // Iterate through array of exponential values
        for (const match of exponentialValues) {
            // Convert notation to a number and replace it in the expression
            expression = expression.replace(match, Number(match));
        }
    }
    
    // Return the updated expression
    return expression;
}

// Auto-close any unclosed parentheses in the expression
function autoCloseParentheses(expression) {
    // Get the count of unclosed opening parentheses
    const openingCount = calculator.depthTracker.openingCount;
    
    // Append closing parentheses to balance the expression
    return expression.concat(')'.repeat(openingCount));
}

// Preprocess expression by sanitizing, normalizing, and auto-closing
function processExpression(expression) {
    // Remove whitespace and commas for validation
    expression = sanitizeExpression(expression);

    // Check if expression contains scientific notation (e.g., 1.23e+4)
    expression = handleScientificNotation(expression);

    // Auto-close unclosed parentheses
    expression = autoCloseParentheses(expression);

    // Return the processed expression
    return expression;
}

// Evaluate the current expression and store the result
function displayComputedResult(displayElement, expression) {
    // Compute the result of the expression as a floating-point number
    const computedResult = parseFloat(evaluateExpression(expression), 10);
    
    // Log the computed result for debugging
    console.log('Computed Result:', computedResult);
    
    // Proceed only if the result is a valid number
    if (!isNaN(computedResult)) {
        // Check if the result is finite (not ±Infinity)
        if (isFinite(computedResult)) {
            // Format and display the result
            formatResult(displayElement, computedResult);
        } 
    }

    // Otherwise clear display if result is NaN or undefined 
    else {
        // Remove previous valid result to prevent confusion  
        displayElement.value = '';
    }
}

// Format result, switching to scientific notation if it exceeds digit limit
function formatResult(displayElement, result) {
    // Convert result to a string
    const resultString = result.toString();
    
    // Get appropriate precision for the result value
    const digitLimit = getDigitLimit(resultString);

    // Retrieve digit count from result 
    const digitCount = getDigitCount(resultString);

    // Log raw result before formatting
    console.log('Result String:', resultString);
    
    // Use scientific notation if result exceeds digit limit or already has an exponent
    if (digitCount > digitLimit || resultString.includes('e')) {
        // Convert to scientific notation
        displayElement.value = result.toExponential(8).toLocaleUpperCase(); 
    }  

    // Otherwise, format with localized number formatting
    else {
        // Format number with locale settings and digit limit
        displayElement.value = result.toLocaleString('en-GB', {
            maximumFractionDigits: digitLimit 
        });
    }
}

// Process and format the result of a mathematical expression
function processResult(displayElement, expression) {
    // Preprocess expression for evaluation and validation
    expression = processExpression(expression);

    // Validate simplified expression for calculation errors
    validateExpression(expression);
    
    // Retrieve the validation outcome from the calculator
    const validationData = calculator.validationData;
    
    // Log current operand for debugging
    console.log('Current Operand:', calculator.currentOperand);
    
    // Process expression only if valid results exist (non-empty and numeric)
    if (validationData.isValid && calculator.currentOperand.length !== 0) {
        // Check for a complete expression with a valid ending  
        if (/[\%\)\d]+$(?<!^\-?\d+\.?\d*$|^\-?\d+\.?\d*\e[+]\d+$)/gi.test(expression)) {
            // Compute display the result if it's a finite number
            displayComputedResult(displayElement, expression);
        }
    } 
    
    // Otherwise clear display
    else {
        // Clear the results display if the expression is incomplete  
        displayElement.value = '';
    }
}

// Update display with pressed key
function updateDisplay(key) {
    // Clear error styling from all display elements
    clearErrorState();

    // Get key action
    const keyAction = key.firstElementChild.textContent;

    // Get the key type (digit, control, or operator)
    const keyType = key.classList[1];

    // Get the key ID for reference in actions
    const keyId = key.id;
    
    // Check if operator/function follows decimal point
    const completeDecimal = (keyType === 'key-operator' || keyType === 'math-function') && 
                            keyId !== 'key-decimal';

    // Complete any trailing decimal point
    if (/\.$/.test(expressionDisplay.value) && completeDecimal) {
        // Append zero to complete the number 
        expressionDisplay.value += 0;
    }

    // Copy of display content for manipulation
    let displayText = expressionDisplay.value;

    // Store depth tracker reference to track parentheses depth
    const depthTracker = calculator.depthTracker;

    // Find the parentheses key by its specific ID
    const parenthesesKey = [...keyButtons].find((key) => key.id === 'key-parentheses');

    // Remove commas to standardize number formatting 
    calculator.currentOperand = calculator.currentOperand.replaceAll(',', '');

    // Process the action based on the key type
    switch (keyType) {
        case 'key-digit':
            // Reset operand if it follows a space and already holds a value
            if (/\s$/g.test(expressionDisplay.value) && calculator.currentOperand.length !== 0) {
                // Clear stored value to avoid joining with next digit
                calculator.currentOperand = '';
            }

            // If display shows only zero, overwrite it with new input
            if (expressionDisplay.value === '0') {
                // Replace the zero with the clicked digit
                displayText = keyAction
                expressionDisplay.value = displayText;

                // Reset tracked value to avoid leading zeros
                calculator.currentOperand = keyAction;
            }

            // Otherwise append digit
            else {
                // Determine digit limit based on number format (integer or decimal)
                const digitLimit = getDigitLimit(calculator.currentOperand);

                // Retrieve digit count from current operand
                const digitCount = getDigitCount(calculator.currentOperand);

                // Only append digit if under configured limit
                if (digitCount < digitLimit) {
                    // Check if the last character is a closing parenthesis
                    if (displayText.at(-1) === '\u0029') {
                        // Append the padded multiplication operator
                        insertMultiplication();
                    }

                    // Prevent leading zeros when entering a number
                    if (calculator.currentOperand === '0') {
                        // Reset operand to allow proper number input
                        calculator.currentOperand = '';
                    }

                    // Append digit to tracked value
                    calculator.currentOperand += keyAction;

                    // Convert current operand to a numeric value
                    const currentOperand = parseFloat(calculator.currentOperand);

                    // Log parsed operand for debugging
                    console.log('Current Operand (Numeric):', currentOperand)

                    // Allow input if value stays within floating point precision
                    if (currentOperand >= -Number.MAX_VALUE && currentOperand <= Number.MAX_VALUE) {
                        // Append digit to display if value is within valid range
                        expressionDisplay.value += keyAction;
                    }

                    // Otherwise operand exceeds valid numeric range
                    else {
                        // Reset operand if value exceeds allowable numeric range
                        setCurrentOperand (expressionDisplay.value);

                        // Log updated operand after reset
                        console.log('Current Operand (Above):', calculator.currentOperand);

                        // Exit early to prevent further processing
                        return;
                    }


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
                if (calculator.operationsQueue.length !== 0) {
                    // Clear operator queue
                    calculator.operationsQueue = [];
                }
            }

            // Otherwise, on delete press
            else {  
                // Decrement opening count when deleting an opening parenthesis
                if (/\($/g.test(displayText)) {
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

                // Remove the last character if display is not zero  
                if (expressionDisplay.value !== '0') { 
                    // Remove all whitespace characters
                    displayText = displayText.replaceAll(/\s/g, '');
                    // console.log(displayText);

                    // Check if the last character is an operator
                    if (/(?:[+−÷×^E]|(?:log|ln|√)\()$/gi.test(displayText)) {
                        // Extract the last operator from the expression 
                        const previousOperator = displayText.match(/(?:[+−÷×^E]|(?:log|ln|√)\()$/gi)[0].replace('(', '');

                        console.log('Previous Operator:', previousOperator);

                        // Get the index of the last matching operator in the queue    
                        const operatorIndex = calculator.operationsQueue.findLastIndex(findOperatorIndex, previousOperator);

                        // Log queue before dequeueing operator
                        console.log('Queue (Before):');
                        // Log current queue state of operators
                        console.table(calculator.operationsQueue);

                        // Dequeue the last matching operator
                        calculator.operationsQueue.splice(operatorIndex, 1);

                        // Log queue after dequeueing operator
                        console.log('Queue (After):');
                        // Log current queue state of operators
                        console.table(calculator.operationsQueue);
                    }

                    // Increment opening count when deleting a closing parenthesis
                    else if (/\)$/g.test(displayText)) {
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

                    // Get expression with last input removed 
                    let updatedExpression = removeLastInput(expressionDisplay.value);

                    // Update display text; reset to '0' if expression is empty  
                    displayText = expressionDisplay.value = 
                        updatedExpression.length >= 1 ? updatedExpression : '0';

                    // Clean up the expression
                    updatedExpression = sanitizeExpression(updatedExpression);

                    // Get the last character to check if it's an operator 
                    const lastCharacter = updatedExpression.at(-1);

                    // Fix incomplete expressions and decimals 
                    if (/[+−÷×.]/.test(lastCharacter) && calculator.operationsQueue.length >= 1) {
                        // Append '1' for multiplicative operators and'0' for additive operators 
                        updatedExpression += /[÷×]/.test(lastCharacter) ? '1' : '0';
                    }

                    // Set current operand to last number in display  
                    setCurrentOperand(updatedExpression);

                    // Log updated current operand value
                    console.log('Current Operand (Delete):', calculator.currentOperand); 
            
                    // Update only if the expression isn't '0' and isn't already complete 
                    if (expressionDisplay.value !== '0' && /[^)]/.test(lastCharacter)) {                         
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
                // Check if current operand is a valid finite number
                const isValidNumber = Number.isFinite(parseFloat(calculator.currentOperand));

                // Check if expression ends with a number or closing parenthesis
                const isValidEnd = endsWithValidToken(expressionDisplay.value);

                // Retrieve operator's inherent precedence level
                const baseRank = calculator.operators[keyId].rank;

                // Compute rank according to nesting depth
                const operatorRank = calculateOperatorRank(baseRank);

                // Check if calculator can begin a negative number entry in current context
                const canStartNegative = 
                    /[÷×^E]|\(/.test(previousOperator) || 
                    calculator.currentOperand === '0';

                // Enable negative number entry 
                if ((canStartNegative) && keyId === 'key-subtract') {
                    // If display shows only a zero 
                    if (expressionDisplay.value === '0') {
                        // Replace '0' with negative sign
                        expressionDisplay.value = '\u002D';
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
                    console.table(calculator.operationsQueue);

                    // Regex to match and replace the previous operator
                    const operatorRegex = new RegExp(`\\s?\\${previousOperator}\\s?$`);
                            
                    // Retrieve operator symbol for pressed key
                    const keySymbol = calculator.operators[keyId].symbol;

                    // Get formatted operator  
                    const operator = formatOperator(keySymbol);

                    // Replace the old operator with the new one in the display
                    const updatedExpression = expressionDisplay.value.replace(operatorRegex, operator);
                
                    // Update operator queue and display
                    expressionDisplay.value = updatedExpression;

                    // Get the index of the last matching operator in the queue    
                    const operatorIndex = calculator.operationsQueue.findLastIndex(findOperatorIndex, previousOperator);

                    // Dequeue the last matching operator
                    const operatorEntry = calculator.operationsQueue[operatorIndex];

                    // Update operator queue entry with new operator details
                    [operatorEntry[0], operatorEntry[1], operatorEntry[2]] = [keyId, keySymbol, operatorRank];
                
                    // Display updated operation queue for debugging
                    console.log('Updated Queue:');
                    console.table(calculator.operationsQueue);
                }

                // Add operator if we have a valid number and proper expression ending
                else if (calculator.currentOperand.length !== 0 && isValidNumber && isValidEnd) {
                    // Prevents adding a second 'E' after a valid exponent part
                    if (keyId === 'key-exponent'  && /\E\-?\d+\%?$/g.test(expressionDisplay.value)) {
                        // Block extra exponent if expression already ends with one
                        return;
                    }

                    // Otherwise, append operator and enqueue it for evaluation
                    else {
                        // Retrieve operator symbol for pressed key
                        const keySymbol = calculator.operators[keyId].symbol;
    
                        // Get formatted operator  
                        const operator = formatOperator(keySymbol);
    
                        // Append operator to display
                        expressionDisplay.value += operator;
    
                        // Add the operator and action to the queue
                        calculator.operationsQueue.push([keyId, keySymbol, operatorRank]);

                        // If exponent key was pressed
                        if (keyId === 'key-exponent') {
                            // Add exponent to current operand
                            calculator.currentOperand += operator;    
                        }
                        
                        // If any other operator was pressed
                        else {
                            // Reset operand after non-exponent operator
                            calculator.currentOperand = '';
                        }
    
                    }
                }
            }

            // Handle parentheses key press logic
            else if (keyId === 'key-parentheses') {                
                // Destructure parentheses from action tuple
                const [openingParenthesis, closingParenthesis] = keyAction;

                // Check if parenthesis follows an operator or function
                if (/(?:[+−÷×^(]|log|ln|√)$/g.test(displayText) || expressionDisplay.value === '0') {
                    // Add opening parenthesis in appropriate context
                    addOpeningParenthesis(openingParenthesis, depthTracker);
                }
            
                // Check if we can close an existing group of parentheses
                else if (calculator.depthTracker.openingCount > 0) {
                    // Add closing parenthesis only when there are open parentheses to match
                    addClosingParenthesis(closingParenthesis, depthTracker);
                }

                // Implicit multiplication case
                else if (/\d+$|\)$/.test(expressionDisplay.value)) {
                    // Append the padded multiplication operator
                    insertMultiplication();

                    // Simulate a click on the parentheses button
                    parenthesesKey.click()
                }
            }

            // Handle percent key logic
            else if (keyId === 'key-percent') {
                // Prevent duplicate percentage symbols and append only after a number  
                if (!calculator.currentOperand.includes(keyAction) && /\d+$/g.test(expressionDisplay.value)) {
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
                // Add decimal point if absent or not before scientific notation
                if (calculator.currentOperand.includes('.') === false && /\E(?!\-?\d+\%?)$/g.test(expressionDisplay.value)) {
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

                console.log('Current Operand (Decimal):', calculator.currentOperand);
            }

            // On equals press
            else { 
                // Get the current expression from the display
                const finalExpression = sanitizeExpression(expressionDisplay.value);

                // Convert the displayed result to a number for validation  
                const numericResult = parseFloat(resultDisplay.value.replaceAll(',', ''));

                // Retrieve the validation outcome from the calculator 
                const validationData = calculator.validationData;

                // Process only if there's an equation to evaluate
                if (finalExpression !== calculator.currentOperand) {
                    // Process expression only if valid results exist (non-empty and numeric)
                    if (validationData.isValid && !isNaN(numericResult) && resultDisplay.value.length > 0) {
                        // Clear console
                        console.clear();

                        // Store calculation state for history tracking
                        const calculationState = {
                            inputExpression: expressionDisplay.value,
                            computedResult: resultDisplay.value,
                            operationsQueue: calculator.operationsQueue.slice(), 
                        };

                        // Add current calculation to history sidebar
                        saveHistory(calculationState.inputExpression, resultDisplay.value);

                        // Add current calculation to history array
                        calculator.calculationHistory.push(calculationState);

                        // Check if this is the first history entry being added
                        if (calculator.calculationHistory.length === 1) {
                            // Show clear button only after first history entry is saved
                            clearHistoryButton.classList.add('active-btn');
                        }


                        // Log history data for debugging
                        console.log('Calculation History:');
                        console.table(calculator.calculationHistory);

                        // Display each saved calculation for debugging
                        calculator.calculationHistory.forEach((historyEntry) => {
                            // Log the stored expression
                            console.log('Input Expression:', historyEntry.inputExpression);
                            
                            // Log the associated operation queue
                            console.log('Operations Queue:');
                            console.table(historyEntry.operationsQueue);
                            
                            // Add separator for readability
                            console.log('\n');
                        });

                        // Compute new result and update display
                        processResult(expressionDisplay, finalExpression);
        
                        // Update the current operand to the computed result
                        calculator.currentOperand = resultDisplay.value;        

                        // Reset results display
                        resultDisplay.value = '';
        
                        // Reset operator queue after final calculation
                        calculator.operationsQueue = [];
                    } 
    
                    
                    // Handle invalid expressions or calculation errors
                    else {
                        // Display error message when validation fails
                        resultDisplay.value = validationData.errorMessage;
    
                        // Apply error styling to the expression display
                        expressionDisplay.classList.add('error-state');
    
                        // Apply error styling to the result display
                        resultDisplay.classList.add('error-state');
    
                        // Animate the expression display with a shaking effect
                        shakeDisplay(expressionDisplay);
    
                        // Animate the result display with a shaking effect
                        shakeDisplay(resultDisplay);
                    }
                }
            }
            break;

        case 'math-function':
            // Block math functions after 'E' (exponent) to simplify parsing 
            if (/[^E]$/gi.test(expressionDisplay.value)) {
                // Retrieve mathematical function symbol (e.g., 'ln', 'log', '√')
                const keySymbol = calculator.mathFunctions[keyId].symbol;
    
                // Get function's inherent precedence level before nesting adjustment
                const baseRank = calculator.mathFunctions[keyId].rank;
    
                // Compute function's effective precedence based on parentheses depth
                const operatorRank = calculateOperatorRank(baseRank);
    
                // Log base precedence for debugging
                console.log('Base Rank:', baseRank);
    
                // Log adjusted precedence for debugging
                console.log('Operator Rank:', operatorRank);
    
                // Remove spaces and formatting for clean evaluation  
                const sanitizedInput = sanitizeExpression(expressionDisplay.value);  
    
                // Add implicit multiplication before a function if needed  
                if (/[^+−÷×^.(](?<!^0)$/gi.test(sanitizedInput)) { 
                    // Simulate a multiplication key press  
                    insertMultiplication(); 
                }
    
                // Replace zero or append function symbol to display
                expressionDisplay.value = expressionDisplay.value === '0' 
                    ? keySymbol
                    : expressionDisplay.value + keySymbol;
    
                // Simulate a click on the parentheses button
                parenthesesKey.click();
    
                // Enqueue function with its symbol and precedence for later evaluation
                calculator.operationsQueue.push([keyId, keySymbol, operatorRank]); 
            }

            break;

        default:
            break;
    }

    // Skip validation on equals/AC press to prevent redundant checks
    if (keyId !== 'key-equals' && keyType !== 'key-AC') {
        // Preprocess expression for evaluation and validation
        const updatedExpression = processExpression(expressionDisplay.value);

        // Retrieve the validation outcome from the calculator
        const validationData = calculator.validationData;

        // Revalidate in case the result has since changed
        if (validationData.isValid) {
            // Validate expression for calculation errors
            validateExpression(updatedExpression);   
        }
    }
}

// Initialize event listener for key actions  
handleKeyActions();  

// Initialize event listener for keyboard input  
handleKeyboardInput(); 

// Initialize event listener for theme switch 
handleThemeSwitch(); 

// Initialize event listener for sidebars
handleSidebar(); 