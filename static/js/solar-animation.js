/**
 * ☀️  QUYOSH PANELI ANIMATSIYASI (2 ta panel, Generator, Silliq burilish)
 */

(function () {
  const canvas = document.getElementById('solar-anim-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 550, H = 550;

  function resize() {
    const wrapper = canvas.parentElement;
    W = wrapper.offsetWidth || 550;
    H = wrapper.offsetHeight || 550;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  const CYCLE_SECONDS = 24; 
  let startTime = null;

  // ─── Yulduzlar ───
  const STAR_COUNT = 150;
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random(),
    y: Math.random() * 0.7,
    r: Math.random() * 1.5 + 0.5,
    twinkle: Math.random() * Math.PI * 2,
    speed: Math.random() * 2 + 0.5,
  }));

  // ─── Bulutlar ───
  const CLOUD_COUNT = 6;
  const clouds = Array.from({ length: CLOUD_COUNT }, () => ({
    x: Math.random() * 1.5,
    y: 0.05 + Math.random() * 0.25,
    scale: 0.4 + Math.random() * 0.6,
    speed: 0.003 + Math.random() * 0.005
  }));

  function getNightRatio(t) {
    if (t < 0.05) return 1.0;
    if (t < 0.2) return 1.0 - (t - 0.05) / 0.15; 
    if (t < 0.55) return 0.0; 
    if (t < 0.7) return (t - 0.55) / 0.15;       
    return 1.0;
  }

  function sunPosition(t) {
    let sunProgress = 0;
    if (t >= 0.05 && t <= 0.7) {
        sunProgress = (t - 0.05) / 0.65;
    } else if (t > 0.7) {
        sunProgress = 1;
    }

    const angle = Math.PI * sunProgress;
    const cx = W / 2;
    const cy = H * 0.85; 
    const rx = W * 0.42;
    const ry = H * 0.72;

    return {
      x: cx - rx * Math.cos(angle),
      y: cy - ry * Math.sin(angle),
    };
  }

  // Panelni silliq burilish mantiqasi
  function panelAngle(t, sunX, sunY, panelX, panelY) {
    const calcRawAngle = (sx, sy) => {
        let angle = Math.atan2(sy - panelY, sx - panelX) + Math.PI / 2;
        const maxA = Math.PI / 2 - 0.15;
        if (angle < -maxA) angle = -maxA;
        if (angle > maxA) angle = maxA;
        return angle;
    };

    if (t >= 0.05 && t <= 0.7) {
        // Kunduzi quyoshga qarab aniq yuzlanadi
        return calcRawAngle(sunX, sunY);
    } else {
        // Tunda o'z o'rniga silliq tarzda qaytadi
        const sunsetSun = sunPosition(0.7);
        const sunriseSun = sunPosition(0.05);
        const sunsetAngle = calcRawAngle(sunsetSun.x, sunsetSun.y);
        const sunriseAngle = calcRawAngle(sunriseSun.x, sunriseSun.y);
        
        let p = 0;
        if (t > 0.7 && t < 0.75) {
            p = 0; // Botgandan so'ng biroz vaqt qarab turadi
        } else if (t >= 0.75 && t <= 0.95) {
            p = (t - 0.75) / 0.20; // Asta-sekin aylanadi
        } else {
            p = 1; // Tong otishiga tayyor
        }
        
        // Silliq harakat (Smooth Step)
        const smoothP = p * p * (3 - 2 * p);
        return sunsetAngle + (sunriseAngle - sunsetAngle) * smoothP;
    }
  }

  function lerpColor(a, b, t) {
    t = Math.max(0, Math.min(1, t));
    const ah = parseInt(a.replace('#',''), 16);
    const bh = parseInt(b.replace('#',''), 16);
    const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
    const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return `rgb(${r},${g},${bl})`;
  }

  function skyColor(t) {
    if (t < 0.05) return lerpColor('#050a14', '#1a0a22', t / 0.05);
    if (t < 0.15) return lerpColor('#1a0a22', '#ff6b35', (t - 0.05) / 0.1);
    if (t < 0.30) return lerpColor('#ff6b35', '#29b6f6', (t - 0.15) / 0.15);
    if (t < 0.50) return '#29b6f6'; 
    if (t < 0.60) return lerpColor('#29b6f6', '#ff5722', (t - 0.5) / 0.1);
    if (t < 0.70) return lerpColor('#ff5722', '#0a0418', (t - 0.6) / 0.1);
    return '#050a14';
  }

  function sunAlpha(t) {
    if (t < 0.03) return 0;
    if (t < 0.10) return (t - 0.03) / 0.07;
    if (t < 0.60) return 1;
    if (t < 0.72) return 1 - (t - 0.60) / 0.12;
    return 0;
  }

  function starAlpha(t) {
    if (t < 0.03) return 1 - (t / 0.03);
    if (t < 0.10) return 0;
    if (t < 0.65) return 0;
    if (t < 0.75) return (t - 0.65) / 0.1;
    if (t < 0.98) return 1;
    return 1 - ((t - 0.98) / 0.02);
  }

  function drawSky(t) {
    const grad = ctx.createLinearGradient(0, 0, 0, H * 0.78);
    grad.addColorStop(0, skyColor(t));
    
    let horizonColor;
    if (t < 0.05) horizonColor = lerpColor('#08101e', '#1a0a22', t / 0.05);
    else if (t < 0.15) horizonColor = lerpColor('#1a0a22', '#ffb74d', (t - 0.05) / 0.1);
    else if (t < 0.30) horizonColor = lerpColor('#ffb74d', '#81d4fa', (t - 0.15) / 0.15);
    else if (t < 0.50) horizonColor = '#81d4fa';
    else if (t < 0.60) horizonColor = lerpColor('#81d4fa', '#ff8a65', (t - 0.5) / 0.1);
    else if (t < 0.70) horizonColor = lerpColor('#ff8a65', '#08101e', (t - 0.6) / 0.1);
    else horizonColor = '#08101e';

    grad.addColorStop(1, horizonColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawStars(t, now) {
    const alpha = starAlpha(t);
    if (alpha <= 0) return;
    ctx.fillStyle = '#ffffff';
    stars.forEach(s => {
      ctx.globalAlpha = alpha * (0.5 + 0.5 * Math.sin(now * s.speed + s.twinkle));
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawClouds(t, dt) {
    const n = getNightRatio(t);
    const alpha = 0.8 - (0.7 * n); 
    const cloudColor = lerpColor('#ffffff', '#4a5b78', n);

    ctx.fillStyle = cloudColor;
    clouds.forEach(c => {
      c.x += c.speed * dt;
      if (c.x > 1.2) {
        c.x = -0.2;
        c.y = 0.05 + Math.random() * 0.25;
      }
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(c.x * W, c.y * H);
      ctx.scale(c.scale, c.scale);
      
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI*2);
      ctx.arc(20, -10, 25, 0, Math.PI*2);
      ctx.arc(45, 0, 20, 0, Math.PI*2);
      ctx.arc(20, 10, 20, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }

  function drawSun(t, sun) {
    const alpha = sunAlpha(t);
    if (alpha <= 0) return;

    const glow = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, W * 0.25);
    glow.addColorStop(0,   `rgba(255, 240, 150, ${0.7 * alpha})`);
    glow.addColorStop(0.3, `rgba(255, 180, 50, ${0.2 * alpha})`);
    glow.addColorStop(1,   `rgba(255, 100, 0, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, W * 0.25, 0, Math.PI * 2);
    ctx.fill();

    const sunGrad = ctx.createRadialGradient(sun.x - W*0.01, sun.y - W*0.01, 2, sun.x, sun.y, W*0.07);
    sunGrad.addColorStop(0,   `rgba(255, 255, 220, ${alpha})`);
    sunGrad.addColorStop(0.5, `rgba(255, 220, 50, ${alpha})`);
    sunGrad.addColorStop(1,   `rgba(255, 150, 20, ${alpha})`);
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, W*0.07, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSunBeam(t, sun, mounts) {
    const alpha = sunAlpha(t);
    if (alpha <= 0 || t < 0.05 || t > 0.7) return;

    ctx.save();
    mounts.forEach(mount => {
      const dx = mount.x - sun.x;
      const dy = mount.y - sun.y;
      const dist = Math.hypot(dx, dy);
      const dirX = dx / dist;
      const dirY = dy / dist;
      
      const px = -dirY;
      const py = dirX;
      const sunW = W * 0.04; 
      const panelW = W * 0.10;

      ctx.beginPath();
      ctx.moveTo(sun.x + px * sunW, sun.y + py * sunW);
      ctx.lineTo(mount.x + px * panelW, mount.y + py * panelW);
      ctx.lineTo(mount.x - px * panelW, mount.y - py * panelW);
      ctx.lineTo(sun.x - px * sunW, sun.y - py * sunW);
      ctx.closePath();

      const beamGrad = ctx.createLinearGradient(sun.x, sun.y, mount.x, mount.y);
      beamGrad.addColorStop(0, `rgba(255, 240, 150, ${0.3 * alpha})`);
      beamGrad.addColorStop(1, `rgba(255, 220, 80, ${0.05 * alpha})`);
      ctx.fillStyle = beamGrad;
      ctx.fill();

      const now = Date.now() / 1000;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * alpha})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([15, 25]);
      ctx.lineDashOffset = -now * 60; 
      
      for(let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        const offset = i * panelW * 0.6;
        ctx.moveTo(sun.x + px * (sunW * i * 0.6), sun.y + py * (sunW * i * 0.6));
        ctx.lineTo(mount.x + px * offset, mount.y + py * offset);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    });
    ctx.restore();
  }

  function drawHills(t) {
    const n = getNightRatio(t);
    const hill1Color = lerpColor('#2b6b44', '#0b1620', n);
    const hill2Color = lerpColor('#338050', '#050c11', n);
    const groundColor = lerpColor('#3a955b', '#03080c', n);
    const groundGrad2 = lerpColor('#143c24', '#010305', n);

    ctx.fillStyle = hill1Color;
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, H * 0.60);
    ctx.bezierCurveTo(W * 0.2, H * 0.50, W * 0.8, H * 0.65, W, H * 0.55);
    ctx.lineTo(W, H);
    ctx.fill();

    ctx.fillStyle = hill2Color;
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, H * 0.68);
    ctx.bezierCurveTo(W * 0.3, H * 0.60, W * 0.7, H * 0.70, W, H * 0.62);
    ctx.lineTo(W, H);
    ctx.fill();

    const grad = ctx.createLinearGradient(0, H * 0.75, 0, H);
    grad.addColorStop(0, groundColor);
    grad.addColorStop(1, groundGrad2);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, H * 0.75);
    ctx.bezierCurveTo(W * 0.3, H * 0.70, W * 0.7, H * 0.78, W, H * 0.72);
    ctx.lineTo(W, H);
    ctx.fill();
  }

  function drawPineTree(x, y, scale, t) {
    const n = getNightRatio(t);
    const trunk = lerpColor('#5d4037', '#110a05', n);
    const leaves = lerpColor('#2e7d32', '#0b1f12', n);

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = `rgba(0,0,0,${0.2 + 0.3 * n})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = trunk;
    ctx.fillRect(-6, -25, 12, 25);

    ctx.fillStyle = leaves;
    for(let i=0; i<3; i++) {
      ctx.beginPath();
      ctx.moveTo(0, -85 + i * 20);
      ctx.lineTo(35 - i*6, -25 + i * 15);
      ctx.lineTo(-35 + i*6, -25 + i * 15);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawGenerator(t, genX, genY) {
    const n = getNightRatio(t);
    const genW = W * 0.14;
    const genH = H * 0.12;
    const gX = genX - genW/2;
    const gY = genY - genH;

    // Soya
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(genX, genY, genW/2 + 5, 8, 0, 0, Math.PI*2);
    ctx.fill();

    // Body
    ctx.fillStyle = lerpColor('#78909c', '#1a2024', n);
    ctx.beginPath();
    ctx.roundRect(gX, gY, genW, genH, 4);
    ctx.fill();

    // Outline
    ctx.strokeStyle = lerpColor('#455a64', '#0d1113', n);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vents
    ctx.fillStyle = lerpColor('#37474f', '#0a0d0f', n);
    for(let i=0; i<4; i++) {
        ctx.fillRect(gX + 10, gY + 12 + i * 8, genW - 20, 4);
    }
    
    // Status qismi
    ctx.fillStyle = lerpColor('#263238', '#000000', n);
    ctx.fillRect(gX + 10, gY + genH - 25, genW - 20, 15);

    // Indicator yorug'lik
    const isWorking = t > 0.05 && t < 0.7;
    let lightColor = '#f44336'; // Qizil (Ishlamayapti)
    if (isWorking) {
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            lightColor = '#69f0ae'; // Miltillovchi yashil
        } else {
            lightColor = '#00e676'; // Yashil
        }
    } else {
        if (Math.floor(Date.now() / 1000) % 2 === 0) {
             lightColor = '#ff5252'; // Miltillovchi qizil
        }
    }
    
    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.arc(gX + genW - 18, gY + genH - 17, 4, 0, Math.PI*2);
    ctx.fill();
    
    if (isWorking) {
        // Nurlanish glow effekti
        const glow = ctx.createRadialGradient(gX + genW - 18, gY + genH - 17, 0, gX + genW - 18, gY + genH - 17, 10);
        glow.addColorStop(0, 'rgba(105, 240, 174, 0.8)');
        glow.addColorStop(1, 'rgba(105, 240, 174, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(gX + genW - 18, gY + genH - 17, 10, 0, Math.PI*2);
        ctx.fill();
    }
  }

  function drawCables(t, m1, m2, genX, genY) {
    const n = getNightRatio(t);
    const cableColor = lerpColor('#263238', '#0a0a0a', n);
    
    ctx.strokeStyle = cableColor;
    ctx.lineWidth = 4;
    
    // 1-paneldan generatorga
    ctx.beginPath();
    ctx.moveTo(m1.x, m1.y + 30); 
    ctx.quadraticCurveTo(m1.x + 30, m1.y + 70, genX - 15, genY - 5);
    ctx.stroke();

    // 2-paneldan generatorga
    ctx.beginPath();
    ctx.moveTo(m2.x, m2.y + 30);
    ctx.quadraticCurveTo(m2.x - 30, m2.y + 70, genX + 15, genY - 5);
    ctx.stroke();

    const isWorking = t > 0.05 && t < 0.7;
    if (isWorking) {
        const now = Date.now() / 1000;
        ctx.strokeStyle = 'rgba(255, 235, 59, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 12]);
        ctx.lineDashOffset = -now * 30; // Generator tomon yuguruvchi energiya
        
        ctx.beginPath();
        ctx.moveTo(m1.x, m1.y + 30); 
        ctx.quadraticCurveTo(m1.x + 30, m1.y + 70, genX - 15, genY - 5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(m2.x, m2.y + 30);
        ctx.quadraticCurveTo(m2.x - 30, m2.y + 70, genX + 15, genY - 5);
        ctx.stroke();

        ctx.setLineDash([]);
    }
  }

  function drawGroundSolarPanel(mountX, mountY, angleDeg, t) {
    const n = getNightRatio(t);
    const PL = W * 0.22; 
    const PT = W * 0.14; 
    const groundLevel = H * 0.74;

    // Beton poydevor
    ctx.fillStyle = lerpColor('#b0bec5', '#111111', n);
    ctx.beginPath();
    ctx.roundRect(mountX - 20, groundLevel, 40, 10, 3);
    ctx.fill();

    // Ustun (Pole)
    const poleGrad = ctx.createLinearGradient(mountX - 6, 0, mountX + 6, 0);
    poleGrad.addColorStop(0, lerpColor('#7f8c8d', '#111111', n));
    poleGrad.addColorStop(0.5, lerpColor('#bdc3c7', '#222222', n));
    poleGrad.addColorStop(1, lerpColor('#606a6b', '#0a0a0a', n));
    ctx.fillStyle = poleGrad;
    ctx.fillRect(mountX - 6, mountY, 12, groundLevel - mountY);

    ctx.save();
    ctx.translate(mountX, mountY);
    ctx.rotate(angleDeg);

    // Gorizontal ushlab turuvchi temir
    ctx.fillStyle = lerpColor('#455a64', '#0a0a0a', n);
    ctx.beginPath();
    ctx.roundRect(-PL/2 - 10, -5, PL + 20, 10, 4);
    ctx.fill();

    // Panel asosi
    const grad = ctx.createLinearGradient(-PL/2, -PT/2, PL/2, PT/2);
    grad.addColorStop(0, lerpColor('#0d47a1', '#060a14', n));
    grad.addColorStop(0.5, lerpColor('#1e88e5', '#0c162c', n));
    grad.addColorStop(1, lerpColor('#0d47a1', '#060a14', n));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(-PL/2, -PT/2, PL, PT, 6);
    ctx.fill();

    // Ramka
    ctx.strokeStyle = lerpColor('#e0e0e0', '#2a3a5a', n);
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hujayralar
    ctx.strokeStyle = lerpColor('#90caf9', '#325078', n);
    ctx.globalAlpha = 1.0 - (0.5 * n);
    ctx.lineWidth = 1.5;
    const cols = 5, rows = 3;
    for(let i=1; i<cols; i++) {
      const px = -PL/2 + (PL/cols) * i;
      ctx.beginPath();
      ctx.moveTo(px, -PT/2);
      ctx.lineTo(px, PT/2);
      ctx.stroke();
    }
    for(let i=1; i<rows; i++) {
      const py = -PT/2 + (PT/rows) * i;
      ctx.beginPath();
      ctx.moveTo(-PL/2, py);
      ctx.lineTo(PL/2, py);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Yaltirash effekti
    if (n < 1) {
      const shineAlpha = (1 - n) * 0.15;
      const shine = ctx.createLinearGradient(-PL/2, -PT/2, PL/2, PT/2);
      shine.addColorStop(0, 'rgba(255,255,255,0)');
      shine.addColorStop(0.4, 'rgba(255,255,255,0)');
      shine.addColorStop(0.5, `rgba(255,255,255,${shineAlpha})`);
      shine.addColorStop(0.6, 'rgba(255,255,255,0)');
      shine.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = shine;
      ctx.beginPath();
      ctx.roundRect(-PL/2, -PT/2, PL, PT, 6);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawStatus(t) {
    let msg = '', color = '';
    
    if (t < 0.05) { msg = '🌅 Tong — Panellar quyoshni kutmoqda'; color = '#ffb74d'; }
    else if (t < 0.3) { msg = '🌄 Quyosh chiqmoqda — Energiya yig\'ilmoqda'; color = '#ffee58'; }
    else if (t < 0.5) { msg = '☀️ Tush vaqti — Generator to\'lmoqda'; color = '#fff59d'; }
    else if (t < 0.7) { msg = '🌇 Quyosh botmoqda'; color = '#ff8a65'; }
    else { msg = '🌌 Tun — Panellar joyiga qaytmoqda'; color = '#90caf9'; }

    ctx.font = `bold ${Math.max(14, W * 0.035)}px sans-serif`;
    ctx.textAlign = 'center';
    
    const w = ctx.measureText(msg).width;
    ctx.fillStyle = 'rgba(10, 14, 26, 0.65)';
    ctx.beginPath();
    ctx.roundRect(W/2 - w/2 - 18, H - 45, w + 36, 34, 10);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.fillText(msg, W/2, H - 22);
  }

  let lastTime = 0;
  function render(timestamp) {
    if (!startTime) startTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    
    const elapsed = (timestamp - startTime) / 1000;
    const t = (elapsed % CYCLE_SECONDS) / CYCLE_SECONDS;

    ctx.clearRect(0, 0, W, H);

    drawSky(t);
    drawStars(t, elapsed);
    drawClouds(t, 1);

    const sun = sunPosition(t);
    
    // Ikki panel va generator koordinatalari
    const m1 = { x: W * 0.28, y: H * 0.58 };
    const m2 = { x: W * 0.72, y: H * 0.58 };
    const gen = { x: W * 0.50, y: H * 0.72 }; 

    drawSunBeam(t, sun, [m1, m2]);
    drawSun(t, sun);

    drawHills(t);
    
    drawPineTree(W * 0.08, H * 0.72, 1.3, t);
    drawPineTree(W * 0.92, H * 0.75, 1.2, t);
    drawPineTree(W * 0.50, H * 0.66, 0.7, t); // Generator ortidagi daraxt
    
    drawCables(t, m1, m2, gen.x, gen.y);
    drawGenerator(t, gen.x, gen.y);

    const angle1 = panelAngle(t, sun.x, sun.y, m1.x, m1.y);
    const angle2 = panelAngle(t, sun.x, sun.y, m2.x, m2.y);
    drawGroundSolarPanel(m1.x, m1.y, angle1, t);
    drawGroundSolarPanel(m2.x, m2.y, angle2, t);

    drawStatus(t);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
