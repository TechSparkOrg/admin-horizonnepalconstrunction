import dynamic from "next/dynamic";

const Inner = dynamic(
  () => import("@/components/page_ui/rich-editor-inner").then((m) => m.RichEditorInner),
  { ssr: false }
);

interface Props {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}

export function RichEditor(props: Props) {
  return <Inner {...props} />;
}
