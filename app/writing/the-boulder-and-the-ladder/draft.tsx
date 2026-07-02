"use client";

import { useState } from "react";
import { useSiteAuth, LoginRow } from "../../components/site-auth";

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

// shown to anyone not logged in — looks unpublished, offers a way in.
function Gate() {
  const { login } = useSiteAuth();
  const [showLogin, setShowLogin] = useState(false);
  return (
    <div>
      <h1 className="display text-[24px] leading-[1.5]" style={{ color: "var(--ink)" }}>
        the boulder and the ladder
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        ❯ cat ./this-essay
      </p>

      <div className="hrule my-8" />

      <p className="text-[13px] leading-[1.9] lowercase" style={{ color: "var(--soft)" }}>
        permission denied. this one&apos;s still a draft.
      </p>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--faint)" }}>
        if you&apos;re russell,{" "}
        <button
          onClick={() => setShowLogin((v) => !v)}
          className="tui-btn text-[12px]"
          style={{ color: "var(--green)" }}
        >
          [login]
        </button>{" "}
        to read it.
      </p>
      {showLogin && <LoginRow login={login} onClose={() => setShowLogin(false)} />}
    </div>
  );
}

export function BoulderDraft() {
  const { password, ready } = useSiteAuth();

  // first paint (and ssr) renders the gate, never the essay
  if (!ready) {
    return (
      <p className="text-[12px] lowercase" style={{ color: "var(--faint)" }}>
        …
      </p>
    );
  }
  if (!password) return <Gate />;
  return <Essay />;
}

function Essay() {
  return (
    <>
      <div
        className="mb-8 px-3 py-2 text-[11px] lowercase"
        style={{ border: "1px solid var(--line)", color: "var(--faint)" }}
      >
        <span style={{ color: "var(--accent)" }}>draft</span> — unpublished. only you can see this
        while logged in.
      </div>

      <h1 className="display text-[24px] leading-[1.5]" style={{ color: "var(--ink)" }}>
        the boulder and the ladder
      </h1>
      <p className="mt-1 text-[11px] lowercase" style={{ color: "var(--faint)" }}>
        2026-06-29 · russell jiang
      </p>

      <div className="hrule my-8" />

      <P>i stopped playing ranked games and it took me a while to figure out why.</P>
      <P>
        there was no dramatic quitting moment. no rage-uninstall, no final straw. just a slow drift
        where i kept choosing to do other things and one day realised i hadn&apos;t queued up in
        weeks. but the interesting part wasn&apos;t that i stopped. it was <Em>why</Em> it had
        stopped feeling good, and what that says about how motivation changes as you get older.
      </P>

      <Section id="relief" index="01">
        winning that feels like relief
      </Section>
      <P>
        here&apos;s the thing i eventually noticed about ranked: the best outcome was never joy. it
        was relief.
      </P>
      <P>
        a win didn&apos;t feel like “yes, i did something great.” it felt like “thank god i
        didn&apos;t lose.” and a loss wasn&apos;t neutral. it was a slide into tilt, especially in
        team games where your fate is half in someone else&apos;s hands. so the emotional arithmetic
        worked out to this: best case, you feel the absence of a bad thing. worst case, you feel a
        bad thing. there&apos;s no real upside in the structure. only the avoidance of downside.
      </P>
      <P>
        once you see it that way it&apos;s kind of bleak. you&apos;re grinding for relief. you push
        the rank up, someone pushes it back down, and the ladder doesn&apos;t care that you were
        ever on it. it&apos;s Sisyphus with a leaderboard. the boulder rolls back down and the
        boulder has never once thought about you.
      </P>
      <P>
        compare that to sending a boulder problem at the gym, an actual boulder, the climbing kind.
        best case is genuine elation. worst case is “i&apos;ll get it next session.” the entire
        emotional range sits above zero. that asymmetry, once you feel it, is hard to unfeel.
      </P>

      <Section id="sums" index="02">
        zero sum and positive sum
      </Section>
      <P>
        the framework underneath this is older than gaming. a zero sum game is one where my gain
        requires your loss. the pie is fixed and we&apos;re fighting over slices. a positive sum
        game is one where value gets created rather than redistributed. everyone at the bouldering
        gym can get stronger at the same time. nobody&apos;s send costs you anything.
      </P>
      <P>
        here&apos;s the subtlety i missed for a long time: ranked is two games stacked on top of
        each other. there&apos;s the skill you build, which is positive sum, your aim sharpens, your
        game sense improves, and that&apos;s real and it&apos;s yours. and there&apos;s the rank,
        which is pure zero sum, for your number to go up someone else&apos;s has to come down. early
        on the two move together, so the whole thing feels like growth, the rank is just reading out
        the skill. but skill plateaus long before ambition does, and once it does the rank is all
        that&apos;s left to chase. that&apos;s the moment it stops feeling like building something
        and starts feeling like defending a number. i think that&apos;s when it soured for me. i
        just didn&apos;t have the words for it yet.
      </P>
      <P>
        this is also why it isn&apos;t as simple as “games bad.” osu! is a game and it&apos;s about
        as positive sum as they come, because what you&apos;re up against is the beatmap and
        past-you, not a bracket of strangers. it&apos;s the structure that matters, not the medium.
        the wall doesn&apos;t care, the barbell doesn&apos;t care, the beatmap doesn&apos;t care.
        they sit there as honest measures of what you can currently do, with no one on the other
        side of the table losing when you win.
      </P>
      <P>
        but here&apos;s what i think matters most, more than the econ-textbook distinction:{" "}
        <Strong>
          positive sum progress decays on your own terms. zero sum progress gets taken from you.
        </Strong>
      </P>
      <P>
        it isn&apos;t that what you build is permanent, exactly. detrain for a month and you&apos;ll
        feel it, the v5 that was easy gets scary again. but it fades slowly, on a schedule you
        control, and it comes back faster than it left, because the hands remember. a rank
        doesn&apos;t work like that. you can drop two hundred elo in a bad week you didn&apos;t ask
        for, half of it on teammates you&apos;ll never meet again. one of these is a thing you let
        lapse. the other is a thing that gets done to you.
      </P>
      <P>
        that&apos;s the real difference. in ranked you identify with a number that fluctuates:{" "}
        <Em>i am diamond, i am plat.</Em> in climbing you identify with a capability that grows:{" "}
        <Em>i climbed a v5, i&apos;m working v6.</Em> pin your identity to a fluctuating number and
        your sense of self fluctuates with it. pin it to what your body can do and you just become
        more. one is building a self. the other is defending a position.
      </P>

      <Section id="endgame" index="03">
        the gamer&apos;s natural endgame
      </Section>
      <P>
        i&apos;ve started thinking of this as a natural progression for gamers, or at least the one
        i went through, if life were an rpg.
      </P>
      <P>
        ranked is the tutorial zone. it&apos;s where you learn that you like getting better at
        things, that competition is a real motivator, that there&apos;s a dopamine in the climb.
        that&apos;s genuinely useful, not a phase to be ashamed of. but it&apos;s a starting area.
        at some point a lot of people age out of it and migrate, almost without noticing, to hobbies
        where the progress is cumulative and yours: lifting, climbing, an instrument, a craft. the
        boulder and the barbell are just the next zone. the rpg keeps going, the levelling just gets
        more real.
      </P>
      <P>
        and i think the migration tracks something psychologists have talked about forever: the
        shift from extrinsic to intrinsic motivation. when you&apos;re young your identity
        isn&apos;t formed yet, so you need external scoreboards to tell you whether you&apos;re any
        good. the rank <Em>is</Em> the answer to “am i capable.” it&apos;s fast and clear and
        that&apos;s why it&apos;s so seductive early on. but as you accumulate a stable internal
        sense of who you are, you need the scoreboard less. the question quietly changes from{" "}
        <Em>am i better than these other people</Em> to <Em>am i becoming who i want to be.</Em> and
        positive sum hobbies answer that second question much better than any ranked ladder ever
        could.
      </P>
      <P>
        your hobby choices, in other words, might be a leading indicator of where you are on that
        curve, not just a byproduct of it.
      </P>

      <Section id="social" index="04">
        the social shape of it
      </Section>
      <P>
        the same logic reshapes who you&apos;re around. when your worth is externally referenced,
        even your friends become measuring sticks, who&apos;s higher rank, who carried who. the
        environment goes faintly adversarial even when everyone&apos;s friendly, because the
        structure pits you against each other.
      </P>
      <P>
        positive sum hobbies invert it. at the climbing gym someone else figuring out the beta
        doesn&apos;t cost you anything, it <Em>helps</Em> you, their growth pulls you up instead of
        threatening you. the communities end up collaborative in a way ranked communities
        structurally can&apos;t be, and you grow faster for being inside one.
      </P>

      <Section id="epiphany" index="05">
        no epiphany
      </Section>
      <P>
        i don&apos;t miss ranked. i&apos;m glad i&apos;m out. but i&apos;ll be honest about the
        caveat: maybe that&apos;s just because i&apos;ve changed into someone for whom it no longer
        fits, and not because there&apos;s anything wrong with it in the abstract. i&apos;m
        describing a shift in myself, not handing down a verdict.
      </P>
      <P>
        when i see people still deep in the grind, i mostly don&apos;t feel much. they rarely look
        happy to begin with. there&apos;s a particular hollow-eyed quality to someone on a losing
        streak at 2am, chasing the win that&apos;ll only ever feel like relief. but i don&apos;t
        feel pity or superiority about it. i think the realisation just comes when it comes. it came
        for me gradually, no epiphany, and it&apos;ll probably arrive for them the same way, on its
        own schedule.
      </P>
      <P>
        the boulder rolls back down the hill in ranked because that&apos;s the shape of the game.
        the climb resets every match. the difference with an actual boulder is that you&apos;re not
        pushing a weight up a slope that resets. you&apos;re becoming someone who can climb harder
        things. the self is the thing that changes, and the self doesn&apos;t roll back down.
      </P>
      <P>
        <Strong>
          that&apos;s the whole reason i drifted, i think. i just got tired of pushing a boulder
          that was never going to stay put, and found some that did ■
        </Strong>
      </P>

      <p
        className="mt-14 pt-4 text-[11px] lowercase italic leading-[1.7]"
        style={{ borderTop: "1px solid var(--line)", color: "var(--faint)" }}
      >
        a dialogue distillate: my thoughts, drafted with claude.
      </p>
    </>
  );
}
