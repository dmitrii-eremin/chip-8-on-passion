import { Passion } from "@dmitrii-eremin/passion-engine";
import { C8_MEMORY_SIZE, C8_SCREEN_HEIGHT, C8_SCREEN_WIDTH, C8_STACK_SIZE } from "./consts";
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

export class OpCode_3XNN implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const index = (opcode & 0xF00) >> 8;
        const value = opcode & 0xFF;
        if (state.register[index] === value) {
            state.programCounter += 2;
        }
        state.programCounter += 2;
    }
}

export class OpCode_4XNN implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const index = (opcode & 0xF00) >> 8;
        const value = opcode & 0xFF;
        if (state.register[index] !== value) {
            state.programCounter += 2;
        }
        state.programCounter += 2;
    }
}

export class OpCode_5XY0 implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const index1 = (opcode & 0xF00) >> 8;
        const index2 = (opcode & 0xF0) >> 4;
        if (state.register[index1] === state.register[index2]) {
            state.programCounter += 2;
        }
        state.programCounter += 2;
    }
}

export class OpCode_9XY0 implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const index1 = (opcode & 0xF00) >> 8;
        const index2 = (opcode & 0xF0) >> 4;
        if (state.register[index1] !== state.register[index2]) {
            state.programCounter += 2;
        }
        state.programCounter += 2;
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

export class OpCode_ANNN implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const value = opcode & 0xFFF;
        state.indexRegister = value;
        state.programCounter += 2;
    }
}

export class OpCode_BNNN implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const offset = opcode & 0xFFF;
        const regV = state.register[0] & 0xFF;
        state.programCounter = offset + regV;
    }
}

export class OpCode_CXNN implements OpCode {
    constructor(private passion: Passion) {

    }

    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const index = (opcode >> 8) & 0xF;
        const value = opcode & 0xFF;
        state.register[index] = (this.passion.math.rndi(0, 255) & value) & 0xFF;
        state.programCounter += 2;
    }
}

export class OpCode_DXYN implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;

        const originalX = state.register[(opcode >> 8) & 0xF];
        const originalY = state.register[(opcode >> 4) & 0xF];
        const height = opcode & 0xF;
        state.register[0xF] = 0;

        for (let row = 0; row < height; row++) {
            const spriteByte = state.memory[state.indexRegister + row];
            for (let col = 0; col < 8; col++) {
                const spritePixel = spriteByte & (0x80 >> col);
                if (spritePixel !== 0) {
                    const x = (originalX + col) % C8_SCREEN_WIDTH;
                    const y = (originalY + row) % C8_SCREEN_HEIGHT;

                    if (state.pixels[x][y]) {
                        state.register[0xF] = 1;
                    }

                    state.pixels[x][y] = !state.pixels[x][y];
                }
            }
        }

        state.programCounter += 2;
    }
}

export class OpCode_FX07 implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const index = (opcode >> 8) & 0xF;
        state.register[index] = state.delayTimer & 0xFF;
        state.programCounter += 2;
    }
}

export class OpCode_FX15 implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const index = (opcode >> 8) & 0xF;
        state.delayTimer = state.register[index];
        state.programCounter += 2;
    }
}

export class OpCode_FX18 implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const index = (opcode >> 8) & 0xF;
        state.soundTimer = state.register[index];
        state.programCounter += 2;
    }
}

export class OpCode_FX1E implements OpCode {
    execute(state: Chip8State): void {
        const opcode = getCurrentOpCodeValue(state)!;
        const index = (opcode >> 8) & 0xF;
        state.indexRegister += state.register[index];
        state.programCounter += 2;
    }
}

export const createOpCodeFromState = (state: Chip8State, passion: Passion): OpCode | undefined => {
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
    if ((opcode & 0xF000) === 0x3000) {
        return new OpCode_3XNN();
    }
    if ((opcode & 0xF000) === 0x4000) {
        return new OpCode_4XNN();
    }
    if ((opcode & 0xF000) === 0x5000) {
        return new OpCode_5XY0();
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
    if ((opcode & 0xF000) === 0x9000) {
        return new OpCode_9XY0();
    }
    if ((opcode & 0xF000) === 0xA000) {
        return new OpCode_ANNN();
    }
    if ((opcode & 0xF000) === 0xB000) {
        return new OpCode_BNNN();
    }
    if ((opcode & 0xF000) === 0xC000) {
        return new OpCode_CXNN(passion);
    }
    if ((opcode & 0xD000) === 0xD000) {
        return new OpCode_DXYN();
    }
    if ((opcode & 0xF0FF) === 0xF007) {
        return new OpCode_FX07();
    }
    if ((opcode & 0xF0FF) === 0xF015) {
        return new OpCode_FX15();
    }
    if ((opcode & 0xF0FF) === 0xF018) {
        return new OpCode_FX18();
    }
    if ((opcode & 0xF0FF) === 0xF01E) {
        return new OpCode_FX1E();
    }
}

