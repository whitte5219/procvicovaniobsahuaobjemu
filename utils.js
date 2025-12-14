export function clamp(v, min, max){
  return Math.max(min, Math.min(max, v));
}

export function rad(deg){
  return (deg * Math.PI) / 180;
}

export function fmtNumber(x){
  if (!Number.isFinite(x)) return "—";
  // nicer for school: show up to 3 decimals, trim zeros
  const s = x.toFixed(3);
  return s.replace(/\.?0+$/,"");
}

export function clearCanvas(ctx, w, h){
  ctx.clearRect(0,0,w,h);
}

export function niceScale(value, minPx, maxPx){
  // maps positive values to a reasonable pixel range
  const v = Math.max(0.0001, Number(value) || 1);
  const k = Math.log(v + 1) / Math.log(11); // 0..1 roughly for 0..10
  return minPx + (maxPx - minPx) * clamp(k, 0, 1);
}

export function setHiDPI(canvas, ctx){
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = Math.round(rect.width * dpr);
  const h = Math.round(rect.height * dpr);
  if (canvas.width !== w || canvas.height !== h){
    canvas.width = w;
    canvas.height = h;
    ctx.setTransform(dpr,0,0,dpr,0,0); // keep drawing in CSS pixels
  }
  return { cssW: rect.width, cssH: rect.height, dpr };
}

