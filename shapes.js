const MEANINGS = {
  obvod: "Obvod = délka čáry kolem útvaru",
  obsah: "Obsah = plocha uvnitř útvaru",
  povrch: "Povrch = plocha všech stěn tělesa",
  objem: "Objem = prostor uvnitř tělesa"
};

const SHAPES = {
  square: {
    name: "Čtverec",
    dims: ["a"],
    formulas: {
      obvod: {
        text: "o = 4a",
        calc: d => 4 * d.a
      },
      obsah: {
        text: "S = a²",
        calc: d => d.a * d.a
      }
    }
  },

  triangle: {
    name: "Pravouhlý trojúhelník",
    dims: ["a", "b"],
    formulas: {
      obsah: {
        text: "S = a · b / 2",
        calc: d => d.a * d.b / 2
      }
    }
  },

  circle: {
    name: "Kruh",
    dims: ["r"],
    formulas: {
      obvod: {
        text: "o = 2πr",
        calc: d => 2 * Math.PI * d.r
      },
      obsah: {
        text: "S = πr²",
        calc: d => Math.PI * d.r * d.r
      }
    }
  },

  cube: {
    name: "Krychle",
    dims: ["a"],
    formulas: {
      povrch: {
        text: "S = 6a²",
        calc: d => 6 * d.a * d.a
      },
      objem: {
        text: "V = a³",
        calc: d => d.a ** 3
      }
    }
  }
};
