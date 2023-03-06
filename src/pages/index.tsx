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
type FormatType = {
  bold?: boolean;
  code?: boolean;
  italic?: boolean;
  underline?: boolean;
};
type CustomText = {
  text: string;
} & FormatType;

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const CustomEditor = {
  isMarkActive(editor: Editor, format: keyof FormatType) {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  },

  toggleMark(editor: Editor, format: keyof FormatType) {
    const isActive = CustomEditor.isMarkActive(editor, format);

    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  },

  isCodeBlockActive(editor: Editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => SlateElement.isElement(n) && n.type === "code",
    });

    return !!match;
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
    children: [
      { text: "To use this editor you can highlight a text and...  \n\n" },
      { text: "Click ctrl + b to toggle"},
      { text: " BOLD ", bold: true },
      { text: "formating \n" },

      { text: "Click ctrl + i to toggle"},
      { text: " ITALIC ", italic: true },
      { text: "formating \n" },

      { text: "Click ctrl + u to toggle"},
      { text: " UNDERLINE ", underline: true },
      { text: "formating \n" },
      
      { text: "Click ctrl + t to toggle "},
      { text: "CODE", code: true },
      { text: " formating \n" },

      { text: "Click ctrl + ` to toggle "},
      { text: "CODE BLOCK", code: true },
      { text: " formating" },
    ],
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
                  CustomEditor.toggleMark(editor, "bold");
                  break;
                }

                case "i": {
                  event.preventDefault();
                  CustomEditor.toggleMark(editor, "italic");
                  break;
                }

                case "u": {
                  event.preventDefault();
                  CustomEditor.toggleMark(editor, "underline");
                  break;
                }

                case "t": {
                  event.preventDefault();
                  CustomEditor.toggleMark(editor, "code");
                  break;
                }
              }
            }}
          />
        </Slate>
      </div>
      <h2>Things you can do</h2>
      <p>Highlight a text and...</p>
      <ul>
        <li>Click <code>ctrl + b</code> to toggle bold.</li>
        <li>Click <code>ctrl + i</code> to toggle italic.</li>
        <li>Click <code>ctrl + u</code> to toggle underline.</li>
        <li>Click <code>ctrl + t</code> to toggle code.</li>
        <li>Click <code>ctrl + `</code> to toggle code block.</li>
      </ul>
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

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};
