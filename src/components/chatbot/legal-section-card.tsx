import { Card } from "@/components/ui/card";

interface LegalSectionCardProps {
  sectionNumber: string;
  title: string;
  description: string;
}

export function LegalSectionCard({
  sectionNumber,
  title,
  description,
}: LegalSectionCardProps) {
  return (
    <Card className="p-3 mb-3 border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-2">
        <span className="bg-indigo-100 text-indigo-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
          Section {sectionNumber}
        </span>
        <h4 className="font-medium text-sm">{title}</h4>
      </div>
      <p className="text-sm text-gray-700">{description}</p>
    </Card>
  );
}
