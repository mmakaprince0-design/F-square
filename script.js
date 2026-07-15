/* =========================================================
   F-SQUARE — index page interactions
   1. Canvas mesh-warp ripple effect on the hero image
   2. Image track slideshow (color + caption synced)
   (Mobile burger menu now lives in js/nav.js, shared across pages)
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initRipple();
  initTrack();
});

/* ---------------------------------------------------------
   Ripple effect — mesh warp of the hero image
--------------------------------------------------------- */
function initRipple(){
  const host   = document.getElementById('rippleHost');
  const canvas = document.getElementById('rippleCanvas');
  const img    = document.getElementById('rippleSource');
  if(!host || !canvas || !img) return;

  const ctx = canvas.getContext('2d');
  const COLS = 26, ROWS = 18;
  let ripples = [];
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let cw = 0, ch = 0;
  let raf = null;

  function resize(){
    cw = host.clientWidth;
    ch = host.clientHeight;
    canvas.width  = cw * dpr;
    canvas.height = ch * dpr;
    canvas.style.width  = cw + 'px';
    canvas.style.height = ch + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function addRipple(x, y, strength){
    ripples.push({ x, y, t: 0, strength: strength || 1 });
    if(ripples.length > 6) ripples.shift();
  }

  function draw(){
    if(!img.complete || !img.naturalWidth){ raf = requestAnimationFrame(draw); return; }
    ctx.clearRect(0,0,cw,ch);

    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw/iw, ch/ih);
    const sw = iw*scale, sh = ih*scale;
    const ox = (cw - sw)/2, oy = (ch - sh)/2;

    const cellW = cw/COLS, cellH = ch/ROWS;

    ripples.forEach(r => r.t += 1);
    ripples = ripples.filter(r => r.t < 130);

    for(let row=0; row<ROWS; row++){
      for(let col=0; col<COLS; col++){
        const destX = col*cellW;
        const destY = row*cellH;
        const cx = destX + cellW/2;
        const cy = destY + cellH/2;

        let dx = 0, dy = 0, scaleBump = 0;

        for(const r of ripples){
          const ddx = cx - r.x, ddy = cy - r.y;
          const dist = Math.sqrt(ddx*ddx + ddy*ddy) || 0.001;
          const waveRadius = r.t * 6.4;
          const band = 46;
          const diff = dist - waveRadius;
          if(Math.abs(diff) < band){
            const falloff = 1 - Math.abs(diff)/band;
            const decay = 1 - r.t/130;
            const amp = Math.sin((diff/band) * Math.PI) * falloff * decay * 14 * r.strength;
            dx += (ddx/dist) * amp;
            dy += (ddy/dist) * amp;
            scaleBump += falloff * decay * 0.06 * r.strength;
          }
        }

        const sx = (destX - ox)/scale;
        const sy = (destY - oy)/scale;
        const sCellW = cellW/scale;
        const sCellH = cellH/scale;

        const grow = 1 + scaleBump;
        const dw = cellW*grow + 1.5;
        const dh = cellH*grow + 1.5;

        ctx.drawImage(
          img,
          Math.max(sx,0), Math.max(sy,0), sCellW, sCellH,
          destX + dx - (dw-cellW)/2, destY + dy - (dh-cellH)/2, dw, dh
        );
      }
    }

    raf = requestAnimationFrame(draw);
  }

  function start(){
    resize();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(draw);
  }

  if(img.complete && img.naturalWidth){ start(); }
  else { img.addEventListener('load', start); }

  window.addEventListener('resize', () => { resize(); });

  let lastMove = 0;
  host.addEventListener('pointermove', (e) => {
    const now = performance.now();
    if(now - lastMove < 90) return;
    lastMove = now;
    const rect = host.getBoundingClientRect();
    addRipple(e.clientX - rect.left, e.clientY - rect.top, 0.55);
  });
  host.addEventListener('pointerdown', (e) => {
    const rect = host.getBoundingClientRect();
    addRipple(e.clientX - rect.left, e.clientY - rect.top, 1.6);
  });

  let autoTimer = setInterval(() => {
    addRipple(cw * (0.25 + Math.random()*0.5), ch * (0.25 + Math.random()*0.5), 0.8);
  }, 3200);
  addRipple(cw*0.5, ch*0.5, 1);
}

/* ---------------------------------------------------------
   Image track slideshow — color + caption synced
--------------------------------------------------------- */
function initTrack(){
  const section = document.querySelector('.track-section');
  const viewport = document.getElementById('trackViewport');
  const track = document.getElementById('track');
  const slides = Array.from(track ? track.children : []);
  const dotsWrap = document.getElementById('trackDots');
  const captionText = document.getElementById('trackCaptionText');
  const prevBtn = document.getElementById('trackPrev');
  const nextBtn = document.getElementById('trackNext');
  if(!section || !track || !slides.length) return;

  const data = [
    { title:'Ankara',   copy:'Bold wax-print cotton, block-dyed in small batches for color that holds.' },
    { title:'Kente',    copy:'Hand-woven strips of silk and cotton, each pattern naming a proverb.' },
    { title:'Adire',    copy:'Indigo-resist cloth, tied and dyed by hand in Abeokuta workshops.' },
    { title:'Aso-oke',  copy:'Prestige cloth woven on narrow looms for weddings and chieftaincy.' },
    { title:'Atelier',  copy:'Every bolt is cut and finished in-house by our resident tailors.' },
  ];

  let index = 0;
  let autoplay = null;

  function layout(){
    const target = slides[index];
    const shift = target.offsetLeft - (viewport.clientWidth - target.offsetWidth) / 2;
    track.style.transform = `translateX(${-Math.max(shift,0)}px)`;
  }

  function render(){
    slides.forEach((s,i) => s.classList.toggle('is-active', i === index));
    const color = slides[index].dataset.color || '#F1E9DB';
    section.style.setProperty('--track-bg', color);

    captionText.style.opacity = 0;
    captionText.style.transform = 'translateY(6px)';
    setTimeout(() => {
      const d = data[index] || data[0];
      captionText.innerHTML = `<h3>${d.title}</h3><p>${d.copy}</p>`;
      captionText.style.transition = 'opacity .4s ease, transform .4s ease';
      captionText.style.opacity = 1;
      captionText.style.transform = 'translateY(0)';
    }, 180);

    Array.from(dotsWrap.children).forEach((d,i) => d.classList.toggle('is-active', i === index));
    layout();
  }

  function goTo(i){
    index = (i + slides.length) % slides.length;
    render();
    restartAutoplay();
  }

  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', 'Go to slide ' + (i+1));
    b.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(b);
  });

  slides.forEach((s,i) => s.addEventListener('click', () => goTo(i)));
  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));

  function restartAutoplay(){
    clearInterval(autoplay);
    autoplay = setInterval(() => goTo(index + 1), 4200);
  }

  section.addEventListener('mouseenter', () => clearInterval(autoplay));
  section.addEventListener('mouseleave', restartAutoplay);

  window.addEventListener('resize', layout);

  render();
  restartAutoplay();
}
