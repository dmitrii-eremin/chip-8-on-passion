import { Passion } from "@dmitrii-eremin/passion-engine";
import { Chip8Screen } from "./screen";
import { Size } from "@dmitrii-eremin/passion-engine/engine-build/stdlib/size";
import { C8_EMU_TITLE, C8_SCREEN_MULTIPLIER, C8_SCREEN_WIDTH } from "./consts";
import { Chip8Emu } from "./emulator";
import { DEMO_PROGRAM_IBM } from "./demo_programs";
import { Button } from "./button";
import { Position } from "@dmitrii-eremin/passion-engine/engine-build/stdlib/position";
import { RomUploader } from "./rom_uploader";
import { OpCode } from "./types";

export class Chip8Game {
    private screen: Chip8Screen;
    private emulator: Chip8Emu;
    private stepByStep = false;

    private readonly windowSize = new Size(640, 360);
    private readonly windowOffset = 30;
    private readonly workingSpace = new Size(C8_SCREEN_WIDTH * C8_SCREEN_MULTIPLIER + 2 * this.windowOffset, this.windowSize.height);

    private readonly buttonsLeft = this.windowOffset - 2;
    private readonly buttonsTop = 230;

    private buttons: Button[];
    private uploader: RomUploader = new RomUploader();
    private lastProgram: OpCode[] = DEMO_PROGRAM_IBM;

    constructor(private passion: Passion) {
        this.passion.system.init(this.windowSize.width, this.windowSize.height, "CHIP-8 Emu by passion games team");

        this.buttons = [
            new Button(this.passion, { title: 'upload rom', fixedWidth: 70 }, new Position(this.buttonsLeft, this.buttonsTop),
                () => {
                    this.uploader.upload().then((bytes: number[] | undefined) => {
                        if (bytes === undefined) {
                            return;
                        }

                        this.emulator.reset();
                        this.lastProgram = bytes;
                        this.emulator.load(bytes);
                    })
                }),
            new Button(this.passion, { title: 'reset', fixedWidth: 70 }, new Position(this.buttonsLeft, this.buttonsTop + 25),
                () => this.reset()),

            new Button(this.passion, { title: '1' }, new Position(this.buttonsLeft + 278 + 0 * 30, this.buttonsTop + 0 * 30),
                () => this.emulator.setVirtualKeypad(0x1, true),
                () => this.emulator.setVirtualKeypad(0x1, false)),
            new Button(this.passion, { title: '2' }, new Position(this.buttonsLeft + 278 + 1 * 30, this.buttonsTop + 0 * 30),
                () => this.emulator.setVirtualKeypad(0x2, true),
                () => this.emulator.setVirtualKeypad(0x2, false)),
            new Button(this.passion, { title: '3' }, new Position(this.buttonsLeft + 278 + 2 * 30, this.buttonsTop + 0 * 30),
                () => this.emulator.setVirtualKeypad(0x3, true),
                () => this.emulator.setVirtualKeypad(0x3, false)),
            new Button(this.passion, { title: 'C' }, new Position(this.buttonsLeft + 278 + 3 * 30, this.buttonsTop + 0 * 30),
                () => this.emulator.setVirtualKeypad(0xC, true),
                () => this.emulator.setVirtualKeypad(0xC, false)),

            new Button(this.passion, { title: '4' }, new Position(this.buttonsLeft + 278 + 0 * 30, this.buttonsTop + 1 * 30),
                () => this.emulator.setVirtualKeypad(0x4, true),
                () => this.emulator.setVirtualKeypad(0x4, false)),
            new Button(this.passion, { title: '5' }, new Position(this.buttonsLeft + 278 + 1 * 30, this.buttonsTop + 1 * 30),
                () => this.emulator.setVirtualKeypad(0x5, true),
                () => this.emulator.setVirtualKeypad(0x5, false)),
            new Button(this.passion, { title: '6' }, new Position(this.buttonsLeft + 278 + 2 * 30, this.buttonsTop + 1 * 30),
                () => this.emulator.setVirtualKeypad(0x6, true),
                () => this.emulator.setVirtualKeypad(0x6, false)),
            new Button(this.passion, { title: 'D' }, new Position(this.buttonsLeft + 278 + 3 * 30, this.buttonsTop + 1 * 30),
                () => this.emulator.setVirtualKeypad(0xD, true),
                () => this.emulator.setVirtualKeypad(0xD, false)),

            new Button(this.passion, { title: '7' }, new Position(this.buttonsLeft + 278 + 0 * 30, this.buttonsTop + 2 * 30),
                () => this.emulator.setVirtualKeypad(0x7, true),
                () => this.emulator.setVirtualKeypad(0x7, false)),
            new Button(this.passion, { title: '8' }, new Position(this.buttonsLeft + 278 + 1 * 30, this.buttonsTop + 2 * 30),
                () => this.emulator.setVirtualKeypad(0x8, true),
                () => this.emulator.setVirtualKeypad(0x8, false)),
            new Button(this.passion, { title: '9' }, new Position(this.buttonsLeft + 278 + 2 * 30, this.buttonsTop + 2 * 30),
                () => this.emulator.setVirtualKeypad(0x9, true),
                () => this.emulator.setVirtualKeypad(0x9, false)),
            new Button(this.passion, { title: 'E' }, new Position(this.buttonsLeft + 278 + 3 * 30, this.buttonsTop + 2 * 30),
                () => this.emulator.setVirtualKeypad(0xE, true),
                () => this.emulator.setVirtualKeypad(0xE, false)),

            new Button(this.passion, { title: 'A' }, new Position(this.buttonsLeft + 278 + 0 * 30, this.buttonsTop + 3 * 30),
                () => this.emulator.setVirtualKeypad(0xA, true),
                () => this.emulator.setVirtualKeypad(0xA, false)),
            new Button(this.passion, { title: '0' }, new Position(this.buttonsLeft + 278 + 1 * 30, this.buttonsTop + 3 * 30),
                () => this.emulator.setVirtualKeypad(0x0, true),
                () => this.emulator.setVirtualKeypad(0x0, false)),
            new Button(this.passion, { title: 'B' }, new Position(this.buttonsLeft + 278 + 2 * 30, this.buttonsTop + 3 * 30),
                () => this.emulator.setVirtualKeypad(0xB, true),
                () => this.emulator.setVirtualKeypad(0xB, false)),
            new Button(this.passion, { title: 'F' }, new Position(this.buttonsLeft + 278 + 3 * 30, this.buttonsTop + 3 * 30),
                () => this.emulator.setVirtualKeypad(0xF, true),
                () => this.emulator.setVirtualKeypad(0xF, false)),
        ];

        this.screen = new Chip8Screen(passion);
        this.emulator = new Chip8Emu(passion, this.screen);

        this.reset();

        this.passion.system.run(dt => this.update(dt), () => this.draw());
    }

    private reset() {
        this.emulator.reset();
        this.emulator.load(this.lastProgram);
    }

    update(dt: number) {
        this.buttons.forEach(b => b.update(dt));
        if (!this.stepByStep || this.passion.input.btnp('Space')) {
            this.emulator.executeCurrentCommand(this.screen);
        }
        this.emulator.update(dt);
    }

    draw() {
        this.passion.graphics.cls(1);
        this.drawEmuScreen();
        this.emulator.draw(this.workingSpace.width, 0, this.passion.system.width - this.workingSpace.width, this.passion.system.height);
        this.buttons.forEach(b => b.draw());
    }

    private drawEmuScreen() {
        const textSize = this.passion.graphics.textSize(C8_EMU_TITLE);
        this.passion.graphics.text((this.workingSpace.width - (textSize?.width ?? 0)) / 2, (this.windowOffset - (textSize?.height ?? 0)) / 2 - 2, C8_EMU_TITLE, 15);

        this.screen.draw(this.windowOffset, this.windowOffset);
        this.passion.graphics.line(this.workingSpace.width, 0, this.workingSpace.width, this.windowSize.height, 15);
    }
}