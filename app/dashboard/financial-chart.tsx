"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer, ChartLegend, ChartLegendContent,
  ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";

interface DashboardFinancialPoint {
  date: string;
  income: number;
  expense: number;
}

interface Props {
  data: DashboardFinancialPoint[];
  config: ChartConfig;
}

export function FinancialChart({ data, config }: Props) {
  return (
    <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.7} />
            <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.7} />
            <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(v: string) => {
            const [m, d] = v.split("-");
            return `${parseInt(m)}/${parseInt(d)}`;
          }}
          className="text-[11px]"
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(_l: unknown, p: unknown) => {
                const arr = p as { payload?: { date?: string } }[];
                const v = arr?.[0]?.payload?.date;
                if (!v) return "";
                const [m, d] = v.split("-");
                return `${parseInt(m)}/${parseInt(d)}`;
              }}
            />
          }
        />
        <Area dataKey="income" type="natural" fill="url(#fillIncome)" stroke="var(--color-income)" strokeWidth={1.5} stackId="a" />
        <Area dataKey="expense" type="natural" fill="url(#fillExpense)" stroke="var(--color-expense)" strokeWidth={1.5} stackId="a" />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}
