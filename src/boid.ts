export interface Boid {
    x: number; // Coordinate x
    y: number; // Coordinate y
    vx: number; // Velocity x direction
    vy: number; // Velocity y direction
    m: number; // Mass 
  }

export const NUM_BOIDS = 100;
export const RADIUS = 10;  
const MAX_ATTEMPTS = 1000; 


export function initializeBoids(numBoids: number, canvas: HTMLCanvasElement): Array<Boid> {
    let boids: Array<Boid> = [];
    let attempts = 0;
    while (boids.length < numBoids && attempts < MAX_ATTEMPTS) {
      // Prevent collisions when adding a new particle 
      const newBoid = {
        x: Math.random() * canvas.width, 
        y: Math.random() * canvas.height, 
        vx: (Math.random() - 0.5) * 2, 
        vy: (Math.random() - 0.5) * 2,
        m: (Math.random() * 50) + 50, 
      }; 
      const collisionDetected = boids.some((boid) => {
        const dx = newBoid.x - boid.x; 
        const dy = newBoid.y - boid.y; 
        const distance = Math.sqrt(dx * dx + dy * dy);
        distance < RADIUS * 2
      });
      if (!collisionDetected) { boids.push(newBoid) } else { attempts++ };
    }
    if (attempts >= MAX_ATTEMPTS) {
      console.log("Failed to add all boids due to collisions. Consider decreasing the number of boids or increasing the canvas size.");
    }
    return boids; 
}


export const EDGE_LIMIT = 100; 
const STEERING_STRENGTH = 0.35; 
export function edgeSteering(boid: Boid, canvas: HTMLCanvasElement) {
  if (boid.x < EDGE_LIMIT) {
    boid.vx += STEERING_STRENGTH * EDGE_LIMIT/(boid.x + 0.001);
  } else if (boid.x > (canvas.width - EDGE_LIMIT)) {
    boid.vx -= STEERING_STRENGTH;
  }
  if (boid.y < EDGE_LIMIT) {
    boid.vy += STEERING_STRENGTH;
  } else if (boid.y > (canvas.height - EDGE_LIMIT)) {
    boid.vy -= STEERING_STRENGTH;
  }
}


const MAX_SPEED = 5;
const MIN_SPEED = 2; 
export function limitSpeed(boid: Boid) {
  const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
  if (speed > MAX_SPEED) {
    boid.vx = (boid.vx / speed) * MAX_SPEED;
    boid.vy = (boid.vy / speed) * MAX_SPEED;
  } else if (speed < MIN_SPEED) {
    boid.vx = (boid.vx / speed) * MIN_SPEED;
    boid.vy = (boid.vy / speed) * MIN_SPEED;
  }
}
