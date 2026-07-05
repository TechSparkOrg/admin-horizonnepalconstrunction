"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  FolderKanban, MessageSquare, Users,
  ImageIcon, Film, Box, Star, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/app/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { ProjectAdmin } from "@/api/services/project.service";
import { StaffAdmin } from "@/api/services/staff.service";
import { ConsultationAdmin } from "@/api/services/consultation.service";
import { MediaService } from "@/api/services/media.service";
import { ReviewAdmin } from "@/api/services/review.service";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer, ChartLegend, ChartLegendContent,
  ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const REFERENCE_DATE = new Date();

function buildDateRange(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(REFERENCE_DATE);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function fillSeries<T extends Record<string, number>>(
  days: number,
  data: { date: string; values: Partial<T> }[],
  fields: (keyof T)[],
): (T & { date: string })[] {
  const map = new Map(data.map((d) => [d.date, d.values]));
  return buildDateRange(days).map((date) => {
    const row: Record<string, unknown> = { date: date.slice(5) };
    const existing = map.get(date);
    for (const f of fields) row[f as string] = existing?.[f] ?? 0;
    return row as T & { date: string };
  });
}

const chartConfig = {
  reviews:   { label: "Reviews",   color: "var(--chart-1)" },
  inquiries: { label: "Inquiries", color: "var(--chart-2)" },
} satisfies ChartConfig;

const STAT_CARDS = [
  { key: "projects",  label: "Projects",  icon: FolderKanban,  iconCls: "text-blue-500" },
  { key: "team",      label: "Team",      icon: Users,         iconCls: "text-violet-500" },
  { key: "inquiries", label: "Inquiries", icon: MessageSquare, iconCls: "text-emerald-500" },
  { key: "media",     label: "Media",     icon: ImageIcon,     iconCls: "text-amber-500" },
] as const;

export function _Client() {
  const user = useAuthStore((s) => s.user);
  const [timeRange, setTimeRange] = React.useState("30d");

  const { data: projects }     = useQuery({ queryKey: queryKeys.projects.list({ page_size: 1 }),  queryFn: () => ProjectAdmin.list({ page_size: 1 }) });
  const { data: team }         = useQuery({ queryKey: queryKeys.staff.list({ page_size: 1 }),     queryFn: () => StaffAdmin.search({ page_size: 1 }) });
  const { data: consultations }= useQuery({ queryKey: ["dash","consult","count"],                  queryFn: () => ConsultationAdmin.list({ page_size: 1 }) });
  const { data: mediaTotal }   = useQuery({ queryKey: queryKeys.media.list({ page_size: 1 }),     queryFn: () => MediaService.list({ page_size: 1 }) });
  const { data: mediaImgs }    = useQuery({ queryKey: ["dash","media","imgs"],                     queryFn: () => MediaService.list({ page_size: 1, group_title: "Images" }) });
  const { data: mediaVids }    = useQuery({ queryKey: ["dash","media","vids"],                     queryFn: () => MediaService.list({ page_size: 1, group_title: "Videos" }) });
  const { data: mediaModels }  = useQuery({ queryKey: ["dash","media","models"],                   queryFn: () => MediaService.list({ page_size: 1, group_title: "3D Models" }) });
  const { data: reviewsData }  = useQuery({ queryKey: ["dash","reviews","all"],                    queryFn: () => ReviewAdmin.list({ page_size: 100 }) });
  const { data: allInquiries } = useQuery({ queryKey: ["dash","consult","all"],                    queryFn: () => ConsultationAdmin.list({ page_size: 100 }) });
  const { data: recentInq }    = useQuery({ queryKey: ["dash","inq","recent"],                     queryFn: () => ConsultationAdmin.list({ page_size: 5 }) });
  const { data: recentProj }   = useQuery({ queryKey: ["dash","proj","recent"],                    queryFn: () => ProjectAdmin.list({ page_size: 5 }) });
  const { data: recentRev }    = useQuery({ queryKey: ["dash","rev","recent"],                     queryFn: () => ReviewAdmin.list({ page_size: 5 }) });

  const loading = !projects || !team || !consultations || !mediaTotal;
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;

  const statValues: Record<string, number | undefined> = {
    projects:  projects?.count,
    team:      team?.count,
    inquiries: consultations?.count,
    media:     mediaTotal?.count,
  };

  const chartData = React.useMemo(() => {
    const reviewCounts: Record<string, number> = {};
    for (const r of reviewsData?.results ?? []) {
      const d = r.created_at?.slice(0, 10);
      if (d) reviewCounts[d] = (reviewCounts[d] || 0) + 1;
    }
    const inqCounts: Record<string, number> = {};
    for (const c of allInquiries?.results ?? []) {
      const d = c.created_at?.slice(0, 10);
      if (d) inqCounts[d] = (inqCounts[d] || 0) + 1;
    }
    return fillSeries<{ reviews: number; inquiries: number }>(days, [
      ...Object.entries(reviewCounts).map(([date, count]) => ({ date, values: { reviews: count, inquiries: 0 } })),
      ...Object.entries(inqCounts).map(([date, count]) => ({ date, values: { reviews: 0, inquiries: count } })),
    ], ["reviews", "inquiries"]);
  }, [reviewsData, allInquiries, days]);

  const activities = React.useMemo(() => {
    const items: { id: string; type: "project" | "review" | "inquiry"; title: string; desc: string; time: string }[] = [];
    for (const p of recentProj?.results ?? []) items.push({ id: p.id, type: "project", title: p.title, desc: `Status: ${p.status}`, time: p.created_at });
    for (const r of recentRev?.results ?? []) items.push({ id: r.id, type: "review", title: `${r.name}`, desc: `${r.rating} star review`, time: r.created_at });
    for (const c of recentInq?.results ?? []) items.push({ id: c.id, type: "inquiry", title: c.name, desc: c.service || "General inquiry", time: c.created_at });
    items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    return items.slice(0, 10);
  }, [recentProj, recentRev, recentInq]);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-6 px-4 pb-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {greeting()}{user?.first_name ? `, ${user.first_name}` : ""}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{today}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {STAT_CARDS.map(({ key, label, icon: Icon, iconCls }) => (
          <Card key={key} className="px-3.5 py-3 gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground tracking-wide uppercase">{label}</span>
              <Icon className={`size-3.5 ${iconCls}`} />
            </div>
            {loading
              ? <Skeleton className="h-7 w-12 mt-1" />
              : <p className="text-2xl font-semibold tabular-nums text-foreground leading-none">{statValues[key]?.toLocaleString() ?? "—"}</p>
            }
            {key === "media" && !loading && (
              <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1"><ImageIcon className="size-3" />{mediaImgs?.count ?? 0}</span>
                <span className="flex items-center gap-1"><Film className="size-3" />{mediaVids?.count ?? 0}</span>
                <span className="flex items-center gap-1"><Box className="size-3" />{mediaModels?.count ?? 0}</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
        <div className="space-y-5">

          {/* Chart */}
          <Card className="pt-0">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4 sm:flex-row">
              <div className="flex-1">
                <CardTitle className="text-sm font-semibold">Reviews & Inquiries</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {timeRange === "7d" ? "Last 7 days" : timeRange === "30d" ? "Last 30 days" : "Last 3 months"}
                </CardDescription>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="h-8 w-[130px] text-xs rounded-lg" aria-label="Select time range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="7d" className="text-xs rounded-lg">Last 7 days</SelectItem>
                  <SelectItem value="30d" className="text-xs rounded-lg">Last 30 days</SelectItem>
                  <SelectItem value="90d" className="text-xs rounded-lg">Last 3 months</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              {!reviewsData || !allInquiries ? (
                <Skeleton className="h-[220px] w-full" />
              ) : (
                <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="fillReviews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="var(--color-reviews)"   stopOpacity={0.7} />
                        <stop offset="95%" stopColor="var(--color-reviews)"   stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="fillInquiries" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="var(--color-inquiries)" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="var(--color-inquiries)" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32}
                      tickFormatter={(v: string) => { const [m, d] = v.split("-"); return `${parseInt(m)}/${parseInt(d)}`; }}
                      className="text-[11px]"
                    />
                    <ChartTooltip cursor={false} content={
                      <ChartTooltipContent indicator="dot"
                        labelFormatter={(_l: any, p: any) => {
                          const v = p?.[0]?.payload?.date;
                          if (!v) return "";
                          const [m, d] = v.split("-");
                          return `${parseInt(m)}/${parseInt(d)}`;
                        }}
                      />
                    } />
                    <Area dataKey="inquiries" type="natural" fill="url(#fillInquiries)" stroke="var(--color-inquiries)" strokeWidth={1.5} stackId="a" />
                    <Area dataKey="reviews"   type="natural" fill="url(#fillReviews)"   stroke="var(--color-reviews)"   strokeWidth={1.5} stackId="a" />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Recent inquiries */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold">Recent Inquiries</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {!recentInq ? (
                <div className="space-y-2 pt-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)}</div>
              ) : !recentInq.results?.length ? (
                <p className="text-xs text-muted-foreground py-8 text-center">No inquiries yet</p>
              ) : (
                <div className="divide-y">
                  {recentInq.results.map((inq) => (
                    <div key={inq.id} className="flex items-center gap-3 py-2.5">
                      <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold
                        ${inq.is_read ? "bg-muted text-muted-foreground" : "bg-emerald-100 text-emerald-700"}`}>
                        {initials(inq.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-foreground truncate leading-tight">{inq.name}</p>
                          {!inq.is_read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{inq.service || "General"}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground tabular-nums">{timeAgo(inq.created_at)}</span>
                        <Link href={`/customer-enquires/${inq.id}`}
                          className="flex items-center gap-0.5 text-[11px] text-sidebar-primary font-medium hover:underline">
                          View <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity sidebar */}
        <Card className="lg:sticky lg:top-24">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {activities.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">No recent activity</p>
            ) : (
              <div className="space-y-0">
                {activities.map((a) => {
                  const dot = a.type === "project" ? "bg-blue-400" : a.type === "review" ? "bg-amber-400" : "bg-emerald-400";
                  const badge = a.type === "project" ? "Project" : a.type === "review" ? "Review" : "Inquiry";
                  return (
                    <div key={`${a.type}-${a.id}`} className="flex items-start gap-2.5 py-2 border-b last:border-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${dot}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-foreground truncate leading-snug">{a.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{badge} · {a.desc}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums mt-0.5">{timeAgo(a.time)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
