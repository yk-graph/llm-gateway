# Operations & Troubleshooting

Day-to-day operation of llm-gateway and fixes for issues encountered during setup.

## Daily deployment flow

Make code changes on the Air; anything that reaches main is deployed automatically.

```
Implement on the Air
  → work on a feature branch
  → open a PR (ci.yml runs typecheck / lint / format)
  → merge to main (or push directly to main)
  → cd.yml starts automatically
  → Mac mini runs pull → build → launchd restart
```

Nothing needs to be done after merging; deployment is automatic.

Deployment status can be checked in the GitHub Actions tab.

---

## Manual service operations (Mac mini)

### Check status

```bash
launchctl list | grep com.llm-gateway
curl http://localhost:8787/health
```

A PID (number) on the left means running; `-` means stopped.

### Restart

```bash
launchctl kickstart -k gui/$(id -u)/com.llm-gateway
```

### Stop / Start

```bash
launchctl bootout gui/$(id -u)/com.llm-gateway    # stop
launchctl bootstrap gui/$(id -u) ~/server/ops/launchd/com.llm-gateway.plist    # start
```

### Check logs

```bash
cat ~/server/ops/logs/llm-gateway.out.log
cat ~/server/ops/logs/llm-gateway.err.log
```

---

## Checking Ollama

Answer generation requires Ollama to be running.

```bash
curl http://localhost:11434/api/tags    # list models
```

Measure response speed:

```bash
ollama run gemma4:12b --verbose
```

`eval rate` (tokens/s) is the generation-speed indicator.

---

## Managing the self-hosted runner

### Check status

```bash
launchctl list | grep actions
```

Two runners appear: one for llm-gateway and one for the other repository.

### Stop / start the runner

```bash
cd ~/server/ops/actions-runners/llm-gateway
./svc.sh stop
./svc.sh start
```

---

## Troubleshooting

Issues actually encountered during setup and their fixes.

### `pnpm: command not found` during deployment

Cause: the self-hosted runner's environment does not have Volta on its PATH, since it differs from an interactive login shell.

Fix: export the PATH at the start of the workflow step.

```bash
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
```

### launchd cannot find node and exits immediately

Cause: pointing the plist at Volta's shim (`~/.volta/bin/node`) fails because the shim cannot be resolved in launchd's bare environment.

Fix: point directly at the real Node binary.

```
/Users/tatsuya/.volta/tools/image/node/<version>/bin/node
```

Note: upgrading Node changes this path, so the plist must be updated.

### Type error: `Cannot find name 'process' / 'node:path'`

Cause: since TypeScript 6, the `types` field defaults to an empty array, so `@types/node` is no longer loaded automatically.

Fix: declare it explicitly in tsconfig.json.

```json
"types": ["node"]
```

### dist/index.js ends up as only `export {};`

Cause: src is empty, or the build did not complete due to a type error.

Fix: check the contents of src, pass `pnpm typecheck`, then run `pnpm build`. dist is not tracked by Git, so rebuild it on each environment.

### The self-hosted runner is broken and won't start

Symptom: files like `config.sh` or `.runner` are missing; the launchd registration exists but does nothing.

Fix: rather than carefully migrating, recreate it cleanly.

```bash
# Remove from launchd
launchctl bootout gui/$(id -u)/<label>
rm ~/Library/LaunchAgents/<label>.plist

# Remove the registration on GitHub (Settings → Actions → Runners → Remove)

# Delete the leftover folder and register from scratch
```

### git pull fails on the Mini

Cause: uncommitted changes remain on the Mac mini.

Fix: before deploying, confirm `working tree clean` with `git status`. .env and data are gitignored, so they do not interfere.

---

## Directory layout (Mac mini)

```
~/server/
├── srv/
│   └── llm-gateway/          # application code (Git-managed)
├── data/
│   └── llm-gateway/
│       ├── docs/             # Markdown source for answers
│       └── prompts/          # prompt templates
└── ops/
    ├── actions-runners/
    │   ├── portfolio/        # runner for another repository
    │   └── llm-gateway/      # runner for this repository
    ├── launchd/
    │   └── com.llm-gateway.plist
    └── logs/
        ├── llm-gateway.out.log
        └── llm-gateway.err.log
```

- `srv` = outward-facing application code (Git-managed, recoverable)
- `data` = documents and prompts (not in Git, backup target)
- `ops` = operations (runners, plist, logs)
