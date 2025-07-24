import { ScreenColors } from "./types";

export const C8_SCREEN_WIDTH = 64;
export const C8_SCREEN_HEIGHT = 32;
export const C8_SCREEN_MULTIPLIER = 6;

export const C8_EMU_TITLE = 'CHIP-8 Emu by passion games!';

export const C8_PROGRAM_START_ADDRESS = 0x200;
export const C8_MEMORY_SIZE = 0x1000;
export const C8_REGISTER_COUNT = 0x10;
export const C8_STACK_SIZE = 0x30;

export const C8_DEFAULT_COLORS: ScreenColors = {
    background: '#6b7a8f',
    foreground: '#f6e7d7'
};