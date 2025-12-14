import { clamp, rad, clearCanvas, niceScale } from "./utils.js";

function rotateX(p, a){
  const s = Math.sin(a), c = Math.cos(a);
  return { x: p.x, y: p.y*c - p.z*s, z: p.y*s + p.z*c };
}
function rotateY(p, a){
  const s = Math.sin(a), c = Math.cos(a);
  return { x: p.x*c + p.z*s, y: p.y, z: -p.x*s + p.z*c };
}
function project(p, w, h, fov=400){
  // simple perspective projection
  const z = p.z + 3; // shift forward
  const scale = fov / (fov + z*120);
  return { x: w/2 + p.x*scale, y: h/2 + p.y*scale };
}

export function createCubeController(canvas){
  const state = {
    rotX: 0,
    rotY: 0,
    dragging: false,
    lastX: 0,
    lastY: 0
  };

  const MAX_DEG = 15;

  canvas.addEventListener("pointerdown", (e) => {
    state.dragging = true;
    state.lastX = e.clientX;
    state.lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!state.dragging) return;
    const dx = e.clientX - state.lastX;
    const dy = e.clientY - state.lastY;
    state.lastX = e.clientX;
    state.lastY = e.clientY;

    // small rotation from mouse movement
    state.rotY += dx * 0.08;
    state.rotX += dy * 0.08;

    state.rotX = clamp(state.rotX, -MAX_DEG, MAX_DEG);
    state.rotY = clamp(state.rotY, -MAX_DEG, MAX_DEG);
  });

  canvas.addEventListener("pointerup", (e) => {
    state.dragging = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch {}
  });

  return state;
}

export function draw3D(canvas, concept, dims, controllerState){
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  clearCanvas(ctx, w, h);

  // background
  ctx.save();
  ctx.fillStyle = "rgba(8,10,14,0.55)";
  ctx.fillRect(0,0,w,h);
  ctx.restore();

  const a = dims.a ?? 6;
  const size = niceScale(a, 1.0, 1.8); // affects cube size
  const half = 1.1 * size;

  const rx = rad(controllerState?.rotX ?? 0);
  const ry = rad(controllerState?.rotY ?? 0);

  const verts = [
    {x:-half,y:-half,z:-half},
    {x: half,y:-half,z:-half},
    {x: half,y: half,z:-half},
    {x:-half,y: half,z:-half},
    {x:-half,y:-half,z: half},
    {x: half,y:-half,z: half},
    {x: half,y: half,z: half},
    {x:-half,y: half,z: half},
  ].map(p => rotateY(rotateX(p, rx), ry));

  const faces = [
    [0,1,2,3], // back
    [4,5,6,7], // front
    [0,1,5,4], // top
    [2,3,7,6], // bottom
    [1,2,6,5], // right
    [0,3,7,4], // left
  ];

  // sort faces by average z (painter's algorithm)
  const faceData = faces.map(idx => {
    const avgZ = idx.reduce((s,i)=>s+verts[i].z,0)/idx.length;
    return { idx, avgZ };
  }).sort((a,b)=>a.avgZ-b.avgZ);

  const pts2 = verts.map(p => project(p, w, h));

  const isCubeRelevant = true;
  const isPovrch = concept === "povrch";
  const isObjem = concept === "objem";

  // draw filled faces when objem (transparent volume look)
  if (isObjem && isCubeRelevant){
    ctx.save();
    ctx.fillStyle = "rgba(110,168,255,0.18)";
    ctx.strokeStyle = "rgba(232,236,243,0.30)";
    ctx.lineWidth = 1;
    for (const f of faceData){
      ctx.beginPath();
      const [a,b,c,d] = f.idx;
      ctx.moveTo(pts2[a].x, pts2[a].y);
      ctx.lineTo(pts2[b].x, pts2[b].y);
      ctx.lineTo(pts2[c].x, pts2[c].y);
      ctx.lineTo(pts2[d].x, pts2[d].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // draw edges (povrch emphasis uses thicker edges)
  ctx.save();
  ctx.strokeStyle = "rgba(232,236,243,0.85)";
  ctx.lineWidth = isPovrch ? 4 : 2;

  const edges = [
    [0,1],[1,2],[2,3],[3,0],
    [4,5],[5,6],[6,7],[7,4],
    [0,4],[1,5],[2,6],[3,7]
  ];

  ctx.beginPath();
  for (const [i,j] of edges){
    ctx.moveTo(pts2[i].x, pts2[i].y);
    ctx.lineTo(pts2[j].x, pts2[j].y);
  }
  ctx.stroke();
  ctx.restore();

  // labels
  ctx.save();
  ctx.fillStyle = "rgba(232,236,243,0.8)";
  ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  const label = isPovrch ? "Povrch = plochy stěn (obal)" : (isObjem ? "Objem = prostor uvnitř" : "Vyber pojem pro krychli");
  ctx.fillText(label, 14, 22);
  ctx.fillStyle = "rgba(167,176,195,0.9)";
  ctx.fillText("Otáčení myší: max ±15°", 14, 40);
  ctx.restore();
}
