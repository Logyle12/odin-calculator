// Retrieve display value
const displayValue = document.querySelector('#display-value-text');

// Retrieve all key elements
const keyButtons = document.querySelectorAll('.key');

// Global variables
let currentValue = '';

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

    // Copy of display content for manipulation
    let displayText = displayValue.textContent;

    // Process the action based on the key type
    switch (keyType) {
        case 'key-digit':
            // If display shows only zero, overwrite it with new input
            if (displayValue.textContent === '0') {
                // Replace the zero with the clicked digit
                displayValue.textContent = keyAction;
                // Reset tracked value to avoid leading zeros
                currentValue = keyAction;
            }

            // Otherwise append digit if under max length
            else {
                if (currentValue.length < 15) {
                    // Append digit to tracked value
                    currentValue += keyAction;
                    // Parse and format number with UK locale separators
                    const formattedNumber = parseInt(currentValue, 10).toLocaleString('en-GB');
                    // Update display with formatted number
                    displayValue.textContent = formattedNumber;
                }
            }
            
            break;
    
        case 'key-control':
            break;
            
        case 'key-operator':
            // Append operator if value exists
            if (currentValue.length !== 0) {
                // Add padding around operator
                const operator = keyAction.padStart(2).padEnd(3);
                // Append operator to display
                displayValue.textContent += operator;
            }
            break;
        
        default:
            break;
    }
}

handleKeyActions();