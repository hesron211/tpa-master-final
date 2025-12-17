import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Import CSS matematika

interface Props {
  content: string;
  className?: string;
}

export default function MarkdownText({ content, className = "" }: Props) {
  return (
    <div className={`prose prose-slate max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Ubah paragraf biasa jadi div agar tidak error nesting
          p: ({ children }) => <div className="mb-2 inline-block">{children}</div>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}