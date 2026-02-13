const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const proposalCard = document.getElementById('proposal-card');
const celebrationCard = document.getElementById('celebration-card');
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');

// Set canvas size
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
});

// Physics variables for "No" button
let noBtnVelocity = { x: 0, y: 0 };
let noBtnPosition = { x: 0, y: 0 };
let isPhysicsActive = false; // Changed from isInitialized to explicit state

const PHYSICS_CONFIG = {
    friction: 0.9,
    repulsionRadius: 150,
    repulsionForce: 2.0,
    boundaryBounce: 0.7
};

function detachButton() {
    const rect = noBtn.getBoundingClientRect();
    noBtnPosition = { x: rect.left, y: rect.top };
    
    // Move to body to avoid container clipping/stacking issues
    document.body.appendChild(noBtn);
    
    noBtn.style.position = 'fixed';
    noBtn.style.left = noBtnPosition.x + 'px';
    noBtn.style.top = noBtnPosition.y + 'px';
    noBtn.style.zIndex = '1000'; // Ensure it stays on top
    
    isPhysicsActive = true;
}

// Track mouse
let mouseX = -1000;
let mouseY = -1000;
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Main Animation Loop
function physicsLoop() {
    if (!noBtn) return;
    
    const rect = noBtn.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    // Vector from button to mouse
    const dx = mouseX - btnCenterX;
    const dy = mouseY - btnCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Trigger detachment if mouse gets close
    if (!isPhysicsActive && distance < PHYSICS_CONFIG.repulsionRadius) {
        detachButton();
    }

    if (isPhysicsActive) {
        // Repulsion logic
        if (distance < PHYSICS_CONFIG.repulsionRadius) {
            const force = (PHYSICS_CONFIG.repulsionRadius - distance) / PHYSICS_CONFIG.repulsionRadius;
            const angle = Math.atan2(dy, dx);
            
            noBtnVelocity.x -= Math.cos(angle) * force * PHYSICS_CONFIG.repulsionForce;
            noBtnVelocity.y -= Math.sin(angle) * force * PHYSICS_CONFIG.repulsionForce;
            
            if (distance < 50) {
                 const phrases = ["Nope!", "Too slow!", "Can't catch me!", "Oily!", "Slide!", "Whoops!"];
                 noBtn.innerText = phrases[Math.floor(Date.now() / 500) % phrases.length];
            }
        }

        // Apply friction
        noBtnVelocity.x *= PHYSICS_CONFIG.friction;
        noBtnVelocity.y *= PHYSICS_CONFIG.friction;

        // Update position
        noBtnPosition.x += noBtnVelocity.x;
        noBtnPosition.y += noBtnVelocity.y;

        // Boundary checks
        const noBtnRect = noBtn.getBoundingClientRect(); // Get current size
        const margin = 10;
        
        if (noBtnPosition.x < margin) {
            noBtnPosition.x = margin;
            noBtnVelocity.x *= -PHYSICS_CONFIG.boundaryBounce;
        } else if (noBtnPosition.x > window.innerWidth - noBtnRect.width - margin) {
            noBtnPosition.x = window.innerWidth - noBtnRect.width - margin;
            noBtnVelocity.x *= -PHYSICS_CONFIG.boundaryBounce;
        }

        if (noBtnPosition.y < margin) {
            noBtnPosition.y = margin;
            noBtnVelocity.y *= -PHYSICS_CONFIG.boundaryBounce;
        } else if (noBtnPosition.y > window.innerHeight - noBtnRect.height - margin) {
            noBtnPosition.y = window.innerHeight - noBtnRect.height - margin;
            noBtnVelocity.y *= -PHYSICS_CONFIG.boundaryBounce;
        }

        // Apply to DOM
        noBtn.style.left = `${noBtnPosition.x}px`;
        noBtn.style.top = `${noBtnPosition.y}px`;
    }

    requestAnimationFrame(physicsLoop);
}

// Start loop
physicsLoop();

// Remove old listeners
// noBtn.addEventListener('mouseover', moveNoButton);
// noBtn.addEventListener('click', moveNoButton);

// "Yes" button interaction
yesBtn.addEventListener('click', () => {
    proposalCard.classList.add('hidden');
    celebrationCard.classList.remove('hidden');
    
    // Hide the "No" button so it doesn't float around during celebration
    noBtn.style.display = 'none';
    
    startConfetti();
});

// Simple Confetti Implementation
let confetti = [];
const confettiCount = 300;
const gravity = 0.5;
const terminalVelocity = 5;
const drag = 0.075;
const colors = [
  { front: 'red', back: 'darkred' },
  { front: 'green', back: 'darkgreen' },
  { front: 'blue', back: 'darkblue' },
  { front: 'yellow', back: 'darkyellow' },
  { front: 'orange', back: 'darkorange' },
  { front: 'pink', back: 'darkpink' },
  { front: 'purple', back: 'darkpurple' },
  { front: 'turquoise', back: 'darkturquoise' }
];

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function initConfetti() {
    for (let i = 0; i < confettiCount; i++) {
        confetti.push({
        color: colors[Math.floor(randomRange(0, colors.length))],
        dimensions: {
            x: randomRange(10, 20),
            y: randomRange(10, 30)
        },
        position: {
            x: randomRange(0, confettiCanvas.width),
            y: confettiCanvas.height - 1
        },
        rotation: randomRange(0, 2 * Math.PI),
        scale: {
            x: 1,
            y: 1
        },
        velocity: {
            x: randomRange(-25, 25),
            y: randomRange(0, -50)
        }
        });
    }
}

// Render Confetti
function render() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confetti.forEach((confetto, index) => {
        const width = confetto.dimensions.x * confetto.scale.x;
        const height = confetto.dimensions.y * confetto.scale.y;

        ctx.translate(confetto.position.x, confetto.position.y);
        ctx.rotate(confetto.rotation);

        confetto.velocity.x -= confetto.velocity.x * drag;
        confetto.velocity.y = Math.min(confetto.velocity.y + gravity, terminalVelocity);
        confetto.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();

        confetto.position.x += confetto.velocity.x;
        confetto.position.y += confetto.velocity.y;

        if (confetto.position.y >= confettiCanvas.height) confetti.splice(index, 1);

        if (confetto.position.x > confettiCanvas.width) confetto.position.x = 0;
        if (confetto.position.x < 0) confetto.position.x = confettiCanvas.width;

        confetto.scale.y = Math.cos(confetto.position.y * 0.1);
        ctx.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;

        ctx.fillRect(-width / 2, -height / 2, width, height);

        ctx.setTransform(1, 0, 0, 1, 0, 0);
    });

    if (confetti.length > 0) {
        window.requestAnimationFrame(render);
    }
}

function startConfetti() {
    initConfetti();
    render();
    
    // Add continuous confetti
    setInterval(() => {
        if(confetti.length < 300) { // maintain some confetti
            for(let i=0; i<5; i++){
                confetti.push({
                    color: colors[Math.floor(randomRange(0, colors.length))],
                    dimensions: { x: randomRange(10, 20), y: randomRange(10, 30) },
                    position: { x: randomRange(0, confettiCanvas.width), y: 0 },
                    rotation: randomRange(0, 2 * Math.PI),
                    scale: { x: 1, y: 1 },
                    velocity: { x: randomRange(-5, 5), y: randomRange(0, 10) } // Falling down
                });
            }
        }
    }, 100);
}

// Background Hearts
function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart-bg');
    heart.innerHTML = '❤️';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = Math.random() * 2 + 3 + 's';
    heart.style.fontSize = Math.random() * 20 + 10 + 'px';
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
        heart.remove();
    }, 5000);
}

setInterval(createHeart, 300);
