import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface HeaderColumn {
  label: string;
  className?: string;
}

interface TableHeaderRowProps {
  columns: HeaderColumn[];
}

export function TableHeaderRow({ columns }: TableHeaderRowProps) {
  return (
    <TableHeader>
      <TableRow className="border-gray-200 hover:bg-transparent">
        {columns.map((col) => (
          <TableHead key={col.label} className={`text-gray-900 font-semibold ${col.className ?? ""}`}>
            {col.label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
