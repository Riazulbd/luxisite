import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Youtube from "@tiptap/extension-youtube";
import { common, createLowlight } from "lowlight";
import { useTheme } from "../../../hooks/useTheme";
import { buttonStyle, panelStyle } from "../ui";

const lowlight = createLowlight(common);

function ToolbarButton({ active, label, onClick, theme }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={buttonStyle(theme, active ? "primary" : "default", { padding: "10px 12px", minWidth: 44 })}
    >
      {label}
    </button>
  );
}

export default function TipTapEditor({ value, onChange, onStatsChange, onReady, onRequestMedia }) {
  const theme = useTheme();
  const editor = useEditor({
    content: value,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: "Start writing your article..." }),
      Image,
      Link.configure({ openOnClick: false, autolink: true }),
      Youtube.configure({ controls: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount,
      CodeBlockLowlight.configure({ lowlight })
    ],
    onUpdate({ editor: currentEditor }) {
      const html = currentEditor.getHTML();
      onChange(html);
      const text = currentEditor.getText();
      const words = text.split(/\s+/).filter(Boolean).length;
      onStatsChange({
        words,
        characters: currentEditor.storage.characterCount.characters(),
        readingTime: words ? Math.ceil(words / 200) : 0
      });
    }
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [editor, value]);

  useEffect(() => {
    if (editor) {
      onReady?.(editor);
    }
  }, [editor, onReady]);

  if (!editor) {
    return <div style={{ minHeight: 320 }}>Loading editor...</div>;
  }

  return (
    <div style={{ ...panelStyle(theme, { padding: 18, display: "grid", gap: 16, width: "100%", minWidth: 0, overflow: "hidden" }) }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", width: "100%", minWidth: 0 }}>
        <ToolbarButton active={editor.isActive("bold")} label="B" onClick={() => editor.chain().focus().toggleBold().run()} theme={theme} />
        <ToolbarButton active={editor.isActive("italic")} label="I" onClick={() => editor.chain().focus().toggleItalic().run()} theme={theme} />
        <ToolbarButton active={editor.isActive("strike")} label="S" onClick={() => editor.chain().focus().toggleStrike().run()} theme={theme} />
        <ToolbarButton active={editor.isActive("heading", { level: 2 })} label="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} theme={theme} />
        <ToolbarButton active={editor.isActive("heading", { level: 3 })} label="H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} theme={theme} />
        <ToolbarButton active={editor.isActive("heading", { level: 4 })} label="H4" onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} theme={theme} />
        <ToolbarButton active={editor.isActive("bulletList")} label="• List" onClick={() => editor.chain().focus().toggleBulletList().run()} theme={theme} />
        <ToolbarButton active={editor.isActive("orderedList")} label="1. List" onClick={() => editor.chain().focus().toggleOrderedList().run()} theme={theme} />
        <ToolbarButton active={editor.isActive("blockquote")} label="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} theme={theme} />
        <ToolbarButton active={editor.isActive("code")} label="Code" onClick={() => editor.chain().focus().toggleCode().run()} theme={theme} />
        <ToolbarButton active={editor.isActive("codeBlock")} label="Code Block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} theme={theme} />
        <ToolbarButton
          active={editor.isActive("link")}
          label="Link"
          onClick={() => {
            const href = window.prompt("Enter a URL");
            if (href) {
              editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
            }
          }}
          theme={theme}
        />
        <ToolbarButton label="Image" onClick={() => onRequestMedia?.()} theme={theme} />
        <ToolbarButton
          label="YouTube"
          onClick={() => {
            const src = window.prompt("Paste a YouTube URL");
            if (src) {
              editor.chain().focus().setYoutubeVideo({ src }).run();
            }
          }}
          theme={theme}
        />
        <ToolbarButton label="Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} theme={theme} />
        <ToolbarButton label="Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()} theme={theme} />
        <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()} theme={theme} />
        <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()} theme={theme} />
      </div>
      <div style={{ minHeight: 500, color: theme.text, fontFamily: "Manrope, sans-serif", width: "100%", minWidth: 0, maxWidth: "100%", overflowX: "auto" }}>
        <EditorContent editor={editor} className="tiptap-editor" />
      </div>
    </div>
  );
}
