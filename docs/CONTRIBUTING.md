# NexaBank Contribution & Engineering Guidelines

Thank you for contributing to NexaBank! To maintain enterprise-grade software standards, we require all contributions to follow our structured engineering guidelines.

---

## 📂 Code & Directory Conventions

Always structure your files according to the standard modular layout:
*   **Do not centralize all logic inside `App.tsx`**. If building a complex sub-system, extract it into a separate file under `/src/components/` or `/src/utils/`.
*   **Global Type Safety**: Shared types, database schemas, interfaces, and options MUST be declared in `src/types.ts`.
*   **Pure Functions Only**: Math, formatters, and non-stateful operations go in `/src/utils/`.
*   **External initializers**: Initialize clients or setups in `/src/lib/`.

---

## 🌿 Branching Strategy

Our release process uses a standard branching model to maintain development stability:

```
                  ┌───────────────┐
                  │    release    │ (Stable Production Release)
                  └───────▲───────┘
                          │
                  ┌───────┴───────┐
                  │    develop    │ (Feature Consolidation / Staging)
                  └───────▲───────┘
                          │
           ┌──────────────┼──────────────┐
           │              │              │
     ┌─────┴─────┐  ┌─────┴─────┐  ┌─────┴─────┐
     │ feature/* │  │   bug/*   │  │  patch/*  │ (Short-lived developer streams)
     └───────────┘  └───────────┘  └───────────┘
```

1.  **`release`**: Represents the current stable version deployed in production. Directly protected. No force-pushes allowed.
2.  **`develop`**: Where features are integrated for pre-flight testing.
3.  **Developer Streams**: All modifications must be made in isolated branches branching off `develop`:
    *   `feature/feature-name` (e.g. `feature/vaults-apy`)
    *   `bug/issue-description` (e.g. `bug/pin-flicker`)
    *   `patch/hotfix-description` (e.g. `patch/token-refresh`)

---

## 🔀 Pull Request & Code Review Process

1.  **Draft Checkpoints**: Open a Pull Request early in "Draft" state to receive feedback.
2.  **Lint & Compile Pre-requisite**: Before transitioning to "Ready for Review", you must run verification tools locally:
    ```bash
    npm run lint
    npm run build
    ```
    Pull Requests with compilation errors or linter warnings will be automatically rejected by the CI pipeline.
3.  **Review Approvals**: Every Pull Request requires at least **two senior engineering approvals** before merging into the `develop` pipeline.
4.  **No Direct Merge**: Merging is executed via a "Squash and Merge" policy to maintain clean commit history.

---

## ✍️ Commit Message Guidelines

We enforce the **Conventional Commits 1.0.0** specification.

### Format
`<type>(<scope>): <short description>`

### Commit Types
*   `feat`: A new user-facing capability (e.g., `feat(vaults): add check-to-savings sweep dynamic limit slider`).
*   `fix`: A bug resolution (e.g., `fix(auth): resolve google callback state parameter validation mismatch`).
*   `docs`: Documentation changes only (e.g., `docs(architecture): add sequence flow to registration sections`).
*   `style`: Formatting or visual tweaks with zero functional code changes (e.g., `style(theme): update slate balance card negative spacing metrics`).
*   `refactor`: Code changes that neither fix bugs nor add features (e.g., `refactor(ledger): extract transfer triggers into db RPC function`).
*   `chore`: Updating package dependencies, linter scripts, or configurations.

---

## 📐 Coding Standards & Code Quality

1.  **Strict Type Enforcement**: Never use `any` type overrides. Always declare complete, strict, and precise types/interfaces in `src/types.ts`.
2.  **State Rules**: Avoid infinite re-render loops in components. Never trigger state updates directly in a component's render body; always hook mutations to user actions or stable `useEffect` routines.
3.  **Zero Dead-Code**: Remove all commented-out code blocks, temporary console messages, or mock arrays before submitting a Pull Request.

To review design parameters or deployment patterns, consult:
*   [UI Style Guide](./STYLE_GUIDE.md)
*   [Production Deployment Manual](./DEPLOYMENT.md)

---

**Author**: Luckman World
