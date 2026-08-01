import { Node, mergeAttributes } from "@tiptap/core";

// Pull Quote — <aside> (Bot API 10.1: InputRichBlockPullQuotation)
export const PullQuote = Node.create({
  name: "pullquote",
  group: "block",
  content: "inline*",
  parseHTML: () => [{ tag: "aside" }],
  renderHTML: ({ HTMLAttributes }) => ["aside", mergeAttributes(HTMLAttributes), 0],
});

// Footer — <footer> (InputRichBlockFooter)
export const FooterBlock = Node.create({
  name: "footerBlock",
  group: "block",
  content: "inline*",
  parseHTML: () => [{ tag: "footer" }],
  renderHTML: ({ HTMLAttributes }) => ["footer", mergeAttributes(HTMLAttributes), 0],
});

// Math — <tg-math-block> LaTeX (InputRichBlockMathematicalExpression)
export const MathBlock = Node.create({
  name: "mathBlock",
  group: "block",
  content: "text*",
  marks: "",
  code: true,
  parseHTML: () => [{ tag: "tg-math-block" }],
  renderHTML: ({ HTMLAttributes }) => ["tg-math-block", mergeAttributes(HTMLAttributes), 0],
});

// Fold — <details><summary> (InputRichBlockDetails)
export const DetailsSummary = Node.create({
  name: "detailsSummary",
  content: "inline*",
  parseHTML: () => [{ tag: "summary" }],
  renderHTML: ({ HTMLAttributes }) => ["summary", mergeAttributes(HTMLAttributes), 0],
});

export const Details = Node.create({
  name: "details",
  group: "block",
  content: "detailsSummary block+",
  parseHTML: () => [{ tag: "details" }],
  renderHTML: ({ HTMLAttributes }) => ["details", mergeAttributes(HTMLAttributes, { open: "" }), 0],
});

export const richBlockExtensions = [
  PullQuote,
  FooterBlock,
  MathBlock,
  Details,
  DetailsSummary,
];
