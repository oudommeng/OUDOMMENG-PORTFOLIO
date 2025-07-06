import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- Basic Setup ---
// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xadd8e6); // Light blue background

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(3, 3, 0); // Set initial camera position
scene.add(camera);

// Renderer
const canvas = document.querySelector('canvas.threejs');
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- Coordinate Plane Helpers ---
// Grid Helper (XZ Plane)
const gridSize = 10;
const gridDivisions = 10;
const gridHelper = new THREE.GridHelper(gridSize, gridDivisions);
scene.add(gridHelper);

// Axes Helper (X, Y, Z axes)
const axesHelper = new THREE.AxesHelper(5); // The number 5 is the length of the axes
scene.add(axesHelper);

// --- Load Model ---
let loadedModel;
const loader = new GLTFLoader();
loader.load(
    '/model/CADTFont.glb', // Path to your model
    (gltf) => {
        loadedModel = gltf.scene;
        loadedModel.position.set(0, 0, 0); // Position the model at the origin

        const newColor = new THREE.Color(0x13274B);
        loadedModel.traverse((child) => {
            if (child.isMesh) {
                child.material.color.set(newColor);
            }
        });

        scene.add(loadedModel);
    },
    undefined, // onProgress callback (optional)
    (error) => {
        console.error('An error happened while loading the model:', error);
    }
);


// --- Controls ---
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; // Makes the rotation smoother
controls.dampingFactor = 0.05;

// --- Animation Loop ---
const targetPosition = new THREE.Vector3(3, 1.5, 0);
let isAnimationDone = false;

// Stop animation on user interaction
controls.addEventListener('start', () => {
  isAnimationDone = true;
});

const animate = () => {
  // Run the intro animation only once
  if (!isAnimationDone) {
    if (camera.position.distanceTo(targetPosition) > 0.01) {
      camera.position.lerp(targetPosition, 0.005); // Smoothly move towards the target position
    } else {
      camera.position.copy(targetPosition); // Snap to final position
      isAnimationDone = true;
    }
  }

  // Rotate the loaded model
  if (loadedModel) {
    loadedModel.rotation.y += 0.005;
  }

  // Update controls
  controls.update();

  // Render the scene
  renderer.render(scene, camera);

  // Call animate again on the next frame
  window.requestAnimationFrame(animate);
};

animate();

// --- Handle Window Resize ---
window.addEventListener('resize', () => {
  // Update camera aspect ratio
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
