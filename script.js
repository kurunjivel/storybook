const pages = document.querySelectorAll('.page');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageIndicator = document.getElementById('pageIndicator');
const flipSound = document.getElementById('flipSound');

let currentPage = 0;
const totalPages = 6;
let typewriterInterval = null;
let audioEnabled = false;
let isFlipping = false;

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
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 3 + 1;
        this.speedY = Math.random() * 0.5 + 0.2;
        this.speedX = Math.random() * 0.3 - 0.15;
        this.opacity = 0;
        this.fadeSpeed = Math.random() * 0.01 + 0.005;
        this.maxOpacity = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        
        if (this.opacity < this.maxOpacity) {
            this.opacity += this.fadeSpeed;
        } else if (this.y < -10) {
            this.opacity -= this.fadeSpeed;
        }

        if (this.y < -20 || this.opacity <= 0) {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 100;
            this.opacity = 0;
        }
    }

    draw() {
        ctx.fillStyle = `rgba(255, 182, 193, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    const particleCount = window.innerWidth < 768 ? 30 : 50;
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

window.addEventListener('resize', () => {
    initCanvas();
    initParticles();
});

// Typewriter Effect
function typeWriter(element, text, speed = 25) {
    if (typewriterInterval) {
        clearInterval(typewriterInterval);
    }
    
    element.textContent = '';
    let i = 0;
    
    typewriterInterval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typewriterInterval);
            typewriterInterval = null;
        }
    }, speed);
}

function startTypewriter() {
    if (typewriterInterval) {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
    }
    
    const pageMapping = {
        0: null,
        1: '.page[data-page="0"] .back .typewriter',
        2: '.page[data-page="1"] .front .typewriter',
        3: '.page[data-page="1"] .back .typewriter',
        4: '.page[data-page="2"] .front .typewriter',
        5: null
    };
    
    const selector = pageMapping[currentPage];
    if (selector) {
        const targetElement = document.querySelector(selector);
        if (targetElement) {
            const text = targetElement.getAttribute('data-text');
            if (text) {
                typeWriter(targetElement, text);
            }
        }
    }
}

// Page Flip Logic
function updateBook() {
    const pagesFlipped = Math.floor((currentPage + 1) / 2);
    
    pages.forEach((page, index) => {
        if (index < pagesFlipped) {
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
        const rightPageIndex = Math.floor(currentPage / 2);
        const targetPage = pages[rightPageIndex];
        if (targetPage) {
            const rect = targetPage.getBoundingClientRect();
            const bookRect = document.querySelector('.book').getBoundingClientRect();
            bookmark.style.left = `${rect.left - bookRect.left}px`;
        }
    }
}

function updateNavigation() {
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage === totalPages - 1;
}

function updatePageIndicator() {
    pageIndicator.textContent = `${currentPage + 1} / ${totalPages}`;
}

function playFlipSound() {
    if (audioEnabled) {
        flipSound.volume = 0.6;
        flipSound.currentTime = 0;
        flipSound.play().catch(() => {});
        
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
    if (currentPage < totalPages - 1 && !isFlipping) {
        isFlipping = true;
        
        if (currentPage % 2 === 0) {
            playFlipSound();
        }
        
        const pageIndex = Math.floor(currentPage / 2);
        pages[pageIndex].classList.add('flipping');
        
        currentPage++;
        
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
    if (currentPage > 0 && !isFlipping) {
        isFlipping = true;
        
        currentPage--;
        
        if (currentPage % 2 === 0) {
            playFlipSound();
        }
        
        const pageIndex = Math.floor(currentPage / 2);
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
