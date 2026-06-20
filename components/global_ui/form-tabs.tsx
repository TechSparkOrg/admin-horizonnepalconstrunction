import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FormTab {
  value: string;
  label: string;
}

interface FormTabsProps {
  tabs: FormTab[];
}

export function FormTabs({ tabs }: FormTabsProps) {
  return (
    <TabsList className="bg-gray-100 rounded-lg p-0.5 gap-0 w-auto h-auto">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className="rounded-md data-[state=active]:bg-white data-[state=active]:text-sidebar-primary data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium [&_svg]:size-3.5"
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
