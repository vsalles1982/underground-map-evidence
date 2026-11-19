# Validação — Pendência técnica 1: validador de T-junction

Data: 2026-11-19 · Base: `8b74ffc` (`master`) · Autorização: exclusivamente a correção do validador em `packages/map-engine/src/relief.ts`.

## Correção

`validatePolygon` usava `va`/`vb` (vértices da primeira aresta do triângulo) no teste geométrico dentro do laço das três arestas. Agora cada aresta usa seus próprios extremos `eu = verts[u]` e `ev = verts[v]`. Nenhuma geometria de produção, aparência ou iluminação foi alterada.

## Verificação comportamental das três arestas

`verificar-tjunction.ts` constrói um triângulo sintético `A(0,0) — B(4,0) — C(0,4)` e injeta um ponto médio espúrio no interior de cada uma das arestas, comparando a expressão antiga com a corrigida:

| Caso | Antigo (`va`/`vb`) | Corrigido (`eu`/`ev`) | Esperado |
|---|---:|---:|---:|
| sem ponto médio espúrio | 0 | 0 | 0 |
| interior de `a-b` | 1 | 1 | 1 |
| interior de `b-c` | **0** | **1** | 1 |
| interior de `c-a` | **0** | **1** | 1 |
| na reta de `a-b`, fora do segmento | 0 | 0 | 0 |
| fora da reta | 0 | 0 | 0 |

Os dois casos em negrito demonstram a falha original e a correção.

Também foram executadas duas gerações com os 127 polígonos reais do Natural Earth 110m, com validação ativada: `tJunctions = 0` e todas as demais categorias em zero, hashes idênticos (determinismo preservado).

## Como reproduzir o harness

O teste acessa `validatePolygon`, que é interno ao módulo. Para não alterar a API de produção, o harness usa uma cópia temporária com a exportação acrescentada:

```sh
cd /home/vsalles/Projects/mapaunderground
cp packages/map-engine/src/relief.ts packages/map-engine/src/.tmp-relief-exposed.ts
printf '\nexport { validatePolygon };\n' >> packages/map-engine/src/.tmp-relief-exposed.ts
./node_modules/.pnpm/node_modules/.bin/esbuild \
  packages/map-engine/src/.tmp-verify-tjunction.ts \
  --bundle --platform=node --format=esm --outfile=/tmp/opencode/verify-tjunction.mjs
node /tmp/opencode/verify-tjunction.mjs
rm packages/map-engine/src/.tmp-relief-exposed.ts packages/map-engine/src/.tmp-verify-tjunction.ts
```

Os arquivos temporários foram removidos após a captura. `verificar-tjunction.ts` aqui é a cópia integral do harness executado.

## Resultados

- `verificacao.txt` — saída integral das duas verificações.
- `diff.txt` — diff da correção.
- `typecheck.log` — `pnpm typecheck`, exit 0 (3 pacotes).
- `build.log` — `pnpm build`, exit 0.

Logs `*.log` são ignorados pelo Git conforme `.gitignore` do repositório.

## Estado

Sem commit, push, reset, clean ou rebase. `terrain.ts` intacto. Conformidade entre polígonos, descarte no unmount e calibração visual **não** foram tratados — aguardam autorização específica.
