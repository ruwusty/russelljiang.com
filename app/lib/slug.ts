// heading text -> anchor id. the essay h2s (mdx-components.tsx) and the
// outline built from the same headings (essay-layout.tsx) must agree, so both
// call this.
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
