// dev tool: render the cat sprite grids as text to eyeball the art
const W = 30;
const H = 20;

const SHAPE = [
  ".....................F....F...",
  "....................FFF..FFF..",
  "....................FFFFFFFF..",
  "..FF...............FFFFFFFFF..",
  ".FFF...............FFFFFFFFFF.",
  ".FFF...............FFFFFFFFFF.",
  ".FFF...............FFFFFFFFFF.",
  ".FFF......FFFFFFFFFFFFFFFFFFF.",
  "..FFF....FFFFFFFFFFFFFFFFFFFF.",
  "...FFF..FFFFFFFFFFFFFFFFFFFF..",
  "....FFFFFFFFFFFFFFFFFFFFFFF...",
  "....FFFFFFFFFFFFFFFFFFFFFF....",
  "....FFFFFFFFLLLLLLFFFFFF......",
  "....FFFFFFFLLLLLLLLFFFFF......",
  "....FFFFFFFLLLLLLLLFFFFF......",
  "..............................",
  "..............................",
  "..............................",
  "..............................",
  "..............................",
];

// legs: [xStart, width] per leg, rows 15..19
const LEGS_A = [
  [5, 3],
  [10, 3],
  [17, 3],
  [22, 3],
];
const LEGS_B = [
  [6, 3],
  [9, 3],
  [18, 3],
  [21, 3],
];

function compose(legs) {
  const g = SHAPE.map((r) => r.split(""));
  for (const [x0, w] of legs) {
    for (let y = 15; y < H; y++) {
      for (let x = x0; x < x0 + w; x++) g[y][x] = "F";
    }
  }
  // outline pass
  const isFill = (x, y) =>
    x >= 0 && x < W && y >= 0 && y < H && g[y][x] !== ".";
  const edges = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (g[y][x] === ".") continue;
      if (!isFill(x - 1, y) || !isFill(x + 1, y) || !isFill(x, y - 1) || !isFill(x, y + 1)) {
        edges.push([x, y]);
      }
    }
  }
  for (const [x, y] of edges) g[y][x] = "K";
  // overlays
  const set = (x, y, v) => {
    if (g[y][x] !== ".") g[y][x] = v;
  };
  // inner ears
  set(21, 1, "L");
  set(26, 1, "L");
  // eye 2x2
  set(25, 5, "E");
  set(26, 5, "E");
  set(25, 6, "E");
  set(26, 6, "E");
  // muzzle
  for (let x = 24; x <= 27; x++) {
    set(x, 8, "L");
    set(x, 9, "L");
  }
  // collar
  for (let x = 19; x <= 23; x++) set(x, 10, "C");
  return g.map((r) => r.join(""));
}

for (const [name, legs] of [
  ["FRAME A", LEGS_A],
  ["FRAME B", LEGS_B],
]) {
  console.log(`\n${name}`);
  for (const row of compose(legs)) console.log(row.replace(/\./g, " "));
}
