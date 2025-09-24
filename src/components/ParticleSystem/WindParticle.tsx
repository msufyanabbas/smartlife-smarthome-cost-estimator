import * as THREE from 'three';
// Particle system for wind effect
export class WindParticleSystem {
  particles: THREE.Points;
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
  positions: Float32Array;
  velocities: Float32Array;
  ages: Float32Array;
  maxAge: number = 2.0;
  particleCount: number = 100;
  windDirection: THREE.Vector3;

  constructor(direction: THREE.Vector3 = new THREE.Vector3(1, 0, 0)) {
    this.windDirection = direction.normalize();
    
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      color: 0xaaaaff,
      size: 0.2,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
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
      
      // Start particles from AC unit area
      this.positions[i3] = (Math.random() - 0.5) * 0.5;
      this.positions[i3 + 1] = (Math.random() - 0.5) * 0.3;
      this.positions[i3 + 2] = (Math.random() - 0.5) * 0.5;

      // Wind velocity in the specified direction
      const speed = Math.random() * 2 + 1;
      this.velocities[i3] = this.windDirection.x * speed;
      this.velocities[i3 + 1] = this.windDirection.y * speed * 0.3;
      this.velocities[i3 + 2] = this.windDirection.z * speed;

      this.ages[i] = Math.random() * this.maxAge;
    }
  }

  update(deltaTime: number) {
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      
      this.ages[i] += deltaTime;
      
      if (this.ages[i] > this.maxAge) {
        // Reset particle
        this.positions[i3] = (Math.random() - 0.5) * 0.5;
        this.positions[i3 + 1] = (Math.random() - 0.5) * 0.3;
        this.positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
        
        const speed = Math.random() * 2 + 1;
        this.velocities[i3] = this.windDirection.x * speed;
        this.velocities[i3 + 1] = this.windDirection.y * speed * 0.3;
        this.velocities[i3 + 2] = this.windDirection.z * speed;
        
        this.ages[i] = 0;
      }
      
      // Update position
      this.positions[i3] += this.velocities[i3] * deltaTime;
      this.positions[i3 + 1] += this.velocities[i3 + 1] * deltaTime;
      this.positions[i3 + 2] += this.velocities[i3 + 2] * deltaTime;
    }
    
    this.geometry.attributes.position.needsUpdate = true;
  }
}