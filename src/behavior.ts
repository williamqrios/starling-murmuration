import { Boid, EDGE_LIMIT } from "./boid";

export function applySeparation(boid: Boid, boids: Array<Boid>, separationRadius: number, separationStrength: number) {
  let forceX = 0;
  let forceY = 0; 
  let count = 0; 
  for (const other of boids) {
    if (other === boid) continue; 
    const dx = boid.x - other.x;
    const dy = boid.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < separationRadius) {
      // Repulsive Lennard-Jones-like function
      const strength = separationStrength * Math.pow(separationRadius/distance, 4);
      forceX += dx / distance * strength;
      forceY += dy / distance * strength;
      count++;
    }
  }
  if (count > 0) {
    forceX /= count;
    forceY /= count;
    boid.vx += forceX;
    boid.vy += forceY;
  }
}

export function applyAlignment(boid: Boid, boids: Array<Boid>, alignmentRadius: number, alingmentStrength: number) {
  let avgVx = 0; 
  let avgVy = 0; 
  let count = 0; 
  for (const other of boids) {
    if (other === boid) continue; 
    const dx = boid.x - other.x;
    const dy = boid.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < alignmentRadius) {
      avgVx += other.vx;
      avgVy += other.vy;
      count++;
    }
  }
  if (count > 0) {
    avgVx /= count;
    avgVy /= count;
    boid.vx += (avgVx - boid.vx) * alingmentStrength;
    boid.vy += (avgVy - boid.vy) * alingmentStrength;
  }
}

export function applyCohesion(boid: Boid, boids: Array<Boid>, cohesionRadius: number, cohesionStrength: number) {
  let xCM = 0; // Center of mass (x)
  let yCM = 0; // Center of mass (y) 
  let mTotal = 0; // Total mass 

  for (let other of boids) {
    if (other === boid) continue; 
    const dx = boid.x - other.x;
    const dy = boid.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < cohesionRadius) {
      xCM += other.x * other.m;
      yCM += other.y * other.m;
      mTotal += other.m;
    }
  }

  if (mTotal > 0) {
    xCM /= mTotal;
    yCM /= mTotal;
    const dx = xCM - boid.x;
    const dy = yCM - boid.y;
    // Distance of boid from the center of mass of its flockmates
    const distance = Math.sqrt(dx * dx + dy * dy);
    boid.vx += (dx / distance) * cohesionStrength;
    boid.vy += (dy / distance) * cohesionStrength;
  }
}


const PREDATOR_RADIUS = 50; 
export function avoidPredator(boid: Boid, predator: Boid, predatorAvoidance: number) {
  const dx = boid.x - predator.x;
  const dy = boid.y - predator.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  // Exponential decay function for a more "natural" behavior. Birds have good vision, they know where the predator is and they communicate in their flock.
  boid.vx += dx * predatorAvoidance * Math.exp(-distance/PREDATOR_RADIUS);
  boid.vy += dy * predatorAvoidance * Math.exp(-distance/PREDATOR_RADIUS);
  if (distance < PREDATOR_RADIUS) {
    // Extra repulsive force
    boid.vx += dx * predatorAvoidance * Math.pow(PREDATOR_RADIUS/distance, 4);
    boid.vy += dy * predatorAvoidance * Math.pow(PREDATOR_RADIUS/distance, 4);
  }
}

let edgePenalty = 1; 
export function predatorChase(boids: Array<Boid>, predator: Boid, canvas: HTMLCanvasElement, aggressiveness: number) {
  let closestBoid = boids[0];
  let currentDistance = canvas.width * canvas.height;
  for (let boid of boids) {
    const dx = boid.x - predator.x;
    const dy = boid.y - predator.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <  currentDistance) {
      closestBoid = boid;
    }
  }
  const dx = closestBoid.x - predator.x;
  const dy = closestBoid.y - predator.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  // Penalty for chasing a boid out of bounds 
  if (predator.x < EDGE_LIMIT || predator.x > (canvas.width - EDGE_LIMIT) || predator.y < EDGE_LIMIT || predator.y > (canvas.height - EDGE_LIMIT)) {
    edgePenalty = 0.1; 
  } else {
    edgePenalty = 1;
  }
  predator.vx += dx/distance * aggressiveness * edgePenalty;
  predator.vy += dy/distance * aggressiveness * edgePenalty;
}