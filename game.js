// Game variables - UPDATED: Fixed all neon function calls
console.log('JavaScript reloaded - all neon functions converted to starlight');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const powerUpElement = document.getElementById('activePowerUps');
const fuelElement = document.getElementById('fuel');

let score = 0;
let gameRunning = true;
let currentLevel = 1;
let levelComplete = false;
let levelTransition = false;
let transitionTimer = 0;

// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MARIO_SPEED = 5;

// Mario object
const mario = {
    x: 100,
    y: 200, // Position Mario in visible area of screen
    width: 32,
    height: 32,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 15,
    onGround: true, // Start Mario on ground
    facing: 1, // 1 for right, -1 for left
    animFrame: 0, // For walking animation
    animTimer: 0,
    powerUps: {
        super: false,        // Super Mushroom - bigger Mario
        fire: false,         // Fire Flower - shoot fireballs
        star: false,         // Star - invincibility
        speed: false,        // Speed Boost - faster movement
        jump: false          // Jump Boost - higher jumps
    },
    // Fuel system for airplane
    fuel: 100,              // Current fuel level (0-100)
    maxFuel: 100,           // Maximum fuel capacity
    fuelConsumption: 3,     // Fuel consumed per interval (fast depletion for challenge)
    fuelTimer: 0,           // Timer for fuel consumption
    fuelRefillAmount: 25,   // Fuel gained per fuel tank collected
    lowFuelWarning: 30,     // Warning threshold for low fuel (increased from 20 to 30)
    powerUpTimers: {
        star: 0,
        speed: 0,
        jump: 0
    }
};

// Level configurations
const levelConfigs = {
    1: {
        name: "Grassland Plains",
        background: "grassland",
        platforms: [
            { x: 0, y: 350, width: 200, height: 50 },
            { x: 250, y: 300, width: 150, height: 20 },
            { x: 450, y: 250, width: 100, height: 20 },
            { x: 600, y: 200, width: 200, height: 20 },
            { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 }
        ],
        enemies: [
            { x: 300, y: 280, width: 24, height: 24, speed: 1, direction: 1, type: 'goomba' },
            { x: 500, y: 230, width: 24, height: 24, speed: 1.2, direction: -1, type: 'goomba' }
        ],
        coins: [
            { x: 280, y: 260, width: 16, height: 16, collected: false },
            { x: 480, y: 210, width: 16, height: 16, collected: false },
            { x: 650, y: 160, width: 16, height: 16, collected: false }
        ],
        powerUps: [
            { x: 350, y: 220, width: 20, height: 20, type: 'super', collected: false }
        ]
    },
    2: {
        name: "Desert Dunes",
        background: "desert",
        platforms: [
            { x: 0, y: 320, width: 150, height: 30 },
            { x: 200, y: 280, width: 100, height: 20 },
            { x: 350, y: 240, width: 120, height: 20 },
            { x: 520, y: 200, width: 80, height: 20 },
            { x: 650, y: 160, width: 150, height: 20 },
            { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 }
        ],
        enemies: [
            { x: 250, y: 260, width: 24, height: 24, speed: 1.5, direction: 1, type: 'goomba' },
            { x: 400, y: 220, width: 28, height: 28, speed: 0.8, direction: -1, type: 'koopa' },
            { x: 700, y: 140, width: 24, height: 24, speed: 1.8, direction: 1, type: 'goomba' }
        ],
        coins: [
            { x: 180, y: 250, width: 16, height: 16, collected: false },
            { x: 380, y: 210, width: 16, height: 16, collected: false },
            { x: 550, y: 170, width: 16, height: 16, collected: false },
            { x: 720, y: 130, width: 16, height: 16, collected: false }
        ],
        powerUps: [
            { x: 450, y: 170, width: 20, height: 20, type: 'fire', collected: false }
        ]
    },
    3: {
        name: "Underground Caves",
        background: "cave",
        platforms: [
            { x: 0, y: 300, width: 120, height: 40 },
            { x: 170, y: 260, width: 80, height: 20 },
            { x: 300, y: 220, width: 60, height: 20 },
            { x: 410, y: 180, width: 90, height: 20 },
            { x: 550, y: 140, width: 70, height: 20 },
            { x: 670, y: 200, width: 130, height: 30 },
            { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 }
        ],
        enemies: [
            { x: 200, y: 240, width: 24, height: 24, speed: 2, direction: 1, type: 'goomba' },
            { x: 330, y: 200, width: 28, height: 28, speed: 1.2, direction: -1, type: 'koopa' },
            { x: 580, y: 120, width: 24, height: 24, speed: 2.2, direction: 1, type: 'goomba' },
            { x: 720, y: 180, width: 32, height: 32, speed: 0.6, direction: -1, type: 'spiny' }
        ],
        coins: [
            { x: 150, y: 230, width: 16, height: 16, collected: false },
            { x: 280, y: 190, width: 16, height: 16, collected: false },
            { x: 440, y: 150, width: 16, height: 16, collected: false },
            { x: 600, y: 110, width: 16, height: 16, collected: false },
            { x: 750, y: 170, width: 16, height: 16, collected: false }
        ],
        powerUps: [
            { x: 500, y: 110, width: 20, height: 20, type: 'star', collected: false }
        ]
    },
    4: {
        name: "Ice Mountains",
        background: "ice",
        platforms: [
            { x: 0, y: 280, width: 100, height: 30 },
            { x: 150, y: 240, width: 70, height: 20 },
            { x: 270, y: 200, width: 60, height: 20 },
            { x: 380, y: 160, width: 80, height: 20 },
            { x: 510, y: 120, width: 60, height: 20 },
            { x: 620, y: 160, width: 70, height: 20 },
            { x: 740, y: 200, width: 60, height: 20 },
            { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 }
        ],
        enemies: [
            { x: 180, y: 220, width: 28, height: 28, speed: 1.8, direction: 1, type: 'koopa' },
            { x: 300, y: 180, width: 24, height: 24, speed: 2.5, direction: -1, type: 'goomba' },
            { x: 540, y: 100, width: 32, height: 32, speed: 1, direction: 1, type: 'spiny' },
            { x: 650, y: 140, width: 28, height: 28, speed: 2, direction: -1, type: 'koopa' },
            { x: 770, y: 180, width: 24, height: 24, speed: 2.8, direction: 1, type: 'goomba' }
        ],
        coins: [
            { x: 130, y: 210, width: 16, height: 16, collected: false },
            { x: 250, y: 170, width: 16, height: 16, collected: false },
            { x: 410, y: 130, width: 16, height: 16, collected: false },
            { x: 570, y: 90, width: 16, height: 16, collected: false },
            { x: 690, y: 130, width: 16, height: 16, collected: false },
            { x: 770, y: 170, width: 16, height: 16, collected: false }
        ],
        powerUps: [
            { x: 340, y: 110, width: 20, height: 20, type: 'speed', collected: false }
        ]
    },
    5: {
        name: "Lava Castle",
        background: "lava",
        platforms: [
            { x: 0, y: 260, width: 80, height: 30 },
            { x: 130, y: 220, width: 60, height: 20 },
            { x: 240, y: 180, width: 50, height: 20 },
            { x: 340, y: 140, width: 60, height: 20 },
            { x: 450, y: 100, width: 50, height: 20 },
            { x: 550, y: 140, width: 60, height: 20 },
            { x: 660, y: 180, width: 50, height: 20 },
            { x: 760, y: 220, width: 40, height: 20 },
            { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 }
        ],
        enemies: [
            { x: 160, y: 200, width: 32, height: 32, speed: 1.5, direction: 1, type: 'spiny' },
            { x: 270, y: 160, width: 28, height: 28, speed: 2.5, direction: -1, type: 'koopa' },
            { x: 370, y: 120, width: 24, height: 24, speed: 3, direction: 1, type: 'goomba' },
            { x: 480, y: 80, width: 32, height: 32, speed: 1.8, direction: -1, type: 'spiny' },
            { x: 580, y: 120, width: 28, height: 28, speed: 2.8, direction: 1, type: 'koopa' },
            { x: 690, y: 160, width: 24, height: 24, speed: 3.2, direction: -1, type: 'goomba' },
            { x: 780, y: 200, width: 32, height: 32, speed: 2, direction: 1, type: 'spiny' }
        ],
        coins: [
            { x: 110, y: 190, width: 16, height: 16, collected: false },
            { x: 220, y: 150, width: 16, height: 16, collected: false },
            { x: 320, y: 110, width: 16, height: 16, collected: false },
            { x: 430, y: 70, width: 16, height: 16, collected: false },
            { x: 530, y: 110, width: 16, height: 16, collected: false },
            { x: 640, y: 150, width: 16, height: 16, collected: false },
            { x: 740, y: 190, width: 16, height: 16, collected: false },
            { x: 400, y: 50, width: 16, height: 16, collected: false } // Bonus coin
        ],
        powerUps: [
            { x: 290, y: 80, width: 20, height: 20, type: 'jump', collected: false }
        ]
    }
};

// Current level data (will be populated by loadLevel function)
let platforms = [];
let enemies = [];
let coins = [];
let powerUps = [];

// Boss system
let boss = null;
let bossActive = false;
let bossDefeated = false;
const bossProjectiles = [];

// Boss configurations for each level - Sky-Themed Aviation Bosses
const bossConfigs = {
    1: { name: "Sky Hawk Fighter", type: "fighter_jet", health: 4, size: 80 },
    2: { name: "Desert Wind Bomber", type: "bomber", health: 5, size: 90 },
    3: { name: "Night Stealth Drone", type: "stealth_drone", health: 6, size: 85 },
    4: { name: "Arctic Storm Eagle", type: "storm_eagle", health: 8, size: 100 },
    5: { name: "Storm Dragon Lord", type: "storm_dragon", health: 12, size: 120 }
};

// Explosion system
const explosions = [];
let dustParticles = []; // For movement effects
let neonTime = 0; // For animated neon effects

function createExplosion(x, y) {
    const explosion = {
        x: x,
        y: y,
        particles: [],
        life: 30 // frames
    };
    
    // Create particles for the explosion
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        explosion.particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 3,
            color: ['#FFD700', '#FFA500', '#FF6347', '#FFFF00', '#FF4500'][Math.floor(Math.random() * 5)],
            life: 30
        });
    }
    
    explosions.push(explosion);
}

// Level management functions
function loadLevel(levelNumber) {
    const config = levelConfigs[levelNumber];
    if (!config) return false;
    
    // Reset Mario position
    mario.x = 50;
    mario.y = 200;
    mario.velocityX = 0;
    mario.velocityY = 0;
    mario.onGround = false;
    
    // Load level data
    platforms = JSON.parse(JSON.stringify(config.platforms)); // Deep copy
    enemies = JSON.parse(JSON.stringify(config.enemies)); // Deep copy
    coins = JSON.parse(JSON.stringify(config.coins)); // Deep copy
    powerUps = JSON.parse(JSON.stringify(config.powerUps || [])); // Deep copy
    
    // Reset Mario's power-up state
    mario.powerUps = {
        super: false,
        fire: false,
        star: false,
        speed: false,
        jump: false
    };
    mario.powerUpTimers = {
        star: 0,
        speed: 0,
        jump: 0
    };
    
    // Reset Mario size if he was super
    mario.width = 32;
    mario.height = 32;
    
    // Clear explosions
    explosions.length = 0;
    
    // Reset boss system
    boss = null;
    bossActive = false;
    bossDefeated = false;
    bossProjectiles.length = 0;
    
    // Reset level state
    levelComplete = false;
    levelTransition = false;
    transitionTimer = 0;
    
    return true;
}

function checkLevelComplete() {
    const remainingCoins = coins.filter(coin => !coin.collected).length;
    
    if (remainingCoins === 0 && !bossActive && !bossDefeated) {
        // All coins collected, spawn the boss
        spawnBoss();
    } else if (bossDefeated) {
        // Boss defeated, advance to next level
        score += 500; // Big bonus for defeating boss
        nextLevel();
    }
}

// Boss system functions
function spawnBoss() {
    const config = bossConfigs[currentLevel];
    if (!config) return;
    
    boss = {
        x: canvas.width - config.size - 50,
        y: canvas.height - 200,
        width: config.size,
        height: config.size,
        health: config.health,
        maxHealth: config.health,
        type: config.type,
        name: config.name,
        velocityX: -2,
        velocityY: 0,
        attackTimer: 0,
        hitTimer: 0,
        direction: -1
    };
    
    bossActive = true;
    bossDefeated = false;
    
    // Show boss introduction
    console.log(`Boss spawned: ${config.name}`);
}

function updateBoss() {
    if (!boss || !bossActive) return;
    
    // Boss movement AI
    boss.x += boss.velocityX;
    
    // Bounce off screen edges
    if (boss.x <= 0 || boss.x >= canvas.width - boss.width) {
        boss.velocityX *= -1;
        boss.direction *= -1;
    }
    
    // Boss attack pattern
    boss.attackTimer++;
    if (boss.attackTimer >= 120) { // Attack every 2 seconds
        bossAttack();
        boss.attackTimer = 0;
    }
    
    // Update hit timer
    if (boss.hitTimer > 0) {
        boss.hitTimer--;
    }
    
    // Check collision with Mario
    if (checkCollision(mario, boss) && boss.hitTimer === 0) {
        // Mario hits boss
        boss.health--;
        boss.hitTimer = 60; // 1 second invincibility
        
        // Create explosion at boss
        createExplosion(boss.x + boss.width/2, boss.y + boss.height/2);
        
        if (boss.health <= 0) {
            // Boss defeated
            bossDefeated = true;
            bossActive = false;
            score += 1000; // Bonus for defeating boss
            
            // Create big explosion
            for (let i = 0; i < 5; i++) {
                createExplosion(
                    boss.x + Math.random() * boss.width,
                    boss.y + Math.random() * boss.height
                );
            }
        }
    }
}

function bossAttack() {
    if (!boss || !bossActive) return;
    
    // Create projectile aimed at Mario
    const projectile = {
        x: boss.x + boss.width/2,
        y: boss.y + boss.height/2,
        width: 8,
        height: 8,
        velocityX: mario.x < boss.x ? -4 : 4,
        velocityY: -2,
        gravity: 0.1
    };
    
    bossProjectiles.push(projectile);
}

function updateBossProjectiles() {
    for (let i = bossProjectiles.length - 1; i >= 0; i--) {
        const proj = bossProjectiles[i];
        
        // Update projectile physics
        proj.x += proj.velocityX;
        proj.y += proj.velocityY;
        proj.velocityY += proj.gravity;
        
        // Remove if off screen
        if (proj.x < -50 || proj.x > canvas.width + 50 || proj.y > canvas.height + 50) {
            bossProjectiles.splice(i, 1);
            continue;
        }
        
        // Check collision with Mario
        if (checkCollision(mario, proj)) {
            // Mario hit by projectile - could add damage system here
            createExplosion(proj.x, proj.y);
            bossProjectiles.splice(i, 1);
        }
    }
}

function drawBoss() {
    if (!boss || !bossActive) return;
    
    const x = boss.x;
    const y = boss.y;
    const w = boss.width;
    const h = boss.height;
    
    // Flash red when hit
    const isHit = boss.hitTimer > 0 && Math.floor(boss.hitTimer / 5) % 2;
    
    // Draw boss based on type
    switch (boss.type) {
        case 'fighter_jet':
            drawBossFighterJet(x, y, w, h, boss.direction, isHit);
            break;
        case 'bomber':
            drawBossBomber(x, y, w, h, boss.direction, isHit);
            break;
        case 'stealth_drone':
            drawBossStealthDrone(x, y, w, h, boss.direction, isHit);
            break;
        case 'storm_eagle':
            drawBossStormEagle(x, y, w, h, boss.direction, isHit);
            break;
        case 'storm_dragon':
            drawBossStormDragon(x, y, w, h, boss.direction, isHit);
            break;
    }
    
    // Draw boss health bar
    drawBossHealthBar();
    
    // Draw boss name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(boss.name, canvas.width/2, 30);
}

function drawBossHealthBar() {
    const barWidth = 200;
    const barHeight = 10;
    const barX = (canvas.width - barWidth) / 2;
    const barY = 50;
    
    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Health
    const healthPercent = boss.health / boss.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFFF00' : '#FF0000';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    
    // Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
}

function drawBossFighterJet(x, y, w, h, direction, isHit) {
    const time = Date.now() * 0.003;
    const jetColor = isHit ? '#FF6666' : '#4682B4'; // Steel blue fighter jet
    
    // Main fuselage (sleek fighter jet body)
    ctx.fillStyle = jetColor;
    ctx.fillRect(x + w*0.2, y + h*0.4, w*0.6, h*0.2);
    
    // Jet nose cone (pointed)
    ctx.fillStyle = '#2F4F4F';
    ctx.beginPath();
    ctx.moveTo(x + w*0.8, y + h*0.5);
    ctx.lineTo(x + w*0.95, y + h*0.5);
    ctx.lineTo(x + w*0.8, y + h*0.45);
    ctx.lineTo(x + w*0.8, y + h*0.55);
    ctx.closePath();
    ctx.fill();
    
    // Fighter jet wings (swept back)
    ctx.fillStyle = isHit ? '#FF8888' : '#5F9EA0';
    ctx.beginPath();
    ctx.moveTo(x + w*0.3, y + h*0.45);
    ctx.lineTo(x + w*0.1, y + h*0.2);
    ctx.lineTo(x + w*0.2, y + h*0.2);
    ctx.lineTo(x + w*0.4, y + h*0.4);
    ctx.closePath();
    ctx.fill();
    
    // Right wing
    ctx.beginPath();
    ctx.moveTo(x + w*0.3, y + h*0.55);
    ctx.lineTo(x + w*0.1, y + h*0.8);
    ctx.lineTo(x + w*0.2, y + h*0.8);
    ctx.lineTo(x + w*0.4, y + h*0.6);
    ctx.closePath();
    ctx.fill();
    
    // Jet engines (twin engines)
    ctx.fillStyle = '#696969';
    ctx.fillRect(x + w*0.05, y + h*0.35, w*0.15, h*0.1);
    ctx.fillRect(x + w*0.05, y + h*0.55, w*0.15, h*0.1);
    
    // Engine exhaust flames
    if (Math.random() < 0.7) {
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(x - w*0.05, y + h*0.37, w*0.1, h*0.06);
        ctx.fillRect(x - w*0.05, y + h*0.57, w*0.1, h*0.06);
        
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x - w*0.03, y + h*0.38, w*0.06, h*0.04);
        ctx.fillRect(x - w*0.03, y + h*0.58, w*0.06, h*0.04);
    }
    
    // Cockpit canopy
    ctx.fillStyle = 'rgba(135, 206, 235, 0.6)';
    ctx.fillRect(x + w*0.5, y + h*0.35, w*0.2, h*0.1);
    
    // Pilot silhouette
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + w*0.55, y + h*0.37, w*0.1, h*0.06);
    
    // Starlight effects around fighter jet
    drawStarlightRect(x - 5, y - 5, w + 10, h + 10, '#87CEEB', 1.0);
}

// Level 2 Boss: Desert Wind Bomber
function drawBossBomber(x, y, w, h, direction, isHit) {
    const time = Date.now() * 0.002;
    const bomberColor = isHit ? '#FF6666' : '#8B4513'; // Desert brown bomber
    
    // Heavy bomber fuselage (thick and robust)
    ctx.fillStyle = bomberColor;
    ctx.fillRect(x + w*0.15, y + h*0.35, w*0.7, h*0.3);
    
    // Bomber nose (rounded)
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.arc(x + w*0.85, y + h*0.5, h*0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Large bomber wings (wide wingspan)
    ctx.fillStyle = isHit ? '#FF8888' : '#A0522D';
    ctx.fillRect(x + w*0.1, y + h*0.45, w*0.8, h*0.1);
    
    // Wing engines (4 engines for heavy bomber)
    ctx.fillStyle = '#2F4F4F';
    ctx.fillRect(x + w*0.2, y + h*0.4, w*0.08, h*0.2);
    ctx.fillRect(x + w*0.35, y + h*0.4, w*0.08, h*0.2);
    ctx.fillRect(x + w*0.57, y + h*0.4, w*0.08, h*0.2);
    ctx.fillRect(x + w*0.72, y + h*0.4, w*0.08, h*0.2);
    
    // Propellers (spinning)
    const propAngle = time * 0.5;
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 4; i++) {
        const propX = x + w*(0.24 + i*0.15);
        const propY = y + h*0.5;
        
        ctx.save();
        ctx.translate(propX, propY);
        ctx.rotate(propAngle + i * 0.3);
        
        // 4-blade propeller
        for (let blade = 0; blade < 4; blade++) {
            ctx.save();
            ctx.rotate((blade * Math.PI) / 2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -w*0.06);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    }
    
    // Bomber cockpit (large windscreen)
    ctx.fillStyle = 'rgba(135, 206, 235, 0.5)';
    ctx.fillRect(x + w*0.6, y + h*0.25, w*0.2, h*0.2);
    
    // Crew silhouettes
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + w*0.62, y + h*0.28, w*0.04, h*0.08);
    ctx.fillRect(x + w*0.68, y + h*0.28, w*0.04, h*0.08);
    ctx.fillRect(x + w*0.74, y + h*0.28, w*0.04, h*0.08);
    
    // Bomb bay doors (occasionally open)
    if (Math.random() < 0.3) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + w*0.4, y + h*0.65, w*0.2, h*0.05);
        
        // Falling bombs
        ctx.fillStyle = '#2F4F4F';
        for (let i = 0; i < 3; i++) {
            const bombX = x + w*0.45 + i*w*0.05;
            const bombY = y + h*0.7 + i*10;
            ctx.fillRect(bombX, bombY, w*0.03, h*0.08);
        }
    }
    
    // Desert sand dust trail
    ctx.fillStyle = 'rgba(210, 180, 140, 0.4)';
    for (let i = 0; i < 8; i++) {
        const dustX = x - w*0.1 - i*5;
        const dustY = y + h*0.6 + Math.sin(time + i) * 3;
        ctx.fillRect(dustX, dustY, 4, 3);
    }
    
    // Starlight effects around bomber
    drawStarlightRect(x - 8, y - 8, w + 16, h + 16, '#DAA520', 1.2);
}

// Level 5 Boss: Storm Dragon Lord
function drawBossStormDragon(x, y, w, h, direction, isHit) {
    // STORM DRAGON - Epic Sky-Themed Final Boss
    const time = Date.now() * 0.005;
    const bodyColor = isHit ? '#AA44AA' : '#4A0E4E'; // Dark purple storm dragon
    
    // Dragon body (serpentine and majestic)
    ctx.fillStyle = bodyColor;
    const bodySegments = 6;
    for (let i = 0; i < bodySegments; i++) {
        const segmentX = x + (i * w / bodySegments);
        const segmentY = y + h*0.4 + Math.sin(time + i * 0.5) * 8; // Undulating movement
        const segmentW = w / bodySegments + 5;
        const segmentH = h * 0.3;
        
        ctx.fillStyle = i % 2 === 0 ? bodyColor : '#5A1E5E'; // Alternating segments
        ctx.fillRect(segmentX, segmentY, segmentW, segmentH);
        
        // Dragon scales
        ctx.fillStyle = '#6A2E6E';
        ctx.fillRect(segmentX + 2, segmentY + 2, segmentW - 4, 3);
        ctx.fillRect(segmentX + 2, segmentY + segmentH - 5, segmentW - 4, 3);
    }
    
    // Massive dragon wings (animated)
    const wingFlap = Math.sin(time * 2) * 0.3;
    ctx.fillStyle = isHit ? '#8833AA' : '#2D1B69'; // Dark blue-purple wings
    
    // Left wing
    ctx.beginPath();
    ctx.moveTo(x + w*0.2, y + h*0.3);
    ctx.lineTo(x - w*0.3, y + h*0.1 + wingFlap * 20);
    ctx.lineTo(x - w*0.4, y + h*0.6 + wingFlap * 15);
    ctx.lineTo(x + w*0.3, y + h*0.7);
    ctx.closePath();
    ctx.fill();
    
    // Right wing
    ctx.beginPath();
    ctx.moveTo(x + w*0.8, y + h*0.3);
    ctx.lineTo(x + w*1.3, y + h*0.1 + wingFlap * 20);
    ctx.lineTo(x + w*1.4, y + h*0.6 + wingFlap * 15);
    ctx.lineTo(x + w*0.7, y + h*0.7);
    ctx.closePath();
    ctx.fill();
    
    // Wing membrane details
    ctx.strokeStyle = '#1A0D3A';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Dragon head (majestic and fierce)
    ctx.fillStyle = isHit ? '#BB55BB' : '#5A1E5E';
    ctx.fillRect(x + w*0.35, y + h*0.1, w*0.3, h*0.35);
    
    // Dragon snout
    ctx.fillStyle = '#4A0E4E';
    ctx.fillRect(x + w*0.4, y + h*0.25, w*0.2, h*0.15);
    
    // Glowing storm eyes
    const eyeGlow = 0.7 + Math.sin(time * 3) * 0.3;
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 10;
    ctx.fillStyle = `rgba(0, 255, 255, ${eyeGlow})`; // Cyan storm eyes
    ctx.fillRect(x + w*0.38, y + h*0.15, w*0.06, h*0.08);
    ctx.fillRect(x + w*0.56, y + h*0.15, w*0.06, h*0.08);
    ctx.shadowBlur = 0;
    
    // Dragon horns (lightning rod-like)
    ctx.fillStyle = '#FFD700'; // Golden horns
    ctx.fillRect(x + w*0.37, y + h*0.05, w*0.04, h*0.15);
    ctx.fillRect(x + w*0.59, y + h*0.05, w*0.04, h*0.15);
    
    // Lightning effects around horns
    if (Math.random() < 0.3) {
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + w*0.39, y + h*0.05);
        ctx.lineTo(x + w*0.35, y - 10);
        ctx.moveTo(x + w*0.61, y + h*0.05);
        ctx.lineTo(x + w*0.65, y - 10);
        ctx.stroke();
    }
    
    // Dragon nostrils (breathing storm clouds)
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(x + w*0.43, y + h*0.32, w*0.02, h*0.03);
    ctx.fillRect(x + w*0.55, y + h*0.32, w*0.02, h*0.03);
    
    // Storm cloud breath
    if (Math.random() < 0.4) {
        ctx.fillStyle = 'rgba(135, 206, 235, 0.6)';
        for (let i = 0; i < 5; i++) {
            const cloudX = x + w*0.6 + i * 8;
            const cloudY = y + h*0.3 + Math.random() * 10;
            ctx.fillRect(cloudX, cloudY, 6, 4);
        }
    }
    
    // Starlight effects around the Storm Dragon
    drawStarlightCircle(x + w/2, y + h/2, w/2 + 10, '#4169E1', 1.5);
    
    // Dragon tail with storm energy
    ctx.fillStyle = bodyColor;
    const tailX = x + w*0.9;
    const tailY = y + h*0.5 + Math.sin(time * 1.5) * 12;
    ctx.fillRect(tailX, tailY, w*0.2, h*0.2);
    ctx.fillRect(tailX + w*0.15, tailY - h*0.1, w*0.1, h*0.3);
    
    // Storm energy crackling around tail
    if (Math.random() < 0.2) {
        ctx.strokeStyle = '#9370DB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tailX + w*0.2, tailY);
        ctx.lineTo(tailX + w*0.3 + Math.random() * 20, tailY + Math.random() * 20 - 10);
        ctx.stroke();
    }
}

// Level 3 Boss: Night Stealth Drone
function drawBossStealthDrone(x, y, w, h, direction, isHit) {
    const time = Date.now() * 0.004;
    const droneColor = isHit ? '#FF6666' : '#2F2F2F'; // Dark stealth drone
    
    // Stealth drone body (angular and sleek)
    ctx.fillStyle = droneColor;
    ctx.beginPath();
    ctx.moveTo(x + w*0.5, y + h*0.2);
    ctx.lineTo(x + w*0.8, y + h*0.4);
    ctx.lineTo(x + w*0.7, y + h*0.6);
    ctx.lineTo(x + w*0.3, y + h*0.6);
    ctx.lineTo(x + w*0.2, y + h*0.4);
    ctx.closePath();
    ctx.fill();
    
    // Stealth coating (matte finish)
    ctx.fillStyle = isHit ? '#FF8888' : '#1A1A1A';
    ctx.beginPath();
    ctx.moveTo(x + w*0.45, y + h*0.25);
    ctx.lineTo(x + w*0.75, y + h*0.42);
    ctx.lineTo(x + w*0.65, y + h*0.55);
    ctx.lineTo(x + w*0.35, y + h*0.55);
    ctx.lineTo(x + w*0.25, y + h*0.42);
    ctx.closePath();
    ctx.fill();
    
    // Drone rotors (4 rotors for quadcopter design)
    const rotorSpeed = time * 2;
    ctx.strokeStyle = isHit ? '#FF6666' : '#666666';
    ctx.lineWidth = 1;
    
    const rotorPositions = [
        {x: x + w*0.15, y: y + h*0.15},
        {x: x + w*0.85, y: y + h*0.15},
        {x: x + w*0.15, y: y + h*0.75},
        {x: x + w*0.85, y: y + h*0.75}
    ];
    
    rotorPositions.forEach((rotor, i) => {
        ctx.save();
        ctx.translate(rotor.x, rotor.y);
        ctx.rotate(rotorSpeed + i * 0.5);
        
        // Rotor blades (spinning fast - barely visible)
        for (let blade = 0; blade < 4; blade++) {
            ctx.save();
            ctx.rotate((blade * Math.PI) / 2);
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -w*0.08);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    });
    ctx.globalAlpha = 1.0;
    
    // Camera/sensor pod (glowing red)
    ctx.fillStyle = isHit ? '#FFAAAA' : '#FF0000';
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(x + w*0.5, y + h*0.45, w*0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Stealth exhaust (minimal heat signature)
    if (Math.random() < 0.1) {
        ctx.fillStyle = 'rgba(100, 100, 150, 0.3)';
        ctx.fillRect(x - w*0.05, y + h*0.48, w*0.08, h*0.04);
    }
    
    // Night camo pattern
    ctx.fillStyle = 'rgba(0, 0, 50, 0.4)';
    for (let i = 0; i < 6; i++) {
        const camX = x + w*0.3 + (i % 3) * w*0.15;
        const camY = y + h*0.35 + Math.floor(i / 3) * h*0.15;
        ctx.fillRect(camX, camY, w*0.08, h*0.08);
    }
    
    // Starlight effects (minimal for stealth)
    drawStarlightRect(x - 3, y - 3, w + 6, h + 6, '#4B0082', 0.5);
}

// Level 4 Boss: Arctic Storm Eagle
function drawBossStormEagle(x, y, w, h, direction, isHit) {
    const time = Date.now() * 0.003;
    const eagleColor = isHit ? '#FF6666' : '#F8F8FF'; // Arctic white eagle
    
    // Eagle body (majestic and powerful)
    ctx.fillStyle = eagleColor;
    ctx.fillRect(x + w*0.35, y + h*0.4, w*0.3, h*0.4);
    
    // Eagle head (fierce and regal)
    ctx.fillStyle = isHit ? '#FFAAAA' : '#FFFAFA';
    ctx.fillRect(x + w*0.4, y + h*0.2, w*0.2, h*0.25);
    
    // Sharp beak (golden)
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(x + w*0.6, y + h*0.32);
    ctx.lineTo(x + w*0.7, y + h*0.35);
    ctx.lineTo(x + w*0.6, y + h*0.38);
    ctx.closePath();
    ctx.fill();
    
    // Piercing eagle eyes
    ctx.fillStyle = isHit ? '#FF0000' : '#FFD700';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 3;
    ctx.fillRect(x + w*0.42, y + h*0.25, w*0.03, h*0.04);
    ctx.fillRect(x + w*0.55, y + h*0.25, w*0.03, h*0.04);
    ctx.shadowBlur = 0;
    
    // Massive eagle wings (animated flight)
    const wingFlap = Math.sin(time * 1.5) * 0.4;
    ctx.fillStyle = isHit ? '#DDDDFF' : '#E6E6FA';
    
    // Left wing
    ctx.beginPath();
    ctx.moveTo(x + w*0.35, y + h*0.45);
    ctx.lineTo(x - w*0.2, y + h*0.2 + wingFlap * 25);
    ctx.lineTo(x - w*0.3, y + h*0.7 + wingFlap * 20);
    ctx.lineTo(x + w*0.2, y + h*0.8);
    ctx.closePath();
    ctx.fill();
    
    // Right wing
    ctx.beginPath();
    ctx.moveTo(x + w*0.65, y + h*0.45);
    ctx.lineTo(x + w*1.2, y + h*0.2 + wingFlap * 25);
    ctx.lineTo(x + w*1.3, y + h*0.7 + wingFlap * 20);
    ctx.lineTo(x + w*0.8, y + h*0.8);
    ctx.closePath();
    ctx.fill();
    
    // Wing feather details
    ctx.strokeStyle = '#C0C0C0';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
        // Left wing feathers
        ctx.beginPath();
        ctx.moveTo(x + w*0.1 - i*w*0.04, y + h*0.3 + i*h*0.06);
        ctx.lineTo(x + w*0.3, y + h*0.5 + i*h*0.04);
        ctx.stroke();
        
        // Right wing feathers
        ctx.beginPath();
        ctx.moveTo(x + w*0.9 + i*w*0.04, y + h*0.3 + i*h*0.06);
        ctx.lineTo(x + w*0.7, y + h*0.5 + i*h*0.04);
        ctx.stroke();
    }
    
    // Powerful talons (golden)
    ctx.fillStyle = '#B8860B';
    ctx.fillRect(x + w*0.38, y + h*0.75, w*0.04, h*0.1);
    ctx.fillRect(x + w*0.44, y + h*0.75, w*0.04, h*0.1);
    ctx.fillRect(x + w*0.52, y + h*0.75, w*0.04, h*0.1);
    ctx.fillRect(x + w*0.58, y + h*0.75, w*0.04, h*0.1);
    
    // Storm energy crackling around eagle
    if (Math.random() < 0.4) {
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + w*0.5, y + h*0.2);
        ctx.lineTo(x + w*0.4 + Math.random() * w*0.2, y + h*0.1 + Math.random() * 10);
        ctx.moveTo(x + w*0.5, y + h*0.2);
        ctx.lineTo(x + w*0.6 + Math.random() * w*0.2, y + h*0.1 + Math.random() * 10);
        ctx.stroke();
    }
    
    // Arctic wind effects
    ctx.fillStyle = 'rgba(240, 248, 255, 0.6)';
    for (let i = 0; i < 12; i++) {
        const windX = x - w*0.1 - i*8;
        const windY = y + h*0.3 + Math.sin(time + i*0.3) * 15;
        ctx.fillRect(windX, windY, 6, 2);
    }
    
    // Starlight effects around storm eagle
    drawStarlightCircle(x + w/2, y + h/2, w/2 + 15, '#87CEEB', 1.3);
}

function drawBossProjectiles() {
    ctx.fillStyle = '#FF4444';
    for (const proj of bossProjectiles) {
        ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
        
        // Add glow effect
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 10;
        ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
        ctx.shadowBlur = 0;
    }
}

function drawFuelGauge() {
    const gaugeX = 20;
    const gaugeY = 20;
    const gaugeWidth = 150;
    const gaugeHeight = 20;
    
    // Fuel gauge background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(gaugeX - 5, gaugeY - 5, gaugeWidth + 10, gaugeHeight + 10);
    
    // Fuel gauge border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight);
    
    // Fuel level calculation
    const fuelPercent = mario.fuel / mario.maxFuel;
    const fuelWidth = gaugeWidth * fuelPercent;
    
    // Fuel color based on level
    let fuelColor;
    if (mario.fuel <= mario.lowFuelWarning) {
        fuelColor = '#FF0000'; // Red for low fuel
    } else if (mario.fuel <= 50) {
        fuelColor = '#FFA500'; // Orange for medium fuel
    } else {
        fuelColor = '#00AA00'; // Green for good fuel
    }
    
    // Draw fuel level
    ctx.fillStyle = fuelColor;
    ctx.fillRect(gaugeX, gaugeY, fuelWidth, gaugeHeight);
    
    // Add fuel glow effect
    ctx.shadowColor = fuelColor;
    ctx.shadowBlur = 8;
    ctx.fillRect(gaugeX, gaugeY, fuelWidth, gaugeHeight);
    ctx.shadowBlur = 0;
    
    // Fuel gauge label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('⛽ FUEL', gaugeX, gaugeY - 8);
    
    // Fuel percentage text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(mario.fuel)}%`, gaugeX + gaugeWidth/2, gaugeY + 14);
    
    // Low fuel warning flash
    if (mario.fuel <= mario.lowFuelWarning) {
        const flash = Math.sin(Date.now() * 0.01) > 0;
        if (flash) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(gaugeX - 5, gaugeY - 5, gaugeWidth + 10, gaugeHeight + 10);
            
            // Warning text
            ctx.fillStyle = '#FF0000';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('LOW FUEL!', canvas.width/2, 60);
        }
    }
}

function nextLevel() {
    if (currentLevel < 5) {
        currentLevel++;
        loadLevel(currentLevel);
    } else {
        // Game complete!
        gameComplete();
    }
}

function gameComplete() {
    gameRunning = false;
    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 GAME COMPLETE! 🎉', canvas.width/2, canvas.height/2 - 80);
    
    ctx.font = '32px Arial';
    ctx.fillText('You conquered all 5 levels!', canvas.width/2, canvas.height/2 - 30);
    
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
    ctx.fillText('Press F5 to play again', canvas.width/2, canvas.height/2 + 60);
}

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Collision detection function
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update Mario physics and movement
function updateMario() {
    // Handle input
    if (keys['ArrowLeft']) {
        mario.velocityX = -mario.speed * (mario.powerUps.speed ? 1.8 : 1);
        mario.facing = -1; // Face left
        mario.animTimer++;
        if (mario.animTimer > 8) {
            mario.animFrame = (mario.animFrame + 1) % 3;
            mario.animTimer = 0;
        }
        // Create dust particles when moving on ground
        if (mario.onGround && Math.random() < 0.3) {
            createDustParticle(mario.x + mario.width/2, mario.y + mario.height);
        }
    } else if (keys['ArrowRight']) {
        mario.velocityX = mario.speed * (mario.powerUps.speed ? 1.8 : 1);
        mario.facing = 1; // Face right
        mario.animTimer++;
        if (mario.animTimer > 8) {
            mario.animFrame = (mario.animFrame + 1) % 3;
            mario.animTimer = 0;
        }
        // Create dust particles when moving on ground
        if (mario.onGround && Math.random() < 0.3) {
            createDustParticle(mario.x + mario.width/2, mario.y + mario.height);
        }
    } else {
        mario.velocityX = 0;
        mario.animFrame = 0; // Standing still
    }
    
    // Handle jumping
    if (keys['Space'] && mario.onGround) {
        mario.velocityY = mario.powerUps.jump ? JUMP_FORCE * 1.4 : JUMP_FORCE;
        mario.onGround = false;
    }

    // Apply gravity
    mario.velocityY += GRAVITY;
    
    // Update fuel consumption (every 0.5 seconds for fast depletion)
    mario.fuelTimer++;
    if (mario.fuelTimer >= 30) { // 30 frames = 0.5 seconds (fast consumption)
        mario.fuel -= mario.fuelConsumption;
        mario.fuelTimer = 0;
        
        // Ensure fuel doesn't go below 0
        if (mario.fuel < 0) {
            mario.fuel = 0;
        }
        
        // Game over if fuel runs out
        if (mario.fuel <= 0) {
            gameOver();
        }
    }
    
    // Update position
    mario.x += mario.velocityX;
    mario.y += mario.velocityY;
    
    // Keep Mario within canvas bounds
    if (mario.x < 0) mario.x = 0;
    if (mario.x + mario.width > canvas.width) mario.x = canvas.width - mario.width;
    
    // Reset onGround flag
    mario.onGround = false;
    
    // Check platform collisions
    for (let platform of platforms) {
        if (checkCollision(mario, platform)) {
            // Landing on top of platform
            if (mario.velocityY > 0 && mario.y < platform.y) {
                mario.y = platform.y - mario.height;
                mario.velocityY = 0;
                mario.onGround = true;
            }
            // Hitting platform from below
            else if (mario.velocityY < 0 && mario.y > platform.y) {
                mario.y = platform.y + platform.height;
                mario.velocityY = 0;
            }
        }
    }
    
    // Game over if Mario falls off screen
    if (mario.y > canvas.height) {
        gameOver();
    }
}

// Update enemies
function updateEnemies() {
    for (let enemy of enemies) {
        enemy.x += enemy.speed * enemy.direction;
        
        // Reverse direction at platform edges
        let onPlatform = false;
        for (let platform of platforms) {
            if (enemy.x + enemy.width > platform.x && 
                enemy.x < platform.x + platform.width &&
                enemy.y + enemy.height >= platform.y - 5 &&
                enemy.y + enemy.height <= platform.y + 5) {
                onPlatform = true;
                break;
            }
        }
        
        if (!onPlatform || enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            enemy.direction *= -1;
        }
        
        // Check collision with Mario
        if (checkCollision(mario, enemy)) {
            if (mario.powerUps.star) {
                // Star power - Mario defeats enemy on contact
                enemy.x = -100; // Move enemy off screen
                score += 200; // Bonus points for star power defeat
                createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            } else if (mario.velocityY > 0 && mario.y < enemy.y) {
                // Mario defeats enemy by jumping on it
                enemy.x = -100; // Move enemy off screen
                mario.velocityY = JUMP_FORCE * 0.5; // Small bounce
                score += 100;
                createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            } else {
                // Mario gets hurt (unless he has star power)
                if (!mario.powerUps.star) {
                    gameOver();
                }
            }
        }
    }
}

// Update fuel tanks (formerly coins)
function updateCoins() {
    for (let coin of coins) {
        if (!coin.collected && checkCollision(mario, coin)) {
            coin.collected = true;
            score += 50;
            
            // Refuel Mario's airplane
            mario.fuel += mario.fuelRefillAmount;
            if (mario.fuel > mario.maxFuel) {
                mario.fuel = mario.maxFuel; // Cap at maximum fuel
            }
            
            // Create explosion at fuel tank center
            createExplosion(coin.x + coin.width/2, coin.y + coin.height/2);
        }
    }
}

// Update power-ups
function updatePowerUps() {
    for (let powerUp of powerUps) {
        if (!powerUp.collected && checkCollision(mario, powerUp)) {
            powerUp.collected = true;
            applyPowerUp(powerUp.type);
            score += 100; // Bonus points for power-up
            // Create special explosion for power-up
            createPowerUpExplosion(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, powerUp.type);
        }
    }
    
    // Update power-up timers
    for (let timer in mario.powerUpTimers) {
        if (mario.powerUpTimers[timer] > 0) {
            mario.powerUpTimers[timer]--;
            if (mario.powerUpTimers[timer] <= 0) {
                // Power-up expired
                mario.powerUps[timer] = false;
            }
        }
    }
}

// Apply power-up effects
function applyPowerUp(type) {
    switch (type) {
        case 'super':
            mario.powerUps.super = true;
            mario.width = 40;
            mario.height = 40;
            break;
        case 'fire':
            mario.powerUps.fire = true;
            break;
        case 'star':
            mario.powerUps.star = true;
            mario.powerUpTimers.star = 600; // 10 seconds at 60fps
            break;
        case 'speed':
            mario.powerUps.speed = true;
            mario.powerUpTimers.speed = 480; // 8 seconds at 60fps
            break;
        case 'jump':
            mario.powerUps.jump = true;
            mario.powerUpTimers.jump = 480; // 8 seconds at 60fps
            break;
    }
}

// Create special explosion for power-ups
function createPowerUpExplosion(x, y, type) {
    const explosion = {
        x: x,
        y: y,
        particles: [],
        life: 40 // longer than regular explosions
    };
    
    // Create more particles for power-up explosions
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const speed = 3 + Math.random() * 4;
        let colors;
        
        switch (type) {
            case 'super':
                colors = ['#FF0000', '#FF4500', '#FF6347'];
                break;
            case 'fire':
                colors = ['#FF4500', '#FF6347', '#FFD700', '#FFA500'];
                break;
            case 'star':
                colors = ['#FFD700', '#FFFF00', '#FFA500', '#FFFFFF'];
                break;
            case 'speed':
                colors = ['#00BFFF', '#87CEEB', '#4169E1', '#FFFFFF'];
                break;
            case 'jump':
                colors = ['#32CD32', '#00FF00', '#ADFF2F', '#FFFFFF'];
                break;
            default:
                colors = ['#FFD700', '#FFA500', '#FF6347'];
        }
        
        explosion.particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 40
        });
    }
    
    explosions.push(explosion);
}

// Update explosions
function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];

        for (let j = explosion.particles.length - 1; j >= 0; j--) {
            const particle = explosion.particles[j];

            // Update particle physics
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // Gravity
            particle.vx *= 0.98; // Air resistance
            particle.size *= 0.95; // Shrink over time
            particle.life--;

            // Remove dead particles
            if (particle.life <= 0 || particle.size < 0.5) {
                explosion.particles.splice(j, 1);
            }
        }

        // Remove empty explosions
        if (explosion.particles.length === 0) {
            explosions.splice(i, 1);
        }
    }
}

// Dust particle system for movement effects
function createDustParticle(x, y) {
    dustParticles.push({
        x: x + Math.random() * 10 - 5,
        y: y + Math.random() * 5,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2,
        size: Math.random() * 3 + 1,
        life: 20 + Math.random() * 10,
        color: `rgba(139, 69, 19, ${0.3 + Math.random() * 0.4})`
    });
}

function updateDustParticles() {
    for (let i = dustParticles.length - 1; i >= 0; i--) {
        const particle = dustParticles[i];

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // Light gravity
        particle.vx *= 0.95; // Air resistance
        particle.size *= 0.98; // Shrink
        particle.life--;

        if (particle.life <= 0 || particle.size < 0.2) {
            dustParticles.splice(i, 1);
        }
    }
}

function drawDustParticles() {
    for (const particle of dustParticles) {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Starlight effect utilities for nighttime atmosphere
function drawStarlightRect(x, y, width, height, color, glowIntensity = 1) {
    const starCount = Math.floor((width + height) / 20); // Number of stars based on size
    const time = Date.now() * 0.003;
    
    // Draw small twinkling stars around the rectangle
    for (let i = 0; i < starCount; i++) {
        const angle = (i / starCount) * Math.PI * 2;
        const distance = 15 + Math.sin(time + i) * 5;
        const starX = x + width/2 + Math.cos(angle) * distance;
        const starY = y + height/2 + Math.sin(angle) * distance;
        
        // Twinkling effect
        const twinkle = 0.3 + 0.7 * Math.sin(time * 2 + i * 0.5);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 3;
        
        // Draw star as small cross
        ctx.fillRect(starX - 1, starY, 2, 1);
        ctx.fillRect(starX, starY - 1, 1, 2);
    }
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

function drawStarlightOutline(x, y, width, height, color, thickness = 2) {
    const time = Date.now() * 0.004;
    const perimeter = 2 * (width + height);
    const starCount = Math.floor(perimeter / 25); // Stars along perimeter
    
    // Draw twinkling stars around the outline
    for (let i = 0; i < starCount; i++) {
        let starX, starY;
        const progress = i / starCount;
        
        // Position stars around the rectangle perimeter
        if (progress < 0.25) {
            // Top edge
            starX = x + (progress * 4) * width;
            starY = y;
        } else if (progress < 0.5) {
            // Right edge
            starX = x + width;
            starY = y + ((progress - 0.25) * 4) * height;
        } else if (progress < 0.75) {
            // Bottom edge
            starX = x + width - ((progress - 0.5) * 4) * width;
            starY = y + height;
        } else {
            // Left edge
            starX = x;
            starY = y + height - ((progress - 0.75) * 4) * height;
        }
        
        // Twinkling effect
        const twinkle = 0.4 + 0.6 * Math.sin(time * 3 + i * 0.3);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 2;
        
        // Draw small star
        ctx.fillRect(starX - 0.5, starY, 1, 1);
        ctx.fillRect(starX, starY - 0.5, 1, 1);
    }
    
    // Reset
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

function drawStarlightCircle(x, y, radius, color, glowIntensity = 1) {
    const time = Date.now() * 0.003;
    const starCount = Math.floor(radius / 3); // More stars for larger circles
    
    // Draw twinkling stars in a circular pattern
    for (let i = 0; i < starCount; i++) {
        const angle = (i / starCount) * Math.PI * 2;
        const distance = radius + 5 + Math.sin(time + i) * 3;
        const starX = x + Math.cos(angle) * distance;
        const starY = y + Math.sin(angle) * distance;
        
        // Twinkling effect
        const twinkle = 0.4 + 0.6 * Math.sin(time * 2.5 + i * 0.4);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 3;
        
        // Draw star as small cross
        ctx.fillRect(starX - 1, starY, 2, 1);
        ctx.fillRect(starX, starY - 1, 1, 2);
        
        // Add center dot for brighter stars
        if (i % 3 === 0) {
            ctx.fillRect(starX, starY, 1, 1);
        }
    }
    
    // Reset
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
        '255, 255, 255';
}

// Draw functions
function drawMario() {
    // Get Mario's current position and size
    const x = mario.x;
    const y = mario.y;
    const w = mario.width * 1.1;
    const h = mario.height * 1.2;
    
    // REALISTIC MARIO AIRPLANE DESIGN
    
    // Main fuselage (airplane body) - larger and more realistic
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x - 5, y + 8, w + 10, 12);
    
    // Fuselage shading for 3D effect
    ctx.fillStyle = '#CC0000';
    ctx.fillRect(x - 5, y + 8, w + 10, 3);
    ctx.fillRect(x - 5, y + 17, w + 10, 3);
    
    // Airplane nose cone (pointed and realistic)
    ctx.fillStyle = '#AA0000';
    ctx.beginPath();
    ctx.moveTo(x + w + 5, y + 14);
    ctx.lineTo(x + w + 15, y + 14);
    ctx.lineTo(x + w + 5, y + 18);
    ctx.closePath();
    ctx.fill();
    
    // Main wings (larger and more proportional)
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(x - 8, y + 12, w + 16, 6);
    
    // Wing shading for depth
    ctx.fillStyle = '#000080';
    ctx.fillRect(x - 8, y + 12, w + 16, 2);
    
    // Wing tips (realistic rounded ends)
    ctx.fillStyle = '#000060';
    ctx.beginPath();
    ctx.arc(x - 8, y + 15, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w + 8, y + 15, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Tail section (vertical stabilizer)
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(x + 2, y + 2, 8, 12);
    
    // Tail wing shading
    ctx.fillStyle = '#000080';
    ctx.fillRect(x + 2, y + 2, 8, 3);
    
    // Horizontal stabilizer (rear wing)
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(x - 2, y + 6, 12, 4);
    
    // Landing gear (small wheels)
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(x + 8, y + 22, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w - 8, y + 22, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Propeller (larger and more realistic)
    ctx.fillStyle = '#666666';
    const propX = x + w + 15;
    const propY = y + 14;
    
    // Propeller hub
    ctx.beginPath();
    ctx.arc(propX, propY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Animated propeller blades
    const propAngle = Date.now() * 0.03;
    ctx.save();
    ctx.translate(propX, propY);
    ctx.rotate(propAngle);
    
    // Three propeller blades for realism
    ctx.fillStyle = '#888888';
    for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / 3);
        ctx.fillRect(-12, -1, 24, 2);
        ctx.restore();
    }
    ctx.restore();
    
    // Cockpit canopy (larger and more detailed)
    ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
    ctx.fillRect(x + 5, y + 4, 16, 10);
    
    // Cockpit frame
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 5, y + 4, 16, 10);
    
    // Mario pilot (larger and more visible)
    ctx.fillStyle = '#FFDBAC';
    ctx.fillRect(x + 8, y + 6, 8, 6);
    
    // Mario's red pilot cap
    ctx.fillStyle = '#CC0000';
    ctx.fillRect(x + 8, y + 6, 8, 3);
    
    // Mario's eyes (more visible)
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 10, y + 8, 2, 2);
    ctx.fillRect(x + 14, y + 8, 2, 2);
    
    // Mario's mustache
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 11, y + 10, 4, 1);
    
    // Large Mario "M" symbol on fuselage
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('M', x + w/2, y + 16);
    
    // Aircraft registration number
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '8px Arial';
    ctx.fillText('N-MARIO', x + w/2, y + 25);
    
    // Engine exhaust (realistic detail)
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(x + w + 12, y + 13, 3, 2);
}

function drawPlatforms() {
    for (const platform of platforms) {
        // Get starlight color based on current level for cloud glow
        let starlightColor;
        switch(currentLevel) {
            case 1: starlightColor = '#87CEEB'; break; // Sky blue for grassland
            case 2: starlightColor = '#FFD700'; break; // Gold for desert
            case 3: starlightColor = '#9932CC'; break; // Purple for cave
            case 4: starlightColor = '#00BFFF'; break; // Blue for ice
            case 5: starlightColor = '#FF4500'; break; // Orange-red for lava
            default: starlightColor = '#87CEEB';
        }
        
        // Draw fluffy cloud platform with starlight effects
        drawCloudPlatform(platform.x, platform.y, platform.width, platform.height, starlightColor);
    }
}

function drawCloudPlatform(x, y, width, height, starlightColor) {
    // Main cloud body - darker for nighttime with moonlight glow
    ctx.fillStyle = 'rgba(200, 200, 220, 0.8)'; // Slightly blue-tinted for moonlight
    
    // Draw cloud as overlapping circles for fluffy appearance
    const cloudHeight = height + 10; // Make clouds a bit taller
    const numPuffs = Math.max(3, Math.floor(width / 25)); // Number of cloud puffs based on width
    
    ctx.beginPath();
    for (let i = 0; i < numPuffs; i++) {
        const puffX = x + (i * width / (numPuffs - 1));
        const puffY = y + cloudHeight/2;
        const radius = 15 + (i % 3) * 2; // Static varied puff sizes (no random)
        
        ctx.arc(puffX, puffY, radius, 0, Math.PI * 2);
        
        // Add smaller puffs on top for more realistic cloud shape
        if (i % 2 === 0) {
            ctx.arc(puffX, puffY - 8, radius * 0.7, 0, Math.PI * 2);
        }
    }
    
    // Fill the cloud
    ctx.fill();
    
    // Add cloud shadows for depth - darker for nighttime
    ctx.fillStyle = 'rgba(100, 100, 120, 0.4)'; // Darker blue-tinted shadows
    ctx.beginPath();
    for (let i = 0; i < numPuffs; i++) {
        const puffX = x + (i * width / (numPuffs - 1));
        const puffY = y + cloudHeight/2 + 3; // Slightly lower for shadow
        const radius = 12 + (i % 2) * 2; // Static shadow sizes (no random)
        ctx.arc(puffX, puffY, radius, 0, Math.PI * 2);
    }
    ctx.fill();
    
    // Add twinkling stars around cloud instead of neon glow
    drawStarlightRect(x, y, width, height, starlightColor, 1.0);
}

function drawEnemies() {
    for (const enemy of enemies) {
        const x = enemy.x;
        const y = enemy.y;
        const w = enemy.width;
        const h = enemy.height;

        // Add neon glow based on enemy type
        let enemyNeonColor;
        switch(enemy.type) {
            case 'goomba': enemyNeonColor = '#FF6B6B'; break; // Red glow
            case 'koopa': enemyNeonColor = '#4ECDC4'; break;  // Cyan glow
            case 'spiny': enemyNeonColor = '#FFE66D'; break;  // Yellow glow
            default: enemyNeonColor = '#FF6B6B';
        }
        
        // Draw starlight outline around enemy
        drawStarlightOutline(x - 1, y - 1, w + 2, h + 2, enemyNeonColor, 1);
        
        // Draw the enemy based on type
        if (enemy.type === 'goomba') {
            drawGoomba(x, y, w, h, enemy.direction);
        } else if (enemy.type === 'koopa') {
            drawKoopa(x, y, w, h, enemy.direction);
        } else if (enemy.type === 'spiny') {
            drawSpiny(x, y, w, h, enemy.direction);
        }
        
        // Shadow for all enemies
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x, y + h, w, 2);
    }
}

function drawGoomba(x, y, w, h, direction) {
    // Goomba body (mushroom-like)
    ctx.fillStyle = '#8B4513'; // Dark brown
    ctx.fillRect(x, y + 8, w, h - 8);
    
    // Goomba head/cap (lighter brown)
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(x - 2, y, w + 4, 12);
    
    // Head shading for 3D effect
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + w - 2, y + 2, 4, 8);
    ctx.fillRect(x + 1, y + 10, w + 2, 2);
    
    // Eyes (angry expression)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 3, y + 3, 5, 4);
    ctx.fillRect(x + w - 6, y + 3, 5, 4);
    
    // Eye pupils (looking direction based on movement)
    ctx.fillStyle = '#000000';
    if (direction > 0) {
        ctx.fillRect(x + 6, y + 4, 2, 2);
        ctx.fillRect(x + w - 3, y + 4, 2, 2);
    } else {
        ctx.fillRect(x + 4, y + 4, 2, 2);
        ctx.fillRect(x + w - 5, y + 4, 2, 2);
    }
    
    // Angry eyebrows
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 2, y + 2, 6, 1);
    ctx.fillRect(x + w - 6, y + 2, 6, 1);
    
    // Glowing crystals with starlight effect
    drawStarlightRect(100, 350, 8, 20, '#9932CC', 2.0);
    drawStarlightRect(300, 320, 6, 15, '#8A2BE2', 1.8);
    drawStarlightRect(600, 340, 10, 25, '#9932CC', 2.2);
    drawStarlightRect(450, 330, 7, 18, '#DA70D6', 1.9);
    
    // Mouth (frown)
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 8, y + 8, 6, 1);
    ctx.fillRect(x + 7, y + 9, 2, 1);
    ctx.fillRect(x + 13, y + 9, 2, 1);
    
    // Fangs
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 9, y + 7, 1, 2);
    ctx.fillRect(x + 12, y + 7, 1, 2);
    
    // Body texture/segments
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 2, y + 14, w - 4, 1);
    ctx.fillRect(x + 1, y + 18, w - 2, 1);
    
    // Feet
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 1, y + h - 2, 4, 2);
    ctx.fillRect(x + w - 5, y + h - 2, 4, 2);
}

function drawKoopa(x, y, w, h, direction) {
    // Koopa shell (green)
    ctx.fillStyle = '#228B22'; // Forest green
    ctx.fillRect(x + 2, y + 4, w - 4, h - 8);
    
    // Shell rim (darker green)
    ctx.fillStyle = '#006400';
    ctx.fillRect(x + 1, y + 3, w - 2, 3);
    ctx.fillRect(x + 1, y + h - 6, w - 2, 3);
    
    // Shell pattern
    ctx.fillStyle = '#32CD32'; // Lime green
    ctx.fillRect(x + 4, y + 6, w - 8, 2);
    ctx.fillRect(x + 3, y + 10, w - 6, 2);
    ctx.fillRect(x + 4, y + 14, w - 8, 2);
    
    // Head (yellow-green)
    ctx.fillStyle = '#ADFF2F';
    ctx.fillRect(x + 6, y, 8, 6);
    
    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 7, y + 1, 2, 2);
    ctx.fillRect(x + 11, y + 1, 2, 2);
    
    // Eye pupils
    ctx.fillStyle = '#000000';
    if (direction > 0) {
        ctx.fillRect(x + 8, y + 2, 1, 1);
        ctx.fillRect(x + 12, y + 2, 1, 1);
    } else {
        ctx.fillRect(x + 7, y + 2, 1, 1);
        ctx.fillRect(x + 11, y + 2, 1, 1);
    }
    
    // Beak
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(x + 9, y + 3, 2, 1);
    
    // Legs
    ctx.fillStyle = '#ADFF2F';
    ctx.fillRect(x + 4, y + h - 4, 3, 4);
    ctx.fillRect(x + w - 7, y + h - 4, 3, 4);
}

function drawSpiny(x, y, w, h, direction) {
    // Spiny body (red-brown)
    ctx.fillStyle = '#8B0000'; // Dark red
    ctx.fillRect(x + 1, y + 6, w - 2, h - 8);
    
    // Spiny shell (darker red)
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(x, y + 4, w, h - 6);
    
    // Spikes on shell
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 4; i++) {
        const spikeX = x + 3 + i * 6;
        ctx.fillRect(spikeX, y + 2, 2, 4);
        ctx.fillRect(spikeX + 1, y + 1, 1, 2);
    }
    
    // More spikes on sides
    ctx.fillRect(x, y + 8, 2, 3);
    ctx.fillRect(x + w - 2, y + 8, 2, 3);
    
    // Eyes (angry red)
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x + 4, y + 8, 3, 2);
    ctx.fillRect(x + w - 7, y + 8, 3, 2);
    
    // Eye pupils
    ctx.fillStyle = '#000000';
    if (direction > 0) {
        ctx.fillRect(x + 6, y + 9, 1, 1);
        ctx.fillRect(x + w - 5, y + 9, 1, 1);
    } else {
        ctx.fillRect(x + 4, y + 9, 1, 1);
        ctx.fillRect(x + w - 7, y + 9, 1, 1);
    }
    
    // Mouth
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 8, y + 12, 4, 1);
    
    // Feet (small and spiky)
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 2, y + h - 2, 2, 2);
    ctx.fillRect(x + w - 4, y + h - 2, 2, 2);
}

function drawCoins() {
    for (const coin of coins) {
        // Skip drawing collected coins
        if (coin.collected) continue;
        
        const x = coin.x;
        const y = coin.y;
        
        // Draw fuel tank icon
        drawFuelTank(x, y);
    }
}

function drawFuelTank(x, y) {
    const width = 20;
    const height = 24;
    
    // Starlight effects around fuel tank
    drawStarlightRect(x - 2, y - 2, width + 4, height + 4, '#00BFFF', 1.0);
    
    // Main fuel tank body (cylindrical)
    ctx.fillStyle = '#4682B4'; // Steel blue
    ctx.fillRect(x + 2, y + 4, width - 4, height - 8);
    
    // Tank top cap
    ctx.fillStyle = '#2F4F4F'; // Dark slate gray
    ctx.fillRect(x + 4, y + 2, width - 8, 4);
    
    // Tank bottom cap
    ctx.fillStyle = '#2F4F4F';
    ctx.fillRect(x + 4, y + height - 4, width - 8, 4);
    
    // Fuel level indicator (glowing blue fuel inside)
    ctx.fillStyle = '#00BFFF'; // Deep sky blue
    ctx.fillRect(x + 4, y + 6, width - 8, height - 12);
    
    // Fuel glow effect - softer for nighttime
    ctx.shadowColor = '#00BFFF';
    ctx.shadowBlur = 4;
    ctx.fillStyle = 'rgba(0, 191, 255, 0.4)';
    ctx.fillRect(x + 4, y + 6, width - 8, height - 12);
    ctx.shadowBlur = 0;
    
    // Tank highlights for 3D effect
    ctx.fillStyle = '#87CEEB'; // Sky blue highlight
    ctx.fillRect(x + 3, y + 5, 2, height - 10);
    
    // Tank valve/nozzle at top
    ctx.fillStyle = '#696969'; // Dim gray
    ctx.fillRect(x + width/2 - 1, y, 2, 3);
    
    // Fuel drop animation
    const time = Date.now() * 0.005;
    const dropY = y + height + 2 + Math.sin(time) * 3;
    
    // Animated fuel drop
    ctx.fillStyle = '#00BFFF';
    ctx.beginPath();
    ctx.arc(x + width/2, dropY, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Drop glow - softer for nighttime
    ctx.shadowColor = '#00BFFF';
    ctx.shadowBlur = 3;
    ctx.beginPath();
    ctx.arc(x + width/2, dropY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // "FUEL" text on tank
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '6px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FUEL', x + width/2, y + height/2 + 1);
    
    // Twinkling star effects around fuel tank instead of sparkles
    const starTime = Date.now() * 0.004;
    for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2 / 5) + starTime;
        const distance = 18 + Math.sin(starTime + i) * 3;
        const starX = x + width/2 + Math.cos(angle) * distance;
        const starY = y + height/2 + Math.sin(angle) * distance;
        
        // Twinkling star
        const twinkle = 0.5 + 0.5 * Math.sin(starTime * 3 + i * 0.6);
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 2;
        
        // Draw star as small cross
        ctx.fillRect(starX - 1, starY, 2, 1);
        ctx.fillRect(starX, starY - 1, 1, 2);
    }
    ctx.shadowBlur = 0;
}

function drawPowerUps() {
    for (let powerUp of powerUps) {
        if (!powerUp.collected) {
            const centerX = powerUp.x + powerUp.width/2;
            const centerY = powerUp.y + powerUp.height/2;
            
            switch (powerUp.type) {
                case 'super':
                    drawSuperMushroom(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                    break;
                case 'fire':
                    drawFireFlower(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                    break;
                case 'star':
                    drawStar(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                    break;
                case 'speed':
                    drawSpeedBoost(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                    break;
                case 'jump':
                    drawJumpBoost(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                    break;
            }
            
            // Add floating animation
            const floatOffset = Math.sin(Date.now() * 0.005) * 2;
            ctx.save();
            ctx.translate(0, floatOffset);
            ctx.restore();
        }
    }
}

function drawSuperMushroom(x, y, w, h) {
    // Mushroom cap (red with white spots)
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x + 2, y, w - 4, h * 0.6);
    
    // White spots
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 4, y + 3, 4, 4);
    ctx.fillRect(x + w - 8, y + 3, 4, 4);
    ctx.fillRect(x + w/2 - 2, y + 6, 4, 4);
    
    // Mushroom stem (beige)
    ctx.fillStyle = '#F5DEB3';
    ctx.fillRect(x + 4, y + h * 0.6, w - 8, h * 0.4);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x, y + h, w, 2);
}

function drawFireFlower(x, y, w, h) {
    // Flower center (yellow)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + 6, y + 6, w - 12, h - 12);
    
    // Petals (orange/red)
    ctx.fillStyle = '#FF4500';
    // Top petal
    ctx.fillRect(x + 8, y, 4, 8);
    // Bottom petal
    ctx.fillRect(x + 8, y + h - 8, 4, 8);
    // Left petal
    ctx.fillRect(x, y + 8, 8, 4);
    // Right petal
    ctx.fillRect(x + w - 8, y + 8, 8, 4);
    
    // Stem (green)
    ctx.fillStyle = '#228B22';
    ctx.fillRect(x + w/2 - 1, y + h - 6, 2, 6);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x, y + h, w, 2);
}

function drawStar(x, y, w, h) {
    const centerX = x + w/2;
    const centerY = y + h/2;
    const radius = Math.min(w, h) / 2 - 2;
    
    // Star shape (golden)
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const px = centerX + Math.cos(angle) * radius;
        const py = centerY + Math.sin(angle) * radius;
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    ctx.fill();
    
    // Inner star (white)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const px = centerX + Math.cos(angle) * (radius * 0.5);
        const py = centerY + Math.sin(angle) * (radius * 0.5);
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    ctx.fill();
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x, y + h, w, 2);
}

function drawSpeedBoost(x, y, w, h) {
    // Lightning bolt shape (blue)
    ctx.fillStyle = '#00BFFF';
    ctx.beginPath();
    ctx.moveTo(x + w/2, y);
    ctx.lineTo(x + w/2 - 4, y + h/2);
    ctx.lineTo(x + w/2, y + h/2 - 2);
    ctx.lineTo(x + w/2 + 4, y + h);
    ctx.lineTo(x + w/2, y + h/2 + 2);
    ctx.lineTo(x + w/2 - 4, y + h/2);
    ctx.closePath();
    ctx.fill();
    
    // Inner lightning (white)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(x + w/2, y + 2);
    ctx.lineTo(x + w/2 - 2, y + h/2);
    ctx.lineTo(x + w/2 + 2, y + h - 2);
    ctx.lineTo(x + w/2, y + h/2);
    ctx.closePath();
    ctx.fill();
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x, y + h, w, 2);
}

function drawJumpBoost(x, y, w, h) {
    // Spring shape (green)
    ctx.fillStyle = '#32CD32';
    ctx.fillRect(x + 4, y + h - 8, w - 8, 8); // Base
    
    // Spring coils
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(x + 2, y + 4 + i * 4, w - 4, 2);
    }
    
    // Arrow pointing up (white)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(x + w/2, y);
    ctx.lineTo(x + w/2 - 4, y + 6);
    ctx.lineTo(x + w/2 + 4, y + 6);
    ctx.closePath();
    ctx.fill();
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x, y + h, w, 2);
}

function drawExplosions() {
    for (let explosion of explosions) {
        for (let particle of explosion.particles) {
            const alpha = particle.life / 30; // fade out over time
            
            // Draw particle with glow effect
            ctx.globalAlpha = alpha;
            
            // Outer glow
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size + 1, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner bright core
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.globalAlpha = 1; // reset alpha
        }
    }
}

function drawBackground() {
    // NIGHT SKY BACKGROUND FOR AIRPLANE FLYING
    
    // Create gradient night sky from dark blue to black
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#191970');    // Midnight blue at top
    gradient.addColorStop(0.4, '#0F0F23');  // Very dark blue
    gradient.addColorStop(0.8, '#000011');  // Almost black
    gradient.addColorStop(1, '#000000');    // Pure black at bottom
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    drawStars();
    
    // Draw moon
    drawMoon();
    
    // Dark night clouds with subtle glow
    ctx.fillStyle = 'rgba(64, 64, 96, 0.6)';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
    ctx.shadowBlur = 10;
    
    // Cloud 1
    ctx.beginPath();
    ctx.arc(100, 80, 20, 0, Math.PI * 2);
    ctx.arc(125, 80, 35, 0, Math.PI * 2);
    ctx.arc(150, 80, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Cloud 2
    ctx.beginPath();
    ctx.arc(300, 120, 25, 0, Math.PI * 2);
    ctx.arc(330, 120, 30, 0, Math.PI * 2);
    ctx.arc(360, 120, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Cloud 3
    ctx.beginPath();
    ctx.arc(600, 100, 20, 0, Math.PI * 2);
    ctx.arc(620, 100, 25, 0, Math.PI * 2);
    ctx.arc(640, 100, 20, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0; // Reset shadow
}

function drawStars() {
    // Draw twinkling stars
    const time = Date.now() * 0.002;
    
    // Static star positions (consistent across frames)
    const stars = [
        {x: 50, y: 30, size: 1}, {x: 150, y: 45, size: 2}, {x: 250, y: 25, size: 1},
        {x: 350, y: 55, size: 1.5}, {x: 450, y: 35, size: 1}, {x: 550, y: 40, size: 2},
        {x: 650, y: 20, size: 1}, {x: 750, y: 50, size: 1.5}, {x: 80, y: 70, size: 1},
        {x: 180, y: 15, size: 1}, {x: 280, y: 65, size: 1.5}, {x: 380, y: 30, size: 1},
        {x: 480, y: 60, size: 2}, {x: 580, y: 25, size: 1}, {x: 680, y: 45, size: 1},
        {x: 120, y: 90, size: 1.5}, {x: 220, y: 85, size: 1}, {x: 320, y: 95, size: 1},
        {x: 420, y: 80, size: 1}, {x: 520, y: 90, size: 1.5}, {x: 620, y: 75, size: 1},
        {x: 720, y: 85, size: 2}
    ];
    
    for (const star of stars) {
        // Twinkling effect
        const twinkle = 0.5 + 0.5 * Math.sin(time * 3 + star.x * 0.01);
        const alpha = 0.6 + 0.4 * twinkle;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = star.size * 2;
        
        // Draw star as small cross
        ctx.fillRect(star.x - star.size, star.y, star.size * 2, 1);
        ctx.fillRect(star.x, star.y - star.size, 1, star.size * 2);
        
        // Bright center
        ctx.fillRect(star.x, star.y, 1, 1);
    }
    
    ctx.shadowBlur = 0;
}

function drawMoon() {
    const moonX = canvas.width - 100;
    const moonY = 60;
    const moonRadius = 25;
    
    // Moon glow
    ctx.shadowColor = '#F0F8FF';
    ctx.shadowBlur = 20;
    
    // Full moon
    ctx.fillStyle = '#F5F5DC'; // Beige moon color
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Moon craters for detail
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(200, 200, 180, 0.3)';
    ctx.beginPath();
    ctx.arc(moonX - 8, moonY - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(moonX + 6, moonY + 3, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(moonX - 3, moonY + 8, 2, 0, Math.PI * 2);
    ctx.fill();
}



function drawGrasslandBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add neon glow effect to background
    const neonIntensity = 0.1 + Math.sin(neonTime * 0.03) * 0.05;
    ctx.fillStyle = `rgba(0, 255, 0, ${neonIntensity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // White clouds with neon glow
    drawNeonCircle(170, 80, 25, '#FFFFFF', 0.5);
    drawNeonCircle(515, 60, 20, '#FFFFFF', 0.5);
    
    // Sun with neon glow
    drawNeonCircle(700, 50, 25, '#FFD700', 1.0);
}

function drawDesertBackground() {
    // Desert sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#FFA500');
    gradient.addColorStop(0.3, '#FFD700');
    gradient.addColorStop(1, '#F4A460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add golden neon glow effect
    const neonIntensity = 0.15 + Math.sin(neonTime * 0.04) * 0.08;
    ctx.fillStyle = `rgba(255, 215, 0, ${neonIntensity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Desert sun with intense neon glow
    drawNeonCircle(650, 70, 30, '#FF4500', 1.5);
    
    // Sand dunes with golden neon edges
    ctx.fillStyle = '#F4A460';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 100);
    ctx.quadraticCurveTo(200, canvas.height - 150, 400, canvas.height - 120);
    ctx.quadraticCurveTo(600, canvas.height - 90, canvas.width, canvas.height - 110);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();
    
    // Add neon glow to dune edges
    ctx.strokeStyle = '#FFD700';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 15;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 100);
    ctx.quadraticCurveTo(200, canvas.height - 150, 400, canvas.height - 120);
    ctx.quadraticCurveTo(600, canvas.height - 90, canvas.width, canvas.height - 110);
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // Cacti
    ctx.fillStyle = '#228B22';
    ctx.fillRect(100, canvas.height - 140, 8, 40);
    ctx.fillRect(96, canvas.height - 120, 16, 8);
    ctx.fillRect(300, canvas.height - 130, 6, 30);
    ctx.fillRect(600, canvas.height - 135, 10, 35);
}

function drawCaveBackground() {
    // Dark cave gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#2F2F2F');
    gradient.addColorStop(0.5, '#1C1C1C');
    gradient.addColorStop(1, '#0F0F0F');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add purple neon ambiance
    const neonIntensity = 0.1 + Math.sin(neonTime * 0.06) * 0.05;
    ctx.fillStyle = `rgba(153, 50, 204, ${neonIntensity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Cave ceiling stalactites
    ctx.fillStyle = '#696969';
    for (let i = 0; i < 6; i++) {
        const x = 100 + i * 120;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - 15, 40 + Math.random() * 20);
        ctx.lineTo(x + 15, 40 + Math.random() * 20);
        ctx.closePath();
        ctx.fill();
    }
    
    // Glowing crystals
    ctx.fillStyle = '#9370DB';
    ctx.beginPath();
    ctx.arc(200, 100, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8A2BE2';
    ctx.beginPath();
    ctx.arc(500, 120, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4B0082';
    ctx.beginPath();
}

function drawIceBackground() {
    // Ice/snow gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#E0F6FF');
    gradient.addColorStop(0.5, '#B0E0E6');
    gradient.addColorStop(1, '#F0F8FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add blue neon ice ambiance
    const neonIntensity = 0.08 + Math.sin(neonTime * 0.05) * 0.04;
    ctx.fillStyle = `rgba(0, 191, 255, ${neonIntensity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Snow clouds
    ctx.fillStyle = '#F5F5F5';
    ctx.beginPath();
    ctx.arc(120, 60, 18, 0, Math.PI * 2);
    ctx.arc(140, 60, 22, 0, Math.PI * 2);
    ctx.arc(160, 60, 18, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(450, 80, 15, 0, Math.PI * 2);
    ctx.arc(465, 80, 20, 0, Math.PI * 2);
    ctx.arc(480, 80, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Falling snow
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 20; i++) {
        const x = (i * 37 + Date.now() * 0.01) % canvas.width;
        const y = (i * 23 + Date.now() * 0.02) % canvas.height;
        ctx.fillRect(x, y, 2, 2);
    }
    
    // Ice mountains
    ctx.fillStyle = '#B0C4DE';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 80);
    ctx.lineTo(150, canvas.height - 200);
    ctx.lineTo(300, canvas.height - 120);
    ctx.lineTo(450, canvas.height - 180);
    ctx.lineTo(600, canvas.height - 100);
    ctx.lineTo(canvas.width, canvas.height - 150);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();
}

function drawLavaBackground() {
    // Lava sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#8B0000');
    gradient.addColorStop(0.3, '#FF4500');
    gradient.addColorStop(0.7, '#FF6347');
    gradient.addColorStop(1, '#DC143C');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add intense orange-red neon lava ambiance
    const neonIntensity = 0.2 + Math.sin(neonTime * 0.08) * 0.15;
    ctx.fillStyle = `rgba(255, 69, 0, ${neonIntensity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Lava bubbles/pools
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(150, canvas.height - 50, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(400, canvas.height - 40, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(650, canvas.height - 60, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Fire particles
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * canvas.width;
        const y = canvas.height - 100 + Math.sin(Date.now() * 0.01 + i) * 20;
        ctx.fillRect(x, y, 3, 6);
    }
    
    // Castle silhouette
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(600, canvas.height - 200, 80, 120);
    ctx.fillRect(580, canvas.height - 220, 20, 40);
    ctx.fillRect(700, canvas.height - 220, 20, 40);
    ctx.fillRect(620, canvas.height - 240, 40, 40);
}

// Game over function
function gameOver() {
    gameRunning = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 50);
    
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2);
    ctx.fillText('Press F5 to restart', canvas.width/2, canvas.height/2 + 40);
}

// Level transition display
function drawLevelTransition() {
    if (levelTransition) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        
        if (currentLevel <= 5) {
            ctx.fillText('Level Complete!', canvas.width/2, canvas.height/2 - 60);
            ctx.font = '24px Arial';
            ctx.fillText(`Level ${currentLevel - 1}: ${levelConfigs[currentLevel - 1]?.name || 'Unknown'}`, canvas.width/2, canvas.height/2 - 20);
            ctx.fillText(`Bonus: ${200 * (currentLevel - 1)} points`, canvas.width/2, canvas.height/2 + 10);
            
            if (currentLevel <= 5) {
                ctx.fillText(`Next: Level ${currentLevel} - ${levelConfigs[currentLevel]?.name || 'Final Level'}`, canvas.width/2, canvas.height/2 + 50);
            }
        }
        
        // Countdown timer
        const timeLeft = Math.ceil(transitionTimer / 60);
        ctx.font = '18px Arial';
        ctx.fillText(`Starting in ${timeLeft}...`, canvas.width/2, canvas.height/2 + 90);
    }
}

// Update power-up status display
function updatePowerUpDisplay() {
    const activePowerUps = [];
    
    if (mario.powerUps.super) activePowerUps.push('🍄 Super');
    if (mario.powerUps.fire) activePowerUps.push('🌸 Fire');
    if (mario.powerUps.star) {
        const timeLeft = Math.ceil(mario.powerUpTimers.star / 60);
        activePowerUps.push(`⭐ Star (${timeLeft}s)`);
    }
    if (mario.powerUps.speed) {
        const timeLeft = Math.ceil(mario.powerUpTimers.speed / 60);
        activePowerUps.push(`⚡ Speed (${timeLeft}s)`);
    }
    if (mario.powerUps.jump) {
        const timeLeft = Math.ceil(mario.powerUpTimers.jump / 60);
        activePowerUps.push(`🦘 Jump (${timeLeft}s)`);
    }
    
    powerUpElement.textContent = activePowerUps.length > 0 ? activePowerUps.join(', ') : 'None';
    powerUpElement.style.color = activePowerUps.length > 0 ? '#2E8B57' : '#666';
}

// Main game loop
function gameLoop() {
    console.log('Game loop called, gameRunning:', gameRunning);
    if (!gameRunning) {
        console.log('Game not running, exiting game loop');
        return;
    }
    
    // Update neon animation time
    neonTime++;
    
    // Handle level transitions
    if (levelTransition) {
        transitionTimer--;
        if (transitionTimer <= 0) {
            nextLevel();
        }
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw everything
    console.log('About to call drawing functions');
    
    try {
        console.log('Calling drawBackground');
        drawBackground();
        console.log('drawBackground completed');
        
        console.log('Calling drawPlatforms');
        drawPlatforms();
        console.log('drawPlatforms completed');
        
        console.log('Calling drawCoins');
        drawCoins();
        console.log('drawCoins completed');
        
        console.log('Calling drawPowerUps');
        drawPowerUps(); // Draw power-ups
        console.log('drawPowerUps completed');
        
        console.log('Calling drawEnemies');
        drawEnemies();
        console.log('drawEnemies completed');
        
        console.log('Calling drawBoss');
        drawBoss(); // Draw boss if active
        drawBossProjectiles(); // Draw boss projectiles
        console.log('drawBoss completed');
        
        console.log('About to call drawMario');
        drawMario();
        console.log('drawMario called');
    } catch (error) {
        console.error('ERROR in drawing functions:', error);
        console.error('Error stack:', error.stack);
    }
    drawDustParticles(); // Draw movement dust effects
    drawExplosions(); // Draw explosions on top
    
    // Draw fuel gauge on canvas
    drawFuelGauge();
    
    // Draw level transition overlay
    drawLevelTransition();
    
    // Update game objects (only if not in transition)
    if (!levelTransition) {
        updateMario();
        updateEnemies();
        updateCoins();
        updatePowerUps(); // Update power-up collection and timers
        updateBoss(); // Update boss AI and attacks
        updateBossProjectiles(); // Update boss projectiles
        updateExplosions(); // Update explosion animations
        updateDustParticles(); // Update movement dust effects
        checkLevelComplete();
    }
    
    // Update score, level, fuel, and power-up display
    scoreElement.textContent = score;
    levelElement.textContent = currentLevel;
    fuelElement.textContent = Math.round(mario.fuel);
    
    // Change fuel color based on level
    if (mario.fuel <= mario.lowFuelWarning) {
        fuelElement.style.color = '#FF0000'; // Red for low fuel
    } else if (mario.fuel <= 50) {
        fuelElement.style.color = '#FFA500'; // Orange for medium fuel
    } else {
        fuelElement.style.color = '#00AA00'; // Green for good fuel
    }
    
    updatePowerUpDisplay();
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Initialize and start the game
loadLevel(1); // Load the first level
gameLoop();
