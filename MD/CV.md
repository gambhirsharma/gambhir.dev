# CV workflow

`resume.json` is the source of truth for the CV. Do not edit `public/cv.pdf`
manually.

## Update the CV

1. Edit the relevant data in `resume.json`.
2. Open a pull request and merge it into `main`.
3. The **Generate CV** GitHub Actions workflow validates the data, creates
   `public/cv.pdf` and every variant PDF, and commits the generated PDFs back
   to `main` when they changed.
4. The new commit triggers the normal website deployment. The existing
   `/cv.pdf` link automatically serves the updated file.

Pull requests also receive a `cv-pdf` workflow artifact so the generated PDFs
can be reviewed before merging.

## Role-specific variants

`resume.json` is the general CV served at <https://gambhir.dev/cv.pdf>. For a
role-specific version (Full-Stack, MLOps, …) add a small override file instead of
copying the whole CV:

```text
cv-variants/fullstack.json  ->  public/cv-fullstack.pdf  ->  https://gambhir.dev/cv-fullstack.pdf
cv-variants/mlops.json      ->  public/cv-mlops.pdf      ->  https://gambhir.dev/cv-mlops.pdf
```

A variant only contains what differs from `resume.json`. It is applied as a
[JSON Merge Patch](https://www.rfc-editor.org/rfc/rfc7386):

- Objects merge field by field, so `{ "basics": { "label": "…" } }` changes only
  the title.
- Arrays replace the whole list.
- `null` removes a field (for example `"phone": null`).
- In `work`, `education`, `projects`, `contributions`, and `skills`, a plain
  string picks the entry with that `name` (or `institution`) from `resume.json`.
  This lets you select and reorder entries without copying them, and mix in new
  objects where something needs different wording.

Example `cv-variants/mlops.json`:

```json
{
  "basics": {
    "label": "MLOps Engineer",
    "summary": "MLOps-focused summary…"
  },
  "projects": [
    "ISAC-K8s",
    "Lynq NTN-Pulse (Winner, NEOSPACE Europe 2026)",
    "On Fly Image Optimization"
  ],
  "skills": [
    "MLOps & Edge Computing",
    "DevOps & Infrastructure",
    { "name": "ML", "keywords": ["PyTorch", "MLflow"] },
    "Cloud & CI/CD"
  ]
}
```

Variant file names must be kebab-case. Changes to `resume.json` flow into every
variant automatically, except for lists or fields a variant replaces. Deleting a
variant file deletes its PDF on the next build. Variant PDFs are not linked
anywhere on the site, so only people you send the URL to will find them.

## Preview locally

Install the project dependencies, then run:

```sh
pnpm cv:build                 # general CV and every variant
pnpm cv:build mlops           # only cv-variants/mlops.json
pnpm cv:build base fullstack  # general CV and one variant
```

Open `public/cv.pdf` (or `public/cv-<variant>.pdf`) to review the result. The generator supports multiple pages
when the content no longer fits on one page.

Optional fields beyond the JSON Resume schema: `projects[].date` (shown on the
right of the project title), `education[].location` (shown before the dates),
and `contributions[]` entries with `name`, `summary`, and `url`.

The profile image is selected by `basics.image` in `resume.json`. The current
design uses `public/me.png` and mirrors the previous CV's typography, colors,
compact section layout, contact icons, and rounded photo. Contact icons are
Lucide icons read from the `@iconify/json` dev dependency.

The generated PDF is deterministic: running the command again without changing
the source data produces the same file.
