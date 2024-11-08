// three-js-model.js
"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { VignetteShader } from "three/examples/jsm/shaders/VignetteShader";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass";
import { ColorCorrectionShader } from "three/examples/jsm/shaders/ColorCorrectionShader";

const ThreeDModelViewer = ({ vertices, faces, texture }) => {
  const mountRef = useRef(null);
  const isRotatingRef = useRef(true); // Use a ref for rotation state

  // State for Effects and Visual Options
  const [effect, setEffect] = useState("none");
  const [isWireframe, setIsWireframe] = useState(false);
  const [isRotating, setIsRotating] = useState(true); // State for rotation

  // Shader Controls for RGB Colors
  const [colorR, setColorR] = useState(1.0);
  const [colorG, setColorG] = useState(0.5);
  const [colorB, setColorB] = useState(0.5);

  // Lighting Controls
  const [ambientLightIntensity, setAmbientLightIntensity] = useState(0.5);
  const [pointLightIntensity, setPointLightIntensity] = useState(1);
  const [lightPosition, setLightPosition] = useState({ x: 10, y: 10, z: 10 });

  // Effect Controls State
  const [bloomStrength, setBloomStrength] = useState(1.5);
  const [bloomRadius, setBloomRadius] = useState(0.4);
  const [bloomThreshold, setBloomThreshold] = useState(0.85);
  const [vignetteDarkness, setVignetteDarkness] = useState(1.5);
  const [bokehFocus, setBokehFocus] = useState(1.0);
  const [bokehAperture, setBokehAperture] = useState(0.025);
  const [bokehMaxBlur, setBokehMaxBlur] = useState(1.0);
  const [exposure, setExposure] = useState(1.0);
  const [saturation, setSaturation] = useState(1.0);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const composerRef = useRef(null);
  const modelRef = useRef(null);
  const animationIdRef = useRef(null);
  const controlsRef = useRef(null);

  // References to post-processing passes
  const bloomPassRef = useRef(null);
  const vignettePassRef = useRef(null);
  const bokehPassRef = useRef(null);
  const colorCorrectionPassRef = useRef(null);

  // Resize Handler
  const handleWindowResize = () => {
    if (rendererRef.current && cameraRef.current && mountRef.current) {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      rendererRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      composerRef.current.setSize(width, height);
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222); // Dark gray background
    sceneRef.current = scene;

    // Camera Setup
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); // Set alpha to false for opaque background
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Check for WebGL2 support if needed
    const gl = renderer.getContext();
    if (!gl.getExtension("OES_element_index_uint")) {
      console.warn("OES_element_index_uint not supported. Using Uint16Array for indices.");
    }

    // Post-processing Composer Setup
    const composer = new EffectComposer(renderer);
    composerRef.current = composer;

    // Render Pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Initialize all post-processing passes
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      bloomStrength,
      bloomRadius,
      bloomThreshold
    );
    bloomPass.enabled = false; // Initially disabled
    composer.addPass(bloomPass);
    bloomPassRef.current = bloomPass;

    const vignettePass = new ShaderPass(VignetteShader);
    vignettePass.uniforms["darkness"].value = vignetteDarkness;
    vignettePass.enabled = false; // Initially disabled
    composer.addPass(vignettePass);
    vignettePassRef.current = vignettePass;

    const bokehPass = new BokehPass(scene, camera, {
      focus: bokehFocus,
      aperture: bokehAperture,
      maxblur: bokehMaxBlur,
    });
    bokehPass.enabled = false; // Initially disabled
    composer.addPass(bokehPass);
    bokehPassRef.current = bokehPass;

    const colorCorrectionPass = new ShaderPass(ColorCorrectionShader);
    colorCorrectionPass.uniforms["powRGB"].value.set(exposure, exposure, exposure);
    colorCorrectionPass.uniforms["mulRGB"].value.set(saturation, saturation, saturation);
    colorCorrectionPass.enabled = false; // Initially disabled
    composer.addPass(colorCorrectionPass);
    colorCorrectionPassRef.current = colorCorrectionPass;

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, ambientLightIntensity);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffaa00, pointLightIntensity, 100);
    pointLight.position.set(lightPosition.x, lightPosition.y, lightPosition.z);
    scene.add(pointLight);

    // OrbitControls Setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controlsRef.current = controls;

    // Material Setup
    let material;
    if (texture) {
      const textureLoader = new THREE.TextureLoader();
      const loadedTexture = textureLoader.load(`data:image/png;base64,${texture}`);
      material = new THREE.MeshStandardMaterial({
        map: loadedTexture,
        wireframe: isWireframe,
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorR, colorG, colorB),
        wireframe: isWireframe,
      });
    }

    // Model Setup
    const geometry = new THREE.BufferGeometry();
    const positionArray = new Float32Array(vertices);
    geometry.setAttribute("position", new THREE.BufferAttribute(positionArray, 3));

    // Use Uint16Array for indices to ensure compatibility
    let indexArray;
    try {
      indexArray = new Uint16Array(faces);
    } catch (error) {
      console.error("Error creating Uint16Array for indices:", error);
      indexArray = new Uint16Array([]);
    }

    geometry.setIndex(new THREE.BufferAttribute(indexArray, 1));

    const mesh = new THREE.Mesh(geometry, material);
    modelRef.current = mesh;
    scene.add(mesh);

    // Animation Loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (isRotatingRef.current && modelRef.current) {
        modelRef.current.rotation.x += 0.005;
        modelRef.current.rotation.y += 0.01;
      }

      controls.update(); // Update controls first
      composer.render();  // Then render the scene with post-processing
    };
    animate();

    // Event Listener for Window Resize
    window.addEventListener('resize', handleWindowResize);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      controls.dispose();
      composer.dispose();
      renderer.dispose();
      if (modelRef.current) {
        scene.remove(modelRef.current);
        modelRef.current.geometry.dispose();
        modelRef.current.material.dispose();
        modelRef.current = null;
      }
      window.removeEventListener('resize', handleWindowResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Geometry and Material when Props Change
  useEffect(() => {
    if (modelRef.current) {
      // Update geometry if vertices and faces are provided
      if (vertices.length > 0 && faces.length > 0) {
        const geometry = new THREE.BufferGeometry();
        const positionArray = new Float32Array(vertices);
        geometry.setAttribute("position", new THREE.BufferAttribute(positionArray, 3));

        // Ensure indices use Uint16Array
        let indexArray;
        try {
          indexArray = new Uint16Array(faces);
        } catch (error) {
          console.error("Error creating Uint16Array for indices:", error);
          indexArray = new Uint16Array([]);
        }

        geometry.setIndex(new THREE.BufferAttribute(indexArray, 1));

        modelRef.current.geometry.dispose(); // Clean up previous geometry
        modelRef.current.geometry = geometry;
      }

      // Update material properties directly
      const material = modelRef.current.material;
      material.wireframe = isWireframe;
      material.color.setRGB(colorR, colorG, colorB);
      if (texture) {
        const textureLoader = new THREE.TextureLoader();
        const loadedTexture = textureLoader.load(`data:image/png;base64,${texture}`);
        material.map = loadedTexture;
      } else {
        material.map = null;
      }
      material.needsUpdate = true;
    }

    // Update lighting
    if (sceneRef.current) {
      const ambientLight = sceneRef.current.children.find(
        (child) => child instanceof THREE.AmbientLight
      );
      if (ambientLight) ambientLight.intensity = ambientLightIntensity;

      const pointLight = sceneRef.current.children.find(
        (child) => child instanceof THREE.PointLight
      );
      if (pointLight) {
        pointLight.intensity = pointLightIntensity;
        pointLight.position.set(lightPosition.x, lightPosition.y, lightPosition.z);
      }
    }
  }, [
    vertices,
    faces,
    texture,
    isWireframe,
    colorR,
    colorG,
    colorB,
    ambientLightIntensity,
    pointLightIntensity,
    lightPosition,
  ]);

  // Update Post-processing Effects when Effect State Changes
  useEffect(() => {
    if (!composerRef.current) return;

    const composer = composerRef.current;

    // Disable all effect passes initially
    if (bloomPassRef.current) bloomPassRef.current.enabled = false;
    if (vignettePassRef.current) vignettePassRef.current.enabled = false;
    if (bokehPassRef.current) bokehPassRef.current.enabled = false;
    if (colorCorrectionPassRef.current) colorCorrectionPassRef.current.enabled = false;

    // Enable the selected effect pass
    if (effect === "bloom" && bloomPassRef.current) {
      bloomPassRef.current.enabled = true;
    }

    if (effect === "vignette" && vignettePassRef.current) {
      vignettePassRef.current.enabled = true;
    }

    if (effect === "bokeh" && bokehPassRef.current) {
      bokehPassRef.current.enabled = true;
    }

    // Always enable ColorCorrectionPass
    if (colorCorrectionPassRef.current) {
      colorCorrectionPassRef.current.enabled = true;
    }
  }, [
    effect,
    bloomStrength,
    bloomRadius,
    bloomThreshold,
    vignetteDarkness,
    bokehFocus,
    bokehAperture,
    bokehMaxBlur,
    exposure,
    saturation,
  ]);

  // Update Bloom Pass Parameters
  useEffect(() => {
    if (bloomPassRef.current) {
      bloomPassRef.current.strength = bloomStrength;
      bloomPassRef.current.radius = bloomRadius;
      bloomPassRef.current.threshold = bloomThreshold;
    }
  }, [bloomStrength, bloomRadius, bloomThreshold]);

  // Update Vignette Pass Parameters
  useEffect(() => {
    if (vignettePassRef.current) {
      vignettePassRef.current.uniforms["darkness"].value = vignetteDarkness;
    }
  }, [vignetteDarkness]);

  // Update Bokeh Pass Parameters
  useEffect(() => {
    if (bokehPassRef.current) {
      bokehPassRef.current.uniforms["focus"].value = bokehFocus;
      bokehPassRef.current.uniforms["aperture"].value = bokehAperture;
      bokehPassRef.current.uniforms["maxblur"].value = bokehMaxBlur;
    }
  }, [bokehFocus, bokehAperture, bokehMaxBlur]);

  // Update Color Correction Pass Parameters
  useEffect(() => {
    if (colorCorrectionPassRef.current) {
      colorCorrectionPassRef.current.uniforms["powRGB"].value.set(exposure, exposure, exposure);
      colorCorrectionPassRef.current.uniforms["mulRGB"].value.set(saturation, saturation, saturation);
    }
  }, [exposure, saturation]);

  const toggleRotation = (e) => {
    e.preventDefault();
    isRotatingRef.current = !isRotatingRef.current; // Toggle the ref state
    setIsRotating(!isRotating); // Update the state for the button text
  };

  return (
    <div className="flex flex-col items-center bg-gray-900 p-6 rounded-lg shadow-lg mt-6">
      <div
        ref={mountRef}
        style={{ width: "100%", height: "500px" }}
        className="rounded-lg overflow-hidden"
      />

      <div className="mt-6 w-full max-w-md space-y-4">
        {/* Dropdown for Effects */}
        <div>
          <label className="block text-white mb-2">Select Effect</label>
          <select
            value={effect}
            onChange={(e) => setEffect(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            <option value="none">None</option>
            <option value="bloom">Bloom</option>
            <option value="vignette">Vignette</option>
            <option value="bokeh">Bokeh</option>
          </select>
        </div>

        {/* RGB Color Controls */}
        <div className="flex space-x-4">
          <div>
            <label className="block text-white mb-2">Red</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={colorR}
              onChange={(e) => setColorR(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-white mb-2">Green</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={colorG}
              onChange={(e) => setColorG(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-white mb-2">Blue</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={colorB}
              onChange={(e) => setColorB(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Effect-Specific Controls */}
        {effect === "bloom" && (
          <div className="space-y-4">
            <label className="block text-white">Bloom Strength</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={bloomStrength}
              onChange={(e) => setBloomStrength(parseFloat(e.target.value))}
              className="w-full"
            />
            <label className="block text-white">Bloom Radius</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={bloomRadius}
              onChange={(e) => setBloomRadius(parseFloat(e.target.value))}
              className="w-full"
            />
            <label className="block text-white">Bloom Threshold</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.01"
              value={bloomThreshold}
              onChange={(e) => setBloomThreshold(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {effect === "vignette" && (
          <div>
            <label className="block text-white">Vignette Darkness</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={vignetteDarkness}
              onChange={(e) => setVignetteDarkness(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {effect === "bokeh" && (
          <div className="space-y-4">
            <label className="block text-white">Bokeh Focus</label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={bokehFocus}
              onChange={(e) => setBokehFocus(parseFloat(e.target.value))}
              className="w-full"
            />
            <label className="block text-white">Bokeh Aperture</label>
            <input
              type="range"
              min="0.001"
              max="0.1"
              step="0.001"
              value={bokehAperture}
              onChange={(e) => setBokehAperture(parseFloat(e.target.value))}
              className="w-full"
            />
            <label className="block text-white">Bokeh Max Blur</label>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={bokehMaxBlur}
              onChange={(e) => setBokehMaxBlur(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {/* Exposure and Saturation Controls */}
        <div className="space-y-4">
          <label className="block text-white">Exposure</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={exposure}
            onChange={(e) => setExposure(parseFloat(e.target.value))}
            className="w-full"
          />
          <label className="block text-white">Saturation</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={saturation}
            onChange={(e) => setSaturation(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Toggle for Wireframe */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isWireframe}
            onChange={(e) => setIsWireframe(e.target.checked)}
            className="mr-2"
          />
          <label className="text-white">Show as Wireframe</label>
        </div>

        {/* Toggle for Rotation */}
        <div>
          <button
            className="w-full py-2 px-4 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none"
            onClick={toggleRotation}
          >
            {isRotating ? "Stop Rotation" : "Start Rotation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreeDModelViewer;
