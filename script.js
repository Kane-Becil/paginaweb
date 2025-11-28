// Tema (claro/oscuro) persistente
const root = document.documentElement;
const toggle = document.getElementById('themeToggle');
function applyTheme(theme){
  if(theme==='dark'){
    document.documentElement.setAttribute('data-theme','dark');
    toggle.setAttribute('aria-pressed','true');
    toggle.textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    toggle.setAttribute('aria-pressed','false');
    toggle.textContent = '🌙';
  }
  try{localStorage.setItem('theme',theme)}catch(e){}
}
// Cargar preferencia
(function(){
  const stored = localStorage.getItem('theme');
  if(stored) applyTheme(stored);
  else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
})();

toggle.addEventListener('click',()=>{
  const isDark = document.documentElement.getAttribute('data-theme')==='dark';
  applyTheme(isDark? 'light' : 'dark');
});

// Smooth scroll para enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const href = a.getAttribute('href');
    if(href.length>1){
      e.preventDefault();
      const el = document.querySelector(href);
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    }
  })
});

// Dibuja un gráfico de barras simple en canvas con datos de ejemplo
function drawChart(){
  const canvas = document.getElementById('chart');
  if(!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const data = [120,180,90,240,200]; // datos de ejemplo (p. ej. flujos por año)
  const labels = ['2019','2020','2021','2022','2023'];
  // limpiar y escalar
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.height || 240;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,width,height);

  const max = Math.max(...data) * 1.1;
  const padding = 40;
  const barSlot = (width - padding*2)/data.length;
  const barWidth = barSlot * 0.7;

  // Animación suave de las barras usando requestAnimationFrame
  const duration = 900;
  let start = null;
  function animate(ts){
    if(!start) start = ts;
    const t = Math.min(1, (ts - start) / duration);
    // easing (easeOutCubic)
    const ease = 1 - Math.pow(1 - t, 3);

    ctx.clearRect(0,0,width,height);

    data.forEach((v,i)=>{
      const x = padding + i * barSlot + (barSlot - barWidth)/2;
      const targetH = (v / max) * (height - padding*2);
      const h = targetH * ease;
      const y = height - padding - h;
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#0ea5a4';
      ctx.fillRect(x, y, barWidth, h);
      // etiqueta
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text') || '#111';
      ctx.font = '12px system-ui, Arial';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + barWidth/2, height - padding + 16);
    });

    if(t < 1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

window.addEventListener('load', drawChart);
window.addEventListener('resize', ()=>{setTimeout(drawChart,80)});

// Reveal on scroll: IntersectionObserver for .reveal and .pop elements
function setupReveal(){
  const opts = {root:null,rootMargin:'0px 0px -8% 0px',threshold:0.08};
  const io = new IntersectionObserver((entries, obs)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        en.target.classList.add('in-view');
        obs.unobserve(en.target);
      }
    });
  }, opts);
  document.querySelectorAll('.reveal, .pop').forEach(el=>io.observe(el));

  // When chart enters viewport, (re)draw with animation
  const chart = document.getElementById('chart');
  if(chart){
    const cObserver = new IntersectionObserver((entries, o)=>{
      entries.forEach(e=>{
        if(e.isIntersecting) { drawChart(); o.unobserve(chart); }
      });
    }, {root:null,threshold:0.05});
    cObserver.observe(chart);
  }
}

setupReveal();
