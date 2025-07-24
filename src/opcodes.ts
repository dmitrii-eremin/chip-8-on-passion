import { C8_MEMORY_SIZE, C8_STACK_SIZE } from "./consts";
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

export class OpCode_00E0 implements OpCode {
    execute(state: Chip8State): void {
        this.clearScreen(state);
        state.programCounter += 2;
    }

    private clearScreen(state: Chip8State) {
        state.pixels = state.pixels.map(row => row.map(_ => false));
    }
}

export class OpCode_1NNN implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const addr = opcode & 0xFFF;
        state.programCounter = addr;
    }
}

export class OpCode_00EE implements OpCode {
    execute(state: Chip8State): void {
        if (state.stack.length === 0) {
            console.error(`Stack is EMPTY`);
            return;
        }
        const addr = state.stack.pop()! & 0xFFF;
        state.programCounter = addr + 2;
    }
}

export class OpCode_2NNN implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const addr = opcode & 0xFFF;
        state.stack.push(state.programCounter & 0x0FFF);
        if (state.stack.length > C8_STACK_SIZE) {
            console.error(`Maximum stack size is exceeded: ${C8_STACK_SIZE}`);
            return;
        }
        state.programCounter = addr;
    }
}

export class OpCode_6XNN implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const index = (opcode & 0xF00) >> 8;
        const value = opcode & 0xFF;
        state.register[index] = value & 0xFF;
        state.programCounter += 2;
    }
}

export class OpCode_7XNN implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const index = (opcode & 0x0F00) >> 8;
        const value = opcode & 0x00FF;
        state.register[index] = (state.register[index] + value) & 0xFF;
        state.programCounter += 2;
    }
}

export class OpCode_8XY0 implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const target = (opcode >> 8) & 0xF;
        const source = (opcode >> 4) & 0xF;
        state.register[target] = state.register[source];
        state.programCounter += 2;
    }
}

export class OpCode_8XY1 implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const target = (opcode >> 8) & 0xF;
        const source = (opcode >> 4) & 0xF;
        state.register[target] = (state.register[target] | state.register[source]);
        state.programCounter += 2;
    }
}

export class OpCode_8XY2 implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const target = (opcode >> 8) & 0xF;
        const source = (opcode >> 4) & 0xF;
        state.register[target] = (state.register[target] & state.register[source]);
        state.programCounter += 2;
    }
}

export class OpCode_8XY3 implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const target = (opcode >> 8) & 0xF;
        const source = (opcode >> 4) & 0xF;
        state.register[target] = (state.register[target] ^ state.register[source]);
        state.programCounter += 2;
    }
}

export class OpCode_8XY4 implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const target = (opcode >> 8) & 0xF;
        const source = (opcode >> 4) & 0xF;
        state.register[target] += state.register[source];
        state.register[0xF] = state.register[target] > 0xF ? 1 : 0;
        state.register[target] = state.register[target] & 0xFF;
        state.programCounter += 2;
    }
}

export class OpCode_8XY5 implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const target = (opcode >> 8) & 0xF;
        const source = (opcode >> 4) & 0xF;
        state.register[target] -= state.register[source];
        state.register[0xF] = state.register[target] > 0xF ? 1 : 0;
        state.register[target] = state.register[target] & 0xFF;
        state.programCounter += 2;
    }
}

export class OpCode_8XY6 implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const target = (opcode >> 8) & 0xF;
        const bit = state.register[target] & 0x1;
        state.register[target] = state.register[target] >> 1;
        state.register[0xF] = bit !== 0 ? 1 : 0;
        state.programCounter += 2;
    }
}

export class OpCode_8XY7 implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const target = (opcode >> 8) & 0xF;
        const source = (opcode >> 4) & 0xF;
        state.register[target] = state.register[source] - state.register[target];
        state.register[0xF] = state.register[target] > 0xF ? 1 : 0;
        state.register[target] = state.register[target] & 0xFF;
        state.programCounter += 2;
    }
}

export class OpCode_8XYE implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const target = (opcode >> 8) & 0xF;
        const bit = state.register[target] & 0x80;
        state.register[target] = (state.register[target] << 1) & 0xFF;
        state.register[0xF] = bit !== 0 ? 1 : 0;
        state.programCounter += 2;
    }
}

export const createOpCodeFromState = (state: Chip8State): OpCode | undefined => {
    const opcode = getCurrentOpCodeValue(state);
    if (opcode === undefined) {
        return;
    }

    if (opcode === 0x00E0) {
        return new OpCode_00E0();
    }
    if (opcode === 0x00EE) {
        return new OpCode_00EE();
    }
    if ((opcode & 0xF000) === 0x1000) {
        return new OpCode_1NNN();
    }
    if ((opcode & 0xF000) === 0x2000) {
        return new OpCode_2NNN();
    }
    if ((opcode & 0xF000) === 0x6000) {
        return new OpCode_6XNN();
    }
    if ((opcode & 0xF000) === 0x7000) {
        return new OpCode_7XNN();
    }
    if ((opcode & 0xF00F) === 0x8000) {
        return new OpCode_8XY0();
    }
    if ((opcode & 0xF00F) === 0x8001) {
        return new OpCode_8XY1();
    }
    if ((opcode & 0xF00F) === 0x8002) {
        return new OpCode_8XY2();
    }
    if ((opcode & 0xF00F) === 0x8003) {
        return new OpCode_8XY3();
    }
    if ((opcode & 0xF00F) === 0x8004) {
        return new OpCode_8XY4();
    }
    if ((opcode & 0xF00F) === 0x8005) {
        return new OpCode_8XY5();
    }
    if ((opcode & 0xF00F) === 0x8006) {
        return new OpCode_8XY6();
    }
    if ((opcode & 0xF00F) === 0x8007) {
        return new OpCode_8XY7();
    }
    if ((opcode & 0xF00F) === 0x800E) {
        return new OpCode_8XYE();
    }
}
