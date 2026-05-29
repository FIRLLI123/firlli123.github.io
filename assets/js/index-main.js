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
   ANIME PATCH-REVEAL EFFECT
   Every ~2s in anime mode, 2-4 random circular
   "portals" open on the frame, revealing patches
   of anime2.png through the base asli.png image.
   mainImg src NEVER changes. Pauses on hover.
============================================= */
let swapInterval  = null;
let swapHovered   = false;
let swapStartTimer = null;   // tracks the delayed startSwapLoop setTimeout

// Preload anime2.png so canvas drawImage is instant
const altImg = new Image();
altImg.src   = animeContent.robotSrc;   // "anime2.png"

// Overlay canvas — sits above mainImg, below robot-layer
const flashCanvas = document.createElement("canvas");
flashCanvas.id = "flashCanvas";
flashCanvas.style.cssText = [
  "position:absolute","inset:0","width:100%","height:100%",
  "pointer-events:none","z-index:3","border-radius:30px",
  "opacity:0"
].join(";");
container.insertBefore(flashCanvas, document.getElementById("glow"));

function resizeFlash(){
  flashCanvas.width  = container.offsetWidth;
  flashCanvas.height = container.offsetHeight;
}
resizeFlash();
window.addEventListener("resize", resizeFlash);

/* ── helpers ── */

// Draw a jagged mini-lightning spark from (x1,y1) to (x2,y2)
function drawBolt(fc, x1, y1, x2, y2, color, blur){
  fc.save();
  fc.strokeStyle = color;
  fc.lineWidth   = 0.8 + Math.random();
  fc.shadowColor = color;
  fc.shadowBlur  = blur;
  fc.beginPath();
  fc.moveTo(x1, y1);
  const steps = 5 + Math.floor(Math.random() * 4);
  for(let i = 1; i <= steps; i++){
    const t  = i / steps;
    const mx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 20;
    const my = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 20;
    fc.lineTo(mx, my);
  }
  fc.stroke();
  fc.restore();
}

// Single soft-reveal: draws anime2.png through a feathered radial mask.
// No clip, no ring — edges dissolve organically using destination-in.
function drawPatches(){
  resizeFlash();
  const fc = flashCanvas.getContext("2d");
  const W  = flashCanvas.width;
  const H  = flashCanvas.height;
  fc.clearRect(0, 0, W, H);

  if(!altImg.complete || altImg.naturalWidth === 0) return;

  // 1 random centre, radius ≈ half of the shorter dimension
  const baseR  = Math.min(W, H) / 1.8;
  const radius = baseR * (0.88 + Math.random() * 0.22);
  const pad    = radius * 0.15;
  const cx     = pad + Math.random() * (W - pad * 2);
  const cy     = pad + Math.random() * (H - pad * 2);

  // Step 1: draw alt image full canvas size
  fc.drawImage(altImg, 0, 0, W, H);

  // Step 2: erase everything outside the soft radial mask
  fc.globalCompositeOperation = "destination-in";
  const mask = fc.createRadialGradient(cx, cy, 0, cx, cy, radius);
  mask.addColorStop(0,    "rgba(0,0,0,1)");
  mask.addColorStop(0.42, "rgba(0,0,0,0.96)");
  mask.addColorStop(0.68, "rgba(0,0,0,0.60)");
  mask.addColorStop(0.86, "rgba(0,0,0,0.20)");
  mask.addColorStop(1,    "rgba(0,0,0,0)");
  fc.fillStyle = mask;
  fc.fillRect(0, 0, W, H);
  fc.globalCompositeOperation = "source-over";

  // Step 3: tiny inner energy sparks (well inside the fade zone)
  const sparkColors = [
    "rgba(245,158,11,0.60)",
    "rgba(192,132,252,0.55)",
    "rgba(255,255,255,0.45)",
    "rgba(0,229,255,0.50)"
  ];
  const sparkCount = 2 + Math.floor(Math.random() * 2);
  for(let s = 0; s < sparkCount; s++){
    const angle = Math.random() * Math.PI * 2;
    const dist  = radius * (0.2 + Math.random() * 0.4);
    const x1    = cx + Math.cos(angle) * dist;
    const y1    = cy + Math.sin(angle) * dist;
    const x2    = x1 + (Math.random() - 0.5) * 30;
    const y2    = y1 + (Math.random() - 0.5) * 30;
    drawBolt(fc, x1, y1, x2, y2,
             sparkColors[Math.floor(Math.random() * sparkColors.length)], 7);
  }

  // Step 4: faint chromatic blush at centre
  fc.save();
  fc.globalCompositeOperation = "screen";
  const blush = fc.createRadialGradient(cx - 5, cy, 0, cx, cy, radius * 0.5);
  blush.addColorStop(0,   "rgba(255,30,100,0.05)");
  blush.addColorStop(0.5, "rgba(80,180,255,0.04)");
  blush.addColorStop(1,   "transparent");
  fc.fillStyle = blush;
  fc.fillRect(0, 0, W, H);
  fc.restore();
}

/* Animation: quick snap in → hold → soft fade out */
function triggerSwap(){
  if(swapHovered) return;

  drawPatches();

  // Snap visible
  flashCanvas.style.transition = "opacity 0.06s ease";
  flashCanvas.style.opacity    = "1";

  // Hold ~500ms then fade out softly
  setTimeout(()=>{
    flashCanvas.style.transition = "opacity 0.50s ease";
    flashCanvas.style.opacity    = "0";
  }, 500);
}

function startSwapLoop(){
  stopSwapLoop();
  // Ensure mainImg always shows the base image
  mainImg.src = animeContent.mainSrc;
  swapInterval = setInterval(triggerSwap, 2200);
}

function stopSwapLoop(){
  if(swapInterval){  clearInterval(swapInterval); swapInterval  = null; }
  if(swapStartTimer){ clearTimeout(swapStartTimer);  swapStartTimer = null; }
  flashCanvas.style.transition = "opacity 0.2s ease";
  flashCanvas.style.opacity    = "0";
}

// Pause on hover — existing hover mask effect takes full control
// Also instantly hide any active patch-reveal when entering
container.addEventListener("mouseenter", ()=>{
  swapHovered = true;
  flashCanvas.style.transition = "opacity 0.15s ease";
  flashCanvas.style.opacity    = "0";
});
container.addEventListener("mouseleave", ()=>{ swapHovered = false; });
// Mobile touch
container.addEventListener("touchstart", ()=>{ swapHovered = true;  flashCanvas.style.opacity = "0"; }, { passive: true });
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
    // Small delay so mode transition finishes before first swap fires
    // Store in swapStartTimer so it can be cancelled if mode switches quickly
    swapStartTimer = setTimeout(startSwapLoop, 900);
  } else {
    stopSwapLoop();   // also cancels any pending swapStartTimer
  }

  localStorage.setItem("firlli-mode", anime ? "anime" : "robot");
}
