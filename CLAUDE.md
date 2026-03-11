# CLAUDE.md — N-Word Redactor Chrome Extension

## Project Overview

This is a Chrome browser extension that automatically redacts a specific racial
epithet from web page content. It is a small, focused vanilla JavaScript project
with no build tooling or external dependencies.

- **Name**: N-Word Redactor
- **Version**: 0.0.1
- **Manifest Version**: 2 (Manifest V2 — deprecated; a future migration to V3 may be warranted)
- **Language**: JavaScript (ES6)
- **Runtime**: Browser (Chrome content script)

---

## Repository Structure

```
nword/
├── .gitignore                          # Ignores .DS_Store (macOS metadata)
├── README.md                           # Empty (no content yet)
├── CLAUDE.md                           # This file
├── chrome_extension/
│   ├── manifest.json                   # Chrome extension manifest
│   └── nword.js                        # Core content script logic (29 lines)
└── tests/
    └── unittest_chrome_extension.html  # Manual browser-based test suite (111 lines)
```

---

## Core Source Files

### `chrome_extension/manifest.json`

Defines the Chrome extension metadata:
- Matches all HTTP/HTTPS URLs and local `file://` URLs
- Runs across all frames (`all_frames: true`)
- Injects `nword.js` after the document has fully loaded (`document_idle`)

### `chrome_extension/nword.js`

The sole content script. Key elements:

- **`nwordRegex`**: A compiled `RegExp` that matches the target slur and its common
  variants, using three named capture groups:
  1. The leading `n`/`N` character
  2. The core stem (`igg` or `ig(g)` literal)
  3. A suffix group with a negative lookahead to avoid matching "niggardly"
- **`findAndUpdateTextNodes()`**: Walks the full DOM via `querySelectorAll('*')`,
  inspects each child text node (`nodeType === 3`), and replaces matches in place.
- **`getRedactedValue(value)`**: Applies the regex replacement, preserving the
  initial letter's case and suffix via capture groups (`$1+++$3`).
- Executes on `window.onload`.

**Regex design note**: The pattern uses `(?!rd)` after the `a` suffix branch as a
negative lookahead to prevent "niggardly" (a legitimate English word) from being
redacted when it appears alone.

---

## Testing

There is **no automated test runner**. Tests are run manually in a browser:

1. Open `tests/unittest_chrome_extension.html` directly in Chrome (or any browser).
2. The `window.onload` handler iterates over all test functions and runs them.
3. Results appear both in the DOM (pass/fail labels) and in the browser console.

### Test Coverage (8 tests)

| Test | Scenario |
|------|----------|
| testOne | Basic lowercase match (`nigga` → `n+++a`) |
| testTwo | Uppercase leading letter (`Niggaz Wit Attitudes`) |
| testThree | Embedded in a longer string |
| testFour | All-caps variant (`NIGGA`) |
| testFive | "Niggardly" is **not** redacted; other variants in same string are |
| testSix | Distinguishes `nigga` vs `nigger` in a single string |
| testSeven | Alternate spellings (`niggah`, `nigguh`) |
| testEight | Alternate stem spelling `nig(g)er` |

**Important test convention**: Test strings are constructed by replacing the
placeholder `_STR_` with the offensive stem at runtime. This avoids storing the
literal word in the source. Maintain this convention when adding new tests.

---

## Development Workflow

### Loading the Extension in Chrome

1. Navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked** and select the `chrome_extension/` directory
4. After editing `nword.js`, click the refresh icon on the extension card

### Running Tests

Open `tests/unittest_chrome_extension.html` in a browser. No server required —
the test file uses a relative path (`../chrome_extension/nword.js`) so it works
from the local filesystem.

### No Build Step

There is no compilation, bundling, or transpilation. Changes to `.js` files are
immediately effective after reloading the extension or refreshing the test page.

---

## Code Conventions

- **`'use strict'`** is required at the top of all JavaScript files.
- Use `const` for values that are never reassigned; `let` only when reassignment
  is necessary. Never use `var`.
- Function names use **camelCase**.
- All regex patterns and their components should be broken into named `const`
  variables for readability (see `nwordTextToMask`, `nwordEndings`, `nwordPattern`).
- No external libraries or npm packages should be introduced without a strong
  justification — the zero-dependency philosophy is intentional.
- The `.gitignore` only excludes `.DS_Store`. Do not commit OS/editor metadata.

---

## Known Issues / Future Work

- **Manifest V2 is deprecated**: Chrome is phasing out MV2 in favor of Manifest V3.
  A migration would require updating `manifest.json` and adjusting any APIs if
  needed (content scripts are largely compatible between versions).
- **`window.onload` bug**: `nword.js` line 29 calls
  `window.onload = findAndUpdateTextNodes()` — note the `()` means the function
  is **invoked immediately** and its return value (`undefined`) is assigned to
  `window.onload`, rather than the function being registered as a handler. This
  works because the script runs at `document_idle` so the DOM is ready, but it is
  not the intended pattern and could mask issues if the timing changes.
- **README.md is empty**: No user-facing documentation exists.

---

## Git Branches

| Branch | Purpose |
|--------|---------|
| `master` | Main production branch |
| `claude/*` | AI-assisted development branches |

All AI-assisted work should be done on a `claude/`-prefixed branch and submitted
via pull request to `master`.
