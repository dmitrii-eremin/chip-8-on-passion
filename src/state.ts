import { C8_KEYPAD_SIZE, C8_MEMORY_SIZE, C8_PROGRAM_START_ADDRESS, C8_REGISTER_COUNT, C8_SCREEN_HEIGHT, C8_SCREEN_WIDTH, C8_STACK_SIZE } from "./consts";

export class Chip8State {
    pixels: boolean[][];
    memory: number[];
    stack: number[];
    programCounter: number;
    register: number[];
    keypad: boolean[];
    indexRegister: number;
    delayTimer: number;
    soundTimer: number;

    waitForKey?: number;

    constructor() {
        this.pixels = Array(C8_SCREEN_WIDTH).fill(null).map(() => Array(C8_SCREEN_HEIGHT).fill(null).map(() => false));
        this.memory = new Array(C8_MEMORY_SIZE).fill(0);
        this.keypad = new Array(C8_KEYPAD_SIZE).fill(false);
        this.stack = [];
        this.programCounter = C8_PROGRAM_START_ADDRESS;
        this.register = new Array(C8_REGISTER_COUNT).fill(0);
        this.indexRegister = 0;
        this.delayTimer = 0;
        this.soundTimer = 0;
    }

    reset() {
        const newState = new Chip8State();
        this.pixels = newState.pixels.map(row => [...row]);
        this.memory = [...newState.memory];
        this.stack = [...newState.stack];
        this.keypad = [...newState.keypad];
        this.programCounter = newState.programCounter;
        this.register = [...newState.register];
        this.indexRegister = newState.indexRegister;
        this.delayTimer = newState.delayTimer;
        this.soundTimer = newState.soundTimer;
        this.waitForKey = newState.waitForKey;
    }
}
