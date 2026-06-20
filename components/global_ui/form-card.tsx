import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FormCardProps {
  children: React.ReactNode;
  className?: string;
}

export function FormCard({ children, className }: FormCardProps) {
  return (
    <Card className={cn("bg-white border border-gray-200 rounded-xl", className)}>
      <CardContent className="p-5 space-y-4">{children}</CardContent>
    </Card>
  );
}
