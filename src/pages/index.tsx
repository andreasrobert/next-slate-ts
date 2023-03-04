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

type ElementType = "paragraph" | "code" | null;
type CustomElement = { type: ElementType; children: CustomText[] };
type CustomText = { text: string; bold?: boolean };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const CustomEditor = {
  isBoldMarkActive(editor: Editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => SlateText.isText(n) && n.bold === true,
      universal: true,
    });

    return !!match;
  },

  isCodeBlockActive(editor: Editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => SlateElement.isElement(n) && n.type === "code",
    });

    return !!match;
  },

  toggleBoldMark(editor: Editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    Transforms.setNodes(
      editor,
      { bold: isActive ? false : true },
      { match: (n) => SlateText.isText(n), split: true }
    );
  },

  toggleCodeBlock(editor: Editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : "code" },
      { match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
    );
  },
};

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
];

export default function Home() {
  const [editor] = useState(() => withReact(createEditor()));

  const renderElement = useCallback((props: any) => {
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
                case "`": {
                  event.preventDefault();
                  CustomEditor.toggleCodeBlock(editor);
                  break;
                }

                case "b": {
                  event.preventDefault();
                  CustomEditor.toggleBoldMark(editor);
                  break;
                }
              }
            }}
          />
        </Slate>
      </div>
    </main>
  );
}

const CodeElement = (props: RenderLeafProps) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

const DefaultElement = (props: RenderLeafProps) => {
  return <p {...props.attributes}>{props.children}</p>;
};

const Leaf = (props: RenderLeafProps) => {
  return (
    <span {...props.attributes} style={{ fontWeight: props.leaf.bold ? "bold" : "normal" }}>
      {props.children}
    </span>
  );
};
