# mapcidade-georef-tool

> Anonymized, from-scratch reconstruction of a real internal tool's architecture, built for a portfolio. Fictional data only (a fake parcel, fake coordinates) — no real client image, city, or coordinate system is represented here.

## English

### Problem

A scanned or exported map image (a PNG) needs to be placed correctly on a map, at the right geographic location and scale. The georeferencing information already exists — a companion "world file" gives the pixel-to-map-coordinate transform — but turning that into the SQL a spatial database actually needs (a `geometry` column set via `ST_MakeEnvelope`) is a manual, error-prone step done image by image.

### Solution

A CLI (and an equivalent small web form) reads the image's pixel dimensions straight from its PNG header, reads the world file's affine transform, computes the geographic bounding box those two together describe, and prints the ready-to-review `UPDATE ... SET geom = ST_MakeEnvelope(...)` statement. It never opens a database connection — this is a read-only, print-only tool by design; review-before-running is the safety mechanism.

### Stack

TypeScript, Node.js, Express 5, `vitest`, `supertest`.

### How to run

```bash
npm install
npm run demo   # reads fixtures/parcel-42.png + .wld, writes out/parcel-42.sql

# or drive it directly:
npm run cli -- --image path.png --worldfile path.wld --table my_table --layer-id 7

# or the web form:
npm run dev
# open http://localhost:3002
```

### Demo

See `npm run demo` above — a recorded GIF will be linked here.

### What I learned / engineering decisions

Reading PNG dimensions doesn't need an image-decoding library at all — the width and height live in plain sight in the first 24 bytes of the file (the PNG signature plus the `IHDR` chunk), so `readPngDimensions()` is a handful of buffer reads with zero dependencies. It's a good example of matching the tool to what the job actually needs: this tool never touches pixel data, only the file's own declared dimensions.

The envelope math deliberately ignores world-file rotation (it's kept at 0 in the overwhelming majority of real scanned/exported world files) and says so in a comment rather than silently producing a wrong-but-plausible-looking rectangle for a rotated image — a correctly-shaped wrong answer is worse than a clear "this case isn't handled."

## Português

### Problema

Uma imagem de mapa escaneada ou exportada (um PNG) precisa ser posicionada corretamente no mapa, no lugar geográfico e na escala certos. A informação de georreferenciamento já existe — um "world file" companheiro dá a transformação de pixel pra coordenada de mapa — mas transformar isso no SQL que o banco espacial realmente precisa (uma coluna `geometry` definida via `ST_MakeEnvelope`) é um passo manual e sujeito a erro, feito imagem por imagem.

### Solução

Um CLI (e um formulário web pequeno equivalente) lê as dimensões em pixel da imagem direto do cabeçalho do PNG, lê a transformação afim do world file, calcula a caixa delimitadora geográfica que os dois juntos descrevem, e imprime o comando `UPDATE ... SET geom = ST_MakeEnvelope(...)` pronto pra revisão. Nunca abre conexão com banco — é uma ferramenta somente leitura, só de impressão, por design; revisar antes de rodar é o mecanismo de segurança.

### Stack

TypeScript, Node.js, Express 5, `vitest`, `supertest`.

### Como rodar

```bash
npm install
npm run demo   # lê fixtures/parcel-42.png + .wld, escreve out/parcel-42.sql

# ou direto:
npm run cli -- --image caminho.png --worldfile caminho.wld --table minha_tabela --layer-id 7

# ou o formulário web:
npm run dev
# abrir http://localhost:3002
```

### Demo

Ver `npm run demo` acima — um GIF gravado será linkado aqui.

### O que aprendi / decisões de engenharia

Ler as dimensões do PNG não precisa de biblioteca de decodificação de imagem nenhuma — largura e altura estão à vista nos primeiros 24 bytes do arquivo (a assinatura do PNG mais o chunk `IHDR`), então `readPngDimensions()` é um punhado de leituras de buffer sem dependência nenhuma. É um bom exemplo de ajustar a ferramenta ao que o trabalho realmente precisa: essa ferramenta nunca toca no dado de pixel, só nas dimensões que o próprio arquivo declara.

O cálculo do envelope ignora de propósito a rotação do world file (fica em 0 na esmagadora maioria dos world files reais escaneados/exportados) e diz isso num comentário em vez de silenciosamente gerar um retângulo errado mas de aparência plausível pra uma imagem rotacionada — uma resposta errada com formato correto é pior que um "esse caso não é tratado" claro.

## License

MIT
