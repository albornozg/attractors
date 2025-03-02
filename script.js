// Global variables
let scene, camera, renderer, controls;
let currentAttractor = 'lorenz';
let particleSystem, particleGeometry, particleMaterial;
let currentPoint = { x: 0.1, y: 0, z: 0 };
let trail = [];
let trailLength = 5000;
let timeStep = 0.005;
let simTime = 0;
let simTimeDisplay = document.getElementById('sim-time');

// Graph variables
let xChart, yChart, zChart;
let dataPoints = 50; // Reduced number of data points for better performance
let graphUpdateCounter = 0; // Counter for controlling graph data updates
let graphSamplingRate = 2; // Only add a new data point every N simulation steps
// Initialize with small random values to ensure graphs display properly
let coordinateHistory = {
    x: Array(dataPoints).fill().map(() => Math.random() * 0.1),
    y: Array(dataPoints).fill().map(() => Math.random() * 0.1),
    z: Array(dataPoints).fill().map(() => Math.random() * 0.1)
};

// Attractor parameters
const attractors = {
    lorenz: {
        name: 'LORENZ SYSTEM',
        description: 'The Lorenz system is a system of ordinary differential equations first studied by Edward Lorenz. It is notable for having chaotic solutions for certain parameter values and initial conditions.',
        parameters: {
            sigma: 10,
            rho: 28,
            beta: 8/3
        },
        parameterRanges: {
            sigma: { min: 0, max: 30, step: 0.1 },
            rho: { min: 0, max: 100, step: 0.1 },
            beta: { min: 0, max: 10, step: 0.01 }
        },
        color: 0x00b894,
        scale: 1.0, // No scaling needed for Lorenz
        graphRanges: {
            x: { min: -25, max: 25 },
            y: { min: -35, max: 35 },
            z: { min: 0, max: 60 }
        },
        calculate: function(x, y, z) {
            const dx = this.parameters.sigma * (y - x);
            const dy = x * (this.parameters.rho - z) - y;
            const dz = x * y - this.parameters.beta * z;
            return { dx, dy, dz };
        }
    },
    rossler: {
        name: 'ROSSLER SYSTEM',
        description: 'The Rossler system is a system of three non-linear ordinary differential equations originally studied by Otto Rossler. These differential equations define a continuous-time dynamical system that exhibits chaotic dynamics.',
        parameters: {
            a: 0.2,
            b: 0.2,
            c: 5.7
        },
        parameterRanges: {
            a: { min: 0, max: 1, step: 0.01 },
            b: { min: 0, max: 1, step: 0.01 },
            c: { min: 0, max: 20, step: 0.1 }
        },
        color: 0x74b9ff,
        scale: 5.0, // Scale up Rossler by 5x
        graphRanges: {
            x: { min: -15, max: 15 },
            y: { min: -15, max: 15 },
            z: { min: 0, max: 25 }
        },
        calculate: function(x, y, z) {
            const dx = -y - z;
            const dy = x + this.parameters.a * y;
            const dz = this.parameters.b + z * (x - this.parameters.c);
            return { dx, dy, dz };
        }
    },
    aizawa: {
        name: 'AIZAWA SYSTEM',
        description: 'The Aizawa system is a strange attractor with a distinctive torus-like shape. It was discovered by Yoji Aizawa and features complex dynamics with multiple loops and spirals.',
        parameters: {
            a: 0.95,
            b: 0.7,
            c: 0.6,
            d: 3.5,
            e: 0.25,
            f: 0.1
        },
        parameterRanges: {
            a: { min: 0, max: 2, step: 0.01 },
            b: { min: 0, max: 2, step: 0.01 },
            c: { min: 0, max: 2, step: 0.01 },
            d: { min: 0, max: 10, step: 0.1 },
            e: { min: 0, max: 1, step: 0.01 },
            f: { min: 0, max: 1, step: 0.01 }
        },
        color: 0xe17055,
        scale: 15.0, // Scale up Aizawa by 15x
        graphRanges: {
            x: { min: -2, max: 2 },
            y: { min: -2, max: 2 },
            z: { min: -0.5, max: 3 }
        },
        calculate: function(x, y, z) {
            const dx = (z - this.parameters.b) * x - this.parameters.d * y;
            const dy = this.parameters.d * x + (z - this.parameters.b) * y;
            const dz = this.parameters.c + this.parameters.a * z - Math.pow(z, 3) / 3 - (Math.pow(x, 2) + Math.pow(y, 2)) * (1 + this.parameters.e * z) + this.parameters.f * z * Math.pow(x, 3);
            return { dx, dy, dz };
        }
    },
    thomas: {
        name: 'THOMAS SYSTEM',
        description: 'The Thomas attractor is a 3D strange attractor first described by René Thomas. It produces elegant spiral patterns and is defined by a single parameter that controls the damping in the system.',
        parameters: {
            b: 0.208186
        },
        parameterRanges: {
            b: { min: 0.1, max: 0.5, step: 0.001 }
        },
        color: 0x6c5ce7,
        scale: 8.0, // Scale up Thomas by 8x
        graphRanges: {
            x: { min: -3, max: 3 },
            y: { min: -3, max: 3 },
            z: { min: -3, max: 3 }
        },
        calculate: function(x, y, z) {
            const dx = Math.sin(y) - this.parameters.b * x;
            const dy = Math.sin(z) - this.parameters.b * y;
            const dz = Math.sin(x) - this.parameters.b * z;
            return { dx, dy, dz };
        }
    }
};

// Initialize the scene when the page loads
window.addEventListener('load', init);

function init() {
    // Initialize Three.js scene
    setupScene();
    
    // Create particle system
    createParticleSystem();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize coordinate graphs
    setupCoordinateGraphs();
    
    // Start the animation loop
    animate();
    
    // Update simulation time display
    setInterval(updateSimTime, 1000);
}

function setupScene() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, document.getElementById('visualization').clientWidth / document.getElementById('visualization').clientHeight, 0.1, 1000);
    camera.position.z = 30;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(document.getElementById('visualization').clientWidth, document.getElementById('visualization').clientHeight);
    document.getElementById('visualization').appendChild(renderer.domElement);
    
    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add grid helper
    const gridHelper = new THREE.GridHelper(50, 50, 0x00b894, 0x00b894);
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function createParticleSystem() {
    // Create particle geometry
    particleGeometry = new THREE.BufferGeometry();
    
    // Create positions array for particles
    const positions = new Float32Array(trailLength * 3);
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create particle material
    particleMaterial = new THREE.PointsMaterial({
        color: attractors[currentAttractor].color,
        size: 0.1,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: true
    });
    
    // Create particle system
    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    
    // Initialize trail with starting point
    for (let i = 0; i < trailLength; i++) {
        trail.push({ x: currentPoint.x, y: currentPoint.y, z: currentPoint.z });
    }
}

function setupEventListeners() {
    // Attractor selection buttons
    document.getElementById('lorenz-btn').addEventListener('click', () => changeAttractor('lorenz'));
    document.getElementById('rossler-btn').addEventListener('click', () => changeAttractor('rossler'));
    document.getElementById('aizawa-btn').addEventListener('click', () => changeAttractor('aizawa'));
    document.getElementById('thomas-btn').addEventListener('click', () => changeAttractor('thomas'));
    
    // Reset view button
    document.getElementById('reset-btn').addEventListener('click', resetView);
    
    // Update parameters button
    document.getElementById('update-params-btn').addEventListener('click', updateParameters);
}

function setupCoordinateGraphs() {
    // Get the current attractor's graph ranges
    const ranges = attractors[currentAttractor].graphRanges;
    
    // Common configuration for all graphs
    const commonConfig = {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: true,
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 184, 148, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(0, 184, 148, 0.7)',
                        font: {
                            family: "'VT323', monospace",
                            size: 10
                        },
                        maxTicksLimit: 3
                    }
                }
            },
            elements: {
                point: {
                    radius: 0
                },
                line: {
                    tension: 0.2,
                    borderWidth: 2
                }
            }
        }
    };
    
    // X coordinate graph
    const xCtx = document.getElementById('x-graph').getContext('2d');
    xChart = new Chart(xCtx, {
        ...commonConfig,
        data: {
            labels: Array.from({ length: dataPoints }, (_, i) => i),
            datasets: [{
                label: 'X',
                data: coordinateHistory.x,
                borderColor: '#00b894',
                backgroundColor: 'rgba(0, 184, 148, 0.2)',
                fill: true,
                borderWidth: 2
            }]
        },
        options: {
            ...commonConfig.options,
            scales: {
                ...commonConfig.options.scales,
                y: {
                    ...commonConfig.options.scales.y,
                    min: ranges.x.min,
                    max: ranges.x.max
                }
            }
        }
    });
    
    // Y coordinate graph
    const yCtx = document.getElementById('y-graph').getContext('2d');
    yChart = new Chart(yCtx, {
        ...commonConfig,
        data: {
            labels: Array.from({ length: dataPoints }, (_, i) => i),
            datasets: [{
                label: 'Y',
                data: coordinateHistory.y,
                borderColor: '#74b9ff',
                backgroundColor: 'rgba(116, 185, 255, 0.2)',
                fill: true,
                borderWidth: 2
            }]
        },
        options: {
            ...commonConfig.options,
            scales: {
                ...commonConfig.options.scales,
                y: {
                    ...commonConfig.options.scales.y,
                    min: ranges.y.min,
                    max: ranges.y.max
                }
            }
        }
    });
    
    // Z coordinate graph
    const zCtx = document.getElementById('z-graph').getContext('2d');
    zChart = new Chart(zCtx, {
        ...commonConfig,
        data: {
            labels: Array.from({ length: dataPoints }, (_, i) => i),
            datasets: [{
                label: 'Z',
                data: coordinateHistory.z,
                borderColor: '#e17055',
                backgroundColor: 'rgba(225, 112, 85, 0.2)',
                fill: true,
                borderWidth: 2
            }]
        },
        options: {
            ...commonConfig.options,
            scales: {
                ...commonConfig.options.scales,
                y: {
                    ...commonConfig.options.scales.y,
                    min: ranges.z.min,
                    max: ranges.z.max
                }
            }
        }
    });
}

function changeAttractor(attractorName) {
    // Update current attractor
    currentAttractor = attractorName;
    
    // Update material color
    particleMaterial.color.set(attractors[currentAttractor].color);
    
    // Reset particle position
    currentPoint = { x: 0.1, y: 0, z: 0 };
    
    // Clear trail
    for (let i = 0; i < trailLength; i++) {
        trail[i] = { x: currentPoint.x, y: currentPoint.y, z: currentPoint.z };
    }
    
    // Reset coordinate history and graph counter
    coordinateHistory.x = Array(dataPoints).fill().map(() => Math.random() * 0.1);
    coordinateHistory.y = Array(dataPoints).fill().map(() => Math.random() * 0.1);
    coordinateHistory.z = Array(dataPoints).fill().map(() => Math.random() * 0.1);
    graphUpdateCounter = 0;
    
    // Force update the graphs with new data
    if (xChart && yChart && zChart) {
        updateCoordinateGraphs();
    }
    
    // Update UI
    updateAttractorInfo();
    
    // Update active button
    document.querySelectorAll('.controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${attractorName}-btn`).classList.add('active');
    
    // Reset view to properly show the new attractor
    resetView();
    
    // Reset simulation time
    simTime = 0;
    updateSimTime();
    
    // Update the graphs with new fixed scales
    if (xChart && yChart && zChart) {
        const ranges = attractors[currentAttractor].graphRanges;
        
        xChart.options.scales.y.min = ranges.x.min;
        xChart.options.scales.y.max = ranges.x.max;
        
        yChart.options.scales.y.min = ranges.y.min;
        yChart.options.scales.y.max = ranges.y.max;
        
        zChart.options.scales.y.min = ranges.z.min;
        zChart.options.scales.y.max = ranges.z.max;
        
        xChart.update();
        yChart.update();
        zChart.update();
    }
}

function resetView() {
    // Reset camera position based on the current attractor's scale
    const distance = 30 / attractors[currentAttractor].scale;
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
    
    // Reset controls
    controls.reset();
}

function updateAttractorInfo() {
    // Update attractor name and description
    document.getElementById('attractor-name').textContent = attractors[currentAttractor].name;
    document.getElementById('attractor-description').textContent = attractors[currentAttractor].description;
    
    // Update parameters display
    updateParameterInputs();
}

function updateParameterInputs() {
    const parametersDiv = document.getElementById('parameters-container');
    parametersDiv.innerHTML = '';
    
    // Get the current attractor's parameters and ranges
    const params = attractors[currentAttractor].parameters;
    const ranges = attractors[currentAttractor].parameterRanges;
    
    // Create input fields for each parameter
    for (const [key, value] of Object.entries(params)) {
        const paramDiv = document.createElement('div');
        paramDiv.className = 'parameter';
        
        const labelSpan = document.createElement('span');
        labelSpan.className = 'param-label';
        labelSpan.textContent = `${getParameterSymbol(key)}:`;
        
        const inputField = document.createElement('input');
        inputField.type = 'number';
        inputField.className = 'param-input';
        inputField.id = `param-${key}`;
        inputField.value = value;
        inputField.min = ranges[key].min;
        inputField.max = ranges[key].max;
        inputField.step = ranges[key].step;
        
        paramDiv.appendChild(labelSpan);
        paramDiv.appendChild(inputField);
        parametersDiv.appendChild(paramDiv);
    }
}

function updateParameters() {
    // Get the current attractor
    const attractor = attractors[currentAttractor];
    
    // Update each parameter from the input fields
    for (const key of Object.keys(attractor.parameters)) {
        const inputField = document.getElementById(`param-${key}`);
        if (inputField) {
            const newValue = parseFloat(inputField.value);
            if (!isNaN(newValue)) {
                attractor.parameters[key] = newValue;
            }
        }
    }
    
    // Reset the simulation
    resetSimulation();
    
    // Update status to indicate parameters were updated
    const statusElement = document.getElementById('status');
    statusElement.textContent = 'UPDATED';
    setTimeout(() => {
        statusElement.textContent = 'ACTIVE';
    }, 2000);
}

function resetSimulation() {
    // Reset particle position
    currentPoint = { x: 0.1, y: 0, z: 0 };
    
    // Clear trail
    for (let i = 0; i < trailLength; i++) {
        trail[i] = { x: currentPoint.x, y: currentPoint.y, z: currentPoint.z };
    }
    
    // Reset coordinate history and graph counter
    coordinateHistory.x = Array(dataPoints).fill().map(() => Math.random() * 0.1);
    coordinateHistory.y = Array(dataPoints).fill().map(() => Math.random() * 0.1);
    coordinateHistory.z = Array(dataPoints).fill().map(() => Math.random() * 0.1);
    graphUpdateCounter = 0;
    
    // Force update the graphs with new data
    if (xChart && yChart && zChart) {
        updateCoordinateGraphs();
    }
    
    // Reset simulation time
    simTime = 0;
    updateSimTime();
}

function getParameterSymbol(param) {
    const symbols = {
        sigma: 'σ',
        rho: 'ρ',
        beta: 'β',
        a: 'a',
        b: 'b',
        c: 'c',
        d: 'd',
        e: 'e',
        f: 'f'
    };
    
    return symbols[param] || param;
}

function updateCoordinates() {
    // Update coordinate display - showing the raw (unscaled) values
    document.getElementById('x-coordinate').textContent = currentPoint.x.toFixed(4);
    document.getElementById('y-coordinate').textContent = currentPoint.y.toFixed(4);
    document.getElementById('z-coordinate').textContent = currentPoint.z.toFixed(4);
    
    // Update coordinate history at a controlled rate
    graphUpdateCounter++;
    if (graphUpdateCounter >= graphSamplingRate) {
        graphUpdateCounter = 0;
        
        // Add new data point to the end and remove from the beginning
        coordinateHistory.x.push(currentPoint.x);
        coordinateHistory.x.shift();
        coordinateHistory.y.push(currentPoint.y);
        coordinateHistory.y.shift();
        coordinateHistory.z.push(currentPoint.z);
        coordinateHistory.z.shift();
        
        // Update graphs
        updateCoordinateGraphs();
    }
}

function updateCoordinateGraphs() {
    // Update chart data
    xChart.data.datasets[0].data = [...coordinateHistory.x];
    yChart.data.datasets[0].data = [...coordinateHistory.y];
    zChart.data.datasets[0].data = [...coordinateHistory.z];
    
    // Update charts with minimal animation
    xChart.update();
    yChart.update();
    zChart.update();
}

function updateSimTime() {
    // Increment simulation time
    simTime += 1;
    
    // Format time as HH:MM:SS
    const hours = Math.floor(simTime / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((simTime % 3600) / 60).toString().padStart(2, '0');
    const seconds = (simTime % 60).toString().padStart(2, '0');
    
    // Update display
    simTimeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
}

function updateParticleSystem() {
    // Calculate new position using the current attractor's equations
    const derivatives = attractors[currentAttractor].calculate(currentPoint.x, currentPoint.y, currentPoint.z);
    
    // Update position using Runge-Kutta 4th order method
    const k1 = derivatives;
    
    const x1 = currentPoint.x + k1.dx * timeStep / 2;
    const y1 = currentPoint.y + k1.dy * timeStep / 2;
    const z1 = currentPoint.z + k1.dz * timeStep / 2;
    
    const k2 = attractors[currentAttractor].calculate(x1, y1, z1);
    
    const x2 = currentPoint.x + k2.dx * timeStep / 2;
    const y2 = currentPoint.y + k2.dy * timeStep / 2;
    const z2 = currentPoint.z + k2.dz * timeStep / 2;
    
    const k3 = attractors[currentAttractor].calculate(x2, y2, z2);
    
    const x3 = currentPoint.x + k3.dx * timeStep;
    const y3 = currentPoint.y + k3.dy * timeStep;
    const z3 = currentPoint.z + k3.dz * timeStep;
    
    const k4 = attractors[currentAttractor].calculate(x3, y3, z3);
    
    currentPoint.x += (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx) * timeStep / 6;
    currentPoint.y += (k1.dy + 2 * k2.dy + 2 * k3.dy + k4.dy) * timeStep / 6;
    currentPoint.z += (k1.dz + 2 * k2.dz + 2 * k3.dz + k4.dz) * timeStep / 6;
    
    // Add new point to trail and remove oldest point
    trail.push({ x: currentPoint.x, y: currentPoint.y, z: currentPoint.z });
    trail.shift();
    
    // Update particle positions with scaling applied
    const positions = particleGeometry.attributes.position.array;
    const scale = attractors[currentAttractor].scale;
    
    for (let i = 0; i < trailLength; i++) {
        const point = trail[i];
        positions[i * 3] = point.x * scale;
        positions[i * 3 + 1] = point.y * scale;
        positions[i * 3 + 2] = point.z * scale;
    }
    
    // Mark the attribute as needing an update
    particleGeometry.attributes.position.needsUpdate = true;
    
    // Update coordinate display
    updateCoordinates();
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update particle system
    updateParticleSystem();
    
    // Update controls
    controls.update();
    
    // Render scene
    renderer.render(scene, camera);
}

function onWindowResize() {
    // Update camera aspect ratio
    camera.aspect = document.getElementById('visualization').clientWidth / document.getElementById('visualization').clientHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer size
    renderer.setSize(document.getElementById('visualization').clientWidth, document.getElementById('visualization').clientHeight);
}

// Initialize attractor info on page load
updateAttractorInfo();
