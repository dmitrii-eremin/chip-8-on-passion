import { Size } from "@dmitrii-eremin/passion-engine/engine-build/stdlib/size";
import { Chip8Screen } from "./screen";
import { OpCode } from "./types";
import { Passion } from "@dmitrii-eremin/passion-engine";
import { C8_DEFAULT_FONT, C8_FONT_START_ADDRESS, C8_MEMORY_SIZE, C8_PROGRAM_START_ADDRESS, C8_REGISTER_COUNT, C8_STACK_SIZE } from "./consts";
import { Chip8State } from "./state";
import { createOpCodeFromState } from "./opcodes";
import { mapPassionKeyToKeyCode, MAPPED_KEYS } from "./keys";

type ServiceInfoLayout = {
    x: number;
    y: number;
    w: number;
}

type ColumnIndex = 0 | 1 | 2;

export class Chip8Emu {
    private state: Chip8State = new Chip8State();

    private bytesFit: number = 0;
    private serviceInfoLayout?: ServiceInfoLayout;

    constructor(private passion: Passion, private screen: Chip8Screen) {
        this.reset();
    }

    reset() {
        this.state.reset();
        this.loadFont(C8_DEFAULT_FONT);
    }

    private loadFont(font: OpCode[]) {
        const startAddress = C8_FONT_START_ADDRESS;
        for (let i = 0; i < font.length; i++) {
            this.state.memory[startAddress + i] = font[i];
        }
    }

    load(program: OpCode[]) {
        const startAddress = C8_PROGRAM_START_ADDRESS;
        for (let i = 0; i < program.length; i++) {
            const instruction = program[i];
            this.state.memory[startAddress + i * 2] = (instruction >> 8) & 0xFF;
            this.state.memory[startAddress + i * 2 + 1] = instruction & 0xFF;
        }
    }

    update(dt: number) {
        this.updatePressedKeys();
    }

    executeCurrentCommand(screen: Chip8Screen) {
        this.state.delayTimer = Math.max(0, this.state.delayTimer - 1);
        this.state.soundTimer = Math.max(0, this.state.soundTimer - 1);

        if (this.state.delayTimer > 0) {
            return;
        }

        const executor = createOpCodeFromState(this.state, this.passion);
        if (executor) {
            executor.execute(this.state);
            screen.flip(this.state.pixels);
        }
        else {
            console.warn(`Unknown opcode at ${this.state.programCounter}, skip`);
            this.state.programCounter += 2;
        }
    }

    draw(ax: number, ay: number, aw: number, ah: number) {
        const headerOffset = this.drawHeader(ax, ay, aw, this.memoryOffset);
        this.bytesFit = this.drawByteArray(this.state.memory, ax, headerOffset, aw, ah / 2, this.memoryOffset, '00', [this.state.programCounter, this.state.programCounter + 1]);

        const memoryBlockBottom = headerOffset + Math.ceil(ah / 2);
        this.updateServiceInfoLayout(ax, memoryBlockBottom, aw);
        const serviceBlockBottom = this.drawServiceInfo(ax, memoryBlockBottom, aw);
        this.drawByteArray(this.state.stack, ax, serviceBlockBottom, aw, ah / 2, 0, '000');
    }

    private drawServiceInfo(ax: number, ay: number, aw: number): number {
        this.drawServiceNumber(0, 0, 'PC', this.state.programCounter);
        this.drawServiceNumber(0, 1, ' I', this.state.indexRegister);
        this.drawServiceNumber(0, 2, 'DT', this.state.delayTimer);
        this.drawServiceNumber(0, 3, 'ST', this.state.soundTimer);

        for (let i = 0; i < C8_REGISTER_COUNT / 2; i++) {
            this.drawServiceNumber(1, i, `V${i}`, this.state.register[i], 2);
            const j = Math.ceil(i + C8_REGISTER_COUNT / 2);
            this.drawServiceNumber(2, i, `V${j.toString(16).toUpperCase().padStart(1, '0')}`, this.state.register[j], 2);
        }

        const bottom = this.getServiceRowY(8);
        this.passion.graphics.line(ax, bottom, ax + aw, bottom, 15);
        return bottom;
    }

    private drawServiceNumber(column: ColumnIndex, row: number, name: string, value: number, pad: number = 4) {
        const titleText = `${name}: `;
        const titleSize = this.passion.graphics.textSize(titleText) ?? new Size( 0, 0);

        const x = this.getServiceColumnX(column);
        const y = this.getServiceRowY(row);

        this.passion.graphics.text(x, y, titleText, 6);
        this.passion.graphics.text(x + titleSize.width, y, `0x${value.toString(16).toUpperCase().padStart(pad, '0')}`, 15);
    }

    private get memoryOffset(): number {
        const delim = this.bytesFit > 0 ? this.bytesFit : 64;
        const offset = Math.floor(this.state.programCounter / delim) * delim;
        return offset; //Math.max(0x200, offset);
    }

    private drawHeader(ax: number, ay: number, aw: number, memoryOffset: number, header: string = '[PROGRAM]'): number {
        const offset = 5;

        const textToDraw = `${header} 0x${memoryOffset.toString(16).toUpperCase().padStart(4, '0')}`;

        const headerSize = this.passion.graphics.textSize(textToDraw);
        this.passion.graphics.text(ax + (aw - (headerSize?.width ?? 0)) / 2, ay + offset, textToDraw, 7);
        return ay + (headerSize?.height ?? 0) + 2 * offset;
    }

    private drawByteArray(data: number[], ax: number, ay: number, aw: number, ah: number, offset: number, example: string = '00', highlightIndex: number[] = []): number {
        const memoryByteSize = this.passion.graphics.textSize(example) ?? new Size(0, 0);
        const memoryByteOffset = new Size(4, 4);

        const memoryBytesPerLine = Math.floor((aw - memoryByteOffset.width) / (memoryByteSize.width + memoryByteOffset.width));
        const memoryByteMarginLeft = (aw - (memoryBytesPerLine * (memoryByteSize.width + memoryByteOffset.width) - memoryByteOffset.width)) / 2;

        let x = ax + memoryByteMarginLeft;
        let y = ay + memoryByteOffset.height;

        let bytesFit = 0;
        for (let i = offset; i < data.length; i++) {
            const color = highlightIndex.includes(i) ? 8 : 15;
            const memoryByte = data[i];
            this.passion.graphics.text(x, y, `${memoryByte.toString(16).toUpperCase().padStart(2, '0')}`, color);
            x += memoryByteSize.width + memoryByteOffset.width;
            bytesFit += 1;
            if (x + memoryByteSize.width + memoryByteOffset.width - ax > aw) {
                x = ax + memoryByteMarginLeft;
                y += memoryByteSize.height + memoryByteOffset.height;
                if (y + memoryByteSize.height + memoryByteOffset.height > ay + ah) {
                    break;
                }
            }
        }

        this.passion.graphics.line(ax, ay + ah, ax + aw, ay + ah, 15);

        return bytesFit;
    }

    private updateServiceInfoLayout(ax: number, ay: number, aw: number) {
        this.serviceInfoLayout = { x: ax, y: ay, w: aw };
    }

    private get exampleTextSize(): Size {
        return this.passion.graphics.textSize('PC: 0x0200') ?? new Size(0, 0);;   
    }

    private getServiceColumnX(col: ColumnIndex): number {
        if (!this.serviceInfoLayout) {
            return 0;
        }

        const exampleTextSize = this.passion.graphics.textSize('PC: 0x0200') ?? new Size(0, 0);
        const offset = 4;
        const columns: number[] = [
            this.serviceInfoLayout.x + offset,
            Math.floor(this.serviceInfoLayout.x + this.serviceInfoLayout.w / 2 - exampleTextSize.width / 2),
            this.serviceInfoLayout.x + this.serviceInfoLayout.w - offset - exampleTextSize.width
        ];
        return columns[col];
    }

    private getServiceRowY(row: number): number {
        if (!this.serviceInfoLayout) {
            return 0;
        }

        const offset = 2;
        const margin = 4;
        return this.serviceInfoLayout.y + (row * (this.exampleTextSize.height + offset)) + margin;
    }

    private updatePressedKeys() {
        MAPPED_KEYS.forEach(key => {
            const keyCode = mapPassionKeyToKeyCode(key);
            if (keyCode === undefined) {
                return;
            }
            
            const prevValue = this.state.keypad[keyCode];
            this.state.keypad[keyCode] = this.passion.input.btn(key);
            if (!prevValue && this.state.keypad[keyCode] && this.state.waitForKey !== undefined) {
                this.state.register[this.state.waitForKey] = keyCode;
                this.state.waitForKey = undefined;
                this.state.programCounter += 2;
            } 
        });
    }
}