import type { Metadata } from "next";
import { EssayLayout } from "../../components/essay-layout";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "the boulder and the ladder — russell jiang",
  description:
    "Why ranked stopped feeling good: zero sum ladders, positive sum hobbies, and the slow migration between them.",
};

export default function Page() {
  return (
    <EssayLayout
      title="the boulder and the ladder"
      subtitle="on quitting ranked, and what the climbing gym knew all along"
      date="2026-07-16"
      crumb="writing/the-boulder-and-the-ladder"
    >
      <Content />
    </EssayLayout>
  );
}
