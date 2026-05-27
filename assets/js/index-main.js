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

function animateCursor(){
  curX += (mouseX-curX)*.1;
  curY += (mouseY-curY)*.1;
  robotImg.style.webkitMaskPosition = `${curX-140}px ${curY-140}px`;
  robotImg.style.maskPosition       = `${curX-140}px ${curY-140}px`;
  glow.style.left = `${curX}px`;
  glow.style.top  = `${curY}px`;
  cursor.style.left = `${curX}px`;
  cursor.style.top  = `${curY}px`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

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
  setTimeout(()=>{ window.location.href="index4.html"; }, 1400);
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
  hexEl.style.display    = anime ? "none" : "block";
  robotFrame.style.display = anime ? "none" : "block";
  arcCanvas.style.display  = anime ? "none" : "block";

  localStorage.setItem("firlli-mode", anime ? "anime" : "robot");
}
