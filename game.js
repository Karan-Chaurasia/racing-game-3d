class Car {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.position = { x: 0, y: 0.5, z: 0 };
        this.velocity = { x: 0, z: 0 };
        this.rotation = 0;
        this.speed = 0;
        this.maxSpeed = 1.2;
        this.acceleration = 0.03;
        this.deceleration = 0.02;
        this.turnSpeed = 0.04;
        this.friction = 0.95;
        this.currentGear = 1;
        this.gearSpeeds = {
            1: 0.25, 2: 0.5, 3: 0.75, 4: 1.0, 5: 1.25
        };
        this.boundarySize = 145;
        this.fallHeight = -10;
        this.spawnPoint = { x: 0, y: 0.5, z: 0 };
        this.frozen = false;
        this.boostTime = 0;
        this.maxBoostTime = 10;
        this.boostSpeed = 10 / 80;
        this.isBoosting = false;
        this.ctrlPressed = false;
        this.shiftPressed = false;
        this.createCar();
    }
    
    createCar() {
        const bodyGeometry = new THREE.BoxGeometry(2, 0.8, 4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff4444 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        
        const roofGeometry = new THREE.BoxGeometry(1.5, 0.6, 2);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 0.7;
        roof.position.z = -0.5;
        
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 8);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        
        const wheels = [];
        const wheelPositions = [
            { x: -1.2, y: -0.3, z: 1.3 }, { x: 1.2, y: -0.3, z: 1.3 },
            { x: -1.2, y: -0.3, z: -1.3 }, { x: 1.2, y: -0.3, z: -1.3 }
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(pos.x, pos.y, pos.z);
            wheel.rotation.z = Math.PI / 2;
            wheels.push(wheel);
        });
        
        const headlightGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const headlightMaterial = new THREE.MeshLambertMaterial({ color: 0xffffaa, emissive: 0x444422 });
        
        this.leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        this.leftHeadlight.position.set(-0.6, 0.2, 1.9);
        
        this.rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        this.rightHeadlight.position.set(0.6, 0.2, 1.9);
        
        const brakeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const brakeMaterial = new THREE.MeshLambertMaterial({ color: 0x440000 });
        const brakeActiveMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000, emissive: 0x220000 });
        
        this.leftBrakeLight = new THREE.Mesh(brakeGeometry, brakeMaterial);
        this.leftBrakeLight.position.set(-0.6, 0.2, -1.9);
        
        this.rightBrakeLight = new THREE.Mesh(brakeGeometry, brakeMaterial);
        this.rightBrakeLight.position.set(0.6, 0.2, -1.9);
        
        this.brakeMaterial = brakeMaterial;
        this.brakeActiveMaterial = brakeActiveMaterial;
        this.bodyMesh = body;
        this.wheelMeshes = wheels;
        
        this.mesh = new THREE.Group();
        this.mesh.add(body);
        this.mesh.add(roof);
        this.mesh.add(this.leftHeadlight);
        this.mesh.add(this.rightHeadlight);
        this.mesh.add(this.leftBrakeLight);
        this.mesh.add(this.rightBrakeLight);
        wheels.forEach(wheel => this.mesh.add(wheel));
        
        this.updatePosition();
        this.scene.add(this.mesh);
    }
    
    changeBodyColor(color) {
        this.bodyMesh.material.color.setHex(color);
    }
    
    changeWheelColor(color) {
        this.wheelMeshes.forEach(wheel => {
            wheel.material.color.setHex(color);
        });
    }
    
    changeCarSize(size) {
        const scales = { small: 0.7, normal: 1.0, large: 1.3 };
        const scale = scales[size] || 1.0;
        this.mesh.scale.set(scale, scale, scale);
    }
    
    updatePosition() {
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.rotation.y = this.rotation;
    }
    
    update(keys, track) {
        if (this.frozen) return;
        
        const ctrlCurrentlyPressed = keys['control'] || keys['Control'];
        if (ctrlCurrentlyPressed && !this.ctrlPressed && this.boostTime > 0) {
            this.isBoosting = !this.isBoosting;
        }
        this.ctrlPressed = ctrlCurrentlyPressed;
        
        if (this.isBoosting) {
            this.boostTime -= 1/60;
            if (this.boostTime <= 0) {
                this.isBoosting = false;
                this.boostTime = 0;
            }
        }
        
        const shiftCurrentlyPressed = keys['shift'] || keys['Shift'];
        if (shiftCurrentlyPressed && !this.shiftPressed) {
            this.currentGear = this.currentGear >= 5 ? 1 : this.currentGear + 1;
        }
        this.shiftPressed = shiftCurrentlyPressed;
        
        const currentMaxSpeed = this.gearSpeeds[this.currentGear];
        const isBraking = keys[' '] || keys['Space'];
        const isReversing = keys['s'] || keys['ArrowDown'];
        this.leftBrakeLight.material = (isBraking || isReversing) ? this.brakeActiveMaterial : this.brakeMaterial;
        this.rightBrakeLight.material = (isBraking || isReversing) ? this.brakeActiveMaterial : this.brakeMaterial;
        
        if (keys['w'] || keys['ArrowUp']) {
            this.speed = Math.min(this.speed + this.acceleration, currentMaxSpeed);
        } else if (isReversing) {
            this.speed = Math.max(this.speed - this.deceleration, -currentMaxSpeed * 0.6);
        } else if (isBraking) {
            this.speed = Math.max(this.speed - this.deceleration * 2, 0);
        } else {
            this.speed *= this.friction;
            if (Math.abs(this.speed) < 0.01) this.speed = 0;
        }
        
        if (keys['a'] || keys['ArrowLeft']) {
            this.rotation += this.turnSpeed;
        }
        if (keys['d'] || keys['ArrowRight']) {
            this.rotation -= this.turnSpeed;
        }
        
        const actualSpeed = this.isBoosting ? this.speed + this.boostSpeed : this.speed;
        this.velocity.x = Math.sin(this.rotation) * actualSpeed;
        this.velocity.z = Math.cos(this.rotation) * actualSpeed;
        
        if (track && track.checkCollisions) {
            track.checkCollisions(this.position, this.velocity);
        }
        
        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;
        
        this.checkBoundaries();
        this.updatePosition();
        
        const speedKmh = Math.abs(actualSpeed * 80);
        const boostText = this.isBoosting ? ' | BOOST!' : '';
        document.getElementById('speed').textContent = `Speed: ${speedKmh.toFixed(0)} km/h | Gear: ${this.currentGear}${boostText}`;
        
        const boostPercent = (this.boostTime / this.maxBoostTime) * 100;
        document.getElementById('boostFill').style.width = `${boostPercent}%`;
    }
    
    checkBoundaries() {
        if (this.position.y < this.fallHeight || Math.abs(this.position.x) > this.boundarySize || Math.abs(this.position.z) > this.boundarySize) {
            this.respawn();
        }
    }
    
    respawn() {
        this.position.x = this.spawnPoint.x;
        this.position.y = this.spawnPoint.y;
        this.position.z = this.spawnPoint.z;
        this.velocity.x = 0;
        this.velocity.z = 0;
        this.speed = 0;
        this.rotation = 0;
        this.frozen = true;
        
        this.showCountdown();
    }
    
    showCountdown() {
        const countdown = ['3', '2', '1', 'GO!'];
        let index = 0;
        
        const showNext = () => {
            if (index < countdown.length) {
                const message = document.createElement('div');
                message.textContent = countdown[index];
                message.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: ${index === 3 ? '#00ff00' : '#ffff00'};
                    font-size: 48px;
                    font-weight: bold;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                    z-index: 1000;
                    pointer-events: none;
                `;
                document.body.appendChild(message);
                
                setTimeout(() => {
                    document.body.removeChild(message);
                }, 800);
                
                index++;
                if (index < countdown.length) {
                    setTimeout(showNext, 1000);
                } else {
                    setTimeout(() => {
                        this.frozen = false;
                    }, 500);
                }
            }
        };
        
        showNext();
    }
    
    addBoostTime() {
        this.boostTime = Math.min(this.boostTime + 1, this.maxBoostTime);
    }
    
    getPosition() { return this.position; }
    getRotation() { return this.rotation; }
}

class Track {
    constructor(scene) {
        this.scene = scene;
        this.level = 1;
        this.createEnvironment();
    }
    
    createEnvironment() {
        const groundGeometry = new THREE.PlaneGeometry(300, 300);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.1;
        this.scene.add(ground);
        
        const skyGeometry = new THREE.SphereGeometry(150, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
        
        this.createScatteredObjects();
    }
    
    createScatteredObjects() {
        this.trees = [];
        this.rocks = [];
        const occupiedPositions = [];
        
        const isPositionValid = (x, z, minDistance = 8) => {
            if (Math.abs(x) < 10 && Math.abs(z) < 10) return false;
            
            return !occupiedPositions.some(pos => {
                const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(z - pos.z, 2));
                return distance < minDistance;
            });
        };
        
        const getRandomPosition = () => {
            let x, z;
            let attempts = 0;
            do {
                x = (Math.random() - 0.5) * 280;
                z = (Math.random() - 0.5) * 280;
                attempts++;
            } while ((!isPositionValid(x, z) || Math.sqrt(x*x + z*z) > 140) && attempts < 50);
            return { x, z };
        };
        
        const treeCount = 15 + (this.level * 5);
        for (let i = 0; i < treeCount; i++) {
            const pos = getRandomPosition();
            occupiedPositions.push(pos);
            
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 3);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(pos.x, 1.5, pos.z);
            this.scene.add(trunk);
            
            const leavesGeometry = new THREE.SphereGeometry(2, 8, 8);
            const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.set(pos.x, 4, pos.z);
            this.scene.add(leaves);
            
            this.trees.push({
                trunk: trunk,
                leaves: leaves,
                originalPos: { x: pos.x, y: 1.5, z: pos.z },
                broken: false,
                radius: 2.2
            });
        }
        
        const rockCount = 10 + (this.level * 3);
        for (let i = 0; i < rockCount; i++) {
            const pos = getRandomPosition();
            occupiedPositions.push(pos);
            
            const size = 0.5 + Math.random();
            const rockGeometry = new THREE.SphereGeometry(size, 6, 6);
            const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(pos.x, 0.3, pos.z);
            this.scene.add(rock);
            
            this.rocks.push({
                mesh: rock,
                position: { x: pos.x, z: pos.z },
                radius: size,
                hitRecently: false
            });
        }
    }
    
    checkCollisions(carPosition, carVelocity) {
        this.trees.forEach(tree => {
            if (!tree.broken) {
                const distance = Math.sqrt(
                    Math.pow(carPosition.x - tree.originalPos.x, 2) + 
                    Math.pow(carPosition.z - tree.originalPos.z, 2)
                );
                
                if (distance < tree.radius) {
                    tree.broken = true;
                    tree.trunk.rotation.z = Math.PI / 2;
                    tree.trunk.position.y = 0.5;
                    tree.leaves.position.y = 1;
                    tree.leaves.scale.set(0.5, 0.5, 0.5);
                    
                    if (window.gameInstance) {
                        window.gameInstance.addScore(1);
                        window.gameInstance.car.addBoostTime();
                    }
                }
            }
        });
        
        this.rocks.forEach(rock => {
            const distance = Math.sqrt(
                Math.pow(carPosition.x - rock.position.x, 2) + 
                Math.pow(carPosition.z - rock.position.z, 2)
            );
            
            if (distance < rock.radius + 1) {
                const pushDir = {
                    x: (carPosition.x - rock.position.x) / distance,
                    z: (carPosition.z - rock.position.z) / distance
                };
                
                const safeDistance = rock.radius + 1.1;
                carPosition.x = rock.position.x + pushDir.x * safeDistance;
                carPosition.z = rock.position.z + pushDir.z * safeDistance;
                
                carVelocity.x = 0;
                carVelocity.z = 0;
                
                if (window.gameInstance && !rock.hitRecently) {
                    window.gameInstance.addScore(-1);
                    window.gameInstance.triggerVibration(300, 0.8, 0.4);
                    rock.hitRecently = true;
                    setTimeout(() => { rock.hitRecently = false; }, 1000);
                }
            }
        });
    }
    
    resetTrees() {
        this.trees.forEach(tree => {
            if (tree.broken) {
                tree.trunk.rotation.z = 0;
                tree.trunk.position.set(tree.originalPos.x, tree.originalPos.y, tree.originalPos.z);
                tree.leaves.position.set(tree.originalPos.x, 4, tree.originalPos.z);
                tree.leaves.scale.set(1, 1, 1);
                tree.broken = false;
            }
        });
    }
    
    areAllTreesBroken() {
        return this.trees.every(tree => tree.broken);
    }
    
    createNextLevel(level) {
        this.level = level;
        
        this.trees.forEach(tree => {
            this.scene.remove(tree.trunk);
            this.scene.remove(tree.leaves);
        });
        this.rocks.forEach(rock => {
            this.scene.remove(rock.mesh);
        });
        
        this.createScatteredObjects();
    }
}

class CameraController {
    constructor(camera, car, renderer) {
        this.camera = camera;
        this.car = car;
        this.distance = 8;
        this.height = 4;
        this.angle = 0;
        this.elevation = 0.3;
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetAngle = 0;
        this.targetElevation = 0.3;
        this.smoothFactor = 0.1;
        this.setupControls(renderer.domElement);
    }
    
    setupControls(canvas) {
        canvas.addEventListener('mousedown', (event) => {
            this.isMouseDown = true;
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
        });
        
        canvas.addEventListener('mouseup', () => { this.isMouseDown = false; });
        canvas.addEventListener('mouseleave', () => { this.isMouseDown = false; });
        
        canvas.addEventListener('mousemove', (event) => {
            if (!this.isMouseDown) return;
            const deltaX = event.clientX - this.mouseX;
            const deltaY = event.clientY - this.mouseY;
            this.targetAngle += deltaX * 0.01;
            this.targetElevation = Math.max(-0.5, Math.min(1.2, this.targetElevation - deltaY * 0.01));
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
        });
        
        canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            this.distance = Math.max(3, Math.min(15, this.distance + event.deltaY * 0.01));
        });
    }
    
    update() {
        this.angle += (this.targetAngle - this.angle) * this.smoothFactor;
        this.elevation += (this.targetElevation - this.elevation) * this.smoothFactor;
        
        const carPos = this.car.getPosition();
        const carRotation = this.car.getRotation();
        
        const cameraAngle = carRotation + this.angle;
        const cameraX = carPos.x - Math.sin(cameraAngle) * this.distance;
        const cameraZ = carPos.z - Math.cos(cameraAngle) * this.distance;
        const cameraY = carPos.y + this.height + this.elevation * 3;
        
        this.camera.position.set(cameraX, cameraY, cameraZ);
        
        const lookAtX = carPos.x + Math.sin(carRotation) * 2;
        const lookAtY = carPos.y + 1;
        const lookAtZ = carPos.z + Math.cos(carRotation) * 2;
        
        this.camera.lookAt(lookAtX, lookAtY, lookAtZ);
    }
    
    resetCamera() {
        this.targetAngle = 0;
        this.targetElevation = 0.3;
        this.distance = 8;
    }
}

class RacingGame {
    constructor() {
        this.keys = {};
        this.gamepad = null;
        this.prevGamepadState = {};
        this.score = 0;
        this.level = 1;
        this.timeLeft = 60;
        this.timerInterval = null;
        this.maxPossibleScore = 0;
        this.isPaused = false;
        this.gameStartTime = Date.now();
        this.init();
        this.setupEventListeners();
        this.animate();
        this.startTimer();
    }
    
    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB);
        document.getElementById('gameContainer').appendChild(this.renderer.domElement);
        
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 25);
        this.scene.add(directionalLight);
        
        this.track = new Track(this.scene);
        this.car = new Car(this.scene);
        this.cameraController = new CameraController(this.camera, this.car, this.renderer);
        this.updateScoreDisplay();
    }
    
    addScore(points) {
        this.score += points;
        this.updateScoreDisplay();
        
        const brokenTrees = this.track.trees.filter(tree => tree.broken).length;
        const totalTrees = this.track.trees.length;
        console.log(`Trees broken: ${brokenTrees}/${totalTrees}`);
        
        if (this.track.areAllTreesBroken()) {
            console.log('All trees broken! Going to next level.');
            this.nextLevel();
        }
    }
    
    nextLevel() {
        this.car.frozen = true;
        this.stopTimer();
        const remainingTime = this.timeLeft;
        this.level++;
        this.timeLeft = 60 + (Math.min(this.level - 1, 4) * 4) + remainingTime;
        this.track.level = this.level;
        this.track.createNextLevel(this.level);
        this.showLevelMessage();
        this.updateScoreDisplay();
        
        setTimeout(() => {
            this.car.showCountdown();
            setTimeout(() => {
                this.startTimer();
            }, 4500);
        }, 1500);
    }
    
    startTimer() {
        this.stopTimer(); // Ensure no duplicate timers
        this.timerInterval = setInterval(() => {
            if (!this.car.frozen && !this.isPaused) {
                this.timeLeft--;
                this.updateScoreDisplay();
                
                if (this.timeLeft <= 0) {
                    this.gameOver();
                }
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    pauseGame() {
        this.isPaused = true;
        this.car.frozen = true;
        this.stopTimer();
    }
    
    resumeGame() {
        this.isPaused = false;
        this.car.frozen = false;
        this.startTimer();
    }
    
    quitGame() {
        this.stopTimer();
        this.car.frozen = true;
        
        const shouldSaveScore = this.shouldSaveScore();
        
        if (shouldSaveScore) {
            const timeTakenMs = Date.now() - this.gameStartTime;
            const minutes = Math.floor(timeTakenMs / 60000);
            const seconds = Math.floor((timeTakenMs % 60000) / 1000);
            const timeTaken = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            updateLeaderboard(playerName, this.score, this.maxPossibleScore, timeTaken);
        }
        
        location.reload();
    }
    
    shouldSaveScore() {
        const leaderboard = getLeaderboard();
        const existingEntry = leaderboard.find(entry => entry.name === playerName);
        
        if (!existingEntry) return this.score > 0;
        
        return this.score > existingEntry.score;
    }
    
    gameOver() {
        this.stopTimer();
        this.car.frozen = true;
        
        const timeTakenMs = Date.now() - this.gameStartTime;
        const minutes = Math.floor(timeTakenMs / 60000);
        const seconds = Math.floor((timeTakenMs % 60000) / 1000);
        const timeTaken = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        updateLeaderboard(playerName, this.score, this.maxPossibleScore, timeTaken);
        
        const messages = [
            "Better luck next time!",
            "You gave your best!",
            "Keep trying, you'll get it!",
            "Practice makes perfect!",
            "Don't give up!"
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        const gameOverDiv = document.createElement('div');
        gameOverDiv.innerHTML = `
            <h1 style="color: #ff4444; font-size: 48px; margin-bottom: 20px;">GAME OVER!</h1>
            <p style="font-size: 24px; margin-bottom: 10px;">${playerName}: ${this.score} / ${this.maxPossibleScore}</p>
            <p style="font-size: 16px; margin-bottom: 10px;">Time: ${timeTaken}</p>
            <p style="font-size: 18px; color: #ffff44;">${randomMessage}</p>
            <button onclick="playAgain()" style="margin: 10px; padding: 10px 20px; font-size: 16px; background: #444; color: white; border: none; border-radius: 5px; cursor: pointer;">Play Again (${playerName})</button>
            <button onclick="location.reload()" style="margin: 10px; padding: 10px 20px; font-size: 16px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">New Player</button>
        `;
        gameOverDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 40px;
            border-radius: 10px;
            text-align: center;
            z-index: 1000;
        `;
        document.body.appendChild(gameOverDiv);
    }
    
    updateScoreDisplay() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('level').textContent = `Level: ${this.level}`;
        document.getElementById('timer').textContent = `Time: ${this.timeLeft}s`;
        
        this.maxPossibleScore = 0;
        for (let i = 1; i <= this.level; i++) {
            this.maxPossibleScore += 15 + (i * 5);
        }
    }
    
    showLevelMessage() {
        const message = document.createElement('div');
        message.textContent = `LEVEL ${this.level}!`;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #00ff00;
            font-size: 32px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            z-index: 1000;
            pointer-events: none;
        `;
        document.body.appendChild(message);
        
        setTimeout(() => {
            document.body.removeChild(message);
        }, 1000);
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            this.keys[event.key.toLowerCase()] = true;
            this.keys[event.code] = true;
            if (event.key.toLowerCase() === 'r') {
                this.cameraController.resetCamera();
            }
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.key.toLowerCase()] = false;
            this.keys[event.code] = false;
        });
        
        window.addEventListener('gamepadconnected', (e) => {
            console.log('Xbox controller connected:', e.gamepad.id);
        });
        
        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('Xbox controller disconnected');
            this.gamepad = null;
        });
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    triggerVibration(duration = 300, strongMagnitude = 1.0, weakMagnitude = 0.5) {
        if (this.gamepad && this.gamepad.vibrationActuator) {
            this.gamepad.vibrationActuator.playEffect('dual-rumble', {
                duration: duration,
                strongMagnitude: strongMagnitude,
                weakMagnitude: weakMagnitude
            });
        }
    }
    
    updateGamepadInput() {
        const gamepads = navigator.getGamepads();
        this.gamepad = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];
        
        if (!this.gamepad) return;
        
        const leftStickY = this.gamepad.axes[1];
        if (leftStickY < -0.2) this.keys['w'] = true;
        else this.keys['w'] = false;
        if (leftStickY > 0.2) this.keys['s'] = true;
        else this.keys['s'] = false;
        
        const leftStickX = this.gamepad.axes[0];
        if (leftStickX < -0.2) this.keys['a'] = true;
        else this.keys['a'] = false;
        if (leftStickX > 0.2) this.keys['d'] = true;
        else this.keys['d'] = false;
        
        this.keys[' '] = this.gamepad.buttons[0].pressed;
        this.keys['control'] = this.gamepad.buttons[1].pressed;
        
        const dpadUp = this.gamepad.buttons[12].pressed;
        const dpadDown = this.gamepad.buttons[13].pressed;
        this.keys['shift'] = dpadUp || dpadDown;
        
        const rightStickX = this.gamepad.axes[2];
        const rightStickY = this.gamepad.axes[3];
        if (Math.abs(rightStickX) > 0.1 || Math.abs(rightStickY) > 0.1) {
            this.cameraController.targetAngle += rightStickX * 0.05;
            this.cameraController.targetElevation = Math.max(-0.5, Math.min(1.2, 
                this.cameraController.targetElevation - rightStickY * 0.03));
        }
        
        if (this.gamepad.buttons[3].pressed && !this.prevGamepadState.buttonY) {
            this.cameraController.resetCamera();
        }
        
        if (this.gamepad.buttons[9].pressed && !this.prevGamepadState.start) {
            const settingsMenu = document.getElementById('settingsMenu');
            const gameContainer = document.getElementById('gameContainer');
            if (settingsMenu.style.display === 'block') {
                settingsMenu.style.display = 'none';
                gameContainer.classList.remove('paused');
                this.resumeGame();
            } else {
                settingsMenu.style.display = 'block';
                gameContainer.classList.add('paused');
                this.pauseGame();
            }
        }
        
        this.prevGamepadState = {
            buttonY: this.gamepad.buttons[3].pressed,
            start: this.gamepad.buttons[9].pressed
        };
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.updateGamepadInput();
        if (!this.isPaused) {
            this.car.update(this.keys, this.track);
            this.cameraController.update();
        }
        this.renderer.render(this.scene, this.camera);
    }
}

let playerName = '';

function getLeaderboard() {
    return JSON.parse(localStorage.getItem('racingGameLeaderboard') || '[]');
}

function saveLeaderboard(leaderboard) {
    localStorage.setItem('racingGameLeaderboard', JSON.stringify(leaderboard));
}

function updateLeaderboard(name, score, maxScore, timeTaken) {
    const leaderboard = getLeaderboard();
    const existingIndex = leaderboard.findIndex(entry => entry.name === name);
    
    if (existingIndex !== -1) {
        if (score > leaderboard[existingIndex].score) {
            leaderboard[existingIndex] = { name, score, maxScore, timeTaken, date: new Date().toLocaleDateString() };
        }
    } else {
        leaderboard.push({ name, score, maxScore, timeTaken, date: new Date().toLocaleDateString() });
    }
    
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.splice(10);
    saveLeaderboard(leaderboard);
}

function displayLeaderboard() {
    const leaderboard = getLeaderboard();
    const list = document.getElementById('leaderboardList');
    list.innerHTML = leaderboard.map((entry, index) => {
        const timeTaken = entry.timeTaken || 'N/A';
        const maxScore = entry.maxScore || 'N/A';
        return `<div class="leaderboard-entry" style="margin: 10px 0; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 5px;">
            <div style="font-weight: bold; color: #ffff44;">${index + 1}. ${entry.name}</div>
            <div style="font-size: 12px;">Score: ${entry.score}/${maxScore}</div>
            <div style="font-size: 12px;">Time: ${timeTaken}</div>
        </div>`;
    }).join('');
}

function populatePlayerDropdown() {
    const leaderboard = getLeaderboard();
    const uniqueNames = [...new Set(leaderboard.map(entry => entry.name))];
    const dropdown = document.getElementById('playerDropdown');
    
    dropdown.innerHTML = '<option value="">Select existing player</option>';
    uniqueNames.forEach(name => {
        dropdown.innerHTML += `<option value="${name}">${name}</option>`;
    });
    
    if (uniqueNames.length > 0) {
        dropdown.style.display = 'inline-block';
        document.getElementById('restartBtn').style.display = 'inline-block';
    }
}

function startGame() {
    const nameInput = document.getElementById('playerNameInput');
    const dropdown = document.getElementById('playerDropdown');
    
    playerName = dropdown.value || nameInput.value.trim() || 'Anonymous';
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    window.gameInstance = new RacingGame();
}

function restartGame() {
    location.reload();
}

function playAgain() {
    document.querySelector('[style*="z-index: 1000"]').remove();
    if (window.gameInstance) {
        window.gameInstance.stopTimer();
    }
    // Clear the game container
    const gameContainer = document.getElementById('gameContainer');
    const canvas = gameContainer.querySelector('canvas');
    if (canvas) canvas.remove();
    
    window.gameInstance = new RacingGame();
}

window.addEventListener('load', () => {
    populatePlayerDropdown();
    
    document.getElementById('playBtn').addEventListener('click', startGame);
    document.getElementById('mainSettingsBtn').addEventListener('click', () => {
        document.getElementById('settingsMenu').style.display = 'block';
    });
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    
    document.getElementById('playerDropdown').addEventListener('change', (e) => {
        const nameInput = document.getElementById('playerNameInput');
        if (e.target.value) {
            nameInput.value = e.target.value;
            nameInput.style.display = 'none';
        } else {
            nameInput.style.display = 'inline-block';
            nameInput.value = '';
        }
    });
    
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsMenu = document.getElementById('settingsMenu');
    const gameContainer = document.getElementById('gameContainer');
    const resumeBtn = document.getElementById('resumeBtn');
    const respawnBtn = document.getElementById('respawnBtn');
    const controlsModal = document.getElementById('controlsModal');
    
    let isPaused = false;
    
    function toggleSettings() {
        isPaused = !isPaused;
        if (isPaused) {
            settingsMenu.style.display = 'block';
            gameContainer.classList.add('paused');
            if (window.gameInstance) {
                window.gameInstance.pauseGame();
            }
        } else {
            settingsMenu.style.display = 'none';
            gameContainer.classList.remove('paused');
            if (window.gameInstance) {
                window.gameInstance.resumeGame();
            }
        }
    }
    
    settingsBtn.addEventListener('click', toggleSettings);
    resumeBtn.addEventListener('click', () => { toggleSettings(); });
    respawnBtn.addEventListener('click', () => { window.gameInstance.car.respawn(); toggleSettings(); });
    document.getElementById('leaderboardBtn').addEventListener('click', () => {
        displayLeaderboard();
        document.getElementById('leaderboardModal').style.display = 'block';
        if (window.gameInstance) window.gameInstance.pauseGame();
    });
    document.getElementById('quitBtn').addEventListener('click', () => {
        if (window.gameInstance) {
            window.gameInstance.quitGame();
        }
    });
    document.getElementById('controlsBtn').addEventListener('click', () => { 
        controlsModal.style.display = 'block';
        if (window.gameInstance) window.gameInstance.pauseGame();
    });
    
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const carModal = document.getElementById('carCustomizeModal');
            const controlsModal = document.getElementById('controlsModal');
            const leaderboardModal = document.getElementById('leaderboardModal');
            
            if (carModal.style.display === 'block') {
                carModal.style.display = 'none';
                if (window.gameInstance) window.gameInstance.resumeGame();
            } else if (controlsModal.style.display === 'block') {
                controlsModal.style.display = 'none';
                if (window.gameInstance) window.gameInstance.resumeGame();
            } else if (leaderboardModal.style.display === 'block') {
                leaderboardModal.style.display = 'none';
                if (window.gameInstance) window.gameInstance.resumeGame();
            } else {
                toggleSettings();
            }
        }
    });
    
    document.getElementById('carCustomizeBtn').addEventListener('click', () => {
        document.getElementById('carCustomizeModal').style.display = 'block';
        if (window.gameInstance) window.gameInstance.pauseGame();
    });
    
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            const color = parseInt(e.target.dataset.color);
            
            e.target.parentNode.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            if (type === 'body') {
                window.gameInstance.car.changeBodyColor(color);
            } else if (type === 'wheels') {
                window.gameInstance.car.changeWheelColor(color);
            }
        });
    });
    
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const size = e.target.dataset.size;
            
            e.target.parentNode.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            window.gameInstance.car.changeCarSize(size);
        });
    });
});
