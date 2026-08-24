import type { Metadata } from "next";
import { EssayLayout } from "../../components/essay-layout";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "the tutor that refuses to answer — russell jiang",
  description:
    "On AI tutors, the outsourcing trap, and a learning system whose one unbreakable rule is that the struggle stays mine.",
};

export default function Page() {
  return (
    <EssayLayout
      title="the tutor that refuses to answer"
      subtitle="on ai tutors, the outsourcing trap, and a system that makes me do the work"
      date="2026-08-24"
      crumb="writing/the-tutor-that-refuses-to-answer"
    >
      <Content />
    </EssayLayout>
  );
}
