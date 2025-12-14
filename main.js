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

shapeSelect.value = "cube";
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

  // stronger default style so 3D never looks “gone”
  ctx.strokeStyle = "black";
  ctx.fillStyle = "white";
  ctx.lineWidth = 3;

  shape.draw(values);
}

// ---------------- helpers ----------------
function center(){ return { cx: canvas.width/2, cy: canvas.height/2 }; }
function clamp(n,a,b){ return Math.max(a, Math.min(b, n)); }

function labelText(text, x, y, align="left", baseline="alphabetic"){
  ctx.save();
  ctx.fillStyle = "black";
  ctx.font = "18px Arial";
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// dimension line like your example: thin line + end caps + centered text
function dimLineHorizontal(x1, y, x2, text){
  ctx.save();
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();

  const cap = 8;
  ctx.beginPath();
  ctx.moveTo(x1, y-cap);
  ctx.lineTo(x1, y+cap);
  ctx.moveTo(x2, y-cap);
  ctx.lineTo(x2, y+cap);
  ctx.stroke();

  labelText(text, (x1+x2)/2, y-10, "center", "alphabetic");
  ctx.restore();
}

function dimLineVertical(x, y1, y2, text){
  ctx.save();
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x, y1);
  ctx.lineTo(x, y2);
  ctx.stroke();

  const cap = 8;
  ctx.beginPath();
  ctx.moveTo(x-cap, y1);
  ctx.lineTo(x+cap, y1);
  ctx.moveTo(x-cap, y2);
  ctx.lineTo(x+cap, y2);
  ctx.stroke();

  // center text next to line
  labelText(text, x+12, (y1+y2)/2, "left", "middle");
  ctx.restore();
}

// ---------------- 2D drawings ----------------
function drawSquare(a){
  const {cx, cy} = center();
  const s = clamp(40 + a*4, 80, 260);

  const x = cx - s/2;
  const y = cy - s/2;

  ctx.strokeRect(x, y, s, s);

  // left: a
  dimLineVertical(x - 70, y, y + s, `a = ${a}`);
  // bottom: a (centered)
  dimLineHorizontal(x, y + s + 45, x + s, `a = ${a}`);
}

function drawRectangle(a,b){
  const {cx, cy} = center();
  const w = clamp(60 + a*4, 120, 460);
  const h = clamp(50 + b*4, 100, 320);

  const x = cx - w/2;
  const y = cy - h/2;

  ctx.strokeRect(x, y, w, h);

  dimLineVertical(x - 70, y, y + h, `b = ${b}`);
  dimLineHorizontal(x, y + h + 45, x + w, `a = ${a}`);
}

function drawCircle(r){
  const {cx, cy} = center();
  const rad = clamp(40 + r*4, 60, 190);

  ctx.beginPath();
  ctx.arc(cx, cy, rad, 0, Math.PI*2);
  ctx.stroke();

  // radius + label
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + rad, cy);
  ctx.stroke();

  labelText(`r = ${r}`, cx + rad + 20, cy, "left", "middle");
}

function drawRightTriangle(a,b){
  const {cx, cy} = center();
  const w = clamp(70 + a*4, 140, 460);
  const h = clamp(70 + b*4, 140, 320);

  const x0 = cx - w/2;
  const y0 = cy + h/2;

  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x0 + w, y0);
  ctx.lineTo(x0, y0 - h);
  ctx.closePath();
  ctx.stroke();

  dimLineVertical(x0 - 70, y0 - h, y0, `b = ${b}`);
  dimLineHorizontal(x0, y0 + 45, x0 + w, `a = ${a}`);
}

function drawNonRightTriangle(a, va){
  const {cx, cy} = center();
  const base = clamp(90 + a*4, 160, 520);
  const h = clamp(80 + va*4, 140, 360);

  const x1 = cx - base/2, y1 = cy + h/2;
  const x2 = cx + base/2, y2 = cy + h/2;
  const x3 = cx - base/6, y3 = cy - h/2;

  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.lineTo(x3,y3);
  ctx.closePath();
  ctx.stroke();

  dimLineHorizontal(x1, y1 + 45, x2, `a = ${a}`);

  ctx.strokeStyle = "#666";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x3, y3);
  ctx.lineTo(x3, y1);
  ctx.stroke();

  labelText(`vₐ = ${va}`, x3 + 12, (y3+y1)/2, "left", "middle");

  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
}

// ---------------- 3D wireframe (kept big & visible) ----------------
function drawCubeWireframe(a){
  const {cx, cy} = center();
  const s = clamp(120 + a*2, 140, 280);

  const frontX = cx - s/2;
  const frontY = cy - s/2 + 30;

  const dx = s * 0.35;
  const dy = s * 0.25;

  // front
  ctx.strokeRect(frontX, frontY, s, s);

  // top
  ctx.beginPath();
  ctx.moveTo(frontX, frontY);
  ctx.lineTo(frontX + dx, frontY - dy);
  ctx.lineTo(frontX + dx + s, frontY - dy);
  ctx.lineTo(frontX + s, frontY);
  ctx.closePath();
  ctx.stroke();

  // right
  ctx.beginPath();
  ctx.moveTo(frontX + s, frontY);
  ctx.lineTo(frontX + dx + s, frontY - dy);
  ctx.lineTo(frontX + dx + s, frontY - dy + s);
  ctx.lineTo(frontX + s, frontY + s);
  ctx.closePath();
  ctx.stroke();

  // show a on left + bottom
  dimLineVertical(frontX - 70, frontY, frontY + s, `a = ${a}`);
  dimLineHorizontal(frontX, frontY + s + 45, frontX + s, `a = ${a}`);
}

function drawCuboidWireframe(a,b,c){
  const {cx, cy} = center();
  const w = clamp(180 + a*2, 220, 520);
  const h = clamp(150 + b*2, 180, 380);
  const depth = clamp(70 + c*1.5, 90, 220);

  const frontX = cx - w/2;
  const frontY = cy - h/2 + 30;

  const dx = depth*0.6;
  const dy = depth*0.4;

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

  dimLineVertical(frontX - 70, frontY, frontY + h, `b = ${b}`);
  dimLineHorizontal(frontX, frontY + h + 45, frontX + w, `a = ${a}`);
  labelText(`c = ${c}`, frontX + w + dx + 18, frontY - dy + 20, "left", "middle");
}
