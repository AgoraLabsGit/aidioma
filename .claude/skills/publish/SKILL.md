---
name: publish
description: Commit or open a PR only when the founder asks.
---

# /publish

Publish only when the founder explicitly asks in the current request.

1. Read `Docs/CLOSE.md` and the verified receipt's `close-record.json`. Require a final PASS check, no FAIL,
   and only PASS or explicitly founder-accepted WARN verdicts on one final candidate.
2. Load the linked final manifest. Verify its digest, exact `ref → commit → tree`, and HEAD parent.
3. Run `node .claude/skills/close/scripts/close-bundle.mjs verify --bundle <linked bundle> --replay-checks yes`.
   Require its exact receipt ref, commit, and tree; reject any secret/PII content missed by the
   tool's structural checks.
4. Read the verified bundle's canonical `files` array and inspect the receipt commit against its
   candidate parent. The only permitted paths are the bundle itself plus those exact listed paths,
   including `check_results`, `audit_results`, and every `audit_response`; any other changed or deleted byte blocks
   publish. Listed paths byte-identical to the candidate need not appear in the diff. Never
   reconstruct this receipt from the mutable live tree.
5. Materialize and publish the retained receipt commit. It already contains the clean candidate plus
   its immutable verified evidence; never stage or copy unrelated live-tree changes.
6. Show the exact branch/commit/PR action requested, then use `git` / `gh` only for that contained
   candidate. After success, write action, URL/ref, published commit, final candidate, and UTC time
   to `Docs/Evidence/<target>/publication.md`. Do not change the closed NOW/phase authority or
   include this after-the-fact receipt in the publication it describes.

Stop if the final manifest/ref or receipt ref is missing, the candidate/bundle differs, the receipt
diff exceeds its list, or the founder did not request publication. `/publish` never weakens or
reruns `/close`.
