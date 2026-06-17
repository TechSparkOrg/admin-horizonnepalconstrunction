"use client";

import { ArrowLeft, Loader2, FileText, Image, ImagePlus, Stamp, Signature, Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, Heading3, Link, Table as TableIcon, Undo, Redo, Minus } from "lucide-react";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaPickerDialog } from "@/components/global_ui/MediahanlderPicker";
import type { MediaItem } from "@/components/global_ui/MediahanlderPicker";

interface TemplateFormData {
  title: string;
  slug: string;
  isActive: boolean;
  backgroundImage: boolean;
  backgroundImageUrl: string;
  showStamp: boolean;
  stampImageUrl: string;
  showSignature: boolean;
  signatureImageUrl: string;
  content: string;
}

interface AttributeGroup {
  label: string;
  values: string[];
}

interface Props {
  form: TemplateFormData;
  editingId: string | null;
  saving: boolean;
  attributeGroups: AttributeGroup[];
  onChange: (key: string, value: string | boolean) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY: TemplateFormData = {
  title: "",
  slug: "",
  isActive: true,
  backgroundImage: false,
  backgroundImageUrl: "",
  showStamp: false,
  stampImageUrl: "",
  showSignature: false,
  signatureImageUrl: "",
  content: "",
};

export { EMPTY };
export type { TemplateFormData };

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
      <button type="button" onClick={() => onChange(true)}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
          value ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
        }`}>Yes</button>
      <button type="button" onClick={() => onChange(false)}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
          !value ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
        }`}>No</button>
    </div>
  );
}

function ToolbarButton({ active, onClick, label, children }: { active?: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button type="button" onMouseDown={(e) => { e.preventDefault(); onClick(); }} title={label}
      className={`size-8 grid place-items-center rounded-md text-sm transition shrink-0 ${
        active ? "bg-[lab(20_23.9_-60.14)]/10 text-[lab(20_23.9_-60.14)]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      }`}>{children}</button>
  );
}

function Divider() { return <div className="w-px h-5 bg-gray-200 shrink-0 mx-0.5" />; }

function LinkDialog({ editor, onClose }: { editor: any; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const existing = editor.getAttributes("link").href || "";
  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);
  const setLink = () => {
    const url = inputRef.current?.value;
    if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    else editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onClose();
  };
  return (
    <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg absolute top-full left-0 mt-1 z-50">
      <input ref={inputRef} defaultValue={existing} placeholder="https://..."
        className="w-56 h-8 px-2 rounded border border-gray-200 text-xs text-gray-900 outline-none focus:border-[lab(20_23.9_-60.14)]"
        onKeyDown={(e) => { if (e.key === "Enter") setLink(); if (e.key === "Escape") onClose(); }} />
      <button type="button" onClick={setLink}
        className="h-8 px-3 rounded bg-[lab(20_23.9_-60.14)] text-white text-xs font-medium hover:bg-[lab(15_23.9_-60.14)] transition">Apply</button>
    </div>
  );
}

export function TemplateForm({ form, editingId, saving, attributeGroups, onChange, onSave, onBack }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerField, setPickerField] = useState<"backgroundImageUrl" | "stampImageUrl" | "signatureImageUrl">("backgroundImageUrl");
  const [linkOpen, setLinkOpen] = useState(false);
  const [currentHtml, setCurrentHtml] = useState("");
  const initialized = useRef(false);

  const openPicker = (field: typeof pickerField) => { setPickerField(field); setPickerOpen(true); };
  const handleMediaSelect = useCallback((item: MediaItem) => { onChange(pickerField, item.url); }, [pickerField, onChange]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Enter template content here...\nUse {token_name} for dynamic values." }),
      Table.configure({ resizable: true }),
      TableRow, TableCell, TableHeader,
    ],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setCurrentHtml(html);
      onChange("content", html);
    },
  });

  useEffect(() => {
    if (editor && !initialized.current) {
      initialized.current = true;
      if (form.content) {
        editor.commands.setContent(form.content);
        setCurrentHtml(form.content);
      }
    }
  }, [editor, form.content]);

  const insertToken = (token: string) => { editor?.chain().focus().insertContent(`{${token}}`).run(); };
  const insertPageBreak = () => { editor?.chain().focus().setHorizontalRule().run(); };

  const systemTokenGroups = useMemo(() => [
    ...(form.showStamp ? [{ label: "Stamp", tokens: ["stamp"] }] : []),
    ...(form.showSignature ? [{ label: "Signature", tokens: ["signature"] }] : []),
  ], [form.showStamp, form.showSignature]);

  if (!editor) return null;

  return (
    <div>
      <MediaPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} mode="image" title="Choose Image" onSelect={handleMediaSelect} />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack}><ArrowLeft className="size-4" /></Button>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Templates</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-none">{editingId ? form.title || "Edit Template" : "New Template"}</h1>
          </div>
        </div>
        <Button onClick={onSave} disabled={!form.title.trim() || saving}
          className="bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] text-white">
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Saving\u2026" : editingId ? "Update" : "Create"}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div>
          <TabsList className="bg-gray-100 rounded-lg p-0.5 gap-0 w-auto h-auto">
            <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">Overview</TabsTrigger>
            <TabsTrigger value="content" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">Content</TabsTrigger>
            <TabsTrigger value="media" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">Media</TabsTrigger>
          </TabsList>
        </div>

        <div>
          <TabsContent value="overview" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input value={form.title} onChange={(e) => onChange("title", e.target.value)} placeholder="Template title" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Slug</Label>
                    <div className="flex rounded-md border border-gray-200 overflow-hidden">
                      <span className="px-3 flex items-center text-xs text-gray-500 bg-gray-100 border-r border-gray-200 shrink-0">/</span>
                      <Input value={form.slug} onChange={(e) => onChange("slug", e.target.value)} placeholder="template-slug"
                        className="border-0 rounded-none font-mono focus-visible:ring-0" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Status</p>
                  <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                    <button type="button" onClick={() => onChange("isActive", true)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        form.isActive ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                      }`}>Active</button>
                    <button type="button" onClick={() => onChange("isActive", false)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        !form.isActive ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                      }`}>Inactive</button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <p className="text-sm font-semibold text-gray-900">Template Body</p>

                <div className="space-y-2">
                  <Label className="text-[11px] text-gray-500">Available Tokens</Label>
                  {attributeGroups.length === 0 && systemTokenGroups.length === 0 ? (
                    <p className="text-xs text-gray-400">No tokens available. Select an attribute first.</p>
                  ) : (
                    <div className="space-y-2">
                      {attributeGroups.map((g) => (
                        <div key={g.label}>
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">{g.label}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {g.values.map((v) => (
                              <button key={v} type="button" onClick={() => insertToken(v)}
                                className="text-[11px] px-2 py-1 rounded bg-[lab(20_23.9_-60.14)]/10 text-[lab(20_23.9_-60.14)] font-medium hover:bg-[lab(20_23.9_-60.14)]/20 transition cursor-pointer whitespace-nowrap">
                                {`{${v}}`}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      {systemTokenGroups.length > 0 && (
                        <div className="pt-1 border-t border-gray-100">
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">System Fields</p>
                          <div className="flex flex-wrap gap-1.5">
                            {systemTokenGroups.flatMap((g) => g.tokens).map((t) => (
                              <button key={t} type="button" onClick={() => insertToken(t)}
                                className="text-[11px] px-2 py-1 rounded bg-gray-200 text-gray-600 font-medium hover:bg-gray-300 transition cursor-pointer whitespace-nowrap">
                                {`{${t}}`}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] text-gray-500">Content</Label>
                    <Button type="button" variant="outline" size="sm" className="h-7 text-[11px]" onClick={insertPageBreak}>
                      <Minus className="size-3" /> Page Break
                    </Button>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50/50 overflow-x-auto">
                      <ToolbarButton label="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="size-4" /></ToolbarButton>
                      <ToolbarButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="size-4" /></ToolbarButton>
                      <ToolbarButton label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="size-4" /></ToolbarButton>
                      <Divider />
                      <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="size-4" /></ToolbarButton>
                      <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="size-4" /></ToolbarButton>
                      <Divider />
                      <ToolbarButton label="Bullet List" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="size-4" /></ToolbarButton>
                      <ToolbarButton label="Numbered List" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="size-4" /></ToolbarButton>
                      <Divider />
                      <ToolbarButton label="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="size-4" /></ToolbarButton>
                      <Divider />
                      <ToolbarButton label="Link" active={editor.isActive("link")} onClick={() => setLinkOpen((o) => !o)}><Link className="size-4" /></ToolbarButton>
                      {linkOpen && <LinkDialog editor={editor} onClose={() => setLinkOpen(false)} />}
                      <Divider />
                      <ToolbarButton label="Table" active={editor.isActive("table")} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon className="size-4" /></ToolbarButton>
                      <Divider />
                      <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo className="size-4" /></ToolbarButton>
                      <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo className="size-4" /></ToolbarButton>
                    </div>
                    <EditorContent editor={editor} className="
                      prose prose-sm max-w-none p-4
                      [&_.ProseMirror]:outline-none
                      [&_.ProseMirror_p]:text-gray-900
                      [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-300
                      [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
                      [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
                      [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
                      [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
                      [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-gray-200 [&_.ProseMirror_th]:p-2 [&_.ProseMirror_th]:bg-gray-50 [&_.ProseMirror_th]:font-semibold [&_.ProseMirror_th]:text-left
                      [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-gray-200 [&_.ProseMirror_td]:p-2 [&_.ProseMirror_td]:align-top
                    " />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="mt-4 space-y-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Image className="size-4 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-900">Background Image</p>
                  </div>
                  <Toggle value={form.backgroundImage} onChange={(v) => onChange("backgroundImage", v)} />
                </div>
                {form.backgroundImage && (
                  <div className="space-y-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => openPicker("backgroundImageUrl")}>
                      <ImagePlus className="size-3.5" /> Choose Image
                    </Button>
                    {form.backgroundImageUrl && (
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                          <img src={form.backgroundImageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <button type="button" onClick={() => onChange("backgroundImageUrl", "")}
                          className="text-xs text-red-500 hover:text-red-600">Remove</button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Stamp className="size-4 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-900">Stamp</p>
                  </div>
                  <Toggle value={form.showStamp} onChange={(v) => onChange("showStamp", v)} />
                </div>
                {form.showStamp && (
                  <div className="space-y-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => openPicker("stampImageUrl")}>
                      <ImagePlus className="size-3.5" /> Choose Image
                    </Button>
                    {form.stampImageUrl && (
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                          <img src={form.stampImageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <button type="button" onClick={() => onChange("stampImageUrl", "")}
                          className="text-xs text-red-500 hover:text-red-600">Remove</button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Signature className="size-4 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-900">Signature</p>
                  </div>
                  <Toggle value={form.showSignature} onChange={(v) => onChange("showSignature", v)} />
                </div>
                {form.showSignature && (
                  <div className="space-y-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => openPicker("signatureImageUrl")}>
                      <ImagePlus className="size-3.5" /> Choose Image
                    </Button>
                    {form.signatureImageUrl && (
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                          <img src={form.signatureImageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <button type="button" onClick={() => onChange("signatureImageUrl", "")}
                          className="text-xs text-red-500 hover:text-red-600">Remove</button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
