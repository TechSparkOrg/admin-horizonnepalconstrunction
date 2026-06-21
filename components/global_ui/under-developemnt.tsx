import { Construction } from "lucide-react";

interface UnderDevelopmentProps {
  title?: string;
  description?: string;
}

export function UnderDevelopment({
  title = "This page is under development",
  description = "We're working on this section. Check back soon.",
}: UnderDevelopmentProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="size-12 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center mb-4">
        <Construction className="size-5 text-gray-400" />
      </div>
      <h2 className="text-sm font-semibold text-gray-900 mb-1">{title}</h2>
      <p className="text-xs text-gray-400 max-w-xs">{description}</p>
    </div>
  );
}