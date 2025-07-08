import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useBox, usePlane, Physics } from '@react-three/cannon';
import { Cylinder, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { animated, useSpring } from '@react-spring/three';

interface CoinProps {
  position: [number, number, number];
  rotation: [number, number, number];
  velocity: [number, number, number];
  angularVelocity: [number, number, number];
  onSettle: (result: 'heads' | 'tails') => void;
  coinIndex: number;
}

const Coin: React.FC<CoinProps> = ({ 
  position, 
  rotation, 
  velocity, 
  angularVelocity, 
  onSettle, 
  coinIndex 
}) => {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    rotation,
    args: [0.8, 0.8, 0.1], // Coin dimensions
    material: {
      friction: 0.4,
      restitution: 0.6,
    },
  }));

  const [settled, setSettled] = useState(false);
  const [finalRotation, setFinalRotation] = useState<THREE.Euler | null>(null);
  const settleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Apply initial forces
  useEffect(() => {
    api.velocity.set(...velocity);
    api.angularVelocity.set(...angularVelocity);
  }, [api, velocity, angularVelocity]);

  // Monitor coin settling
  useEffect(() => {
    let velocitySubscription: () => void;
    let angularVelocitySubscription: () => void;
    
    const checkSettled = () => {
      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current);
      }
      
      settleTimeoutRef.current = setTimeout(() => {
        if (!settled) {
          setSettled(true);
          
          // Get final rotation to determine heads/tails
          api.rotation.subscribe((rotation) => {
            const euler = new THREE.Euler(...rotation);
            setFinalRotation(euler);
            
            // Determine heads or tails based on Z rotation
            const normalizedZ = ((euler.z % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            const isHeads = normalizedZ < Math.PI;
            
            onSettle(isHeads ? 'heads' : 'tails');
          });
        }
      }, 100);
    };

    velocitySubscription = api.velocity.subscribe((vel) => {
      if (Math.abs(vel[0]) < 0.1 && Math.abs(vel[1]) < 0.1 && Math.abs(vel[2]) < 0.1) {
        checkSettled();
      }
    });

    angularVelocitySubscription = api.angularVelocity.subscribe((angVel) => {
      if (Math.abs(angVel[0]) < 0.1 && Math.abs(angVel[1]) < 0.1 && Math.abs(angVel[2]) < 0.1) {
        checkSettled();
      }
    });

    return () => {
      if (velocitySubscription) velocitySubscription();
      if (angularVelocitySubscription) angularVelocitySubscription();
      if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
    };
  }, [api, settled, onSettle]);

  // Coin appearance animation
  const { scale } = useSpring({
    scale: settled ? 1 : 1.2,
    config: { tension: 200, friction: 20 }
  });

  return (
    <animated.mesh ref={ref} scale={scale}>
      <Cylinder args={[0.4, 0.4, 0.05, 32]}>
        <meshStandardMaterial
          color={settled ? (finalRotation && finalRotation.z < Math.PI ? '#gold' : '#silver') : '#bronze'}
          metalness={0.8}
          roughness={0.2}
        />
      </Cylinder>
      {/* Coin face details */}
      <mesh position={[0, 0, 0.026]}>
        <cylinderGeometry args={[0.35, 0.35, 0.001, 32]} />
        <meshStandardMaterial
          color={settled ? '#gold' : '#bronze'}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0, 0, -0.026]}>
        <cylinderGeometry args={[0.35, 0.35, 0.001, 32]} />
        <meshStandardMaterial
          color={settled ? '#silver' : '#bronze'}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </animated.mesh>
  );
};

const Ground: React.FC = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -2, 0],
    material: {
      friction: 0.8,
      restitution: 0.3,
    },
  }));

  return (
    <mesh ref={ref}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial
        color="#2d3748"
        transparent
        opacity={0.1}
      />
    </mesh>
  );
};

const Lighting: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        castShadow
      />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
    </>
  );
};

const ParticleSystem: React.FC<{ active: boolean }> = ({ active }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const { scene } = useThree();

  useEffect(() => {
    if (!active) return;

    const particleCount = 50;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 2;
      positions[i3 + 1] = Math.random() * 2;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;
      
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = Math.random() * 0.01;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: '#gold',
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    return () => {
      scene.remove(particleSystem);
    };
  }, [active, scene]);

  return null;
};

interface ThreeCoinEngineProps {
  isActive: boolean;
  onAllCoinsSettled: (results: ('heads' | 'tails')[]) => void;
  onAnimationComplete: () => void;
}

const ThreeCoinEngine: React.FC<ThreeCoinEngineProps> = ({
  isActive,
  onAllCoinsSettled,
  onAnimationComplete,
}) => {
  const [coinResults, setCoinResults] = useState<('heads' | 'tails')[]>([]);
  const [showParticles, setShowParticles] = useState(false);

  const handleCoinSettle = useCallback((result: 'heads' | 'tails', index: number) => {
    setCoinResults(prev => {
      const newResults = [...prev];
      newResults[index] = result;
      return newResults;
    });
  }, []);

  useEffect(() => {
    if (coinResults.length === 3 && coinResults.every(result => result)) {
      onAllCoinsSettled(coinResults);
      setTimeout(() => {
        onAnimationComplete();
      }, 1000);
    }
  }, [coinResults, onAllCoinsSettled, onAnimationComplete]);

  useEffect(() => {
    if (isActive) {
      setCoinResults([]);
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 2000);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <Canvas
      style={{ width: '100%', height: '400px' }}
      camera={{ position: [0, 2, 5], fov: 50 }}
      shadows
    >
      <Physics gravity={[0, -9.8, 0]}>
        <Ground />
        
        {/* Three coins with different starting positions and forces */}
        <Coin
          position={[-1, 5, 0]}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
          velocity={[
            (Math.random() - 0.5) * 4,
            Math.random() * 2 + 1,
            (Math.random() - 0.5) * 4
          ]}
          angularVelocity={[
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ]}
          onSettle={(result) => handleCoinSettle(result, 0)}
          coinIndex={0}
        />
        
        <Coin
          position={[0, 5, 0]}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
          velocity={[
            (Math.random() - 0.5) * 4,
            Math.random() * 2 + 1,
            (Math.random() - 0.5) * 4
          ]}
          angularVelocity={[
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ]}
          onSettle={(result) => handleCoinSettle(result, 1)}
          coinIndex={1}
        />
        
        <Coin
          position={[1, 5, 0]}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
          velocity={[
            (Math.random() - 0.5) * 4,
            Math.random() * 2 + 1,
            (Math.random() - 0.5) * 4
          ]}
          angularVelocity={[
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ]}
          onSettle={(result) => handleCoinSettle(result, 2)}
          coinIndex={2}
        />
      </Physics>

      <Lighting />
      <ParticleSystem active={showParticles} />
      <ContactShadows
        position={[0, -1.99, 0]}
        opacity={0.4}
        scale={10}
        blur={1.5}
      />
      <Environment preset="city" />
    </Canvas>
  );
};

export default ThreeCoinEngine;