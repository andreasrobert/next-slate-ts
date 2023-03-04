import { useCallback, useState } from "react";

// Import the Slate editor factory.
import {
  createEditor,
  BaseEditor,
  Descendant,
  Transforms,
  Editor,
  Element as SlateElement,
  Text as SlateText,
} from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact, ReactEditor, RenderLeafProps } from "slate-react";

type ElementType = "paragraph" | "code";
type CustomElement = { type: ElementType; children: CustomText[] };
type CustomText = { text: string; bold?: boolean };

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

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  return (
    <main>
      <div className="container">
        <Slate editor={editor} value={initialValue}>
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={(event) => {
              if (!event.ctrlKey) {
                return;
              }
              switch (event.key) {
                case "`":
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
                  break;

                case "b":
                  event.preventDefault();
                  Transforms.setNodes(
                    editor,
                    { bold: true },
                    // Apply it to text nodes, and split the text node up if the
                    // selection is overlapping only part of it.
                    { match: (n) => SlateText.isText(n), split: true }
                  );
                  break;
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

const Leaf = (props: RenderLeafProps) => {
  return (
    <span {...props.attributes} style={{ fontWeight: props.leaf.bold ? "bold" : "normal" }}>
      {props.children}
    </span>
  );
};
