"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  Table,
  Undo,
  Redo,
  Pilcrow,
  TextQuote,
  Quote,
  PanelBottom,
  Code2,
  Sigma,
  ChevronsDownUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const tools = [
    {
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
      title: "Bold",
    },
    {
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
      title: "Italic",
    },
    { type: "divider" as const },
    {
      icon: Heading1,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive("heading", { level: 1 }),
      title: "Heading 1",
    },
    {
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
      title: "Heading 2",
    },
    {
      icon: Heading3,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
      title: "Heading 3",
    },
    {
      icon: Pilcrow,
      action: () => editor.chain().focus().setParagraph().run(),
      active: editor.isActive("paragraph"),
      title: "Paragraph",
    },
    { type: "divider" as const },
    {
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
      title: "Bullet List",
    },
    {
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
      title: "Ordered List",
    },
    { type: "divider" as const },
    {
      icon: TextQuote,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
      title: "Quote",
    },
    {
      icon: Quote,
      action: () => editor.chain().focus().toggleNode("pullquote", "paragraph").run(),
      active: editor.isActive("pullquote"),
      title: "Pull Quote",
    },
    {
      icon: PanelBottom,
      action: () => editor.chain().focus().toggleNode("footerBlock", "paragraph").run(),
      active: editor.isActive("footerBlock"),
      title: "Footer",
    },
    {
      icon: ChevronsDownUp,
      action: () =>
        editor
          .chain()
          .focus()
          .insertContent({
            type: "details",
            content: [
              {
                type: "detailsSummary",
                content: [{ type: "text", text: "Judul (klik untuk buka)" }],
              },
              {
                type: "paragraph",
                content: [{ type: "text", text: "Isi tersembunyi..." }],
              },
            ],
          })
          .run(),
      active: editor.isActive("details"),
      title: "Fold (expandable)",
    },
    { type: "divider" as const },
    {
      icon: Code2,
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      active: editor.isActive("codeBlock"),
      title: "Code Block",
    },
    {
      icon: Sigma,
      action: () => editor.chain().focus().toggleNode("mathBlock", "paragraph").run(),
      active: editor.isActive("mathBlock"),
      title: "Math (LaTeX)",
    },
    { type: "divider" as const },
    {
      icon: Minus,
      action: () => editor.chain().focus().setHorizontalRule().run(),
      active: false,
      title: "Divider",
    },
    {
      icon: Table,
      // Di dalam tabel: tambah 1 baris. Di luar: buat tabel baru (header + 1 baris)
      action: () =>
        editor.isActive("table")
          ? editor.chain().focus().addRowAfter().run()
          : editor
              .chain()
              .focus()
              .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
              .run(),
      active: editor.isActive("table"),
      title: "Insert Table / Add Row",
    },
    { type: "divider" as const },
    {
      icon: Undo,
      action: () => editor.chain().focus().undo().run(),
      active: false,
      title: "Undo",
    },
    {
      icon: Redo,
      action: () => editor.chain().focus().redo().run(),
      active: false,
      title: "Redo",
    },
  ];

  return (
    <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border flex-wrap">
      {tools.map((tool, i) => {
        if ("type" in tool && tool.type === "divider") {
          return (
            <div
              key={`div-${i}`}
              className="w-px h-5 bg-border mx-1"
            />
          );
        }

        const { icon: Icon, action, active, title } = tool as {
          icon: React.ComponentType<{ className?: string }>;
          action: () => void;
          active: boolean;
          title: string;
        };

        return (
          <button
            key={title}
            onClick={action}
            title={title}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              active
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
