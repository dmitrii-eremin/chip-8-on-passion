import { C8_MEMORY_SIZE, C8_PROGRAM_START_ADDRESS, C8_REGISTER_COUNT, C8_SCREEN_HEIGHT, C8_SCREEN_WIDTH, C8_STACK_SIZE } from "./consts";

export class Chip8State {
    pixels: boolean[][] = Array(C8_SCREEN_WIDTH).fill(null).map(() => Array(C8_SCREEN_HEIGHT).fill(null).map(() => Math.random() < 0.5));
    memory: number[] = new Array(C8_MEMORY_SIZE).fill(0);
    stack: number[] = new Array(C8_STACK_SIZE).fill(0);
    programCounter: number = C8_PROGRAM_START_ADDRESS;
    register: number[] = new Array(C8_REGISTER_COUNT).fill(0);
    indexRegister: number = 0;
    delayTimer: number = 0;
    soundTimer: number = 0;
}
