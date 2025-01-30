// Retrieve display value
const displayValue = document.querySelector('#display-value-text');

// Retrieve all key elements
const keyButtons = document.querySelectorAll('.key');

// Global variables
let currentValue = displayValue.textContent;
let digitLimit = 15;

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
            }
            
            break;
    
        case 'key-control':
            // Check for 'key-AC' press
            if (keyId === 'key-AC') {
                // Reset display to zero
                displayValue.textContent = '0';
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
    
                    // Reset tracked value after operator added
                    currentValue = '';
                }
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