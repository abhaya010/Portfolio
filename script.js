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

});