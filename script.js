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
});
  