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

type ChartData = SWData & {
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
    data: SWData[];
    period?: string;
};

function SWSChart({ data, period = "7 Days" }: Props) {
  const chartData: ChartData[] = useMemo(() => {
    return data
      .filter((d) => d.speed !== null)
      .map((d, index) => ({
        index,
        day: getUtcDay(d.time),
        timeString: d.time.toLocaleString("en-US", { timeZone: UTC_TIMEZONE }),
        time: d.time,
        speed: d.speed,
      }));
  }, [data]);

  const dayTicks = useMemo(() => {
    return chartData
      .map((d, i) => ({ day: d.time ? getUtcDay(d.time) : 0, index: i }))
      .filter((item, i, arr) => i === 0 || item.day !== arr[i - 1].day)
      .map((item) => item.index);
  }, [chartData]);

  const hourTicks = useMemo(() => {
    return chartData
      .map((d, i) => ({ hour: d.time ? getUtcHour(d.time) : 0, index: i }))
      .filter((item, i, arr) => {
        const isNewHour = i === 0 || item.hour !== arr[i - 1].hour;
        const isInterval = item.hour % 2 === 0;

        return isNewHour && isInterval;
      })
      .map((item) => item.index);
  }, [chartData]);

  const activeTicks = useMemo(() => {
    return period === "Today" ? hourTicks : dayTicks;
  }, [period, dayTicks, hourTicks]);

  const CustomTick = ({ x, y, payload }: any) => {
    const d = chartData[payload.value];
    if (!d) return null;

    const date = formatUtcDate(d.time);
    const time = formatUtcTime(d.time);

    if (period === "Today") {      
      return (
        <text x={x} y={y} textAnchor="middle" fontSize={10} fill="#333" fontWeight={"bold"}>
          <tspan x={x} dy="1.2em">{time}</tspan>
        </text>
      );
    }   

    return (
      <text x={x} y={y} textAnchor="middle" fontSize={10} fill="#333" fontWeight={"bold"}>
        <tspan x={x} dy="1.2em">{date}</tspan>
        <tspan x={x} dy="1.2em">{time}</tspan>
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400} className='focus:b-0 onClick:b-0'>
      <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />

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
          />
        </XAxis>

        <YAxis
          tick={{ fontSize: 12, fill: '#333', fontWeight: 'bold' }}
          domain={[300, 1000]}
        >
          <Label value="Km/s" offset={0} position="insideLeft" angle={-90}></Label>
        </YAxis>

        <Tooltip
          formatter={(value) => {
            if (Array.isArray(value)) {
              return [`${value.join(", ")} Km/s`, "Solar Wind Speed"];
            }
            return [`${value ?? "-"} Km/s`, "Solar Wind Speed"];
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
        <ReferenceLine x={chartData[chartData.length - 1]?.index} stroke="#ff0000" strokeDasharray="3 3" />
      </LineChart>      
    </ResponsiveContainer>
  );
}

export default SWSChart;