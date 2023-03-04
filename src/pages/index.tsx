import Head from "next/head";
import { useState } from "react";

// Import the Slate editor factory.
import { createEditor, BaseEditor, Descendant } from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact, ReactEditor } from "slate-react";

type CustomElement = { type: "paragraph"; children: CustomText[] };
type CustomText = { text: string };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
];

export default function Home() {
  const [editor] = useState(() => withReact(createEditor()));

  return (
    <main>
      <div className="container">
        <Slate editor={editor} value={initialValue}>
          <Editable />
        </Slate>
      </div>
    </main>
  );
}
