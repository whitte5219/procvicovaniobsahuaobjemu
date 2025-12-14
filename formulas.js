// Definitions include:
// - dims: required inputs
// - concepts: which concept applies
// - formulaText: string shown
// - compute: function returning numeric value
// - unit: "cm" base, but we show units generally

export const MEANINGS = {
  obvod: "Obvod = délka hranice kolem 2D útvaru (jak dlouhá je „čára kolem“). Jednotky: cm, m…",
  obsah: "Obsah = plocha uvnitř 2D útvaru (kolik místa zabírá uvnitř). Jednotky: cm², m²…",
  povrch: "Povrch = součet ploch všech stěn 3D tělesa (kolik materiálu je na „obal“). Jednotky: cm², m²…",
  objem: "Objem = prostor uvnitř 3D tělesa (kolik se dovnitř vejde). Jednotky: cm³, m³…"
};

export const SHAPES = {
  square: {
    label: "Čtverec",
    type: "2d",
    dims: [{ key:"a", label:"a", hint:"strana" }],
    concepts: ["obvod","obsah"],
    formulas: {
      obvod: { text: "o = 4a", unitPow: 1, compute: ({a}) => 4*a },
      obsah: { text: "S = a²", unitPow: 2, compute: ({a}) => a*a },
    }
  },
  rectangle: {
    label: "Obdélník",
    type: "2d",
    dims: [{ key:"a", label:"a", hint:"délka" }, { key:"b", label:"b", hint:"šířka" }],
    concepts: ["obvod","obsah"],
    formulas: {
      obvod: { text: "o = 2(a + b)", unitPow: 1, compute: ({a,b}) => 2*(a+b) },
      obsah: { text: "S = a · b", unitPow: 2, compute: ({a,b}) => a*b },
    }
  },
  circle: {
    label: "Kruh",
    type: "2d",
    dims: [{ key:"r", label:"r", hint:"poloměr" }],
    concepts: ["obvod","obsah"],
    formulas: {
      obvod: { text: "o = 2πr", unitPow: 1, compute: ({r}) => 2*Math.PI*r },
      obsah: { text: "S = πr²", unitPow: 2, compute: ({r}) => Math.PI*r*r },
    }
  },
  rightTriangle: {
    label: "Trojúhelník (pravouhlý)",
    type: "2d",
    dims: [{ key:"a", label:"a", hint:"odvěsna" }, { key:"b", label:"b", hint:"odvěsna" }],
    concepts: ["obvod","obsah"],
    formulas: {
      obsah: { text: "S = (a · b) / 2", unitPow: 2, compute: ({a,b}) => (a*b)/2 },
      obvod: {
        text: "o = a + b + c, kde c = √(a² + b²)",
        unitPow: 1,
        compute: ({a,b}) => a + b + Math.sqrt(a*a + b*b)
      },
    }
  },
  triangle: {
    label: "Trojúhelník (nepravouhlý)",
    type: "2d",
    // To make it clear & not too hard:
    // area by base a and height va; perimeter by sides a,b,c.
    dims: [
      { key:"a", label:"a", hint:"strana (základna)" },
      { key:"va", label:"vₐ", hint:"výška na stranu a" },
      { key:"b", label:"b", hint:"strana" },
      { key:"c", label:"c", hint:"strana" },
    ],
    concepts: ["obvod","obsah"],
    formulas: {
      obsah: { text: "S = (a · vₐ) / 2", unitPow: 2, compute: ({a,va}) => (a*va)/2 },
      obvod: { text: "o = a + b + c", unitPow: 1, compute: ({a,b,c}) => a + b + c },
    }
  },
  cube: {
    label: "Krychle",
    type: "3d",
    dims: [{ key:"a", label:"a", hint:"hrana" }],
    concepts: ["povrch","objem"],
    formulas: {
      povrch: { text: "S = 6a²", unitPow: 2, compute: ({a}) => 6*a*a },
      objem: { text: "V = a³", unitPow: 3, compute: ({a}) => a*a*a },
    }
  }
};

// defaults used in inputs
export const DEFAULTS = {
  a: 6,
  b: 4,
  c: 5,
  r: 4,
  va: 3
};

export function unitForPow(pow){
  if (pow === 1) return " (jednotky délky)";
  if (pow === 2) return " (jednotky²)";
  if (pow === 3) return " (jednotky³)";
  return "";
}

