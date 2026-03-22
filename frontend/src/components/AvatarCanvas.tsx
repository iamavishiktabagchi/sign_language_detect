"use client";
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF, useAnimations } from '@react-three/drei';

// This is a placeholder component for the actual Avatar.
// In production, we would pass an animation sequence ID prop here to trigger the mixer.
function AvatarModel({ url, currentAnimation }: { url: string, currentAnimation?: string }) {
  const { scene, animations } = useGLTF(url);
  const { actions, mixer } = useAnimations(animations, scene);

  React.useEffect(() => {
    if (actions) {
        Object.values(actions).forEach(action => action?.stop());
        
        let animToPlay = null;
        if (currentAnimation && actions[currentAnimation]) {
            animToPlay = actions[currentAnimation];
        } else {
            animToPlay = actions['agree'] || actions['idle'] || actions[Object.keys(actions)[0]];
        }
        
        if (animToPlay) {
           animToPlay.reset().fadeIn(0.5).play();
        }
    }
  }, [actions, currentAnimation]);

  // Adjusting position, rotation, and scale specifically for realistically proportioned GLBs
  return <primitive object={scene} scale={[1.8, 1.8, 1.8]} position={[0, -2.5, 0]} rotation={[0, -Math.PI / 8, 0]} />;
}

// Fallback mesh if the model doesn't exist
function AvatarFallback() {
    return (
        <group position={[0, -0.5, 0]}>
            <mesh position={[0, 1.5, 0]}>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial color="#94a3b8" />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.6, 0.6, 1.2, 32]} />
                <meshStandardMaterial color="#cbd5e1" />
            </mesh>
        </group>
    );
}

export default function AvatarCanvas({ currentAnimation }: { currentAnimation?: string }) {
  return (
    <div className="w-full h-full absolute inset-0 z-10">
      <Canvas shadows camera={{ position: [0, 0, 3], fov: 45 }}>
        <color attach="background" args={['transparent']} />
        
        {/* Enterprise Studio Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight 
           position={[2, 5, 2]} 
           intensity={1.2} 
           castShadow 
           shadow-mapSize={1024}
        />
        <spotLight position={[-2, 2, 2]} intensity={0.5} angle={0.3} penumbra={1} />
        <Environment preset="city" />

        <Suspense fallback={<AvatarFallback />}>
          {/* Real 3D Humanoid Avatar from local expressive humanoid */}
          <AvatarModel url="/avatar.glb" currentAnimation={currentAnimation} />
        </Suspense>

        {/* Soft ground shadow for grounded aesthetics */}
        <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.4} far={10} color="#334155" />
        
        {/* Controls to let user orbit the avatar slightly */}
        <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            minPolarAngle={Math.PI / 2.5} 
            maxPolarAngle={Math.PI / 2} 
            minAzimuthAngle={-Math.PI / 4}
            maxAzimuthAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
