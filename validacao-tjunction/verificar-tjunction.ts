import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validatePolygon } from './.tmp-relief-exposed';
import { createEuropeRelief } from './relief';
import { parseLandGeoJSON, projectLandFeature } from '../../geo/src/index';

const FLOOR = 0.004;
const A = { x: 0, y: 0 };
const B = { x: 4, y: 0 };
const C = { x: 0, y: 4 };

function makeBuilt(mx: number, my: number, withMidpoint: boolean): any {
  const verts = [A, B, C, { x: mx, y: my }];
  return {
    verts,
    triangles: [{ a: 0, b: 1, c: 2, polygon: 0 }],
    localIndices: [0, 1, 2],
    coastalVertices: [true, true, true, false],
    splitEdges: new Set<string>(),
    midpointIndices: withMidpoint ? [3] : [],
    coastSegments: [],
    rings: { contour: [A, B, C], holes: [] },
    heights: [FLOOR, FLOOR, FLOOR, FLOOR],
  };
}

/** Reproduz a expressão antiga (va/vb fixos) apenas para comparação. */
function oldGeometricCount(mx: number, my: number): number {
  const cross = (B.x - A.x) * (my - A.y) - (B.y - A.y) * (mx - A.x);
  if (Math.abs(cross) > 1e-8) return 0;
  const dot = (mx - A.x) * (B.x - A.x) + (my - A.y) * (B.y - A.y);
  const len = (B.x - A.x) ** 2 + (B.y - A.y) ** 2;
  return len > 0 && dot > 1e-10 && dot < len - 1e-10 ? 1 : 0;
}

const cases: Array<{
  nome: string;
  mx: number;
  my: number;
  comMidpoint: boolean;
  esperado: number;
}> = [
  { nome: 'sem ponto medio espurio', mx: 9, my: 9, comMidpoint: false, esperado: 0 },
  { nome: 'interior de a-b', mx: 2, my: 0, comMidpoint: true, esperado: 1 },
  { nome: 'interior de b-c', mx: 2, my: 2, comMidpoint: true, esperado: 1 },
  { nome: 'interior de c-a', mx: 0, my: 2, comMidpoint: true, esperado: 1 },
  { nome: 'reta de a-b, fora do segmento', mx: 6, my: 0, comMidpoint: true, esperado: 0 },
  { nome: 'fora da reta', mx: 2, my: 1, comMidpoint: true, esperado: 0 },
];

console.log('=== VERIFICACAO 1: tres arestas, sintetico ===');
console.log('caso | antigo(va/vb) | corrigido(u/v) | esperado | status');
let falhas = 0;
for (const item of cases) {
  const r = validatePolygon(makeBuilt(item.mx, item.my, item.comMidpoint), FLOOR);
  const antigo = item.comMidpoint ? oldGeometricCount(item.mx, item.my) : 0;
  const ok = r.tJunctions === item.esperado;
  if (!ok) falhas += 1;
  const outras =
    r.oceanTriangles + r.holeTriangles + r.nonFiniteVertices +
    r.invalidIndices + r.degenerateTriangles + r.weakCoastalVertices;
  if (outras !== 0) {
    falhas += 1;
    console.log(`  AVISO: outras categorias nao zeradas em ${item.nome}: ${outras}`);
  }
  console.log(
    `${item.nome} | ${antigo} | ${r.tJunctions} | ${item.esperado} | ${ok ? 'OK' : 'FALHA'}`,
  );
}

console.log('');
console.log('=== VERIFICACAO 2: dados reais Natural Earth 110m ===');
const raw = JSON.parse(
  readFileSync(
    '/home/vsalles/Projects/mapaunderground/apps/web/public/data/land-110m.geojson',
    'utf8',
  ),
);
const polygons = parseLandGeoJSON(raw).flatMap(projectLandFeature);
const region = { minX: -4, maxX: 16, minZ: -24, maxZ: -11.5 } as const;

const hashes: string[] = [];
for (let run = 1; run <= 2; run += 1) {
  const relief = createEuropeRelief(polygons, { region, validate: true });
  const position = relief.mesh.geometry.getAttribute('position').array as ArrayLike<number>;
  const hash = createHash('sha256')
    .update(Buffer.from(new Float32Array(position).buffer))
    .digest('hex')
    .slice(0, 16);
  hashes.push(hash);
  console.log(`execucao ${run}: ${JSON.stringify(relief.stats)} hash=${hash}`);
  relief.dispose();
}
const determinico = hashes[0] === hashes[1];
console.log(`deterministico: ${determinico}`);
if (!determinico) falhas += 1;

console.log('');
console.log(`RESULTADO: ${falhas === 0 ? 'TODAS AS VERIFICACOES PASSARAM' : falhas + ' FALHA(S)'}`);
if (falhas > 0) process.exitCode = 1;
