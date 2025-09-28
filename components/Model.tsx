import * as THREE from 'three';
import { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import gsap from 'gsap';


function DynamicTextPlane({ name = "dev", nameColor = "#f00", textColor = "#fff" }) {
    const meshRef = useRef<THREE.Mesh>(null);

    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const taglines = [
            `🏁 Mercury was captured by @ ${name} — the leaderboard war rages on! 🔥`,
            `🏁 Mercury falls to @ ${name} — who's next in this leaderboard clash?⚡️`,
            `🏁 Mercury is now under @ ${name} 's control — leaderboard domination begins! ⚔️`,
            `🏁 ${name} just snatched Mercury — leaderboard shaken! 🌪`,
            `🏁 Mercury captured! @ ${name} is rewriting the leaderboard! 🪶`,
            `🏁 Mercury is no longer safe — @ ${name} is on a rampage! 💣`,
        ];


        const fullText = taglines[Math.floor(Math.random() * taglines.length)];

        ctx.font = 'bold 36px sans-serif';

        const maxWidth = canvas.width - 100;
        let y = 130;
        let x = 50;

        let line = '';
        y = 130;
        x = 50;

        for (let i = 0; i < fullText.split(' ').length; i++) {
            const word = fullText.split(' ')[i];
            const testLine = line + word + ' ';
            const testWidth = ctx.measureText(testLine).width;

            if (testWidth > maxWidth && line.length > 0) {
                let lineX = x;
                const lineWords = line.trim().split(' ');

                for (const w of lineWords) {
                    const wWidth = ctx.measureText(w + ' ').width;
                    ctx.fillStyle = (w === name) ? nameColor : textColor;
                    ctx.fillText(w + ' ', lineX, y);
                    lineX += wWidth;
                }
                line = word + ' ';
                y += 50;
            } else {
                line = testLine;
            }
        }

        let lineX = x;
        const lineWords = line.trim().split(' ');
        for (const w of lineWords) {
            const wWidth = ctx.measureText(w + ' ').width;
            ctx.fillStyle = (w === name) ? nameColor : textColor;
            ctx.fillText(w + ' ', lineX, y);
            lineX += wWidth;
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }, [name, nameColor, textColor]);

    // GSAP animation for bobbing effect
    useEffect(() => {
        if (!meshRef.current) return;
        const mesh = meshRef.current;

        // Vertical bobbing animation - y position oscillates smoothly
        gsap.to(mesh.position, {
            y: "+=0.5",
            duration: 2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
        });

        // Slight rotation oscillation for subtle movement
        gsap.to(mesh.rotation, {
            z: 0.05,
            duration: 3,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
        });
    }, []);

    useFrame(({ camera }) => {
        if (meshRef.current) {
            meshRef.current.lookAt(camera.position);
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 8, 0]}>
            <planeGeometry args={[16, 4]} />
            <meshBasicMaterial map={texture} transparent />
        </mesh>
    );
}


function SpaceModel() {
    const { scene, animations } = useGLTF('/models/robot.glb');
    const { actions } = useAnimations(animations, scene);
    const actionRef = useRef<any>(null);
    const modelRef = useRef<THREE.Group>(null);

    useEffect(() => {
        if (actions && animations.length) {
            actionRef.current = actions[animations[0].name];
            actionRef.current.play();
        }
        return () => {
            actionRef.current?.stop();
        };
    }, [actions, animations]);

    useEffect(() => {
        if (!modelRef.current) return;
        const model = modelRef.current;

        // Scale animation from 0 to 4 smoothly
        gsap.fromTo(model.scale, { x: 0, y: 0, z: 0 }, { x: 4, y: 4, z: 4, duration: 1, ease: "elastic.out(1, 0.5)" });

        // Rotate back and forth around y axis
        gsap.to(model.rotation, {
            y: "+=0.3",
            duration: 4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
        });
    }, []);

    useFrame(({ clock }) => {
        if (scene) {
            scene.rotation.y = clock.getElapsedTime() * 0.2;
        }
    });

    return (
        <primitive
            ref={modelRef}
            object={scene}
            scale={4}
            position={[0, -5, 0]}
            castShadow
            receiveShadow
        />
    );
}

export default function SceneWithCanvasTextAndModel({ name = '' }) {
    return (
        <div className="w-full h-screen">
            <Canvas camera={{ position: [0, 0, 30], fov: 50 }} shadows>
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 10]} intensity={2} castShadow />
                <pointLight position={[-10, 5, -10]} intensity={2} />

                <OrbitControls enableZoom={true} enablePan={false} />

                <Suspense fallback={null}>
                    <DynamicTextPlane name={name.toUpperCase()} nameColor='#D500D2' />
                    <SpaceModel />
                </Suspense>
            </Canvas>
        </div>
    );
}
