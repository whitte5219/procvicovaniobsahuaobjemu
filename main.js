// ---------------- Tabs ----------------
const tabCalc = document.getElementById("tabCalc");
const tabHelp = document.getElementById("tabHelp");
const pageCalc = document.getElementById("calc");
const pageHelp = document.getElementById("help");

function show(which){
  const isCalc = which === "calc";
  pageCalc.classList.toggle("hidden", !isCalc);
  pageHelp.classList.toggle("hidden", isCalc);
  tabCalc.classList.toggle("active", isCalc);
  tabHelp.classList.toggle("active", !isCalc);
}
tabCalc.onclick = () => show("calc");
tabHelp.onclick = () => show("help");

// ---------------- Calculator UI ----------------
const conceptSelect = document.getElementById("calcConcept");
const shapeSelect = document.getElementById("calcShape");
const inputsDiv = document.getElementById("calcInputs");
const formulaSpan = document.getElementById("calcFormula");
const resultSpan = document.getElementById("calcResult");

const canvas = document.getElementById("calcCanvas");
const ctx = canvas.getContext("2d");

// ---------------- Data ----------------
const CONCEPTS = [
  { key:"obvod",  label:"obvod"  },
  { key:"obsah",  label:"obsah"  },
  { key:"povrch", label:"povrch" },
  { key:"objem",  label:"objem"  }
];

// FULL text formulas (no o/S/V shortcuts in calculator)
const SHAPES = {
  square: {
    name: "Čtverec",
    dims: ["a"],
    allowed: ["obvod","obsah"],
    formula: {
      obvod: d => ["obvod = 4 · a", 4*d.a],
      obsah: d => ["obsah = a²", d.a*d.a]
    },
    draw: (d) => drawSquare(d.a)
  },

  rectangle: {
    name: "Obdélník",
    dims: ["a","b"],
    allowed: ["obvod","obsah"],
    formula: {
      obvod: d => ["obvod = 2 · (a + b)", 2*(d.a + d.b)],
      obsah: d => ["obsah = a · b", d.a*d.b]
    },
    draw: (d) => drawRectangle(d.a, d.b)
  },

  circle: {
    name: "Kruh",
    dims: ["r"],
    allowed: ["obvod","obsah"],
    formula: {
      obvod: d => ["obvod = 2 · π · r", 2*Math.PI*d.r],
      obsah: d => ["obsah = π · r²", Math.PI*d.r*d.r]
    },
    draw: (d) => drawCircle(d.r)
  },

  rightTriangle: {
    name: "Trojúhelník (pravouhlý)",
    dims: ["a","b"],
    allowed: ["obvod","obsah"],
    formula: {
      obsah: d => ["obsah = (a · b) / 2", (d.a*d.b)/2],
      obvod: d => {
        const c = Math.sqrt(d.a*d.a + d.b*d.b);
        return ["obvod = a + b + c, kde c = √(a² + b²)", d.a + d.b + c];
      }
    },
    draw: (d) => drawRightTriangle(d.a, d.b)
  },

  triangle: {
    name: "Trojúhelník (nepravouhlý)",
    dims: ["a","va","b","c"],
    allowed: ["obvod","obsah"],
    formula: {
      obsah: d => ["obsah = (a · vₐ) / 2", (d.a*d.va)/2],
      obvod: d => ["obvod = a + b + c", d.a + d.b + d.c]
    },
    draw: (d) => drawNonRightTriangle(d.a, d.va)
  },

  cube: {
    name: "Krychle",
    dims: ["a"],
    allowed: ["povrch","objem"],
    formula: {
      povrch: d => ["povrch = 6 · a²", 6*d.a*d.a],
      objem:  d => ["objem = a³", d.a**3]
    },
    draw: (d) => drawCubeWireframe(d.a)
  },

  cuboid: {
    name: "Kvádr",
    dims: ["a","b","c"],
    allowed: ["povrch","objem"],
    formula: {
      povrch: d => ["povrch = 2 · (a·b + a·c + b·c)", 2*(d.a*d.b + d.a*d.c + d.b*d.c)],
      objem:  d => ["objem = a · b · c", d.a*d.b*d.c]
    },
    draw: (d) => drawCuboidWireframe(d.a, d.b, d.c)
  }
};

let values = {};

// ---------------- init selects ----------------
for (const c of CONCEPTS) conceptSelect.add(new Option(c.label, c.key));
for (const key in SHAPES) shapeSelect.add(new Option(SHAPES[key].name, key));

// defaults
shapeSelect.value = "square";
syncConceptOptions();
buildInputs();
render();

// ---------------- Logic gating ----------------
function syncConceptOptions(){
  const shape = SHAPES[shapeSelect.value];
  const allowed = shape.allowed;

  const current = conceptSelect.value;
  conceptSelect.innerHTML = "";

  for (const c of CONCEPTS){
    if (allowed.includes(c.key)) conceptSelect.add(new Option(c.label, c.key));
  }

  conceptSelect.value = allowed.includes(current) ? current : allowed[0];
}

function buildInputs(){
  inputsDiv.innerHTML = "";
  values = {};
  const shape = SHAPES[shapeSelect.value];

  for (const dim of shape.dims){
    const wrap = document.createElement("div");
    const label = document.createElement("label");
    label.textContent = dim + ":";
    const input = document.createElement("input");
    input.type = "number";
    input.step = "0.1";
    input.value = defaultValue(dim);
    values[dim] = Number(input.value);

    input.oninput = () => {
      values[dim] = Number(input.value);
      render();
    };

    wrap.appendChild(label);
    wrap.appendChild(input);
    inputsDiv.appendChild(wrap);
  }
}

function defaultValue(dim){
  if (dim === "r") return 4;
  if (dim === "va") return 3;
  if (dim === "c") return 6;
  return 5;
}

// ---------------- Events ----------------
shapeSelect.onchange = () => { syncConceptOptions(); buildInputs(); render(); };
conceptSelect.onchange = render;

// ---------------- Render ----------------
function render(){
  const shape = SHAPES[shapeSelect.value];
  const concept = conceptSelect.value;
  const f = shape.formula[concept];

  if (!f){
    formulaSpan.textContent = "—";
    resultSpan.textContent = "—";
  } else {
    const [txt, val] = f(values);
    formulaSpan.textContent = txt;
    resultSpan.textContent = isFinite(val) ? val.toFixed(2) : "—";
  }

  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeRect(1,1,canvas.width-2,canvas.height-2);

  shape.draw(values);
}

// ---------------- Drawing helpers ----------------
function center(){ return { cx: canvas.width/2, cy: canvas.height/2 }; }
function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

function labelText(text, x, y){
  ctx.save();
  ctx.fillStyle = "black";
  ctx.font = "18px Arial";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function dimLine(x1,y1,x2,y2,text, vertical=false){
  ctx.save();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();

  // ticks
  const tick = 6;
  ctx.beginPath();
  if (vertical){
    ctx.moveTo(x1 - tick, y1); ctx.lineTo(x1 + tick, y1);
    ctx.moveTo(x2 - tick, y2); ctx.lineTo(x2 + tick, y2);
  } else {
    ctx.moveTo(x1, y1 - tick); ctx.lineTo(x1, y1 + tick);
    ctx.moveTo(x2, y2 - tick); ctx.lineTo(x2, y2 + tick);
  }
  ctx.stroke();

  labelText(text, (x1+x2)/2 + 8, (y1+y2)/2 - 8);
  ctx.restore();
}

// ---------------- 2D drawings + labels ----------------
function drawSquare(a){
  const {cx, cy} = center();
  const s = clamp(20 + a*6, 60, 260); // gentler scaling for big numbers
  const x = cx - s/2;
  const y = cy - s/2;

  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, s, s);

  // LEFT label: a
  dimLine(x - 40, y, x - 40, y + s, `a = ${a}`, true);
}

function drawRectangle(a,b){
  const {cx, cy} = center();
  const w = clamp(30 + a*6, 80, 420);
  const h = clamp(30 + b*6, 70, 300);
  const x = cx - w/2;
  const y = cy - h/2;

  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);

  // bottom a, left b
  dimLine(x, y + h + 35, x + w, y + h + 35, `a = ${a}`, false);
  dimLine(x - 40, y, x - 40, y + h, `b = ${b}`, true);
}

function drawCircle(r){
  const {cx, cy} = center();
  const rad = clamp(20 + r*6, 40, 190);

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, rad, 0, Math.PI*2);
  ctx.stroke();

  // radius line + label
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + rad, cy);
  ctx.stroke();

  labelText(`r = ${r}`, cx + rad + 15, cy + 6);
}

function drawRightTriangle(a,b){
  const {cx, cy} = center();
  const w = clamp(30 + a*6, 90, 420);
  const h = clamp(30 + b*6, 90, 300);

  const x0 = cx - w/2;
  const y0 = cy + h/2;

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x0 + w, y0);
  ctx.lineTo(x0, y0 - h);
  ctx.closePath();
  ctx.stroke();

  dimLine(x0, y0 + 35, x0 + w, y0 + 35, `a = ${a}`, false);
  dimLine(x0 - 40, y0 - h, x0 - 40, y0, `b = ${b}`, true);
}

function drawNonRightTriangle(a, va){
  const {cx, cy} = center();
  const base = clamp(30 + a*6, 110, 460);
  const h = clamp(30 + va*6, 90, 320);

  const x1 = cx - base/2, y1 = cy + h/2;
  const x2 = cx + base/2, y2 = cy + h/2;
  const x3 = cx - base/6, y3 = cy - h/2;

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.lineTo(x3,y3);
  ctx.closePath();
  ctx.stroke();

  dimLine(x1, y1 + 35, x2, y2 + 35, `a = ${a}`, false);

  ctx.beginPath();
  ctx.moveTo(x3, y3);
  ctx.lineTo(x3, y1);
  ctx.stroke();
  labelText(`vₐ = ${va}`, x3 + 12, (y3 + y1)/2);
}

// ---------------- 3D wireframe + labels ----------------
function drawCubeWireframe(a){
  const {cx, cy} = center();
  const s = clamp(30 + a*6, 110, 280);

  const frontX = cx - s/2;
  const frontY = cy - s/2 + 35;
  const dx = s*0.35;
  const dy = s*0.25;

  ctx.lineWidth = 3;

  ctx.strokeRect(frontX, frontY, s, s);

  ctx.beginPath();
  ctx.moveTo(frontX, frontY);
  ctx.lineTo(frontX + dx, frontY - dy);
  ctx.lineTo(frontX + dx + s, frontY - dy);
  ctx.lineTo(frontX + s, frontY);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(frontX + s, frontY);
  ctx.lineTo(frontX + dx + s, frontY - dy);
  ctx.lineTo(frontX + dx + s, frontY - dy + s);
  ctx.lineTo(frontX + s, frontY + s);
  ctx.closePath();
  ctx.stroke();

  dimLine(frontX - 45, frontY, frontX - 45, frontY + s, `a = ${a}`, true);
}

function drawCuboidWireframe(a,b,c){
  const {cx, cy} = center();
  const w = clamp(40 + a*6, 160, 520);
  const h = clamp(40 + b*6, 130, 360);
  const depth = clamp(20 + c*4, 50, 200);

  const frontX = cx - w/2;
  const frontY = cy - h/2 + 35;

  const dx = depth*0.6;
  const dy = depth*0.4;

  ctx.lineWidth = 3;

  ctx.strokeRect(frontX, frontY, w, h);

  ctx.beginPath();
  ctx.moveTo(frontX, frontY);
  ctx.lineTo(frontX + dx, frontY - dy);
  ctx.lineTo(frontX + dx + w, frontY - dy);
  ctx.lineTo(frontX + w, frontY);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(frontX + w, frontY);
  ctx.lineTo(frontX + dx + w, frontY - dy);
  ctx.lineTo(frontX + dx + w, frontY - dy + h);
  ctx.lineTo(frontX + w, frontY + h);
  ctx.closePath();
  ctx.stroke();

  dimLine(frontX, frontY + h + 35, frontX + w, frontY + h + 35, `a = ${a}`, false);
  dimLine(frontX - 45, frontY, frontX - 45, frontY + h, `b = ${b}`, true);
  labelText(`c = ${c}`, frontX + w + dx + 12, frontY - dy + 25);
}
