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

type BzData = {
    time: Date;
    bz: number | null;
};

type ChartData = BzData & {
    index: number;
    day: number; //
    timeString: string;
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

const getUtcDay = (date: Date) => Number(utcDayFormatter.format(date));
const getUtcHour = (date: Date) => Number(utcHourFormatter.format(date));
const formatUtcDate = (date: Date) => date.toLocaleDateString("en-US", { timeZone: UTC_TIMEZONE });
const formatUtcTime = (date: Date) => date.toLocaleTimeString("en-US", { timeZone: UTC_TIMEZONE, hour: "2-digit", minute: "2-digit", hour12: false });

type Props = {
    data: BzData[];
    period?: string;
};

function BzChart({ data, period = "7 Days" }: Props) {
  const chartData: ChartData[] = data
    .filter(d => d.bz !== null)
    .map((d, index) => ({
      index,
      day: getUtcDay(d.time),
      timeString: d.time.toLocaleString("en-US", { timeZone: UTC_TIMEZONE }),
      time: d.time,
      bz: d.bz
    }));

  const dayTicks = chartData
    .map((d, i) => ({ day: getUtcDay(d.time), index: i}))
    .filter((item, i , arr) => {
      return i === 0 || item.day !== arr[i - 1].day;
    })
    .map((item) => item.index)

  const hourTicks = chartData
    .map((d, i) => ({ hour: getUtcHour(d.time), index: i}))
    .filter((item, i, arr) => {
      const isNewhour = i === 0 || item.hour !== arr[i - 1].hour;
      const isInterval = item.hour % 2 === 0;

      return isNewhour && isInterval;
    }) 
    .map((item) => item.index)

  const activeTicks = period === "Today" ? hourTicks : dayTicks

  const CustomTick = ({ x, y, payload }: any) => {
    const d = chartData[payload.value];
    if (!d) return null;

    const date = formatUtcDate(d.time);
    const time = formatUtcTime(d.time);

    if (period === "Today") {
      return (
        <text x={x} y={y} textAnchor="middle" fontSize={10} fill="var(--foreground)" fontWeight={"bold"}>
          <tspan x={x} dy="1.2em">{time}</tspan>
        </text>
      )
    }

    return (
      <text x={x} y={y} textAnchor="middle" fontSize={10} fill="var(--foreground)" fontWeight={"bold"}>
        <tspan x={x} dy="1.2em">{date}</tspan>
        <tspan x={x} dy="1.2em">{time}</tspan>
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400} className='focus:b-0 onClick:b-0'>
      <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
<CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />

        <XAxis
          dataKey="index"
          ticks={activeTicks}
          tick={<CustomTick />}
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
          domain={[-50, 50]}
        >
          <Label value="nT" offset={0} position="insideLeft" style={{ fill: 'var(--foreground)' }}></Label>
        </YAxis>

        <Tooltip
          wrapperStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', outline: 'none' }}
          contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', padding: '8px' }}
          labelStyle={{ color: 'var(--muted-foreground)' }}
          formatter={(value) => {
            if (Array.isArray(value)) {
              return [`${value.join(", ")} nT`, "IMF Bz"];
            }
            return [`${value ?? "-"} nT`, "IMF Bz"];
          }}
          labelFormatter={(label) => {
            if (typeof label !== "number" && typeof label !== "string") {
              return "";
            }
            const index = Number(label);
            const d = chartData[index];
            return d ? d.time.toLocaleString("en-US", { timeZone: UTC_TIMEZONE }) : "";
          }}
        />

        <Line
          type="monotone"
          dataKey="bz"
          stroke="#ff0000"
          dot={false}
          strokeWidth={2}
        />

        <Brush
          dataKey="day"
          height={15}
          stroke="#ff0000"
          travellerWidth={8}
        />        

        <ReferenceLine x={chartData[chartData.length - 1]?.index} stroke="#ff0000" strokeDasharray="3 3" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default BzChart;