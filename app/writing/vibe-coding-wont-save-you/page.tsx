import type { Metadata } from "next";
import { DocsShell } from "../../components/docs-shell";

export const metadata: Metadata = {
  title: "vibe coding won't save you — russell jiang",
  description: "Why fundamentals still matter in the age of agentic AI.",
};

const toc = [
  { label: "Commodity", href: "#commodity" },
  { label: "Validity", href: "#validity" },
  { label: "Diagnosis", href: "#diagnosis" },
  { label: "Agentic shift", href: "#agentic" },
  { label: "The maths", href: "#maths" },
  { label: "References", href: "#references" },
];

const REFERENCES: [string, string][] = [
  ["Bendimerad, S. (2025). Data Science in 2026: Is It Still Worth It? Towards Data Science.", "https://towardsdatascience.com/data-science-in-2026-is-it-still-worth-it/"],
  ["365 Data Science. (2025). Data Scientist Job Outlook 2025.", "https://365datascience.com/career-advice/career-guides/data-scientist-job-outlook-2025/"],
  ["Choo, D. (2026). 2026 vs. 2025 Data Science Job Market.", "https://www.askdatadawn.com/p/how-has-the-data-science-job-market"],
  ["Cangrade. (2023). Hiring Bias Gone Wrong: Amazon Recruiting Case Study.", "https://www.cangrade.com/blog/hr-strategy/hiring-bias-gone-wrong-amazon-recruiting-case-study/"],
  ["University of Maryland. (2018). The Problem With Amazon's AI Recruiter.", "https://www.rhsmith.umd.edu/research/problem-amazons-ai-recruiter"],
  ["Careery. (2026). How to Become a Data Scientist in 2026.", "https://careery.pro/blog/data-science-careers/how-to-become-a-data-scientist"],
  ["O'Reilly. (2026). The Hidden Cost of Agentic Failure.", "https://www.oreilly.com/radar/the-hidden-cost-of-agentic-failure/"],
  ["ZLTI. (2025). Federal Agentic AI: How Data Solves the Compounding Error Problem.", "https://www.zlti.com/blog/federal-agentic-ai-how-data-solves-the-compounding-error-problem/"],
  ["Snowflake. (2025). AI + Data Predictions 2026.", "https://www.snowflake.com/content/dam/snowflake-site/en/landing-pages/ai-and-data-predictions-2026/report-ai-data-predictions-2026.pdf"],
  ["McKinsey. (2026). Building the Foundations for Agentic AI at Scale.", "https://www.mckinsey.com/capabilities/mckinsey-technology/our-insights/building-the-foundations-for-agentic-ai-at-scale"],
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

function Ref({ n }: { n: number }) {
  return (
    <a
      href={REFERENCES[n - 1][1]}
      target="_blank"
      rel="noopener noreferrer"
      className="site-link text-[11px]"
      style={{ color: "var(--accent)" }}
      aria-label={`reference ${n}`}
    >
      [{n}]
    </a>
  );
}

function H2({ id, index, children }: { id: string; index: string; children: React.ReactNode }) {
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

function Figure({
  src,
  alt,
  caption,
  stretch = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  stretch?: boolean;
}) {
  return (
    <figure className="mt-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={stretch ? "block w-full" : "block max-w-full h-auto"}
        style={{
          border: "1px solid var(--line)",
          // fixed paper background so transparent figures stay readable in dark mode
          background: "#faf8f3",
          padding: "12px",
        }}
      />
      {caption && (
        <figcaption className="mt-2 text-[11px] leading-[1.7]" style={{ color: "var(--faint)" }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function VibeCodingPost() {
  return (
    <DocsShell crumb="writing/vibe-coding" toc={toc}>
      <h1 className="display text-[24px] leading-[1.5]" style={{ color: "var(--ink)" }}>
        vibe coding won&apos;t save you
      </h1>
      <p className="mt-2 text-[12px] lowercase" style={{ color: "var(--soft)" }}>
        why fundamentals still matter in the age of agentic ai.
      </p>
      <p className="mt-1 text-[11px] lowercase" style={{ color: "var(--faint)" }}>
        2026-04-12 · maithili gulati &amp; russell jiang · first published with datasoc
      </p>

      <div className="hrule my-8" />

      <P>
        Vibe coding is a great way to make sure nobody understands what is going on. It might
        fly under the radar for frontend — but in data science, that&apos;s a liability.
      </P>

      <H2 id="commodity" index="01">
        coding is a commodity
      </H2>
      <P>
        AI has made code a commodity. Anyone can import scikit-learn. Anyone can prompt their way
        to a working model. But functional code is not the same as valid analysis, and this
        distinction matters more than it ever has.
      </P>
      <P>
        At its core, data science is about making claims to other people — and having people act
        on them. When these claims are wrong, the decisions that follow are wrong too. The
        differentiator was never who could write the code, it was always who could reason about
        whether the answer is right.
      </P>
      <P>
        The market has noticed this shift. While technical skills may get you through the door,
        only interpretive and integrative data skills will get you hired. Hiring managers
        aren&apos;t just looking for people who can write a query. The ones who stand out are the
        ones who speak in hypotheses and prove it through results. As one senior AI engineer puts
        it, you cannot be a &quot;General Importer&quot; — someone who only imports{" "}
        <Strong>sklearn</Strong> and runs <Strong>.fit()</Strong> and <Strong>.predict()</Strong>.
        Very soon, an AI agent may do that part for us. <Ref n={1} />
      </P>
      <P>
        This shows up in job postings too. Machine learning skills appear in 77% of data scientist
        job postings (2025) <Ref n={2} />, but running models isn&apos;t the bar. Statistics and ML
        together ranked first across all 101 job postings analysed in 2026 — the same position they
        held in 2025. <Ref n={3} /> What employers are consistently selecting for is reasoning, not
        just simple implementation.
      </P>

      <H2 id="validity" index="02">
        ai can write the code. it can&apos;t tell you if it&apos;s valid
      </H2>
      <P>
        Here&apos;s what AI is genuinely good at: getting you to a working implementation quickly.
        What it can&apos;t do is tell you whether this implementation is statistically appropriate
        for your problem.
      </P>
      <P>
        The model doesn&apos;t &apos;know&apos; your data like a human can (not yet, anyways). It
        doesn&apos;t know that your classes are wildly imbalanced, that you are leaking your test
        set, or that the loss function is simply wrong for the task. It will confidently give you
        code that runs perfectly, without any indication that something is off.
      </P>
      <P>
        Amazon&apos;s scrapped recruiting program is a canonical example of this going wrong at
        scale. The company trained its hiring AI on resumes of existing employees, which seemed
        like standard practice. But Amazon&apos;s workforce was disproportionately male, so the
        algorithm learned that being male was a marker of success. <Ref n={4} /> The models
        penalised terms associated with women, and the initial bias compounded over time, becoming
        an echo chamber of its own making (not unlike the feedback loops keeping your reels exactly
        as niche as they are). <Ref n={5} /> The code worked. The model trained. The outputs were
        wrong. Nobody caught it because catching it requires something AI doesn&apos;t have: an
        understanding of what the data actually represents and who it excludes. This is the failure
        mode vibe coding bakes in. You get a model that runs.{" "}
        <Strong>You don&apos;t get a model you can trust.</Strong>
      </P>

      <H2 id="diagnosis" index="03">
        knowing when the model is wrong
      </H2>
      <P>
        Some of the most important skills in data science come from diagnosing models, not just
        building them.
      </P>
      <P>
        Take gradient descent. When you prompt AI to optimise, it&apos;ll do it. But do you know
        what a healthy loss curve looks like? Can you tell the difference between a model
        converging properly and one that&apos;s oscillating, or plateauing early? Without that
        intuition, you have no way to know whether the training process is doing what you think
        it&apos;s doing.
      </P>
      <P>
        Or take overfitting. The classic symptom is a validation loss that climbs while training
        loss keeps falling. But to actually diagnose it — to know whether you need more data,
        stronger regularisation, a simpler architecture, or to revisit your feature engineering —
        you need to understand the bias-variance tradeoff. Googling &quot;my val loss is going
        up&quot; gets you a list of possible causes. Understanding the mechanics tells you which
        one applies to your situation.
      </P>

      <Figure
        src="/blogs/overfitting.png"
        alt="Overfitting diagram: training error falls while validation error rises"
        caption="overfitting in supervised learning. training error in blue, validation error in red, both as a function of training cycles. gringer, overfitting, cc by 3.0, via wikimedia commons."
      />

      <P>
        Then there&apos;s the problem that breaks things most in production: hypothesis testing. A
        result that looks statistically significant isn&apos;t necessarily meaningful. You need the
        intuition to know when a result is real and when it&apos;s noise — understanding p-values,
        effect sizes, confidence intervals, and when you simply need more data. <Ref n={6} />
      </P>

      <Figure
        src="/blogs/xkcd_effect_size.png"
        alt="xkcd comic about subgroup analysis"
        caption="subgroup analysis is ongoing. xkcd.com/2755"
      />

      <P>
        A data scientist who reports a &quot;significant&quot; A/B test result without checking
        effect size, or who doesn&apos;t account for multiple comparisons, can send an organisation
        down the wrong path with complete statistical cover.
      </P>
      <P>
        <Strong>Mathematical intuition is your error-detection layer.</Strong> Without it, you have
        no way to audit your own work.
      </P>

      <H2 id="agentic" index="04">
        the agentic shift raises the stakes
      </H2>
      <P>
        All of this is already a problem when you&apos;re the one running the code. It gets
        considerably worse when the code runs itself.
      </P>
      <P>
        We&apos;re in the middle of a shift from generative AI tools you interact with, to agentic
        systems that make decisions autonomously. In a traditional workflow, there&apos;s a human
        in the loop at each step — someone who can sanity-check the output before it flows
        downstream. Agentic pipelines remove that checkpoint. They chain model outputs together
        automatically, passing results from one step to the next without pausing for review.
      </P>
      <P>
        The problem is that if you put garbage in, you will almost certainly get garbage out. Most
        multi-agent systems don&apos;t fail because the models are bad. They fail because we
        compose them as if probability doesn&apos;t compound. Even a high-performing agent with a
        98% per-task success rate, chained through multiple steps, can see overall system accuracy
        degrade to 90% or lower. <Ref n={7} />
      </P>

      <blockquote
        className="mt-6 pl-4 text-[13px] leading-[1.9]"
        style={{ borderLeft: "1px solid var(--line)", color: "var(--soft)" }}
      >
        &quot;if your AI model has a 1% error rate and you plan over 5,000 steps, that 1% compounds
        like compound interest&quot;
        <span className="block mt-1 text-[11px]" style={{ color: "var(--faint)" }}>
          — deepmind ceo demis hassabis <Ref n={8} />
        </span>
      </blockquote>

      <P>
        This renders outcomes effectively random. Snowflake&apos;s director of AI infrastructure
        frames this as the defining challenge of 2026: &quot;it will be very hard to rely on agents
        if we don&apos;t have a way of systematically measuring their accuracy.&quot; <Ref n={9} />
      </P>
      <P>
        This is where a bad statistical assumption at step one becomes catastrophic. Single agents
        can make inconsistent decisions from fragmented data, while multi-agent systems lose
        coordination and propagate errors silently through the entire workflow. McKinsey found that
        nearly two-thirds of enterprises have experimented with agents, but fewer than 10 percent
        have scaled them to deliver tangible value, with data quality and faulty assumptions as the
        primary blocker. <Ref n={10} />
      </P>

      <Figure
        src="/blogs/AgenticFoundations_Ex1.svg"
        alt="McKinsey figure on scaling agentic AI"
        stretch
      />

      <P>
        The skill being valued right now isn&apos;t &quot;can you implement an agent.&quot;
        It&apos;s &quot;can you reason about what happens when this system fails.&quot;
        That&apos;s a fundamentally statistical question.
      </P>

      <H2 id="maths" index="05">
        reframe the maths
      </H2>
      <P>
        There&apos;s a temptation to treat mathematical foundations as gatekeeping — the hard stuff
        you get through before you&apos;re allowed to do the interesting work. That framing gets it
        backwards.
      </P>
      <P>
        <Strong>The maths is not the prerequisite. The maths is the edge.</Strong>
      </P>
      <P>
        Vibe coding gets you to roughly 80% of a working solution. For many tasks, that&apos;s
        fine. But data science is a field built on making claims about the world and having people
        act on them. The ability to explain why a result shouldn&apos;t drive action — to push back
        on your own model before someone else has to — is what separates junior practitioners from
        senior ones. In an agentic world, wrong decisions don&apos;t just sit in a notebook. They
        scale automatically.
      </P>
      <P>
        Causal inference is increasingly being flagged as a highly sought-after skill <Ref n={3} />{" "}
        — not because the tooling changed, but because autonomous systems need someone who can
        reason about whether a correlation actually means anything. The problems you&apos;re being
        asked to solve are getting harder, the stakes are
        higher, and the gap between someone who can implement and someone who can reason is getting
        wider.
      </P>
      <P>
        <Strong>The models are getting smarter. So should you ■</Strong>
      </P>

      <H2 id="references" index="06">
        references :P
      </H2>
      <ol className="mt-4 flex flex-col gap-1.5 text-[12px] leading-[1.7] list-none p-0">
        {REFERENCES.map(([label, href], i) => (
          <li key={href} className="flex items-baseline gap-2">
            <span className="shrink-0 w-[3ch] text-right" style={{ color: "var(--faint)" }}>
              {i + 1}.
            </span>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="site-link min-w-0"
            >
              {label}
            </a>
          </li>
        ))}
      </ol>
    </DocsShell>
  );
}
