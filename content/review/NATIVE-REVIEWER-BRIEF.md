# AIdioma — Native-Speaker Review Brief

*For the paid reviewer. Everything you need is in this document; no prior knowledge of the project is assumed.*

Thank you for taking this on. Please read this brief once end-to-end before you start — it defines exactly what to look at, in what order, and how to mark what you find. If anything here is unclear, ask before you begin rather than guessing.

---

## 1. The project and your scope

**What AIdioma is.** AIdioma is a Spanish-learning web app for English speakers. Learners are shown an English sentence and type the Spanish translation; the app grades their answer, accepting any correct phrasing and giving feedback. The launch content is a 12-lesson beginner (CEFR **A1**) course covering greetings, describing people, everyday actions, *ser* vs *estar*, food, family, likes, time, daily routine, plans, and simple requests. Because learners *type* their answers, and because the app tells them when they are "wrong," the Spanish we show has to be correct **and** natural — a stiff or region-marked sentence, or a valid answer marked wrong, erodes trust immediately.

**What you are reviewing.** All 12 A1 lessons. Across them, roughly:

| Content type | Approx. count | What it is |
|---|---|---|
| Vocabulary items | ~120 (≈10/lesson) | Spanish word + English gloss the lesson teaches |
| Translation sentences | ~200 (12–20/lesson) | An English sentence, its Spanish translation (`es`), and a list of **accepted alternate** Spanish answers |
| Explanations | 12 (one/lesson) | A short grammar note (≤150 words) with inline examples |
| Reading passages | 12 (one/lesson) | A 4–8 line mini-text; each line is a standalone Spanish sentence |
| Conversation seeds | 12 (one/lesson) | A scenario + the AI persona's opening line in Spanish |

**Estimated effort: 8–12 hours total.** This is a full read of the launch corpus, roughly one paid session or two. Pace yourself at about one lesson per 45–60 minutes.

---

## 2. Your mandate — redline, not rewrite

**You are the authority on one thing: whether this Spanish is correct and sounds natural to an educated Latin American speaker.** That is precisely the judgment we are paying for and cannot make ourselves.

- **Redline, don't rewrite.** For each problem, *flag the specific item, say what's wrong in a few words, and give one suggested correction.* Do not rewrite whole lessons, re-order content, or replace a passable sentence with a "better" one you'd have written. If a sentence is correct and natural, leave it alone even if you'd phrase it differently — variation is fine, only errors and genuinely unnatural phrasing get flagged.
- **You are NOT reviewing pedagogy or structure.** The order of lessons, which grammar each lesson teaches, the difficulty ratings, the choice of vocabulary, and the IDs are all fixed by design and are out of scope. If you think a *pedagogical* choice is odd, leave a one-line note in the "SUGGESTION" channel — but do not treat it as an error.
- **When in doubt, flag it as a question, don't silently "fix" it.** A short note ("is *X* natural where you're from? sounds off to me") is more useful than an unexplained change.

---

## 3. The register standard you are enforcing

All content targets **neutral Latin American Spanish** — the kind of unmarked, pan-regional Spanish an educated speaker anywhere in Latin America recognizes as normal (think neutral TV Spanish, not Mexico City slang or Buenos Aires *voseo*). Concretely:

- **`tú`** for singular *you*; **`ustedes`** for all plural *you* (formal and informal alike).
- **No `vosotros`** anywhere — never conjugated, taught, or exercised. Flag any *vosotros* form as an ERROR.
- **`coger` is banned** in every sense and every field, even where grammatically innocent, because it is vulgar across much of Latin America. Flag any occurrence.
- **Flag anything region-marked** — a word or construction that would immediately identify the writer as being from one specific country — and name the neutral alternative.

**Contested-word table** — the intended choices. "Primary" is what a lesson teaches; "also accept" belongs in the accepted-alternates list; "avoid" should never appear:

| Meaning | Primary (correct) | Also accept | Should NOT appear |
|---|---|---|---|
| car | carro | auto, automóvil | *coche* (Spain-marked) |
| computer | computadora | computador | *ordenador* (Spain only) |
| juice | jugo | — | *zumo* (Spain only) |
| to take (bus/coffee) | tomar | agarrar | ***coger** — banned* |
| cell phone | celular | teléfono | *móvil* (Spain only) |
| computer mouse | mouse | ratón | — |
| potato | papa | — | *patata* (Spain only) |
| ok / fine | bien | está bien | *vale* (Spain) |
| bus | el bus / el autobús | el camión (MX), la guagua | keep to bus/autobús |
| pen | el bolígrafo | la pluma, el lapicero | — |
| glasses (eye) | los lentes | los anteojos | *las gafas* (Spain-leaning) |
| pretty / nice | bonito | lindo | — |
| right now | ahora / ahora mismo | ya | *ahorita* (regionally fuzzy) |

If you see one of the "should not appear" words in taught content, that's an ERROR. If you see it in an accepted-alternates list, that's also an ERROR (a wrong-register answer must not be marked correct).

---

## 4. Where to spend your attention — priority order

Read every lesson, but weight your effort in this order. (a) is where a mistake does the most damage; (d) is a light pass.

**(a) HIGHEST — errors in TAUGHT content.** The vocabulary entries, the example sentences inside explanations, and every `es` (Spanish) string learners are asked to produce. This is the **under-1%-error bar**: an error in material we actively *teach* destroys trust out of proportion to its size. Check grammar, accents (*mamá, está, tú, adiós, ñ*), gender/number agreement, correct conjugation, and naturalness. A learner will type these and be told they're right or wrong — they must be flawless.

**(b) HIGH — accepted-alternates review (the highest-value work).** Each translation sentence carries a list of *other* Spanish answers the app will also mark correct. For each sentence, do two things:
   1. **Flag any listed alternate that is actually wrong** — wrong agreement, wrong register (a *vosotros* form, *vale*, *coche*, *zumo*, *coger*), a meaning shift, or something no native would say. A wrong answer marked correct is a real defect.
   2. **Suggest natural alternates that are missing.** Ask yourself: *"Given this English prompt, would I also naturally say ___?"* The most common failure this app will have is a learner typing a perfectly good answer and being marked wrong because it wasn't in the list. Think especially about: dropping vs. keeping the subject pronoun (*Yo hablo* / *Hablo*), natural word-order swaps (*Hoy estoy cansado* / *Estoy cansado hoy*), and the accepted synonyms from the §3 table (*carro* / *auto*). Only add alternates that are **fully correct and natural** — not merely understandable.

**(c) MEDIUM — naturalness of passages and conversation openers.** Read each 12-lesson passage and each conversation opening line as a native. Does it read like real, natural speech or narration? Flag anything stiff, calqued from English, or region-marked.

**(d) LIGHT — hints, only if obviously wrong.** Each sentence has three learner hints. You do not need to audit these closely; flag one only if it contains an outright Spanish error or gives misleading information.

---

## 5. How you'll work — the review sheets

You'll receive the content **one lesson at a time** as a per-lesson review sheet, in one of two formats — tell us which you prefer:

**Option A — Spreadsheet (recommended for most reviewers).** One row per item (vocab, sentence, passage line, etc.), with columns for the ID, the English, the Spanish `es`, and the accepted alternates, plus three empty columns for you to fill in: **Severity**, **Comment**, and **Suggested correction**. Sort/filter as you like; you never touch the ID column. This is the easiest format if you're comfortable in Excel or Google Sheets.

**Option B — JSON.** The same content as a structured `.json` file, one object per item. You add a `review` block to each item you're flagging (`{"severity": "...", "comment": "...", "suggestion": "..."}`) and leave untouched items alone. Choose this only if you're comfortable editing JSON without breaking it — **never alter an `id` field or the structure**.

Most reviewers should pick **Option A**. Both carry identical content; the only difference is the container.

**Mark severity with one of three labels:**

| Label | Use when | Example |
|---|---|---|
| **ERROR** | It is objectively wrong — grammar, accent, agreement, banned/region-marked word in taught content, or a wrong accepted-alternate. Must be fixed before launch. | *"estas" → "estás" (missing accent)* |
| **UNNATURAL** | Grammatically correct but a native wouldn't say it this way; a calque or stiff phrasing. | *"literal translation; more natural: ..."* |
| **SUGGESTION** | An optional improvement or a **missing accepted alternate** worth adding. | *"also accept: 'Hablo español' (pronoun dropped)"* |

Every flag needs a short **comment** and, wherever possible, a **suggested correction**. A flag with no suggestion is fine for a "this sounds off, not sure why" note, but the more concrete you can be, the faster we can act.

**Turnaround.** Roughly **45–60 minutes per lesson**; please return sheets lesson-by-lesson as you finish rather than holding all 12 to the end, so we can start acting on early lessons while you work through later ones.

---

## 6. What NOT to do

- **Don't anglicize.** Don't "correct" natural Spanish toward a word-for-word match with the English. Natural over literal, always.
- **Don't impose one country's usage as *the* standard.** If a form is neutral and pan-regional, accept it even if your own country prefers a different word. Flag things that are *wrong* or *region-marked*, not things that are merely "not how we say it back home."
- **Don't rewrite the pedagogy.** Lesson order, grammar focus, vocab selection, and difficulty are fixed. Not your call to change.
- **Don't touch IDs or structure.** Every item has an immutable ID (e.g. `a1-05.s.03`). Never change, renumber, or delete one. Fix the *content*, keep the ID.
- **Don't rewrite what's already correct.** If it's right and natural, leave it — even if you'd have written it differently.

---

## 7. Hiring post (for italki / Preply / Upwork)

> **Looking for a native Latin American Spanish speaker to proofread beginner (A1) course content — one-time project, ~8–12 hours.** I'm building a Spanish-learning app and need a careful native review of 12 beginner lessons (~120 vocab words, ~200 short sentences with accepted-answer variants, plus explanations and short readings) for grammar, accents, and — most importantly — natural, *neutral Latin American* phrasing (tú/ustedes, no vosotros). This is a **redline** job: flag errors and unnatural wording with a quick suggested fix in a spreadsheet I provide — not a rewrite. **Ideal fit:** native LatAm Spanish speaker with a Spanish-teaching or editing/proofreading background, a good eye for register and regional markedness, and comfortable working in a spreadsheet. Paid hourly; please share your rate, region, and any teaching/editing experience.

**Required profile to screen for:** native Latin American Spanish; teaching, tutoring, or editing/proofreading experience; strong sensitivity to regional register (can tell you *why* a word is Spain-marked or country-marked); comfortable and reliable working in spreadsheets and returning structured feedback.
