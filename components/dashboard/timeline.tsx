"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import { TIMELINE_MILESTONES } from "@/lib/constants";
import type { PathMetrics } from "@/lib/types";

const TWIN_COLOR = "#00E8FF";
const CURRENT_COLOR = "#8A8AA0";

function average(metrics: PathMetrics): number {
  const values = Object.values(metrics);
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

type TimelinePoint = {
  month: number;
  current: number;
  twin: number;
};

function buildProjection(
  currentPath: PathMetrics,
  futurePath: PathMetrics
): TimelinePoint[] {
  const start = average(currentPath);
  const twinEnd = average(futurePath);
  const currentEnd = start + 6;

  return Array.from({ length: 13 }, (_, month) => {
    const t = month / 12;
    return {
      month,
      current: Math.round(start + (currentEnd - start) * t),
      // Ease-out: early quests move the needle fastest.
      twin: Math.round(start + (twinEnd - start) * (1 - Math.pow(1 - t, 1.8))),
    };
  });
}

const MILESTONE_LABELS = new Map<number, string>(
  TIMELINE_MILESTONES.map((m) => [m.month, m.label])
);

function TimelineTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number }[];
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  const twin = payload.find((p) => p.dataKey === "twin");
  const current = payload.find((p) => p.dataKey === "current");
  return (
    <div className="glass-strong rounded-2xl px-4 py-3 text-sm shadow-card">
      <p className="mb-2 font-medium text-ink">
        {label === 0 ? "Today" : `Month ${label}`}
      </p>
      {twin && (
        <p className="flex items-center gap-2 text-ink-secondary">
          <span
            className="size-2 rounded-full"
            style={{ background: TWIN_COLOR }}
          />
          LifeTwin Path
          <span className="ml-auto font-mono font-semibold text-ink">
            {twin.value}
          </span>
        </p>
      )}
      {current && (
        <p className="mt-1 flex items-center gap-2 text-ink-secondary">
          <span
            className="size-2 rounded-full"
            style={{ background: CURRENT_COLOR }}
          />
          Current Path
          <span className="ml-auto font-mono font-semibold text-ink">
            {current.value}
          </span>
        </p>
      )}
    </div>
  );
}

type TimelineProps = {
  currentPath: PathMetrics;
  futurePath: PathMetrics;
  /** Bump to replay the chart animation (e.g. after completing a quest). */
  animationKey: number;
};

export function Timeline({
  currentPath,
  futurePath,
  animationKey,
}: TimelineProps) {
  const data = useMemo(
    () => buildProjection(currentPath, futurePath),
    [currentPath, futurePath]
  );
  const last = data[data.length - 1];

  return (
    <Card>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <CardTitle>Timeline</CardTitle>
        {/* Legend — identity is never color-alone */}
        <div className="flex items-center gap-5 text-xs text-ink-secondary">
          <span className="flex items-center gap-2">
            <span
              className="h-0.5 w-4 rounded-full"
              style={{ background: TWIN_COLOR }}
            />
            LifeTwin Path
          </span>
          <span className="flex items-center gap-2">
            <span
              className="h-0.5 w-4 rounded-full border-b border-dashed"
              style={{ borderColor: CURRENT_COLOR }}
            />
            Current Path
          </span>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer key={animationKey} width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 92, bottom: 4, left: 28 }}
          >
            <defs>
              <linearGradient id="twin-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={TWIN_COLOR} stopOpacity={0.22} />
                <stop offset="100%" stopColor={TWIN_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              ticks={[0, 3, 6, 12]}
              tickFormatter={(m: number) => MILESTONE_LABELS.get(m) ?? ""}
              tick={{ fill: "#6E6E80", fontSize: 12 }}
              axisLine={{ stroke: "#1F1F29" }}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              content={<TimelineTooltip />}
              cursor={{ stroke: "#2C2C3A", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="current"
              stroke={CURRENT_COLOR}
              strokeWidth={2}
              strokeDasharray="6 6"
              fill="none"
              dot={false}
              activeDot={{ r: 4, fill: CURRENT_COLOR, strokeWidth: 0 }}
              animationDuration={1400}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="twin"
              stroke={TWIN_COLOR}
              strokeWidth={2}
              fill="url(#twin-fill)"
              dot={false}
              activeDot={{
                r: 5,
                fill: TWIN_COLOR,
                stroke: "#050508",
                strokeWidth: 2,
              }}
              animationDuration={1600}
              animationEasing="ease-out"
            />
            {/* Milestone markers on the LifeTwin path */}
            {TIMELINE_MILESTONES.map((m) => (
              <ReferenceDot
                key={m.month}
                x={m.month}
                y={data[m.month].twin}
                r={4}
                fill={TWIN_COLOR}
                stroke="#050508"
                strokeWidth={2}
              />
            ))}
            {/* Direct end-of-line labels */}
            <ReferenceDot
              x={12}
              y={last.twin}
              r={0}
              label={{
                value: `LifeTwin ${last.twin}`,
                position: "right",
                fill: TWIN_COLOR,
                fontSize: 12,
                fontWeight: 600,
              }}
            />
            <ReferenceDot
              x={12}
              y={last.current}
              r={0}
              label={{
                value: `Current ${last.current}`,
                position: "right",
                fill: CURRENT_COLOR,
                fontSize: 12,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
