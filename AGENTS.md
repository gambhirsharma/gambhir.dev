# AGENTS.md

Shared rules for any AI coding agent (Claude Code, opencode, etc.) working in this repo.

## Blog content never goes straight to main

Files under `src/content/blog/` are often drafts in progress. When asked to commit and/or push
changes that touch anything under `src/content/blog/` (including `notes/` and `talks/`):

1. **Never commit or push those changes directly to `main`.**
2. Determine the branch prefix from the file's location:
   - `src/content/blog/notes/**` → `blog/note/<slug>`
   - everything else under `src/content/blog/**` (top-level posts, `talks/`, etc.) → `blog/article/<slug>`
   - `<slug>` is the post's frontmatter `title`, kebab-cased (lowercase, spaces/punctuation → `-`).
     Example: title "Otel Intro" in `notes/` → branch `blog/note/otel-intro`.
   - Note: `blog(note): <title>` is not usable as a literal git branch name — `:` and spaces are
     invalid in refs — so the slash form above is the git-safe equivalent of that intent.
3. If that branch doesn't exist yet, create it from the current `main`. If it already exists
   (e.g. you're continuing an earlier draft), check it out and keep committing on it — don't
   create a second branch for the same post.
4. Commit the blog changes on that branch, then **always push it to the `origin` remote on GitHub**
   (`git push -u origin <branch>` the first time, plain `git push` after) — even if the user only
   asked to "commit", not "push". The whole point is that the draft exists on GitHub, not only on
   this machine, so it survives losing the laptop. Never leave blog commits push-less.
5. Tell the user the branch was created/updated and pushed, and ask them to review and merge it to
   `main` themselves — do not merge or fast-forward `main` automatically.
6. If a single commit/push request includes both blog changes and non-blog changes, split them:
   commit and push the non-blog changes to `main` as normal, and only pull the `src/content/blog/`
   changes onto the dedicated blog branch as above.

This exists so an incomplete/draft article can never accidentally end up live on the deployed site,
and so a draft in progress is always backed up on GitHub even if it's not finished yet.
