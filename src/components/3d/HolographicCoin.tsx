'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface HolographicCoinProps {
  symbol?: 'BTC' | 'ETH' | 'SOL';
  size?: number; // pixel width/height (default 180)
  interactive?: boolean; // tilt with mouse
  className?: string;
  showRings?: boolean;
}

export const HolographicCoin: React.FC<HolographicCoinProps> = ({
  symbol = 'BTC',
  size = 180,
  interactive = true,
  className = '',
  showRings = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.2;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(size, size);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL initialization failed, falling back to 2D view', e);
      setHasWebGL(false);
      return;
    }

    // 2. Main Coin Mesh Group
    const coinGroup = new THREE.Group();
    scene.add(coinGroup);

    // Color definitions based on symbol
    let primaryColor = 0xf59e0b; // BTC Amber/Gold
    let rimColor = 0xfbbf24;
    let particleColor = 0xfcd34d;

    if (symbol === 'ETH') {
      primaryColor = 0x60a5fa; // ETH Cyan/Blue
      rimColor = 0xa78bfa; // Purple rim
      particleColor = 0x93c5fd;
    } else if (symbol === 'SOL') {
      primaryColor = 0x14f195; // SOL Emerald
      rimColor = 0x9945ff; // SOL Purple
      particleColor = 0x2dd4bf;
    }

    // Primary Coin Geometry
    let mainMesh: THREE.Mesh;

    if (symbol === 'ETH') {
      // Octahedron geometry for Ethereum diamond
      const octaGeometry = new THREE.OctahedronGeometry(1.2, 0);
      const octaMaterial = new THREE.MeshPhysicalMaterial({
        color: primaryColor,
        metalness: 0.6,
        roughness: 0.2,
        transmission: 0.4, // glass / crystal feel
        thickness: 0.8,
        reflectivity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      });
      mainMesh = new THREE.Mesh(octaGeometry, octaMaterial);
      coinGroup.add(mainMesh);
    } else {
      // Cylinder for Bitcoin / Solana coin
      const coinGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.22, 48);
      const coinMaterial = new THREE.MeshStandardMaterial({
        color: primaryColor,
        metalness: 0.85,
        roughness: 0.25,
      });
      mainMesh = new THREE.Mesh(coinGeometry, coinMaterial);
      mainMesh.rotation.x = Math.PI / 2; // face forward
      coinGroup.add(mainMesh);

      // Inner Ridge Ring
      const rimGeometry = new THREE.TorusGeometry(1.05, 0.04, 16, 48);
      const rimMaterial = new THREE.MeshStandardMaterial({
        color: rimColor,
        metalness: 0.95,
        roughness: 0.15,
      });
      const rim1 = new THREE.Mesh(rimGeometry, rimMaterial);
      rim1.position.z = 0.115;
      coinGroup.add(rim1);

      const rim2 = new THREE.Mesh(rimGeometry, rimMaterial);
      rim2.position.z = -0.115;
      coinGroup.add(rim2);
    }

    // Holographic Orbital Rings
    let ringMesh: THREE.Mesh | null = null;
    if (showRings) {
      const ringGeo = new THREE.TorusGeometry(1.7, 0.015, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: rimColor,
        transparent: true,
        opacity: 0.35,
        wireframe: true,
      });
      ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 3;
      scene.add(ringMesh);
    }

    // Particle Dust System
    const particleCount = 45;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 1.6 + Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      particlePositions[i] = radius * Math.cos(theta) * Math.cos(phi);
      particlePositions[i + 1] = radius * Math.sin(phi);
      particlePositions[i + 2] = radius * Math.sin(theta) * Math.cos(phi);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: particleColor,
      size: 0.04,
      transparent: true,
      opacity: 0.65,
    });
    const particlePoints = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particlePoints);

    // 3. Dynamic Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(3, 4, 4);
    scene.add(dirLight1);

    const pointLight = new THREE.PointLight(rimColor, 3.5, 8);
    pointLight.position.set(-2, -2, 2);
    scene.add(pointLight);

    // 4. Mouse Interactive Tracking
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive || !container) return;
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

      targetRotationY = mouseX * 0.5;
      targetRotationX = -mouseY * 0.4;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // 5. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous gentle spin & float
      coinGroup.rotation.y += 0.015;
      coinGroup.position.y = Math.sin(elapsedTime * 2) * 0.08;

      // Mouse interactive tilt interpolation
      if (interactive) {
        coinGroup.rotation.x += (targetRotationX - coinGroup.rotation.x) * 0.06;
        coinGroup.rotation.z += (targetRotationY * 0.5 - coinGroup.rotation.z) * 0.06;
      }

      // Orbital ring counter-spin
      if (ringMesh) {
        ringMesh.rotation.z -= 0.008;
        ringMesh.rotation.y += 0.005;
      }

      // Particle orbit rotation
      particlePoints.rotation.y += 0.004;

      renderer.render(scene, camera);
    };

    animate();

    // 6. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [symbol, size, interactive, showRings]);

  if (!hasWebGL) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-primary/20 border border-amber-500/30 text-white font-bold text-2xl ${className}`}
      >
        {symbol}
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none ${className}`}
    />
  );
};
