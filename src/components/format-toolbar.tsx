"use client";

import { useRef } from "react";
import { TEMPLATE_META } from "@/lib/template-defaults";

type Mode = "html" | "markdown";

interface FormatToolbarProps {
  mode: Mode;
  templateKey: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInsert: (text: string, cursorOffset?: number) => void;
}

// Wrap selected text or insert at cursor
function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  onInsert: (text: string, cursorOffset?: number) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const selected = value.substring(start, end);

  if (selected) {
    const newText =
      value.substring(0, start) + before + selected + after + value.substring(end);
    onInsert(newText, start + before.length + selected.length + after.length);
  } else {
    const newText = value.substring(0, start) + before + after + value.substring(end);
    onInsert(newText, start + before.length);
  }
}

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  text: string,
  onInsert: (text: string, cursorOffset?: number) => void
) {
  const start = textarea.selectionStart;
  const value = textarea.value;
  const newText = value.substring(0, start) + text + value.substring(start);
  onInsert(newText, start + text.length);
}

// HTML toolbar buttons
const HTML_GROUPS = [
  {
    label: "Format",
    buttons: [
      { label: "B", title: "Bold", before: "<b>", after: "</b>" },
      { label: "I", title: "Italic", before: "<i>", after: "</i>" },
      { label: "S", title: "Strikethrough", before: "<s>", after: "</s>" },
    ],
  },
  {
    label: "Heading",
    buttons: [
      { label: "H1", title: "Heading 1", before: "<h1>", after: "</h1>" },
      { label: "H2", title: "Heading 2", before: "<h2>", after: "</h2>" },
      { label: "H3", title: "Heading 3", before: "<h3>", after: "</h3>" },
    ],
  },
  {
    label: "Structure",
    buttons: [
      { label: "¶", title: "Paragraph", before: "<p>", after: "</p>" },
      { label: "OL", title: "Ordered List", before: "<ol><li>", after: "</li></ol>" },
      { label: "UL", title: "Unordered List", before: "<ul><li>", after: "</li></ul>" },
      { label: "BQ", title: "Blockquote", before: "<blockquote>", after: "</blockquote>" },
    ],
  },
  {
    label: "Code",
    buttons: [
      { label: "<>", title: "Inline Code", before: "<code>", after: "</code>" },
      { label: "PRE", title: "Code Block", before: "<pre>", after: "</pre>" },
    ],
  },
  {
    label: "Other",
    buttons: [
      { label: "🔗", title: "Link", before: '<a href="URL">', after: "</a>" },
      { label: "─", title: "Horizontal Rule", insert: "<hr/>" },
      { label: "TBL", title: "Table", insert: "<table><tbody><tr><td><p></p></td><td><p></p></td></tr></tbody></table>" },
    ],
  },
];

// Markdown toolbar buttons
const MD_GROUPS = [
  {
    label: "Format",
    buttons: [
      { label: "B", title: "Bold", before: "**", after: "**" },
      { label: "I", title: "Italic", before: "__", after: "__" },
      { label: "~S~", title: "Strikethrough", before: "~~", after: "~~" },
    ],
  },
  {
    label: "Code",
    buttons: [
      { label: "`", title: "Inline Code", before: "`", after: "`" },
      { label: "```", title: "Code Block", before: "```\n", after: "\n```" },
    ],
  },
  {
    label: "Other",
    buttons: [
      { label: "||", title: "Spoiler", before: "||", after: "||" },
      { label: "🔗", title: "Link", before: "[", after: "](url)" },
    ],
  },
];

export function FormatToolbar({ mode, templateKey, textareaRef, onInsert }: FormatToolbarProps) {
  const groups = mode === "html" ? HTML_GROUPS : MD_GROUPS;
  const meta = TEMPLATE_META[templateKey];
  const variables = meta?.variables || [];

  function handleButton(btn: { before?: string; after?: string; insert?: string }) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();

    if (btn.insert) {
      insertAtCursor(textarea, btn.insert, onInsert);
    } else if (btn.before && btn.after) {
      wrapSelection(textarea, btn.before, btn.after, onInsert);
    }
  }

  function handleVariable(v: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    insertAtCursor(textarea, v, onInsert);
  }

  return (
    <div className="border-b border-border bg-secondary/30 px-4 py-2 space-y-2">
      {/* Mode badge + toolbar buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
            mode === "html"
              ? "bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30"
              : "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30"
          }`}
        >
          {mode === "html" ? "HTML" : "Markdown"}
        </span>

        {groups.map((group, gi) => (
          <span key={gi} className="inline-flex items-center gap-0.5">
            {gi > 0 && <span className="w-px h-5 bg-border mx-1" />}
            {group.buttons.map((btn) => (
              <button
                key={btn.label}
                type="button"
                title={btn.title}
                onClick={() => handleButton(btn)}
                className="px-2 py-1 text-xs font-mono rounded hover:bg-primary/20 hover:text-primary text-muted-foreground transition-colors"
              >
                {btn.label}
              </button>
            ))}
          </span>
        ))}
      </div>

      {/* Variables chips */}
      {variables.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground mr-1">Variabel:</span>
          {variables.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleVariable(v)}
              className="px-2 py-0.5 text-[11px] font-mono rounded bg-primary/10 text-primary ring-1 ring-primary/20 hover:bg-primary/20 transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
