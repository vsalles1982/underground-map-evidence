# Evidências visuais — Suite Underground Map

Incremento 1: Terreno e relevo da Europa (2026-11-18).

Duas capturas no mesmo enquadramento (1280×800, Chromium headless + SwiftShader),
enviadas separadamente para revisão do Tech Lead.

| Arquivo | Finalidade | SHA-256 |
|---|---|---|
| `antes-cena-europa-decorada.png` | linha de base — commit `8b74ffc` | `589b488d6cc6c31b2477b8160ab919ec8f357ff2673083fbc48ae0bf02bfd328` |
| `cena-europa-relevo.png` | depois do relevo | `5e0864e1dee13cf489df8668284638ec2b77078090b73f1a538245b8e9c6335d` |

## Download direto

- https://raw.githubusercontent.com/vsalles1982/underground-map-evidence/main/antes-cena-europa-decorada.png
- https://raw.githubusercontent.com/vsalles1982/underground-map-evidence/main/cena-europa-relevo.png

## Verificação

```sh
sha256sum antes-cena-europa-decorada.png cena-europa-relevo.png
```

## Validação do corretor de T-junction (2026-11-19)

Harness e saída integral da verificação comportamental das três arestas do triângulo,
conforme solicitado pelo Tech Lead:

| Arquivo | SHA-256 |
|---|---|
| `validacao-tjunction/verificar-tjunction.ts` | `78c50c653a33a53f43066984e2aab208140c74df2bde9da103ffe37847d1a6a6` |
| `validacao-tjunction/verificacao.txt` | `20e63d6d192d3b391b25dd184cdc14c65ec391d5786c65f7d44ec7ca64e189f7` |

- https://raw.githubusercontent.com/vsalles1982/underground-map-evidence/main/validacao-tjunction/verificar-tjunction.ts
- https://raw.githubusercontent.com/vsalles1982/underground-map-evidence/main/validacao-tjunction/verificacao.txt

Repositório somente de evidências. Nenhum código de produção do projeto foi publicado aqui.
