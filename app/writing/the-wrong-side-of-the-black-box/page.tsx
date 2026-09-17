import type { Metadata } from "next";
import { EssayLayout } from "../../components/essay-layout";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "the wrong side of the black box — russell jiang",
  description:
    "On typesafe ai's jev, a model that answers with probabilities instead of prose, and why most AI engineering tooling lives on the wrong side of the black box.",
};

export default function Page() {
  return (
    <EssayLayout
      title="the wrong side of the black box"
      subtitle="what typesafe ai gets right about models in software"
      date="2026-09-17"
      crumb="writing/the-wrong-side-of-the-black-box"
    >
      <Content />
    </EssayLayout>
  );
}
