"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Table as TableIcon,
  Undo,
  Redo,
  Minus,
  AlignLeft,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface RichEditorInnerProps {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={label}
      className={`size-8 grid place-items-center rounded-md text-sm transition shrink-0 ${
        active
          ? "bg-fs-secondary/10 text-fs-secondary"
          : "text-fs-text3 hover:bg-fs-bg4 hover:text-fs-text1"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-400/20 shrink-0 mx-0.5" />;
}

function LinkDialog({
  editor,
  onClose,
}: {
  editor: any;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const existing = editor.getAttributes("link").href || "";

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const setLink = () => {
    const url = inputRef.current?.value;
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    onClose();
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-white border border-gray-400/30 rounded-lg shadow-lg absolute top-full left-0 mt-1 z-50">
      <input
        ref={inputRef}
        defaultValue={existing}
        placeholder="https://..."
        className="w-56 h-8 px-2 rounded border border-gray-400/30 text-xs text-fs-text1 outline-none focus:border-fs-secondary"
        onKeyDown={(e) => {
          if (e.key === "Enter") setLink();
          if (e.key === "Escape") onClose();
        }}
      />
      <button
        type="button"
        onClick={setLink}
        className="h-8 px-3 rounded bg-fs-secondary text-white text-xs font-medium hover:bg-fs-btn1 transition"
      >
        Apply
      </button>
    </div>
  );
}

export function RichEditorInner({
  value,
  onChange,
  minHeight = 200,
}: RichEditorInnerProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const initialized = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && !initialized.current) {
      initialized.current = true;
      if (value) {
        editor.commands.setContent(value);
      }
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="relative">
      <div
        className="border border-gray-400/30 rounded-lg overflow-hidden bg-white"
        style={{ minHeight }}
      >
        <div className="relative flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-400/30 bg-fs-bg4/10 overflow-x-auto">
          {/* Headings */}
          <ToolbarButton
            label="Heading 1"
            active={editor.isActive("heading", { level: 1 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 3"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 className="size-4" />
          </ToolbarButton>

          <Divider />

          {/* Text formatting */}
          <ToolbarButton
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Bullet List"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered List"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="size-4" />
          </ToolbarButton>

          <Divider />

          {/* Blockquote */}
          <ToolbarButton
            label="Blockquote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="size-4" />
          </ToolbarButton>

          <Divider />

          {/* Link */}
          <ToolbarButton
            label="Link"
            active={editor.isActive("link")}
            onClick={() => setLinkOpen((o) => !o)}
          >
            <Link className="size-4" />
          </ToolbarButton>
          {linkOpen && (
            <LinkDialog editor={editor} onClose={() => setLinkOpen(false)} />
          )}

          {/* Horizontal rule */}
          <ToolbarButton
            label="Horizontal Rule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus className="size-4" />
          </ToolbarButton>

          <Divider />

          {/* Table */}
          <ToolbarButton
            label="Insert Table"
            active={editor.isActive("table")}
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            <TableIcon className="size-4" />
          </ToolbarButton>

          <Divider />

          {/* Undo / Redo */}
          <ToolbarButton
            label="Undo"
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Redo"
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo className="size-4" />
          </ToolbarButton>
        </div>

        <EditorContent
          editor={editor}
          style={{ minHeight: minHeight - 46 }}
          className="
            prose prose-sm max-w-none p-4
            [&_.ProseMirror]:outline-none
            [&_.ProseMirror_p]:text-fs-text1
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-fs-text3/40
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
            [&_.ProseMirror_th]:border
            [&_.ProseMirror_th]:border-gray-400/30
            [&_.ProseMirror_th]:p-2
            [&_.ProseMirror_th]:bg-fs-bg4/20
            [&_.ProseMirror_th]:font-semibold
            [&_.ProseMirror_th]:text-left
            [&_.ProseMirror_td]:border
            [&_.ProseMirror_td]:border-gray-400/30
            [&_.ProseMirror_td]:p-2
            [&_.ProseMirror_td]:align-top
          "
        />
      </div>
    </div>
  );
}