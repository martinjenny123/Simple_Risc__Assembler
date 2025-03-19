document.addEventListener("DOMContentLoaded", function () {
  const opcodes = {
    add: "00000",
    sub: "00001",
    mul: "00010",
    div: "00011",
    mod: "00100",
    cmp: "00101",
    and: "00110",
    or: "00111",
    not: "01000",
    mov: "01001",
    lsl: "01010",
    lsr: "01011",
    asr: "01100",
    nop: "01101",
    ld: "01110",
    st: "01111",
    beq: "10000",
    bgt: "10001",
    b: "10010",
    call: "10011",
    ret: "10100",
    hlt: "11111",
  };

  const registers = {
    r1: "0001",
    r2: "0010",
    r3: "0011",
    r4: "0100",
    r5: "0101",
    r6: "0110",
    r7: "0111",
    r8: "1000",
    r9: "1001",
    r10: "1010",
    r11: "1011",
    r12: "1100",
    r13: "1101",
    r14: "1110",
    r0: "0000",
  };

  const instrType = {
    nop: 0,
    ret: 0,
    hlt: 0,
    call: 1,
    b: 1,
    beq: 1,
    bgt: 1,
    add: 3,
    addh: 3,
    addu: 3,
    sub: 3,
    subh: 3,
    subu: 3,
    mul: 3,
    mulh: 3,
    mulu: 3,
    div: 3,
    divh: 3,
    divu: 3,
    mod: 3,
    modh: 3,
    modu: 3,
    or: 3,
    orh: 3,
    oru: 3,
    lsl: 3,
    lslh: 3,
    lslu: 3,
    lsr: 3,
    lsrh: 3,
    lsru: 3,
    asr: 3,
    asrh: 3,
    asru: 3,
    cmp: 2,
    not: 2,
    noth: 2,
    notu: 2,
    and: 3,
    andh: 3,
    andu: 3,
    mov: 2,
    movh: 2,
    movu: 2,
    ld: 4,
    st: 4,
  };

  // Global variables
  let label = {};
  let errorMessages = [];
  let machineCode = [];

  // UI Elements
  const assemblyInput = document.getElementById("assemblyInput");
  const binaryResult = document.getElementById("binaryResult");
  const hexResult = document.getElementById("hexResult");
  const errorMessagesDiv = document.getElementById("errorMessages");
  const assembleBtn = document.getElementById("assembleBtn");
  const downloadHexBtn = document.getElementById("downloadHexBtn");
  const loadExampleBtn = document.getElementById("loadExampleBtn");
  const loadFileBtn = document.getElementById("loadFileBtn");
  const fileInput = document.getElementById("fileInput");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const outputContents = document.querySelectorAll(".output-content");

  // Modified parser: trim leading/trailing whitespace to ignore tabs/spaces
  function parser(line) {
    line = line.trim();
    let t = "";
    for (let i = 0; i < line.length; i++) {
      if (line[i] === ",") {
        t += " ";
        continue;
      }
      if (line[i] === "/" || line[i] === ";") {
        break;
      }
      t += line[i];
    }
    return t;
  }

  // Extract numeric part from a string
  function extractNumeric(s) {
    let st = 0;
    while (st < s.length && !isDigit(s[st]) && s[st] !== "-") {
      st++;
    }
    return s.substring(st);
  }

  // Check if a character is a digit
  function isDigit(char) {
    return char >= "0" && char <= "9";
  }

  // Convert integer to binary string of specified width
  function intToBinary(num, n) {
    let ans = Array(n).fill("0");
    for (let i = n - 1; i >= 0; i--) {
      ans[i] = num % 2 === 1 ? "1" : "0";
      num = Math.floor(num / 2);
    }
    return ans.join("");
  }

  // Two's complement representation (27 bits)
  function twosComplement(num) {
    let bs = "";
    let isNegative = 0;
    if (num < 0) {
      num = -num;
      isNegative = 1;
    }
    while (num !== 0) {
      bs = (num % 2 === 0 ? "0" : "1") + bs;
      num = Math.floor(num / 2);
    }
    while (bs.length < 27) {
      bs = "0" + bs;
    }
    if (isNegative) {
      let bsArr = bs.split("");
      for (let i = 0; i < 27; i++) {
        bsArr[i] = bsArr[i] === "0" ? "1" : "0";
      }
      let carry = 1;
      for (let i = 26; i >= 0; i--) {
        let bit = bsArr[i] === "1" ? 1 : 0;
        bsArr[i] = ((bit + carry) % 2) + "";
        carry = Math.floor((bit + carry) / 2);
      }
      bs = bsArr.join("");
    }
    return bs;
  }

  // Convert hex string to integer
  function hexToInt(hexStr) {
    let result = 0;
    let base = 1;
    if (hexStr.substring(0, 2) === "0x" || hexStr.substring(0, 2) === "0X") {
      hexStr = hexStr.substring(2);
    }
    for (let i = hexStr.length - 1; i >= 0; i--) {
      let c = hexStr[i];
      let digit = 0;
      if (c >= "0" && c <= "9") {
        digit = c.charCodeAt(0) - "0".charCodeAt(0);
      } else if (c >= "A" && c <= "F") {
        digit = c.charCodeAt(0) - "A".charCodeAt(0) + 10;
      } else if (c >= "a" && c <= "f") {
        digit = c.charCodeAt(0) - "a".charCodeAt(0) + 10;
      }
      result += digit * base;
      base *= 16;
    }
    return result;
  }

  // Convert binary to hex string (8 characters)
  function binaryToHex(binaryStr) {
    let val = 0;
    let base = 1;
    for (let i = binaryStr.length - 1; i >= 0; i--) {
      if (binaryStr[i] === "1") {
        val += base;
      }
      base *= 2;
    }
    let hex = "";
    if (val === 0) {
      hex = "0";
    }
    while (val > 0) {
      const r = val % 16;
      if (r < 10) {
        hex = String.fromCharCode(r + "0".charCodeAt(0)) + hex;
      } else {
        hex = String.fromCharCode(r - 10 + "A".charCodeAt(0)) + hex;
      }
      val = Math.floor(val / 16);
    }
    while (hex.length < 8) {
      hex = "0" + hex;
    }
    return hex;
  }

// Main assembly function
function assembleCode() {
  clearOutput();

  const input = assemblyInput.value;
  const inputLines = input.split("\n").filter((line) => line.trim() !== "");
  const parsedLines = inputLines.map((line) => parser(line));

  // First pass: Identify labels
  for (let i = 0; i < parsedLines.length; i++) {
    // Note: We split and filter out tokens that are empty or contain ":"
    const tokens = parsedLines[i]
      .split(/\s+/)
      .filter((token) => token !== "" && token.indexOf(":") === -1);
    for (const token of tokens) {
      if (token.includes(":")) {
        if (token.endsWith(":")) {
          const labelName = token.substring(0, token.length - 1);
          label[labelName] = i + 1;
        }
      }
    }
  }

  // Second pass: Generate machine code
  for (let i = 0; i < parsedLines.length; i++) {
    // Filter out empty tokens to avoid processing comment-only lines
    const tokens = parsedLines[i]
      .split(/\s+/)
      .filter((token) => token !== "" && token.indexOf(":") === -1);
    if (tokens.length === 0) continue;

    let op = tokens[0].toLowerCase();
    let opp = opcodes[op];
    let type = instrType[op];
    let ans = "";

    // If instruction type is undefined, log "undefined" for every token on the line.
    if (type === undefined) {
      tokens.forEach(token => {
        logError(`undefined ${token}`);
      });
      continue;
    }

      // Type 0: No operands (nop, ret, hlt)
      if (type === 0) {
        ans += opp;
        while (ans.length < 32) ans += "0";
        machineCode.push(ans);
      }
      // Type 1: Branch instructions (call, b, beq, bgt)
      else if (type === 1) {
        if (tokens.length < 2) {
          tokens.forEach(token => {
            logError(`undefined ${token}`);
          });
          continue;
        }
        ans += opp;
        const op1 = tokens[1];
        let g = false;
        if (op1.startsWith("0") && (op1[1] === "x" || op1[1] === "X")) {
          label[op1] = hexToInt(op1);
          g = true;
        }
        let y = -i + (label[op1] || 0);
        let off = twosComplement(y);
        if (g) {
          off = twosComplement(label[op1]);
        }
        ans += off;
        machineCode.push(ans);
      }
      // Type 2: Two operands (cmp, not, mov)
      else if (type === 2) {
        if (tokens.length < 3) {
          tokens.forEach(token => {
            logError(`undefined ${token}`);
          });
          continue;
        }
        const op1 = tokens[1].toLowerCase();
        const op2 = tokens[2].toLowerCase();
        if (!registers[op1]) {
          logError(`undefined ${op1}`);
          continue;
        }
        // Register operand
        if (op2.startsWith("r")) {
          if (!registers[op2]) {
            logError(`undefined ${op2}`);
            continue;
          }
          ans += opp + "0" + registers[op1] + "0000" + registers[op2];
          while (ans.length < 32) ans += "0";
          machineCode.push(ans);
        }
        // Immediate operand
        else {
          let mod = "00";
          let opp2 = op;
          if (op.length === 4) {
            mod = op[3] === "u" ? "01" : "10";
            opp2 = op.substring(0, op.length - 1);
          }
          ans += opcodes[opp2] + "1" + registers[op1] + "0000";
          const numericStr = extractNumeric(op2);
          if (!numericStr) {
            logError(`undefined ${op2}`);
            continue;
          }
          const k = parseInt(numericStr, 0);
          const imm = intToBinary(k, 16);
          ans += mod + imm;
          machineCode.push(ans);
        }
      }
      // Type 3: Three operands (add, sub, mul, etc.)
      else if (type === 3) {
        if (tokens.length < 4) {
          tokens.forEach(token => {
            logError(`undefined ${token}`);
          });
          continue;
        }
        const op1 = tokens[1].toLowerCase();
        const op2 = tokens[2].toLowerCase();
        const op3 = tokens[3].toLowerCase();
        if (!registers[op1]) {
          logError(`undefined ${op1}`);
          continue;
        }
        if (!registers[op2]) {
          logError(`undefined ${op2}`);
          continue;
        }
        // Register operand
        if (op3.startsWith("r")) {
          if (!registers[op3]) {
            logError(`undefined ${op3}`);
            continue;
          }
          ans += opcodes[op] + "0" + registers[op1] + registers[op2] + registers[op3];
          while (ans.length < 32) ans += "0";
          machineCode.push(ans);
        }
        // Immediate operand
        else {
          let mod = "00";
          let opp2 = op;
          if (op.length === 4) {
            mod = op[3] === "u" ? "01" : "10";
            opp2 = op.substring(0, op.length - 1);
          }
          ans += opcodes[opp2] + "1" + registers[op1] + registers[op2];
          const numericStr = extractNumeric(op3);
          if (!numericStr) {
            logError(`undefined ${op3}`);
            continue;
          }
          const k = parseInt(numericStr, 0);
          const imm = intToBinary(k, 16);
          ans += mod + imm;
          machineCode.push(ans);
        }
      }
      // Type 4: Memory operations (ld, st)
      else if (type === 4) {
        if (tokens.length < 3) {
          tokens.forEach(token => {
            logError(`undefined ${token}`);
          });
          continue;
        }
        const rd = tokens[1].toLowerCase();
        const imv = tokens[2];
        const lb = imv.indexOf("[");
        const rb = imv.indexOf("]");
        if (lb === -1 || rb === -1) {
          logError(`undefined ${imv}`);
          continue;
        }
        const imm = imv.substring(0, lb);
        const rs1 = imv.substring(lb + 1, rb).toLowerCase();
        if (!registers[rd] || !registers[rs1]) {
          logError(`undefined register in memory operand: ${parsedLines[i]}`);
          continue;
        }
        const num = extractNumeric(imm);
        if (!num && num !== "0") {
          logError(`undefined ${imm}`);
          continue;
        }
        const immv = parseInt(num, 0);
        const imb = intToBinary(immv, 4);
        const roi = "1";
        ans = opp + roi + registers[rd] + registers[rs1];
        let x = 14;
        while (x--) ans += "0";
        ans += imb;
        machineCode.push(ans);
      }
    }

    // Update UI with results
    updateResults();
  }

  // Update results to the UI
  function updateResults() {
    if (errorMessages.length === 0) {
      logMessage("Assembly completed successfully!", "success");
    }
    if (machineCode.length > 0) {
      binaryResult.textContent = machineCode.join("\n");
      const hexOutput = machineCode.map(binaryToHex);
      hexResult.textContent = hexOutput.join("\n");
      downloadHexBtn.disabled = false;
    } else {
      binaryResult.textContent = "No machine code generated.";
      hexResult.textContent = "No machine code generated.";
      downloadHexBtn.disabled = true;
    }
  }

  // Reset outputs
  function clearOutput() {
    errorMessages = [];
    machineCode = [];
    label = {};
    errorMessagesDiv.innerHTML = "";
    binaryResult.textContent = "";
    hexResult.textContent = "";
    downloadHexBtn.disabled = true;
  }

  // Log a message to the UI
  function logMessage(message, type = "error") {
    const msgElement = document.createElement("div");
    msgElement.classList.add(type);
    msgElement.textContent = message;
    errorMessagesDiv.appendChild(msgElement);
  }

  // Log error: push to errorMessages, output to console, and display in Messages box.
  function logError(msg) {
    errorMessages.push(msg);
    console.log(msg);
    logMessage(msg, "error");
  }

  // Download hex file function
  function downloadHexFile() {
    if (machineCode.length === 0) return;
    const hexContent = machineCode.map(binaryToHex).join("\n");
    const blob = new Blob([hexContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hexfile.hex";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    logMessage("Downloaded hexfile.hex", "success");
  }

  // Load example code into assembly input
  function loadExample() {
    assemblyInput.value = `; SimpleRISC Assembly Example
; Basic program demonstrating different instruction types

start:
    mov r1, 10      ; Load 10 into r1
    mov r2, 20      ; Load 20 into r2
    add r3, r1, r2  ; r3 = r1 + r2 = 30
    sub r4, r3, r1  ; r4 = r3 - r1 = 20
    
    ; Memory operations
    st r3, 0[r0]    ; Store r3 value at address 0
    ld r5, 0[r0]    ; Load value from address 0 into r5
    
    ; Branching
    cmp r1, r2      ; Compare r1 and r2
    bgt greater     ; Branch if r1 > r2
    b end           ; Unconditional branch to end
    
greater:
    mov r6, 1       ; This won't execute (r1 is not > r2)
    
end:
    mov r7, 255     ; End marker
    hlt             ; Halt execution`;
    logMessage("Example code loaded.", "success");
  }

  // Load file content into assembly input
  function loadFileContent(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      assemblyInput.value = e.target.result;
      logMessage(`File "${file.name}" loaded.`, "success");
    };
    reader.readAsText(file);
  }

  // Initialize reference tables in the UI
  function initReferenceTables() {
    const opcodeTable = document.getElementById("opcodeTable");
    opcodeTable.innerHTML = `
      <tr>
        <th>Instruction</th>
        <th>Opcode (Binary)</th>
      </tr>
    `;
    for (const [instr, code] of Object.entries(opcodes)) {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${instr}</td><td>${code}</td>`;
      opcodeTable.appendChild(row);
    }
    const registerTable = document.getElementById("registerTable");
    registerTable.innerHTML = `
      <tr>
        <th>Register</th>
        <th>Binary Code</th>
      </tr>
    `;
    for (const [reg, code] of Object.entries(registers)) {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${reg}</td><td>${code}</td>`;
      registerTable.appendChild(row);
    }
    const instructionTypeTable = document.getElementById("instructionTypeTable");
    instructionTypeTable.innerHTML = `
      <tr>
        <th>Type</th>
        <th>Description</th>
        <th>Examples</th>
      </tr>
      <tr>
        <td>Type 0</td>
        <td>No operands</td>
        <td>nop, ret, hlt</td>
      </tr>
      <tr>
        <td>Type 1</td>
        <td>Branch instructions</td>
        <td>call, b, beq, bgt</td>
      </tr>
      <tr>
        <td>Type 2</td>
        <td>Two operands</td>
        <td>cmp, not, mov</td>
      </tr>
      <tr>
        <td>Type 3</td>
        <td>Three operands</td>
        <td>add, sub, mul, div</td>
      </tr>
      <tr>
        <td>Type 4</td>
        <td>Memory operations</td>
        <td>ld, st</td>
      </tr>
    `;
  }

  // Set up event listeners
  assembleBtn.addEventListener("click", assembleCode);
  downloadHexBtn.addEventListener("click", downloadHexFile);
  loadExampleBtn.addEventListener("click", loadExample);
  loadFileBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", loadFileContent);
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab");
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      outputContents.forEach((content) => content.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(tabId).classList.add("active");
    });
  });
  
  initReferenceTables();
});
