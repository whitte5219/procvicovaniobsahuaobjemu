const conceptSelect = document.getElementById("concept");
const shapeSelect = document.getElementById("shape");
const inputsDiv = document.getElementById("inputs");
const formulaDiv = document.getElementById("formula");
const resultDiv = document.getElementById("result");
const meaningDiv = document.getElementById("meaning");

const canvas2d = document.getElementById("canvas2d");
const ctx2d = canvas2d.getContext("2d");

const canvas3d = document.getElementById("canvas3d");
const ctx3d = canvas3d.getContext("2d");

const CONCEPTS = ["obvod", "obsah", "povrch", "objem"];
const values = {};

// init selects
CONCEPTS.forEach(c => {
  const o = document.createElement("option");
  o.value = c;
  o.textContent = c;
  conceptSelect.appendChild(o);
});

for (const key in SHAPES) {
  const o = document.createElement("option");
  o.value = key;
  o.textContent = SHAPES[key].name;
  shapeSelect.appendChild(o);
}

function updateInputs() {
  inputsDiv.innerHTML = "";
  const shape = SHAPES[shapeSelect.value];
  shape.dims.forEach(d => {
    values[d] = 5;
    const input = document.createElement("input");
    input.type = "number";
    input.value = 5;
    input.oninput = () => {
      values[d] = Number(input.value);
      render();
    };
    inputsDiv.append(d + ": ", input, document.createElement("br"));
  });
}

function draw2D() {
  ctx2d.clearRect(0,0,500,300);
  ctx2d.strokeStyle = "#0066cc";
  ctx2d.lineWidth = 3;
  ctx2d.fillStyle = "rgba(0,102,204,0.2)";

  const shape = shapeSelect.value;

  if (shape === "square") {
    ctx2d.fillRect(150,80,200,200);
    ctx2d.strokeRect(150,80,200,200);
  }

  if (shape === "circle") {
    ctx2d.beginPath();
    ctx2d.arc(250,150,80,0,Math.PI*2);
    ctx2d.fill();
    ctx2d.stroke();
  }

  if (shape === "triangle") {
    ctx2d.beginPath();
    ctx2d.moveTo(150,250);
    ctx2d.lineTo(350,250);
    ctx2d.lineTo(150,80);
    ctx2d.closePath();
    ctx2d.fill();
    ctx2d.stroke();
  }
}

function draw3D() {
  ctx3d.clearRect(0,0,500,300);
  if (shapeSelect.value !== "cube") return;

  ctx3d.strokeStyle = "#0066cc";
  ctx3d.lineWidth = 2;

  ctx3d.strokeRect(180,100,120,120);
  ctx3d.strokeRect(220,70,120,120);

  ctx3d.beginPath();
  ctx3d.moveTo(180,100); ctx3d.lineTo(220,70);
  ctx3d.moveTo(300,100); ctx3d.lineTo(340,70);
  ctx3d.moveTo(180,220); ctx3d.lineTo(220,190);
  ctx3d.moveTo(300,220); ctx3d.lineTo(340,190);
  ctx3d.stroke();
}

function render() {
  const shape = SHAPES[shapeSelect.value];
  const concept = conceptSelect.value;

  meaningDiv.textContent = MEANINGS[concept] || "";
  const f = shape.formulas[concept];

  if (!f) {
    formulaDiv.textContent = "—";
    resultDiv.textContent = "—";
  } else {
    formulaDiv.textContent = f.text;
    resultDiv.textContent = f.calc(values).toFixed(2);
  }

  draw2D();
  draw3D();
}

shapeSelect.onchange = () => {
  updateInputs();
  render();
};
conceptSelect.onchange = render;

updateInputs();
render();
