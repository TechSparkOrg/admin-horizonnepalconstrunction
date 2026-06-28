"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import UnderlineExtension from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import ImageExtension from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import Typography from "@tiptap/extension-typography";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight,
  Bold, CheckSquare, Code, Eraser,
  Heading1, Heading2, Heading3,
  Image as ImageIcon, Italic,
  Link, Link2Off,
  List, ListOrdered, Minus,
  Pilcrow, Quote, Redo, Rows3,
  Strikethrough, SubscriptIcon, SuperscriptIcon,
  RefreshCw, Table as TableIcon, Trash2, Underline, Undo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaPickerDialog, type PickerMediaItem } from "@/components/global_ui/media-handler-picker";

import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";

const replaceImageHandler: { current: ((pos: number) => void) | null } = { current: null };

interface RichEditorInnerProps {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}

const HIGHLIGHTS = ["#fef3c7", "#dcfce7", "#dbeafe", "#fae8ff", "#fee2e2"];

type ToolIcon = React.ComponentType<{ className?: string }>;

interface ToolConfig {
  label: string;
  icon: ToolIcon;
  action: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
  disabled?: (editor: Editor) => boolean;
}

const BLOCK_OPTIONS = [
  { value: "paragraph", label: "Paragraph", icon: Pilcrow },
  { value: "heading1", label: "Heading 1", icon: Heading1 },
  { value: "heading2", label: "Heading 2", icon: Heading2 },
  { value: "heading3", label: "Heading 3", icon: Heading3 },
] as const;

const ALIGN_OPTIONS = [
  { value: "left", label: "Align Left", icon: AlignLeft },
  { value: "center", label: "Align Center", icon: AlignCenter },
  { value: "right", label: "Align Right", icon: AlignRight },
  { value: "justify", label: "Justify", icon: AlignJustify },
] as const;

const FORMAT_TOOLS: ToolConfig[] = [
  { label: "Bold", icon: Bold, isActive: (e) => e.isActive("bold"), action: (e) => e.chain().focus().toggleBold().run() },
  { label: "Italic", icon: Italic, isActive: (e) => e.isActive("italic"), action: (e) => e.chain().focus().toggleItalic().run() },
  { label: "Underline", icon: Underline, isActive: (e) => e.isActive("underline"), action: (e) => e.chain().focus().toggleUnderline().run() },
  { label: "Strikethrough", icon: Strikethrough, isActive: (e) => e.isActive("strike"), action: (e) => e.chain().focus().toggleStrike().run() },
 
  { label: "Subscript", icon: SubscriptIcon, isActive: (e) => e.isActive("subscript"), action: (e) => e.chain().focus().toggleSubscript().run() },
  { label: "Superscript", icon: SuperscriptIcon, isActive: (e) => e.isActive("superscript"), action: (e) => e.chain().focus().toggleSuperscript().run() },
];

const LIST_TOOLS: ToolConfig[] = [
  { label: "Bullet List", icon: List, isActive: (e) => e.isActive("bulletList"), action: (e) => e.chain().focus().toggleBulletList().run() },
  { label: "Numbered List", icon: ListOrdered, isActive: (e) => e.isActive("orderedList"), action: (e) => e.chain().focus().toggleOrderedList().run() },
  { label: "Task List", icon: CheckSquare, isActive: (e) => e.isActive("taskList"), action: (e) => e.chain().focus().toggleTaskList().run() },
  { label: "Blockquote", icon: Quote, isActive: (e) => e.isActive("blockquote"), action: (e) => e.chain().focus().toggleBlockquote().run() },
 
];

const PROSE_MIRROR_CLASSES = [
  "prose prose-sm max-w-none p-4",
  "[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[inherit]",
  "[&_.ProseMirror_p]:text-foreground",
  "[&_.ProseMirror_a]:text-brand-secondary [&_.ProseMirror_a]:underline",
  "[&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-md",
  "[&_.ProseMirror_pre]:rounded-md [&_.ProseMirror_pre]:bg-gray-950 [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:text-gray-50",
  "[&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:py-0.5",
  "[&_.ProseMirror_ul[data-type='taskList']]:list-none [&_.ProseMirror_ul[data-type='taskList']]:pl-0",
  "[&_.ProseMirror_li[data-type='taskItem']]:flex [&_.ProseMirror_li[data-type='taskItem']]:gap-2 [&_.ProseMirror_li[data-type='taskItem']>label]:pt-1",
  "[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground/40",
  "[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
  "[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0",
  "[&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:table-fixed [&_.ProseMirror_table]:w-full",
  "[&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-border [&_.ProseMirror_th]:p-2 [&_.ProseMirror_th]:bg-muted/20 [&_.ProseMirror_th]:font-semibold [&_.ProseMirror_th]:text-left",
  "[&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-border [&_.ProseMirror_td]:p-2 [&_.ProseMirror_td]:align-top",
].join(" ");

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function ToolBtn({ editor, config }: { editor: Editor; config: ToolConfig }) {
  return (
    <Button
      key={config.label}
      variant="ghost"
      size="icon"
      className={config.isActive(editor) ? "bg-brand-secondary/10 text-brand-secondary" : undefined}
      disabled={config.disabled?.(editor)}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => config.action(editor)}
      title={config.label}
      aria-label={config.label}
    >
      <config.icon className="size-4" />
    </Button>
  );
}




// 1. Extend the default Image extension to add width and height attributes
export const ResizableImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        renderHTML: (attributes) => ({ width: attributes.width }),
      },
      height: {
        default: "auto",
        renderHTML: (attributes) => ({ height: attributes.height }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

// 2. The React component rendered inside the editor for every image
function ResizableImageComponent({ node, updateAttributes, selected, editor, getPos }: ReactNodeViewProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsResizing(true);

    const startX = event.clientX;
    const startWidth = imageRef.current?.clientWidth || 300;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentWidth = startWidth + (moveEvent.clientX - startX);
      const finalWidth = Math.max(50, currentWidth);

      updateAttributes({
        width: `${finalWidth}px`,
        height: "auto",
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const showControls = selected || isResizing;
  const align = node.attrs.textAlign || "left";
  const toolbarJustify = align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start";

  return (
    <NodeViewWrapper className="relative" style={{ textAlign: align }}>
      <div className="relative inline-block">
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt}
          style={{
            width: node.attrs.width,
            height: node.attrs.height,
          }}
          className={`rounded-md transition-shadow ${
            showControls ? "ring-2 ring-brand-secondary" : ""
          }`}
        />

        {showControls && (
          <div
            onMouseDown={handleMouseDown}
            className="absolute bottom-1 right-1 w-3 h-3 bg-brand-secondary border border-white rounded-sm cursor-se-resize shadow-md z-10 hover:scale-125 transition-transform"
          />
        )}
      </div>

      {showControls && (
        <div className={`flex ${toolbarJustify} gap-1 mt-1`}>
          <div className="inline-flex items-center gap-1 bg-white border border-border rounded-lg shadow-sm px-1 py-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs gap-1 px-2"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { const pos = getPos(); if (pos !== undefined) replaceImageHandler.current?.(pos); }}
            >
              <RefreshCw className="size-3" />
              Replace
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs gap-1 px-2 text-destructive hover:text-destructive"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().deleteSelection().run()}
            >
              <Trash2 className="size-3" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}

function LinkDialog({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const existing = editor.getAttributes("link").href || "";
  const [url, setUrl] = useState(existing);

  const applyLink = () => {
    const href = normalizeUrl(url);
    const chain = editor.chain().focus().extendMarkRange("link");
    if (!href) chain.unsetLink().run();
    else chain.setLink({ href }).run();
    onClose();
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-white border border-border rounded-lg shadow-lg absolute top-full left-2 mt-1 z-50">
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        className="w-64"
        autoFocus
        onFocus={(e) => e.currentTarget.select()}
        onKeyDown={(e) => {
          if (e.key === "Enter") applyLink();
          if (e.key === "Escape") onClose();
        }}
      />
      <Button
        variant="default"
        size="sm"
        onMouseDown={(e) => e.preventDefault()}
        onClick={applyLink}
      >
        Apply
      </Button>
    </div>
  );
}

export function RichEditorInner({ value, onChange, minHeight = 200 }: RichEditorInnerProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const imageMode = useRef<"insert" | "replace">("insert");
  const replacePosRef = useRef<number | null>(null);
  const initialized = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: false, underline: false }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      UnderlineExtension,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
      ResizableImage.configure({ allowBase64: true, inline: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Typography,
      Subscript,
      Superscript,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value || "",
    onUpdate: ({ editor }) => { onChange(editor.getHTML()); },
  });

  useEffect(() => {
    if (!editor) return;
    if (!initialized.current) { initialized.current = true; return; }
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    replaceImageHandler.current = (pos: number) => {
      replacePosRef.current = pos;
      imageMode.current = "replace";
      setImageDialogOpen(true);
    };
    return () => { replaceImageHandler.current = null; };
  }, [editor]);

  if (!editor) return null;

  const blockType = editor.isActive("heading", { level: 1 })
    ? "heading1" : editor.isActive("heading", { level: 2 })
      ? "heading2" : editor.isActive("heading", { level: 3 })
        ? "heading3" : "paragraph";

  const textAlign = editor.isActive({ textAlign: "center" })
    ? "center" : editor.isActive({ textAlign: "right" })
      ? "right" : editor.isActive({ textAlign: "justify" })
        ? "justify" : "left";

  const handleImageSelect = (item: PickerMediaItem) => {
    if (imageMode.current === "replace" && replacePosRef.current !== null) {
      editor.chain().focus().setNodeSelection(replacePosRef.current).updateAttributes("image", { src: item.url }).run();
      replacePosRef.current = null;
    } else {
      editor.chain().focus().setImage({ src: item.url }).run();
    }
    setImageDialogOpen(false);
    imageMode.current = "insert";
  };

  return (
    <div className="relative">
      <div className="border border-border rounded-lg overflow-hidden bg-white" style={{ minHeight }}>
        <div className="relative flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/10 overflow-x-auto">
          {/* Block type */}
          <Select value={blockType} onValueChange={(value) => {
            const chain = editor.chain().focus();
            if (value === "paragraph") chain.setParagraph().run();
            else {
              const level = parseInt(value.replace("heading", "")) as 1 | 2 | 3;
              chain.toggleHeading({ level }).run();
            }
          }}>
            <SelectTrigger className="h-7 w-36 border-0 bg-transparent hover:bg-muted/20 gap-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BLOCK_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-2">
                    <opt.icon className="size-4" />
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Separator orientation="vertical" className="mx-0.5" />

          {/* Formatting */}
          {FORMAT_TOOLS.map((t) => <ToolBtn key={t.label} editor={editor} config={t} />)}
          <Separator orientation="vertical" className="mx-0.5" />

          {/* Highlight + Clear */}
          <select
            title="Highlight"
            aria-label="Highlight"
            value={editor.getAttributes("highlight").color || ""}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              const color = e.target.value;
              const chain = editor.chain().focus();
              if (color) chain.toggleHighlight({ color }).run();
              else chain.unsetHighlight().run();
            }}
            className="h-7 rounded-md border border-input bg-input/20 px-2 text-xs text-foreground outline-none hover:border-border"
          >
            <option value="">Highlight</option>
            {HIGHLIGHTS.map((color) => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
          <ToolBtn editor={editor} config={{
            label: "Clear Formatting", icon: Eraser,
            isActive: () => false, action: (e) => e.chain().focus().unsetAllMarks().clearNodes().run(),
          }} />
          <Separator orientation="vertical" className="mx-0.5" />

          {/* Lists */}
          {LIST_TOOLS.map((t) => <ToolBtn key={t.label} editor={editor} config={t} />)}
          <Separator orientation="vertical" className="mx-0.5" />

          {/* Alignment */}
          <Select value={textAlign} onValueChange={(value) => {
            editor.chain().focus().setTextAlign(value).run();
          }}>
            <SelectTrigger className="h-7 w-32 border-0 bg-transparent hover:bg-muted/20 gap-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALIGN_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-2">
                    <opt.icon className="size-4" />
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Separator orientation="vertical" className="mx-0.5" />

          {/* Link / Image / HR */}
          <Button
            variant="ghost"
            size="icon"
            className={editor.isActive("link") ? "bg-brand-secondary/10 text-brand-secondary" : undefined}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setLinkOpen((open) => !open)}
            title="Link"
            aria-label="Link"
          >
            <Link className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!editor.isActive("link")}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
            title="Remove Link"
            aria-label="Remove Link"
          >
            <Link2Off className="size-4" />
          </Button>
          {linkOpen && <LinkDialog editor={editor} onClose={() => setLinkOpen(false)} />}
          <MediaPickerDialog
            open={imageDialogOpen}
            onOpenChange={(open) => {
              if (!open) imageMode.current = "insert";
              setImageDialogOpen(open);
            }}
            mode="image"
            title={imageMode.current === "replace" ? "Replace Image" : "Add Image"}
            onSelect={handleImageSelect}
          />
          <Button
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setImageDialogOpen(true)}
            title="Image"
            aria-label="Image"
          >
            <ImageIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
            aria-label="Horizontal Rule"
          >
            <Minus className="size-4" />
          </Button>
          <Separator orientation="vertical" className="mx-0.5" />

          {/* Table */}
          <Button
            variant="ghost"
            size="icon"
            className={editor.isActive("table") ? "bg-brand-secondary/10 text-brand-secondary" : undefined}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title="Insert Table"
            aria-label="Insert Table"
          >
            <TableIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!editor.isActive("table")}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            title="Add Column"
            aria-label="Add Column"
          >
            <span className="text-xs font-semibold">+C</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!editor.isActive("table")}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().addRowAfter().run()}
            title="Add Row"
            aria-label="Add Row"
          >
            <span className="text-xs font-semibold">+R</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!editor.isActive("table")}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().deleteTable().run()}
            title="Delete Table"
            aria-label="Delete Table"
          >
            <Trash2 className="size-4" />
          </Button>
          <Separator orientation="vertical" className="mx-0.5" />

          {/* History */}
          <Button
            variant="ghost"
            size="icon"
            disabled={!editor.can().undo()}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
            aria-label="Undo"
          >
            <Undo className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!editor.can().redo()}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
            aria-label="Redo"
          >
            <Redo className="size-4" />
          </Button>
        </div>

        <EditorContent editor={editor} style={{ minHeight: minHeight - 46 }} className={PROSE_MIRROR_CLASSES} />
      </div>
    </div>
  );
}


