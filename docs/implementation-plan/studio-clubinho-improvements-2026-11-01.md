# Studio Clubinho — frontend implementation plan, 2026-11-01

Status: implementado (pacotes FE01–FE09) e complementado pelas correções de 2026-11-10. Este documento é histórico; a referência vigente do contrato é `clubinhonib-api/docs/api-ai-lessons.md`.

Baseline: frontend HEAD `48016ec`; backend HEAD `4031642` plus its existing local changes. This is a new assessment of the current working trees. The [October plan](estudio-clubinho-improvements-implementation-plan.md) remains historical evidence; its completed frontend work must not be implemented again.

Related artifacts:

- [Integrated audit, findings A01–A14 and verification evidence](../../../output/analysis/studio-clubinho-audit-2026-11-01.md).
- [Coordinated backend plan](../../../clubinhonib-api/docs/implementation-plan/studio-clubinho-improvements-2026-11-01.md).
- [Current content contracts](../content_materials.md), [frontend standards](../CLUBINHO_FRONTEND_BEST_PRACTICES.md), [architecture](../project_structure.md).

## Intended outcome

An administrator edits one canonical version, sees every deliverable during review, approves exactly the version displayed, receives accurate operation feedback, and can recover from connection/process failures without losing local work. Personal preferences must not cross login sessions. Improvements must preserve the existing eight products, editorial rules and the distinction between creating weekly materials and setting the current week.

## Baseline to preserve

- Existing Axios instance, authentication/refresh and public error pipeline.
- TanStack Query for server data; one local draft per lesson/stage with the original `lockVersion`.
- Typing during save and immutable acknowledgement of only the submitted draft.
- Existing production/review state policy, including mixed reviewed/producer-approved items after corrections.
- Existing isolated meditation editors, shared manual-work preview and story carousel.
- Explicit preserve/replace/remove credential controls and public provider response adapters.
- Existing route guards, mobile layouts, stable test IDs and safe PDF Blob handling.

No new role, automatic publication, automatic paid generation, universal autosave, archive endpoint or replacement editor is part of this plan.

## Delivery map

| Package | Priority / size | Findings | Dependency |
| --- | --- | --- | --- |
| FE01 — complementary prompts | P2 / S | A07 | Existing API; BE06 for concurrency/reset follow-up |
| FE02 — complete review viewer | P1 / M | A03, A01 | Existing preview API; BE03/BE04 for canonical/version guarantees |
| FE03 — version-bound review actions | P1 / M | A02, A10 | BE04 action DTO and conflict contract |
| FE04 — session-scoped cache | P2 / M | A09 | Existing authenticated identity |
| FE05 — correction workspace | P2 / M | A01, A10; feedback usability | FE02/FE03 and existing comments |
| FE06 — bounded updates | P2 / M | A12 | First step independent; compact response step needs BE08 |
| FE07 — publication state and recovery feedback | P1 / M | A05 | BE05 recovery semantics |
| FE08 — precise forms and model feedback | P2 / M | A14; boundary validation | BE09 metadata; BE10 validation |
| FE09 — extraction, loading and regression gates | P2 / M | Maintainability / coverage | Incremental alongside previous packages |

S = one focused change; M = coordinated feature components/contracts/tests. These are relative scope labels, not calendar estimates.

## FE01 — edit only the administrator's complementary prompt

Files: [AdminPromptSettingsPage.tsx](../../src/pages/admin/ai-lessons/AdminPromptSettingsPage.tsx), [drafts.ts](../../src/features/ai-lessons/drafts.ts), [types.ts](../../src/features/ai-lessons/types.ts), [aiLessonsService.ts](../../src/services/aiLessonsService.ts).

Implementation:

1. Initialize the editable value from `customPrompt ?? ''`. Show `basePrompt` and the effective preview in read-only areas.
2. Presets append to the complementary draft, never to `effectivePrompt`.
3. Validate the trimmed complementary text against the existing 10–12,000-character contract. Empty input uses the explicit reset path rather than pretending that an empty save is valid.
4. Keep the original preference/lock while editing. Preserve other stages and subsequent typing after a save.
5. When BE06 is delivered, include the observed lock in reset as well as save; handle 409 without discarding text.
6. Do not automatically strip the official base from historical custom text. Flag suspected duplication and provide an inspectable correction; avoid rewriting user instructions from heuristic matching.

Acceptance:

- The current 19,545-character official lesson base does not occupy the editable field or prevent a short personalization.
- Two saves and a preset retain one official base in the effective prompt and exactly the intended complementary text.
- The save button rejects over-limit programmatic values as well as keyboard input.
- Save/reset of one stage preserves another dirty stage; conflict preserves the local draft.

Tests: extend `e2e/unit/studio-drafts.spec.ts`; extend the prompt case in `e2e/flows/studio-integrity.spec.ts` to inspect the actual payload, then reread the API response. Cover reset with no customization, API failure and concurrent reset/save.

## FE02 — display the complete product in final review

Files: [LessonReviewDetailPage.tsx](../../src/pages/admin/ai-lessons/LessonReviewDetailPage.tsx), [LessonDraftDetailPage.tsx](../../src/pages/admin/ai-lessons/LessonDraftDetailPage.tsx), `src/features/ai-lessons/components/`, existing meditation/manual previews and `useLessonPdfPreview.ts`.

Implementation:

1. Extract a typed stage-content viewer from the current production rendering. Keep commands and edit permissions outside the viewer.
2. Render stage 2 as its scene carousel; stages 3 and 5 as text plus instructional images/captions; stage 4 as all verse cards, including the reference card; stages 6–8 with the existing specialized components.
3. Do not render a redundant empty text sheet for image-only products.
4. Expose PDF preview in review for all eight items, reusing the existing Blob lifecycle and error helper. When BE04 provides a version precondition, bind preview requests to that observed version/lock.
5. Show missing/broken media distinctly. Structural incompleteness must be rejected by the backend; the UI also disables approval when the returned required asset structure is incomplete.
6. On remote version change, close the old preview and identify the new version; never label an old PDF as the new version's preview.

Acceptance:

- All expected assets of items 3, 4 and 5 are visible in final review, in source order, with useful alt text and captions.
- Item 4's final reference card is present; game captions match the canonical edited instructions returned by BE03.
- Read-only review produces no dirty draft and no edit mutation.
- Loading, empty, missing asset, 422 PDF failure and late PDF response have clear states.
- At 360 and 1440 pixels, keyboard navigation and 44-pixel touch targets work without page-level horizontal overflow; deliberate paper scrolling stays contained.

Tests: a new focused review-viewer browser spec with fixtures for all eight stage types; verify network payload and currentVersionId, not merely component existence. Preserve meditation/editor formatting regressions. Screenshot inspection must use a connected browser and is still outstanding in this analysis.

## FE03 — bind decisions to the observed stage lock

Files: `features/ai-lessons/types.ts`, `workflow.ts`, `review-actions.ts`, `src/services/aiLessonsService.ts`, `src/hooks/api/useAiLessons.ts`, both detail pages.

Proposed contract, coordinated with BE04: completion, approval and request-changes bodies include the **existing stage `lockVersion`** as a new required request property. This plan does not add a second database version column.

Implementation:

1. Capture the lock from the content actually rendered when the action is issued; keep the target lesson/stage immutable through the mutation.
2. On 409, invalidate/refetch that detail, explain that the item changed and preserve unsent feedback. Require a deliberate new action after the refreshed content is visible.
3. Subscribe the review workspace to the bounded update mechanism from FE06, including denial/reconnection feedback. Updates improve freshness; they do not replace the server precondition.
4. Apply busy-state rules consistently while another session generates or publishes. Avoid optimistic approval/publication.
5. Add the lock to production completion too, so an older session cannot conclude a newly saved version unintentionally.

Acceptance: reviewer A sees version N; B returns/edits/resubmits N+1; A's old action receives 409 and cannot approve N+1. The same scenario must be covered for request-changes and completion. Feedback survives conflict; published content remains read-only.

Compatibility: an old server rejects unknown DTO properties. Deliver the server's additive support first, then this client, then enforce the precondition server-side after old-client compatibility is retired. A permissive transition is not the final safety guarantee. Record and test the rollout contract explicitly.

## FE04 — isolate cache by authenticated identity

Files: `features/ai-lessons/queryKeys.ts`, `src/hooks/api/useAiLessons.ts`, prompt page, `src/config/queryClient.ts`, authentication transition wiring around `src/main.tsx`/`App.tsx`.

Implementation:

1. Include authenticated user/session identity in keys for `/me` preferences; scope Studio requests and subscriptions consistently.
2. Clear/cancel relevant queries and mutations when identity changes. Keep reducers pure; perform cache effects in the existing application lifecycle or a dedicated session-boundary component.
3. Pass cancellation signals to supported requests and prevent old-identity callbacks from writing current-identity keys.
4. Keep provider credentials transient and out of persisted cache. Do not persist lesson drafts as a side effect of this package.

Acceptance: administrator A logs out and B logs in without a full reload; B never sees or submits A's prompt. Cover an old request completing after the identity change, refresh failure/logout, and two independently authenticated browser contexts.

Tests: pure key builders in unit tests; a browser/API session-transition test. Query freshness alone is not an isolation mechanism.

## FE05 — make returned work actionable in production

Files: both detail pages, `useLessonLocalDrafts.ts`, `useStudioUnsavedChanges.ts`, stage action components/types.

Implementation:

- Show the existing comments for the selected stage beside its production editor, with available timestamps. Treat them as history until an explicit resolution API exists; do not invent a local resolved state.
- Scope generation instructions and unsent review feedback by lesson/stage. Reset scoped UI when the lesson identity changes.
- Protect unsent review feedback on internal navigation, browser back/forward and refresh, using the existing shared guard.
- Distinguish local dirty text, remote version changes and server-invalidated downstream material.
- Explain how a producer can correct stale material; retain server-owned invalidation and mixed review rules.
- Surface structural validation errors from BE03/BE10 without replacing the editor contents. Keep discard explicit.

Acceptance: returning item 4 shows its feedback when production opens item 4; instructions for item 1 do not silently apply to item 7; a stale server response never destroys local edits. No new comment-resolution/archiving operation is assumed.

## FE06 — bound stream lifetime and reduce redundant work

Files: `features/ai-lessons/stream.ts`, `constants.ts`, `types.ts`, `src/hooks/api/useAiLessons.ts` and transport tests.

First delivery, without server protocol change:

- Rotate XHR connections at bounded duration/received bytes so `responseText` cannot grow for an entire work session.
- Preserve authenticated Axios transport, one active subscription per target, cancellation, 401 refresh, final denial and EOF reconnect behavior.
- Make intentional rotation distinct from a displayed outage. Preserve local drafts and mutation state across rotation.
- Record bytes, snapshots and connection duration; avoid logging content.

Second delivery with BE08:

- Request the documented compact snapshot option and use heartbeat events when content is unchanged.
- Adapt the watchdog to heartbeats without treating them as lesson payloads.
- Deduplicate unchanged visible state and prevent older responses from undoing acknowledged mutations using the agreed snapshot contract.
- Fetch history only through the agreed contract if a history interface is added; do not silently remove server history.

Acceptance: a controlled long session crosses multiple rotation boundaries with bounded response buffers, no missing terminal state and no lost draft. Report before/after payload size, update count and browser memory for identical fixtures. Initial thresholds are implementation tuning values, not claimed production SLAs.

## FE07 — show publication progress and a recoverable outcome

Files: `constants.ts`, `listConstants.ts`, review list/detail, hooks and response types.

Implementation:

1. Include `PUBLISHING` in the review queue/status presentation so an in-flight lesson does not disappear.
2. On active publication, show progress/state without enabling duplicate submission. A timeout/connection loss triggers a status reconciliation read, not a blind repeat POST.
3. With BE05, render the documented active/recovering/failed/completed result using its actual response shape. Do not fabricate a recovery endpoint or operation ID before it is implemented.
4. Refresh related lesson lists/dashboard and weekly-material queries after confirmed success; link to the created material using existing routes.
5. Preserve the distinction between “material created” and “current week selected”.

Acceptance: close/reopen during publication and recover the resulting state; an interrupted request that later succeeds shows one material; a recoverable failure permits only the backend-supported next action. Existing successful publications keep their original link.

## FE08 — match validation and provider feedback to the server

Files: `LessonAiGenerateModal.tsx`, prompt/review forms, `features/ai-providers/{types,api,hooks,utils,AiProvidersConfigPage}.ts[x]`.

Implementation:

- Align trimmed theme/reference lengths, integer week and action-note limits with DTOs. Do not invent a week maximum absent from the API.
- Keep create modal open during a pending mutation, including backdrop/Escape handling; handle late results consistently.
- Validate visual quantity 4–10 and all required options before sending.
- Consume BE09 catalog metadata: live result, configured fallback or static defaults. Describe fallback accurately in Portuguese and preserve previous useful values on failure.
- Keep key replacement/removal semantics and mutation cleanup; never send stored keys in a query string or persist typed keys.
- Replace implementation details such as HTTP endpoint names in ordinary product copy with useful user guidance.

Acceptance: boundary values have field-specific feedback; no valid UI flow sends null to `.trim()` paths; a failed upstream model lookup cannot display “live consultation succeeded”; Gemini's static list is labeled as such until a real lookup is implemented.

## FE09 — extract responsibilities and verify the complete flow

Move domain API/hooks gradually into `features/ai-lessons`, preserving compatibility re-exports. Extract the stage viewer, action toolbar, feedback panel and status handling while touching their corresponding packages. Keep types/constants/helpers in dedicated files. Do not split files solely to meet a line-count target.

Lazy-load genuinely heavy Studio routes/editors from `App.tsx`; compare the resulting initial/admin bundles. The baseline's 3.69 MB main chunk belongs to the entire application, so measure attribution before setting a Studio budget. Preserve guard, deep-link and refresh behavior.

Update `docs/content_materials.md`, `components.md`, `project_structure.md` and API integration notes only as implemented behavior changes. Avoid rewriting unrelated documentation. Add stable test IDs to every new/edited component and ambiguous action.

## Cross-repository sequence

1. BE01/BE02 protect assets; FE01 and FE02 can start independently using current read APIs.
2. BE03 establishes canonical edited data; FE02/FE05 consume that result without duplicating backend transformations.
3. BE04 and FE03 ship the action precondition through a documented compatible rollout.
4. BE06 plus FE01/FE04 complete prompt/session integrity.
5. BE05 plus FE07 address publication recovery and visibility.
6. BE07–BE09 plus FE06/FE08 improve operation stability and efficiency.
7. FE09 extraction and tests accompany these deliveries; they are not a prerequisite for urgent fixes.

## Verification and completion criteria

Baseline executed: 49 focused unit tests passed; frontend type-check, scoped lint, 571-root test-ID check and Vite build passed. Browser checks were not executed because no browser was connected. The evidence is recorded in the integrated audit.

For each implemented package:

```bash
npm run type-check
npm run check:test-ids
npm run test:unit -- e2e/unit/studio- e2e/unit/lesson-review e2e/unit/ai-provider
npm run build
```

Run scoped ESLint without `--fix`, plus the repository's required checks appropriate to the final diff. Run the relevant browser specs against local fixture data only. Their setup alters email feature flags; inspect that setup before execution and preserve the documented restoration behavior. No production fixtures or paid generation are required.

Completion means the original failing scenario is covered, the coordinated contract is implemented, mobile/keyboard behavior is inspected, failures preserve local work, and the final diff contains only the intended change. Unit-test success is not a substitute for the pending browser/HTTP acceptance cases.
