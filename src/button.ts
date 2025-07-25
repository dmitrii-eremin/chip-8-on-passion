import { Passion } from "@dmitrii-eremin/passion-engine";
import { Position } from "@dmitrii-eremin/passion-engine/engine-build/stdlib/position";
import { Size } from "@dmitrii-eremin/passion-engine/engine-build/stdlib/size";

export type OnButtonPressed = () => void;
export type OnButtonReleased = () => void;

export type ButtonProperties = {
    title: string;
    fixedWidth?: number;
    centered: boolean;
};

export class Button {
    private readonly margin = new Size(6, 4);
    private readonly border = new Size(1, 1);
    private textSize: Size = new Size(0, 0);
    private isPressed = false;
    private properties: ButtonProperties;

    private readonly colors = {
        border: 12,
        button: 13,
        text: 7
    };

    constructor(private passion: Passion,
        properties: Partial<ButtonProperties> = {},
        private pos: Position,
        private onButtonPressed?: OnButtonPressed,
        private onButtonReleased?: OnButtonReleased) {
        
        this.properties = {
            title: properties.title ?? '',
            fixedWidth: properties.fixedWidth,
            centered: properties.centered ?? true,
        };
    }

    private get buttonSize(): Size {
        return new Size(this.textSize.width + 2 * this.margin.width, this.textSize.height + 2 * this.margin.height)
    }

    update(dt: number) {
        this.textSize = this.passion.graphics.textSize(this.properties.title) ?? new Size(0, 0);
        if (this.properties.fixedWidth) {
            this.textSize.width = this.properties.fixedWidth;
        }

        const wasPressed = this.isPressed;

        if (this.passion.input.btnp('MouseButtonLeft')) {
            this.isPressed = this.passion.input.mouse_x >= this.pos.x &&
                this.passion.input.mouse_y >= this.pos.y &&
                this.passion.input.mouse_x <= this.pos.x + this.buttonSize.width &&
                this.passion.input.mouse_y <= this.pos.y + this.buttonSize.height;

            if (this.isPressed && !wasPressed && this.onButtonPressed) {
                this.onButtonPressed();
            }
        }
        if (this.passion.input.btnr('MouseButtonLeft')) {
            this.isPressed = false;

            if (!this.isPressed && wasPressed && this.onButtonReleased) {
                this.onButtonReleased();
            }
        }
    }

    draw() {
        const offset = this.isPressed ? 1 : 0;

        this.passion.graphics.rect(
            this.pos.x - this.border.width + offset,
            this.pos.y - this.border.height + offset,
            this.textSize.width + 2 * (this.margin.width + this.border.width),
            this.textSize.height + 2 * (this.margin.height + this.border.height),
            this.colors.border
        );

        this.passion.graphics.rect(
            this.pos.x + offset,
            this.pos.y + offset,
            this.textSize.width + 2 * this.margin.width,
            this.textSize.height + 2 * this.margin.height,
            this.colors.button
        );

        const realTextSize = this.passion.graphics.textSize(this.properties.title) ?? new Size(0, 0);

        let textX = this.pos.x + this.margin.width;
        if (this.properties.centered) {
            const diff = this.textSize.width - realTextSize.width;
            textX += diff / 2;
        }

        this.passion.graphics.text(
            textX + offset,
            this.pos.y + this.margin.height + offset,
            this.properties.title,
            this.colors.text
        );
    }
}
