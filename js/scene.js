// scene.js

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    
    // We want the clear color to be completely transparent or match the dark navy
    scene.background = new THREE.Color(0x0a192f); // Deep navy from our CSS

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 15;
    camera.position.x = 0;
    camera.position.y = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Create Abstract Data Network Geometry
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 700; // number of dots
    
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
        // spread particles out
        posArray[i] = (Math.random() - 0.5) * 40;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Material for nodes
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.15,
        color: 0x64ffda, // Teal accent
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    // Node Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Lines Connecting Nodes (pseudo-network)
    // For performance, we'll connect a subset or use a line geometry
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x64ffda,
        transparent: true,
        opacity: 0.1
    });

    // Create lines between particles that are close
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];
    
    // simplified distance checker for visual lines
    for(let i = 0; i < particlesCount; i++) {
        let x1 = posArray[i*3];
        let y1 = posArray[i*3 + 1];
        let z1 = posArray[i*3 + 2];
        
        for(let j = i+1; j < particlesCount; j++) {
            let x2 = posArray[j*3];
            let y2 = posArray[j*3 + 1];
            let z2 = posArray[j*3 + 2];
            
            // Calculate distance
            let dist = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2) + Math.pow(z2-z1, 2));
            
            // Connect close nodes
            if (dist < 4) {
                linePositions.push(x1, y1, z1);
                linePositions.push(x2, y2, z2);
            }
        }
    }

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;

    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Slow automatic rotation
        particlesMesh.rotation.y = elapsedTime * 0.05;
        lineMesh.rotation.y = elapsedTime * 0.05;
        
        particlesMesh.rotation.x = elapsedTime * 0.02;
        lineMesh.rotation.x = elapsedTime * 0.02;

        // Subtle mouse interaction
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
        particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);
        
        lineMesh.rotation.y += 0.05 * (targetX - lineMesh.rotation.y);
        lineMesh.rotation.x += 0.05 * (targetY - lineMesh.rotation.x);

        renderer.render(scene, camera);
    }

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
});
