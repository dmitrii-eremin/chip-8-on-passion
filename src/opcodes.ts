import { C8_MEMORY_SIZE } from "./consts";
import { Chip8State } from "./state";

const getCurrentOpCodeValue = (state: Chip8State): number | undefined => {
    if (state.programCounter < 0 || (state.programCounter + 1) >= C8_MEMORY_SIZE) {
        console.error(`Wrong program counter (PC): ${state.programCounter}. It is outside the memory bounds`);
        return undefined;
    }
    return (state.memory[state.programCounter] << 8) | (state.memory[state.programCounter + 1]);
};

export interface OpCode {
    execute(state: Chip8State): void;
}

export class ClearScreenOpcode implements OpCode {
    execute(state: Chip8State): void {
        this.clearScreen(state);
        state.programCounter += 2;
    }

    private clearScreen(state: Chip8State) {
        state.pixels = state.pixels.map(row => row.map(_ => false));
    }
}

export class JumpOpcode implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const addr = opcode & 0xFFF;
        state.programCounter = addr;
    }
}

export const createOpCodeFromState = (state: Chip8State): OpCode | undefined => {
    const opcode = getCurrentOpCodeValue(state);
    if (opcode === undefined) {
        return;
    }

    if (opcode === 0x00E0) {
        return new ClearScreenOpcode();
    }
    if (((opcode >> 12) & 0xF) === 1) {
        return new JumpOpcode();
    }
}
