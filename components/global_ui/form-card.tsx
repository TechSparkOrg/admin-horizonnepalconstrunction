import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FormCardProps {
  children: React.ReactNode;
  className?: string;
}

export function FormCard({ children, className }: FormCardProps) {
  return (
    <Card className={cn("bg-card border border-border rounded-xl", className)}>
      <CardContent className="p-4 space-y-3">{children}</CardContent>
    </Card>
  );
}
