document.addEventListener('DOMContentLoaded', function () {
  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle-checkbox');
  const body = document.body;
  
  // Check for saved theme preference or use default dark theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    body.classList.add('light-theme');
    themeToggle.checked = true;
  }
  
  // Theme toggle event listener
  themeToggle.addEventListener('change', function() {
    if (this.checked) {
      body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  });
  
  // Spider Web Background - FIXED & ENHANCED VERSION
  const canvas = document.getElementById('spiderWebCanvas');
  if (!canvas) {
    console.error('Spider web canvas not found!');
    // Create canvas if it doesn't exist
    const newCanvas = document.createElement('canvas');
    newCanvas.id = 'spiderWebCanvas';
    newCanvas.style.position = 'fixed';
    newCanvas.style.top = '0';
    newCanvas.style.left = '0';
    newCanvas.style.width = '100%';
    newCanvas.style.height = '100%';
    newCanvas.style.zIndex = '-1';
    newCanvas.style.pointerEvents = 'auto'; // Enable pointer events for interaction
    document.body.insertBefore(newCanvas, document.body.firstChild);
    canvas = newCanvas;
  }
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Could not get canvas context!');
    return;
  }
  
 //proper css for spider web
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'auto'; // Enable pointer events for interaction
  
  // Set canvas size to window size
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr); // Scale for high DPI displays
  }
  
  window.addEventListener('resize', function() {
    resizeCanvas();
    initWebPoints(); // Reinitialize points when resizing
  });
  
  resizeCanvas();
  
  // Spider web properties
  let webPoints = [];
  const numPoints = 100; // Reduced slightly for better performance
  const connectionDistance = 150;
  const pointSpeed = 0.3;
  
  // Mouse interaction properties
  let mouseX = 0;
  let mouseY = 0;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let mouseRadius = 150; // Area of influence around the mouse
  let mouseStrength = 5; // Strength of the mouse influence
  let isMouseDown = false; // Track if mouse is pressed
  let interactionMode = 'repel'; // 'repel' or 'attract'
  let mouseActive = false; // Track if mouse is over canvas
  
  // Initialize web points
  function initWebPoints() {
    webPoints = [];
    for (let i = 0; i < numPoints; i++) {
      webPoints.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * pointSpeed,
        vy: (Math.random() - 0.5) * pointSpeed,
        originalSpeed: pointSpeed,
        size: Math.random() * 1 + 1, // Varied point sizes
        originalX: 0, // Store original position for "return to position" effect
        originalY: 0
      });
    }
    
    // Store original positions after points have moved a bit
    setTimeout(() => {
      webPoints.forEach(point => {
        point.originalX = point.x;
        point.originalY = point.y;
      });
    }, 1000);
  }
// Update web points positions
function updateWebPoints() {
  // Calculate mouse velocity for more dynamic interaction
  const mouseVelX = mouseX - lastMouseX;
  const mouseVelY = mouseY - lastMouseY;
  const mouseMoved = Math.abs(mouseVelX) > 0.1 || Math.abs(mouseVelY) > 0.1;
  
  lastMouseX = mouseX;
  lastMouseY = mouseY;
  
  for (let i = 0; i < webPoints.length; i++) {
    const point = webPoints[i];
    
    // Apply mouse influence if mouse is near and active
    if (mouseActive) {
      const dx = point.x - mouseX;
      const dy = point.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < mouseRadius) {
        // Calculate influence based on distance (closer = stronger)
        const influence = 1 - distance / mouseRadius;
        
        if (isMouseDown) {
          // Stronger effect when mouse is pressed
          const strength = mouseStrength * 2 * influence;
          
          if (interactionMode === 'repel') {
            // Push points away from mouse
            point.vx += dx / distance * strength;
            point.vy += dy / distance * strength;
          } else {
            // Pull points toward mouse
            point.vx -= dx / distance * strength;
            point.vy -= dy / distance * strength;
          }
        } else if (mouseMoved) {
          // Effect based on mouse movement speed
          const moveStrength = Math.min(5, Math.sqrt(mouseVelX*mouseVelX + mouseVelY*mouseVelY) * 0.3);
          point.vx += mouseVelX * influence * moveStrength * 0.05;
          point.vy += mouseVelY * influence * moveStrength * 0.05;
        }
      }
    }
    
    // Gradually return to original speed when not influenced by mouse
    point.vx = point.vx * 0.98 + (Math.random() - 0.5) * 0.01;
    point.vy = point.vy * 0.98 + (Math.random() - 0.5) * 0.01;
    
    // Limit max speed
    const currentSpeed = Math.sqrt(point.vx * point.vx + point.vy * point.vy);
    if (currentSpeed > point.originalSpeed * 3) {
      point.vx = (point.vx / currentSpeed) * point.originalSpeed * 3;
      point.vy = (point.vy / currentSpeed) * point.originalSpeed * 3;
    }
    
    // Gradually return to original position (subtle effect)
    if (point.originalX && point.originalY) {
      point.vx += (point.originalX - point.x) * 0.0005;
      point.vy += (point.originalY - point.y) * 0.0005;
    }
    
    // Move point
    point.x += point.vx;
    point.y += point.vy;
    
    // Bounce off edges with improved handling
    if (point.x < 0) {
      point.x = 0;
      point.vx = Math.abs(point.vx) * 0.8; // Reduce velocity slightly on bounce
    } else if (point.x > window.innerWidth) {
      point.x = window.innerWidth;
      point.vx = -Math.abs(point.vx) * 0.8;
    }
    
    if (point.y < 0) {
      point.y = 0;
      point.vy = Math.abs(point.vy) * 0.8;
    } else if (point.y > window.innerHeight) {
      point.y = window.innerHeight;
      point.vy = -Math.abs(point.vy) * 0.8;
    }
  }
}

// Calculate connections between points
function calculateConnections() {
  const webConnections = [];
  for (let i = 0; i < webPoints.length; i++) {
    // Optimize by only checking nearby points
    for (let j = i + 1; j < webPoints.length; j++) {
      const pointA = webPoints[i];
      const pointB = webPoints[j];
      const dx = pointA.x - pointB.x;
      const dy = pointA.y - pointB.y;
      
      // Quick distance check before doing square root (optimization)
      if (dx*dx + dy*dy < connectionDistance*connectionDistance) {
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < connectionDistance) {
          const opacity = 1 - distance / connectionDistance;
          webConnections.push({
            pointA: pointA,
            pointB: pointB,
            opacity: opacity,
            distance: distance
          });
        }
      }
    }
  }
  return webConnections;
}

// Draw the spider web
function drawWeb() {
  // Get current web color based on theme
  const isDarkTheme = !body.classList.contains('light-theme');
  const webColor = isDarkTheme 
    ? 'rgba(108, 99, 255, 0.3)' 
    : 'rgba(67, 97, 238, 0.3)';
  const webPoint = isDarkTheme 
    ? 'rgba(108, 99, 255, 0.5)' 
    : 'rgba(67, 97, 238, 0.5)';
  
  // Clear canvas
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  
  // Update points and calculate connections
  updateWebPoints();
  const webConnections = calculateConnections();
  
  // Draw connections
  for (let i = 0; i < webConnections.length; i++) {
    const connection = webConnections[i];
    ctx.beginPath();
    ctx.moveTo(connection.pointA.x, connection.pointA.y);
    ctx.lineTo(connection.pointB.x, connection.pointB.y);
    
    // Adjust line width based on distance (closer = thicker)
    const lineWidth = Math.max(0.5, 1.5 * (1 - connection.distance / connectionDistance));
    ctx.lineWidth = lineWidth;
    
    // Adjust opacity based on distance
    const opacity = connection.opacity;
    ctx.strokeStyle = webColor.replace('0.3', opacity * 0.5);
    ctx.stroke();
  }
  
  // Draw points
  for (let i = 0; i < webPoints.length; i++) {
    const point = webPoints[i];
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
    ctx.fillStyle = webPoint;
    ctx.fill();
  }
  
  // Draw mouse influence area when mouse is down or active
  if (isMouseDown && mouseActive) {
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, mouseRadius, 0, Math.PI * 2);
    ctx.strokeStyle = interactionMode === 'repel' 
      ? 'rgba(255, 100, 100, 0.2)' 
      : 'rgba(100, 255, 100, 0.2)';
    ctx.stroke();
  }
  
  // Request next frame
  requestAnimationFrame(drawWeb);
}

// Mouse event listeners for interactive web
document.addEventListener('mousemove', function(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  // Check if mouse is over the canvas area
  if (e.clientX >= 0 && e.clientX <= window.innerWidth &&
      e.clientY >= 0 && e.clientY <= window.innerHeight) {
    mouseActive = true;
  }
});

document.addEventListener('mousedown', function(e) {
  isMouseDown = true;
  
  // Right click toggles between repel and attract modes
  if (e.button === 2) {
    interactionMode = interactionMode === 'repel' ? 'attract' : 'repel';
    
    // Update instruction text
    const modeText = document.getElementById('mode-text');
    if (modeText) {
      modeText.textContent = `Mode: ${interactionMode === 'repel' ? 'Push' : 'Pull'}`;
    }
    
    e.preventDefault();
    return false;
  }
});

document.addEventListener('mouseup', function() {
  isMouseDown = false;
});

document.addEventListener('mouseleave', function() {
  mouseActive = false;
  isMouseDown = false;
});

// Prevent context menu on right-click
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  return false;
});

// Touch events for mobile
document.addEventListener('touchstart', function(e) {
  if (e.touches.length > 0) {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
    mouseActive = true;
    isMouseDown = true;
    
    // Long press to toggle mode (for mobile)
    touchTimer = setTimeout(() => {
      interactionMode = interactionMode === 'repel' ? 'attract' : 'repel';
      
      // Update instruction text
      const modeText = document.getElementById('mode-text');
      if (modeText) {
        modeText.textContent = `Mode: ${interactionMode === 'repel' ? 'Push' : 'Pull'}`;
      }
      
      // Provide haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  }
  e.preventDefault(); // Prevent scrolling while interacting
});

document.addEventListener('touchmove', function(e) {
  if (e.touches.length > 0) {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
    mouseActive = true;
  }
  e.preventDefault(); // Prevent scrolling while interacting
});

document.addEventListener('touchend', function() {
  isMouseDown = false;
  clearTimeout(touchTimer);
  
  // Small delay before setting mouseActive to false
  // This allows final animations to complete
  setTimeout(() => {
    mouseActive = false;
  }, 100);
});

// Add keyboard controls for interaction mode
document.addEventListener('keydown', function(e) {
  if (e.key === 'a' || e.key === 'A') {
    interactionMode = 'attract';
    updateModeText();
  } else if (e.key === 'r' || e.key === 'R') {
    interactionMode = 'repel';
    updateModeText();
  } else if (e.key === ' ') {
    // Space bar toggles mode
    interactionMode = interactionMode === 'repel' ? 'attract' : 'repel';
    updateModeText();
  }
});

function updateModeText() {
  const modeText = document.getElementById('mode-text');
  if (modeText) {
    modeText.textContent = `Mode: ${interactionMode === 'repel' ? 'Push' : 'Pull'}`;
  }
}

// Initialize and start animation
initWebPoints();
drawWeb();

// Add better instructions for interaction
const instructionsDiv = document.createElement('div');
instructionsDiv.id = 'web-instructions';
instructionsDiv.style.position = 'fixed';
instructionsDiv.style.bottom = '20px';
instructionsDiv.style.left = '20px';
instructionsDiv.style.padding = '10px';
instructionsDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
instructionsDiv.style.color = 'white';
instructionsDiv.style.borderRadius = '5px';
instructionsDiv.style.fontSize = '14px';
instructionsDiv.style.zIndex = '1000';
instructionsDiv.style.pointerEvents = 'none';
instructionsDiv.style.transition = 'opacity 0.5s ease';




// Show instructions when mouse is over the canvas
canvas.addEventListener('mouseenter', function() {
  instructionsDiv.style.opacity = '1';
});

// Hide instructions after inactivity
let inactivityTimer;
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  instructionsDiv.style.opacity = '1';
  
  inactivityTimer = setTimeout(() => {
    instructionsDiv.style.opacity = '0.2';
  }, 5000);
}

document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('mousedown', resetInactivityTimer);
document.addEventListener('keydown', resetInactivityTimer);
document.addEventListener('touchstart', resetInactivityTimer);

// Start the inactivity timer
resetInactivityTimer();

// Rest of your JavaScript remains the same
// ...

// Navigation menu toggle for mobile
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', function () {
    nav.classList.toggle('active');
    menuToggle.classList.toggle('active');
    
    // Animate hamburger to X
    const bars = document.querySelectorAll('.bar');
    if (menuToggle.classList.contains('active')) {
      bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
      bars[1].style.opacity = '0';
      bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
    } else {
      bars[0].style.transform = 'none';
      bars[1].style.opacity = '1';
      bars[2].style.transform = 'none';
    }
  });
}

// Close menu when clicking a link
const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach((link) => {
  link.addEventListener('click', function () {
    if (nav) nav.classList.remove('active');
    if (menuToggle) menuToggle.classList.remove('active');
    
    // Reset hamburger
    const bars = document.querySelectorAll('.bar');
    if (bars.length > 0) {
      bars[0].style.transform = 'none';
      bars[1].style.opacity = '1';
      bars[2].style.transform = 'none';
    }
  });
});

// Change active link on scroll
const sections = document.querySelectorAll('section');
window.addEventListener('scroll', function () {
  let current = '';
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop - sectionHeight / 3) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') && link.getAttribute('href').substring(1) === current) {
      link.classList.add('active');
    }
  });
  
  // Add background to header on scroll
  const header = document.querySelector('header');
  if (header) {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
});

  // Skill bars animation
  function animateSkills() {
    const skillSection = document.querySelector('.skills');
    const skillLevels = document.querySelectorAll('.skill-level');
    
    if (!skillSection) return;
    
    const sectionPos = skillSection.getBoundingClientRect().top;
    const screenPos = window.innerHeight / 1.3;
    
    if (sectionPos < screenPos) {
      skillLevels.forEach((level) => {
        const width = level.getAttribute('data-width') || level.style.width;
        level.style.width = width;
      });
    }
  }
  
  // Initial animation check
  animateSkills();
  
  // Check on scroll
  window.addEventListener('scroll', animateSkills);
  
  // Project filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterBtns.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      btn.classList.add('active');
      
      // Get filter value
      const filterValue = btn.getAttribute('data-filter');
      
      // Filter projects
      projectCards.forEach(card => {
        if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
  
  // Add animation classes to elements when they come into view
  function animateOnScroll() {
    const elements = document.querySelectorAll(
      '.project-card, .about-content, .contact-container, .skills-container'
    );
    
    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;
      
      if (elementPosition < screenPosition) {
        element.classList.add('fade-in');
      }
    });
  }
  
  // Run animation on scroll
  window.addEventListener('scroll', animateOnScroll);
  
  // Run once on load
  window.addEventListener('load', animateOnScroll);
});

// Add this to your existing script.js file or create a new one
document.addEventListener('DOMContentLoaded', function() {
  // Create and animate code particles
  const codeParticles = document.querySelector('.code-particles');
  if (!codeParticles) return;
  
  // Create additional particles dynamically
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('span');
    particle.className = 'code-particle';
    
    // Random position
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    
    // Random size
    const size = Math.random() * 6 + 2;
    
    // Random animation delay
    const delay = Math.random() * 5;
    
    // Set styles
    particle.style.cssText = `
      position: absolute;
      top: ${posY}%;
      left: ${posX}%;
      width: ${size}px;
      height: ${size}px;
      background-color: var(--accent);
      border-radius: 50%;
      opacity: 0;
      animation: particle-animation ${Math.random() * 2 + 2}s ease-in-out ${delay}s infinite;
    `;
    
    codeParticles.appendChild(particle);
  }
  
  // Add tech symbols that float around
  const techSymbols = ['{ }', '< >', '/>', '[]', '()', '&&', '||', '==', '=>', '++', '**'];
  
  for (let i = 0; i < 8; i++) {
    const symbol = document.createElement('div');
    symbol.className = 'tech-symbol';
    
    // Random position
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    
    // Random animation delay and duration
    const delay = Math.random() * 5;
    const duration = Math.random() * 10 + 10;
    
    // Random symbol
    const symbolText = techSymbols[Math.floor(Math.random() * techSymbols.length)];
    
    // Set styles
    symbol.style.cssText = `
      position: absolute;
      top: ${posY}%;
      left: ${posX}%;
      font-family: monospace;
      font-size: ${Math.random() * 10 + 10}px;
      color: var(--accent);
      opacity: 0.6;
      transform: rotate(${Math.random() * 360}deg);
      animation: symbol-float ${duration}s ease-in-out ${delay}s infinite;
    `;
    
    symbol.textContent = symbolText;
    codeParticles.appendChild(symbol);
  }
  
  // Add this keyframe to your CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes symbol-float {
      0%, 100% {
        transform: translate(0, 0) rotate(0deg);
        opacity: 0.2;
      }
      25% {
        transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px) rotate(${Math.random() * 30}deg);
        opacity: 0.7;
      }
      50% {
        transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px) rotate(${Math.random() * 60}deg);
        opacity: 0.5;
      }
      75% {
        transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px) rotate(${Math.random() * 30}deg);
        opacity: 0.7;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Make the animation interactive with mouse movement
  const techAnimation = document.querySelector('.tech-animation');
  if (techAnimation) {
    techAnimation.addEventListener('mousemove', function(e) {
      // Get mouse position relative to the animation container
      const rect = techAnimation.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate position relative to center (in percentage from -50 to 50)
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const offsetX = ((x - centerX) / centerX) * 20;
      const offsetY = ((y - centerY) / centerY) * 20;
      
      // Apply 3D rotation based on mouse position
      const orbitContainer = document.querySelector('.orbit-container');
      if (orbitContainer) {
        orbitContainer.style.transform = `rotateY(${offsetX}deg) rotateX(${-offsetY}deg)`;
      }
    });
    
    // Reset rotation when mouse leaves
    techAnimation.addEventListener('mouseleave', function() {
      const orbitContainer = document.querySelector('.orbit-container');
      if (orbitContainer) {
        orbitContainer.style.transform = '';
        // Restart the rotation animation
        orbitContainer.style.animation = 'none';
        setTimeout(() => {
          orbitContainer.style.animation = 'container-rotate 20s linear infinite';
        }, 10);
      }
    });
  }
});