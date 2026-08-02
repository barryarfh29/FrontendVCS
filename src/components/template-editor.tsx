"use client";

import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { richBlockExtensions } from "@/lib/rich-blocks";
import { updateTemplate, type Template } from "@/lib/api";
import {
  TEMPLATE_DEFAULTS,
  TEMPLATE_META,
  TEMPLATE_PRESETS,
} from "@/lib/template-defaults";
import { EditorToolbar } from "./editor-toolbar";
import { Save, RotateCcw, Eye, Code, AlertCircle, Sparkles } from "lucide-react";

interface TemplateEditorProps {
  template: Template;
  onSaved: (updated: Template) => void;
}

export function TemplateEditor({ template, onSaved }: TemplateEditorProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<"editor" | "html" | "preview">(
    "editor"
  );
  const [htmlSource, setHtmlSource] = useState(template.content || "");

  const meta = TEMPLATE_META[template.key];
  const presets = TEMPLATE_PRESETS[template.key] || [];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      ...richBlockExtensions,
    ],
    content: template.content || "",
    onUpdate: ({ editor }) => {
      setHtmlSource(editor.getHTML());
      setSuccess(false);
      setError(null);
    },
    editorProps: {
      attributes: {
        class: "tiptap focus:outline-none min-h-[300px]",
      },
    },
  });

  const handleSave = useCallback(async () => {
    const content = viewMode === "html" ? htmlSource : editor?.getHTML() || "";
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateTemplate(template.key, content);
      setSuccess(true);
      onSaved({ ...template, content });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }, [editor, htmlSource, viewMode, template, onSaved]);

  const handleReset = useCallback(() => {
    const defaultContent = TEMPLATE_DEFAULTS[template.key] || "";
    editor?.commands.setContent(defaultContent);
    setHtmlSource(defaultContent);
    setError(null);
    setSuccess(false);
  }, [editor, template.key]);

  const applyPreset = useCallback(
    (html: string) => {
      editor?.commands.setContent(html);
      setHtmlSource(html);
      setError(null);
      setSuccess(false);
    },
    [editor]
  );

  return (
    <div className="h-full flex flex-col bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
        <div>
          <h2 className="text-lg font-semibold">
            {meta?.label || template.key}
          </h2>
          {meta?.variables.length ? (
            <p className="text-xs text-muted-foreground mt-0.5">
              Variables: {meta.variables.join(", ")}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggles */}
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
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-3 w-3" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Preset Examples */}
      {presets.length > 0 && (
        <div className="flex items-center gap-2 px-5 py-2 border-b border-border flex-wrap bg-secondary/30 shrink-0">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            Contoh template:
          </span>
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p.html)}
              className="px-2.5 py-1 text-xs rounded-md bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {p.name}
            </button>
          ))}
          <span className="text-[10px] text-muted-foreground ml-auto">
            Klik contoh → edit sesukamu → Save
          </span>
        </div>
      )}

      {/* Status Messages */}
      {(error || success) && (
        <div
          className={`px-5 py-2 text-sm ${
            error
              ? "bg-destructive/10 text-destructive"
              : "bg-success/10 text-success"
          }`}
        >
          {error ? (
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {error}
            </span>
          ) : (
            "✓ Template berhasil disimpan!"
          )}
        </div>
      )}

      {/* Editor Content */}
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
            className="w-full h-full min-h-[300px] p-4 bg-transparent text-sm font-mono text-foreground resize-none focus:outline-none"
            spellCheck={false}
          />
        )}

        {viewMode === "preview" && (
          <div className="p-6 flex justify-center">
            <div className="w-full max-w-sm">
              {/* Telegram-style message bubble */}
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
  );
}
