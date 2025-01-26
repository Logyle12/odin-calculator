// Retrieve display value
const displayValue = document.querySelector('#display-value-text');

// Retrieve all key elements
const keyButtons = document.querySelectorAll('.key');

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

    // Process the action based on the key type
    switch (keyType) {
        case 'key-digit':
            // Append key value to display
            displayValue.textContent += keyAction;
            break;
    
        case 'key-control':
            break;
            
        case 'key-operator':
            break;
        
        default:
            break;
    }
}