// Retrieve display value
const displayValue = document.querySelector('#display-value-text');

// Retrieve all key elements
const keyButtons = document.querySelectorAll('.key');

// Extract action for clicked key
function getKeyAction() {
    // Iterate through each key button
    keyButtons.forEach((key) => {
        // Add click event handler
        key.onclick = () => {
            // Get key action
            const keyAction = key.firstElementChild.textContent;
            
            // Log action
            console.log(keyAction);

            // Return the current key's action when clicked
            return keyAction;
        }
    });
}
