import { Passion } from "@dmitrii-eremin/passion-engine";
import { C8_DEFAULT_COLORS, C8_SCREEN_HEIGHT, C8_SCREEN_MULTIPLIER, C8_SCREEN_WIDTH } from "./consts";
import { ScreenColors } from "./types";
import { Size } from "@dmitrii-eremin/passion-engine/engine-build/stdlib/size";

export class Chip8Screen {
    private pixels: boolean[][] = Array(C8_SCREEN_WIDTH).fill(null).map(() => Array(C8_SCREEN_HEIGHT).fill(null).map(() => Math.random() < 0.5));
    private readonly multiplier = C8_SCREEN_MULTIPLIER;
    private readonly borderWidth = 2;

    constructor(private passion: Passion, private colors: ScreenColors = C8_DEFAULT_COLORS) {

    }

    get fullSize(): Size {
        return new Size(C8_SCREEN_WIDTH * this.multiplier, C8_SCREEN_HEIGHT * this.multiplier);
    }

    flip(pixels: boolean[][]): void {
        this.pixels = pixels.map(row => [...row]);
    }

    draw(ox: number, oy: number): void {
        this.passion.graphics.rect(
            ox - this.borderWidth, oy - this.borderWidth,
            C8_SCREEN_WIDTH * this.multiplier + 2 * this.borderWidth,
            C8_SCREEN_HEIGHT * this.multiplier + 2 * this.borderWidth,
            5
        );
        for (let ix = 0; ix < C8_SCREEN_WIDTH; ix++) {
            for (let iy = 0; iy < C8_SCREEN_HEIGHT; iy++) {
                const x = ox + ix * this.multiplier;
                const y = oy + iy * this.multiplier;
                this.passion.graphics.rect(
                    x, y, this.multiplier, this.multiplier,
                    this.pixels[ix][iy] ? this.colors.foreground : this.colors.background,
                )
            }   
        }
    }
}