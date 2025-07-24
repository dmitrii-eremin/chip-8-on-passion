import { Passion } from "@dmitrii-eremin/passion-engine";

export class Chip8Game {
    constructor(private passion: Passion) {
        this.passion.system.init(360, 240, "CHIP-8 Emu by passion games team");
        this.passion.system.run(this.update, this.draw);
    }

    update(dt: number) {

    }

    draw() {

    }
}