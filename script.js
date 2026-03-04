const pages = document.querySelectorAll('.page');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageIndicator = document.getElementById('pageIndicator');
const flipSound = document.getElementById('flipSound');

let currentLocation = 0;
const totalLocations = 4;
let typewriterIntervals = [];
let audioEnabled = false;
let isFlipping = false;

// Background Configuration
const BackgroundConfig = {
    gradientSpeed: 22,
    glowOrbCount: 6,
    glowOpacity: 0.2,
    glowBlur: 120,
    glowMinSize: 400,
    glowMaxSize: 800,
    radialPulseDuration: 8
};

// Particles Canvas
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + 100;
        this.size = Math.random() * 2 + 0.5;
        this.baseX = this.x;
        this.speedY = Math.random() * 0.4 + 0.15;
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = Math.random() * 0.01 + 0.005;
        this.opacity = initial ? Math.random() * 0.5 : 0;
        this.fadeSpeed = Math.random() * 0.005 + 0.002;
        this.maxOpacity = Math.random() * 0.6 + 0.2;
        this.colorIndex = Math.floor(Math.random() * 4);
    }

    update() {
        this.angle += this.angleSpeed;
        this.x = this.baseX + Math.sin(this.angle) * 30;
        this.y -= this.speedY;

        if (this.opacity < this.maxOpacity && this.y > 50) {
            this.opacity += this.fadeSpeed;
        } else if (this.y < 100) {
            this.opacity -= this.fadeSpeed * 1.5;
        }

        if (this.y < -20 || (this.opacity <= 0 && this.y < canvas.height - 100)) {
            this.reset();
        }
    }

    draw() {
        const colors = [
            [255, 182, 193], // Soft Pink
            [248, 195, 255], // Pale Purple
            [255, 236, 179], // Warm Gold
            [255, 246, 250]  // Bright White-Pink
        ];
        const color = colors[this.colorIndex];

        // Core dot
        ctx.beginPath();
        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${this.opacity})`;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 4);
        gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${this.opacity * 0.6})`);
        gradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    const particleCount = window.innerWidth < 768 ? 60 : 120;
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    requestAnimationFrame(animateParticles);
}

initCanvas();
initParticles();
animateParticles();
initGlowOrbs();

window.addEventListener('resize', () => {
    initCanvas();
    initParticles();
});

// Glow Orbs
function initGlowOrbs() {
    const container = document.querySelector('.book-container');
    for (let i = 0; i < BackgroundConfig.glowOrbCount; i++) {
        const orb = document.createElement('div');
        orb.className = 'glow-orb';
        const size = BackgroundConfig.glowMinSize + Math.random() * (BackgroundConfig.glowMaxSize - BackgroundConfig.glowMinSize);
        orb.style.width = `${size}px`;
        orb.style.height = `${size}px`;
        orb.style.left = `${Math.random() * 100}%`;
        orb.style.top = `${Math.random() * 100}%`;
        orb.style.animationDuration = `${15 + Math.random() * 10}s`;
        orb.style.animationDelay = `${Math.random() * 5}s`;
        document.body.insertBefore(orb, container);
    }
}

// Typewriter Effect
function typeWriter(element, text, speed = 25) {
    element.textContent = '';
    let i = 0;

    let interval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(interval);
        }
    }, speed);
    typewriterIntervals.push(interval);
}

function startTypewriter() {
    typewriterIntervals.forEach(interval => clearInterval(interval));
    typewriterIntervals = [];

    const pageMapping = {
        0: [],
        1: ['.page[data-page="0"] .back .typewriter', '.page[data-page="1"] .front .typewriter'],
        2: ['.page[data-page="1"] .back .typewriter', '.page[data-page="2"] .front .typewriter'],
        3: []
    };

    const selectors = pageMapping[currentLocation] || [];
    selectors.forEach(selector => {
        const targetElement = document.querySelector(selector);
        if (targetElement) {
            const text = targetElement.getAttribute('data-text');
            if (text) {
                typeWriter(targetElement, text);
            }
        }
    });
}

// Page Flip Logic
function updateBook() {
    pages.forEach((page, index) => {
        if (index < currentLocation) {
            page.classList.add('flipped');
        } else {
            page.classList.remove('flipped');
        }
    });

    updateBookmark();

    setTimeout(() => {
        startTypewriter();
    }, 600);

    updateNavigation();
    updatePageIndicator();
}

function updateBookmark() {
    const bookmark = document.querySelector('.bookmark');
    if (bookmark) {
        const rightPageIndex = currentLocation < pages.length ? currentLocation : pages.length - 1;
        const targetPage = pages[rightPageIndex];
        if (targetPage) {
            const rect = targetPage.getBoundingClientRect();
            const bookRect = document.querySelector('.book').getBoundingClientRect();
            bookmark.style.left = `${rect.left - bookRect.left}px`;
        }
    }
}

function updateNavigation() {
    prevBtn.disabled = currentLocation === 0;
    nextBtn.disabled = currentLocation === totalLocations - 1;
}

function updatePageIndicator() {
    pageIndicator.textContent = `${currentLocation + 1} / ${totalLocations}`;
}

function playFlipSound() {
    if (audioEnabled) {
        flipSound.volume = 0.6;
        flipSound.currentTime = 0;
        flipSound.play().catch(() => { });

        let volume = 0.6;
        const fadeOut = setInterval(() => {
            if (volume > 0.05) {
                volume -= 0.05;
                flipSound.volume = volume;
            } else {
                flipSound.volume = 0;
                clearInterval(fadeOut);
            }
        }, 50);
    }
}

function nextPage() {
    if (currentLocation < totalLocations - 1 && !isFlipping) {
        isFlipping = true;
        playFlipSound();

        const pageIndex = currentLocation;
        pages[pageIndex].classList.add('flipping');

        currentLocation++;

        setTimeout(() => {
            updateBook();
        }, 50);

        setTimeout(() => {
            pages[pageIndex].classList.remove('flipping');
            isFlipping = false;
        }, 850);
    }
}

function prevPage() {
    if (currentLocation > 0 && !isFlipping) {
        isFlipping = true;
        playFlipSound();

        currentLocation--;

        const pageIndex = currentLocation;
        pages[pageIndex].classList.add('flipping');

        setTimeout(() => {
            updateBook();
        }, 50);

        setTimeout(() => {
            pages[pageIndex].classList.remove('flipping');
            isFlipping = false;
        }, 850);
    }
}

nextBtn.addEventListener('click', () => {
    audioEnabled = true;
    nextPage();
});

prevBtn.addEventListener('click', () => {
    audioEnabled = true;
    prevPage();
});

document.addEventListener('keydown', (e) => {
    audioEnabled = true;
    if (e.key === 'ArrowRight') nextPage();
    if (e.key === 'ArrowLeft') prevPage();
});

// Touch Support
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    audioEnabled = true;
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
        nextPage();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
        prevPage();
    }
}

updateBook();
