import type { Metadata } from "next";
import { DocsShell } from "../../components/docs-shell";

export const metadata: Metadata = {
  title: "the same shape everywhere — russell jiang",
  description:
    "A meditation on pattern recognition, and what physics might have to say about how to live.",
};

const toc = [
  { label: "One number", href: "#disguises" },
  { label: "Isomorphism", href: "#isomorphism" },
  { label: "Compression", href: "#compression" },
  { label: "Least action", href: "#least-action" },
  { label: "Not laziness", href: "#not-laziness" },
  { label: "Equilibrium", href: "#equilibrium" },
  { label: "Why it matters", href: "#why" },
];

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 text-[14px] leading-[1.9]" style={{ color: "var(--soft)" }}>
      {children}
    </p>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "var(--ink)" }}>{children}</span>;
}

function Em({ children }: { children: React.ReactNode }) {
  return <em className="italic">{children}</em>;
}

function Section({ id, index, children }: { id: string; index: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-14 text-[13px] lowercase tracking-[0.15em]"
      style={{ color: "var(--ink)" }}
    >
      <span style={{ color: "var(--faint)" }}>{index}</span> {children}
    </h2>
  );
}

function Part({ id, label, blurb }: { id: string; label: string; blurb: string }) {
  return (
    <div className="mt-20">
      <div className="hrule" />
      <h2 id={id} className="display mt-6 text-[18px]" style={{ color: "var(--ink)" }}>
        {label}
      </h2>
      <p className="mt-2 text-[12px] italic leading-[1.7]" style={{ color: "var(--soft)" }}>
        {blurb}
      </p>
    </div>
  );
}

function Equation({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="my-8 text-center text-[18px]"
      style={{ color: "var(--ink)", letterSpacing: "0.06em" }}
    >
      {children}
    </div>
  );
}

export default function SameShapePost() {
  return (
    <DocsShell crumb="writing/same-shape" toc={toc}>
      <h1 className="display text-[24px] leading-[1.5]" style={{ color: "var(--ink)" }}>
        the same shape everywhere
      </h1>
      <p className="mt-2 text-[12px] lowercase italic" style={{ color: "var(--soft)" }}>
        a meditation on pattern recognition, and what physics might have to say about how to live
      </p>
      <p className="mt-1 text-[11px] lowercase" style={{ color: "var(--faint)" }}>
        2026-06-25 · russell jiang
      </p>

      <div className="hrule my-8" />

      <P>
        i spent an evening that was supposed to be econometrics homework and ended up somewhere
        near the foundations of physics. it wasn’t a detour. the whole point is that it wasn’t a
        detour.
      </P>
      <P>
        here is the path, roughly. it started with a question about whether a regression
        coefficient actually means anything, and ended with the suspicion that the universe is just
        doing constrained optimisation in every direction at once. nothing in between felt like a
        leap. each step was just the previous idea wearing different clothes. this is an attempt to
        write down why that happens, and why i think noticing it is the single most valuable thing
        you can learn to do while learning anything.
      </P>

      <Part
        id="part-one"
        label="part one: the shapes"
        blurb="how the same structure keeps turning up across subjects that look nothing alike, and what that does to the way you learn."
      />

      <Section id="disguises" index="01">
        one number, many disguises
      </Section>
      <P>
        start with covariance. it measures how two things move together. nothing fancy, just the
        average of how far each variable strays from its own mean, multiplied.
      </P>
      <P>
        scale it by the variance of x and you get the slope of a regression line. scale it instead
        by both standard deviations and you get the correlation coefficient, which is now politely
        bounded between minus one and one. take logs of both variables first and the same slope
        becomes an elasticity, the thing economists use to talk about how demand responds to price.
        log one side only and you get a semi-elasticity instead.
      </P>
      <P>
        so the demand elasticity in an economics course, the regression slope in a statistics
        course, and the correlation coefficient in a probability course are not three facts. they
        are one fact, projected onto three different walls. the covariance is the object. everything
        else is a choice of lighting.
      </P>
      <P>
        once you see this you cannot unsee it, and you start getting suspicious whenever two things
        in different subjects have the same shape. usually it means they are the same thing.
      </P>

      <Section id="isomorphism" index="02">
        the word for it
      </Section>
      <P>
        mathematicians have a word for “the same thing wearing different clothes.” the word is
        isomorphism: a structure-preserving map between two objects that looks different on the
        surface but behaves identically underneath.
      </P>
      <P>
        the example that made it concrete for me is embarrassingly simple. a degree-two polynomial
        is just three numbers, the coefficients of one, x, and x squared. so the space of those
        polynomials is secretly just three-dimensional space with the axes relabelled. add two
        polynomials, you add their coefficient vectors. scale a polynomial, you scale the vector.
        every operation matches. they are the same space.
      </P>
      <P>
        this is not a cute observation. it is why you can solve a question about polynomials being
        linearly dependent by stacking their coefficients into a matrix and asking a computer for
        the null space. the polynomial problem and the vector problem are the same problem. the
        isomorphism is what lets you carry the tools from one world into the other without paying
        any toll.
      </P>
      <P>
        and it generalises in a way that is almost unsettling: every finite-dimensional real vector
        space of dimension n is isomorphic to ordinary n-dimensional space. there is, in a deep
        sense, only one vector space of each size. polynomials, matrices, lists of numbers,
        solutions to certain differential equations. all the same skeleton, different skin.
      </P>

      <Section id="compression" index="03">
        learning as compression
      </Section>
      <P>here is what i think is actually going on when something “clicks.”</P>
      <P>
        learning a subject in isolation means storing it as its own block of facts. ten subjects,
        ten blocks, no shared structure. it is expensive to hold and it does not transfer.
      </P>
      <P>
        but if you have already internalised the shape of, say, linear independence, then the first
        time you meet orthogonal functions, or feedback loops, or causal graphs, you do not store a
        new block. you recognise an old shape and inherit all its intuition for free. the new thing
        costs almost nothing because you are not learning it, you are relabelling something you
        already own.
      </P>
      <P>
        this is why the returns to deep foundations are not linear. each foundation you lay does not
        just add itself. it makes every future subject cheaper to learn, because more and more of
        the new material turns out to be structure you have already seen. discrete maths felt
        abstract and disconnected while i was doing it. then it turned out that causal inference is
        graph theory, that induction is the engine behind why triangular matrices are easy, that
        modular arithmetic is a doorway into ring theory. the foundation was not a prerequisite to
        get past. it was the language everything else gets written in.
      </P>
      <P>
        the skill underneath all of this is pattern recognition, and i have started to think
        pattern recognition is close to what intelligence actually is. not memorising more, not
        even reasoning more carefully step by step, but seeing that this new unfamiliar thing is
        structurally identical to that old familiar thing, and inheriting the whole apparatus in one
        move.
      </P>

      <Section id="least-action" index="04">
        the shape that kept reappearing
      </Section>
      <P>
        covariance was the small version of this, one object showing up in three subjects. here is
        the largest version i know, the one that kept pulling me further out the longer i looked at
        it. it starts somewhere harmless.
      </P>
      <P>
        the shortest path between two points is a straight line. in 4-unit high school maths it
        shows up as a fact about complex numbers, the triangle inequality. generalise the space and
        it becomes the Cauchy-Schwarz inequality, which is really just the statement that a cosine
        is never bigger than one, dressed up for any inner product space you like. correlation being
        bounded by one is this same inequality applied to data. cosine similarity in a search
        system, the thing that decides which documents are “close,” is this same inequality again.
      </P>
      <P>
        that much is one shape spreading, the same trick as covariance. but pull on the thread a
        little harder and it changes character. shortest-path is a special case of something
        larger: not just distance being minimised, but <Em>quantities in general</Em> settling at
        their extreme. and that larger idea turns out to be nearly everywhere.
      </P>
      <P>
        light travels the path that takes the least time. a particle follows the path that makes the
        action stationary, which in Feynman’s telling is because it secretly explores every path at
        once and only the stationary one survives the interference. a chemical reaction settles
        where the free energy is lowest, negotiating between energy wanting to be low and entropy
        wanting to be high, with temperature setting the exchange rate between the two. a
        probability distribution, given what little you know, settles at maximum entropy, which is
        just being as honest as possible about your own ignorance. a regression line settles where
        the squared error is smallest. a neural network settles where the loss is smallest, by
        rolling downhill.
      </P>
      <P>
        these are not analogies. they are, mathematically, the same move: define a quantity, then
        find where it is stationary. the calculus of variations is the one tool underneath all of
        them, and the Euler-Lagrange equation is just the infinite-dimensional version of setting a
        derivative to zero to find a minimum. physics, chemistry, statistics, machine learning. one
        verb, conjugated differently.
      </P>

      <Part
        id="part-two"
        label="part two: the balance"
        blurb="where that same habit of looking, pushed past the edge of the maths, turns out to have something to say about how to live."
      />

      <Section id="not-laziness" index="05">
        the word that gets it wrong
      </Section>
      <P>
        it is tempting, once you have noticed all this, to draw a tidy life lesson from it. nature
        takes the path of least action, so maybe we should too. stop straining. take the path of
        least resistance. go where the current carries you and let things happen.
      </P>
      <P>
        i believed that for about an hour, and then i realised it is a misreading, and the
        misreading is instructive.
      </P>
      <P>
        least action does not mean laziness. the word “least” is doing something more specific than
        it sounds. the path a particle takes is not the one that costs the least effort. it is the
        one where the action is <Em>stationary</Em>, the path where nudging slightly to either side
        does not make things any better or worse. and in Feynman’s picture it only gets selected
        because every other path was secretly explored too, and this is the one that survived once
        all the alternatives interfered and cancelled. the straight line looks effortless. but it
        was chosen out of an enormous invisible space of paths not taken.
      </P>
      <P>
        so the thing that looks like surrender is actually the opposite. it is not the absence of
        forces. it is their balance.
      </P>

      <Section id="equilibrium" index="06">
        find your equilibrium
      </Section>
      <P>
        the better word, the one that survives contact with the actual mathematics, is equilibrium.
      </P>
      <P>
        think about the free energy again. there is an equation for it, and it is one of those rare
        equations that says something true about more than what it was written for:
      </P>
      <Equation>ΔG = ΔH − TΔS</Equation>
      <P>
        three letters and a minus sign. ΔH is enthalpy, the system’s pull toward low energy, the
        part of nature that wants to settle and rest and let go of heat. ΔS is entropy, the pull
        toward disorder, the part that wants to spread out and explore and never sit still. and T is
        temperature, which sets how much the second pull matters against the first. a system settles
        where ΔG is at its lowest, which is to say it settles not at lowest energy and not at highest
        disorder but at the exact point where the two stop fighting.
      </P>
      <P>
        that is the whole push and pull of a life in one line. the part of you that wants to rest,
        set against the part of you that wants to move, with the conditions you happen to be living
        under deciding how much each one wins. and the resting point is not either extreme. it is
        the negotiated middle, the place where the tension resolves. nothing about it is drift.
      </P>
      <P>
        equilibrium in general is like this. it is not the place where no forces act on you. it is
        the place where the forces cancel. and the difference between those two things is the whole
        difference between a life lived well and a life merely allowed to happen.
      </P>
      <P>
        the pure go-with-the-flow philosophy has a quiet trap in it. let it happen can slide,
        without you noticing, into never choosing anything, calling your avoidance peace. but
        equilibrium does not let you off that easily. to find the balance point you have to actually
        move through the space. you have to try directions, feel where the tension pulls, lean into
        things and notice what pushes back, and settle only where the pushing resolves. you cannot
        find a stationary point without first exploring the paths around it. the stillness is real,
        but it is earned, and it sits at the end of a search rather than at the start of a surrender.
      </P>
      <P>
        and your temperature changes. the conditions you are in shift where your balance point sits,
        the same way heating a reaction moves where it settles. the equilibrium you find at nineteen
        is not the one you will find at forty, and that is not failure, it is just the terms of the
        negotiation changing. the work is not to find the resting place once. it is to keep finding
        it as the temperature moves.
      </P>
      <P>
        so when something in your life feels effortless, it is worth asking which kind of effortless
        it is. the empty kind, where you have stopped moving because moving is hard. or the balanced
        kind, where you have moved enough, in enough directions, that nothing is pulling at you
        anymore. they look identical from the outside. they are opposites from the inside.
      </P>

      <Section id="why" index="07">
        why it matters
      </Section>
      <P>
        there is a version of going through life the way you can go through a degree: collecting
        tricks. a method for this kind of problem, a method for that kind, each one its own isolated
        thing. it works, mostly. but a person who only has tricks is stuck the moment a tool breaks
        or a situation arrives that none of their methods quite fit, because they were never holding
        the structure underneath, only the surface. the whole of part one was about the alternative:
        that underneath the tricks there are shapes, and if you learn to see the shapes you stop
        carrying a pile of separate methods and start carrying one way of seeing that travels.
      </P>
      <P>
        what surprised me is that this turned out to be true past the edge of the maths. the same
        habit of looking for the shape underneath, the one that let me see covariance and elasticity
        as one object, polynomials and vectors as one space, is the habit that let me see least
        action and free energy and a settled life as one object too. i went looking for whether a
        regression coefficient means anything, and found a thread running from covariance through
        isomorphism through the calculus of variations all the way out to the principle that nature
        settles wherever its forces come into balance. it is all connected, not in a vague
        everything-is-one way but in a precise, provable, same-skeleton way. and then, almost by
        accident, the same shape had something to say about how to live, which is far more than i
        went looking for. you do not get that second kind of seeing without practising the first.
        learning to recognise structure in the abstract is what makes you able to recognise it in
        your own life, where the stakes are higher and the labels are hidden.
      </P>
      <P>
        <Strong>
          the still path is the balanced one, not the empty one. find where the forces cancel. that
          is the equilibrium, and it is the one thing in all of this you actually have to go looking
          for yourself. ■
        </Strong>
      </P>

      <p
        className="mt-14 pt-4 text-[11px] lowercase italic leading-[1.7]"
        style={{ borderTop: "1px solid var(--line)", color: "var(--faint)" }}
      >
        a dialogue distillate: my thoughts, drafted with claude.
      </p>
    </DocsShell>
  );
}
