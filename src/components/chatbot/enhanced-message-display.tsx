import { LegalSectionCard } from "./legal-section-card";

interface EnhancedMessageDisplayProps {
  content: string;
}

export function EnhancedMessageDisplay({
  content,
}: EnhancedMessageDisplayProps) {
  // Check if this is a legal response with IPC sections
  if (content.includes("Section") && content.includes("IPC")) {
    try {
      // Extract introduction
      let introduction = "";
      let disclaimer = "";

      // Extract the introduction (text before the first bullet point)
      if (content.includes("* **")) {
        introduction = content.split("* **")[0].trim();
      }

      // Extract disclaimer (usually at the end)
      if (content.includes("This information is")) {
        disclaimer =
          "This information is" +
          content.split("This information is")[1].trim();
      }

      // Extract sections
      const sectionRegex =
        /\*\s*\*\*Section\s+(\d+)\s*\$\$(.*?)\$\$:\*\*\s*([\s\S]*?)(?=\*\s*\*\*Section|\*\s*This information|$)/g;

      const sections: { number: string; title: string; description: string }[] =
        [];

      let match;
      while ((match = sectionRegex.exec(content + "* ")) !== null) {
        sections.push({
          number: match[1],
          title: match[2],
          description: match[3].trim(),
        });
      }

      return (
        <div className="legal-response">
          {introduction && <p className="mb-3">{introduction}</p>}

          <div className="my-3">
            {sections.map((section, index) => (
              <LegalSectionCard
                key={index}
                sectionNumber={section.number}
                title={section.title}
                description={section.description}
              />
            ))}
          </div>

          {disclaimer && (
            <div className="mt-3 text-xs text-gray-500 border-t pt-2">
              <em>{disclaimer}</em>
            </div>
          )}
        </div>
      );
    } catch (error) {
      // If parsing fails, fall back to original content
      return <div>{content}</div>;
    }
  }

  // For regular messages
  return <div>{content}</div>;
}
