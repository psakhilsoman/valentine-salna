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
    repulsionRadius: window.innerWidth < 481 ? 100 : 150, // Smaller radius on mobile
    repulsionForce: window.innerWidth < 481 ? 1.5 : 2.0,  // Less force on mobile
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
    
    // On mobile, ensure button stays within container even after detachment
    const isMobile = window.innerWidth < 481;
    if (isMobile) {
        const container = document.querySelector('.container');
        const containerRect = container.getBoundingClientRect();
        const btnRect = noBtn.getBoundingClientRect();
        const margin = 15;
        
        // Adjust position if outside container bounds
        if (noBtnPosition.x < containerRect.left + margin) {
            noBtnPosition.x = containerRect.left + margin;
        }
        if (noBtnPosition.x > containerRect.right - btnRect.width - margin) {
            noBtnPosition.x = containerRect.right - btnRect.width - margin;
        }
        if (noBtnPosition.y < containerRect.top + margin) {
            noBtnPosition.y = containerRect.top + margin;
        }
        if (noBtnPosition.y > containerRect.bottom - btnRect.height - margin) {
            noBtnPosition.y = containerRect.bottom - btnRect.height - margin;
        }
        
        noBtn.style.left = noBtnPosition.x + 'px';
        noBtn.style.top = noBtnPosition.y + 'px';
    }
    
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
                 const phrases = CONFIG.PHRASES.NO_BUTTON_TEASES;
                 noBtn.innerText = phrases[Math.floor(Date.now() / 500) % phrases.length];
            }
        }

        // Apply friction
        noBtnVelocity.x *= PHYSICS_CONFIG.friction;
        noBtnVelocity.y *= PHYSICS_CONFIG.friction;

        // Update position
        noBtnPosition.x += noBtnVelocity.x;
        noBtnPosition.y += noBtnVelocity.y;

        // Boundary checks - container-based on mobile
        const noBtnRect = noBtn.getBoundingClientRect();
        const isMobile = window.innerWidth < 481;
        
        let minX, maxX, minY, maxY;
        
        if (isMobile) {
            // On mobile: constrain to container boundaries for better thumb zone
            const container = document.querySelector('.container');
            const containerRect = container.getBoundingClientRect();
            const margin = 15; // Small margin within container
            
            minX = containerRect.left + margin;
            maxX = containerRect.right - noBtnRect.width - margin;
            minY = containerRect.top + margin;
            maxY = containerRect.bottom - noBtnRect.height - margin;
        } else {
            // On desktop: use full viewport
            const margin = 20;
            minX = margin;
            maxX = window.innerWidth - noBtnRect.width - margin;
            minY = margin;
            maxY = window.innerHeight - noBtnRect.height - margin;
        }
        
        // Apply calculated boundaries
        if (noBtnPosition.x < minX) {
            noBtnPosition.x = minX;
            noBtnVelocity.x *= -PHYSICS_CONFIG.boundaryBounce;
        } else if (noBtnPosition.x > maxX) {
            noBtnPosition.x = maxX;
            noBtnVelocity.x *= -PHYSICS_CONFIG.boundaryBounce;
        }

        if (noBtnPosition.y < minY) {
            noBtnPosition.y = minY;
            noBtnVelocity.y *= -PHYSICS_CONFIG.boundaryBounce;
        } else if (noBtnPosition.y > maxY) {
            noBtnPosition.y = maxY;
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


// Initialize EmailJS
(function() {
    emailjs.init("PwB4Z7ki5-x-eCbnI");
})();

// Function to send notification
function sendNotification(action) {
    const now = new Date();
    const actionData = getActionData(action);
    
    const templateParams = {
        action: actionData.title,
        timestamp: now.toLocaleString('en-IN', { 
            timeZone: 'Asia/Kolkata',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }),
        message: actionData.message
    };

    emailjs.send('service_lp0tn1o', 'template_07g3t0c', templateParams)
        .then(function(response) {
            console.log('✅ Notification sent successfully!', response.status);
        }, function(error) {
            console.log('❌ Failed to send notification:', error);
        });
}

// Get action-specific data
function getActionData(action) {
    const actions = {
        'YES': {
            title: 'SHE SAID YES! 🎉',
            message: 'Salna clicked YES on your Valentine proposal! Time to celebrate! 🥳💕'
        },
        'POKKUM_CLICKED': {
            title: 'Pokkum Button Clicked 👍',
            message: 'Salna clicked "Pokkum" (Go ahead) in the wait popup. She wants to hear what you have to say! 😊'
        },
        'ENTHAAA_CLICKED': {
            title: 'Enthaaa Button Clicked 🤔',
            message: 'Salna clicked "Enthaaa" (What is it?) in the wait popup. She\'s curious about your message! 🤗'
        },
        'READING_LETTER': {
            title: 'Reading Letter 📖',
            message: 'Salna clicked "Read Letter" and is now reading your heartfelt message. Fingers crossed! 🤞💌'
        },
        'LETTER_OPENED': {
            title: 'Letter Page Opened 💕',
            message: 'Salna has opened the letter page and the typewriter animation has started! She\'s reading your words as they appear... ✨'
        },
        'BACK_CLICKED': {
            title: 'Back Button Clicked ←',
            message: 'Salna clicked the back button from the letter page. She might be going back to think about it... 🤔'
        }
    };
    
    return actions[action] || {
        title: 'Unknown Action',
        message: 'An unknown action occurred: ' + action
    };
}

// "Yes" button interaction
yesBtn.addEventListener('click', () => {
    proposalCard.classList.add('hidden');
    celebrationCard.classList.remove('hidden');
    
    // Hide the "No" button so it doesn't float around during celebration
    noBtn.style.display = 'none';
    
    // 🎉 SEND EMAIL NOTIFICATION! 🎉
    sendNotification('YES');
    
    startConfetti();

    // After 2 seconds, show simple "please wait..." message
    setTimeout(() => {
        const timerContainer = document.getElementById('timer-container');
        timerContainer.style.display = 'block';
        
        // After 3 more seconds, show the wait popup
        setTimeout(() => {
            const waitOverlay = document.getElementById('wait-overlay');
            waitOverlay.classList.remove('hidden');
        }, 3000);
        
    }, 2000);
});

// Wait Popup Button Interactions
const pokkumBtn = document.getElementById('pokkumBtn');
const enthaBtn = document.getElementById('enthaBtn');

// Both buttons lead to the same result - showing the sorry card
function showSorryCard() {
    const waitOverlay = document.getElementById('wait-overlay');
    const celebrationCard = document.getElementById('celebration-card');
    const sorryCard = document.getElementById('sorry-card');
    
    waitOverlay.classList.add('hidden');
    celebrationCard.classList.add('hidden');
    sorryCard.classList.remove('hidden');
    sorryCard.classList.add('fade-in');
}

pokkumBtn.addEventListener('click', () => {
    sendNotification('POKKUM_CLICKED');
    showSorryCard();
});

enthaBtn.addEventListener('click', () => {
    sendNotification('ENTHAAA_CLICKED');
    showSorryCard();
});

// Letter Interaction - Redirect to separate letter page
const readLetterBtn = document.getElementById('readLetterBtn');

readLetterBtn.addEventListener('click', () => {
    // Send notification that she's reading the letter
    sendNotification('READING_LETTER');
    
    // Redirect to the standalone letter page
    window.location.href = 'letter.html';
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
    // Clear any existing confetti
    confetti = [];
    
    // Initialize confetti once
    initConfetti();
    render();
    
    // No continuous confetti - just let the initial burst fall and disappear
}

// Background Hearts
function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart-bg');
    heart.innerHTML = '❤️';
    
    // Keep hearts within viewport - no overflow
    heart.style.left = Math.random() * (window.innerWidth - 50) + 'px'; // Account for heart size
    heart.style.animationDuration = Math.random() * 2 + 3 + 's';
    
    // Smaller hearts on mobile to prevent overflow
    const isMobile = window.innerWidth < 481;
    const heartSize = isMobile ? 
        Math.random() * 10 + 15 : // Mobile: 15-25px
        Math.random() * 20 + 10;  // Desktop: 10-30px
    
    heart.style.fontSize = heartSize + 'px';
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
        heart.remove();
    }, 5000);
}

// Adjust heart frequency based on device
const isMobile = window.innerWidth < 481;
const heartInterval = isMobile ? 500 : 300; // Less frequent on mobile

setInterval(createHeart, heartInterval);
