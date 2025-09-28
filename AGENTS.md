# Repository Guidelines

## Project Structure & Module Organization
The repository is split by language. Go services live in `go/`, with `cmd/api` and `cmd/bff` as the runnable entry points; add any shared logic under `go/internal` as it emerges. The web client sits in `ts/web`, a Next.js 15 app that ships with Tailwind CSS 4 and Biome configuration. Product and discovery material belongs in `docs/product`. Keep generated artifacts (build outputs, `.next/`, `dist/`) out of version control and store public assets under `ts/web/public`.

## Build, Test, and Development Commands
Inside `go/`, use `task run-api` or `go run ./cmd/api` to start the API, and `task run-bff` or `go run ./cmd/bff` for the BFF (install the Task CLI if you prefer scripted workflows). Manage module dependencies with `go mod tidy`. In `ts/web/`, run `npm install` once, then `npm run dev` for local development, `npm run build` for production bundles, `npm run start` to serve the compiled app, and `npm run lint` for static analysis. Use `npm run format` to apply Biome fixes before committing.

## Coding Style & Naming Conventions
Go code must remain `gofmt`-clean (tabs for indentation, lowercase package names, exported symbols only when they need to cross package boundaries). TypeScript files use Biome’s defaults: two-space indentation with automated import ordering and formatting. Favor PascalCase for React components, camelCase for hooks/utilities, and dash-separated filenames for assets. Keep environment-specific constants in dedicated config modules rather than inline literals.

## Testing Guidelines
Automated testing is not yet in place. Introduce Go unit tests adjacent to source files as `_test.go` cases and execute them with `go test ./...`. Front-end tests should follow Next.js conventions (`src/app/__tests__/*.test.tsx`) and run via a dedicated npm script once introduced; until then, treat `npm run lint` as a required gate. Document manual verification steps in PRs whenever new endpoints or UI flows are added.

## Commit & Pull Request Guidelines
History is currently minimal; adopt short, imperative commit subjects (≤72 characters), optionally scoping by area (e.g., `feat:web: add landing hero`). Provide additional context in the body when touching both Go and TypeScript layers. Pull requests should summarize intent, link tracking issues, attach screenshots or recordings for UI changes, and list validation steps (`go test ./...`, `npm run lint`, manual checks). Request reviews from code owners of the directories you modify and wait for CI equivalents to pass before merging.
