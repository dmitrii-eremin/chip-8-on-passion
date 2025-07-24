import { Passion } from "@dmitrii-eremin/passion-engine";
import { Chip8Screen } from "./screen";
import { Size } from "@dmitrii-eremin/passion-engine/engine-build/stdlib/size";
import { C8_EMU_TITLE, C8_SCREEN_MULTIPLIER, C8_SCREEN_WIDTH } from "./consts";

export class Chip8Game {
    private screen: Chip8Screen;

    private readonly windowSize = new Size(640, 360);
    private readonly windowOffset = 30;
    private readonly workingSpace = new Size(C8_SCREEN_WIDTH * C8_SCREEN_MULTIPLIER + 2 * this.windowOffset, this.windowSize.height);

    constructor(private passion: Passion) {
        this.screen = new Chip8Screen(passion);

        this.passion.system.init(this.windowSize.width, this.windowSize.height, "CHIP-8 Emu by passion games team");
        this.passion.system.run(dt => this.update(dt), () => this.draw());
    }

    update(dt: number) {

    }

    draw() {
        this.passion.graphics.cls(1);
        this.drawEmuScreen();
    }

    private drawEmuScreen() {
        const textSize = this.passion.graphics.textSize(C8_EMU_TITLE);
        this.passion.graphics.text((this.workingSpace.width - (textSize?.width ?? 0)) / 2, (this.windowOffset - (textSize?.height ?? 0)) / 2 - 2, C8_EMU_TITLE, 15);

        this.screen.draw(this.windowOffset, this.windowOffset);
        this.passion.graphics.line(this.workingSpace.width, 0, this.workingSpace.width, this.windowSize.height, 15);
    }
}