const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-[440px] space-y-9">

        {/* Name + one-liner */}
        <div
          className="space-y-2 opacity-0 animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          <h1 className="text-[2.25rem] font-semibold tracking-tight leading-none text-[#ededed]">
            Russell Jiang
          </h1>
          <p className="text-[0.875rem] text-[#5a5a6a] tracking-wide">
            Data Science @ UNSW&nbsp;&nbsp;·&nbsp;&nbsp;Tutor&nbsp;&nbsp;·&nbsp;&nbsp;Musician
          </p>
        </div>

        {/* Subtle divider */}
        <div
          className="opacity-0 animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          <div className="w-8 h-px bg-[#2a2a35]" />
        </div>

        {/* About */}
        <p
          className="text-[0.9375rem] text-[#8a8a9a] leading-[1.75] opacity-0 animate-fade-up"
          style={{ animationDelay: "220ms" }}
        >
          First-year Data Science student at UNSW Sydney, exploring the overlap
          between machine learning, statistics, and software that&nbsp;actually does
          something useful. I tutor students in maths and programming on the side.
          When I&apos;m away from a screen, I&apos;m playing clarinet — or slowly getting
          better at guitar.
        </p>

        {/* Links */}
        <div
          className="flex items-center gap-5 opacity-0 animate-fade-up"
          style={{ animationDelay: "340ms" }}
        >
          <a
            href="https://github.com/ruwusty"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="flex items-center gap-2 text-[0.8125rem] text-[#5a5a6a] hover:text-[#818cf8] transition-colors duration-200"
          >
            <GitHubIcon />
            <span>GitHub</span>
          </a>

          <span className="text-[#2a2a35] select-none">·</span>

          <a
            href="https://linkedin.com/in/russelljiang"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="flex items-center gap-2 text-[0.8125rem] text-[#5a5a6a] hover:text-[#818cf8] transition-colors duration-200"
          >
            <LinkedInIcon />
            <span>LinkedIn</span>
          </a>

          <span className="text-[#2a2a35] select-none">·</span>

          <a
            href="mailto:russelljiang@pm.me"
            aria-label="Email"
            className="flex items-center gap-2 text-[0.8125rem] text-[#5a5a6a] hover:text-[#818cf8] transition-colors duration-200"
          >
            <EmailIcon />
            <span>Email</span>
          </a>
        </div>

      </div>
    </main>
  );
}
