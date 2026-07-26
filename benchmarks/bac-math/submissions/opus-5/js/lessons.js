// One lesson per topic.
//
// These are lessons on the *topic*, never solutions to the question in front
// of the student — the point is to send somebody who is stuck to the thing
// they are missing, without handing them the answer to the item they are on.
//
// Blocks: text, method (numbered steps), example (worked, with the barem
// split marked), trap, workshop (the electrician hook, only where it is a
// real link and not a stretch), and barem (what the marks are actually for).

(function (global) {
  "use strict";

  const BAC = (global.BAC = global.BAC || {});
  const { M, ml } = BAC.core;

  const D = (body) => `<div class="lesson-display">${M.block(body)}</div>`;

  const LESSONS = {

    /* ------------------------------------------------------------------ */
    numbers: {
      onThePaper: "Subiectul I, item 1 — the first five marks on the paper, and the ones most often thrown away.",
      blocks: [
        { kind: "text", body: `Item 1 is arithmetic. It is not there to be clever; it is there to be <em>right</em>. Every year it is a short expression with fractions, decimals, roots or logarithms in it, and the answer is always a whole number or a tidy fraction. If your answer is not tidy, you have made a slip — that is a useful alarm, and it is free.` },

        { kind: "method", title: "The order that keeps the numbers small", steps: [
          `<strong>Brackets first.</strong> Nearly every version of this item has a bracket, and nearly every barem gives 3 of the 5 points for getting the bracket right.`,
          `<strong>Common denominator before you add.</strong> Never add numerators over different denominators, even for a second, even in your head.`,
          `<strong>Divide before you multiply</strong> when it keeps things whole. 24·⅜ is easier as 24 ÷ 8 = 3, then 3 · 3 = 9, than as 72/8.`,
          `<strong>Simplify roots before combining.</strong> √8 · √2 = √16 = 4, not 2.828…`,
          `<strong>Check the shape of the answer.</strong> Whole number? Small fraction? Good. Something like 47/23? Go back.`
        ] },

        { kind: "example", title: "A typical one", lines: [
          `Work out ${ml(M.row(M.frac(M.mn(1), M.mn(10)), M.mo("+"), M.mn(3), M.mo(M.CDOT), M.paren(M.row(M.frac(M.mn(1), M.mn(2)), M.mo(M.MINUS), M.frac(M.mn(1), M.mn(5))))))}.`,
          `<span class="mark">3p</span> The bracket: ${ml(M.row(M.frac(M.mn(1), M.mn(2)), M.mo(M.MINUS), M.frac(M.mn(1), M.mn(5)), M.mo("="), M.frac(M.mn(5), M.mn(10)), M.mo(M.MINUS), M.frac(M.mn(2), M.mn(10)), M.mo("="), M.frac(M.mn(3), M.mn(10))))}`,
          `<span class="mark">2p</span> Then ${ml(M.row(M.frac(M.mn(1), M.mn(10)), M.mo("+"), M.mn(3), M.mo(M.CDOT), M.frac(M.mn(3), M.mn(10)), M.mo("="), M.frac(M.mn(1), M.mn(10)), M.mo("+"), M.frac(M.mn(9), M.mn(10)), M.mo("="), M.mn(1)))}`,
          `Notice how the examiner chose 1/2 and 1/5 so that the bracket lands on 3/10 and the whole thing lands on 1. They always do this.`
        ] },

        { kind: "text", body: `<strong>Roots.</strong> Two facts do almost all the work: √a·√b = √(ab), and (√a)² = a. A third is worth memorising because the exam leans on it: (a + b)(a − b) = a² − b², which is why multiplying by the <em>conjugate</em> makes a root disappear. That is the whole trick behind rationalising a denominator.` },

        { kind: "text", body: `<strong>Logarithms.</strong> log<sub>a</sub> a<sup>n</sup> = n, and that is the only fact most of these need. lg means log base 10, and ln means log base e. So lg 1000 = 3 because 1000 = 10³.` },

        { kind: "trap", body: `Decimals and fractions in the same expression. Convert one way or the other before you start — mixing them mid-calculation is where the errors come from. 0,25 is 1/4; 0,5 is 1/2; 0,2 is 1/5.` },

        { kind: "trap", body: `3√2 + 2√2 = 5√2, but 3√2 · 2√2 = 6·2 = 12. Adding keeps the root, multiplying can kill it.` },

        { kind: "workshop", body: `Two resistors in parallel: 1/R = 1/R₁ + 1/R₂. With R₁ = 6 Ω and R₂ = 3 Ω, 1/R = 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2, so R = 2 Ω. That is exam item 1 with units on it — common denominator, add, invert. If you can do it at the bench you can do it on the paper.` },

        { kind: "barem", body: `Five points, split 3 and 2 or 2 and 3. The bigger half is for the substantive step — usually the bracket or the common denominator — and the smaller for the finish. Write the intermediate line down. A right method with a slip at the end still scores 3.` }
      ]
    },

    /* ------------------------------------------------------------------ */
    progressions: {
      onThePaper: "Subiectul I, item 1, on the years the examiners choose a sequence rather than plain arithmetic.",
      blocks: [
        { kind: "text", body: `A progression is a list of numbers built by the same step every time. <strong>Arithmetic</strong> means you <em>add</em> the same amount r. <strong>Geometric</strong> means you <em>multiply</em> by the same amount q. Everything else follows from that one sentence.` },

        { kind: "method", title: "The four formulas", steps: [
          `Arithmetic term: <strong>a<sub>n</sub> = a<sub>1</sub> + (n − 1)r</strong>. The (n − 1) catches people out — to get to the 5th term you take 4 steps, not 5.`,
          `Arithmetic sum: <strong>S<sub>n</sub> = (a<sub>1</sub> + a<sub>n</sub>)·n / 2</strong>. First plus last, times how many, over two.`,
          `Geometric term: <strong>b<sub>n</sub> = b<sub>1</sub>·q<sup>n−1</sup></strong>.`,
          `Geometric sum: <strong>S<sub>n</sub> = b<sub>1</sub>(q<sup>n</sup> − 1)/(q − 1)</strong>, for q ≠ 1.`
        ] },

        { kind: "text", body: `Two more facts the exam likes. Three numbers are in arithmetic progression exactly when <strong>2b = a + c</strong> — the middle one is the average of its neighbours. Three numbers are in geometric progression exactly when <strong>b² = ac</strong>.` },

        { kind: "example", title: "Finding r from two terms that are not next to each other", lines: [
          `a<sub>3</sub> = 7 and a<sub>7</sub> = 23. Find a<sub>1</sub>.`,
          `<span class="mark">3p</span> Going from term 3 to term 7 is 4 steps, so 4r = 23 − 7 = 16 and r = 4.`,
          `<span class="mark">2p</span> a<sub>1</sub> = a<sub>3</sub> − 2r = 7 − 8 = −1.`,
          `Count the <em>gaps</em>, not the terms. From term i to term j is j − i steps.`
        ] },

        { kind: "trap", body: `In a geometric progression q can be negative, and then the terms alternate in sign. If you are told the terms are positive, say so when you pick the positive root — that sentence is worth marks.` },

        { kind: "workshop", body: `Preferred resistor values are a geometric progression. The E12 series — 10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82 — is what you get by multiplying by roughly 1,21 each time and rounding: twelve steps take you from 10 to 100. That is why the same numbers keep appearing in every parts drawer.` },

        { kind: "barem", body: `The first marks go to naming r or q and writing the general term. Even if the arithmetic at the end goes wrong, "a<sub>n</sub> = a<sub>1</sub> + (n − 1)r, so r = 4" on the page is worth points.` }
      ]
    },

    /* ------------------------------------------------------------------ */
    percentages: {
      onThePaper: "Subiectul I, item 4, on the years it is money rather than probability. Four of the nine papers in the corpus.",
      blocks: [
        { kind: "text", body: `Every percentage question on this paper is one idea: <strong>a percentage is always a percentage of something</strong>, and the whole difficulty is being sure what that something is.` },

        { kind: "method", title: "Three shapes, and they are all the same equation", steps: [
          `<strong>p% of N</strong> is N · p/100. A rise of 20% on 300 lei is 60 lei.`,
          `<strong>The price after a change.</strong> A rise of p% multiplies by (100 + p)/100; a discount of p% multiplies by (100 − p)/100. A 20% rise on 300 is 300 · 1,2 = 360 in one step.`,
          `<strong>The price before a change</strong> — this is the one the exam actually sets. If a 20% discount leaves the price at 240, then 80% of the old price is 240, so the old price is 240 · 100/80 = 300.`
        ] },

        { kind: "example", title: "The exam's own wording", lines: [
          `"After a rise of 15% a product costs 230 lei. Find the price before the rise."`,
          `<span class="mark">3p</span> A rise of 15% makes the new price 115% of the old, so 1,15 · x = 230.`,
          `<span class="mark">2p</span> x = 230 · 100/115 = 200 lei.`,
          `Check forwards: 15% of 200 is 30, and 200 + 30 = 230. ✓ The check takes ten seconds and catches the standard mistake.`
        ] },

        { kind: "trap", body: `The standard mistake: taking 15% of 230 and subtracting it. That gives 195,50, which is wrong, because the 15% was charged on the <em>old</em> price, not the new one. If your answer is not a round number, suspect this.` },

        { kind: "trap", body: `A 20% rise followed by a 20% discount does not bring you back. 100 → 120 → 96. The second percentage is taken from a bigger number.` },

        { kind: "workshop", body: `A resistor marked 220 Ω ±5% is guaranteed only to be between 209 Ω and 231 Ω — 5% of 220 is 11, either way. The same arithmetic decides whether two of them in series can be relied on to stay inside a tolerance band.` },

        { kind: "barem", body: `The 3 points are for the equation — "115% of x is 230" — not for the answer. Write the equation down before you touch the calculator.` }
      ]
    },

    /* ------------------------------------------------------------------ */
    functions: {
      onThePaper: "Subiectul I, item 2 — always a first-degree function. Second-degree functions turn up in Subiectul II and III instead.",
      blocks: [
        { kind: "text", body: `f(x) = ax + b is a machine: you put x in, it multiplies by a and adds b. f(3) means "put 3 in". That is all item 2 ever asks, dressed up in different words.` },

        { kind: "method", title: "The three questions they ask", steps: [
          `<strong>"Calculate f(k)"</strong> — substitute. Watch the signs when k is negative: f(−2) = a(−2) + b.`,
          `<strong>"Find a for which f(a) = 0"</strong> — solve ax + b = 0, so x = −b/a. This is where the graph crosses Ox.`,
          `<strong>"Find a for which f(2) = a + f(0)"</strong> — the trap version. The letter <em>a</em> here is <em>not</em> the coefficient. Work out both function values as numbers first, then solve the little equation that is left.`
        ] },

        { kind: "example", title: "The self-referential one", lines: [
          `f(x) = 6x − 3. Find the real number a with f(2) = a + f(0).`,
          `<span class="mark">2p</span> f(2) = 12 − 3 = 9 and f(0) = −3.`,
          `<span class="mark">3p</span> 9 = a − 3, so a = 12.`,
          `The two function values are worth marks on their own, before any equation is solved. Write them on their own line.`
        ] },

        { kind: "text", body: `<strong>Second-degree functions</strong> f(x) = ax² + bx + c. Three things to know. The graph is a parabola, opening upwards when a &gt; 0 and downwards when a &lt; 0. Its vertex is at <strong>x = −b/(2a)</strong>, and that is the minimum when a &gt; 0 and the maximum when a &lt; 0. The roots satisfy <strong>Viète: x₁ + x₂ = −b/a and x₁x₂ = c/a</strong>, which lets you answer questions about the roots without ever finding them.` },

        { kind: "text", body: `The identity that unlocks most Viète questions: <strong>x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂</strong>. Learn it as a sentence — "sum of squares is square of sum minus twice the product".` },

        { kind: "trap", body: `Δ = b² − 4ac. Δ &gt; 0 means two roots, Δ = 0 means one repeated root, Δ &lt; 0 means none. "Two equal roots" always means Δ = 0 — that sentence is the whole first half of those questions.` },

        { kind: "workshop", body: `The power a source delivers to a load is P = EI − rI², a downward parabola in I. Its maximum is at I = E/(2r) — exactly −b/(2a) — and that is the maximum power transfer condition. The vertex formula is not an abstraction; it is where you set the current.` },

        { kind: "barem", body: `Substituted values first, equation second. On a 5-point item the substitution alone is usually 2p.` }
      ]
    },

    /* ------------------------------------------------------------------ */
    equations: {
      onThePaper: "Subiectul I, item 3 — every single paper. Exponential, logarithmic, or under a square root.",
      blocks: [
        { kind: "text", body: `All three kinds work the same way: <strong>undo the operation on both sides</strong>, then solve what is left. What differs is the check you have to do afterwards.` },

        { kind: "method", title: "Exponential: same base on both sides", steps: [
          `Write both sides as powers of the same base. 8 = 2³, 1/9 = 3<sup>−2</sup>, 25 = 5².`,
          `Then the exponents must be equal, because a<sup>x</sup> is one-to-one.`,
          `Solve the ordinary equation that remains.`,
          `No check needed — a<sup>x</sup> is defined for every real x.`
        ] },

        { kind: "method", title: "Logarithmic: the domain is the question", steps: [
          `log<sub>a</sub> A = k means <strong>A = a<sup>k</sup></strong>. Write that line down.`,
          `Solve for x.`,
          `<strong>Check every solution makes the inside positive.</strong> This is not optional bookkeeping; it is where the last marks are.`
        ] },

        { kind: "method", title: "Square root: squaring can invent solutions", steps: [
          `√A = B forces <strong>B ≥ 0</strong> — a square root is never negative. Note that before you square.`,
          `Square both sides: A = B².`,
          `Solve, then throw out any root that breaks B ≥ 0 or makes A negative.`
        ] },

        { kind: "example", title: "The one with a rejection", lines: [
          `Solve √(2x + 1) = x.`,
          `<span class="mark">3p</span> Squaring: 2x + 1 = x², so x² − 2x − 1... — in the exam's version the numbers are chosen to factorise, giving two roots, one positive and one negative.`,
          `<span class="mark">2p</span> The right-hand side is x, and a square root cannot be negative, so x ≥ 0. The negative root goes.`,
          `The final 2 points are for the rejection, not the algebra. Say <em>why</em> you are rejecting it.`
        ] },

        { kind: "text", body: `<strong>Above the exam:</strong> when the same base appears twice with different exponents — 4<sup>x</sup> − 3·2<sup>x</sup> + 2 = 0 — substitute t = 2<sup>x</sup> and note 4<sup>x</sup> = (2<sup>x</sup>)² = t². You get a quadratic in t. Solve it, then go back. Any negative t is rejected, because 2<sup>x</sup> is always positive.` },

        { kind: "trap", body: `log A + log B = log(AB), not log(A + B). And log(A − B) is nothing at all — there is no rule for it.` },

        { kind: "workshop", body: `A capacitor discharging through a resistor obeys U = U₀e<sup>−t/RC</sup>. Asking "when has it dropped to a tenth?" is exactly the log equation on this paper: e<sup>−t/RC</sup> = 0,1, so −t/RC = ln 0,1 and t = RC·ln 10 ≈ 2,3RC. The exam version has friendlier numbers; the method is identical.` },

        { kind: "barem", body: `3 points for getting rid of the exponential, logarithm or root correctly; 2 for solving and — where it matters — for the check. Papers that show no check lose those 2 points even with the right answer written down.` }
      ]
    },

    /* ------------------------------------------------------------------ */
    probability: {
      onThePaper: "Subiectul I, item 4 — the more common of the two versions of that slot.",
      blocks: [
        { kind: "text", body: `Every probability question on this paper is <strong>favourable cases over possible cases</strong>, where all the cases are equally likely. There is no conditional probability, no independence, no tree diagrams. The work is entirely in the counting.` },

        { kind: "method", title: "How to do it without losing marks", steps: [
          `<strong>Count the possible cases.</strong> The set is written out, so this is just how many numbers are in it. Say the number out loud on the page — it is worth 2p on its own.`,
          `<strong>Test the condition on every element.</strong> Do not look for a pattern; with ten numbers, checking all ten is faster and safer.`,
          `<strong>Write the fraction and simplify it.</strong> 5/10 should be written as 1/2.`
        ] },

        { kind: "example", title: "A real one", lines: [
          `A number n is chosen from A = {1,2,…,8}. Find the probability that n(n + 1) is a multiple of 10.`,
          `<span class="mark">2p</span> A has 8 elements, so 8 possible cases.`,
          `<span class="mark">3p</span> Work out n(n+1) for each: 2, 6, 12, 20, 30, 42, 56, 72. The multiples of 10 are 20 and 30, so 2 favourable cases and p = 2/8 = 1/4.`,
          `Writing the eight products out is the answer. There is no cleverer route, and the examiner does not expect one.`
        ] },

        { kind: "text", body: `<strong>Counting formulas</strong>, when they come up: permutations P<sub>n</sub> = n! (arrange all of them), arrangements A<sup>k</sup><sub>n</sub> = n!/(n−k)! (choose k <em>in order</em>), combinations C<sup>k</sup><sub>n</sub> = n!/(k!(n−k)!) (choose k, order irrelevant). A set with n elements has 2<sup>n</sup> subsets.` },

        { kind: "text", body: `The one worth having at your fingertips: <strong>C<sup>2</sup><sub>n</sub> = n(n − 1)/2</strong>. "How many ways to pick two out of n" comes up constantly, and the equation C<sup>2</sup><sub>n</sub> = 45 just means n(n − 1) = 90, so n = 10.` },

        { kind: "trap", body: `"At random from the set" means every element is equally likely. If the question ever gave you weights it would not be this exam.` },

        { kind: "workshop", body: `Take a batch of 10 fuses with 2 known duds. The chance that two pulled out together are both good is C(8,2)/C(10,2) = 28/45. Same formula, and the reason batch testing works.` },

        { kind: "barem", body: `2p for the number of possible cases, 3p for the favourable ones and the fraction. Even if you miscount the favourable ones, "there are 10 possible cases" is 2 points already banked.` }
      ]
    },

    /* ------------------------------------------------------------------ */
    geometry: {
      onThePaper: "Subiectul I, item 5 — every paper, always points in the xOy frame.",
      blocks: [
        { kind: "text", body: `Analytic geometry turns pictures into arithmetic. Four formulas cover every version of item 5 the examiners have set.` },

        { kind: "method", title: "The four", steps: [
          `<strong>Distance:</strong> AB = √[(x<sub>B</sub> − x<sub>A</sub>)² + (y<sub>B</sub> − y<sub>A</sub>)²]. It is Pythagoras with the legs written as differences.`,
          `<strong>Midpoint:</strong> M((x<sub>A</sub> + x<sub>B</sub>)/2, (y<sub>A</sub> + y<sub>B</sub>)/2). Just the averages.`,
          `<strong>Vector:</strong> AB has coordinates (x<sub>B</sub> − x<sub>A</sub>, y<sub>B</sub> − y<sub>A</sub>) — the same differences again.`,
          `<strong>Slope:</strong> m = (y<sub>B</sub> − y<sub>A</sub>)/(x<sub>B</sub> − x<sub>A</sub>).`
        ] },

        { kind: "text", body: `From the slope come the two relations the harder items test: two lines are <strong>parallel</strong> when m₁ = m₂, and <strong>perpendicular</strong> when <strong>m₁·m₂ = −1</strong>. Three points are <strong>collinear</strong> when the slope from A to B equals the slope from A to C.` },

        { kind: "example", title: "Proving a triangle is isosceles", lines: [
          `A(2,3), B(5,6), C(6,2). Show that ABC is isosceles.`,
          `<span class="mark">3p</span> AB² = 3² + 3² = 18.`,
          `<span class="mark">2p</span> AC² = 4² + (−1)² = 17. Not equal — so try the other pairing: BC² = 1² + (−4)² = 17 = AC², so AC = BC. Isosceles. ✓`,
          `<strong>Compare the squares.</strong> There is no need to take square roots at all, and roots are where the arithmetic goes wrong.`
        ] },

        { kind: "text", body: `<strong>Above the exam:</strong> the determinant test. Three points are collinear exactly when
          ${D(M.eq(M.detBars([[M.sub(M.mi("x"), M.mi("A")), M.sub(M.mi("y"), M.mi("A")), M.mn(1)], [M.sub(M.mi("x"), M.mi("B")), M.sub(M.mi("y"), M.mi("B")), M.mn(1)], [M.sub(M.mi("x"), M.mi("C")), M.sub(M.mi("y"), M.mi("C")), M.mn(1)]]), M.mn(0)))}
          and the area of the triangle is half the absolute value of that determinant. One calculation, two questions — and it connects Subiectul I to the matrices in Subiectul II.` },

        { kind: "trap", body: `A vertical line has no slope at all (the denominator is zero). If two x-coordinates are equal, say "AB is vertical" rather than dividing by zero.` },

        { kind: "workshop", body: `Voltage and current in an AC circuit are drawn as phasors — arrows with coordinates, added tip to tail exactly like vectors here. The size of the resultant is the same distance formula.` },

        { kind: "barem", body: `Each computed length or slope is worth marks on its own. Write AB² = 18 before you write anything about the triangle being isosceles.` }
      ]
    },

    /* ------------------------------------------------------------------ */
    trigonometry: {
      onThePaper: "Subiectul I, item 6 — every paper. Either a right triangle or an expression in the special angles.",
      blocks: [
        { kind: "text", body: `Two things get tested: whether you know the special values by heart, and whether you can see which ratio a right triangle is asking for. Both are memory, and both are cheap marks.` },

        { kind: "method", title: "The table you must know cold", steps: [
          `sin 0° = 0, sin 30° = 1/2, sin 45° = √2/2, sin 60° = √3/2, sin 90° = 1.`,
          `cos runs the same list backwards: cos 0° = 1, cos 30° = √3/2, cos 45° = √2/2, cos 60° = 1/2, cos 90° = 0.`,
          `tg 45° = 1, tg 30° = √3/3, tg 60° = √3.`,
          `(sin 60°)² = 3/4 and (sin 45°)² = 1/2 — squaring first keeps the roots out of the arithmetic.`
        ] },

        { kind: "method", title: "In a right triangle", steps: [
          `<strong>sin</strong> = opposite / hypotenuse. <strong>cos</strong> = adjacent / hypotenuse. <strong>tg</strong> = opposite / adjacent.`,
          `Name the hypotenuse first — it is the side facing the right angle — then decide which leg is opposite the angle you were given.`,
          `Pythagoras for the third side; area is (leg · leg)/2.`,
          `The altitude from the right angle is h = (leg · leg)/hypotenuse, which comes from writing the area two different ways.`,
          `The median to the hypotenuse is half the hypotenuse.`
        ] },

        { kind: "example", title: "Legs in a ratio", lines: [
          `Triangle MNP has a right angle at M, MN = 4·MP and MN = 8. Find its area.`,
          `<span class="mark">2p</span> MP = 8/4 = 2.`,
          `<span class="mark">3p</span> The legs are the base and the height, so the area is 8·2/2 = 8.`,
          `Nothing trigonometric happened at all. Read the triangle before reaching for sin.`
        ] },

        { kind: "text", body: `Two identities carry the harder items: <strong>sin²x + cos²x = 1</strong> for every angle, and <strong>sin(180° − x) = sin x</strong> with <strong>cos(180° − x) = −cos x</strong>. The second is "reduction to the first quadrant", and it is how an expression with 130° in it collapses to one with 50°.` },

        { kind: "text", body: `<strong>Above the exam:</strong> in a triangle that is <em>not</em> right-angled, the cosine rule a² = b² + c² − 2bc·cos A finds a side, and the sine rule a/sin A = 2R finds an angle or the circumscribed radius. With a 120° angle, cos is negative, so the last term adds.` },

        { kind: "workshop", body: `A mains supply is u(t) = U√2·sin(2π·50·t). Everything about phase, power factor and why a 230 V supply peaks at 325 V is this same sine. cos φ on a motor's plate is literally the cosine of an angle in a right triangle drawn from real and reactive power.` },

        { kind: "barem", body: `Each value substituted is worth marks. "sin 30° = 1/2" written down before the arithmetic protects half the item.` }
      ]
    },

    /* ------------------------------------------------------------------ */
    matrices: {
      onThePaper: "Subiectul II, problem 1 — every paper in the corpus, without exception. Fifteen points.",
      blocks: [
        { kind: "text", body: `The three parts are always the same shape: a) compute a determinant, b) verify an identity between matrices, c) turn a determinant into an equation or an inequality and solve it. Part a) is nearly free.` },

        { kind: "method", title: "The mechanics", steps: [
          `<strong>Adding</strong> matrices adds matching entries. <strong>Multiplying by a number</strong> multiplies every entry.`,
          `<strong>Multiplying two matrices</strong> is row against column: the entry in row i, column j is row i of the first times column j of the second, multiplied term by term and added.`,
          `<strong>2×2 determinant:</strong> |a b; c d| = ad − bc.`,
          `<strong>3×3 determinant:</strong> expand along a row — and pick the row with the most zeros in it. The signs alternate + − +.`,
          `<strong>det(AB) = det A · det B.</strong> This turns a page of multiplication into one line.`
        ] },

        { kind: "example", title: "The c) part, which is where the paper gets hard", lines: [
          `A(x) = |x 1; 4 x+3|. Find all real x with det A(x) = 0.`,
          `<span class="mark">3p</span> det A(x) = x(x + 3) − 1·4 = x² + 3x − 4.`,
          `<span class="mark">2p</span> x² + 3x − 4 = 0 gives x = −4 and x = 1.`,
          `The determinant is always a quadratic in x for these. Once you have written it out, the matrices are finished with and it is a Subiectul I question.`
        ] },

        { kind: "text", body: `When the c) part is an <strong>inequality</strong>, remember what a quadratic with a positive leading coefficient looks like: a parabola opening upwards, so it is <strong>≤ 0 exactly between its roots</strong> and ≥ 0 outside them. Sketch it in the margin — faster and safer than a sign table.` },

        { kind: "text", body: `<strong>Above the exam:</strong> a 2×2 system is a matrix equation, and Cramer's rule solves it with determinants — x = Δ<sub>x</sub>/Δ, where Δ<sub>x</sub> is Δ with the x column replaced by the right-hand side. If Δ ≠ 0 there is exactly one solution.` },

        { kind: "trap", body: `AB and BA are usually different matrices. Never swap the order.` },

        { kind: "trap", body: `In the middle of a 3×3 expansion the sign is <em>minus</em>. More marks are lost to that one sign than to any arithmetic on this paper.` },

        { kind: "workshop", body: `Two mesh equations from Kirchhoff's laws are a 2×2 system, and solving them with determinants is exactly Cramer's rule. The matrix is the circuit's resistances; the right-hand side is the supply voltages.` },

        { kind: "barem", body: `Part a) is 3p for writing the determinant out and 2p for the number. Part c) is 3p for reaching the quadratic and 2p for solving it — so even if the inequality defeats you, getting det A(x) onto the page is worth 3.` }
      ]
    },

    /* ------------------------------------------------------------------ */
    composition: {
      onThePaper: "Subiectul II, problem 2 — in five of the seven official papers in the corpus. Fifteen points.",
      blocks: [
        { kind: "text", body: `A law of composition is just a rule with a funny symbol. x ∗ y = xy + 4(x + y) means "multiply them, then add four times their sum". Part a) asks you to use it on two numbers, and that is genuinely as easy as it looks.` },

        { kind: "method", title: "The one trick that opens part c)", steps: [
          `Every law on this paper has the form <strong>x ∗ y = xy + c(x + y) + d</strong>.`,
          `It always factorises: <strong>x ∗ y = (x + c)(y + c) + (d − c²)</strong>.`,
          `Check it once by expanding, then use it. Almost every hard part c) becomes easy in this form, because a product of two brackets is something you can reason about.`
        ] },

        { kind: "example", title: "Why the factorised form matters", lines: [
          `x ∗ y = xy − 8x − 8y + 8. Find the pairs (m, n) of naturals with m &lt; n and (8 + m) ∗ (8 + n) = 2.`,
          `<span class="mark">3p</span> Factorised: x ∗ y = (x − 8)(y − 8) − 56. With x = 8 + m and y = 8 + n the brackets are just m and n, so the equation is mn − 56 = 2, that is mn = 58.`,
          `<span class="mark">2p</span> 58 = 1·58 = 2·29, so (m, n) ∈ {(1, 58), (2, 29)}.`,
          `Without the factorisation this is a mess. With it, it is a question about the divisors of 58.`
        ] },

        { kind: "text", body: `<strong>Commutativity</strong> — x ∗ y = y ∗ x — is nearly always true here, because the rule only ever uses xy and x + y, and both of those already treat x and y the same. Say that sentence; it is the proof.` },

        { kind: "text", body: `<strong>Above the exam:</strong> the <strong>identity element</strong> e satisfies x ∗ e = x for <em>every</em> x. In factorised form (x + c)(e + c) + k = x, which forces e + c = 1. The <strong>inverse</strong> of an element x is the y with x ∗ y = e, and in factorised form that is one bracket times another equalling 1.` },

        { kind: "trap", body: `"For every real x" means the equation has to hold identically, not just for one convenient x. Comparing coefficients is the way to say that properly.` },

        { kind: "trap", body: `n ∗ (−n) is a favourite, because the (x + y) term vanishes. Look for a substitution that kills a term before grinding.` },

        { kind: "barem", body: `Part a) is 2p for substituting and 3p for the number. Part c) is 3p for the rearrangement — the factorisation, or reducing to a quadratic — and 2p for finishing. The rearrangement is the expensive half.` }
      ]
    },

    /* ------------------------------------------------------------------ */
    polynomials: {
      onThePaper: "Subiectul II, problem 2 — the other version, in two of the seven official papers. Always a cubic.",
      blocks: [
        { kind: "text", body: `You are given f = X³ + aX² + bX + c and asked about its roots — but almost never asked to <em>find</em> them. Viète's relations answer questions about the roots straight from the coefficients, and that is the point of the whole problem.` },

        { kind: "method", title: "Viète for a cubic", steps: [
          `<strong>x₁ + x₂ + x₃ = −a</strong>`,
          `<strong>x₁x₂ + x₁x₃ + x₂x₃ = b</strong>`,
          `<strong>x₁x₂x₃ = −c</strong>`,
          `The signs alternate: minus, plus, minus. That is the only thing to memorise.`
        ] },

        { kind: "method", title: "Two more facts the parts lean on", steps: [
          `<strong>Remainder theorem:</strong> the remainder when f is divided by X − k is f(k). One substitution, no long division.`,
          `<strong>Factor theorem:</strong> f(k) = 0 exactly when X − k divides f. So "show f is divisible by X − 2" means "show f(2) = 0".`,
          `<strong>Sum of squares:</strong> x₁² + x₂² + x₃² = (x₁ + x₂ + x₃)² − 2(x₁x₂ + x₁x₃ + x₂x₃) — the same identity as for quadratics.`
        ] },

        { kind: "example", title: "A c) part", lines: [
          `f = X³ − 3X² + X + m. Find m with 2(x₁ + x₂ + x₃) = 1 + x₁x₂x₃.`,
          `<span class="mark">3p</span> Viète: x₁ + x₂ + x₃ = 3 and x₁x₂x₃ = −m.`,
          `<span class="mark">2p</span> So 2·3 = 1 − m, giving m = −5.`,
          `The roots are never found, and could not be found tidily. That is deliberate.`
        ] },

        { kind: "text", body: `<strong>Above the exam:</strong> when you have found one root k, divide by X − k to get a quadratic and finish it off. Grouping often does the job without dividing: X³ − 3X² + X − 3 = X²(X − 3) + (X − 3) = (X − 3)(X² + 1).` },

        { kind: "trap", body: `A cubic always has at least one real root, but X² + 1 has none — so a cubic can have exactly one. "Show f is divisible by X² + 1" is a factorisation question, not a root question.` },

        { kind: "trap", body: `When hunting for a root by trial, try the divisors of the constant term first: ±1, ±2, ±3 and so on. The examiners always arrange for one of them to work.` },

        { kind: "barem", body: `Writing the Viète relations down is worth 3p before you use them. Do that first, every time, even if you are not sure which one you need.` }
      ]
    },

    /* ------------------------------------------------------------------ */
    derivatives: {
      onThePaper: "Subiectul III, problem 1 — every paper. Fifteen points, and the a) part is almost always given to you.",
      blocks: [
        { kind: "text", body: `Part a) tells you what f′(x) is and asks you to show it. That means you can check yourself as you go: if your derivative does not match theirs, you have made a mistake and you know it before the exam ends. It is the friendliest 5 points on the paper.` },

        { kind: "method", title: "The derivatives you need", steps: [
          `<strong>(x<sup>n</sup>)′ = n·x<sup>n−1</sup></strong>, and constants differentiate to 0.`,
          `<strong>(e<sup>x</sup>)′ = e<sup>x</sup></strong> — it is its own derivative.`,
          `<strong>(ln x)′ = 1/x</strong>.`,
          `<strong>Product:</strong> (uv)′ = u′v + uv′.`,
          `<strong>Quotient:</strong> (u/v)′ = (u′v − uv′)/v². The minus is in the numerator and the order matters.`
        ] },

        { kind: "method", title: "What the three parts ask", steps: [
          `<strong>a)</strong> Differentiate and simplify to the form printed in the question.`,
          `<strong>b)</strong> Either the tangent at a point, or a limit, or a horizontal asymptote.`,
          `<strong>c)</strong> Monotonicity, an extremum, convexity, or proving an inequality — always by way of the sign of f′.`
        ] },

        { kind: "example", title: "The tangent, which is pure formula", lines: [
          `The tangent to the graph of f at the point with abscissa x₀ is`,
          `<strong>y − f(x₀) = f′(x₀)(x − x₀)</strong>.`,
          `<span class="mark">2p</span> Work out the two numbers f(x₀) and f′(x₀).`,
          `<span class="mark">3p</span> Substitute and tidy into y = mx + n.`,
          `Two numbers and a substitution. Nothing else is being tested.`
        ] },

        { kind: "text", body: `<strong>The sign of f′ is the whole of part c).</strong> Where f′ &gt; 0 the function rises; where f′ &lt; 0 it falls; where f′ = 0 and the sign changes, there is a maximum or a minimum. To prove m ≤ f(x) ≤ M on an interval, find where f′ = 0, work out f there and at both ends, and take the smallest and largest of those numbers. That is the standard proof, and it earns full marks every time.` },

        { kind: "text", body: `<strong>Convexity</strong> is the second derivative: f″ &gt; 0 means convex ("holds water"), f″ &lt; 0 means concave. <strong>Horizontal asymptotes</strong> come from the limit at ±∞; for a ratio of two first-degree expressions it is just the ratio of the leading coefficients.` },

        { kind: "trap", body: `A quotient like (x − 2)/e<sup>x</sup> is easier as a quotient with v = e<sup>x</sup>, and after differentiating you can cancel one e<sup>x</sup> top and bottom. If your answer still has (e<sup>x</sup>)² in it, cancel.` },

        { kind: "workshop", body: `A derivative is a rate of change. The voltage across an inductor is u = L·di/dt — literally the derivative of the current. And a current that is not changing produces no voltage across it at all, which is what "the derivative of a constant is zero" means with a meter on it.` },

        { kind: "barem", body: `3p for the differentiation, 2p for the simplification into the printed form. In part c), 2p for solving f′(x) = 0 and 3p for the conclusion drawn from its sign — so write down the sign analysis, not just the answer.` }
      ]
    },

    /* ------------------------------------------------------------------ */
    integrals: {
      onThePaper: "Subiectul III, problem 2 — every paper. The last fifteen points on the paper.",
      blocks: [
        { kind: "text", body: `Integration undoes differentiation. If F′ = f then ∫f = F + C, and the definite integral from a to b is <strong>F(b) − F(a)</strong>. That is the Leibniz–Newton formula and it is the whole of this problem.` },

        { kind: "method", title: "The antiderivatives you need", steps: [
          `<strong>∫x<sup>n</sup> dx = x<sup>n+1</sup>/(n+1)</strong> — add one, divide by the new power.`,
          `<strong>∫1/x dx = ln|x|</strong>.`,
          `<strong>∫e<sup>x</sup> dx = e<sup>x</sup></strong>.`,
          `<strong>∫u′/u dx = ln|u|</strong> — the one that produces every "show this equals ln 3" on the paper.`
        ] },

        { kind: "method", title: "The three parts, and the trick in each", steps: [
          `<strong>a)</strong> The integrand has something subtracted from it so that the hard part cancels and a polynomial is left. Simplify <em>before</em> integrating — that is the whole design of the item.`,
          `<strong>b)</strong> Look for u′/u. If the top is the derivative of the bottom, the answer is a logarithm.`,
          `<strong>c)</strong> An unknown limit to solve for, an antiderivative through a given point, an area, or a volume.`
        ] },

        { kind: "example", title: "Spotting u′/u", lines: [
          `Show that ∫₀³ 2x/(x² + 1) dx = ln 10.`,
          `<span class="mark">3p</span> The top, 2x, is exactly the derivative of the bottom, x² + 1. So the antiderivative is ln(x² + 1).`,
          `<span class="mark">2p</span> ln(9 + 1) − ln(0 + 1) = ln 10 − ln 1 = ln 10.`,
          `If the numerator is <em>almost</em> the derivative, fix it with a constant: ∫x/(x²+1) dx is half of the above.`
        ] },

        { kind: "text", body: `<strong>Area.</strong> Where f ≥ 0, the area between the graph, Ox and the lines x = a, x = b is ∫<sub>a</sub><sup>b</sup> f(x) dx. Between two curves it is ∫(upper − lower).` },

        { kind: "text", body: `<strong>Volume of revolution.</strong> Spinning the graph of g about Ox gives V = π∫<sub>a</sub><sup>b</sup> g²(x) dx. Notice you square <em>first</em> — which is why these questions always hand you a g with a square root in it, so the root disappears and something easy is left.` },

        { kind: "text", body: `<strong>Above the exam:</strong> integration by parts, ∫uv′ = uv − ∫u′v. Choose u to be the part that gets simpler when differentiated — x in ∫xe<sup>x</sup>, and ln x in ∫ln x. The two results worth knowing: ∫xe<sup>x</sup> dx = (x − 1)e<sup>x</sup> and ∫ln x dx = x·ln x − x.` },

        { kind: "trap", body: `A definite integral is a number, not a function. Do not leave "+ C" on it. But an <em>antiderivative</em> question absolutely needs the constant, and the given condition is what pins it down.` },

        { kind: "trap", body: `ln 1 = 0 and ln e = 1. Those two values are why the answers come out clean — if yours does not, check the limits.` },

        { kind: "workshop", body: `Charge is the integral of current: Q = ∫i dt. Energy is the integral of power. When a meter totals up consumption over an hour, it is doing this integral — and the "area under the curve" is not a metaphor, it is the reading.` },

        { kind: "barem", body: `3p for the antiderivative, 2p for substituting the limits. Even an integral you cannot finish is worth 3 points if the antiderivative is on the page.` }
      ]
    }
  };

  BAC.lessons = LESSONS;
})(typeof window !== "undefined" ? window : globalThis);
