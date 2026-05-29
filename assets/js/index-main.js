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
   MECHA BACKGROUND — HEX + NODE NETWORK + SCAN
============================================= */
const hexCanvas = document.getElementById("hexCanvas");
const hCtx = hexCanvas.getContext("2d");
let hexes = [];
const HEX_SIZE = 30;
const HEX_GAP  = 4;
let hW, hH;

/* ── hex grid ── */
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
  const r = HEX_SIZE, w = r*2, h = Math.sqrt(3)*r;
  const cols = Math.ceil(hW/(w*.75))+2;
  const rows = Math.ceil(hH/h)+2;
  for(let row=0;row<rows;row++){
    for(let col=0;col<cols;col++){
      hexes.push({
        x: col*(w*.75),
        y: row*h + (col%2===0 ? 0 : h/2),
        phase: Math.random()*Math.PI*2,
        speed: 0.25+Math.random()*0.35,
        baseAlpha: 0.03+Math.random()*0.035
      });
    }
  }
}

/* ── floating node network ── */
let bgNodes = [];
const BG_NODE_COUNT = 11;
const BG_LINK_DIST  = 220;

function buildNodes(){
  bgNodes = [];
  for(let i=0;i<BG_NODE_COUNT;i++){
    bgNodes.push({
      x: Math.random()*hW,
      y: Math.random()*hH,
      vx: (Math.random()-0.5)*0.28,
      vy: (Math.random()-0.5)*0.28,
      phase: Math.random()*Math.PI*2,
      r: 1.8+Math.random()*1.8,
      // data pulse along each outgoing link
      pulse: Math.random()   // 0-1 travel position
    });
  }
}

/* ── circuit trace accents ── */
let traces = [];
function buildTraces(){
  traces = [];
  const count = 6;
  for(let i=0;i<count;i++) spawnTrace();
}
function spawnTrace(){
  // short L-shaped PCB segment at a random screen position
  const x = Math.random()*hW;
  const y = Math.random()*hH;
  const len1 = 40+Math.random()*80;
  const len2 = 30+Math.random()*60;
  const dir  = Math.random()<0.5 ? 1 : -1;
  traces.push({ x, y, len1, len2, dir, alpha:0, life:0,
                maxLife: 180+Math.random()*240 });
}

/* ── scan sweep ── */
let bgScanTime = 0;

function resizeHex(){
  hW = hexCanvas.width  = window.innerWidth;
  hH = hexCanvas.height = window.innerHeight;
  buildHexes();
  buildNodes();
  buildTraces();
}

let hexTime = 0;
function drawHexes(){
  hCtx.clearRect(0,0,hW,hH);
  hexTime += 0.007;

  /* 1 ── hex grid ── */
  hexes.forEach(h=>{
    const pulse = (Math.sin(hexTime*h.speed + h.phase)+1)/2;
    const alpha = h.baseAlpha + pulse*0.13;
    hexPath(hCtx, h.x, h.y, HEX_SIZE-HEX_GAP);
    hCtx.strokeStyle = `rgba(0,220,255,${alpha})`;
    hCtx.lineWidth = 0.8;
    hCtx.stroke();
    // bright hex flare — lower threshold so more hexes glow at once
    if(pulse > 0.76){
      hexPath(hCtx, h.x, h.y, HEX_SIZE-HEX_GAP);
      hCtx.strokeStyle = `rgba(0,229,255,${(pulse-0.76)*1.1})`;
      hCtx.lineWidth = 1.8;
      hCtx.stroke();
    }
  });

  /* 2 ── node network ── */
  bgNodes.forEach(n=>{
    n.x += n.vx; n.y += n.vy; n.phase += 0.018; n.pulse = (n.pulse+0.004)%1;
    if(n.x<-30) n.x=hW+30; if(n.x>hW+30) n.x=-30;
    if(n.y<-30) n.y=hH+30; if(n.y>hH+30) n.y=-30;
  });

  // connections
  for(let i=0;i<bgNodes.length;i++){
    for(let j=i+1;j<bgNodes.length;j++){
      const a=bgNodes[i], b=bgNodes[j];
      const dx=a.x-b.x, dy=a.y-b.y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<BG_LINK_DIST){
        const t = 1-dist/BG_LINK_DIST;

        // base connection line — clearly visible
        hCtx.save();
        hCtx.strokeStyle = `rgba(0,200,255,${t*0.35})`;
        hCtx.lineWidth   = 0.9;
        hCtx.beginPath();
        hCtx.moveTo(a.x, a.y);
        hCtx.lineTo(b.x, b.y);
        hCtx.stroke();

        // travelling data dot — bigger and brighter
        const tp = a.pulse;
        const px = a.x + (b.x-a.x)*tp;
        const py = a.y + (b.y-a.y)*tp;
        hCtx.beginPath();
        hCtx.arc(px, py, 2.5, 0, Math.PI*2);
        hCtx.fillStyle = `rgba(120,240,255,${t*0.9})`;
        hCtx.fill();

        hCtx.restore();
      }
    }
  }

  // node dots — larger glow, more visible
  bgNodes.forEach(n=>{
    const pulse = (Math.sin(n.phase)+1)/2;
    hCtx.save();
    // outer glow halo
    const g = hCtx.createRadialGradient(n.x,n.y,0, n.x,n.y, n.r*9);
    g.addColorStop(0,   `rgba(0,229,255,${0.50+pulse*0.35})`);
    g.addColorStop(0.35,`rgba(0,200,255,${0.20+pulse*0.15})`);
    g.addColorStop(0.7, `rgba(0,150,255,${0.06+pulse*0.04})`);
    g.addColorStop(1,   'transparent');
    hCtx.fillStyle = g;
    hCtx.beginPath(); hCtx.arc(n.x,n.y,n.r*9,0,Math.PI*2); hCtx.fill();
    // bright white-cyan core dot
    hCtx.fillStyle = `rgba(200,245,255,1)`;
    hCtx.beginPath(); hCtx.arc(n.x,n.y,n.r,0,Math.PI*2); hCtx.fill();
    hCtx.restore();
  });

  /* 3 ── circuit trace accents ── */
  traces.forEach((tr)=>{
    tr.life++;
    const half = tr.maxLife/2;
    tr.alpha = tr.life < half
      ? (tr.life/half)*0.65
      : ((tr.maxLife-tr.life)/half)*0.65;

    hCtx.save();
    hCtx.strokeStyle = `rgba(0,229,255,${tr.alpha})`;
    hCtx.lineWidth   = 1.2;
    hCtx.shadowColor = 'rgba(0,229,255,0.9)';
    hCtx.shadowBlur  = 8;
    hCtx.beginPath();
    hCtx.moveTo(tr.x, tr.y);
    hCtx.lineTo(tr.x + tr.len1, tr.y);
    hCtx.lineTo(tr.x + tr.len1, tr.y + tr.dir*tr.len2);
    hCtx.stroke();
    // glowing corner dot
    hCtx.beginPath();
    hCtx.arc(tr.x+tr.len1, tr.y, 3, 0, Math.PI*2);
    hCtx.fillStyle = `rgba(180,240,255,${Math.min(tr.alpha*2.5, 1)})`;
    hCtx.fill();
    hCtx.restore();

    if(tr.life >= tr.maxLife){
      const x=Math.random()*hW, y=Math.random()*hH;
      const len1=40+Math.random()*80, len2=30+Math.random()*60;
      Object.assign(tr,{x,y,len1,len2,dir:Math.random()<0.5?1:-1,
        alpha:0,life:0,maxLife:180+Math.random()*240});
    }
  });

  /* 4 ── horizontal scan sweep ── */
  bgScanTime += 0.006;
  const scanY = ((bgScanTime*28) % (hH+120)) - 60;
  hCtx.save();
  // wide soft glow band
  const sg = hCtx.createLinearGradient(0,scanY-50,0,scanY+50);
  sg.addColorStop(0,    'transparent');
  sg.addColorStop(0.35, 'rgba(0,229,255,0.06)');
  sg.addColorStop(0.5,  'rgba(0,229,255,0.20)');
  sg.addColorStop(0.65, 'rgba(0,229,255,0.06)');
  sg.addColorStop(1,    'transparent');
  hCtx.fillStyle = sg;
  hCtx.fillRect(0, scanY-50, hW, 100);
  // bright crisp line
  hCtx.strokeStyle = 'rgba(0,229,255,0.55)';
  hCtx.lineWidth   = 1;
  hCtx.shadowColor = 'rgba(0,229,255,0.9)';
  hCtx.shadowBlur  = 10;
  hCtx.beginPath();
  hCtx.moveTo(0,scanY); hCtx.lineTo(hW,scanY);
  hCtx.stroke();
  hCtx.restore();
}

/* =============================================
   FRAME ARC ANIMATION (robot mode)
============================================= */
const arcCanvas = document.getElementById("frameArc");
const aCtx = arcCanvas.getContext("2d");
let arcAngle  = 0;
let arcAngle2 = Math.PI * 0.85;   // dot 2 — starts at different phase
let arcAngle3 = Math.PI * 1.55;   // dot 3 — starts at yet another phase
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

  // advance all three angles at intentionally irrational speeds
  // so they never perfectly sync — gives a "random" feel
  arcAngle  += 0.008;               // dot 1: slow CW
  arcAngle2 -= 0.0137;              // dot 2: medium CCW
  arcAngle3 += 0.0053;              // dot 3: slow CW, different speed

  // outer slow arc (unchanged)
  aCtx.beginPath();
  aCtx.arc(cx, cy, r, arcAngle, arcAngle + Math.PI*0.4);
  aCtx.strokeStyle = "rgba(0,229,255,0.18)";
  aCtx.lineWidth = 1;
  aCtx.stroke();

  // inner faster arc opposite direction (unchanged)
  aCtx.beginPath();
  aCtx.arc(cx, cy, r-8, -arcAngle*1.5, -arcAngle*1.5 + Math.PI*0.25);
  aCtx.strokeStyle = "rgba(122,92,255,0.14)";
  aCtx.lineWidth = 0.8;
  aCtx.stroke();

  /* ── Dot 1 (existing): outer ring, cyan ── */
  const dot1X = cx + r*Math.cos(arcAngle + Math.PI*0.4);
  const dot1Y = cy + r*Math.sin(arcAngle + Math.PI*0.4);
  aCtx.beginPath();
  aCtx.arc(dot1X, dot1Y, 2.5, 0, Math.PI*2);
  aCtx.fillStyle = "rgba(0,229,255,0.7)";
  aCtx.fill();

  /* ── Dot 2 (new): inner ring, counter-clockwise, purple ──
     Radius has a subtle sinusoidal wobble for organic feel    */
  const r2    = (r - 16) + 5 * Math.sin(arcAngle2 * 2.3);
  const dot2X = cx + r2 * Math.cos(arcAngle2);
  const dot2Y = cy + r2 * Math.sin(arcAngle2);
  // tiny trailing glow
  aCtx.beginPath();
  aCtx.arc(dot2X, dot2Y, 5, 0, Math.PI*2);
  aCtx.fillStyle = "rgba(122,92,255,0.10)";
  aCtx.fill();
  // core
  aCtx.beginPath();
  aCtx.arc(dot2X, dot2Y, 2, 0, Math.PI*2);
  aCtx.fillStyle = "rgba(160,120,255,0.75)";
  aCtx.fill();

  /* ── Dot 3 (new): mid ring, clockwise, lighter cyan ──
     Different elliptical feel: x-radius slightly larger       */
  const r3    = (r - 26) + 4 * Math.cos(arcAngle3 * 1.7);
  const dot3X = cx + r3 * 1.06 * Math.cos(arcAngle3);
  const dot3Y = cy + r3 * 0.94 * Math.sin(arcAngle3);
  // tiny trailing glow
  aCtx.beginPath();
  aCtx.arc(dot3X, dot3Y, 4, 0, Math.PI*2);
  aCtx.fillStyle = "rgba(0,200,255,0.10)";
  aCtx.fill();
  // core
  aCtx.beginPath();
  aCtx.arc(dot3X, dot3Y, 1.8, 0, Math.PI*2);
  aCtx.fillStyle = "rgba(100,230,255,0.65)";
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
