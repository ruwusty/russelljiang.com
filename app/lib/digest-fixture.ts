import type { Digest } from "./digest-types";

// DEVELOPMENT ONLY. local checkouts have no blob token, so /digest would only
// ever show its empty state; this gives the page something realistic to be
// designed against. readLatestDigest() returns it only when NODE_ENV is
// "development" and the blob read came back empty — production builds never
// reach it. the items, sources and products are all invented on purpose
// (this repo is public): plausible shapes, not real news about real orgs,
// and every link goes to example.com.
export function digestFixture(): Digest {
  const items: Digest["items"] = [
    {
      title: "Agents that say \"verified\" now have to show the receipt",
      summary:
        "a training note on grounding tool-use claims: the model is penalised for reporting checks it never ran. confident wrong answers drop on long coding tasks.",
      source: "acme ai lab",
      url: "https://example.com/digest-fixture/01",
      tag: "AI",
      priority: "high",
    },
    {
      title: "A small model gets a two-million-token context at the same price",
      summary:
        "long-context retrieval holds up past a million tokens on needle tests; latency roughly doubles at the top end.",
      source: "mirrorfield",
      url: "https://example.com/digest-fixture/02",
      tag: "AI",
      priority: "medium",
    },
    {
      title: "Small models, big verifiers: self-play for theorem proving",
      summary:
        "a 7b prover paired with a lean checker beats much larger models on minif2f by generating and pruning its own curriculum.",
      source: "preprint server",
      url: "https://example.com/digest-fixture/03",
      tag: "AI",
      priority: "medium",
    },
    {
      title: "Logical qubits below threshold on a 144-qubit chip",
      summary:
        "surface-code error rates drop as code distance grows from 3 to 7, the scaling everyone has been waiting to see on real hardware.",
      source: "qbit weekly",
      url: "https://example.com/digest-fixture/04",
      tag: "Quantum",
      priority: "high",
    },
    {
      title: "Why your quantum advantage claim probably has a classical shortcut",
      summary:
        "tensor-network simulation catches up to three recent sampling experiments; the authors propose a checklist for future claims.",
      source: "preprint server",
      url: "https://example.com/digest-fixture/05",
      tag: "Quantum",
      priority: "medium",
    },
    {
      title: "A type checker rewritten in a systems language goes default",
      summary:
        "type-checking a large monorepo goes from minutes to seconds. the old checker stays around as a fallback for a release.",
      source: "the build log",
      url: "https://example.com/digest-fixture/06",
      tag: "Dev Tools",
      priority: "high",
    },
    {
      title: "CI runners add dependency caching that survives forks",
      summary:
        "cache scopes now follow the base repo, so first-time contributors stop paying full install cost on every pull request.",
      source: "pipeline notes",
      url: "https://example.com/digest-fixture/07",
      tag: "Dev Tools",
      priority: "medium",
    },
    {
      title: "Satellite methane plumes, now attributed to individual wells",
      summary:
        "a public dataset pairs hyperspectral imagery with permit records; regulators in two states have started using it for inspections.",
      source: "field & orbit",
      url: "https://example.com/digest-fixture/08",
      tag: "Applied Tech",
      priority: "medium",
    },
    {
      title: "Hospitals quietly retire their first-generation sepsis models",
      summary:
        "a multi-site audit finds alert fatigue outweighed early detection; replacements lean on simpler rules plus clinician review.",
      source: "ward report",
      url: "https://example.com/digest-fixture/09",
      tag: "Applied Tech",
      priority: "medium",
    },
    {
      title: "A local model runner hits 1.0 with a stable plugin api",
      summary:
        "local runners finally get a contract to build on; quantised vision models and tool calling are first-class.",
      source: "open garden",
      url: "https://example.com/digest-fixture/10",
      tag: "Open Source",
      priority: "medium",
    },
    {
      title: "The case for boring evals",
      summary:
        "an argument that most benchmark wins are prompt-format wins, with a reproducible harness that pins every formatting choice.",
      source: "notes from the lab",
      url: "https://example.com/digest-fixture/11",
      tag: "Research",
      priority: "medium",
    },
    {
      title: "Sparse autoencoders find the same features across model families",
      summary:
        "features learned on one model transfer to another with a linear map, hinting that interpretability work may not have to start over each release.",
      source: "preprint server",
      url: "https://example.com/digest-fixture/12",
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
