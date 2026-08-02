"use client";

import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { richBlockExtensions } from "@/lib/rich-blocks";
import { updateTalent, type Talent } from "@/lib/api";
import { EditorToolbar } from "./editor-toolbar";
import { useEscClose } from "@/lib/use-esc-close";
import { Save, X, AlertCircle, Eye, Code } from "lucide-react";

interface TalentDescEditorProps {
  talent: Talent;
  onSaved: (updated: Talent) => void;
  onClose: () => void;
}

export function TalentDescEditor({
  talent,
  onSaved,
  onClose,
}: TalentDescEditorProps) {
  useEscClose(onClose);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"editor" | "html" | "preview">(
    "editor"
  );
  const [htmlSource, setHtmlSource] = useState(talent.desc || "");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      ...richBlockExtensions,
    ],
    content: talent.desc || "",
    onUpdate: ({ editor }) => {
      setHtmlSource(editor.getHTML());
      setError(null);
    },
    editorProps: {
      attributes: {
        class: "tiptap focus:outline-none min-h-[200px]",
      },
    },
  });

  const handleSave = useCallback(async () => {
    const desc = viewMode === "html" ? htmlSource : editor?.getHTML() || "";
    setSaving(true);
    setError(null);
    try {
      const updated = await updateTalent(talent.id, { desc });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }, [editor, htmlSource, viewMode, talent.id, onSaved, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">Deskripsi — {talent.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tampil di detail talent (variabel {"{desc}"} pada template
              Talent Detail). Mendukung heading, list, dan tabel.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex bg-secondary rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("editor")}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  viewMode === "editor"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Editor
              </button>
              <button
                onClick={() => setViewMode("html")}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  viewMode === "html"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code className="h-3 w-3" />
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  viewMode === "preview"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="h-3 w-3" />
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-3 w-3" />
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-5 py-2 text-sm bg-destructive/10 text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {viewMode === "editor" && editor && (
            <div>
              <div className="sticky top-0 z-10 bg-card">
                <EditorToolbar editor={editor} />
              </div>
              <EditorContent editor={editor} />
            </div>
          )}

          {viewMode === "html" && (
            <textarea
              value={htmlSource}
              onChange={(e) => {
                setHtmlSource(e.target.value);
                editor?.commands.setContent(e.target.value);
              }}
              className="w-full h-full min-h-[250px] p-4 bg-transparent text-sm font-mono text-foreground resize-none focus:outline-none"
              spellCheck={false}
            />
          )}

          {viewMode === "preview" && (
            <div className="p-6 flex justify-center">
              <div className="w-full max-w-sm">
                <div className="bg-[#2b5278] rounded-xl rounded-tl-sm p-4 shadow-lg telegram-preview">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: htmlSource || editor?.getHTML() || "",
                    }}
                  />
                  <p className="text-[10px] text-right text-white/50 mt-2">
                    12:00
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
