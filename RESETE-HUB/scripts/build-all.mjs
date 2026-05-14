#!/usr/bin/env node
/*
 * Orquestador de build para el host unificado.
 *  1. Build de RESET-EDU (Vite) con base /edu/  →  ../RESET-EDU/dist
 *  2. Copia el output a public/edu/
 *  3. Copia mobile/ a public/binaural/ (sin sw.js ni manifest internos)
 *
 * Se ejecuta antes de `next build`.
 */
import { execSync } from 'node:child_process';
import { cpSync, rmSync, existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HUB = resolve(__dirname, '..');
const ROOT = resolve(HUB, '..');
const EDU = resolve(ROOT, 'RESET-EDU');
const MOBILE = resolve(ROOT, 'mobile');
const SRC = resolve(ROOT, 'src');           // ../src/binauralEngine + programs
const ASSETS = resolve(ROOT, 'assets');     // ../assets/audio/*.mp3
const PUB_EDU = resolve(HUB, 'public/edu');
const PUB_BIN = resolve(HUB, 'public/binaural');

function log(msg) {
  console.log(`[build-all] ${msg}`);
}

function run(cmd, cwd) {
  log(`$ ${cmd}  (cwd=${cwd})`);
  execSync(cmd, { stdio: 'inherit', cwd });
}

log('1/3  Building RESET-EDU (Vite)...');
if (!existsSync(resolve(EDU, 'node_modules'))) {
  run('npm install', EDU);
}
run('npm run build', EDU);

log('2/3  Copying RESET-EDU/dist -> public/edu/');
rmSync(PUB_EDU, { recursive: true, force: true });
mkdirSync(PUB_EDU, { recursive: true });
cpSync(resolve(EDU, 'dist'), PUB_EDU, { recursive: true });

log('3/3  Copying mobile -> public/binaural/');
rmSync(PUB_BIN, { recursive: true, force: true });
mkdirSync(PUB_BIN, { recursive: true });
const EXCLUDE = new Set(['node_modules', 'sw.js', 'manifest.webmanifest', '.DS_Store', 'build.mjs', 'README.md', 'docs', 'dist']);
cpSync(MOBILE, PUB_BIN, {
  recursive: true,
  filter: (src) => {
    const name = src.split('/').pop();
    return !EXCLUDE.has(name);
  },
});

// mobile/ importa ../src/*.js y ../assets/audio/*.mp3 (relativos a su carpeta).
// Co-localizamos esos archivos dentro de public/binaural/{src,assets} y
// reescribimos las rutas en HTML/JS/JSON de ../  -> ./
// Esto replica lo que mobile/build.mjs hace para deploys standalone.
log('     copying ../src and ../assets/audio into public/binaural/');
const PUB_BIN_SRC = join(PUB_BIN, 'src');
const PUB_BIN_AUDIO = join(PUB_BIN, 'assets/audio');
mkdirSync(PUB_BIN_SRC, { recursive: true });
mkdirSync(PUB_BIN_AUDIO, { recursive: true });

const NEEDED_SRC = ['binauralPrograms.js', 'binauralAudioEngine.js'];
for (const f of NEEDED_SRC) {
  const from = join(SRC, f);
  if (!existsSync(from)) {
    throw new Error(`Missing source file: ${from} (esperado en ${SRC})`);
  }
  cpSync(from, join(PUB_BIN_SRC, f));
}

const audioSrc = join(ASSETS, 'audio');
if (!existsSync(audioSrc)) {
  throw new Error(`Missing audio directory: ${audioSrc}`);
}
cpSync(audioSrc, PUB_BIN_AUDIO, { recursive: true });

log('     rewriting ../src/ -> ./src/ and ../assets/ -> ./assets/');
const REWRITE_FILES = ['index.html', 'app.js', 'audio-manifest.json'];
for (const rel of REWRITE_FILES) {
  const file = join(PUB_BIN, rel);
  if (!existsSync(file)) continue;
  const before = readFileSync(file, 'utf8');
  const after = before
    .replaceAll('../src/', './src/')
    .replaceAll('../assets/', './assets/');
  if (after !== before) {
    writeFileSync(file, after, 'utf8');
    log(`       rewrote ${rel}`);
  }
}

log('Done. public/edu and public/binaural are ready for `next build`.');
