"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";
import DOMPurify from "dompurify";
import { useImageUpload } from "@/hooks/use-image-upload";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  height?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  disabled = false,
  height = 400,
}: RichTextEditorProps) {
  const editorRef = useRef<unknown>(null);
  const { uploadImage } = useImageUpload();

  const handleEditorChange = (content: string) => {
    // Sanitize HTML content before passing to parent for security
    const cleanContent = DOMPurify.sanitize(content);
    onChange(cleanContent);
  };

  return (
    <div className="w-full">
      <Editor
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}
        onInit={(evt: unknown, editor: unknown) => (editorRef.current = editor)}
        value={value}
        onEditorChange={handleEditorChange}
        disabled={disabled}
        init={{
          height,
          menubar: false,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
            "codesample",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic underline strikethrough | forecolor backcolor | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | " +
            "link image codesample | " +
            "removeformat code fullscreen preview help",
          content_style: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: #374151;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #1f2937;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            p { margin-bottom: 1em; }
            ul, ol { margin-bottom: 1em; padding-left: 2em; }
            blockquote {
              border-left: 4px solid #e5e7eb;
              padding-left: 1em;
              margin: 1em 0;
              color: #6b7280;
              font-style: italic;
            }
            code {
              background-color: #f3f4f6;
              padding: 0.125em 0.25em;
              border-radius: 0.25em;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              font-size: 0.875em;
            }
            pre {
              background-color: #1a1a1a;
              padding: 1em;
              border-radius: 0.5em;
              overflow-x: auto;
              margin: 1em 0;
            }
            pre code {
              background-color: transparent;
              padding: 0;
              border-radius: 0;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              font-size: 0.875em;
            }
          `,
          images_upload_handler: uploadImage,
          automatic_uploads: true,
          file_picker_types: "image",
          paste_data_images: true,
          image_advtab: true,
          image_title: true,
          image_caption: true,
          image_class_list: [
            { title: "None", value: "" },
            { title: "Responsive", value: "img-responsive" },
            { title: "Float Left", value: "float-left" },
            { title: "Float Right", value: "float-right" },
          ],
          link_default_target: "_blank",
          link_assume_external_targets: true,
          codesample_languages: [
            { text: "HTML/XML", value: "markup" },
            { text: "JavaScript", value: "javascript" },
            { text: "CSS", value: "css" },
            { text: "PHP", value: "php" },
            { text: "Ruby", value: "ruby" },
            { text: "Python", value: "python" },
            { text: "Java", value: "java" },
            { text: "C", value: "c" },
            { text: "C#", value: "csharp" },
            { text: "C++", value: "cpp" },
            { text: "Terraform", value: "hcl" },
          ],
          contextmenu: "link image table configurepermanentpen",
          skin: "oxide",
          content_css: false,
          setup: (editor: unknown) => {
            const tinyEditor = editor as {
              on: (event: string, callback: () => void) => void;
              getContent: () => string;
            };
            tinyEditor.on("change", () => {
              const content = tinyEditor.getContent();
              handleEditorChange(content);
            });
          },
        }}
      />
    </div>
  );
}
