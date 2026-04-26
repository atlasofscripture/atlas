# Contributing to Atlas of Scripture

Thanks for considering a contribution. Atlas of Scripture is open source because the work is too big for any one person and the subject matter is too important to gatekeep.

## Ways to help

**Add data.** This is the highest-leverage contribution. The data is what makes the atlas valuable. See [`data-conventions.md`](./data-conventions.md) for how to author entity files.

**Improve translations.** We bundle public-domain translations only. If you can help complete a chapter, file, or book of one of these — KJV, ASV, WEB, BSB, YLT — that's a meaningful contribution.

**Code improvements.** Bug fixes, performance, accessibility, new layer modules. See [`docs/architecture/overview.md`](../architecture/overview.md) to understand the system before opening a PR.

**Scholarly review.** If you're a biblical studies scholar, archaeologist, or seminary teacher, your eyes on the data are invaluable. Open issues for anything that looks wrong; we'd rather hear from you than ship inaccuracies.

**Documentation.** If something in the docs is unclear, fix it.

## Ground rules

1. **Cite everything.** No claim without a source. This is the project's foundation.
2. **Disagreement is fine; bad faith isn't.** We model contested views explicitly. We don't sneak our own positions in.
3. **The atlas is for everyone.** Catholic, Protestant, Orthodox, Jewish, secular contributors all welcome. Theological partisanship in commits is not.
4. **Be specific.** "Paul went to Iconium" needs a verse reference. "Paul was beloved of all" needs to be cut.

## Pull request flow

1. Fork the repo.
2. Create a topic branch: `git checkout -b add-corinth`.
3. Make your changes. Run `npm run validate-data` if you touched data files.
4. Commit with a clear message.
5. Open a PR with a description of what you changed and why.
6. Be patient and responsive to review.

## Issue templates

When opening an issue, tell us:
- What you expected
- What you saw
- A reproduction path (URL with state, screenshot, or steps)
- For data issues, a citation for what the correct value should be

## Code of conduct

Be kind, be specific, be honest. Disagreements over scholarly interpretations are welcome and expected — keep them about the work, not the people.

## Maintainers

Project maintained by [your name] and contributors. Sponsorship and donations support the project's ongoing work.
