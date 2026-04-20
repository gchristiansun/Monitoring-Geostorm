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
    ReferenceLine
} from "recharts";

type SWData = {
    time: Date;
    speed: number | null;
};

type ChartData = {
    index: number;
    day: number;
    time: Date;
    speed: number;
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
      return useHour ? isNewValue && item.value % 2 === 0 : isNewValue;
    })
    .map((item) => item.index);

const formatTooltipLabel = (data: ChartData[], label: any) => {
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
    data: SWData[];
    period?: string;
};

function SWSChart({ data, period = "7 Days" }: Props) {
  const chartData: ChartData[] = useMemo(() => {
    return data
      .filter((item): item is { time: Date; speed: number } => item.speed !== null)
      .map((item, index) => ({
        index,
        day: getUtcDay(item.time),
        time: item.time,
        speed: item.speed,
      }));
  }, [data]);

  const activeTicks = useMemo(() => buildTicks(chartData, period === "Today"), [chartData, period]);

  return (
    <ResponsiveContainer width="100%" height={400} className='focus:b-0 onClick:b-0'>
      <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />

        <XAxis
          dataKey="index"
          ticks={activeTicks}
          tick={<ChartTick chartData={chartData} isToday={period === "Today"} />}
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
          domain={[300, 1000]}
        >
          <Label value="Km/s" offset={0} position="insideLeft" angle={-90} style={{ fill: 'var(--foreground)' }}></Label>
        </YAxis>

        <Tooltip
          wrapperStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', outline: 'none' }}
          contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', padding: '8px' }}
          labelStyle={{ color: 'var(--muted-foreground)' }}
          formatter={(value) => {
            if (Array.isArray(value)) {
              return [`${value.join(", ")} Km/s`, "Solar Wind Speed"];
            }
            return [`${value ?? "-"} Km/s`, "Solar Wind Speed"];
          }}
          labelFormatter={(label) => formatTooltipLabel(chartData, label)}
        />

        <Line
          type="monotone"
          dataKey="speed"
          stroke="#8a2be2"
          dot={false}
          strokeWidth={2}
        />

        <Brush
          dataKey="day"
          height={15}
          stroke="#8a2be2"
          travellerWidth={8}
        />

        <ReferenceLine y={500} stroke="#ff0000" strokeDasharray="3 3" />
        
      </LineChart>      
    </ResponsiveContainer>
  );
}

export default SWSChart;