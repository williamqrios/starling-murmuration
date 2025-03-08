import './style.css'
import { Boid, RADIUS, NUM_BOIDS, initializeBoids, edgeSteering, limitSpeed } from './boid'; 
import { applySeparation,  applyAlignment, applyCohesion, avoidPredator, predatorChase } from './behavior';
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
const predatorCheckbox = document.getElementById("predator") as HTMLInputElement; 
const predatorSlider = document.getElementById("aggressiveness") as HTMLInputElement; 
const avoidanceSlider = document.getElementById("avoidance") as HTMLInputElement; 

// Simulation variables 
let boids: Array<Boid> = [];
let predator: Boid | null = null; 
let separationRadius = 100; 
let separationStrength = 0.1; 
let alignmentRadius = 100; 
let alignmentStrength = 0.1; 
let cohesionRadius = 100; 
let cohesionStrength = 0.1; 
let predatorAvoidance = 0.1; 
let aggressiveness = 0.1; 


// Initializing boids (defaults)
boids = initializeBoids(NUM_BOIDS, canvas);
numBoidsSlider.addEventListener("input", () => {
  let numBoids = parseInt(numBoidsSlider.value);
  boids = initializeBoids(numBoids, canvas);
});

// Initializing predator 
predatorCheckbox.addEventListener("change", () => {
  if (predatorCheckbox.checked) {
    predator = {
      x: canvas.width/2, 
      y: canvas.height/2, 
      vx: Math.random() * 3, 
      vy: Math.random() * 3,
      m: (Math.random() * 50) + 250, 
    }
  } else {
    predator = null; 
  }
  predatorSlider.disabled = !predatorCheckbox.checked;
  avoidanceSlider.disabled = !predatorCheckbox.checked;
});

// Event listeners for sliders
separationRadiusSlider.addEventListener("input", () => {
  separationRadius = parseInt(separationRadiusSlider.value);
});
separationStrengthSlider.addEventListener("input", () => {
   separationStrength = parseFloat(separationStrengthSlider.value);
});

alignmentRadiusSlider.addEventListener("input", () => {
  alignmentRadius = parseInt(separationRadiusSlider.value);
});
alignmentStrengthSlider.addEventListener("input", () => {
  alignmentStrength = parseFloat(alignmentStrengthSlider.value);
});

cohesionRadiusSlider.addEventListener("input", () => {
  cohesionRadius = parseInt(cohesionRadiusSlider.value);
});
cohesionStrengthSlider.addEventListener("input", () => {
  cohesionStrength = parseFloat(cohesionStrengthSlider.value);
});

avoidanceSlider.addEventListener("input", () => {
  predatorAvoidance = parseFloat(avoidanceSlider.value);
});

predatorSlider.addEventListener("input", () => {
  aggressiveness = parseFloat(predatorSlider.value);
});

// Drawing objects  
const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Boids 
  for (let boid of boids) {
    boid.x += boid.vx; 
    boid.y += boid.vy; 
    applyCohesion(boid, boids, cohesionRadius, cohesionStrength);
    applySeparation(boid, boids, separationRadius, separationStrength);
    applyAlignment(boid, boids, alignmentRadius, alignmentStrength);
    if (predator) {
      avoidPredator(boid, predator, predatorAvoidance);
    }
    edgeSteering(boid, canvas);
    limitSpeed(boid); 


    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(boid.x, boid.y, RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }

  // Predator behavior
  if (predator) {
    predator.x += predator.vx;
    predator.y += predator.vy;
    predatorChase(boids, predator, canvas, aggressiveness);
    edgeSteering(predator, canvas);
    limitSpeed(predator); 
  
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(predator.x, predator.y, RADIUS*1.5, 0, Math.PI * 2);
    ctx.fill();
  }
};
const animate = () => {
  draw();
  requestAnimationFrame(animate);
};
animate(); // Start animation loop


