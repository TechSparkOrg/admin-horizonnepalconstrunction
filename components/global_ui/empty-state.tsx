import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <Card className="bg-white border border-gray-200 rounded-xl">
      <CardContent className="p-16 text-center">
        <div className="w-12 h-12 rounded-lg bg-gray-100 mx-auto flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
}
