// Retrieve display value
const displayValue = document.querySelector('#display-value-text');

// Retrieve all key elements
const keyButtons = document.querySelectorAll('.key');

// Global variables
let currentValue = displayValue.textContent;
let digitLimit = 15;

// Store pending operations awaiting calculation
const operatorQueue = [];

// Define operator precedence: multiply=4, divide=3, add=2, subtract=1
const operatorRank = {
   'key-multiply': 4,
   'key-divide': 3,
   'key-add': 2,
   'key-subtract': 1,
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

                    // Append
                    operatorQueue.push([keyId, keyAction]);
    
                    // Reset tracked value after operator added
                    currentValue = '';
                }
            }

            else {
                // Sort the operator queue based on operator precedence
                operatorQueue.sort(
                    (operatorA, operatorB) => operatorRank[operatorB[0]] - operatorRank[operatorA[0]]
                );
                

                // Log the sorted operator queue for debugging
                console.table(operatorQueue);
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