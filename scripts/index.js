// Retrieve display value
const displayValue = document.querySelector('#display-value-text');

// Retrieve all key elements
const keyButtons = document.querySelectorAll('.key');

// Extract actions from key elements
function getKeyActions() {
    // Iterate through each key button
    keyButtons.forEach((key) => {
        // Get key action
        const keyAction = key.firstElementChild.textContent;
        // Log action
        console.log(keyAction)
    });
}