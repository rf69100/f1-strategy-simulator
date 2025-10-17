Deployment notes — minimal steps to deploy the app under a subpath

1) Purpose
This project is intended to be served from a subpath, e.g. https://ryanfonseca.fr/f1-simulator/
The build must therefore use the correct base so all asset URLs include the `/f1-simulator/` prefix.

2) How it’s handled
- `vite.config.ts` reads `process.env.VITE_BASE` and falls back to `/f1-simulator/` by default.
- `deploy.sh` sets `VITE_BASE` automatically before `npm run build` to match the remote folder used in the upload.

3) Quick local test
```bash
# Build with default (fallback /f1-simulator/)
npm run build
# Preview locally
npm run preview
# open http://localhost:4173/f1-simulator/
```

4) Deploy (automated)
- Provide FTP credentials via `.deploy.env` or environment variables (FTP_USER, FTP_PASS, FTP_HOST).
- Execute the deploy script from your local clone (it will pull, build with correct VITE_BASE, verify build, then upload):

```bash
./deploy.sh
```

Deploy a single project
-----------------------
You can deploy only one project from the list by passing its display name or remote folder as an argument. Use `--list` to see options.

Examples:

```bash
# list available projects
./deploy.sh --list

# deploy by display name (exact match)
./deploy.sh "F1 Strategy Simulator"

# or deploy by remote folder
./deploy.sh f1-simulator
```

5) Server (Nginx) configuration (essential)
- Ensure that the site is served under `/f1-simulator/` and that you have an SPA fallback to `index.html`.
- Example config provided in `deploy/nginx_f1_simulator.conf`.

6) Troubleshooting
- If the page is blank after deploy, open browser devtools Network tab and verify the JS file is requested from `/f1-simulator/assets/...` and returns 200.
- If 404, ensure `dist/` is uploaded to `/www/f1-simulator/` (deploy script should mirror it).
- If index.html references the wrong base, check `VITE_BASE` value used during build.

7) Optional
- If you need to deploy to root `/`, set `VITE_BASE=/` before running build.


Per-project deploy (F1 only)
----------------------------
If you prefer deploying only the F1 project (clean and minimal), use the provided `deploy-f1.sh` script. It builds with relative assets and uploads only this project's `dist/` to `/www/f1-simulator/`.

Usage:
```
# create .deploy.env with FTP_USER/FTP_PASS/FTP_HOST or export env vars
./deploy-f1.sh
```

The script will:
- run `npm ci` (or `npm install` if lockfile missing)
- build (VITE_BASE=./)
- verify the built JS asset exists
- upload via lftp to `/www/f1-simulator/`
- test the public URL

If you want similar per-project scripts for other projects, I can add them the same way.

