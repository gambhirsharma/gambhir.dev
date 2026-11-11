# CV workflow

`resume.json` is the source of truth for the CV. Do not edit `public/cv.pdf`
manually.

## Update the CV

1. Edit the relevant data in `resume.json`.
2. Open a pull request and merge it into `main`.
3. The **Generate CV** GitHub Actions workflow validates the data, creates
   `public/cv.pdf`, and commits the generated PDF back to `main` when it changed.
4. The new commit triggers the normal website deployment. The existing
   `/cv.pdf` link automatically serves the updated file.

Pull requests also receive a `cv-pdf` workflow artifact so the generated PDF can
be reviewed before merging.

## Preview locally

Install the project dependencies, then run:

```sh
pnpm cv:build
```

Open `public/cv.pdf` to review the result. The generator supports multiple pages
when the content no longer fits on one page.

Optional fields beyond the JSON Resume schema: `projects[].date` (shown on the
right of the project title), `education[].location` (shown before the dates),
and `contributions[]` entries with `name`, `summary`, and `url`.

The profile image is selected by `basics.image` in `resume.json`. The current
design uses `public/me.png` and mirrors the previous CV's typography, colors,
compact section layout, contact icons, and rounded photo.

The generated PDF is deterministic: running the command again without changing
the source data produces the same file.
