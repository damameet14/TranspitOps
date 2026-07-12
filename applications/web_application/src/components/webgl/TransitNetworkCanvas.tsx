import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { getResolvedMotionLevel } from '../../animation/reducedMotion';
import WebGLFallback from './WebGLFallback';

export default function TransitNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const level = getResolvedMotionLevel();
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (level !== 'full' || !canvasRef.current || !containerRef.current) {
      setUseFallback(true);
      return;
    }

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let animationFrameId: number | null = null;

    let width = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
      camera.position.z = 25;

      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

      const isDarkMode = document.documentElement.getAttribute('data-mode') === 'dark';
      const accentColor = isDarkMode ? 0x5b87be : 0xc13b2e;

      const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
      const activeLineMaterial = new THREE.LineBasicMaterial({ color: accentColor, linewidth: 1.5 });
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3a3a37, linewidth: 1 });

      const nodeCount = window.innerWidth > 1024 ? 75 : 40;
      const nodes: THREE.Vector3[] = [];
      const meshes: THREE.Mesh[] = [];

      const boxGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);

      for (let i = 0; i < nodeCount; i++) {
        const x = (Math.random() - 0.5) * 32;
        const y = (Math.random() - 0.5) * 14;
        const z = (Math.random() - 0.5) * 6;
        const pos = new THREE.Vector3(x, y, z);
        nodes.push(pos);

        const mesh = new THREE.Mesh(boxGeo, nodeMaterial);
        mesh.position.copy(pos);
        scene.add(mesh);
        meshes.push(mesh);
      }

      const linePositions: number[] = [];
      const connectedCount = 30;
      for (let i = 0; i < connectedCount; i++) {
        const idxA = Math.floor(Math.random() * nodeCount);
        let idxB = Math.floor(Math.random() * nodeCount);
        while (idxB === idxA) idxB = Math.floor(Math.random() * nodeCount);

        const posA = nodes[idxA];
        const posB = nodes[idxB];
        
        linePositions.push(posA.x, posA.y, posA.z);
        linePositions.push(posB.x, posB.y, posB.z);
      }

      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      const linesMesh = new THREE.LineSegments(lineGeo, lineMaterial);
      scene.add(linesMesh);

      const activeLinePositions: number[] = [];
      const routeIndices = [0, 6, 15, 22, 31].map(idx => idx % nodeCount);
      routeIndices.forEach(idx => {
        const pos = nodes[idx];
        activeLinePositions.push(pos.x, pos.y, pos.z);
      });

      const activeLineGeo = new THREE.BufferGeometry();
      activeLineGeo.setAttribute('position', new THREE.Float32BufferAttribute(activeLinePositions, 3));
      const activeLineMesh = new THREE.Line(activeLineGeo, activeLineMaterial);
      scene.add(activeLineMesh);

      let mouseX = 0;
      let mouseY = 0;
      let targetMouseX = 0;
      let targetMouseY = 0;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        targetMouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        targetMouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      };
      window.addEventListener('mousemove', handleMouseMove);

      let isVisible = true;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
        });
      }, { threshold: 0.05 });
      observer.observe(containerRef.current);

      const animate = () => {
        if (!renderer || !scene || !camera) return;
        animationFrameId = requestAnimationFrame(animate);

        if (!isVisible || document.hidden) return;

        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        scene.rotation.y = mouseX * 0.06;
        scene.rotation.x = -mouseY * 0.03;

        const time = Date.now() * 0.0005;
        meshes.forEach((mesh, index) => {
          mesh.position.y = nodes[index].y + Math.sin(time + index) * 0.12;
          mesh.position.x = nodes[index].x + Math.cos(time + index) * 0.08;
        });

        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!containerRef.current || !renderer || !camera) return;
        width = containerRef.current.clientWidth;
        height = containerRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        observer.disconnect();

        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        boxGeo.dispose();
        lineGeo.dispose();
        activeLineGeo.dispose();
        nodeMaterial.dispose();
        lineMaterial.dispose();
        activeLineMaterial.dispose();

        if (renderer) {
          renderer.dispose();
        }
      };
    } catch (err) {
      console.warn('WebGL rendering is failed, loading SVG fallback:', err);
      setUseFallback(true);
    }
  }, [level]);

  if (useFallback) {
    return <WebGLFallback />;
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', pointerEvents: 'none' }} />
    </div>
  );
}
