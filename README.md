# Calculator

A versatile, responsive calculator built for desktop and mobile devices. It supports standard arithmetic, scientific functions, keyboard shortcuts, and a dynamic display of expression history — all within a clean, theme-switchable interface.

## Features

### Core Functionality
- **Arithmetic Operations**: Perform addition, subtraction, multiplication, division, and percentage calculations.
- **Scientific Functions**: Includes exponentiation (`x^y`), exponential notation (`exp`), natural logarithm (`ln`), log base 10 (`log`), and square root.
- **Keyboard Input**: Interact via mouse or keyboard with a mapped shortcut layout for efficient entry.
- **Expression and Result Display**: Inputs and results are displayed in real time with support for scientific notation, including negative exponents.
- **History Tracking**: View a scrollable list of past calculations with the ability to clear history.

### UI and Design
- **Responsive Layout**: Fully optimized for both desktop and mobile interfaces, including layout reflows and mobile sidebar views.
- **Theme Switching**: Toggle between three distinct visual themes (Default, Light, and Dark) to suit your environment and preferences.
- **Touch-Friendly Controls**: Designed with scalable buttons and mobile usability in mind.

## Installation

To run the calculator locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/Logyle12/odin-calculator/.git
   ```
2. Navigate to the project directory:
   ```bash
   cd calculator-app
   ```
3. Open `index.html` in your preferred browser.

No build tools or dependencies required.

## Usage

1. Use the on-screen keypad or your physical keyboard to enter expressions.
2. Click or press `=` / `Enter` to evaluate.
3. Switch between `Keyboard` and `History` views using the toggle buttons.
4. Use the theme switcher to change appearance.
5. Access scientific functions through the dedicated column.
6. View past calculations and clear them when needed.

### Keyboard Shortcuts

| Key         | Function             |
|-------------|----------------------|
| 0–9         | Digits               |
| `+`, `-`    | Add, Subtract        |
| `*`, `/`    | Multiply, Divide     |
| `^`         | Power                |
| `E`         | Exponential Notation |
| `L`         | Natural Log          |
| `G`         | Log Base 10          |
| `R`         | Square Root          |
| `.`         | Decimal Point        |
| `A` or `Esc`| Clear (AC)           |
| `Backspace` | Delete last entry    |
| `Enter`     | Calculate result     |

## Live Preview

[Click Here to Try The Calculator](https://logyle12.github.io/odin-calculator/)

## File Structure
```
|-- assets
|   |-- icons
|       |-- [icon files]
|-- scripts
|   |-- index.js
|-- styles
|   |-- styles.css
|   |-- themes.css
|-- index.html
|-- README.md
```
- **assets/icons/**: Visual assets for buttons and toggles.
- **scripts/index.js**: Main JavaScript logic for evaluation and UI interaction.
- **styles/styles.css**: Layout, responsive styles, and display logic.
- **styles/themes.css**: Theming support for light, dark, and default styles.
- **index.html**: Main application markup.

## License

This project is licensed under the MIT License.