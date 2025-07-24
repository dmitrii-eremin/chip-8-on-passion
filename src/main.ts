import { Passion } from '@dmitrii-eremin/passion-engine';
import './style.css'

document.addEventListener('DOMContentLoaded', () => {

  const app = document.getElementById('app') as HTMLCanvasElement | null;
  if (app) {
    debugger;
    const passion = new Passion(app);
    passion.system.init(360, 240, "My first, but wonderful game!");

    const radius = 16;
    const speed = 20;
    let x = 360 / 2;
    let y = 240 / 2;

    let dx = passion.math.rndi(-5, 5);
    let dy = passion.math.rndi(-5, 5);


    passion.system.run(
      (dt: number) => {
        // this function is called every frame to update game state
        x += speed * dx * dt;
        y += speed * dy * dt;
        if (x - radius <= 0 || x + radius >= passion.system.width) {
            dx = -dx;
        }
        if (y - radius <= 0 || y + radius >= passion.system.height) {
            dy = -dy;
        }
      },
      () => {
        // this function is called when browser requests the engine to draw a frame
        passion.graphics.cls(2);

        passion.graphics.circ(x, y, radius, 1);

        passion.graphics.text(100, 50, 'Welcome to the passion engine!', 15);
      }
    );
  }
});