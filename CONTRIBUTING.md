# Contributing to DSA Roadmap Tracker

Thanks for your interest in contributing! This guide will help you get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)
- [Style Guide](#style-guide)

---

## Code of Conduct

Be respectful, inclusive, and constructive. Harassment, discrimination, and toxic behavior are not tolerated. Maintainers reserve the right to remove contributors who violate these principles.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/DSA-Tracker.git
   cd DSA-Tracker
   ```
3. **Add the upstream remote:**
   ```bash
   git remote add upstream https://github.com/original-owner/DSA-Tracker.git
   ```

---

## Development Setup

Follow the [README setup guide](README.md#-step-by-step-setup) to get the project running locally. In summary:

```bash
# Start the database
docker-compose up -d

# Backend
cd backend
npm install
# Create backend/.env (see README for required variables)
npx prisma db push
npx prisma db seed

# Frontend
cd ../frontend
npm install
# Create frontend/.env.local (see README for required variables)
npx prisma db push

# Root
cd ..
npm install

# Run both servers
npm run dev
```

**Frontend** runs on `http://localhost:3000`, **Backend** on `http://localhost:3001`.

---

## Project Structure

| Directory                 | Description                                       |
| ------------------------- | ------------------------------------------------- |
| `backend/`                | Express.js API server, AI services, Prisma ORM    |
| `frontend/`               | Next.js 16 app with React 19, Tailwind, ReactFlow |
| `frontend/src/app`        | App router pages (dashboard, admin, auth, API)    |
| `frontend/src/components` | Reusable React components                         |
| `frontend/src/lib`        | API client utilities                              |
| `frontend/src/data`       | Static study guide content                        |
| `extension/`              | Browser extension for LeetCode sync               |

---

## Making Changes

1. **Create a feature branch** from `main`:

   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes.** Keep each commit focused on a single logical change.

3. **Test your changes locally** — make sure both frontend and backend still work:

   ```bash
   npm run dev
   ```

4. **Lint your code** before committing:
   ```bash
   cd frontend && npm run lint
   ```

---

## Commit Guidelines

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <short description>
```

**Types:**

| Type       | When to use                          |
| ---------- | ------------------------------------ |
| `feat`     | New feature                          |
| `fix`      | Bug fix                              |
| `docs`     | Documentation only                   |
| `style`    | Formatting, no code logic change     |
| `refactor` | Code restructuring, no feature/fix   |
| `test`     | Adding or updating tests             |
| `chore`    | Build process, dependencies, tooling |

**Examples:**

```
feat(backend): add endpoint for problem bookmarks
fix(frontend): resolve heatmap rendering on mobile
docs: update deployment guide for Docker
chore: bump Next.js to 16.2
```

---

## Pull Request Process

1. **Push** your branch to your fork:

   ```bash
   git push origin feat/your-feature-name
   ```

2. **Open a Pull Request** against the `main` branch of the upstream repo.

3. **In the PR description**, include:
   - What the change does and why
   - Screenshots/recordings for UI changes
   - Steps to test the change manually

4. **Address review feedback** by pushing additional commits to the same branch.

5. PRs require at least one maintainer approval before merging.

---

## Reporting Bugs

Open a [GitHub Issue](../../issues/new) with:

- **Title:** Clear, concise summary
- **Environment:** OS, Node.js version, browser
- **Steps to reproduce:** Numbered step-by-step instructions
- **Expected behavior** vs **Actual behavior**
- **Screenshots or logs** if applicable

---

## Requesting Features

Open a [GitHub Issue](../../issues/new) with the `enhancement` label including:

- **Problem:** What pain point does this solve?
- **Proposed solution:** How should it work?
- **Alternatives considered:** Any other approaches you thought of?

---

## Style Guide

### TypeScript / JavaScript

- Use TypeScript wherever possible
- Use `const` by default, `let` when reassignment is needed
- Prefer named exports over default exports
- Use async/await over raw Promises

### React / Next.js

- Use functional components with hooks
- Keep components focused — split large components into smaller ones
- Place page-level components in `src/app/`, reusable components in `src/components/`

### CSS

- Use Tailwind CSS utility classes
- Avoid inline styles unless dynamic values are required
- Follow the existing color scheme and spacing patterns

### Backend

- Keep route handlers thin — delegate logic to service functions
- Use Prisma for all database operations
- Validate request inputs at the API boundary

---

## Questions?

If you're unsure about anything, feel free to open a discussion or issue. We're happy to help!
