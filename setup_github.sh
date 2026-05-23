#!/bin/bash

set -e

echo "======================================"
echo " VectorShift GitHub Setup Script"
echo " Sameer Ray — Technical Assessment"
echo "======================================"
echo ""

REPO_NAME="Sameer_Ray_technical_assessment"
BRANCH="solution/all-four-parts"
COLLABORATOR="integrations@vectorshift.ai"
PROJECT_DIR="$HOME/Downloads/$REPO_NAME"

# ── Step 1: Check gh is installed ──────────────────────────
if ! command -v gh &> /dev/null; then
  echo "Installing GitHub CLI..."
  brew install gh
fi

# ── Step 2: Login check ────────────────────────────────────
echo "Checking GitHub login..."
if ! gh auth status &> /dev/null; then
  echo "Please login to GitHub:"
  gh auth login
fi

GITHUB_USER=$(gh api user --jq .login)
echo "Logged in as: $GITHUB_USER"
echo ""

# ── Step 3: Go to project ─────────────────────────────────
cd "$PROJECT_DIR"
echo "Working in: $PROJECT_DIR"
echo ""

# ── Step 4: Create .gitignore ─────────────────────────────
cat > .gitignore << 'GITIGNORE'
node_modules/
build/
dist/
.env
.env.local
.env*.local
__pycache__/
*.pyc
*.pyo
.DS_Store
package-lock.json
.cache/
coverage/
*.log
GITIGNORE

echo "Created .gitignore"

# ── Step 5: Init git if needed ────────────────────────────
if [ ! -d ".git" ]; then
  git init
  git checkout -b main
  echo "Git initialized"
fi

# ── Step 6: Commit original files on main ─────────────────
echo ""
echo "Committing original files to main branch..."
git add .
git commit -m "chore: original VectorShift assessment starter files" 2>/dev/null || echo "Nothing new to commit on main"

# ── Step 7: Create private GitHub repo ────────────────────
echo ""
echo "Creating private GitHub repo: $REPO_NAME..."
if gh repo view "$GITHUB_USER/$REPO_NAME" &> /dev/null; then
  echo "Repo already exists, setting remote..."
  git remote remove origin 2>/dev/null || true
  git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
else
  gh repo create "$REPO_NAME" \
    --private \
    --source=. \
    --remote=origin
  echo "Repo created: https://github.com/$GITHUB_USER/$REPO_NAME"
fi

# ── Step 8: Push main branch ──────────────────────────────
echo ""
echo "Pushing main branch..."
git push -u origin main --force

# ── Step 9: Create solution branch ────────────────────────
echo ""
echo "Creating solution branch: $BRANCH..."
git checkout -b "$BRANCH" 2>/dev/null || git checkout "$BRANCH"

git add .
git commit -m "feat: complete VectorShift frontend technical assessment

Part 1 - Node Abstraction:
- BaseNode.js: shared component handling header, handles, toolbar, category strip
- All 4 original nodes refactored to use BaseNode (~15 lines each)
- 4 new nodes added: KnowledgeBase, API Call, Conditional, Chat Memory
- registry.js + specs.js: central node registry (circular-import-free)

Part 2 - Styling:
- Professional UI matching VectorShift design system (tokens.css + app.css)
- Collapsible sidebar with searchable node library grouped by category
- Collapsible inspector panel with per-node configuration forms
- Light theme: white node cards, navy/teal accents, colored category strips

Part 3 - Text Node Logic:
- Width auto-resize: longest line x char width updates node width state
- Height auto-resize: scrollHeight trick grows textarea with content
- Dynamic handles: regex extracts {{variable}} names from input
- Each variable creates a live Handle on the left side of the node

Part 4 - Backend Integration:
- api.js: POST /pipelines/parse with full nodes + edges JSON payload
- main.py: FastAPI counts nodes/edges, Kahns algorithm for DAG check
- Returns: num_nodes, num_edges, is_dag, has_input, has_output, orphans
- ValidationModal: shows all results with color-coded status rows" 2>/dev/null || echo "Branch already up to date"

# ── Step 10: Push solution branch ─────────────────────────
echo ""
echo "Pushing solution branch..."
git push -u origin "$BRANCH" --force

# ── Step 11: Create Pull Request ──────────────────────────
echo ""
echo "Creating Pull Request..."

PR_URL=$(gh pr create \
  --title "VectorShift Frontend Technical Assessment — Sameer Ray" \
  --body "## Overview
Complete implementation of all 4 parts of the VectorShift frontend technical assessment.

---

## Part 1 — Node Abstraction ✅
\`src/nodes/BaseNode.js\` is a single shared component used by every node. It handles:
- Colored left category strip
- Header with icon, label, node ID badge
- Dynamic input/output handle rendering with labels
- Floating duplicate/delete toolbar on hover

Adding a new node takes ~15 lines — just pass \`label\`, \`icon\`, \`category\`, \`inputs\`, \`outputs\`, and field children as props.

**New nodes created:** Knowledge Base, API Call, Conditional, Chat Memory (plus original 4 refactored).

---

## Part 2 — Styling ✅
- Collapsible left sidebar with searchable, categorized node library
- Collapsible right inspector panel with per-node configuration forms
- Top bar with editable pipeline name, save state indicator, submit button
- White node cards on light grey canvas, color-coded by category (io=blue, llm=purple, data=green, logic=amber)

---

## Part 3 — Text Node Logic ✅
- **Width auto-resize:** measures longest line × character width constant, updates React width state
- **Height auto-resize:** textarea grows via \`scrollHeight\` on every keystroke
- **Dynamic handles:** regex \`/\\{\\{\\s*([a-zA-Z_\$][a-zA-Z0-9_\$]*)\\s*\\}\\}/g\` extracts valid JS identifiers
- Each extracted variable creates a live \`<Handle type='target'>\` on the left side, labeled and evenly spaced

---

## Part 4 — Backend Integration ✅
- **Frontend:** \`api.js\` sends nodes + edges to \`POST /pipelines/parse\` via axios
- **Backend:** FastAPI endpoint in \`main.py\` counts nodes/edges, runs Kahn's topological sort for DAG detection
- **Response format:** \`{ num_nodes, num_edges, is_dag, has_input, has_output, orphans }\`
- **UI:** \`ValidationModal\` displays all results with green/amber status rows

---

## How to Run
\`\`\`bash
# Frontend (Terminal 1)
cd frontend
npm install
npm start

# Backend (Terminal 2)
cd backend
pip install fastapi uvicorn
uvicorn main:app --reload
\`\`\`

Open http://localhost:3000" \
  --base main \
  --head "$BRANCH" 2>/dev/null || echo "PR already exists")

# Get PR URL if already existed
if [ -z "$PR_URL" ]; then
  PR_URL=$(gh pr view "$BRANCH" --json url --jq .url 2>/dev/null || echo "")
fi

# ── Step 12: Add collaborator ──────────────────────────────
echo ""
echo "Adding collaborator: $COLLABORATOR..."
gh api \
  "repos/$GITHUB_USER/$REPO_NAME/collaborators/integrations%40vectorshift.ai" \
  --method PUT \
  --field permission=read 2>/dev/null && echo "Collaborator added successfully" || \
  echo "NOTE: GitHub API blocked email as collaborator username. Add manually:"
echo "  → github.com/$GITHUB_USER/$REPO_NAME → Settings → Collaborators → Add people → integrations@vectorshift.ai"

# ── Done ──────────────────────────────────────────────────
echo ""
echo "======================================"
echo " ALL DONE"
echo "======================================"
echo ""
echo "Repo:  https://github.com/$GITHUB_USER/$REPO_NAME"
echo "PR:    $(gh pr view --json url --jq .url 2>/dev/null || echo 'check github.com')"
echo ""
echo "PASTE THIS PR LINK INTO THE GOOGLE FORM"
