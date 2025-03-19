# SimpleRISC Assembler

This project is a web-based assembler for the SimpleRISC architecture. It provides an interactive interface to write assembly code, convert it into machine code (binary and hexadecimal), and download the assembled code.

## Features
- **Assembly Code Editor**: Write and edit SimpleRISC assembly code in a user-friendly interface.
- **Assembler**: Converts assembly instructions into machine code.
- **Error Handling**: Displays syntax and semantic errors.
- **Download HEX**: Download the assembled hex file for use in simulators or hardware.
- **Reference Tables**: Built-in opcode, register, and instruction reference tables.
- **Example Loader**: Load a sample assembly program to get started quickly.

## Live Demo
You can access the SimpleRISC Assembler online at:
[SimpleRISC Assembler](https://smitbhatt79.github.io/SimpleRISC_Assembler/)

## File Structure
- `index.html` - Main HTML structure of the assembler.
- `style.css` - Styling for the web interface.
- `assembler.js` - Core logic for parsing and assembling SimpleRISC code.

## Usage
1. Open the website: [SimpleRISC Assembler](https://smitbhatt79.github.io/SimpleRISC_Assembler/)
2. Enter assembly code in the text area.
3. Click **Assemble Code** to convert it into binary and hexadecimal.
4. Download the HEX file for further use.

## Supported Instructions
This assembler supports various instructions including:
- Arithmetic: `add`, `sub`, `mul`, `div`, `mod`
- Logical: `and`, `or`, `not`, `cmp`
- Shift: `lsl`, `lsr`, `asr`
- Load/Store: `ld`, `st`
- Branching: `b`, `beq`, `bgt`, `call`, `ret`
- Other: `nop`, `hlt`

## Requirements
- A modern web browser (Chrome, Firefox, Edge, etc.)
- No additional software required (fully client-side)

## License
This project is open-source. You are free to use, modify, and distribute it under the MIT License.

## Author
Developed by:
- Martin Daya Sagar: 2301EC14
- Nishant Rajput: 2301EC17
- Smit Bhatt: 2301EC29

