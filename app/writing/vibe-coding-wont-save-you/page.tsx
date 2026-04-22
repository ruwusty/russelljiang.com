import { DocsShell } from "../../components/docs-shell";

const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

const toc = [
  { label: "Coding is a commodity", href: "#commodity" },
  { label: "AI can't tell you it's valid", href: "#valid" },
  { label: "Knowing when the model is wrong", href: "#diagnosis" },
  { label: "The agentic shift", href: "#agentic" },
  { label: "Reframe the maths", href: "#reframe" },
  { label: "References", href: "#references" },
];

function Ref({ n, href }: { n: number; href: string }) {
  return (
    <sup>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="site-link"
        style={{ fontFamily: mono, fontSize: "10px", padding: "0 2px" }}
      >
        [{n}]
      </a>
    </sup>
  );
}

const pStyle = {
  color: "var(--muted)",
};

export default function VibeCodingPost() {
  return (
    <DocsShell crumb="Vibe Coding Won't Save You" toc={toc}>
      <div
        className="text-[11px] mb-3 flex items-center gap-2"
        style={{ color: "var(--muted)", fontFamily: mono }}
      >
        <a href="/writing" className="site-link">← Writing</a>
      </div>

      <h1
        className="text-[34px] leading-[1.2] tracking-tight font-semibold"
        style={{ color: "var(--text)" }}
      >
        Vibe Coding Won&apos;t Save You
      </h1>
      <p className="mt-3 text-[15px]" style={{ color: "var(--muted)" }}>
        Why fundamentals still matter in the age of agentic AI.
      </p>

      <div
        className="mt-4 flex items-center gap-2 text-[11px]"
        style={{ color: "var(--muted)", fontFamily: mono }}
      >
        <span>2026-04-12</span>
        <span style={{ color: "var(--border)" }}>/</span>
        <span>Maithili Gulati · Russell Jiang</span>
        <span style={{ color: "var(--border)" }}>/</span>
        <span className="flex items-center gap-1.5">
          {["opinion", "ai"].map((t) => (
            <span
              key={t}
              className="px-1.5 py-[1px] rounded"
              style={{ border: "1px solid var(--border)" }}
            >
              {t}
            </span>
          ))}
        </span>
      </div>

      <div className="my-8 h-px" style={{ background: "var(--border)" }} />

      <div className="prose-body space-y-5 text-[15px] leading-[1.8]" style={pStyle}>
        <p>
          Vibe coding is a great way to make sure that nobody understands what
          is going on. It might fly under the radar for frontend - but in data
          science, that&apos;s a liability.
        </p>

        <h2
          id="commodity"
          className="!mt-12 text-[22px] tracking-tight font-semibold"
          style={{ color: "var(--text)" }}
        >
          Coding is a commodity.
        </h2>
        <p>
          AI has made code a commodity. Anyone can import scikit-learn. Anyone
          can prompt their way to a working model. But functional code is not
          the same as valid analysis, and this distinction matters more than it
          ever has.
        </p>
        <p>
          At its core, data science is about making claims to other people -
          and having people act on them. When these claims are wrong, the
          decisions that follow are wrong too. The differentiator was never who
          could write the code; it was always who could reason about whether the
          answer is right.
        </p>
        <p>
          The market has noticed this shift. While technical skills may get you
          through the door, only interpretive and integrative data skills will
          get you hired. Hiring managers aren&apos;t just looking for people who
          can write a query. The ones who stand out are the ones who speak in
          hypotheses and prove it through results. As one senior AI engineer
          puts it, you cannot be a &quot;General Importer&quot; - someone who
          only imports{" "}
          <code
            style={{
              fontFamily: mono,
              fontSize: "13px",
              color: "var(--text)",
              background: "color-mix(in srgb, var(--muted) 15%, transparent)",
              padding: "1px 5px",
              borderRadius: 3,
            }}
          >
            sklearn
          </code>{" "}
          and runs{" "}
          <code
            style={{
              fontFamily: mono,
              fontSize: "13px",
              color: "var(--text)",
              background: "color-mix(in srgb, var(--muted) 15%, transparent)",
              padding: "1px 5px",
              borderRadius: 3,
            }}
          >
            .fit()
          </code>{" "}
          and{" "}
          <code
            style={{
              fontFamily: mono,
              fontSize: "13px",
              color: "var(--text)",
              background: "color-mix(in srgb, var(--muted) 15%, transparent)",
              padding: "1px 5px",
              borderRadius: 3,
            }}
          >
            .predict()
          </code>
          . Very soon, an AI agent may do that part for us.
          <Ref n={1} href="https://towardsdatascience.com/data-science-in-2026-is-it-still-worth-it/" />
        </p>
        <p>
          This shows up in job postings too. Machine learning skills appear in
          77% of data scientist job postings (2025)
          <Ref n={2} href="https://365datascience.com/career-advice/career-guides/data-scientist-job-outlook-2025/" />
          , but running models isn&apos;t the bar. Statistics and ML together
          ranked first across all 101 job postings analysed in 2026 - the same
          position they held in 2025.
          <Ref n={3} href="https://www.askdatadawn.com/p/how-has-the-data-science-job-market" />{" "}
          What employers are consistently selecting for is reasoning, not just
          simple implementation.
        </p>

        <h2
          id="valid"
          className="!mt-12 text-[22px] tracking-tight font-semibold"
          style={{ color: "var(--text)" }}
        >
          AI can write the code. It can&apos;t tell you if it&apos;s valid.
        </h2>
        <p>
          Here&apos;s what AI is genuinely good at: getting you to a working
          implementation quickly. What it can&apos;t do is tell you whether this
          implementation is statistically appropriate for your problem.
        </p>
        <p>
          The model doesn&apos;t &apos;know&apos; your data like a human can
          (not yet, anyway). It doesn&apos;t know that your classes are wildly
          imbalanced, that you&apos;re leaking your test set, or that the loss
          function is simply wrong for the task. It will confidently give you
          code that runs perfectly, without any indication that something is
          off.
        </p>
        <p>
          Amazon&apos;s scrapped recruiting program is a canonical example of
          this going wrong at scale. The company trained its hiring AI on
          resumes of existing employees, which seemed like standard practice.
          But Amazon&apos;s workforce was disproportionately male, so the
          algorithm learned that being male was a marker of success.
          <Ref n={4} href="https://www.cangrade.com/blog/hr-strategy/hiring-bias-gone-wrong-amazon-recruiting-case-study/" />{" "}
          The models penalised terms associated with women, and the initial
          bias compounded over time, becoming an echo chamber of its own making
          (not unlike the feedback loops keeping your reels exactly as niche as
          they are).
          <Ref n={5} href="https://www.rhsmith.umd.edu/research/problem-amazons-ai-recruiter" />{" "}
          The code worked. The model trained. The outputs were wrong. Nobody
          caught it because catching it requires something AI doesn&apos;t
          have: an understanding of what the data actually represents and who
          it excludes. This is the failure mode vibe coding bakes in. You get
          a model that runs.{" "}
          <em style={{ color: "var(--text)" }}>
            You don&apos;t get a model you can trust.
          </em>
        </p>

        <h2
          id="diagnosis"
          className="!mt-12 text-[22px] tracking-tight font-semibold"
          style={{ color: "var(--text)" }}
        >
          Knowing when the model is wrong.
        </h2>
        <p>
          Some of the most important skills in data science come from
          diagnosing models, not just building them.
        </p>
        <p>
          Take gradient descent. When you prompt AI to optimise, it&apos;ll do
          it. But do you know what a healthy loss curve looks like? Can you
          tell the difference between a model converging properly and one
          that&apos;s oscillating, or plateauing early? Without that intuition,
          you have no way to know whether the training process is doing what
          you think it&apos;s doing.
        </p>
        <p>
          Or take overfitting. The classic symptom is a validation loss that
          climbs while training loss keeps falling. But to actually diagnose it
          - to know whether you need more data, stronger regularisation, a
          simpler architecture, or to revisit your feature engineering - you
          need to understand the bias-variance tradeoff. Googling &quot;my val
          loss is going up&quot; gets you a list of possible causes.
          Understanding the mechanics tells you which one applies to your
          situation.
        </p>

        <figure className="my-8">
          <img
            src="/blogs/overfitting.png"
            alt="Overfitting diagram"
            className="w-full rounded-md"
            style={{ border: "1px solid var(--border)" }}
          />
          <figcaption
            className="mt-2 text-[12px] text-center"
            style={{ color: "var(--muted)" }}
          >
            Overfitting in supervised learning. Training error in blue,
            validation error in red, as a function of training cycles. Gringer,{" "}
            <em>Overfitting</em>, CC BY 3.0, via Wikimedia Commons.
          </figcaption>
        </figure>

        <p>
          Then there&apos;s the problem that breaks things most in production:
          hypothesis testing. A result that looks statistically significant
          isn&apos;t necessarily meaningful. You need the intuition to know
          when a result is real and when it&apos;s noise - understanding
          p-values, effect sizes, confidence intervals, and when you simply
          need more data.
          <Ref n={6} href="https://careery.pro/blog/data-science-careers/how-to-become-a-data-scientist" />
        </p>

        <figure className="my-8">
          <img
            src="/blogs/xkcd_effect_size.png"
            alt="xkcd comic"
            className="w-full rounded-md"
            style={{ border: "1px solid var(--border)" }}
          />
          <figcaption
            className="mt-2 text-[12px] text-center"
            style={{ color: "var(--muted)" }}
          >
            Subgroup analysis is ongoing.{" "}
            <a
              href="https://xkcd.com/2755"
              target="_blank"
              rel="noopener noreferrer"
              className="site-link"
            >
              xkcd.com/2755
            </a>
          </figcaption>
        </figure>

        <p>
          A data scientist who reports a &quot;significant&quot; A/B test
          result without checking effect size, or who doesn&apos;t account for
          multiple comparisons, can send an organisation down the wrong path
          with complete statistical cover.
        </p>
        <p>
          Mathematical intuition is your error-detection layer. Without it, you
          have no way to audit your own work.
        </p>

        <h2
          id="agentic"
          className="!mt-12 text-[22px] tracking-tight font-semibold"
          style={{ color: "var(--text)" }}
        >
          The agentic shift raises the stakes.
        </h2>
        <p>
          All of this is already a problem when you&apos;re the one running the
          code. It gets considerably worse when the code runs itself.
        </p>
        <p>
          We&apos;re in the middle of a shift from generative AI tools you
          interact with, to agentic systems that make decisions autonomously.
          In a traditional workflow, there&apos;s a human in the loop at each
          step - someone who can sanity-check the output before it flows
          downstream. Agentic pipelines remove that checkpoint. They chain
          model outputs together automatically, passing results from one step
          to the next without pausing for review.
        </p>
        <p>
          The problem is that if you put garbage in, you will almost certainly
          get garbage out. Most multi-agent systems don&apos;t fail because the
          models are bad. They fail because we compose them as if probability
          doesn&apos;t compound. Even a high-performing agent with a 98%
          per-task success rate, chained through multiple steps, can see
          overall system accuracy degrade to 90% or lower.
          <Ref n={7} href="https://www.oreilly.com/radar/the-hidden-cost-of-agentic-failure/" />
        </p>

        <blockquote
          className="my-6 pl-5 py-1 text-[15px] leading-[1.75]"
          style={{
            borderLeft: "2px solid var(--muted)",
            color: "var(--text)",
            fontStyle: "italic",
          }}
        >
          &quot;If your AI model has a 1% error rate and you plan over 5,000
          steps, that 1% compounds like compound interest.&quot;
          <footer
            className="mt-2 text-[12px] not-italic"
            style={{ color: "var(--muted)", fontFamily: mono, fontStyle: "normal" }}
          >
            - Demis Hassabis, DeepMind CEO
            <Ref n={8} href="https://www.zlti.com/blog/federal-agentic-ai-how-data-solves-the-compounding-error-problem/" />
          </footer>
        </blockquote>

        <p>
          This renders outcomes effectively random. Snowflake&apos;s director
          of AI infrastructure frames this as the defining challenge of 2026:
          &quot;it will be very hard to rely on agents if we don&apos;t have a
          way of systematically measuring their accuracy.&quot;
          <Ref n={9} href="https://www.snowflake.com/content/dam/snowflake-site/en/landing-pages/ai-and-data-predictions-2026/report-ai-data-predictions-2026.pdf" />
        </p>
        <p>
          This is where a bad statistical assumption at step one becomes
          catastrophic. Single agents can make inconsistent decisions from
          fragmented data, while multi-agent systems lose coordination and
          propagate errors silently through the entire workflow. McKinsey
          found that nearly two-thirds of enterprises have experimented with
          agents, but fewer than 10% have scaled them to deliver tangible
          value, with data quality and faulty assumptions as the primary
          blocker.
          <Ref n={10} href="https://www.mckinsey.com/capabilities/mckinsey-technology/our-insights/building-the-foundations-for-agentic-ai-at-scale" />
        </p>

        <figure className="my-8">
          <img
            src="/blogs/AgenticFoundations_Ex1.svg"
            alt="McKinsey figure"
            className="w-full rounded-md"
            style={{ border: "1px solid var(--border)" }}
          />
        </figure>

        <p>
          The skill being valued right now isn&apos;t &quot;can you implement
          an agent.&quot; It&apos;s &quot;can you reason about what happens
          when this system fails.&quot; That&apos;s a fundamentally statistical
          question.
        </p>

        <h2
          id="reframe"
          className="!mt-12 text-[22px] tracking-tight font-semibold"
          style={{ color: "var(--text)" }}
        >
          Reframe the maths.
        </h2>
        <p>
          There&apos;s a temptation to treat mathematical foundations as
          gatekeeping - the hard stuff you get through before you&apos;re
          allowed to do the interesting work. That framing gets it backwards.
        </p>
        <p style={{ color: "var(--text)" }}>
          The maths is not the prerequisite. The maths is the edge.
        </p>
        <p>
          Vibe coding gets you to roughly 80% of a working solution. For many
          tasks, that&apos;s fine. But data science is a field built on making
          claims about the world and having people act on them. The ability to
          explain why a result shouldn&apos;t drive action - to push back on
          your own model before someone else has to - is what separates junior
          practitioners from senior ones. In an agentic world, wrong decisions
          don&apos;t just sit in a notebook. They scale automatically.
        </p>
        <p>
          Causal inference is increasingly being flagged as a highly
          sought-after skill
          <Ref n={3} href="https://www.askdatadawn.com/p/how-has-the-data-science-job-market" />{" "}
          - not because the tooling changed, but because autonomous systems
          need someone who can reason about whether a correlation actually
          means anything. The models are getting smarter. That means the
          problems you&apos;re being asked to solve are getting harder, the
          stakes are higher, and the gap between someone who can implement and
          someone who can reason is getting wider.
        </p>
        <p style={{ color: "var(--text)" }}>
          The models are getting smarter. So should you. ■
        </p>

        <h2
          id="references"
          className="!mt-14 text-[16px] tracking-tight font-semibold"
          style={{ color: "var(--text)" }}
        >
          References :P
        </h2>
        <ol
          className="mt-4 text-[13px] space-y-2 list-decimal pl-5"
          style={{ color: "var(--muted)" }}
        >
          <li>
            Bendimerad, S. (2025). Data Science in 2026: Is It Still Worth It?{" "}
            <em>Towards Data Science</em>.{" "}
            <a
              href="https://towardsdatascience.com/data-science-in-2026-is-it-still-worth-it/"
              target="_blank"
              rel="noopener noreferrer"
              className="site-link break-all"
            >
              towardsdatascience.com
            </a>
          </li>
          <li>
            365 Data Science. (2025). Data Scientist Job Outlook 2025.{" "}
            <a
              href="https://365datascience.com/career-advice/career-guides/data-scientist-job-outlook-2025/"
              target="_blank"
              rel="noopener noreferrer"
              className="site-link break-all"
            >
              365datascience.com
            </a>
          </li>
          <li>
            Choo, D. (2026). 2026 vs. 2025 Data Science Job Market.{" "}
            <a
              href="https://www.askdatadawn.com/p/how-has-the-data-science-job-market"
              target="_blank"
              rel="noopener noreferrer"
              className="site-link break-all"
            >
              askdatadawn.com
            </a>
          </li>
          <li>
            Cangrade. (2023). Hiring Bias Gone Wrong: Amazon Recruiting Case
            Study.{" "}
            <a
              href="https://www.cangrade.com/blog/hr-strategy/hiring-bias-gone-wrong-amazon-recruiting-case-study/"
              target="_blank"
              rel="noopener noreferrer"
              className="site-link break-all"
            >
              cangrade.com
            </a>
          </li>
          <li>
            University of Maryland. (2018). The Problem With Amazon&apos;s AI
            Recruiter.{" "}
            <a
              href="https://www.rhsmith.umd.edu/research/problem-amazons-ai-recruiter"
              target="_blank"
              rel="noopener noreferrer"
              className="site-link break-all"
            >
              rhsmith.umd.edu
            </a>
          </li>
          <li>
            Careery. (2026). How to Become a Data Scientist in 2026.{" "}
            <a
              href="https://careery.pro/blog/data-science-careers/how-to-become-a-data-scientist"
              target="_blank"
              rel="noopener noreferrer"
              className="site-link break-all"
            >
              careery.pro
            </a>
          </li>
          <li>
            O&apos;Reilly. (2026). The Hidden Cost of Agentic Failure.{" "}
            <a
              href="https://www.oreilly.com/radar/the-hidden-cost-of-agentic-failure/"
              target="_blank"
              rel="noopener noreferrer"
              className="site-link break-all"
            >
              oreilly.com
            </a>
          </li>
          <li>
            ZLTI. (2025). Federal Agentic AI: How Data Solves the Compounding
            Error Problem.{" "}
            <a
              href="https://www.zlti.com/blog/federal-agentic-ai-how-data-solves-the-compounding-error-problem/"
              target="_blank"
              rel="noopener noreferrer"
              className="site-link break-all"
            >
              zlti.com
            </a>
          </li>
          <li>
            Snowflake. (2025). AI + Data Predictions 2026.{" "}
            <a
              href="https://www.snowflake.com/content/dam/snowflake-site/en/landing-pages/ai-and-data-predictions-2026/report-ai-data-predictions-2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="site-link break-all"
            >
              snowflake.com
            </a>
          </li>
          <li>
            McKinsey. (2026). Building the Foundations for Agentic AI at
            Scale.{" "}
            <a
              href="https://www.mckinsey.com/capabilities/mckinsey-technology/our-insights/building-the-foundations-for-agentic-ai-at-scale"
              target="_blank"
              rel="noopener noreferrer"
              className="site-link break-all"
            >
              mckinsey.com
            </a>
          </li>
        </ol>
      </div>
    </DocsShell>
  );
}
