import { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Label,
    Brush,
    ReferenceLine,
} from "recharts";

type DSTData = {
    time: Date;
    dst: number | null;
};

type ChartData = {
    index: number;
    day: number;
    time: Date;
    dst: number;
};

const UTC_TIMEZONE = "UTC";

const utcDayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: UTC_TIMEZONE,
  day: "2-digit",
});

const utcHourFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: UTC_TIMEZONE,
  hour: "2-digit",
  hour12: false,
});

const utcDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: UTC_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const utcTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: UTC_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const getUtcDay = (date: Date) => Number(utcDayFormatter.format(date));
const getUtcHour = (date: Date) => Number(utcHourFormatter.format(date));
const formatUtcDate = (date: Date) => utcDateFormatter.format(date);
const formatUtcTime = (date: Date) => utcTimeFormatter.format(date);

const buildTicks = (data: ChartData[], useHour: boolean) =>
  data
    .map((item) => ({ value: useHour ? getUtcHour(item.time) : item.day, index: item.index }))
    .filter((item, index, arr) => {
      if (index === 0) return true;
      const isNewValue = item.value !== arr[index - 1].value;
      return useHour ? isNewValue && item.value % 1 === 0 : isNewValue;
    })
    .map((item) => item.index);

const formatTooltipLabel = (data: ChartData[], label: string | number) => {
  if (label === undefined || label === null) return "";
  const index = Number(label);
  const datum = data[index];
  return datum ? `${formatUtcDate(datum.time)} ${formatUtcTime(datum.time)}` : "";
};

const ChartTick = ({
  x,
  y,
  payload,
  chartData,
  isToday,
}: {
  x?: number;
  y?: number;
  payload?: { value: number };
  chartData: ChartData[];
  isToday: boolean;
}) => {
  const datum = chartData[payload?.value ?? -1];
  if (!datum) return null;

  return (
    <text x={x} y={y} textAnchor="middle" fontSize={10} fill="var(--foreground)" fontWeight="bold">
      {isToday ? (
        <tspan x={x} dy="1.2em">
          {formatUtcTime(datum.time)}
        </tspan>
      ) : (
        <>
          <tspan x={x} dy="1.2em">
            {formatUtcDate(datum.time)}
          </tspan>
          <tspan x={x} dy="1.2em">
            {formatUtcTime(datum.time)}
          </tspan>
        </>
      )}
    </text>
  );
};

type Props = {
    data: DSTData[];
    period?: string;
};

function DSTChart({ data, period = "7 Days" }: Props) {
  const isToday = period === "Today";

  const chartData: ChartData[] = useMemo(() => {
    return data
      .filter((item): item is { time: Date; dst: number } => item.dst !== null)
      .map((item, index) => ({
        index,
        day: getUtcDay(item.time),
        time: item.time,
        dst: item.dst,
      }));
  }, [data]);

  const activeTicks = useMemo(() => buildTicks(chartData, isToday), [chartData, isToday]);

  return (
    <ResponsiveContainer width="100%" height={400} className='focus:b-0 onClick:b-0'>
      <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />

        <XAxis
          dataKey="index"
          ticks={activeTicks}
          tick={<ChartTick chartData={chartData} isToday={isToday} />}
          textAnchor="middle"
          height={90}
          padding={{ left: 30, right: 30 }}
        >
          <Label
            value="Time (UTC)"
            offset={30}
            position="insideBottom"
            style={{ fill: 'var(--foreground)' }}
          />
        </XAxis>

        <YAxis
          tick={{ fontSize: 12, fill: 'var(--foreground)', fontWeight: 'bold' }}
          domain={[-130, 130]}
        >
          <Label value="nT" offset={0} position="insideLeft" style={{ fill: 'var(--foreground)' }}></Label>
        </YAxis>

        <Tooltip
          wrapperStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', outline: 'none' }}
          contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', padding: '8px' }}
          labelStyle={{ color: 'var(--muted-foreground)' }}
          formatter={(value) => {
            if (Array.isArray(value)) {
              return [`${value.join(", ")} nT`, "Dst"];
            }
            return [`${value ?? "-"} nT`, "Dst"];
          }}
          labelFormatter={(label) => formatTooltipLabel(chartData, label)}
        />

        <Line
          type="monotone"
          dataKey="dst"
          stroke="#ff0000"
          dot={false}
          strokeWidth={2}
        />

        <Brush
          dataKey="day"
          height={15}
          stroke="#ff0000"
          travellerWidth={8}
          fill="var(--background)"
        />

        <ReferenceLine y={-100} stroke="#ff0000" strokeDasharray="3 3" />
        {chartData.length > 0 && (
          <ReferenceLine x={chartData[chartData.length - 1].index} stroke="#ff0000" strokeDasharray="3 3" />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

export default DSTChart;