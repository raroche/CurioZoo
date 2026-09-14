# CurioZoo Trivia: Research-Backed Design Report

Prepared 2026-09-14 for a free, ad-free, no-login, iPad-first kids' learning site with three levels (Easy 4–6, Medium 7–10, Hard 11–15), categories plus Mixed, English with per-question Spanish toggle, read-aloud voice, hopping mascot, and the house rule that nothing punishes a mistake. Family plays about once a week.

A note on evidence quality: the peer-reviewed literature is strong on retrieval practice, feedback content, rewards/motivation and option counts; it is thin on "how many trivia questions per round for a 5-year-old". Where the report gives a number that is not directly studied, it is derived from attention-span guidance and from what the best-regarded products do, and it says so.

---

## 1. Game format and session design

### Questions per round, by age

Attention-span guidance from child-development sources converges on roughly 2–3 minutes of structured attention per year of age: 4–6 minutes for a 4-year-old, 6–9 for a 5-year-old, 8–12 for a 6-year-old, 10–15 for a 7-year-old, rising to roughly 16–24 minutes at 10 (Tutero; Kids' Directory; Natalie Hutton). Engagement with something the child chose can double that, but a trivia round is structured, and it should end before attention does, so the child leaves wanting another round.

Product practice agrees with short rounds. Kahoot! Kids' free daily challenge is three short quizzes (Tech & Learning). Brain Quest prints only three to ten questions per card, "fewer questions for younger children" (Smarter Learning Guide). Duolingo lessons are about five minutes; notably, when Duolingo experimented with even shorter lessons, hoping learners would do more of them, total "time spent learning well" fell, so they kept lessons at the five-minute mark rather than shrinking them further (Duolingo blog, "Time spent learning well"). The lesson for CurioZoo: short, but not so short that a round feels like nothing happened.

With read-aloud, a young child's question takes 20–40 seconds including the answer feedback and fun fact. That gives:

- Easy (4–6): 5 questions, about 3–4 minutes. Offer "one more round?" at the end.
- Medium (7–10): 8 questions, about 5–6 minutes.
- Hard (11–15): 10 questions, about 6–8 minutes, plus an optional 15-question "challenge" length.

### Timers: the evidence says no for young children, optional and gentle for older

The strongest objection to timers is the math-anxiety literature. Boaler (Stanford) argues that timed tests are a primary cause of early-onset math anxiety across the achievement range; brain-imaging work with 7–9-year-olds found that children who felt panicky about math showed increased activity in fear-related regions and decreased activity in problem-solving regions (Stanford GSE; EdWeek). A recent meta-analysis cautions that the causal evidence linking timed tests to anxiety is still thin because of the small number of studies (Filling the Pail), so this is a strong practitioner consensus rather than a settled causal finding.

The Kahoot! literature review (Wang & Tahir 2020, 93 studies) is the best product-specific evidence: Kahoot! improves performance and attitudes on average, but the challenges students themselves report are "stressful time-pressure for giving answers, not enough time to answer, afraid of losing, and hard to catch up if an incorrect answer had been given" (Computers & Education). Kahoot!'s default per-question timer is 20 seconds (Kahoot! support). Quizizz, by contrast, lets teachers turn the timer off entirely, awarding a flat 600 points for a correct answer with no speed bonus (Wayground support), which is the model to copy.

Recommendation: no timer at Easy, ever. No timer by default at Medium and Hard. At Hard, offer an opt-in "Speed round" toggle that shows a generous, non-scoring progress bar (say 30 s) and simply reveals the answer when it runs out; time never subtracts points and never ends the round.

### Points, streaks, lives

Points: keep them simple and flat (one star per correct answer; see section 5). Avoid speed bonuses, which are what makes Kahoot! feel like pressure.

In-round answer streaks are a mild, well-understood motivator (Kahoot!'s answer-streak bonus exists "to encourage deeper learning by rewarding answer accuracy"), but they should be celebratory, not compounding: a small "3 in a row!" sparkle at 3 and 5, no multiplier, and a miss simply resets quietly with no sad animation.

Lives: do not use them. Duolingo's hearts are the canonical example; Duolingo defends them as a nudge against binging, but they are widely disliked and they directly contradict "nothing punishes a mistake" (Duoplanet). Trivia Crack's paid "5 extra lives for $4.99" shows where lives lead commercially (Common Sense Media). With no lives, a wrong answer costs nothing except the chance to learn something.

### End-of-round summary and replay motivation

Kahoot!, Quizizz and Duolingo all end with a summary; Duolingo specifically waits to review the mistakes you made until the end of the lesson "to take advantage of a little spaced repetition" (Duolingo blog). The summary should show stars earned, the "what you learned" list (section 4), and two buttons: "Play again" (new questions in the same category) and "Try another category". Replay motivation comes from novelty (new questions, a weekly set) and from the recap, not from loss aversion.

### Retrieval practice and re-asking

The testing effect is robust and holds in children. Retrieval practice in classrooms is broadly beneficial, with or without feedback (Frontiers in Education review), and quizzing 8th-graders three times with corrective feedback raised unit, semester and end-of-year scores (ERIC, "Retrieval-Based Learning: A Decade of Progress"). For preschoolers the picture is more specific: 5–6-year-olds show a testing effect when cued recall is combined with immediate feedback, and a 2025 Child Development study found they need roughly three successful retrievals during practice for the gain to survive to a delayed test; the authors advise presenting new information several times before switching to retrieval (Káldi et al. 2025, PMC). This argues for Easy-level questions to be about things the child has already met (or that the fun fact teaches on the spot), and for re-asking.

Two important cautions on multiple choice: a negative testing effect from picking wrong lures was eliminated when children got immediate feedback with the correct answer after each selection (Memory, 2012), so always show the right answer. And feedback timing is nuanced: Metcalfe, Kornell & Finn (2009) found that for Grade 6 children learning vocabulary, feedback delayed to the end of the session produced better final-test performance than immediate feedback, which in turn beat none; Kulik & Kulik's meta-analysis found immediate feedback usually wins in real classrooms, plausibly because children attend less to delayed feedback (Metcalfe et al. 2009, Memory & Cognition). The practical synthesis for a self-paced kids' app: give immediate feedback (children need it, and it prevents wrong lures being consolidated), then re-ask the missed question later in the same round as a second retrieval, and again in next week's session. That is spaced repetition with three touches, which matches the preschool "three successes" finding.

Also relevant: the hypercorrection effect holds for Grade 3–6 children. Errors made with high confidence are the ones most likely to be corrected after feedback (Metcalfe & Finn 2012, Learning and Instruction). So confident wrong answers are not a problem; they are the best learning moments, and the feedback wording should treat them that way.

---

## 2. Interactivity beyond "tap a choice"

Constraints: text, emoji, simple SVG, no downloaded images, typed answers already fuzzy-matched in English and Spanish, and NN/G's finding that dragging is hard for children under 9 while tapping and swiping are easy at every age (NN/G, physical development). Quizizz offers ten structured types (multiple choice, reorder, match, fill-in-the-blank, drag-and-drop, drop-down, labeling, hotspot, and so on; Wayground), but most of those need images or fine motor control.

Assessment of each candidate format:

- Multiple choice: the workhorse; three options are psychometrically optimal (section 3). Keep.
- True/false: fast and readable, but a 50% guess rate teaches less; good as a warm-up and for "two truths and a lie" variants. Keep in small doses.
- "Which is bigger / more / older": a comparison question with two big tiles. Magnitude comparison is one of the four numerical skills that improved in Siegler & Ramani's linear board-game studies (CMU; Child Development 2008). Effectively a two-option MC. Keep as a sub-format.
- Order these (tap in order): tap-to-sequence avoids drag entirely: the child taps items in order and they slide into slots, with an undo tap. Feasible with text/emoji. Good for Medium and Hard (timelines, sizes, life cycles). Keep.
- Picture choice using emoji: essential for pre-readers; emoji as answer tiles (🐘 🐭 🐶). Keep; it is the Easy default.
- Odd one out: a variant of MC with a categorisation twist ("which one is not a fruit?"). Excellent for reasoning at Medium/Hard. Keep as MC sub-format.
- Estimate a number with a slider: Siegler's number-line estimation work shows estimation on a linear scale is itself a learnable skill that transfers, and a slider is a large gross-motor gesture. Scoring must be a tolerance band ("close enough!") to stay non-punishing. Keep for Medium/Hard, occasionally.
- Fill the blank with typed answer: the app already has bilingual fuzzy matching, and free recall is the strongest form of retrieval practice. Not for Easy (typing skill), rare at Medium, regular at Hard. Keep.
- Two truths and a lie: three statements, pick the false one; it is MC with three options where every option teaches something. Keep for Hard; it fits the "why" explanations.

Recommended set (five families, since several are MC variants sharing one component):

| Format | Easy 4–6 | Medium 7–10 | Hard 11–15 |
|---|---|---|---|
| Multiple choice (incl. emoji picture choice, odd one out, two truths and a lie) | 70% | 55% | 50% |
| True/false and "which is bigger" (two big tiles) | 30% | 15% | 10% |
| Order these (tap in order, 3–4 items) | 0% | 15% | 15% |
| Estimate with a slider (tolerance band) | 0% | 5% | 10% |
| Typed answer (fuzzy, EN/ES) | 0% | 10% | 15% |

Reasons: Easy stays with two gestures (tap a big tile) and read-aloud; Medium adds sequencing and a little typing as reading and motor skills arrive; Hard shifts toward recall and reasoning, where retrieval strength is highest.

---

## 3. Age-appropriate UX

NN/G's first rule is that there is no single "child user": design at least for 3–5, 6–8 and 9–12 separately, since cognition, motor skill and tech fluency differ sharply (NN/G, "UX Design for Children"). CurioZoo's three levels map cleanly onto that.

### Easy (4–6, pre-readers)
- Read-aloud on by default; auto-read the question and each option in turn as it highlights, and offer a tap-to-repeat speaker on every tile. NN/G notes audio-plus-visual instruction works, but audio alone is unreliable, so keep the text visible too (NN/G, kids-cognition).
- Three choices, big emoji on each tile, one short line of text.
- Touch targets at least 2 cm × 2 cm, which NN/G recommends for young children (four times an adult target) (NN/G, physical development). At typical iPad density that is roughly 76 CSS px; make Easy tiles at least 88 px tall with 12–16 px gaps.
- No timer, no streak counter shown, no numbers larger than the star count.
- Helper mode: a small "Grown-up helping" toggle that makes the read-aloud slower, adds a "read the answer choices again" button, and turns the recap into a printable/sayable list. Kahoot! Kids and Khan Academy Kids both assume adult co-play at this age; Tech & Learning's advice for Kahoot! Kids is for parents to "ask what kids have learned" afterwards. Khan Kids' approach to a struggle is hints toward the answer rather than marking it wrong (Common Sense Media; Educational App Store), which the helper can emulate by tapping "give a hint" to grey out one wrong tile.

### Medium (7–10)
- Four choices are fine here (reading and working memory can hold four short options), but three remain acceptable; the point below on option counts applies.
- Optional timer off by default; streak sparkles at 3 and 5.
- Tap-in-order and occasional typing arrive. Avoid drag; NN/G says dragging remains challenging at 6–8 and only comfortable at 9–12.

### Hard (11–15)
- Four choices with plausible distractors (near-misses, common misconceptions), because hypercorrection means confident errors are productive.
- "Why" explanation of two or three sentences after every answer, plus the fun fact.
- Optional "Challenge" mode: 15 questions, speed round toggle, harder-only pool, typed answers more frequent.

### Evidence on 3 vs 4 options
Rodriguez's meta-analysis of 80 years of research concludes that three options (one correct, two lures) is optimal: more three-option items can be answered per unit time with no loss in score quality, largely because the third and fourth distractors in most items are implausible and do no work (Rodriguez 2005, Educational Measurement). For a learning game rather than a test, that translates to three good distractors beating four where one is filler. Use three at Easy and treat four at Medium/Hard as a ceiling, not a requirement; if a writer cannot think of a third plausible lure, ship three.

### Accessibility
- WCAG 2.2 SC 2.5.8 requires interactive targets of at least 24 × 24 CSS px at Level AA; Apple's HIG recommends 44 × 44 pt and Material 48 dp, and touch error rates fall from about 15% at 24 px to 3% at 44 px (AllAccessible; TestParty). CurioZoo should exceed all of these: 88 px tiles at Easy, 64 px minimum elsewhere.
- WCAG SC 1.4.1: colour must never be the sole signal. Pair green/red with a check mark and a gentle "not this one" icon, and with the text and voice feedback (W3C Understanding 1.4.1; Section508.gov).
- WCAG SC 2.3.3 and `prefers-reduced-motion`: honour the OS setting by replacing the mascot hop and confetti with a static star-burst and a colour fade (web.dev; MDN). Also expose a "Calm mode" toggle in settings for children who find motion overstimulating even without the OS setting.
- Read-aloud requires a user gesture on iOS Safari and Chrome, and it is silent if the iPad's mute switch is on (talkrapp lessons). Start speech inside the tap handler and show a small "sound is off?" hint if speech ends with zero duration.

---

## 4. Feedback and the learning loop

### Elaborated feedback beats "correct/incorrect"
In a meta-analysis of feedback in computer-based learning, elaborated feedback (an explanation) produced an effect of 0.49 versus 0.05 for mere correctness and 0.32 for supplying the correct answer, and the benefit was largest for learners with lower prior knowledge (Van der Kleij et al., ResearchGate). Wisniewski, Zierer & Hattie's 435-study meta-analysis finds feedback most effective when it includes both the correct answer and an explanation (Wisniewski et al. 2020). For learning from text, feedback given right after reading that includes the correct answer or an elaboration beat simple right/wrong (Swart et al., Educational Research Review).

One caution from a study of 130 seven-year-olds solving equivalence problems: feedback that added an explicit verification cue ("that's wrong") on top of the correct answer reduced persistence and strategy variety compared with simply showing the correct answer (Journal of Experimental Child Psychology, 2024). This is direct support for CurioZoo's rule: lead with the right answer and the reason, not with the verdict.

### How to say "not quite" kindly
Principles: name the answer, not the child; show the correct answer immediately; add one reason or fact; use process language (Dweck's work shows person-praise such as "you're so smart" produces helpless responses to later failure, while process praise such as "you worked hard on that" encourages taking on challenges; Bing Nursery School; Mindset Kit); and keep it short enough to be read aloud in under six seconds.

Example wording (English / Spanish):

- Correct: "Yes! 🐘 The elephant is the biggest. Did you know an elephant's trunk has about 40,000 muscles?" / "¡Sí! El elefante es el más grande. ¿Sabías que la trompa de un elefante tiene unos 40,000 músculos?"
- Not correct, Easy: "Good try! It's the elephant 🐘 — see how big it is? Let's remember: elephant." / "¡Buen intento! Es el elefante. ¿Ves qué grande es? Vamos a recordar: elefante."
- Not correct, Medium: "Close — lots of people think that. The answer is Jupiter. It's so big that all the other planets could fit inside it." (Never "Wrong!", never a buzzer, never a sad mascot.)
- Not correct, Hard: "Not this time. It's mitochondria, not the nucleus: the nucleus stores the instructions; mitochondria make the energy. That mix-up is one of the most common ones, which is exactly why it's worth knowing."
- Slider near miss: "Close enough! You said 60, it's 65. That's a great estimate."

### The fun fact
Every question carries a one-sentence fun fact shown after the answer regardless of correctness (Nat Geo Kids' Quiz Whiz and "Weird But True" popularised this pattern for children). Because the fact is the payoff for answering at all, a wrong answer still earns something. Read it aloud at Easy.

### Ask it again later in the round
Copy Duolingo's end-of-lesson mistake review, but nudge it earlier: a missed question returns 3–4 questions later, rephrased or with options shuffled, labelled "One more look" with a small 🔁 badge so the child recognises it as a second chance rather than a trick. A second miss shows the answer again with no further re-ask this round; the item is queued for next week's set. Cap re-asks at two per round at Easy so rounds stay short. This gives each missed item the repeated successful retrievals that the preschool testing-effect work says are needed.

### "Things I learned this week"
The results screen lists every fun fact and corrected answer from the round as short "I learned…" lines with the emoji category badge. Store them locally (localStorage, no login) and show a "This week I learned" card on the trivia home screen until the next session, plus a "Read it to me" button. Because the family plays weekly, this card doubles as the spaced second exposure and as a conversation prompt for parents (the follow-up Tech & Learning recommends).

---

## 5. Motivation without manipulation

### What the research says
Deci, Koestner & Ryan's meta-analysis of 128 studies found that expected tangible rewards given simply for doing a task reduce intrinsic motivation, that this damage is larger for children than for college students, and that verbal praise raises intrinsic motivation, but less so for children, and only when it is informational rather than controlling (Deci, Koestner & Ryan 1999; 2001 review). Lepper, Greene & Nisbett's 1973 study is the origin: preschoolers promised a ribbon for drawing later drew less in free play than children given an unexpected reward or none (Overjustification effect, Wikipedia; Structural Learning). Self-determination theory frames this as satisfying autonomy, competence and relatedness (Springer, SDT in digital games).

Gamification does help on average: Sailer & Homner's meta-analysis reports small positive effects on cognitive (g = 0.49), motivational (0.36) and behavioural (0.25) outcomes, with the cognitive effect stable under rigorous studies and the motivational effects less stable (Educational Psychology Review 2020). A 2023 meta-analysis finds gamification raises intrinsic motivation and perceived autonomy and relatedness, with minimal effect on competence (ETR&D). And the cautionary tales are clear: Duolingo's streak becomes "a source of anxiety" where kids do "the easiest possible lesson at 9:00 PM just to keep a flame alive" (Screenwise; UX Magazine), and Prodigy showed 16 membership ads in 19 minutes containing four math problems (NBC News; Fairplay).

### Safe rewards, by the theory
Safe: informational feedback ("you got 7 of 8 in Animals"), rewards that mark competence rather than compliance, unexpected small delights, collections that are never lost, and choice. Risky: expected tangible-feeling rewards for mere participation, daily streaks with loss framing, leaderboards against other people, anything that nags.

### Recommended reward scheme
- Star: one star per correct answer, including re-asked questions answered correctly the second time (learning it counts). Stars are never removed. The star count is shown per round and per category.
- Badge: awarded for competence milestones, not attendance. Examples: "Animal Explorer" at 25 correct in Animals; "Space Explorer" at 25 in Space; "Curious Mind" for reading 20 fun facts; "Second Look" for getting 5 re-asked questions right; "Bilingual" for answering 10 questions in Spanish. Badges are shown as a collection wall with the ones not yet earned drawn as outlines with a plain description, no countdown.
- Explorer ranks per category: Sprout → Explorer → Guide → Expert at 10 / 25 / 60 / 120 correct in that category, cumulative and permanent. Ranks are the "collection" motivator that SDT allows because they only ever go up and signal competence.
- Weekly "New this week" set: a rotating 10-question mixed set posted each week per level; playing it is its own reward (novelty) and it is the vehicle for next-week re-asks. No streak counter for weeks played; if the family skips a fortnight, nothing is lost and the card just says "New this week".
- Surprise delight: occasionally (unpredictably, roughly one in six rounds) the mascot does a special hop or the results screen shows a bonus fact. Unexpected rewards do not carry the overjustification cost.
- Never: daily streaks, hearts/lives, timers that subtract, leaderboards, notifications, "you're about to lose…" copy, locked content that costs anything.

---

## 6. Bilingual UX

### The toggle: text label, not a flag
The consensus among localisation and accessibility practitioners is that flags represent countries, not languages: Spanish is spoken in twenty-plus countries, so a Mexican or Spanish flag mislabels many families, and small greyed flags can also fail WCAG contrast (Flags Are Not Languages; SimpleLocalize; Localize). The recommended pattern is the language's own name in its own script, optionally with a neutral icon such as a globe or speech bubble.

Recommended control: a pill button in the question header reading "Español" when the question is in English and "English" when it is in Spanish, with a 🌐 or 💬 prefix, `aria-label="Read this question in Spanish"`, minimum 44 px tall, and `lang` attributes set correctly on the question and options so screen readers switch voice. For pre-readers pair it with a speaker icon so the tap both translates and reads aloud. Avoid "ES/EN" alone as the visible text for 4–6-year-olds; abbreviations are meaningless to them, while a short word read aloud is not.

### Remember the choice
Store the preference per level in localStorage (`triviaLang: 'es'`), because a sibling playing in Spanish should not force the next child to toggle. When a family has toggled Spanish on a majority of questions in a round, offer "Play the next round in Spanish?" at the results screen. Keep the toggle per question regardless, since mixed-language households often want to compare both.

### Voices via the Web Speech API
- Voices load asynchronously; call `getVoices()` after the `voiceschanged` event and cache the list (MDN; talkrapp).
- Speech must start from a user gesture in both Safari and Chrome, and iOS Safari is silent when the mute switch is on, while Chrome on iOS is not (talkrapp).
- iOS's Spanish voices have historically been Mónica (es-ES) and Paulina (es-MX); iOS also reports voices it will not actually use, silently substituting a default in the same language (talkrapp). An Apple Developer Forums thread reports that on iOS 18 devices the compact Mónica and Paulina voices disappeared from `getVoices()`, leaving only lower-quality `com.apple.eloquence.es-*` voices, with no documented Apple response (Apple Developer Forums, thread 764438). Treat voice quality on iPad as variable and not under your control.
- Selection strategy: set `utterance.lang` to `es-MX` (closest to es-US families) and pick a voice by preference order: any voice whose lang is `es-MX` or `es-US`, then `es-419`, then any `es-*`, preferring names that do not contain "Eloquence" and preferring `localService` voices. If no `es-*` voice exists, show a one-line hint ("Spanish voice not installed; Settings → Accessibility → Spoken Content → Voices") and read the Spanish text with the default voice anyway rather than skipping.
- Set `rate` to about 0.9 for Easy in both languages and let Hard use 1.0.

### Questions that do not translate
Some items are language-bound: rhymes, spelling, "which word starts with B", and idioms. Give each question a `translatable: false` flag, or provide a distinct Spanish counterpart question (`es` variant with its own answer set) rather than a literal translation. When a question is untranslatable and has no counterpart, hide the toggle and show a small note "This one is an English word game", and make sure the Mixed and category pools contain enough Spanish-capable items that a child in Spanish mode never sees more than one untranslatable question per round. Units, currency and cultural references (a US penny, Thanksgiving) need either dual-culture wording or a Spanish variant written for a Latin-American context, not a translation.

---

## 7. Two-player and family play

Pass-and-play on one device (the "hotseat" mode; Wikipedia) is the natural fit for a no-login iPad app. The most useful models are board games rather than apps:

- Trivial Pursuit Family Edition ships separate kids' and adults' card decks, "1200 easier questions for kids and 1200 more challenging questions for adults", so each player answers at their own level in the same game and "it levels the playing field" (Amazon; What's Good to Play).
- Brain Quest's game rules let players choose a question at or above their own grade level, and the boxed set includes two decks "one for each player"; the guidance also notes decks "can be used just for fun without keeping score" (UltraBoardGames; Rainbow Resource).
- Family Trivia Games & Quiz AI (App Store) markets exactly this: age-appropriate difficulty so "kids aren't stuck on difficult questions and everyone plays together without feeling left out", via pass-the-phone.
- Matching Pairs' 2-player mode alternates turns on one device (App Store).

Recommended design:
- Setup: "Who's playing?" with 1–4 name chips (emoji avatar, no typing required for Easy players), each with its own level. Names persist locally.
- Turn structure: strictly alternating single questions, with a large "Pass to Maya 🦊" interstitial screen and the mascot pointing, so the device hand-off is explicit. Each player's question is drawn from their own level pool and language preference.
- Scoring: stars are per player and shown side by side as star rows, not as a ranked table. There is no "winner" banner; the results screen says "Maya earned 6 stars in Animals, Leo earned 7 in Space" and shows each child's "I learned" list. Sibling comparison is the single biggest shame risk; the board-game trick of separate decks removes the "unfair" complaint, and the absence of ranking removes the sting.
- Cooperative option: "Team mode" where both players' stars pool into a family total with a shared goal ("Get 12 stars together"). Cooperation satisfies the SDT relatedness need and avoids head-to-head entirely; good for very mixed ages.
- Family mode (parent reads): read-aloud off, a "Host" view that shows the parent the question, the answer and the fun fact on one card, and a big "Reveal" button. This mirrors Brain Quest's "quiz each other" play and is the best mode when the iPad is propped on the dinner table.

---

## 8. Visual design cues for the trivia screen

- Category badge: a rounded chip top-left with emoji plus label ("🦁 Animals"), coloured per category but always labelled in text (SC 1.4.1). Category colour also tints the tile borders lightly so the screen "belongs" to the category.
- Progress: a row of dots ("question 3 of 10") rather than a numeric fraction at Easy; filled dots for answered, a slightly larger dot for the current one, and a 🔁 mark on dots that are re-asks. Never show a countdown ring unless the Hard speed round is on.
- Question card: large type (Easy 28–32 px, Medium 24 px, Hard 20 px), a speaker button and the Español pill in the card header, generous line height for read-along highlighting.
- Answer tiles: full-width stacked tiles on phones, 2 × 2 grid on iPad; Easy tiles carry a large emoji (48–64 px) with one or two words beneath; 88 px minimum height at Easy, 64 px otherwise; 12–16 px gaps to prevent mis-taps.
- Correct animation: calm and brief (under 700 ms): tile turns green with a check mark, a small star floats to the star counter, the mascot hops once. No confetti storms, no sounds louder than the voice. Under `prefers-reduced-motion`, swap for a colour fade and a static star.
- Incorrect: the tapped tile fades to neutral with a soft "not this one" outline, the correct tile turns green with a check, and the feedback card slides up with the reason and fun fact. No red X, no buzzer, no shake. The mascot stays neutral-curious, never sad.
- Feedback card: answer line in bold, one-sentence reason, fun fact with a 💡, a "Read it to me" button, and a single "Next" button that is the only way forward (no auto-advance, so the child controls pacing).
- Results screen: star row, category rank progress bar ("Explorer: 18/25 to Guide"), a "What I learned" list of the round's facts with emoji badges, badges earned this round with a plain sentence explaining why, and two equal-weight buttons: "Play again" and "Choose a category". Nothing on this screen counts down, nags, or asks the child to return tomorrow.
- Dark patterns to avoid explicitly: no fake scarcity, no "last chance" copy, no auto-play into another round, no interstitials, no emotional mascot guilt, no comparison with other children.

---

## Recommendations (one page)

Round length
- Easy (4–6): 5 questions per round, about 3–4 minutes. Medium (7–10): 8 questions. Hard (11–15): 10 questions, with an optional 15-question Challenge.
- Every round ends with a results screen and a "Play again / Choose a category" pair. No auto-advance.

Choices per question
- Easy: 3 choices with emoji pictures, read aloud automatically, 88 px tiles minimum. Medium: 3–4 choices. Hard: 4 choices with plausible distractors (fall back to 3 if a fourth plausible lure does not exist).

Timer policy
- Easy: never. Medium and Hard: off by default. Hard only: opt-in Speed round with a non-scoring 30 s bar that reveals the answer when it ends. Time never subtracts points or ends the round.

Formats and share
- Easy: MC/picture choice 70%, true-false and "which is bigger" 30%.
- Medium: MC 55%, true-false/bigger 15%, tap-in-order 15%, slider estimate 5%, typed 10%.
- Hard: MC (incl. odd-one-out, two truths and a lie) 50%, true-false/bigger 10%, tap-in-order 15%, slider 10%, typed 15%.
- No drag interactions below Hard; tap-to-order everywhere.

Feedback loop
- Immediate feedback on every answer: correct answer first, one-line reason, fun fact; never the word "wrong", no red X, no buzzer, no sad mascot.
- Missed question returns 3–4 questions later as "One more look" (max two re-asks per round at Easy) and again in next week's set.
- Results screen lists "What I learned"; a "This week I learned" card persists on the trivia home screen until the next session.

Reward scheme
- One star per correct answer (including second-chance correct); stars are never removed.
- Category ranks: Sprout 10, Explorer 25, Guide 60, Expert 120 correct, permanent.
- Badges for competence milestones only (category 25, 20 fun facts read, 5 second-look successes, 10 Spanish answers); outlines shown for unearned badges, no countdowns.
- Weekly "New this week" set of 10 per level; no streaks, lives, leaderboards, notifications or locked content.
- Occasional unpredictable mascot delight (roughly 1 in 6 rounds).

Bilingual
- Per-question "Español / English" pill with 🌐, no flags; remembered per level in localStorage; offer to switch the whole next round if most questions were toggled.
- Voice: `lang="es-MX"`, prefer es-MX/es-US, then es-419, then any es-*, avoid Eloquence voices when a better one exists; start speech in the tap handler; show a mute-switch hint if speech fails.
- Untranslatable items get a Spanish counterpart question or hide the toggle with a note; at most one such item per round in Spanish mode.

Two-player and family
- Pass-and-play for 1–4 named players, each with own level and language; strict alternation with a hand-off screen; stars shown side by side, no winner banner; optional Team mode with a shared goal; Host mode with a parent-facing answer card and Reveal button.

Accessibility
- Targets at least 64 px (88 px at Easy); colour paired with icon and text; `prefers-reduced-motion` honoured plus a Calm mode toggle; correct `lang` attributes for screen readers.

---

## Sources

Retrieval practice, feedback timing, hypercorrection
- Káldi et al. 2025, Multiple Practice Success Scaffolds Long-Term Test-Enhanced Learning in Preschoolers, Child Development: https://pmc.ncbi.nlm.nih.gov/articles/PMC12598443/
- Memorial consequences of testing school-aged children (Memory, 2012): https://www.tandfonline.com/doi/abs/10.1080/09658211.2012.708757
- Retrieval Practice in Classroom Settings: A Review of Applied Research (Frontiers in Education): https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2019.00005/full
- Retrieval-Based Learning: A Decade of Progress (ERIC): https://files.eric.ed.gov/fulltext/ED599273.pdf
- A (Preliminary) Recipe for Obtaining a Testing Effect in Preschool Children: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6110808/
- Metcalfe, Kornell & Finn 2009, Delayed versus immediate feedback in children's and adults' vocabulary learning, Memory & Cognition: https://web.williams.edu/Psychology/Faculty/Kornell/Publications/Metcalfe.Kornell.Finn.2009.pdf
- Metcalfe & Finn, Hypercorrection of high confidence errors in children: https://www.columbia.edu/cu/psychology/metcalfe/PDFs/MetcalfeFinn2012.pdf
- Timing of feedback and retrieval practice (Humanities and Social Sciences Communications, 2024): https://www.nature.com/articles/s41599-024-03983-6
- Duolingo, Why is spaced repetition so important: https://blog.duolingo.com/spaced-repetition-for-learning/

Feedback content and wording
- Van der Kleij et al., Effects of Feedback in a Computer-Based Learning Environment: A Meta-Analysis: https://www.researchgate.net/publication/272923307
- Wisniewski, Zierer & Hattie 2020, The Power of Feedback Revisited: https://www.researchgate.net/publication/338745455_The_Power_of_Feedback_Revisited_A_Meta-Analysis_of_Educational_Feedback_Research
- Swart et al., Supporting learning from text: timing and content of effective feedback: https://www.sciencedirect.com/science/article/pii/S1747938X1930154X
- Right or wrong? How feedback content and source influence children's mathematics performance and persistence (JECP 2024): https://www.sciencedirect.com/science/article/abs/pii/S0022096524000055
- Bing Nursery School / Dweck, Praising Intelligence: Costs to Children's Self-Esteem and Motivation: https://bingschool.stanford.edu/news/praising-intelligence-costs-childrens-self-esteem-and-motivation
- Mindset Kit, Do's and don'ts of praise: https://www.mindsetkit.org/topics/praise-process-not-person/dos-donts-of-praise

Timers, anxiety, Kahoot!
- Stanford GSE, Boaler: timed tests and the development of math anxiety: https://ed.stanford.edu/news/boaler-timed-tests-and-development-math-anxiety
- EdWeek, Timed Tests and the Development of Math Anxiety: https://www.edweek.org/teaching-learning/opinion-timed-tests-and-the-development-of-math-anxiety/2012/07
- Filling the Pail, Timed tests and maths anxiety (meta-analysis caveat): https://fillingthepail.substack.com/p/timed-tests-and-maths-anxiety
- Wang & Tahir 2020, The effect of using Kahoot! for learning – A literature review, Computers & Education: https://www.sciencedirect.com/science/article/pii/S0360131520300208
- Kahoot! time settings (default 20 s): https://support.kahoot.com/hc/en-us/community/posts/23247335854611-Time-Settings-Quickest-Fast-Medium-Slow-Very-Slow-Slowest
- Kahoot! answer streak bonus: https://support.kahoot.com/hc/en-us/community/posts/360033686653-Disable-Answer-Streak-Bonus
- Wayground/Quizizz, Navigate Session Settings (timer off): https://support.wayground.com/hc/en-us/articles/115000923931-Navigate-Session-Settings

Products
- Tech & Learning, What Is Kahoot! Kids: https://www.techlearning.com/how-to/what-is-kahoot-kids-and-how-does-it-work-tips-and-tricks
- Kahoot! Kids press release: https://kahoot.com/press/2021/12/15/meet-kahoot-kids-a-new-app-experience/
- Common Sense Media, Khan Academy Kids: https://www.commonsensemedia.org/app-reviews/khan-academy-kids
- Educational App Store, Khan Academy Kids review: https://www.educationalappstore.com/app/khan-academy-kids
- Duolingo, Time spent learning well: https://blog.duolingo.com/time-spent-learning-well/
- Duolingo, How the streak builds habit: https://blog.duolingo.com/how-duolingo-streak-builds-habit
- Duoplanet, It's time for Duolingo to ditch the heart system: https://duoplanet.com/its-time-for-duolingo-to-ditch-the-heart-system/
- Wayground/Quizizz question types: https://forbusiness-support.wayground.com/hc/en-us/articles/360044402691-All-Questions-Types-on-Quizizz-for-Work
- Wayground reorder question type: https://wayground.com/home/en/reorder-questions-on-quizizz
- Tech & Learning, What Is Blooket: https://www.techlearning.com/how-to/what-is-blooket-and-how-does-it-work-tips-and-tricks
- NBC News, child-protection nonprofit alleges manipulative upselling in Prodigy: https://www.nbcnews.com/tech/tech-news/child-protection-nonprofit-alleges-manipulative-upselling-math-game-prodigy-n1258294
- Fairplay, 7 reasons to say no to Prodigy: https://fairplayforkids.org/pf/prodigy/
- Common Sense Media, Trivia Crack: https://www.commonsensemedia.org/app-reviews/trivia-crack
- Common Sense Media, Trivia Crack 2: https://www.commonsensemedia.org/app-reviews/trivia-crack-2
- Smarter Learning Guide, Brain Quest review: https://smarterlearningguide.com/brain-quest-review/
- UltraBoardGames, Brain Quest rules: https://www.ultraboardgames.com/brain-quest/game-rules.php
- Rainbow Resource, Brain Quest Smart Cards: https://www.rainbowresource.com/brain-quest-smart-cards
- Nat Geo Kids Quiz Whiz (Penguin Random House): https://www.penguinrandomhouse.com/books/217645/national-geographic-kids-quiz-whiz-by-national-geographic-kids/
- Screenwise, Duolingo streaks and anxiety in kids: https://screenwiseapp.com/guides/duolingo-streaks-and-anxiety-in-kids
- UX Magazine, The Psychology of Hot Streak Game Design: https://uxmag.com/articles/the-psychology-of-hot-streak-game-design-how-to-keep-players-coming-back-every-day-without-shame

Option counts, attention, children's UX
- Rodriguez 2005, Three Options Are Optimal for Multiple-Choice Items: https://onlinelibrary.wiley.com/doi/10.1111/j.1745-3992.2005.00006.x (PDF: http://edmeasurement.net/8268/Rodriguez-2005-Random-effects-meta-analysis-three-options.pdf)
- NN/G, UX Design for Children (Ages 3–12): https://www.nngroup.com/reports/children-on-the-web/
- NN/G, Design for Kids Based on Their Stage of Physical Development: https://www.nngroup.com/articles/children-ux-physical-development/
- NN/G, Designing for Kids: Cognitive Considerations: https://www.nngroup.com/articles/kids-cognition/
- Tutero, attention span by age: https://www.tutero.com/us/blog/improving-attention-span-of-students
- Kids' Directory, Normal attention spans for kids: https://www.kids-houston.com/normal-attention-spans-for-kids/
- Natalie Hutton, Attention span: https://www.nataliehutton.com/blog/attention-span
- Siegler & Ramani, linear number board games (CMU PDF): https://www.cmu.edu/dietrich/psychology/cs/research-teaching/docs/SieglerBoardGamesCDPerp2009.pdf
- Ramani & Siegler 2008, Child Development: https://siegler.tc.columbia.edu/wp-content/uploads/2019/02/r-jhnsn-etal-01.pdf

Motivation and rewards
- Deci, Koestner & Ryan 1999 meta-analysis (Semantic Scholar): https://www.semanticscholar.org/paper/8ad9801baea65b40fbbe6fc56e34b2b7be47d0ba
- Deci, Koestner & Ryan 2001, Extrinsic Rewards and Intrinsic Motivation in Education: https://www.selfdeterminationtheory.org/SDT/documents/2001_DeciKoestnerRyan.pdf
- Overjustification effect (Lepper, Greene & Nisbett 1973): https://en.wikipedia.org/wiki/Overjustification_effect
- Self-Determination Theory in Digital Games (Springer): https://link.springer.com/chapter/10.1007/978-3-319-29904-4_8
- Sailer & Homner 2020, The Gamification of Learning: A Meta-Analysis: https://eric.ed.gov/?id=EJ1245270
- Gamification enhances intrinsic motivation, autonomy and relatedness (ETR&D 2023): https://link.springer.com/article/10.1007/s11423-023-10337-7
- Points-based reward systems and children's psychological needs (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC6566098/

Accessibility
- WCAG 2.5.8 Target Size implementation guide (AllAccessible): https://www.allaccessible.org/blog/wcag-258-target-size-minimum-implementation-guide
- TestParty, WCAG target size guide (error-rate figures): https://testparty.ai/blog/wcag-target-size-guide
- W3C, Understanding SC 1.4.1 Use of Color: https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-without-color.html
- Section508.gov, Making Color Usage Accessible: https://www.section508.gov/create/making-color-usage-accessible/
- web.dev, Animation and motion: https://web.dev/learn/accessibility/motion
- MDN, prefers-reduced-motion: https://developer.mozilla.org/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
- W3C technique C39 (reduced motion): https://www.w3.org/WAI/WCAG22/Techniques/css/C39.html

Bilingual and speech
- Flags Are Not Languages, best practice for presenting languages: https://www.flagsarenotlanguages.com/blog/best-practice-for-presenting-languages/
- SimpleLocalize, Flags in language selectors: https://simplelocalize.io/blog/posts/flags-as-language-in-language-selector/
- Localize, Why flag icons are bad UX: https://localizejs.com/articles/why-using-flag-icons-can-confuse-your-users
- MDN, SpeechSynthesis.getVoices(): https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices
- MDN, voiceschanged event: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event
- Talkr, Lessons learned using speechSynthesis: https://talkrapp.com/speechSynthesis.html
- Apple Developer Forums, TTS voices missing from Web Speech on iOS 18: https://developer.apple.com/forums/thread/764438
- Apple Developer Forums, not all installed voices listed on iPad: https://developer.apple.com/forums/thread/723503

Family and pass-and-play
- Trivial Pursuit Family Edition (Amazon listing, kids vs adult cards): https://www.amazon.com/Hasbro-Games-Trivial-Pursuit-Family/dp/B0017RQYEQ
- What's Good to Play, Trivial Pursuit Family Edition review: https://whatsgoodtoplay.co.uk/trivial-pursuit-family-edition-review/
- Family Trivia Games & Quiz AI (App Store): https://apps.apple.com/us/app/family-trivia-games-quiz-ai/id6749456680
- Matching Pairs 2-player mode (App Store): https://apps.apple.com/us/app/matching-pairs-concentration/id877559971
- Hotseat multiplayer mode: https://en.wikipedia.org/wiki/Hotseat_(multiplayer_mode)
- Joan Ganz Cooney Center, Sandbox (co-design with kids and families): https://joanganzcooneycenter.org/initiative/sandbox/
