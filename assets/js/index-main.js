/* =============================================
   TYPING ANIMATION
============================================= */
const robotTexts = [
  "Web Development",
  "Mobile Development",
  "API Integration",
  "IT Support & Troubleshooting"
];
const animeTexts = [
  "Web Development",
  "Mobile Development",
  "API Integration",
  "IT Support & Troubleshooting"
];
let currentTexts = robotTexts;
let tIdx=0, tChar=0, tErasing=false;
const typingEl = document.getElementById("typing-text");
function type(){
  if(!tErasing && tChar < currentTexts[tIdx].length){
    typingEl.textContent += currentTexts[tIdx].charAt(tChar); tChar++;
    setTimeout(type, 80);
  } else if(!tErasing){
    setTimeout(()=>{ tErasing=true; type(); }, 1800);
  } else if(tChar > 0){
    typingEl.textContent = currentTexts[tIdx].substring(0, tChar-1); tChar--;
    setTimeout(type, 40);
  } else {
    tErasing=false; tIdx=(tIdx+1)%currentTexts.length;
    setTimeout(type, 400);
  }
}
type();

/* =============================================
   HEXAGON GRID BACKGROUND
============================================= */
const hexCanvas = document.getElementById("hexCanvas");
const hCtx = hexCanvas.getContext("2d");
let hexes = [];
const HEX_SIZE = 28;
const HEX_GAP  = 4;
let hW, hH;

function hexPath(ctx, x, y, r){
  ctx.beginPath();
  for(let i=0;i<6;i++){
    const a = Math.PI/180*(60*i-30);
    i===0 ? ctx.moveTo(x+r*Math.cos(a), y+r*Math.sin(a))
          : ctx.lineTo(x+r*Math.cos(a), y+r*Math.sin(a));
  }
  ctx.closePath();
}

function buildHexes(){
  hexes = [];
  const r = HEX_SIZE;
  const w = r*2;
  const h = Math.sqrt(3)*r;
  const cols = Math.ceil(hW/(w*.75))+2;
  const rows = Math.ceil(hH/h)+2;
  for(let row=0; row<rows; row++){
    for(let col=0; col<cols; col++){
      const x = col*(w*.75);
      const y = row*h + (col%2===0 ? 0 : h/2);
      hexes.push({
        x, y,
        phase: Math.random()*Math.PI*2,
        speed: 0.3+Math.random()*0.4,
        baseAlpha: 0.04+Math.random()*0.05
      });
    }
  }
}

function resizeHex(){
  hW = hexCanvas.width  = window.innerWidth;
  hH = hexCanvas.height = window.innerHeight;
  buildHexes();
}

let hexTime = 0;
function drawHexes(){
  hCtx.clearRect(0,0,hW,hH);
  hexTime += 0.008;
  hexes.forEach(h=>{
    const pulse = (Math.sin(hexTime*h.speed + h.phase)+1)/2;
    const alpha = h.baseAlpha + pulse*0.08;
    hexPath(hCtx, h.x, h.y, HEX_SIZE-HEX_GAP);
    hCtx.strokeStyle = `rgba(0,229,255,${alpha})`;
    hCtx.lineWidth = 0.8;
    hCtx.stroke();
    if(pulse > 0.85){
      hexPath(hCtx, h.x, h.y, HEX_SIZE-HEX_GAP);
      hCtx.strokeStyle = `rgba(0,229,255,${(pulse-0.85)*0.6})`;
      hCtx.lineWidth = 1.5;
      hCtx.stroke();
    }
  });
}

/* =============================================
   FRAME ARC ANIMATION (robot mode)
============================================= */
const arcCanvas = document.getElementById("frameArc");
const aCtx = arcCanvas.getContext("2d");
let arcAngle = 0;
let isAnimeMode = false;

function resizeArc(){
  const wrapper = document.getElementById("container");
  arcCanvas.width  = wrapper.offsetWidth;
  arcCanvas.height = wrapper.offsetHeight;
}

function drawArc(){
  aCtx.clearRect(0,0, arcCanvas.width, arcCanvas.height);
  if(isAnimeMode) return;
  const cx = arcCanvas.width/2;
  const cy = arcCanvas.height/2;
  const r  = Math.min(cx,cy) - 8;

  arcAngle += 0.008;

  // outer slow arc
  aCtx.beginPath();
  aCtx.arc(cx, cy, r, arcAngle, arcAngle + Math.PI*0.4);
  aCtx.strokeStyle = "rgba(0,229,255,0.18)";
  aCtx.lineWidth = 1;
  aCtx.stroke();

  // inner faster arc (opposite direction)
  aCtx.beginPath();
  aCtx.arc(cx, cy, r-8, -arcAngle*1.5, -arcAngle*1.5 + Math.PI*0.25);
  aCtx.strokeStyle = "rgba(122,92,255,0.14)";
  aCtx.lineWidth = 0.8;
  aCtx.stroke();

  // tiny bright dot at arc tip
  const dotX = cx + r*Math.cos(arcAngle + Math.PI*0.4);
  const dotY = cy + r*Math.sin(arcAngle + Math.PI*0.4);
  aCtx.beginPath();
  aCtx.arc(dotX, dotY, 2.5, 0, Math.PI*2);
  aCtx.fillStyle = "rgba(0,229,255,0.7)";
  aCtx.fill();
}

/* =============================================
   MAIN ANIMATION LOOP
============================================= */
function mainLoop(){
  if(!isAnimeMode) drawHexes();
  drawArc();
  requestAnimationFrame(mainLoop);
}

window.addEventListener("resize", ()=>{ resizeHex(); resizeArc(); });
resizeHex();
setTimeout(resizeArc, 100);
mainLoop();

/* =============================================
   IMAGE HOVER EFFECT
============================================= */
const container = document.getElementById("container");
const robotImg  = document.getElementById("robot");
const glow      = document.getElementById("glow");
const cursor    = document.getElementById("cursor");
let mouseX=0, mouseY=0, curX=0, curY=0;

// Detect touch/mobile device
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

function animateCursor(){
  const dx = mouseX - curX;
  const dy = mouseY - curY;
  curX += dx * .1;
  curY += dy * .1;
  // Only update styles when there is actual movement (skip idle frames)
  if(Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05){
    robotImg.style.webkitMaskPosition = `${curX-140}px ${curY-140}px`;
    robotImg.style.maskPosition       = `${curX-140}px ${curY-140}px`;
    glow.style.left = `${curX}px`;
    glow.style.top  = `${curY}px`;
    cursor.style.left = `${curX}px`;
    cursor.style.top  = `${curY}px`;
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Desktop: mouse events (unchanged)
container.addEventListener("mousemove",(e)=>{
  const r = container.getBoundingClientRect();
  mouseX = e.clientX-r.left; mouseY = e.clientY-r.top;
  robotImg.style.webkitMaskSize = "280px 280px";
  robotImg.style.maskSize       = "280px 280px";
  glow.style.opacity = 1;
});
container.addEventListener("mouseleave",()=>{
  robotImg.style.webkitMaskSize = "0px 0px";
  robotImg.style.maskSize       = "0px 0px";
  glow.style.opacity = 0;
});

// Mobile: touch events with passive:true (non-blocking, performant)
if(isTouchDevice){
  container.addEventListener("touchstart",(e)=>{
    const r = container.getBoundingClientRect();
    const t = e.touches[0];
    mouseX = t.clientX - r.left;
    mouseY = t.clientY - r.top;
    robotImg.style.webkitMaskSize = "280px 280px";
    robotImg.style.maskSize       = "280px 280px";
    glow.style.opacity = 1;
  },{ passive:true });
  container.addEventListener("touchmove",(e)=>{
    const r = container.getBoundingClientRect();
    const t = e.touches[0];
    mouseX = t.clientX - r.left;
    mouseY = t.clientY - r.top;
  },{ passive:true });
  container.addEventListener("touchend",()=>{
    robotImg.style.webkitMaskSize = "0px 0px";
    robotImg.style.maskSize       = "0px 0px";
    glow.style.opacity = 0;
  },{ passive:true });
}

/* =============================================
   PAGE TRANSITION (portfolio button)
============================================= */
const portfolioBtn = document.getElementById("portfolioBtn");
const transition   = document.getElementById("transition");
portfolioBtn.addEventListener("click",(e)=>{
  e.preventDefault();
  transition.classList.add("active");
  document.body.style.transition = "transform 1s ease, opacity 1s ease";
  document.body.style.transform  = "scale(1.03)";
  document.body.style.opacity    = "0.7";
  sessionStorage.setItem('from-intro', '1');
  setTimeout(()=>{ window.location.replace("index4.html"); }, 1400);
});

/* =============================================
   MODE TOGGLE WITH TRANSITIONS
============================================= */
const modeToggle  = document.getElementById("modeToggle");
const modeIcon    = document.getElementById("modeIcon");
const modeLabel   = document.getElementById("modeLabel");
const mainImg     = document.getElementById("mainImg");
const modeOverlay = document.getElementById("modeOverlay");
const shimmerEl   = document.getElementById("shimmerEl");
const scanLine    = document.getElementById("scanLine");
const robotFrame  = document.getElementById("robotFrame");
const hexEl       = document.getElementById("hexCanvas");

const robotContent = {
  icon:"🤖", label:"ROBOT",
  eyebrow:"Available for Web, Mobile, and System Integration",
  role:"IT Developer | Full Stack Developer",
  noteTitle:"Opening Page",
  noteBody:"Halaman ini adalah pembuka singkat. Untuk melihat detail proyek, pengalaman kerja, dan layanan yang saya kerjakan, lanjut masuk ke halaman portfolio utama.",
  mainSrc:"aslifix.png", robotSrc:"robotfix.png"
};
const animeContent = {
  icon:"🌸", label:"ANIME",
  eyebrow:"神のコード ✦ Web · Mobile · System",
  role:"IT 開発者 | Full Stack Developer",
  noteTitle:"序章　— PROLOGUE",
  noteBody:"Halaman ini adalah pembuka singkat. Untuk melihat detail proyek, pengalaman kerja, dan layanan yang saya kerjakan, lanjut masuk ke halaman portfolio utama.",
  mainSrc:"asli.png", robotSrc:"anime2.png"
};

let isAnime = false;
let transitioning = false;

/* =============================================
   ANIME PHOTO-SWAP EFFECT
   Every ~2s in anime mode, mainImg flashes between
   asli.png ↔ anime2.png with a lightning burst.
   Pauses while the cursor is inside the frame.
============================================= */
let swapInterval = null;
let swapHovered  = false;
let swapShowingAlt = false;   // true = currently showing anime2.png

// Overlay canvas for the lightning flash (sits above mainImg, below robot-layer)
const flashCanvas = document.createElement("canvas");
flashCanvas.id = "flashCanvas";
flashCanvas.style.cssText = [
  "position:absolute","inset:0","width:100%","height:100%",
  "pointer-events:none","z-index:3","border-radius:30px",
  "opacity:0","transition:opacity 0.06s ease"
].join(";");
// Insert before the glow div (keeps z-order: mainImg→flashCanvas→robot-layer→glow→cursor)
container.insertBefore(flashCanvas, document.getElementById("glow"));

function resizeFlash(){
  flashCanvas.width  = container.offsetWidth;
  flashCanvas.height = container.offsetHeight;
}
resizeFlash();
window.addEventListener("resize", resizeFlash);

function drawLightningFlash(){
  resizeFlash();
  const fc  = flashCanvas.getContext("2d");
  const W   = flashCanvas.width;
  const H   = flashCanvas.height;
  fc.clearRect(0, 0, W, H);

  // Pick a random effect style each time
  const style = Math.floor(Math.random() * 4);

  if(style === 0){
    /* ── Style 0: vertical lightning bolt ── */
    fc.save();
    const x = W * (0.3 + Math.random() * 0.4);
    let   y = 0;
    fc.strokeStyle = "rgba(255,220,100,0.95)";
    fc.lineWidth   = 2 + Math.random() * 2;
    fc.shadowColor = "rgba(255,200,50,1)";
    fc.shadowBlur  = 18;
    fc.beginPath();
    fc.moveTo(x, y);
    while(y < H){
      y += 30 + Math.random() * 50;
      fc.lineTo(x + (Math.random() - 0.5) * 80, y);
    }
    fc.stroke();
    // secondary thinner bolt
    fc.strokeStyle = "rgba(255,255,255,0.7)";
    fc.lineWidth   = 0.8;
    fc.shadowBlur  = 6;
    let y2 = 0;
    const x2 = x + (Math.random() - 0.5) * 40;
    fc.beginPath();
    fc.moveTo(x2, y2);
    while(y2 < H){
      y2 += 20 + Math.random() * 40;
      fc.lineTo(x2 + (Math.random() - 0.5) * 50, y2);
    }
    fc.stroke();
    fc.restore();
    // white flash overlay
    const grad = fc.createLinearGradient(x-60, 0, x+60, 0);
    grad.addColorStop(0,   "transparent");
    grad.addColorStop(0.5, "rgba(255,255,255,0.18)");
    grad.addColorStop(1,   "transparent");
    fc.fillStyle = grad;
    fc.fillRect(0, 0, W, H);

  } else if(style === 1){
    /* ── Style 1: horizontal glitch slices ── */
    fc.save();
    const slices = 5 + Math.floor(Math.random() * 6);
    for(let i = 0; i < slices; i++){
      const sy = Math.random() * H;
      const sh = 2 + Math.random() * 12;
      const sx = (Math.random() - 0.5) * 30;
      const r  = Math.floor(Math.random() * 255);
      const g  = Math.floor(Math.random() * 100);
      const b  = Math.floor(180 + Math.random() * 75);
      fc.fillStyle = `rgba(${r},${g},${b},0.35)`;
      fc.fillRect(sx, sy, W, sh);
    }
    // Scanline sweep
    const sweepGrad = fc.createLinearGradient(0, 0, 0, H);
    sweepGrad.addColorStop(0,   "transparent");
    sweepGrad.addColorStop(0.5, "rgba(192,132,252,0.12)");
    sweepGrad.addColorStop(1,   "transparent");
    fc.fillStyle = sweepGrad;
    fc.fillRect(0, 0, W, H);
    fc.restore();

  } else if(style === 2){
    /* ── Style 2: chromatic aberration burst ── */
    fc.save();
    // Red channel shift left
    fc.fillStyle = "rgba(255,0,80,0.12)";
    fc.fillRect(-8, 0, W, H);
    // Blue channel shift right
    fc.fillStyle = "rgba(0,180,255,0.10)";
    fc.fillRect(8, 0, W, H);
    // Centre white burst
    const cx = W / 2, cy = H * 0.4;
    const radGrad = fc.createRadialGradient(cx, cy, 0, cx, cy, W * 0.55);
    radGrad.addColorStop(0,   "rgba(255,255,255,0.22)");
    radGrad.addColorStop(0.4, "rgba(220,180,255,0.10)");
    radGrad.addColorStop(1,   "transparent");
    fc.fillStyle = radGrad;
    fc.fillRect(0, 0, W, H);
    fc.restore();

  } else {
    /* ── Style 3: dissolve pixel dust ── */
    fc.save();
    const particleCount = 120;
    for(let i = 0; i < particleCount; i++){
      const px = Math.random() * W;
      const py = Math.random() * H;
      const ps = 1 + Math.random() * 5;
      const pa = 0.4 + Math.random() * 0.5;
      const hue = 260 + Math.random() * 60;  // purple range
      fc.fillStyle = `hsla(${hue},80%,75%,${pa})`;
      fc.fillRect(px, py, ps, ps);
    }
    // Vertical light streak
    const lx = Math.random() * W;
    const lg = fc.createLinearGradient(lx - 20, 0, lx + 20, 0);
    lg.addColorStop(0,   "transparent");
    lg.addColorStop(0.5, "rgba(245,158,11,0.25)");
    lg.addColorStop(1,   "transparent");
    fc.fillStyle = lg;
    fc.fillRect(0, 0, W, H);
    fc.restore();
  }
}

function triggerSwap(){
  if(swapHovered) return;

  // Step 1 — draw flash on canvas, make it visible
  drawLightningFlash();
  flashCanvas.style.transition = "opacity 0.04s ease";
  flashCanvas.style.opacity    = "1";

  // Step 2 — at peak of flash, swap the image
  setTimeout(()=>{
    swapShowingAlt = !swapShowingAlt;
    mainImg.src = swapShowingAlt ? animeContent.robotSrc : animeContent.mainSrc;

    // Step 3 — fade flash out
    flashCanvas.style.transition = "opacity 0.18s ease";
    flashCanvas.style.opacity    = "0";
  }, 60);
}

function startSwapLoop(){
  stopSwapLoop();
  // Reset to base image each time we start
  swapShowingAlt = false;
  mainImg.src = animeContent.mainSrc;
  swapInterval = setInterval(triggerSwap, 2200);
}

function stopSwapLoop(){
  if(swapInterval){ clearInterval(swapInterval); swapInterval = null; }
  // Reset flash overlay
  flashCanvas.style.opacity = "0";
}

// Pause on hover — existing hover mask effect takes full control
container.addEventListener("mouseenter", ()=>{ swapHovered = true; });
container.addEventListener("mouseleave", ()=>{
  swapHovered = false;
  // Restore base image when cursor leaves (if alt is showing)
  if(isAnime && swapShowingAlt){
    swapShowingAlt = false;
    mainImg.src = animeContent.mainSrc;
  }
});
// Mobile touch
container.addEventListener("touchstart", ()=>{ swapHovered = true; }, { passive: true });
container.addEventListener("touchend",   ()=>{ swapHovered = false; }, { passive: true });

if(localStorage.getItem("firlli-mode")==="anime") applyMode(true,false);

modeToggle.addEventListener("click",()=>{
  if(transitioning) return;
  transitioning = true;
  const goAnime = !isAnime;

  if(!goAnime){
    /* ANIME → ROBOT: hologram scan */
    scanLine.classList.add("active");
    modeOverlay.className = "mode-transition-overlay scan-out";
    setTimeout(()=>{
      applyMode(false, true);
      modeOverlay.className = "mode-transition-overlay";
      scanLine.classList.remove("active");
      transitioning = false;
    }, 750);
  } else {
    /* ROBOT → ANIME: shimmer sweep */
    shimmerEl.classList.add("active");
    /* swap content midway through the sweep */
    setTimeout(()=>{ applyMode(true, true); }, 380);
    setTimeout(()=>{
      shimmerEl.classList.remove("active");
      transitioning = false;
    }, 850);
  }
});

function applyMode(anime, animate){
  isAnime = anime;
  isAnimeMode = anime;

  if(animate){
    document.body.classList.add("mode-transitioning");
    setTimeout(()=>document.body.classList.remove("mode-transitioning"), 600);
  }

  const c = anime ? animeContent : robotContent;
  currentTexts = anime ? animeTexts : robotTexts;
  typingEl.textContent=""; tIdx=0; tChar=0; tErasing=false;

  mainImg.src  = c.mainSrc;
  robotImg.src = c.robotSrc;

  document.getElementById("eyebrowText").textContent = c.eyebrow;
  document.getElementById("roleText").textContent    = c.role;
  document.getElementById("noteTitle").textContent   = c.noteTitle;
  document.getElementById("noteBody").textContent    = c.noteBody;
  modeIcon.textContent  = c.icon;
  modeLabel.textContent = c.label;

  document.body.classList.toggle("anime-mode", anime);

  /* show/hide hex canvas & robot frame */
  hexEl.style.display      = anime ? "none" : "block";
  robotFrame.style.display = anime ? "none" : "block";
  arcCanvas.style.display  = anime ? "none" : "block";

  /* start/stop the anime photo-swap loop */
  if(anime){
    // Small delay so the mode transition finishes before first swap fires
    setTimeout(startSwapLoop, 900);
  } else {
    stopSwapLoop();
  }

  localStorage.setItem("firlli-mode", anime ? "anime" : "robot");
}
