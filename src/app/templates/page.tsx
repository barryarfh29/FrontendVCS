"use client";

import { useEffect, useState } from "react";
import { getTemplates, type Template } from "@/lib/api";
import { TEMPLATE_META } from "@/lib/template-defaults";
import { TemplateEditor } from "@/components/template-editor";
import { FileText, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTemplates();
        setTemplates(data || []);
      } catch (err) {
        console.error("Failed to load templates:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectedTemplate = templates.find((t) => t.key === selectedKey);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="ui-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold gradient-text">
          Message Templates
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Edit template pesan bot Telegram
        </p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Template List */}
        <div className="w-72 shrink-0 ui-card overflow-y-auto">
          <div className="p-3 space-y-1">
            {templates.map((template) => {
              const meta = TEMPLATE_META[template.key];
              return (
                <button
                  key={template.key}
                  onClick={() => setSelectedKey(template.key)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200",
                    selectedKey === template.key
                      ? "bg-gradient-to-r from-primary/25 to-primary/5 text-primary shadow-[inset_0_0_0_1px_rgba(139,92,246,0.25)]"
                      : "hover:bg-secondary text-foreground"
                  )}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {meta?.label || template.key}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {meta?.description || ""}
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0 transition-all",
                      selectedKey === template.key
                        ? "opacity-100 text-primary"
                        : "opacity-40"
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 min-w-0">
          {selectedTemplate ? (
            <TemplateEditor
              key={selectedKey}
              template={selectedTemplate}
              onSaved={(updated) => {
                setTemplates((prev) =>
                  prev.map((t) =>
                    t.key === updated.key ? { ...t, content: updated.content } : t
                  )
                );
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center ui-card">
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/60 flex items-center justify-center">
                  <FileText className="h-8 w-8 opacity-60" />
                </div>
                <p>Pilih template untuk mengedit</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
