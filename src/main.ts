import './style.css'

// Getting the Canvas object
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

// Resizing the Canvas
const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Initial resize

// Getting slider elements
const numBoidsSlider = document.getElementById("numBoids") as HTMLInputElement;
const separationRadiusSlider = document.getElementById("separationRadius") as HTMLInputElement;
const separationStrengthSlider = document.getElementById("separation") as HTMLInputElement;  
const alignmentRadiusSlider = document.getElementById("alignmentRadius") as HTMLInputElement;
const alignmentStrengthSlider = document.getElementById("alignment") as HTMLInputElement; 
const cohesionRadiusSlider = document.getElementById("cohesionRadius") as HTMLInputElement; 
const cohesionStrengthSlider = document.getElementById("cohesion") as HTMLInputElement;

interface Boid {
  x: number; // Coordinate x
  y: number; // Coordinate y
  vx: number; // Velocity x direction
  vy: number; // Velocity y direction
  m: number; // Mass 
}

// Initializing boids (defaults)
const NUM_BOIDS = 100;
const RADIUS = 10;  
const MAX_ATTEMPTS = 1000; 
let boids: Array<Boid> = [];

function initializeBoids(numBoids: number): Array<Boid> {
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

boids = initializeBoids(NUM_BOIDS);
numBoidsSlider.addEventListener("input", () => {
  let numBoids = parseInt(numBoidsSlider.value);
  boids = initializeBoids(numBoids);
});

let SEPARATION_RADIUS = 75; 
let SEPARATION_STRENGTH = 0.1; 
function applySeparation(boid: Boid, boids: Array<Boid>) {
  let forceX = 0;
  let forceY = 0; 
  let count = 0; 
  for (const other of boids) {
    if (other === boid) continue; 
    const dx = boid.x - other.x;
    const dy = boid.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < SEPARATION_RADIUS) {
      // Repulsive Lennard-Jones-like function
      const strength = SEPARATION_STRENGTH * Math.pow(SEPARATION_RADIUS/distance, 4);
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

separationRadiusSlider.addEventListener("input", () => {
  let separationRadius = parseInt(separationRadiusSlider.value);
  SEPARATION_RADIUS = separationRadius;
});
separationStrengthSlider.addEventListener("input", () => {
  let separationStrength = parseFloat(separationStrengthSlider.value);
  SEPARATION_STRENGTH = separationStrength;
});

let ALIGNMENT_RADIUS = 100; 
let ALIGNMENT_STRENGTH = 0.1; 
function applyAlignment(boid: Boid, boids: Array<Boid>) {
  let avgVx = 0; 
  let avgVy = 0; 
  let count = 0; 
  for (const other of boids) {
    if (other === boid) continue; 
    const dx = boid.x - other.x;
    const dy = boid.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < ALIGNMENT_RADIUS) {
      avgVx += other.vx;
      avgVy += other.vy;
      count++;
    }
  }
  if (count > 0) {
    avgVx /= count;
    avgVy /= count;
    boid.vx += (avgVx - boid.vx) * ALIGNMENT_STRENGTH;
    boid.vy += (avgVy - boid.vy) * ALIGNMENT_STRENGTH;
  }
}

alignmentRadiusSlider.addEventListener("input", () => {
  let alignmentRadius = parseInt(separationRadiusSlider.value);
  ALIGNMENT_RADIUS = alignmentRadius;
});
alignmentStrengthSlider.addEventListener("input", () => {
  let alignmentStrength = parseFloat(alignmentStrengthSlider.value);
  ALIGNMENT_STRENGTH = alignmentStrength;
});

let COHESION_RADIUS = 100; 
let COHESION_STRENGTH = 0.1; 
function applyCohesion(boid: Boid, boids: Array<Boid>) {
  let xCM = 0; // Center of mass (x)
  let yCM = 0; // Center of mass (y) 
  let mTotal = 0; // Total mass 

  for (let other of boids) {
    if (other === boid) continue; 
    const dx = boid.x - other.x;
    const dy = boid.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < COHESION_RADIUS) {
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
    boid.vx += (dx / distance) * COHESION_STRENGTH;
    boid.vy += (dy / distance) * COHESION_STRENGTH;
  }
}

cohesionRadiusSlider.addEventListener("input", () => {
  let cohesionRadius = parseInt(cohesionRadiusSlider.value);
  COHESION_RADIUS = cohesionRadius;
});
cohesionStrengthSlider.addEventListener("input", () => {
  let cohesionStrength = parseFloat(cohesionStrengthSlider.value);
  COHESION_STRENGTH = cohesionStrength;
});


let EDGE_LIMIT = 100; 
let STEERING_STRENGTH = 0.25; 
function edgeSteering(boid: Boid) {
  // Canvas center coordinates
  const canvasX = canvas.width/2; 
  const canvasY = canvas.height/2;
  // Distance from canvas center
  const dx = canvasX - boid.x;
  const dy = canvasY - boid.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  // Steer boids towards the center of the canvas if they are close to the edge
  if (boid.x < EDGE_LIMIT || boid.x > (canvas.width - EDGE_LIMIT) || boid.y < EDGE_LIMIT || boid.y > (canvas.height - EDGE_LIMIT)) {
    boid.vx += (dx / distance) * STEERING_STRENGTH;
    boid.vy += (dy / distance) * STEERING_STRENGTH;
  }
}


let MAX_SPEED = 10;
let MIN_SPEED = 2; 
function limitSpeed(boid: Boid) {
  const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
  if (speed > MAX_SPEED) {
    boid.vx = (boid.vx / speed) * MAX_SPEED;
    boid.vy = (boid.vy / speed) * MAX_SPEED;
  } else if (speed < MIN_SPEED) {
    boid.vx = (boid.vx / speed) * MIN_SPEED;
    boid.vy = (boid.vy / speed) * MIN_SPEED;
  }
}



const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let boid of boids) {
    boid.x += boid.vx; 
    boid.y += boid.vy; 
    applyCohesion(boid, boids);
    applySeparation(boid, boids);
    applyAlignment(boid, boids);
    limitSpeed(boid); 
    edgeSteering(boid);


    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(boid.x, boid.y, RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }

};
const animate = () => {
  draw();
  requestAnimationFrame(animate);
};
animate(); // Start animation loop


