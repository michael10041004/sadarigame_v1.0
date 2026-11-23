/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// High performance lightweight 60fps canvas confetti engine

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  size: number;
  color: string;
  shape: 'rect' | 'circle' | 'ribbon' | 'star';
  alpha: number;
  decay: number;
}

const CELEBRATION_COLORS = [
  '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6',
  '#3B82F6', '#10B981', '#F97316', '#FBBF24',
  '#06B6D4', '#A855F7', '#FFD700'
];

export function launchConfetti(
  canvas: HTMLCanvasElement,
  options?: { count?: number; originX?: number; originY?: number; spread?: number }
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const context = ctx;

  const count = options?.count ?? 150;
  const width = canvas.width = window.innerWidth;
  const height = canvas.height = window.innerHeight;

  const originX = (options?.originX ?? 0.5) * width;
  const originY = (options?.originY ?? 0.4) * height;
  const spread = options?.spread ?? 1;

  const particles: Particle[] = [];
  const shapes: Particle['shape'][] = ['rect', 'circle', 'ribbon', 'star'];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 12 + 6) * spread;
    particles.push({
      x: originX + (Math.random() - 0.5) * 40,
      y: originY + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (Math.random() * 4 + 2),
      angle: Math.random() * Math.PI * 2,
      vAngle: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 8 + 6,
      color: CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      alpha: 1,
      decay: Math.random() * 0.008 + 0.006,
    });
  }

  let animationFrameId: number;

  function render() {
    context.clearRect(0, 0, width, height);

    let active = false;

    for (const p of particles) {
      if (p.alpha <= 0.01) continue;
      active = true;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.vx *= 0.985; // drag
      p.angle += p.vAngle;
      p.alpha = Math.max(0, p.alpha - p.decay);

      context.save();
      context.globalAlpha = p.alpha;
      context.fillStyle = p.color;
      context.translate(p.x, p.y);
      context.rotate(p.angle);

      if (p.shape === 'rect') {
        context.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
      } else if (p.shape === 'circle') {
        context.beginPath();
        context.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        context.fill();
      } else if (p.shape === 'ribbon') {
        context.fillRect(-p.size, -2, p.size * 2, 4);
      } else if (p.shape === 'star') {
        drawStar(context, 0, 0, 5, p.size * 0.7, p.size * 0.35);
        context.fill();
      }

      context.restore();
    }

    if (active) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      context.clearRect(0, 0, width, height);
    }
  }

  animationFrameId = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(animationFrameId);
    context.clearRect(0, 0, width, height);
  };
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}
