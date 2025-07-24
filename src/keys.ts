import { Key } from "@dmitrii-eremin/passion-engine/engine-build/key";

export type KeyCode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0xA | 0xB | 0xC | 0xD | 0xE | 0xF;

export const MAPPED_KEYS: Key[] = [
    'KeyX',
    'Digit1',
    'Digit2',
    'Digit3',
    'KeyQ',
    'KeyW',
    'KeyE',
    'KeyA',
    'KeyS',
    'KeyD',
    'KeyZ',
    'KeyC',
    'Digit4',
    'KeyR',
    'KeyF',
    'KeyV',
];

export const mapKeyCodeToPassionKey = (key: KeyCode): Key => {
    switch (key) {
        case 0:
            return 'KeyX';
        case 1:
            return 'Digit1';
        case 2:
            return 'Digit2';
        case 3:
            return 'Digit3';
        case 4:
            return 'KeyQ';
        case 5:
            return 'KeyW';
        case 6:
            return 'KeyE';
        case 7:
            return 'KeyA';
        case 8:
            return 'KeyS';
        case 9:
            return 'KeyD';
        case 0xA:
            return 'KeyZ';
        case 0xB:
            return 'KeyC';
        case 0xC:
            return 'Digit4';
        case 0xD:
            return 'KeyR';
        case 0xE:
            return 'KeyF';
        case 0xF:
            return 'KeyV';
    }
}

export const mapPassionKeyToKeyCode = (key: Key): KeyCode | undefined => {
    switch (key) {
        case 'KeyX':
            return 0;
        case 'Digit1':
            return 1;
        case 'Digit2':
            return 2;
        case 'Digit3':
            return 3;
        case 'KeyQ':
            return 4;
        case 'KeyW':
            return 5;
        case 'KeyE':
            return 6;
        case 'KeyA':
            return 7;
        case 'KeyS':
            return 8;
        case 'KeyD':
            return 9;
        case 'KeyZ':
            return 0xA;
        case 'KeyC':
            return 0xB;
        case 'Digit4':
            return 0xC;
        case 'KeyR':
            return 0xD;
        case 'KeyF':
            return 0xE;
        case 'KeyV':
            return 0xF;
    }
}
