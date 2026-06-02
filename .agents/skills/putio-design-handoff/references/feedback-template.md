# Feedback Template

Save feedback to `tmp/design-handoff/feedback-to-design-tool.md` unless the user requests another path.

```md
# Feedback for Claude Design

## Accepted

- What was implemented or already matched the repo contract.

## Discrepancies

- Prototype claims, stale captions, token drift, accessibility failures, broken links, or bundle/package surprises.

## Not Imported

- Prototype-only artifacts intentionally kept out of checked-in files or package outputs.

## Repo Pipeline Notes

- Repo-specific source-of-truth and generation rules the design tool should honor next time.

## Verification

- Checks run and their result, summarized without local machine paths.
```

Prefer precise examples such as "`--yellow-solid-hover` resolves to `#F3C435`; one caption said `#F3C437`" over general complaints.
