# Setup Guide

Step-by-step guide to build llm-gateway from scratch. Use it to rebuild on another machine or to recall the configuration.

## Prerequisites

| Tool       | Purpose                 | Notes                                    |
| ---------- | ----------------------- | ---------------------------------------- |
| Volta      | Node version management | Pinned in package.json                   |
| Node.js 24 | Runtime                 | Pinned via Volta                         |
| pnpm       | Package management      | Via Corepack, pinned with packageManager |
| Ollama     | Local LLM runtime       | Uses Gemma 4 12B                         |

---

## 1. Project setup on the Air (development machine)

### 1-1. Initialize the project

```bash
volta pin node@24
mkdir llm-gateway && cd llm-gateway
npm init -y
```

### 1-2. Install dependencies

```bash
pnpm add express dotenv zod
pnpm add -D typescript@6 tsx @types/node @types/express
pnpm add -D eslint @eslint/js typescript-eslint eslint-config-prettier prettier globals
```

### 1-3. Configuration files

- `package.json`: set `"type": "module"`, `volta.node`, and `packageManager`
- `tsconfig.json`: TypeScript 6 requires an explicit `types: ["node"]`
- `eslint.config.js`: ESLint 9/10 flat config
- `.prettierrc.json` / `.prettierignore`
- `.gitignore`: exclude `node_modules/`, `dist/`, `.env`, `data/`
- `.env.example`: configuration template

### 1-4. Verify

```bash
pnpm typecheck
pnpm lint
pnpm format
pnpm build
```

---

## 2. Node environment on the Mac mini (production)

The Mac mini starts with no Node environment, so set it up first.

### 2-1. Install Volta

```bash
curl https://get.volta.sh | bash
source ~/.zshrc
volta --version
```

### 2-2. Install Node

```bash
volta install node@24.15.0
node --version
```

### 2-3. Enable Corepack + pnpm

```bash
volta install corepack
corepack enable
cd ~/server/srv/llm-gateway && pnpm --version
```

---

## 3. Prepare the app for deployment

### 3-1. Clone

```bash
cd ~/server/srv
git clone git@github.com:yk-graph/llm-gateway.git
cd llm-gateway
```

### 3-2. Install and build

```bash
pnpm install --frozen-lockfile
pnpm build
```

### 3-3. .env and data folders

```bash
cp .env.example .env
# Update DOCS_DIR / PROMPTS_DIR in .env to the Mac mini's real paths:
#   DOCS_DIR=/Users/tatsuya/server/data/llm-gateway/docs
#   PROMPTS_DIR=/Users/tatsuya/server/data/llm-gateway/prompts

mkdir -p ~/server/data/llm-gateway/docs ~/server/data/llm-gateway/prompts
```

Place documents (`.md`) and prompts (`.txt`) in the folders above.

---

## 4. Run as a service with launchd

Keep the app running, auto-start it on boot, and auto-restart it on crash.

### 4-1. Place the plist

Create `~/server/ops/launchd/com.llm-gateway.plist`.

Important: specify the real Node binary path, not Volta's shim (`~/.volta/bin/node`). The shim cannot be resolved correctly in launchd's bare environment.

```
Example real path: /Users/tatsuya/.volta/tools/image/node/24.15.0/bin/node
```

Key plist settings:

- `ProgramArguments`: the real node binary + `dist/index.js`
- `WorkingDirectory`: the project path
- `RunAtLoad`: true (start on boot)
- `KeepAlive`: true (restart on crash)
- `StandardOutPath` / `StandardErrorPath`: log destinations

### 4-2. Load and verify

```bash
mkdir -p ~/server/ops/logs
launchctl load -w ~/server/ops/launchd/com.llm-gateway.plist
launchctl list | grep llm-gateway
curl http://localhost:8787/health
```

Success when `{"ok":true,...}` is returned.

---

## 5. Register the self-hosted runner

Register the Mac mini as a GitHub Actions self-hosted runner for automated deployment. Manage multiple runners side by side.

```
~/server/ops/actions-runners/
├── portfolio/       # for another repository
└── llm-gateway/     # for this repository
```

### 5-1. Create the runner

```bash
mkdir -p ~/server/ops/actions-runners/llm-gateway
cd ~/server/ops/actions-runners/llm-gateway
curl -o actions-runner-osx-arm64.tar.gz -L https://github.com/actions/runner/releases/download/v2.336.0/actions-runner-osx-arm64-2.336.0.tar.gz
tar xzf ./actions-runner-osx-arm64.tar.gz
rm actions-runner-osx-arm64.tar.gz
```

### 5-2. Configure

Get the token from GitHub: Settings → Actions → Runners → New self-hosted runner (it is short-lived, so use it right after getting it).

```bash
./config.sh --url https://github.com/yk-graph/llm-gateway --token <TOKEN> --name mac-mini-llm-gateway --labels self-hosted,macOS,ARM64,llm-gateway --unattended
```

The `llm-gateway` label lets workflows target this runner
