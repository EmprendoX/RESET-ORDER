# NEXT-STEPS — pasos pendientes para publicar el monorepo

Este repo (`EmprendoX/RESET-ORDER`) es el **host/orquestador** y consume `RESET-EDU` como **submódulo Git**. El bootstrap inicial se hizo todo en local (Camino B sin push). Los pasos siguientes solo se ejecutan cuando estés listo para publicar.

## Estado actual (local-only)

- `~/RESET-ORDER` tiene 1 commit (`a4871ab chore: bootstrap RESET-ORDER host …`). Remote configurado (`EmprendoX/RESET-ORDER`) pero **sin push aún**.
- El submódulo en `RESET-ORDER/RESET-EDU` apunta al commit `fd9ce61` (rama `host-integration`).
- `.gitmodules` usa URL **local temporal**: `file:///Users/agustinpascalsierra/RESET-EDU`. **No es portable** — solo funciona en esta máquina. Hay que cambiarla a HTTPS antes de pushear.
- `~/RESET-EDU` (repo independiente, remote `EmprendoX/RESET-EDU`) está en `main` (commit `fa9e251`, igual a `origin/main`). Tiene además la rama local `host-integration` (`fd9ce61`) que **aún no está pusheada**.
- Backups defensivos:
  - `~/RESET-EDU_pre_integration_backup_<timestamp>/` — copia íntegra de `~/RESET-EDU` (con `.git`) tomada antes de tocar nada.
  - `~/RESET-EDU_integration_copy_backup/` — la copia divergente original que vivía en `~/RESET-ORDER/RESET-EDU/`.
  - `~/.RESET-EDU.git.backup/` — backup previo del `.git` (preexistente).

## Cuando decidas pushear

### 1. Pushear `host-integration` a `EmprendoX/RESET-EDU`

```bash
cd ~/RESET-EDU
git checkout host-integration
git push -u origin host-integration
```

Esto NO toca `main` ni el deploy standalone de Netlify. Solo añade una rama nueva.

### 2. Cambiar URL del submódulo de `file://` a HTTPS

```bash
cd ~/RESET-ORDER
git config -f .gitmodules submodule.RESET-EDU.url https://github.com/EmprendoX/RESET-EDU.git
git submodule sync
git add .gitmodules
git commit -m "chore: switch RESET-EDU submodule URL to HTTPS origin"
```

### 3. Pushear `RESET-ORDER`

```bash
cd ~/RESET-ORDER
git push -u origin main
```

### 4. Verificación con clon fresco

```bash
cd /tmp
git clone --recursive https://github.com/EmprendoX/RESET-ORDER.git
cd RESET-ORDER/RESETE-HUB
npm install
npm run build:subapps   # debe completar sin errores
```

## Workflow continuo (cuando los repos ya están en GitHub)

### Hacer cambios a contenido de cursos (RESET-EDU)

```bash
cd ~/RESET-EDU
git checkout main
# … editar, commitear, push
git push origin main
# Deploy standalone a Netlify se actualiza solo desde main.
```

### Propagar cambios de cursos a la versión integrada

```bash
cd ~/RESET-EDU
git checkout host-integration
git merge main             # o git rebase main, según preferencia
# Resolver conflictos si los hubiera (los cambios de integración están en
# archivos específicos: vite.config.ts, index.html, tailwind, componentes con
# tema oscuro). Si un componente tocado por main NO está en la lista de
# integración, el merge será limpio.
git push origin host-integration

cd ~/RESET-ORDER
cd RESET-EDU
git fetch origin
git checkout host-integration
git pull origin host-integration
cd ..
git add RESET-EDU
git commit -m "chore(submodule): bump RESET-EDU to latest host-integration"
git push origin main
```

### Hacer cambios de integración (shell, host, base /edu/, tema oscuro)

Esos cambios viven en `host-integration` de `EmprendoX/RESET-EDU`:

```bash
cd ~/RESET-ORDER/RESET-EDU      # entrar al submódulo
git checkout host-integration
# … editar archivos
git add -A
git commit -m "feat(host): …"
git push origin host-integration

cd ..                            # volver al host
git add RESET-EDU
git commit -m "chore(submodule): bump RESET-EDU"
git push origin main
```

## Clonar el monorepo desde cero (para otros devs)

```bash
git clone --recursive https://github.com/EmprendoX/RESET-ORDER.git
# o si ya clonaron sin --recursive:
git submodule update --init --recursive
```

## Si algo se rompe — rollback

| Síntoma | Recuperación |
| --- | --- |
| `~/RESET-EDU` quedó en mal estado | `rm -rf ~/RESET-EDU && mv ~/RESET-EDU_pre_integration_backup_<ts> ~/RESET-EDU` |
| El submódulo apunta al SHA equivocado | `cd ~/RESET-ORDER/RESET-EDU && git checkout host-integration && cd .. && git add RESET-EDU && git commit --amend` |
| Standalone Netlify (RESET-EDU main) dejó de funcionar | El push a `host-integration` no toca `main`, así que esto solo pasa si alguien mergeó integración a main. Revertir el merge en main. |

## Notas importantes

- **NUNCA** hacer `git push origin main` desde la rama `host-integration` de `~/RESET-EDU`. Eso destruiría el deploy standalone. Usar siempre `git push origin host-integration`.
- El `.gitignore` del host ya excluye `RESETE-HUB/public/edu/` y `RESETE-HUB/public/binaural/` (regenerados por `build-all.mjs`).
- El submódulo tiene su propio `.gitignore` heredado de `RESET-EDU` (excluye `dist/`, `node_modules/`, `.netlify/`, etc.).
