import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';

const Car3DSimulation = () => {
  // React state for UI
  const [gameState, setGameState] = useState({
    speed: 0,
    rpm: 800,
    gear: 1,
    score: 0,
    gameOver: false,
    started: false,
    fuel: 100
  });

  // Refs for Three.js objects and game loop
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const carRef = useRef(null);
  const terrainRef = useRef(null);
  const gameLoopRef = useRef(null);
  const keysRef = useRef({});
  
  // Game configuration
  const CONFIG = {
    WORLD_SIZE: 2000,
    TERRAIN_SEGMENTS: 128,
    CAR_MAX_SPEED: 200,
    GRAVITY: -50,
    FRICTION: 0.95,
    AIR_RESISTANCE: 0.98
  };

  // Car physics state stored in ref for performance
  const carPhysicsRef = useRef({
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    angularVelocity: 0,
    speed: 0,
    rpm: 800,
    gear: 1,
    throttle: 0,
    steering: 0,
    onGround: true,
    engineTemp: 90,
    fuel: 100
  });

  /**
   * Initialize Three.js scene with lighting, camera, and environment
   */
  const initThreeJS = useCallback(() => {
    if (!mountRef.current) return;

    // ===== SCENE SETUP =====
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 500, 2000); // Distance fog for realism
    
    // ===== CAMERA SETUP =====
    const camera = new THREE.PerspectiveCamera(
      75, // Field of view
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 15, 30); // Third-person view behind car
    
    // ===== RENDERER SETUP =====
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x87CEEB); // Sky blue background
    mountRef.current.appendChild(renderer.domElement);
    
    // ===== LIGHTING SYSTEM =====
    
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    // Directional light (sun) with shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(500, 1000, 300);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 2000;
    directionalLight.shadow.camera.left = -1000;
    directionalLight.shadow.camera.right = 1000;
    directionalLight.shadow.camera.top = 1000;
    directionalLight.shadow.camera.bottom = -1000;
    scene.add(directionalLight);
    
    // Additional fill light
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
    fillLight.position.set(-500, 300, -500);
    scene.add(fillLight);
    
    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    
    return { scene, renderer, camera };
  }, []);

  /**
   * Create realistic terrain with hills, valleys, and textures
   */
  const createTerrain = useCallback((scene) => {
    const geometry = new THREE.PlaneGeometry(
      CONFIG.WORLD_SIZE, 
      CONFIG.WORLD_SIZE, 
      CONFIG.TERRAIN_SEGMENTS, 
      CONFIG.TERRAIN_SEGMENTS
    );
    
    // Generate height map for realistic terrain
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 1];
      
      // Create hills and valleys using noise functions
      let height = 0;
      
      // Large hills
      height += Math.sin(x * 0.01) * Math.cos(z * 0.01) * 30;
      
      // Medium details
      height += Math.sin(x * 0.03) * Math.cos(z * 0.02) * 15;
      
      // Small details
      height += Math.sin(x * 0.05) * Math.cos(z * 0.05) * 5;
      
      // Add some randomness
      height += (Math.random() - 0.5) * 3;
      
      vertices[i + 2] = height; // Set Y (height) coordinate
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals(); // Recalculate normals for lighting
    
    // Create terrain material with realistic colors
    const material = new THREE.MeshLambertMaterial({
      color: 0x4a7c59,
      wireframe: false
    });
    
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    terrain.receiveShadow = true;
    scene.add(terrain);
    
    terrainRef.current = terrain;
    return terrain;
  }, []);

  /**
   * Create the player's car with detailed geometry
   */
  const createCar = useCallback((scene) => {
    const carGroup = new THREE.Group();
    
    // ===== CAR BODY =====
    const bodyGeometry = new THREE.BoxGeometry(4, 1.5, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x0066cc,
      shininess: 100 
    });
    const carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    carBody.position.y = 1;
    carBody.castShadow = true;
    carGroup.add(carBody);
    
    // ===== CAR CABIN =====
    const cabinGeometry = new THREE.BoxGeometry(3, 1.2, 4);
    const cabinMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x003d82,
      transparent: true,
      opacity: 0.8 
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 2, -1);
    cabin.castShadow = true;
    carGroup.add(cabin);
    
    // ===== WHEELS =====
    const wheelGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 12);
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    
    // Create 4 wheels
    const wheelPositions = [
      { x: -1.8, z: 2.5 },  // Front left
      { x: 1.8, z: 2.5 },   // Front right
      { x: -1.8, z: -2.5 }, // Rear left
      { x: 1.8, z: -2.5 }   // Rear right
    ];
    
    const wheels = [];
    wheelPositions.forEach((pos, index) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(pos.x, 0.8, pos.z);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      carGroup.add(wheel);
      wheels.push(wheel);
    });
    
    // ===== HEADLIGHTS =====
    const headlightGeometry = new THREE.SphereGeometry(0.3, 8, 6);
    const headlightMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffaa,
      emissive: 0x444422 
    });
    
    // Front headlights
    [-1, 1].forEach(side => {
      const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
      headlight.position.set(side * 1.5, 1.2, 3.8);
      carGroup.add(headlight);
    });
    
    carGroup.position.y = 2;
    carGroup.castShadow = true;
    scene.add(carGroup);
    
    // Store wheel references for animation
    carGroup.wheels = wheels;
    carRef.current = carGroup;
    
    return carGroup;
  }, []);

  /**
   * Create environmental elements like trees, rocks, buildings
   */
  const createEnvironment = useCallback((scene) => {
    // ===== TREES =====
    const createTree = (x, z) => {
      const treeGroup = new THREE.Group();
      
      // Tree trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 8);
      const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = 4;
      trunk.castShadow = true;
      treeGroup.add(trunk);
      
      // Tree foliage
      const foliageGeometry = new THREE.SphereGeometry(4, 8, 6);
      const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.y = 10;
      foliage.castShadow = true;
      treeGroup.add(foliage);
      
      treeGroup.position.set(x, getTerrainHeight(x, z), z);
      return treeGroup;
    };
    
    // ===== ROCKS =====
    const createRock = (x, z) => {
      const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 3 + 1);
      const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(x, getTerrainHeight(x, z) + 1, z);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      return rock;
    };
    
    // ===== BUILDINGS =====
    const createBuilding = (x, z) => {
      const buildingGroup = new THREE.Group();
      const height = 20 + Math.random() * 40;
      
      // Building base
      const buildingGeometry = new THREE.BoxGeometry(15, height, 15);
      const buildingMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.5, 0.3, 0.6) 
      });
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      building.position.y = height / 2;
      building.castShadow = true;
      buildingGroup.add(building);
      
      // Building windows
      for (let floor = 0; floor < height / 4; floor++) {
        for (let window = 0; window < 3; window++) {
          const windowGeometry = new THREE.BoxGeometry(1, 1, 0.1);
          const windowMaterial = new THREE.MeshPhongMaterial({ 
            color: Math.random() > 0.3 ? 0xffffaa : 0x333333,
            emissive: Math.random() > 0.7 ? 0x444422 : 0x000000
          });
          const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
          windowMesh.position.set((window - 1) * 4, floor * 4 + 2, 7.6);
          buildingGroup.add(windowMesh);
        }
      }
      
      buildingGroup.position.set(x, getTerrainHeight(x, z), z);
      return buildingGroup;
    };
    
    // Populate environment
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 200 + Math.random() * 800;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      const rand = Math.random();
      if (rand < 0.6) {
        scene.add(createTree(x, z));
      } else if (rand < 0.8) {
        scene.add(createRock(x, z));
      } else {
        scene.add(createBuilding(x, z));
      }
    }
  }, []);

  /**
   * Get terrain height at specific x, z coordinates
   * Uses same noise function as terrain generation
   */
  const getTerrainHeight = useCallback((x, z) => {
    let height = 0;
    height += Math.sin(x * 0.01) * Math.cos(z * 0.01) * 30;
    height += Math.sin(x * 0.03) * Math.cos(z * 0.02) * 15;
    height += Math.sin(x * 0.05) * Math.cos(z * 0.05) * 5;
    return height;
  }, []);

  /**
   * Create procedural road network with curves and banking
   */
  const createRoad = useCallback((scene) => {
    const roadGroup = new THREE.Group();
    const roadPoints = [];
    const roadWidth = 12;
    
    // Generate road path
    for (let t = 0; t < Math.PI * 4; t += 0.1) {
      const x = Math.cos(t) * (100 + Math.sin(t * 2) * 50);
      const z = Math.sin(t) * (100 + Math.cos(t * 1.5) * 30);
      const y = getTerrainHeight(x, z) + 1;
      roadPoints.push(new THREE.Vector3(x, y, z));
    }
    
    // Create road curve
    const curve = new THREE.CatmullRomCurve3(roadPoints, true);
    
    // Generate road geometry
    const roadGeometry = new THREE.TubeGeometry(curve, 200, roadWidth / 2, 8);
    const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.receiveShadow = true;
    roadGroup.add(road);
    
    // Add road markings
    const markingGeometry = new THREE.TubeGeometry(curve, 400, 0.2, 4);
    const markingMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const centerLine = new THREE.Mesh(markingGeometry, markingMaterial);
    centerLine.position.y = 0.1;
    roadGroup.add(centerLine);
    
    scene.add(roadGroup);
    return { road: roadGroup, curve };
  }, [getTerrainHeight]);

  /**
   * Car gear system simulation
   * Calculates gear changes, RPM, and engine behavior
   */
  const updateGearSystem = useCallback(() => {
    const physics = carPhysicsRef.current;
    
    // Gear ratios (realistic car transmission)
    const gearRatios = [0, 3.5, 2.1, 1.4, 1.0, 0.8, 0.6]; // 0 is neutral
    const maxRpmPerGear = [0, 6000, 6500, 7000, 7500, 8000, 8500];
    
    // Calculate engine RPM based on speed and gear
    const currentGearRatio = gearRatios[physics.gear];
    const baseRpm = Math.abs(physics.speed) * currentGearRatio * 30;
    
    // Add throttle influence on RPM
    const throttleRpm = physics.throttle * 2000;
    physics.rpm = Math.max(800, baseRpm + throttleRpm); // Idle RPM is 800
    
    // Automatic transmission logic
    const maxRpm = maxRpmPerGear[physics.gear];
    
    // Upshift condition
    if (physics.rpm > maxRpm * 0.9 && physics.gear < 6 && physics.throttle > 0.5) {
      physics.gear++;
      physics.rpm *= 0.7; // RPM drops after upshift
    }
    
    // Downshift condition
    if (physics.rpm < 1500 && physics.gear > 1 && physics.speed > 10) {
      physics.gear--;
      physics.rpm *= 1.4; // RPM increases after downshift
    }
    
    // Clamp RPM to realistic range
    physics.rpm = Math.min(8000, Math.max(800, physics.rpm));
    
    // Engine temperature simulation
    physics.engineTemp += (physics.throttle * 0.5 - 0.1);
    physics.engineTemp = Math.max(70, Math.min(120, physics.engineTemp));
    
    // Fuel consumption
    physics.fuel -= physics.throttle * 0.001;
    physics.fuel = Math.max(0, physics.fuel);
    
  }, []);

  /**
   * Advanced car physics simulation
   * Handles acceleration, steering, suspension, and terrain interaction
   */
  const updateCarPhysics = useCallback(() => {
    const physics = carPhysicsRef.current;
    const keys = keysRef.current;
    const car = carRef.current;
    if (!car) return;
    
    // ===== INPUT PROCESSING =====
    
    // Throttle input (0 to 1)
    physics.throttle = 0;
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
      physics.throttle = 1;
    }
    
    // Braking input
    let braking = 0;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
      braking = 1;
    }
    
    // Steering input (-1 to 1)
    physics.steering = 0;
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
      physics.steering = -1;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
      physics.steering = 1;
    }
    
    // ===== ENGINE AND TRANSMISSION =====
    updateGearSystem();
    
    // Calculate engine power based on RPM curve
    const rpmRatio = physics.rpm / 8000;
    const enginePower = Math.sin(rpmRatio * Math.PI) * physics.throttle * 150;
    
    // Apply power based on current gear
    const gearEfficiency = [0, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5][physics.gear];
    const forwardForce = enginePower * gearEfficiency;
    
    // ===== AERODYNAMICS AND RESISTANCE =====
    
    // Air resistance (increases with speed squared)
    const airResistance = physics.speed * physics.speed * 0.01;
    
    // Rolling resistance
    const rollingResistance = physics.speed * 2;
    
    // Total resistance
    const totalResistance = airResistance + rollingResistance;
    
    // ===== ACCELERATION CALCULATION =====
    
    // Net force on car
    let netForce = forwardForce - totalResistance;
    
    // Braking force
    if (braking > 0) {
      netForce -= braking * 200;
    }
    
    // Update speed (simple integration)
    physics.speed += netForce * 0.01;
    physics.speed = Math.max(0, Math.min(CONFIG.CAR_MAX_SPEED, physics.speed));
    
    // ===== STEERING PHYSICS =====
    
    // Speed-dependent steering (harder to turn at high speed)
    const steeringSensitivity = Math.max(0.3, 1 - (physics.speed / CONFIG.CAR_MAX_SPEED) * 0.7);
    const steeringForce = physics.steering * steeringSensitivity;
    
    // Update angular velocity based on steering and speed
    physics.angularVelocity += steeringForce * physics.speed * 0.0001;
    physics.angularVelocity *= 0.9; // Angular damping
    
    // Update car rotation
    physics.rotation.y += physics.angularVelocity;
    
    // ===== MOVEMENT INTEGRATION =====
    
    // Calculate movement direction based on car rotation
    const direction = new THREE.Vector3(
      Math.sin(physics.rotation.y),
      0,
      Math.cos(physics.rotation.y)
    );
    
    // Update velocity
    direction.multiplyScalar(physics.speed * 0.1);
    physics.velocity.lerp(direction, 0.1);
    
    // Update position
    physics.position.add(physics.velocity.clone().multiplyScalar(0.016)); // 60 FPS
    
    // ===== TERRAIN INTERACTION =====
    
    // Get terrain height at car position
    const terrainHeight = getTerrainHeight(physics.position.x, physics.position.z);
    
    // Simple suspension simulation
    const targetY = terrainHeight + 2;
    const springForce = (targetY - physics.position.y) * 10;
    const dampingForce = -physics.velocity.y * 5;
    
    physics.velocity.y += (springForce + dampingForce + CONFIG.GRAVITY) * 0.016;
    physics.position.y += physics.velocity.y * 0.016;
    
    // Ground collision
    if (physics.position.y < terrainHeight + 1) {
      physics.position.y = terrainHeight + 1;
      physics.velocity.y = 0;
      physics.onGround = true;
    } else {
      physics.onGround = false;
    }
    
    // ===== UPDATE CAR OBJECT =====
    
    // Apply physics to visual car
    car.position.copy(physics.position);
    car.rotation.copy(physics.rotation);
    
    // Banking effect on turns
    car.rotation.z = -physics.angularVelocity * 5;
    
    // Animate wheels
    if (car.wheels) {
      const wheelRotation = physics.speed * 0.1;
      car.wheels.forEach((wheel, index) => {
        // Front wheels turn with steering
        if (index < 2) {
          wheel.rotation.y = physics.steering * 0.3;
        }
        // All wheels rotate based on speed
        wheel.rotation.x += wheelRotation * 0.01;
      });
    }
    
  }, [updateGearSystem, getTerrainHeight]);

  /**
   * Update camera to follow car with cinematic movement
   */
  const updateCamera = useCallback(() => {
    const camera = cameraRef.current;
    const physics = carPhysicsRef.current;
    if (!camera) return;
    
    // Calculate ideal camera position (behind and above car)
    const cameraDistance = 25 + physics.speed * 0.1; // Camera pulls back at high speed
    const cameraHeight = 8 + physics.speed * 0.05;
    
    const targetPosition = new THREE.Vector3(
      physics.position.x - Math.sin(physics.rotation.y) * cameraDistance,
      physics.position.y + cameraHeight,
      physics.position.z - Math.cos(physics.rotation.y) * cameraDistance
    );
    
    // Smooth camera interpolation
    camera.position.lerp(targetPosition, 0.05);
    
    // Camera looks at car with slight forward bias
    const lookAtTarget = new THREE.Vector3(
      physics.position.x + Math.sin(physics.rotation.y) * 10,
      physics.position.y + 2,
      physics.position.z + Math.cos(physics.rotation.y) * 10
    );
    
    camera.lookAt(lookAtTarget);
    
  }, []);

  /**
   * Main game loop - updates all game systems
   */
  const updateGame = useCallback(() => {
    updateCarPhysics();
    updateCamera();
    
    const physics = carPhysicsRef.current;
    
    // Update score based on speed and distance
    physics.score += physics.speed * 0.1;
    
    // Check for game over conditions
    if (physics.fuel <= 0) {
      setGameState(prev => ({ ...prev, gameOver: true, started: false }));
    }
    
    // Update UI state
    setGameState(prev => ({
      ...prev,
      speed: Math.floor(physics.speed * 3.6), // Convert to km/h
      rpm: Math.floor(physics.rpm),
      gear: physics.gear,
      score: Math.floor(physics.score),
      fuel: Math.floor(physics.fuel)
    }));
    
  }, [updateCarPhysics, updateCamera]);

  /**
   * Render loop - draws the 3D scene
   */
  const render = useCallback(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }, []);

  /**
   * Main game loop combining update and render
   */
  const gameLoop = useCallback(() => {
    if (gameState.started && !gameState.gameOver) {
      updateGame();
      render();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState.started, gameState.gameOver, updateGame, render]);

  /**
   * Initialize the complete 3D game
   */
  const initGame = useCallback(() => {
    const { scene } = initThreeJS();
    if (!scene) return;
    
    // Create all game elements
    createTerrain(scene);
    createCar(scene);
    createEnvironment(scene);
    createRoad(scene);
    
    // Reset physics
    const physics = carPhysicsRef.current;
    physics.position.set(0, 10, 0);
    physics.velocity.set(0, 0, 0);
    physics.rotation.set(0, 0, 0);
    physics.speed = 0;
    physics.rpm = 800;
    physics.gear = 1;
    physics.score = 0;
    physics.fuel = 100;
    physics.engineTemp = 90;
    
    setGameState(prev => ({
      ...prev,
      started: true,
      gameOver: false,
      score: 0,
      fuel: 100
    }));
    
  }, [initThreeJS, createTerrain, createCar, createEnvironment, createRoad]);

  /**
   * Handle window resize for responsive canvas
   */
  const handleResize = useCallback(() => {
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    
    if (camera && renderer && mountRef.current) {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  }, []);

  // ===== REACT HOOKS =====

  /**
   * Keyboard input handling
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  /**
   * Game loop management
   */
  useEffect(() => {
    if (gameState.started && !gameState.gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.started, gameState.gameOver, gameLoop]);

  /**
   * Cleanup Three.js resources on unmount
   */
  useEffect(() => {
    return () => {
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  /**
   * Restart game function
   */
// ... (previous imports and code)

  /**
   * Restart game function
   */
  const restartGame = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    // Clean up previous scene
    if (sceneRef.current) {
      while (sceneRef.current.children.length > 0) {
        sceneRef.current.remove(sceneRef.current.children[0]);
      }
    }
    
    // Reinitialize game
    initGame();
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Canvas container */}
      <div 
        ref={mountRef} 
        style={{ width: '100%', height: '100%', background: '#87CEEB' }} 
      />
      
      {/* Game UI overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        fontFamily: 'Arial, sans-serif'
      }}>
        {/* Start screen */}
        {!gameState.started && !gameState.gameOver && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '30px',
            borderRadius: '15px',
            color: 'white',
            pointerEvents: 'auto'
          }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>3D Car Simulator</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
              Drive through the terrain and avoid obstacles!
            </p>
            <button 
              onClick={initGame}
              style={{
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '15px 40px',
                fontSize: '1.2rem',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = '#45a049'}
              onMouseOut={(e) => e.target.style.background = '#4CAF50'}
            >
              START GAME
            </button>
            
            <div style={{ marginTop: '40px', textAlign: 'left' }}>
              <h2>Controls:</h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>W/↑ - Accelerate</li>
                <li>S/↓ - Brake/Reverse</li>
                <li>A/← - Steer Left</li>
                <li>D/→ - Steer Right</li>
                <li>R - Reset Car</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* Game over screen */}
        {gameState.gameOver && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '30px',
            borderRadius: '15px',
            color: 'white',
            pointerEvents: 'auto'
          }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>GAME OVER</h1>
            <p style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
              Final Score: {gameState.score}
            </p>
            <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
              You ran out of fuel!
            </p>
            <button 
              onClick={restartGame}
              style={{
                background: '#2196F3',
                color: 'white',
                border: 'none',
                padding: '15px 40px',
                fontSize: '1.2rem',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = '#0b7dda'}
              onMouseOut={(e) => e.target.style.background = '#2196F3'}
            >
              PLAY AGAIN
            </button>
          </div>
        )}
        
        {/* In-game HUD */}
        {gameState.started && !gameState.gameOver && (
          <>
            {/* Speed display */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '15px',
              borderRadius: '10px',
              color: 'white'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                {gameState.speed}
                <span style={{ fontSize: '1rem', marginLeft: '5px' }}>km/h</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                <div style={{ width: '100px', height: '5px', background: '#333', borderRadius: '3px' }}>
                  <div style={{ 
                    width: `${(gameState.speed / 200) * 100}%`, 
                    height: '100%', 
                    background: gameState.speed > 180 ? '#f44336' : '#4CAF50',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            </div>
            
            {/* RPM and Gear display */}
            <div style={{
              position: 'absolute',
              bottom: '100px',
              left: '20px',
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '15px',
              borderRadius: '10px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: '20px' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>RPM</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {gameState.rpm}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>GEAR</div>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold',
                    color: gameState.gear === 1 ? '#FF9800' : '#4CAF50'
                  }}>
                    {gameState.gear}
                  </div>
                </div>
              </div>
              
              {/* RPM gauge */}
              <div style={{ 
                width: '200px', 
                height: '10px', 
                background: '#333', 
                borderRadius: '5px',
                marginTop: '10px',
                position: 'relative'
              }}>
                <div style={{ 
                  width: `${(gameState.rpm / 8000) * 100}%`, 
                  height: '100%', 
                  background: gameState.rpm > 6000 ? '#f44336' : '#FFC107',
                  borderRadius: '5px'
                }} />
                <div style={{
                  position: 'absolute',
                  left: '70%',
                  top: '-3px',
                  height: '16px',
                  width: '2px',
                  background: 'rgba(255, 255, 255, 0.5)'
                }} />
              </div>
            </div>
            
            {/* Fuel gauge */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '15px',
              borderRadius: '10px',
              color: 'white',
              width: '200px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>FUEL</span>
                <span>{gameState.fuel}%</span>
              </div>
              <div style={{ 
                height: '10px', 
                background: '#333', 
                borderRadius: '5px',
                marginTop: '10px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${gameState.fuel}%`, 
                  height: '100%', 
                  background: gameState.fuel < 20 ? '#f44336' : '#4CAF50'
                }} />
              </div>
            </div>
            
            {/* Score display */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '15px',
              borderRadius: '10px',
              color: 'white',
              textAlign: 'right'
            }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>SCORE</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {gameState.score}
              </div>
            </div>
            
            {/* Reset button */}
            <button 
              onClick={restartGame}
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                pointerEvents: 'auto',
                backdropFilter: 'blur(5px)'
              }}
            >
              RESET CAR (R)
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Car3DSimulation;