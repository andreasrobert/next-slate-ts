import { useCallback, useState } from "react";

// Import the Slate editor factory.
import {
  createEditor,
  BaseEditor,
  Descendant,
  Transforms,
  Editor,
  Element as SlateElement,
} from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact, ReactEditor } from "slate-react";

type CustomElement = { type: "paragraph" | "code"; children: CustomText[] };
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

  const renderElement = useCallback((props: any) => {
    console.log(props);
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  return (
    <main>
      <div className="container">
        <Slate editor={editor} value={initialValue}>
          <Editable
            renderElement={renderElement}
            onKeyDown={(event) => {
              if (event.key === "`" && event.ctrlKey) {
                event.preventDefault();
                // Determine whether any of the currently selected blocks are code blocks.
                const [match] = Editor.nodes(editor, {
                  match: (n) => SlateElement.isElement(n) && n.type === "code",
                });
                // Toggle the block type depending on whether there's already a match.
                Transforms.setNodes(
                  editor,
                  { type: match ? "paragraph" : "code" },
                  { match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
                );
              }
            }}
          />
        </Slate>
      </div>
    </main>
  );
}

type CodeElementProps = {
  attributes: React.HTMLAttributes<HTMLPreElement | HTMLParagraphElement>;
  children: React.ReactNode;
};

const CodeElement = (props: CodeElementProps) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

const DefaultElement = (props: CodeElementProps) => {
  return <p {...props.attributes}>{props.children}</p>;
};
