import { PuzzleValidationState } from '../types';

/* Original Command from Manual: INITIATE_HANDSHAKE */
function validatePuzzle1(input: string, originalCommand: string): boolean | string {
    // Expected: Just the Unicode escape sequence string
    const expectedInput = "\\u{1F91D}";
    const cleanedInput = input.trim(); // Trim whitespace

    if (cleanedInput.toLowerCase() === "initiate_handshake") {
        return "Eh? Why so formal? Needs the digital sign-off! \u{1F91D}";
    }
    
    if (cleanedInput === "🤝") { // Check if they used the actual emoji character
        return "Hey, so I couldn't map that symbol to what I have... could you, idk, make it legible for me? Use the code.";
    }

    // Check for exact match with the Unicode escape sequence
    return cleanedInput === expectedInput;
}


/* CALIBRATE_SYSTEM */
function validatePuzzle2(input: string, originalCommand: string): boolean {
    const expectedLeetspeak = "c4l1br4t3_syst3m";
    return input.toLowerCase() === expectedLeetspeak;
}

/*  PURGE */
function validatePuzzle3(input: string, originalCommand: string): boolean {
    const expected = originalCommand.toUpperCase().split('').map(char => char.charCodeAt(0)).join(' ');
    const actual = input.trim().replace(/\s+/g, ' '); 
    return actual === expected;
}

/* VERIFY_LOG_INTEGRATE */
function validatePuzzle4(input: string, originalCommand: string, gameState: PuzzleValidationState): boolean {
    // This logic now correctly compares the player's raw input against the history
    // of their actual successful inputs, as requested.
    const expectedHistory = gameState.commandHistory.join(' ');
    return input.trim() === expectedHistory;
}

/*  VENT_PLASMA */
async function validatePuzzle5(input: string, originalCommand: string): Promise<boolean> {
    return input.trim().toUpperCase() === originalCommand.toUpperCase();
}

/* AUTHORIZE_ADMIN_OVERRIDE */
function validatePuzzle6(input: string, originalCommand: string): boolean {
    return input.trim() === originalCommand;
}

/*  SET_TERMINAL_ANCHORS */
function validatePuzzle7(input: string, originalCommand: string): boolean {
    return input.trim().toLowerCase() === "set_terminal_anchors";
}

/*  RUN_POWER_DIAGNOSTIC */
function validatePuzzle8(input: string, originalCommand: string, gameState: PuzzleValidationState): boolean | string {
    const commandPart = "RUN_POWER_DIAGNOSTIC";
    const inputTrimmed = input.trim();
    const commandPartLower = commandPart.toLowerCase();
  
    // Check if input starts correctly and has a number part
    if (!inputTrimmed.toLowerCase().startsWith(commandPartLower + " ") || inputTrimmed.length <= commandPart.length + 1) {
      console.log("[DEBUG P8] FAIL: Invalid format.");
      return "...Invalid format. Command should be 'RUN_POWER_DIAGNOSTIC <checksum>'.";
    }
  
    // Extract the number provided by the player
    const parts = inputTrimmed.split(' ');
    const playerChecksumStr = parts[parts.length - 1];
    const playerChecksum = parseInt(playerChecksumStr, 10);
  
    if (isNaN(playerChecksum)) {
      console.log("[DEBUG P8] FAIL: Checksum is not a number.");
      return "...Checksum must be a number.";
    }
  
    // Calculate the TRUE checksum from command history
    // Ensure history has enough entries (Puzzles 1, 5 correspond to indices 0, 4)
    if (gameState.commandHistory.length < 5) {
      const errorMsg = "...Error: Insufficient command history for checksum calculation!";
      console.error("[DEBUG P8] FAIL: " + errorMsg);
      return errorMsg; // Should not happen in normal gameplay
    }
  
    try {
      const KERNEL_PANIC_CODE = 42; // From system_status.log
      const length1 = gameState.commandHistory[0].length; // Input for Puzzle 1
      const length5 = gameState.commandHistory[4].length; // Input for Puzzle 5
      const trueChecksum = length1 + length5 + KERNEL_PANIC_CODE;
  
      console.log(`[DEBUG P8] Lengths: P1=${length1}, P5=${length5}. Kernel Code: ${KERNEL_PANIC_CODE}. True Checksum: ${trueChecksum}`);
      console.log(`[DEBUG P8] Player Checksum: ${playerChecksum}`);
  
      if (playerChecksum === trueChecksum) {
        console.log("[DEBUG P8] SUCCESS: Checksum matches.");
        return true;
      } else {
        console.log("[DEBUG P8] FAIL: Checksum mismatch.");
        return `...DIAGNOSTIC FAILED. Checksum mismatch. Expected sum: ${trueChecksum}. You provided: ${playerChecksum}. ಠ_ಠ`;
      }
    } catch (error) {
      const errorMsg = "...Error calculating checksum from history!";
      console.error("[DEBUG P8] Error accessing command history:", error);
      return errorMsg;
    }
}

/* LAUNCH_PAYLOAD */
function validatePuzzle9(input: string, originalCommand: string, gameState: PuzzleValidationState): boolean {
    if (!gameState.selectedMeme) {
        return false; // Should not happen!!!!!!!!!!!!!!!!
    }
    const expected = `${originalCommand} ${gameState.selectedMeme}`;
    return input.trim() === expected;
}


// Main validation router
export async function validateCommand(
    puzzleId: number,
    input: string,
    command: string,
    gameState: PuzzleValidationState
): Promise<boolean | string> {
    switch (puzzleId) {
        case 1:
            return validatePuzzle1(input, command);
        case 2:
            return validatePuzzle2(input, command);
        case 3:
            return validatePuzzle3(input, command);
        case 4:
            return validatePuzzle4(input, command, gameState);
        case 5:
            return await validatePuzzle5(input, command);
        case 6:
            return validatePuzzle6(input, command);
        case 7:
            return validatePuzzle7(input, command);
        case 8:
            return validatePuzzle8(input, command, gameState);
        case 9:
            return validatePuzzle9(input, command, gameState);
        default:
            return false;
    }
}