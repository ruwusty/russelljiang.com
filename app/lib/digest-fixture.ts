import type { Digest } from "./digest-types";

// DEVELOPMENT ONLY. local checkouts have no blob token, so /digest would only
// ever show its empty state; this gives the page something realistic to be
// designed against. readLatestDigest() returns it only when NODE_ENV is
// "development" and the blob read came back empty — production builds never
// reach it. the items are invented: plausible shapes, not real news.
export function digestFixture(): Digest {
  const items: Digest["items"] = [
    {
      title: "Claude learns to say \"I checked\" only when it actually checked",
      summary:
        "a training note on grounding tool-use claims: the model is penalised for reporting verification it never ran. evals show fewer confident wrong answers on agentic coding tasks.",
      source: "anthropic",
      url: "https://www.anthropic.com/research/grounded-verification",
      tag: "AI",
      priority: "high",
    },
    {
      title: "Gemini 3.5 Flash gets a 2M-token context window at the same price",
      summary:
        "long-context retrieval holds up past a million tokens on needle tests; latency roughly doubles at the top end.",
      source: "google deepmind",
      url: "https://deepmind.google/discover/blog/gemini-3-5-flash-long-context/",
      tag: "AI",
      priority: "medium",
    },
    {
      title: "Small models, big verifiers: self-play for theorem proving",
      summary:
        "a 7b prover paired with a lean checker beats much larger models on minif2f by generating and pruning its own curriculum.",
      source: "arxiv cs.LG",
      url: "https://arxiv.org/abs/2610.01482",
      tag: "AI",
      priority: "medium",
    },
    {
      title: "Logical qubits below threshold on a 144-qubit chip",
      summary:
        "surface-code error rates drop as code distance grows from 3 to 7, the scaling everyone has been waiting to see on real hardware.",
      source: "google quantum ai",
      url: "https://blog.google/technology/research/quantum-below-threshold-144/",
      tag: "Quantum",
      priority: "high",
    },
    {
      title: "Why your quantum advantage claim probably has a classical shortcut",
      summary:
        "tensor-network simulation catches up to three recent sampling experiments; the authors propose a checklist for future claims.",
      source: "arxiv quant-ph",
      url: "https://arxiv.org/abs/2610.00917",
      tag: "Quantum",
      priority: "medium",
    },
    {
      title: "GitHub Actions adds native dependency caching across forks",
      summary:
        "cache scopes now follow the base repo, so first-time contributors stop paying full install cost on every pr.",
      source: "github blog",
      url: "https://github.blog/changelog/2026-10-06-actions-cross-fork-cache/",
      tag: "Dev Tools",
      priority: "medium",
    },
    {
      title: "TypeScript 6.1 ships the Go-native compiler as the default",
      summary:
        "tsc is now the rewritten compiler; type-checking a large monorepo goes from minutes to seconds. the js version stays as tsc-legacy for a release.",
      source: "hacker news",
      url: "https://devblogs.microsoft.com/typescript/announcing-typescript-6-1/",
      tag: "Dev Tools",
      priority: "high",
    },
    {
      title: "Satellite methane plumes, now attributed to individual wells",
      summary:
        "a public dataset pairs hyperspectral imagery with permit records; regulators in two states have started using it for inspections.",
      source: "mit technology review",
      url: "https://www.technologyreview.com/2026/10/06/methane-plume-attribution/",
      tag: "Applied Tech",
      priority: "medium",
    },
    {
      title: "Hospitals quietly retire their first-generation sepsis models",
      summary:
        "a multi-site audit finds alert fatigue outweighed early detection; replacements lean on simpler rules plus clinician review.",
      source: "hacker news",
      url: "https://news.ycombinator.com/item?id=45512093",
      tag: "Applied Tech",
      priority: "medium",
    },
    {
      title: "Ollama hits 1.0 with a stable plugin api",
      summary:
        "local model runners finally get a contract to build on; quantised vision models and tool calling are first-class.",
      source: "github",
      url: "https://github.com/ollama/ollama/releases/tag/v1.0.0",
      tag: "Open Source",
      priority: "medium",
    },
    {
      title: "The case for boring evals",
      summary:
        "an argument that most benchmark wins are prompt-format wins, with a reproducible harness that pins every formatting choice.",
      source: "eugene yan",
      url: "https://eugeneyan.com/writing/boring-evals/",
      tag: "Research",
      priority: "medium",
    },
    {
      title: "Sparse autoencoders find the same features across model families",
      summary:
        "features learned on one model transfer to another with a linear map, hinting that interpretability work may not have to start over each release.",
      source: "arxiv cs.CL",
      url: "https://arxiv.org/abs/2610.02215",
      tag: "Research",
      priority: "high",
    },
  ];

  return {
    items,
    // "this morning": an hour and a half ago, so the stale-run note stays quiet
    generatedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    itemCount: items.length,
    sourceCount: 14,
  };
}
