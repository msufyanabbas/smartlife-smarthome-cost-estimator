import * as THREE from 'three';
// Particle system for smoke effect
export class SmokeParticleSystem {
  particles: THREE.Points;
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
  positions: Float32Array;
  velocities: Float32Array;
  ages: Float32Array;
  maxAge: number = 3.0;
  particleCount: number = 50;

  constructor() {
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      color: 0x888888,
      size: 0.5,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      vertexColors: false
    });

    this.positions = new Float32Array(this.particleCount * 3);
    this.velocities = new Float32Array(this.particleCount * 3);
    this.ages = new Float32Array(this.particleCount);

    this.initializeParticles();

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.particles = new THREE.Points(this.geometry, this.material);
  }

  initializeParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      // Start particles at origin
      this.positions[i3] = (Math.random() - 0.5) * 0.2;
      this.positions[i3 + 1] = 0;
      this.positions[i3 + 2] = (Math.random() - 0.5) * 0.2;

      // Random upward velocity with slight horizontal drift
      this.velocities[i3] = (Math.random() - 0.5) * 0.1;
      this.velocities[i3 + 1] = Math.random() * 0.5 + 0.2;
      this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;

      this.ages[i] = Math.random() * this.maxAge;
    }
  }

  update(deltaTime: number) {
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      
      // Update age
      this.ages[i] += deltaTime;
      
      if (this.ages[i] > this.maxAge) {
        // Reset particle
        this.positions[i3] = (Math.random() - 0.5) * 0.2;
        this.positions[i3 + 1] = 0;
        this.positions[i3 + 2] = (Math.random() - 0.5) * 0.2;
        
        this.velocities[i3] = (Math.random() - 0.5) * 0.1;
        this.velocities[i3 + 1] = Math.random() * 0.5 + 0.2;
        this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
        
        this.ages[i] = 0;
      }
      
      // Update position
      this.positions[i3] += this.velocities[i3] * deltaTime;
      this.positions[i3 + 1] += this.velocities[i3 + 1] * deltaTime;
      this.positions[i3 + 2] += this.velocities[i3 + 2] * deltaTime;
      
      // Add some turbulence
      this.velocities[i3] += (Math.random() - 0.5) * 0.01;
      this.velocities[i3 + 2] += (Math.random() - 0.5) * 0.01;
    }
    
    this.geometry.attributes.position.needsUpdate = true;
    
    // Fade opacity based on age
    const avgAge = this.ages.reduce((sum, age) => sum + age, 0) / this.particleCount;
    this.material.opacity = Math.max(0.1, 0.6 * (1 - avgAge / this.maxAge));
  }
}