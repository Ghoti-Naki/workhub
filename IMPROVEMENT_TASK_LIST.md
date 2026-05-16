# AI Work Hub — Improvement Task List

Generated from full-stack audit covering product, code, UX, security, testing,
documentation, deployment, and portfolio readiness.

**Legend**
- Priority: 🔴 High / 🟡 Medium / 🟢 Low
- Each task is self-contained and can be picked up independently.

---

## Table of Contents

1. [Must-Fix Issues](#1-must-fix-issues)
2. [UI/UX Polish](#2-uiux-polish)
3. [Code Quality Improvements](#3-code-quality-improvements)
4. [Performance Improvements](#4-performance-improvements)
5. [Security Improvements](#5-security-improvements)
6. [Testing Improvements](#6-testing-improvements)
7. [Documentation Improvements](#7-documentation-improvements)
8. [Deployment Improvements](#8-deployment-improvements)
9. [Portfolio & Competition Improvements](#9-portfolio--competition-improvements)
10. [Optional Future Features](#10-optional-future-features)

---

## 1. Must-Fix Issues

These are blockers — they either break core functionality, create a bad first
impression on any reviewer, or hide the app's value entirely.

---

### MUST-01 · Seed Script with Realistic Data

**Priority:** 🔴 High

**Goal:**
Populate the database with believable, pre-generated data so the app looks like
a real product from the first click — not an empty shell. Reviewers and demo
viewers should open the app and immediately see value, not a blank dashboard.

**Files likely affected:**
```
prisma/seed.ts               (create)
prisma/schema.prisma         (add seed script reference)
package.json                 (add "prisma": { "seed": "..." })
.env.example                 (document SEED_ONLY flag if needed)
```

**Implementation steps:**
1. Create `prisma/seed.ts`. Import `PrismaClient`.
2. Define 3–4 distinct projects with realistic names, statuses, and colors:
   - "Product Launch Q3" (active, high priority, red)
   - "Engineering Hiring" (active, medium priority, blue)
   - "Personal Finance Review" (on-hold, low priority, green)
3. For each project, seed:
   - 4–6 tasks across different statuses (todo, in-progress, done)
   - 2–3 notes with multi-paragraph body text
   - 1–2 file records pointing to placeholder URLs
4. Seed 5–8 inbox items, some already converted, some pending.
5. Seed 3–5 calendar events spanning the current week and next.
6. Seed pre-generated `AiOutput` records (daily brief, one project summary)
   using realistic text — so AI features appear populated even without an
   OpenAI key.
7. Wrap all inserts in `prisma.$transaction([...])` for atomicity.
8. Add a guard at the top: if data already exists, skip seeding (idempotent).
9. Add to `package.json`:
   ```json
   "prisma": {
     "seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts"
   }
   ```
10. Run with `npx prisma db seed`.

**How to test:**
- Run `npx prisma db seed` on a fresh database.
- Open the app. Dashboard should show populated stats, projects list should
  show 3–4 cards, tasks list should show items across statuses.
- Run seed again — confirm no duplicate records are created.

---

### MUST-02 · Empty State Components for Every Page

**Priority:** 🔴 High

**Goal:**
Replace blank/null renders with intentional empty states that include a
relevant icon, a short message, and a primary CTA. This transforms the app
from "broken" to "ready for input" in a reviewer's eyes.

**Files likely affected:**
```
components/shared/EmptyState.tsx      (create)
components/pages/TasksPage.tsx
components/pages/ProjectsPage.tsx
components/pages/NotesPage.tsx
components/pages/InboxPage.tsx
components/pages/CalendarPage.tsx
components/pages/FilesPage.tsx
```

**Implementation steps:**
1. Create `EmptyState.tsx`:
   ```tsx
   interface EmptyStateProps {
     icon: React.ReactNode;
     title: string;
     description: string;
     action?: { label: string; onClick: () => void };
   }
   ```
   Style: centered column layout, muted icon (48px), title in primary text,
   description in secondary text, optional outlined primary button.
2. For each page, locate the conditional render where an empty array is
   returned or mapped. Replace with `<EmptyState ... />`.
3. Choose copy that reflects what the page does:
   - Tasks: "No tasks yet" / "Create your first task to start tracking work."
   - Projects: "No projects" / "A project groups your tasks, notes, and files."
   - Inbox: "Inbox is clear" / "Items captured from automations appear here."
   - Calendar: "No events" / "Add an event or connect your calendar via n8n."
   - Files: "No files linked" / "Link files from Google Drive or Notion here."
4. Wire the action button to the relevant modal open handler passed from the
   parent page.

**How to test:**
- Temporarily comment out seed data or connect to a fresh database.
- Navigate to each page and confirm the empty state renders correctly.
- Click the CTA — confirm the correct modal opens.
- Add one item — confirm the empty state disappears and the list renders.

---

### MUST-03 · Loading Skeleton Components

**Priority:** 🔴 High

**Goal:**
Show animated placeholder blocks while data is loading instead of blank space.
Prevents the "is this broken?" perception during the initial data fetch and
during navigation between pages.

**Files likely affected:**
```
components/shared/Skeleton.tsx        (create)
components/pages/HomePage.tsx
components/pages/TasksPage.tsx
components/pages/ProjectsPage.tsx
components/pages/NotesPage.tsx
components/pages/InboxPage.tsx
```

**Implementation steps:**
1. Create `Skeleton.tsx`:
   ```tsx
   // Renders a gray animated pulse block at specified dimensions
   interface SkeletonProps {
     className?: string;
     width?: string;
     height?: string;
     rounded?: 'sm' | 'md' | 'full';
   }
   ```
   Use Tailwind's `animate-pulse` and `bg-gray-200 dark:bg-gray-700`.
2. Create composite skeletons for common patterns:
   - `SkeletonCard` — mimics a project/task card (title bar + 2 line bars)
   - `SkeletonStat` — mimics a dashboard stat widget
   - `SkeletonRow` — mimics a table/list row
3. In each page, locate the `isLoading` or equivalent state. Replace the
   current loading condition (blank or spinner) with the relevant skeleton:
   ```tsx
   if (isLoading) return (
     <div className="space-y-3">
       {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
     </div>
   );
   ```
4. Keep skeletons structurally similar to the real content so the transition
   is smooth and doesn't cause layout shift.

**How to test:**
- Add an artificial `await new Promise(r => setTimeout(r, 2000))` at the
  start of the data-fetch function.
- Reload the app — confirm skeletons render in place of content.
- After 2 seconds, confirm content replaces skeletons without layout jump.
- Remove the artificial delay.

---

### MUST-04 · AI Feature Error States

**Priority:** 🔴 High

**Goal:**
When the OpenAI API key is missing, invalid, or rate-limited, show a
user-friendly message instead of a blank panel, a raw error, or a silent
failure. AI is listed as "optional" in the stack — the UI must gracefully
reflect this.

**Files likely affected:**
```
app/api/ai/daily-brief/route.ts
app/api/ai/projects/[id]/summary/route.ts
app/api/ai/copilot/route.ts
app/api/ai/notes/[id]/extract-tasks/route.ts
components/pages/HomePage.tsx         (daily brief display)
components/pages/CopilotPage.tsx
components/pages/NotesPage.tsx        (extract tasks button)
```

**Implementation steps:**
1. In every AI API route, wrap the OpenAI call in try/catch. On error,
   return a structured response:
   ```ts
   return Response.json({
     data: null,
     error: {
       code: 'AI_UNAVAILABLE',
       message: 'AI generation failed. Check OPENAI_API_KEY in your environment.'
     }
   }, { status: 503 });
   ```
2. Add a specific check for missing key before the API call:
   ```ts
   if (!process.env.OPENAI_API_KEY) {
     return Response.json({
       data: null,
       error: { code: 'AI_NOT_CONFIGURED', message: 'OpenAI key not set.' }
     }, { status: 503 });
   }
   ```
3. In each UI component that calls an AI route, handle the `error` field in
   the response envelope. Show a styled callout (not a toast):
   ```
   ⚠ AI unavailable — OPENAI_API_KEY is not configured.
     Add it to your .env file to enable this feature.
   ```
4. The callout should not break layout — it replaces the content area where
   the AI output would appear, at the same size.
5. Do not throw or log the raw OpenAI error object to the client.

**How to test:**
- Unset `OPENAI_API_KEY` in your `.env`.
- Trigger: daily brief generation, project summary, copilot message,
  note task extraction.
- Confirm each shows the styled error callout, not a blank or crash.
- Re-set the key — confirm features work normally.

---

### MUST-05 · React Error Boundary

**Priority:** 🔴 High

**Goal:**
Prevent an uncaught render error in one component from crashing the entire
app. Show a recovery UI instead of a white screen.

**Files likely affected:**
```
components/shared/ErrorBoundary.tsx   (create)
app/error.tsx                         (Next.js route-level, create if missing)
AIWorkHubAppStarterV1.tsx             (wrap pages)
```

**Implementation steps:**
1. Create `ErrorBoundary.tsx` as a class component:
   ```tsx
   class ErrorBoundary extends React.Component<
     { children: React.ReactNode; fallback?: React.ReactNode },
     { hasError: boolean; error: Error | null }
   > {
     state = { hasError: false, error: null };
     static getDerivedStateFromError(error: Error) {
       return { hasError: true, error };
     }
     componentDidCatch(error: Error, info: React.ErrorInfo) {
       console.error('ErrorBoundary caught:', error, info);
     }
     render() {
       if (this.state.hasError) {
         return this.props.fallback ?? <DefaultErrorFallback error={this.state.error} />;
       }
       return this.props.children;
     }
   }
   ```
2. Create `DefaultErrorFallback` — a centered panel with a brief message,
   the error name (not stack), and a "Reload page" button.
3. Wrap the page render in the root component:
   ```tsx
   <ErrorBoundary key={currentPage}>
     {renderPage(currentPage)}
   </ErrorBoundary>
   ```
   Using `key={currentPage}` resets the boundary on navigation, so an error
   on one page doesn't persist when the user navigates away.
4. Create `app/error.tsx` for Next.js route-level error handling as well.
5. Wrap individual high-risk components (AI output panels, automation run
   log) in their own boundary with a smaller fallback.

**How to test:**
- Temporarily throw inside a page component: `throw new Error('test crash')`.
- Confirm the error fallback renders instead of a white screen.
- Confirm other pages still render normally after navigating away.
- Remove the test throw.

---

### MUST-06 · Node Version Pinning

**Priority:** 🔴 High

**Goal:**
Make the Node 22 requirement explicit and machine-enforceable. Any developer
or CI system that clones this repo should immediately know the required
version, not discover it after a cryptic Prisma ESM error.

**Files likely affected:**
```
.nvmrc                    (create)
package.json              (add engines field)
README.md                 (add prerequisites section)
```

**Implementation steps:**
1. Create `.nvmrc`:
   ```
   22
   ```
2. Add to `package.json`:
   ```json
   "engines": {
     "node": ">=22.0.0",
     "npm": ">=10.0.0"
   }
   ```
3. If using a CI pipeline, add a step:
   ```yaml
   - uses: actions/setup-node@v4
     with:
       node-version-file: '.nvmrc'
   ```
4. In the README prerequisites section, add:
   > Requires Node.js 22+. Run `nvm use` if you have nvm installed.

**How to test:**
- Switch to Node 18 (`nvm use 18`). Run `npm install` — `engines` field
  should warn or error depending on npm settings.
- Switch to Node 22 (`nvm use 22`). Run `npx prisma generate` — confirm
  it completes without ESM errors.

---

## 2. UI/UX Polish

Tasks that make the interface feel finished, intentional, and professional.

---

### UX-01 · Filter Bar for Tasks and Projects

**Priority:** 🔴 High

**Goal:**
Allow the user to filter the tasks and projects lists by status, priority,
and due date. A flat unfiltered list of 20+ items makes the app feel
incomplete and is one of the documented "honest gaps."

**Files likely affected:**
```
components/pages/TasksPage.tsx
components/pages/ProjectsPage.tsx
components/shared/FilterBar.tsx       (create)
```

**Implementation steps:**
1. Create `FilterBar.tsx` — a horizontal row of `<select>` dropdowns and
   a date range input:
   ```tsx
   interface FilterBarProps {
     filters: TaskFilters;
     onChange: (filters: TaskFilters) => void;
   }
   ```
   Where `TaskFilters` includes `status`, `priority`, `dueBefore`, `dueAfter`.
2. In `TasksPage.tsx`, add a `filters` state initialized with all-empty values
   (meaning "no filter applied").
3. Replace the current `useMemo` search computation with one that chains
   search + filter:
   ```ts
   const filtered = useMemo(() => {
     return tasks
       .filter(t => !filters.status || t.status === filters.status)
       .filter(t => !filters.priority || t.priority === filters.priority)
       .filter(t => query === '' || t.title.toLowerCase().includes(query));
   }, [tasks, filters, query]);
   ```
4. Render `<FilterBar>` above the task list.
5. Add a "Clear filters" button that resets all filter state.
6. Add a subtle count display: "Showing 4 of 12 tasks" when filters are active.
7. Repeat pattern for `ProjectsPage.tsx` (filter by status and priority).

**How to test:**
- Seed tasks with varied statuses and priorities.
- Set filter to "In Progress" — confirm only in-progress tasks show.
- Combine status + priority filter — confirm intersection is correct.
- Clear filters — confirm all tasks return.
- Confirm search and filters work simultaneously.

---

### UX-02 · Replace Modal `div` with HTML `<dialog>` Element

**Priority:** 🔴 High

**Goal:**
Native `<dialog>` provides focus trapping, Escape-key closing, backdrop
click handling, and `aria-modal` semantics for free — without any library.
Current `div`-based modals allow keyboard users to tab behind the modal.

**Files likely affected:**
```
components/modals/ModalShell.tsx
components/modals/CaptureModal.tsx
components/modals/ProjectFormModal.tsx
components/modals/TaskFormModal.tsx
components/modals/NoteFormModal.tsx
components/modals/EventFormModal.tsx
```

**Implementation steps:**
1. Refactor `ModalShell.tsx` to use `<dialog>`:
   ```tsx
   const dialogRef = useRef<HTMLDialogElement>(null);

   useEffect(() => {
     if (open) dialogRef.current?.showModal();
     else dialogRef.current?.close();
   }, [open]);

   useEffect(() => {
     const handler = (e: Event) => {
       if ((e as MouseEvent).target === dialogRef.current) onClose();
     };
     dialogRef.current?.addEventListener('click', handler);
     return () => dialogRef.current?.removeEventListener('click', handler);
   }, [onClose]);

   return (
     <dialog ref={dialogRef} onClose={onClose} className="modal-shell">
       {children}
     </dialog>
   );
   ```
2. Style `dialog::backdrop` in your global CSS for the overlay:
   ```css
   dialog::backdrop {
     background: rgba(0, 0, 0, 0.4);
     backdrop-filter: blur(2px);
   }
   ```
3. Remove any manual focus management code — `<dialog>` handles it natively.
4. Remove any Escape key listeners — `<dialog>` fires `onClose` on Escape.
5. Ensure `<dialog>` has an accessible title via `aria-labelledby` pointing
   to the modal's heading element.
6. Test in Safari (dialog support has historical quirks — verify polyfill
   is not needed for your target browsers).

**How to test:**
- Open any modal. Tab through all fields — confirm focus cannot leave the modal.
- Press Escape — confirm modal closes.
- Click the backdrop — confirm modal closes.
- Open modal with screen reader — confirm it announces the modal title.

---

### UX-03 · ARIA Labels on Icon-Only Buttons

**Priority:** 🔴 High

**Goal:**
Every button that contains only an icon (no visible text) must have an
`aria-label` so screen readers can announce what it does. Without this,
screen readers announce "button" with no context.

**Files likely affected:**
```
components/shared/AppHeader.tsx
components/shared/Sidebar.tsx
components/pages/TasksPage.tsx
components/pages/ProjectsPage.tsx
components/pages/NotesPage.tsx
components/pages/InboxPage.tsx
components/pages/FilesPage.tsx
```

**Implementation steps:**
1. Search the codebase for `<button` elements. For each one, check if it
   contains visible text. If it contains only an icon component or SVG:
   ```tsx
   // Before
   <button onClick={handleDelete}><TrashIcon /></button>

   // After
   <button onClick={handleDelete} aria-label="Delete task">
     <TrashIcon aria-hidden="true" />
   </button>
   ```
2. Add `aria-hidden="true"` to the icon inside any labeled button — the icon
   is decorative once the button has a label.
3. Common buttons to find and fix:
   - Delete / trash buttons on tasks, notes, projects
   - Edit / pencil buttons
   - Close (×) button on modals
   - Sidebar collapse toggle
   - Capture / quick-add button in the header
   - AI generation / refresh buttons
4. For toggle buttons (e.g. sidebar expand), add `aria-expanded`:
   ```tsx
   <button aria-label="Toggle sidebar" aria-expanded={sidebarOpen}>
   ```

**How to test:**
- Install the axe DevTools browser extension.
- Run an accessibility scan — confirm zero "button name" violations.
- Tab through the app with keyboard — every button should have a meaningful
  announcement when focused.

---

### UX-04 · Inline Form Validation

**Priority:** 🟡 Medium

**Goal:**
Validate form fields client-side before the API call. Show errors inline
below the relevant field, not just as a post-submit toast. This is standard
UX behavior users expect from any real product.

**Files likely affected:**
```
components/modals/TaskFormModal.tsx
components/modals/ProjectFormModal.tsx
components/modals/NoteFormModal.tsx
components/modals/EventFormModal.tsx
components/modals/CaptureModal.tsx
```

**Implementation steps:**
1. Add a `FormErrors` type per form:
   ```ts
   type TaskFormErrors = {
     title?: string;
     dueDate?: string;
   };
   ```
2. Add `errors` state and a `validate()` function that runs before submit:
   ```ts
   const validate = (): boolean => {
     const errs: TaskFormErrors = {};
     if (!form.title.trim()) errs.title = 'Title is required.';
     if (form.dueDate && form.dueDate < today) errs.dueDate = 'Due date cannot be in the past.';
     setErrors(errs);
     return Object.keys(errs).length === 0;
   };
   ```
3. In the submit handler: `if (!validate()) return;`
4. Render errors below each field:
   ```tsx
   <input ... className={errors.title ? 'border-red-500' : ''} />
   {errors.title && (
     <p className="text-sm text-red-600 mt-1" role="alert">{errors.title}</p>
   )}
   ```
5. Clear field errors on change: `onChange={() => setErrors(e => ({ ...e, title: undefined }))}`
6. Add `role="alert"` on error messages so screen readers announce them.

**How to test:**
- Open TaskFormModal. Submit with empty title — confirm inline error appears.
- Type in the title field — confirm error clears as you type.
- Set a past due date — confirm date error appears.
- Fill all fields correctly — confirm form submits without errors.

---

### UX-05 · Color Contrast Audit on Badges

**Priority:** 🟡 Medium

**Goal:**
Ensure all status and priority badge text meets WCAG AA contrast ratio
(4.5:1 for normal text). Low-contrast badges are common in Tailwind projects
using mid-tone color pairs.

**Files likely affected:**
```
components/shared/Badge.tsx
components/shared/styles.ts
```

**Implementation steps:**
1. List all badge color combinations currently used (e.g. yellow text on
   yellow background, green text on green background).
2. Check each combination at https://webaim.org/resources/contrastchecker/.
3. For any pair below 4.5:1, adjust to a darker text shade or lighter
   background:
   - Instead of `text-yellow-500 bg-yellow-100`, use `text-yellow-800 bg-yellow-100`
   - Instead of `text-green-500 bg-green-100`, use `text-green-800 bg-green-100`
   - Instead of `text-red-500 bg-red-100`, use `text-red-800 bg-red-100`
4. Apply the same audit to any colored text used for priority labels, status
   indicators, or tags in the sidebar.
5. Verify dark mode versions maintain contrast — add `.dark:text-yellow-200`
   equivalents where needed.

**How to test:**
- Install axe DevTools.
- Run scan — confirm zero color contrast violations.
- Switch to dark mode — re-run scan.
- Manually verify badges look intentional (darker text on light tint is
  correct — it should not look harsh).

---

### UX-06 · `aria-live` Region for Async Notifications

**Priority:** 🟢 Low

**Goal:**
When async operations complete (task saved, AI generation done, inbox item
converted), the status message should be announced to screen readers via an
`aria-live` region.

**Files likely affected:**
```
components/shared/ToastProvider.tsx   (or wherever toasts are managed)
AIWorkHubAppStarterV1.tsx             (if toasts are inline)
```

**Implementation steps:**
1. Locate where success/error messages are shown to the user.
2. Ensure the toast container or notification area has:
   ```tsx
   <div aria-live="polite" aria-atomic="true">
     {currentToast && <Toast message={currentToast.message} />}
   </div>
   ```
3. Use `aria-live="assertive"` only for genuine errors — not routine
   success messages.
4. Confirm messages are injected into the DOM after the live region is
   already mounted (not rendered simultaneously).

**How to test:**
- Enable a screen reader (VoiceOver on Mac, NVDA on Windows).
- Create a task. Confirm the "Task created" message is announced.
- Trigger an error. Confirm the error message is announced.

---

## 3. Code Quality Improvements

---

### CODE-01 · Break Up the 904-Line Root Component

**Priority:** 🔴 High

**Goal:**
`AIWorkHubAppStarterV1.tsx` at 904 lines is a god component — it holds all
state, all handlers, all routing, and all data fetching. This is the first
file a technical reviewer will look at. It signals frontend immaturity.
Extract it to under 200 lines by pulling out hooks and navigation logic.

**Files likely affected:**
```
AIWorkHubAppStarterV1.tsx             (shrink to <200 lines)
hooks/useWorkspaceData.ts             (create)
hooks/useNavigation.ts                (create)
hooks/useModals.ts                    (create)
components/NavigationShell.tsx        (create)
```

**Implementation steps:**
1. Extract `useWorkspaceData.ts`:
   - Move all `useState` for data (projects, tasks, notes, inbox, events,
     files, aiOutputs).
   - Move all fetch functions (fetchProjects, fetchTasks, etc.).
   - Move all mutation handlers (handleCreateTask, handleUpdateProject, etc.).
   - Return `{ data, isLoading, handlers }`.

2. Extract `useNavigation.ts`:
   - Move `currentPage` state and `setCurrentPage`.
   - Add typed `Page` union: `type Page = 'home' | 'inbox' | 'projects' | ...`
   - Return `{ currentPage, navigate }`.

3. Extract `useModals.ts`:
   - Move all modal open/close state booleans.
   - Move `editingItem` state.
   - Return `{ modals, openModal, closeModal, editingItem }`.

4. Create `NavigationShell.tsx` that renders `AppHeader`, `Sidebar`, and
   the active page — receiving only the navigation state as props.

5. The root component becomes:
   ```tsx
   export default function App() {
     const nav = useNavigation();
     const workspace = useWorkspaceData();
     const modals = useModals();

     return (
       <NavigationShell currentPage={nav.currentPage} navigate={nav.navigate}>
         <PageRenderer page={nav.currentPage} data={workspace} modals={modals} />
       </NavigationShell>
     );
   }
   ```

**How to test:**
- Confirm the app compiles with no TypeScript errors.
- Navigate through all 9 pages — confirm they render correctly.
- Open each modal — confirm they open, submit, and close correctly.
- Run existing tests — confirm they still pass.

---

### CODE-02 · Rename "StarterV1" to a Real Product Name

**Priority:** 🔴 High

**Goal:**
`AIWorkHubAppStarterV1` communicates "unfinished prototype." A real product
name in the codebase signals ownership and intentionality. This costs 20
minutes and has outsized portfolio impact.

**Files likely affected:**
```
AIWorkHubAppStarterV1.tsx             (rename file + component)
app/layout.tsx                        (update title/metadata)
app/page.tsx                          (update import)
package.json                          (update "name" field)
README.md                             (update throughout)
```

**Implementation steps:**
1. Choose a name. Suggested options: `Hive`, `Command`, `Meridian`, `Axis`,
   `Baseship`. Pick one that feels right.
2. Rename `AIWorkHubAppStarterV1.tsx` to `[YourName]App.tsx`.
3. Update the component name inside the file.
4. Update `package.json` `"name"` field (lowercase, hyphenated).
5. Update `app/layout.tsx` `<title>` and metadata:
   ```tsx
   export const metadata: Metadata = {
     title: 'Hive — Your AI Work Hub',
     description: 'Unified command center for projects, tasks, and AI context.',
   };
   ```
6. Update all imports that reference the old filename.
7. Global find-and-replace for the old name string in README.

**How to test:**
- `grep -r "AIWorkHubAppStarterV1" .` — should return zero results.
- Confirm app builds and runs.
- Open browser — confirm page title shows the new name.

---

### CODE-03 · Add Prisma Database Indexes

**Priority:** 🔴 High

**Goal:**
Explicit indexes on foreign keys and the `externalId` field ensure queries
remain fast as data grows, and demonstrate database design awareness to
technical reviewers.

**Files likely affected:**
```
prisma/schema.prisma
```

**Implementation steps:**
1. Open `prisma/schema.prisma`.
2. Add `@@index` to every model that has foreign keys or is queried by
   a non-primary field:

   ```prisma
   model Task {
     // ...
     projectId String
     @@index([projectId])
     @@index([status])
     @@index([dueDate])
   }

   model Note {
     // ...
     projectId String
     @@index([projectId])
   }

   model FileRecord {
     // ...
     projectId String
     @@index([projectId])
   }

   model InboxItem {
     // ...
     externalId String?
     @@index([externalId])
   }

   model Event {
     // ...
     externalId String?
     @@index([externalId])
   }

   model AiOutput {
     // ...
     type      String
     targetId  String?
     @@index([type, targetId])
   }

   model AiExtraction {
     // ...
     noteId String
     @@index([noteId])
   }

   model AutomationRun {
     // ...
     createdAt DateTime
     @@index([createdAt])
   }
   ```

3. Generate and apply a migration:
   ```bash
   npx prisma migrate dev --name add_indexes
   ```

**How to test:**
- Run `npx prisma migrate dev` — confirm migration applies cleanly.
- Run `npx prisma studio` and confirm the new indexes appear.
- Alternatively, query `pg_indexes` in psql:
  `SELECT indexname FROM pg_indexes WHERE tablename = 'Task';`

---

### CODE-04 · Consistent TypeScript Types for API Responses

**Priority:** 🟡 Medium

**Goal:**
Define shared TypeScript interfaces for every API response shape. Currently,
response shapes are likely inferred from Prisma types, which leaks database
internals to the frontend and makes the codebase harder to refactor.

**Files likely affected:**
```
types/api.ts                          (create)
types/models.ts                       (create)
app/api/**/*.ts                       (update return types)
```

**Implementation steps:**
1. Create `types/models.ts` with clean frontend-facing types:
   ```ts
   export interface Project {
     id: string;
     name: string;
     status: ProjectStatus;
     priority: Priority;
     color: string;
     startDate: string | null;
     endDate: string | null;
     createdAt: string;
     updatedAt: string;
   }
   // ... Task, Note, InboxItem, Event, FileRecord, AiOutput
   ```
2. Create `types/api.ts` with the shared envelope:
   ```ts
   export interface ApiResponse<T> {
     data: T | null;
     meta?: Record<string, unknown>;
     error?: {
       code: string;
       message: string;
     };
   }
   ```
3. Update API route handlers to use `ApiResponse<T>` as the return type.
4. Update frontend fetch calls to use the typed response.
5. Use `satisfies` where helpful: `return { data: project } satisfies ApiResponse<Project>`.

**How to test:**
- Introduce a deliberate type mismatch in an API response — confirm TypeScript
  catches it at compile time.
- Run `tsc --noEmit` — confirm zero type errors.

---

### CODE-05 · Add JSDoc Comments to Non-Obvious API Routes

**Priority:** 🟢 Low

**Goal:**
Add a brief comment block at the top of each API route file explaining its
purpose, any non-obvious behavior, and the key design decisions. This
demonstrates code communication skills to reviewers.

**Files likely affected:**
```
app/api/automation/inbox-import/route.ts
app/api/automation/events-upsert/route.ts
app/api/ai/daily-brief/route.ts
app/api/auth/login/route.ts
lib/auth/session.ts                   (if exists)
```

**Implementation steps:**
For each file, add a block comment at the top:
```ts
/**
 * POST /api/automation/inbox-import
 *
 * Ingests items from n8n webhooks into the inbox. Deduplicates by
 * `externalId` — if an item with the same externalId already exists,
 * the request is acknowledged but no duplicate is created.
 *
 * Authentication: Bearer token via AUTOMATION_SECRET (bypasses session
 * gate by design — n8n workflows don't have session cookies).
 *
 * Logs every call to AutomationRun regardless of success/failure.
 */
```

Do not over-document obvious routes (GET /api/projects is self-explanatory).
Focus on: automation routes, AI routes, auth routes, and any route with
non-trivial business logic.

**How to test:**
- Code review / peer read — comments should answer "why" not "what."
- Confirm no comment contradicts the actual code behavior.

---

## 4. Performance Improvements

---

### PERF-01 · Paginate Task and Inbox Lists

**Priority:** 🟡 Medium

**Goal:**
Add `take` / `skip` pagination to the tasks and inbox API routes. Render
a "Load more" button in the UI. Prevents loading all records into memory
as data grows and demonstrates backend pagination pattern.

**Files likely affected:**
```
app/api/tasks/route.ts
app/api/inbox/route.ts
components/pages/TasksPage.tsx
components/pages/InboxPage.tsx
```

**Implementation steps:**
1. Update `GET /api/tasks` to accept `?page=1&limit=20` query params:
   ```ts
   const page = parseInt(searchParams.get('page') ?? '1');
   const limit = parseInt(searchParams.get('limit') ?? '20');
   const skip = (page - 1) * limit;

   const [tasks, total] = await prisma.$transaction([
     prisma.task.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
     prisma.task.count(),
   ]);

   return Response.json({
     data: tasks,
     meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
   });
   ```
2. Update `TasksPage.tsx` to track `page` state and append results on
   "Load more" click (not replace — append to the existing list).
3. Show "Load more" button only when `page < totalPages`.
4. Show "Showing X of Y tasks" above the list.
5. Repeat for `/api/inbox`.

**How to test:**
- Seed 50+ tasks.
- Load the tasks page — confirm only 20 are shown initially.
- Click "Load more" — confirm the next 20 append to the list.
- Confirm filters still work with pagination (reset to page 1 on filter change).

---

### PERF-02 · Stream the Daily Brief Response

**Priority:** 🟡 Medium

**Goal:**
The daily brief calls OpenAI and waits for the full response before returning
it to the client. This creates a perceived hang of several seconds. Streaming
the response token-by-token makes the UI feel significantly more responsive
and demonstrates knowledge of the OpenAI streaming API.

**Files likely affected:**
```
app/api/ai/daily-brief/route.ts
components/pages/HomePage.tsx         (brief display component)
```

**Implementation steps:**
1. Switch the OpenAI call to streaming mode:
   ```ts
   const stream = await openai.chat.completions.create({
     model: 'gpt-4.1-mini',
     messages: [...],
     stream: true,
   });
   ```
2. Return a `ReadableStream` from the API route:
   ```ts
   const readable = new ReadableStream({
     async start(controller) {
       for await (const chunk of stream) {
         const text = chunk.choices[0]?.delta?.content ?? '';
         controller.enqueue(new TextEncoder().encode(text));
       }
       // After streaming completes, persist the full text to AiOutput
       controller.close();
     }
   });
   return new Response(readable, {
     headers: { 'Content-Type': 'text/plain; charset=utf-8' }
   });
   ```
3. In `HomePage.tsx`, consume the stream:
   ```ts
   const response = await fetch('/api/ai/daily-brief', { method: 'POST' });
   const reader = response.body!.getReader();
   const decoder = new TextDecoder();
   while (true) {
     const { done, value } = await reader.read();
     if (done) break;
     setBriefText(prev => prev + decoder.decode(value));
   }
   ```
4. Note: persisting to `AiOutput` must happen server-side after the stream
   completes — accumulate the full text in the route handler, then write it
   to the database before closing the stream.

**How to test:**
- Trigger daily brief generation. Confirm text appears progressively rather
  than all at once.
- Confirm the final text is persisted to the `AiOutput` table.
- Confirm the persisted text matches what was streamed to the UI.

---

### PERF-03 · Optimistic UI Updates for Task Status Toggle

**Priority:** 🟡 Medium

**Goal:**
When a user toggles a task's status, the UI should update immediately and
reconcile with the server response — not wait for the API call to complete.
This is the most visible performance improvement for perceived responsiveness.

**Files likely affected:**
```
hooks/useWorkspaceData.ts             (after CODE-01 refactor)
components/pages/TasksPage.tsx
```

**Implementation steps:**
1. In the task update handler, apply the state change immediately before
   the API call:
   ```ts
   const handleToggleTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
     // 1. Optimistic update
     setTasks(prev => prev.map(t =>
       t.id === taskId ? { ...t, status: newStatus } : t
     ));

     // 2. API call
     const result = await fetch(`/api/tasks/${taskId}`, {
       method: 'PATCH',
       body: JSON.stringify({ status: newStatus }),
     }).then(r => r.json());

     // 3. Reconcile on failure
     if (result.error) {
       setTasks(prev => prev.map(t =>
         t.id === taskId ? { ...t, status: /* original */ } : t
       ));
       showToast('Failed to update task. Please try again.');
     }
   };
   ```
2. Store the original value before the optimistic update so you can roll back.
3. Apply the same pattern to inbox item conversion and project status changes.

**How to test:**
- Toggle a task status. Confirm the UI updates instantly (before API response).
- Simulate a network failure (DevTools → Network → Offline). Toggle a task —
  confirm it reverts to the original status and shows an error message.

---

## 5. Security Improvements

---

### SEC-01 · Harden Health Check to Verify Database Connectivity

**Priority:** 🔴 High

**Goal:**
`GET /api/health` currently confirms the app is running but not that the
database is reachable. A real health check must verify the database connection
so load balancers and uptime monitors can correctly identify degraded state.

**Files likely affected:**
```
app/api/health/route.ts
```

**Implementation steps:**
1. Update the health route:
   ```ts
   import { prisma } from '@/lib/prisma';

   export async function GET() {
     const start = Date.now();
     let dbStatus: 'connected' | 'unreachable' = 'unreachable';
     let dbLatencyMs: number | null = null;

     try {
       await prisma.$queryRaw`SELECT 1`;
       dbStatus = 'connected';
       dbLatencyMs = Date.now() - start;
     } catch {
       // db unreachable — continue to return degraded status
     }

     const healthy = dbStatus === 'connected';
     return Response.json(
       {
         data: {
           status: healthy ? 'ok' : 'degraded',
           db: dbStatus,
           dbLatencyMs,
           uptime: process.uptime(),
           timestamp: new Date().toISOString(),
         }
       },
       { status: healthy ? 200 : 503 }
     );
   }
   ```
2. Return `503` when the database is unreachable — monitoring tools check
   the HTTP status code, not the body.

**How to test:**
- With database running: `curl /api/health` → `{ status: "ok", db: "connected" }`
- Stop Postgres. `curl /api/health` → `{ status: "degraded", db: "unreachable" }`
  with HTTP 503.

---

### SEC-02 · Document CSRF Posture in README

**Priority:** 🟢 Low

**Goal:**
Add a Security section to the README that explains why `sameSite: lax` is
sufficient for the threat model. This demonstrates security thinking rather
than an oversight.

**Files likely affected:**
```
README.md
```

**Implementation steps:**
Add a `## Security` section to the README that explains:
- Session signing: HMAC-SHA256 via `crypto.subtle` (constant-time verify).
- Cookie flags: `httpOnly`, `sameSite: lax`, `secure` in production.
- CSRF posture: `sameSite: lax` blocks cross-site POST requests from third-party
  sites. Full `sameSite: strict` is not used because it blocks navigations from
  external links (e.g. clicking a GitHub link to the app). For a single-user
  passphrase-gated app with no high-value mutations accessible without login,
  lax is the right tradeoff.
- Automation routes: bypass session gate by design — protected by
  `AUTOMATION_SECRET` bearer token instead.
- No credentials in code: all secrets read from `process.env` only.

**How to test:**
- Peer review — the explanation should be accurate and concise.

---

### SEC-03 · Rate Limit Automation Endpoints

**Priority:** 🟢 Low

**Goal:**
The automation routes accept webhook payloads and bypass session auth.
Without rate limiting, they are open to payload flooding. A simple
in-memory rate limiter is sufficient for a single-server deployment.

**Files likely affected:**
```
lib/rateLimit.ts                      (create)
app/api/automation/inbox-import/route.ts
app/api/automation/events-upsert/route.ts
app/api/automation/files-upsert/route.ts
```

**Implementation steps:**
1. Create `lib/rateLimit.ts` — a simple sliding window counter:
   ```ts
   const requests = new Map<string, number[]>();

   export function rateLimit(key: string, limit: number, windowMs: number): boolean {
     const now = Date.now();
     const timestamps = (requests.get(key) ?? []).filter(t => t > now - windowMs);
     if (timestamps.length >= limit) return false;
     timestamps.push(now);
     requests.set(key, timestamps);
     return true;
   }
   ```
2. In each automation route, call before processing:
   ```ts
   const allowed = rateLimit('automation', 60, 60_000); // 60 req/min
   if (!allowed) {
     return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
   }
   ```
3. Note the in-memory approach resets on server restart — document this
   limitation in a code comment. For a deployed multi-instance setup,
   Redis would be needed.

**How to test:**
- Write a script that sends 70 requests to `/api/automation/inbox-import`
  in rapid succession (with the correct `AUTOMATION_SECRET`).
- Confirm requests 61–70 receive `429` responses.
- Wait 60 seconds — confirm requests succeed again.

---

## 6. Testing Improvements

---

### TEST-01 · Make Skipped DB Tests Visible

**Priority:** 🔴 High

**Goal:**
When `DATABASE_URL` is not set, 18 of 26 tests silently skip. A reviewer
running `npm test` for the first time sees partial results without knowing
they're partial. Make the skip explicit and visible.

**Files likely affected:**
```
tests/projects.test.ts
tests/tasks.test.ts
tests/notes.test.ts
tests/inbox.test.ts
vitest.config.ts                      (possibly)
```

**Implementation steps:**
1. Add a helper at the top of each DB test file:
   ```ts
   const DB_AVAILABLE = !!process.env.DATABASE_URL;

   if (!DB_AVAILABLE) {
     console.warn('\n⚠ DATABASE_URL not set — DB tests skipped. See README for setup.\n');
   }
   ```
2. Replace individual `skip` conditions with a `describe.skipIf`:
   ```ts
   describe.skipIf(!DB_AVAILABLE)('Projects API (requires DB)', () => {
     // ... existing tests
   });
   ```
3. Add a separate always-running test that prints setup instructions when
   the database is missing:
   ```ts
   test('database setup instructions', () => {
     if (!DB_AVAILABLE) {
       console.log('To run DB tests: copy .env.example to .env and set DATABASE_URL');
     }
     expect(true).toBe(true);
   });
   ```
4. Update README `## Running Tests` section with the full setup instructions.

**How to test:**
- Run `npm test` without `DATABASE_URL` — confirm the warning message
  appears and the skip reason is visible in output.
- Set `DATABASE_URL` and run again — confirm DB tests execute.

---

### TEST-02 · Add Frontend Component Tests

**Priority:** 🟡 Medium

**Goal:**
Add 4–5 React Testing Library tests covering the most important UI
interactions. The current suite tests only the API layer — technical
reviewers will notice the frontend is entirely untested.

**Files likely affected:**
```
tests/components/TaskFormModal.test.tsx    (create)
tests/components/EmptyState.test.tsx       (create)
tests/components/FilterBar.test.tsx        (create)
vitest.config.ts                           (add jsdom environment)
package.json                               (add @testing-library/react)
```

**Implementation steps:**
1. Install dependencies:
   ```bash
   npm install -D @testing-library/react @testing-library/user-event jsdom
   ```
2. Update `vitest.config.ts` to support jsdom:
   ```ts
   export default defineConfig({
     test: {
       environment: 'jsdom',
       setupFiles: ['./tests/setup.ts'],
     }
   });
   ```
3. Create `tests/setup.ts`:
   ```ts
   import '@testing-library/jest-dom';
   ```
4. Write `TaskFormModal.test.tsx`:
   ```tsx
   test('shows validation error when title is empty', async () => {
     const user = userEvent.setup();
     render(<TaskFormModal open={true} onClose={() => {}} onSave={() => {}} />);
     await user.click(screen.getByRole('button', { name: /save/i }));
     expect(screen.getByText('Title is required.')).toBeInTheDocument();
   });
   ```
5. Write `EmptyState.test.tsx` — confirm it renders title, description, CTA.
6. Write `FilterBar.test.tsx` — confirm onChange fires with correct values.
7. Mock `fetch` globally in `tests/setup.ts` using `vi.stubGlobal('fetch', ...)`.

**How to test:**
- Run `npm test` — confirm the new component tests run and pass.
- Deliberately break validation logic — confirm test catches the regression.

---

### TEST-03 · Add AI Route Tests with Mocked OpenAI

**Priority:** 🟡 Medium

**Goal:**
Test that AI routes call OpenAI with correct parameters and persist the
result to the `AiOutput` table. Demonstrates ability to test code with
external dependencies via mocking.

**Files likely affected:**
```
tests/ai-routes.test.ts               (create)
```

**Implementation steps:**
1. In the test file, mock the OpenAI client:
   ```ts
   vi.mock('openai', () => ({
     default: vi.fn().mockImplementation(() => ({
       chat: {
         completions: {
           create: vi.fn().mockResolvedValue({
             choices: [{ message: { content: 'Mocked AI brief content.' } }]
           })
         }
       }
     }))
   }));
   ```
2. Write a test for the daily brief route:
   ```ts
   test('POST /api/ai/daily-brief persists output', async () => {
     const response = await fetch('/api/ai/daily-brief', { method: 'POST' });
     const body = await response.json();

     expect(response.status).toBe(200);
     expect(body.data.content).toBe('Mocked AI brief content.');

     // Confirm it was persisted
     const stored = await prisma.aiOutput.findFirst({
       where: { type: 'DAILY_BRIEF' },
       orderBy: { createdAt: 'desc' }
     });
     expect(stored?.content).toBe('Mocked AI brief content.');
   });
   ```
3. Add a test for the missing-API-key error state:
   ```ts
   test('returns 503 when OPENAI_API_KEY is not set', async () => {
     const original = process.env.OPENAI_API_KEY;
     delete process.env.OPENAI_API_KEY;
     const response = await fetch('/api/ai/daily-brief', { method: 'POST' });
     expect(response.status).toBe(503);
     process.env.OPENAI_API_KEY = original;
   });
   ```

**How to test:**
- Run `npm test tests/ai-routes.test.ts` — confirm both tests pass.
- Remove the mock — confirm the test fails (proves mock is actually working).

---

## 7. Documentation Improvements

---

### DOCS-01 · Full README Overhaul

**Priority:** 🔴 High

**Goal:**
The README is the front door to the project. It must tell the product story,
explain the architecture, document setup, and demonstrate your thinking —
not just list commands to run.

**Files likely affected:**
```
README.md
```

**Implementation steps:**
Write a README with these exact sections in this order:

1. **Project name + tagline** (1 line)
   > Hive — Unified AI-powered command center for solo knowledge workers.

2. **Live demo link** (once deployed)
   > [Live Demo](https://your-app.vercel.app) · [Demo credentials: passphrase = `demo`]

3. **Screenshot or GIF** (2–3 images of the app with real data visible)

4. **What this is** (2–3 paragraphs)
   - The product story / pipeline: external trigger → inbox → triage → AI context → action
   - Who it's for and why it's not a generic CRUD app

5. **Tech stack table** (already have this — include it)

6. **Architecture** (the pipeline as a diagram or bullet flow)

7. **Key design decisions** (this is the most important section for portfolio)
   - Why HMAC-SHA256 sessions instead of a library
   - Why the `externalId` deduplication pattern for automation
   - Why `useMemo` client-side search for a single-user app
   - Why OpenAI is optional and how the fallback works

8. **Local development setup**
   - Prerequisites (Node 22, Postgres)
   - Step-by-step from clone to running app
   - All environment variables documented with descriptions

9. **Running tests**
   - How to set up the test database
   - Which tests require DB and which don't

10. **Known limitations** (your honest gaps table — reviewers respect honesty)

11. **Security** (from SEC-02 above)

**How to test:**
- Ask someone unfamiliar with the project to follow the README setup
  steps from scratch. Note every point of confusion.
- Confirm the demo link works and the credentials are correct.

---

### DOCS-02 · `.env.example` with Descriptions for Every Variable

**Priority:** 🔴 High

**Goal:**
A complete, annotated `.env.example` is the fastest way for anyone to get
the app running. Every environment variable should be documented with its
purpose and whether it's required or optional.

**Files likely affected:**
```
.env.example                          (create or update)
```

**Implementation steps:**
```bash
# ─── Database ───────────────────────────────────────────────────────────────
# Required. PostgreSQL connection string.
# Format: postgresql://user:password@host:port/dbname
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_work_hub"

# ─── Auth ────────────────────────────────────────────────────────────────────
# Required. Passphrase for accessing the workspace. Can be any string.
WORKSPACE_PASSPHRASE="your-passphrase-here"

# Required. Secret used to sign session cookies (HMAC-SHA256).
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET="your-64-char-hex-secret-here"

# ─── AI ──────────────────────────────────────────────────────────────────────
# Optional. Required to use AI features (daily brief, project summaries,
# copilot, task extraction). If omitted, AI routes return a graceful error.
OPENAI_API_KEY="sk-..."

# ─── Automation ──────────────────────────────────────────────────────────────
# Required for n8n webhook endpoints. Set this in your n8n workflow's
# Authorization header as: Bearer <value>
AUTOMATION_SECRET="your-automation-secret-here"

# ─── App ─────────────────────────────────────────────────────────────────────
# Optional. Set to "true" to return fixture AI outputs instead of calling
# OpenAI. Useful for demos without an API key.
DEMO_MODE="false"

# Optional. Set to "production" in deployed environments.
NODE_ENV="development"
```

**How to test:**
- Delete `.env`. Copy `.env.example` to `.env`. Fill in only the required
  variables. Confirm the app starts and non-AI features work.
- Confirm AI features show the correct error state when `OPENAI_API_KEY` is absent.

---

## 8. Deployment Improvements

---

### DEPLOY-01 · Docker Compose for Local Development

**Priority:** 🔴 High

**Goal:**
A `docker-compose.yml` that spins up the Next.js app and a Postgres container
turns "how do I run this?" into a single command. This is the most impactful
deployment improvement for developer experience.

**Files likely affected:**
```
docker-compose.yml                    (create)
Dockerfile                            (create)
.dockerignore                         (create)
```

**Implementation steps:**
1. Create `Dockerfile`:
   ```dockerfile
   FROM node:22-alpine AS base
   WORKDIR /app

   FROM base AS deps
   COPY package*.json ./
   RUN npm ci

   FROM base AS builder
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npx prisma generate
   RUN npm run build

   FROM base AS runner
   ENV NODE_ENV=production
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   COPY --from=builder /app/public ./public
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. Create `docker-compose.yml`:
   ```yaml
   version: '3.9'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         DATABASE_URL: postgresql://postgres:password@db:5432/ai_work_hub
         WORKSPACE_PASSPHRASE: ${WORKSPACE_PASSPHRASE:-demo}
         SESSION_SECRET: ${SESSION_SECRET}
         OPENAI_API_KEY: ${OPENAI_API_KEY:-}
         AUTOMATION_SECRET: ${AUTOMATION_SECRET:-dev-secret}
       depends_on:
         db:
           condition: service_healthy

     db:
       image: postgres:16-alpine
       environment:
         POSTGRES_DB: ai_work_hub
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: password
       volumes:
         - pgdata:/var/lib/postgresql/data
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U postgres"]
         interval: 5s
         timeout: 5s
         retries: 5

   volumes:
     pgdata:
   ```

3. Create `.dockerignore`:
   ```
   node_modules
   .next
   .env
   .git
   ```

4. Add a `compose` script to `package.json`:
   ```json
   "docker:up": "docker compose up --build",
   "docker:migrate": "docker compose exec app npx prisma migrate deploy",
   "docker:seed": "docker compose exec app npx prisma db seed"
   ```

5. Document the full flow in README:
   ```bash
   cp .env.example .env   # fill in SESSION_SECRET minimum
   npm run docker:up
   npm run docker:migrate
   npm run docker:seed
   # App available at http://localhost:3000
   ```

**How to test:**
- Run `docker compose up --build` from a clean checkout (no `.env`, no
  local node_modules). App should be accessible at `localhost:3000`.
- Run `docker compose down -v` and repeat — confirm idempotent setup.

---

### DEPLOY-02 · Deploy to Vercel + Supabase

**Priority:** 🔴 High

**Goal:**
A live URL transforms this from "a project I built" to "a product you can
try." Vercel + Supabase is the zero-cost, zero-ops path for a Next.js + Postgres app.

**Files likely affected:**
```
vercel.json                           (create if needed)
README.md                             (add live URL)
```

**Implementation steps:**
1. Create a free Supabase project at supabase.com. Copy the connection string
   from Settings → Database → Connection string → URI.
2. In Vercel, import the GitHub repo. Set environment variables:
   - `DATABASE_URL` = Supabase connection string (use pooler URL for Vercel)
   - `WORKSPACE_PASSPHRASE`, `SESSION_SECRET`, `AUTOMATION_SECRET`
   - `OPENAI_API_KEY` (optional — set to enable AI in demo)
3. In the Vercel build settings, add a post-build command:
   ```
   npx prisma migrate deploy && npx prisma db seed
   ```
   Or run migrations separately via Supabase SQL editor.
4. Deploy. Note: Supabase's free tier requires `?pgbouncer=true` and
   `connection_limit=1` on the DATABASE_URL for serverless compatibility:
   ```
   postgresql://...@pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
   ```
5. Verify all routes work in the deployed environment.
6. Add the live URL prominently to the README.

**How to test:**
- Open the Vercel URL — confirm the login page loads.
- Log in with the passphrase — confirm dashboard loads with seed data.
- Test AI features if key is set — confirm they work in production.
- Check Vercel logs for any runtime errors.

---

## 9. Portfolio & Competition Improvements

---

### PORT-01 · 90-Second Demo Script

**Priority:** 🔴 High

**Goal:**
Define and rehearse a specific 90-second demo flow that showcases the core
product story: external data → inbox → triage → AI context → action. Any
reviewer should be able to follow the "wow moment" without explanation.

**Files likely affected:**
```
DEMO_SCRIPT.md                        (create)
```

**Implementation steps:**
1. Create `DEMO_SCRIPT.md` with the following flow:

   **Step 1 (0–15s): Dashboard**
   - Open the app. Show the dashboard with seed data: active projects,
     upcoming tasks, the daily brief already generated.
   - Point out: "This is the current state of my work — one view."

   **Step 2 (15–35s): Inbox item arrives**
   - Show an inbox item (seeded) that came in from an n8n webhook — an email
     summary or a file notification.
   - Click "Convert to task" — show it appear in the tasks list.
   - "This is what external automation feeding the inbox looks like."

   **Step 3 (35–60s): Project AI context**
   - Open "Product Launch Q3" project.
   - Show the AI-generated project summary — tasks breakdown, next recommended
     action, blockers.
   - "The AI has read all the tasks and notes for this project and synthesized
     what matters."

   **Step 4 (60–90s): Copilot**
   - Open the Copilot page. Type: "What should I focus on today?"
   - Show the response that references real project names and tasks from the db.
   - "The copilot has access to all workspace data — it's not a generic chat."

2. Rehearse this flow 3 times with the live or local seeded app. It should
   run in under 90 seconds without fumbling.

3. Record a screen capture of the demo flow for the README GIF.

**How to test:**
- Run the demo cold (no setup time, app already open) — it should land in
  under 90 seconds.
- Show it to someone unfamiliar with the app — confirm they understand the
  value proposition without verbal explanation.

---

### PORT-02 · `DEMO_MODE` Flag for Public Demos

**Priority:** 🟡 Medium

**Goal:**
Add a `DEMO_MODE=true` environment variable that returns pre-generated,
realistic AI outputs from static fixture files instead of calling OpenAI.
This enables a compelling public demo without burning API credits or
exposing an API key.

**Files likely affected:**
```
lib/ai/demoFixtures.ts                (create)
app/api/ai/daily-brief/route.ts
app/api/ai/projects/[id]/summary/route.ts
app/api/ai/copilot/route.ts
.env.example                          (document DEMO_MODE)
```

**Implementation steps:**
1. Create `lib/ai/demoFixtures.ts` with realistic pre-written AI outputs:
   ```ts
   export const DEMO_DAILY_BRIEF = `
   Good morning. You have 3 high-priority tasks due this week across
   2 active projects. The Product Launch Q3 project has a blocker —
   the design assets haven't been uploaded yet. Engineering Hiring
   is on track with 2 interviews scheduled for Thursday.
   Recommended focus: unblock the design assets first, then review
   the interview scorecard templates before Thursday.
   `;

   export const DEMO_COPILOT_RESPONSE = `
   Based on your current workspace, here's what I'd prioritize today:
   1. The design assets for Product Launch Q3 are blocking 3 downstream tasks.
   2. You have 2 tasks due tomorrow that are still in "todo" status.
   3. There are 4 inbox items from this morning that haven't been triaged.
   Start with the design assets — it unblocks the most work.
   `;
   ```

2. In each AI route, check the flag before calling OpenAI:
   ```ts
   if (process.env.DEMO_MODE === 'true') {
     await new Promise(r => setTimeout(r, 800)); // simulate latency
     return Response.json({ data: { content: DEMO_DAILY_BRIEF } });
   }
   ```

3. Set `DEMO_MODE=true` in the Vercel environment for the public demo.

**How to test:**
- Set `DEMO_MODE=true` in `.env`. Trigger all AI features — confirm fixture
  content is returned without calling OpenAI.
- Unset `DEMO_MODE` — confirm real OpenAI calls resume.

---

### PORT-03 · README Screenshots and GIF

**Priority:** 🔴 High

**Goal:**
Add 2–3 screenshots and one 30-second GIF to the README. Projects with
visuals get dramatically more engagement from hiring managers and on GitHub.

**Files likely affected:**
```
docs/screenshots/dashboard.png        (capture)
docs/screenshots/project-detail.png   (capture)
docs/screenshots/copilot.png          (capture)
docs/demo.gif                         (record)
README.md                             (embed)
```

**Implementation steps:**
1. Ensure seed data is populated and the app looks good.
2. Take screenshots of:
   - The dashboard (homepage with stats, brief, and upcoming tasks visible)
   - A project detail page with an AI summary rendered
   - The Copilot page with a multi-turn conversation
3. Record a 30-second GIF using LICEcap (Mac/Windows free) or Kap (Mac):
   - Show: dashboard → inbox item → convert to task → copilot response.
   - Keep the window at a fixed size for consistent framing.
4. Compress images: run through `squoosh.app` or `imageoptim`.
5. Add to README:
   ```markdown
   ![Dashboard](docs/screenshots/dashboard.png)
   ![AI Project Summary](docs/screenshots/project-detail.png)

   > 30-second demo:
   ![Demo GIF](docs/demo.gif)
   ```

**How to test:**
- View the README on GitHub — confirm images render at a readable size.
- Confirm GIF plays automatically in the GitHub README preview.
- Confirm total image size is under 5MB for fast loading.

---

## 10. Optional Future Features

These are genuine product improvements worth building — but only after the
above items are complete. Do not start these until the project is deployed
and demonstrable.

---

### FUTURE-01 · URL-Based Routing

Replace `useState` navigation with Next.js `useRouter` + `usePathname`.
Each page maps to a URL segment. Back button and deep links work correctly.
**Difficulty:** Medium. **Value:** High for portfolio (demonstrates Next.js routing).

---

### FUTURE-02 · Markdown Rendering for Notes

Add `react-markdown` to render note body content. Keep `<textarea>` for
editing. A toggle button switches between edit and preview modes.
**Difficulty:** Easy. **Value:** Makes notes feel like a real feature.

---

### FUTURE-03 · Calendar Grid View

Replace the events list with a CSS Grid-based weekly or monthly calendar.
Each cell shows event pills. No library needed — 7-column grid, `Date`
arithmetic for week boundaries.
**Difficulty:** Medium. **Value:** High visual impact for demos.

---

### FUTURE-04 · Task Dependency / Blocking Relationships

Add a `blockedBy` self-relation on `Task`. Show a "blocked by" indicator
on tasks with unresolved dependencies. Let the AI copilot reason about
blocking chains.
**Difficulty:** Hard. **Value:** Differentiates from simple task managers.

---

### FUTURE-05 · n8n Workflow Templates

Export your working n8n workflow JSONs to the repo under `docs/n8n/`.
Include setup instructions. This turns the automation story from
"it supports n8n" to "here are the actual workflows I built."
**Difficulty:** Easy. **Value:** Very high for portfolio — makes the automation
integration concrete and reproducible.

---

### FUTURE-06 · AI Extraction Accept/Reject Workflow UI

The `AiExtraction` model and `/api/ai/extractions/[id]/accept` route exist —
but the UI workflow for reviewing and accepting extracted tasks from notes
may not be surfaced clearly. Build a dedicated review panel for this flow.
**Difficulty:** Medium. **Value:** Demonstrates the full AI pipeline end-to-end.

---

## Summary

| Category | Tasks | High Priority |
|---|---|---|
| Must-fix | 6 | 6 |
| UI/UX polish | 6 | 3 |
| Code quality | 5 | 3 |
| Performance | 3 | 0 |
| Security | 3 | 1 |
| Testing | 3 | 1 |
| Documentation | 2 | 2 |
| Deployment | 2 | 2 |
| Portfolio | 3 | 2 |
| Optional future | 6 | — |
| **Total** | **39** | **20** |

**Recommended order of attack:**
1. MUST-01 through MUST-06 (foundation — data, errors, stability)
2. PORT-03, DOCS-01, DOCS-02 (make it presentable online)
3. DEPLOY-01, DEPLOY-02 (get a live URL)
4. CODE-01, CODE-02 (refactor before a technical interview)
5. UX-01, UX-02, UX-03 (polish pass)
6. Everything else in priority order
