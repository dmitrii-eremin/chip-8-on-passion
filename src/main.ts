import { Passion } from '@dmitrii-eremin/passion-engine';
import { Chip8Game } from './chip8game';
import './style.css'

document.addEventListener('DOMContentLoaded', () => {

  const app = document.getElementById('app') as HTMLCanvasElement | null;
  if (app) {
    const game = new Chip8Game(new Passion(app));
  }
});