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
            // Get key action
            const keyAction = key.firstElementChild.textContent;
            
            // Update display with key action
            updateDisplayValue(keyAction);

            // Log action
            console.log(keyAction);
        }
    });
}

// Update display with pressed key
function updateDisplayValue(keyAction) {
    // Append key value to display
    displayValue.textContent += keyAction;
}