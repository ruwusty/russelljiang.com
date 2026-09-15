import type { MetadataRoute } from "next";
import { posts } from "./lib/posts";

const SITE = "https://russelljiang.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // essays come from app/lib/posts.ts — the same list the writing index and
  // the prompt's `grep` read — so registering an essay is one edit, not
  // three. lastModified is the post's own date; it used to be `new Date()`
  // on every build, which told crawlers every essay changed every deploy.
  const essays: MetadataRoute.Sitemap = posts
    .filter((p) => p.href)
    .map((p) => ({
      url: `${SITE}${p.href}`,
      lastModified: new Date(p.date),
      changeFrequency: "yearly",
      priority: 0.6,
    }));

  return [
    {
      url: "https://russelljiang.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://russelljiang.com/writing",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...essays,
    {
      url: "https://russelljiang.com/digest",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://russelljiang.com/library",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: "https://russelljiang.com/projects",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: "https://russelljiang.com/guestbook",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];
}
