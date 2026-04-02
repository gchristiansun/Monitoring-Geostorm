import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Label,
    Brush
} from "recharts";

type DSTData = {
    time: Date;
    dst: number | null;
};

const WIB_TIMEZONE = "Asia/Jakarta";

const wibDayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: WIB_TIMEZONE,
  day: "2-digit",
});

const wibHourFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: WIB_TIMEZONE,
  hour: "2-digit",
  hour12: false,
});

const getWibDay = (date: Date) => Number(wibDayFormatter.format(date));
const getWibHour = (date: Date) => Number(wibHourFormatter.format(date));
const formatWibDate = (date: Date) => date.toLocaleDateString("en-US", { timeZone: WIB_TIMEZONE });
const formatWibTime = (date: Date) => date.toLocaleTimeString("en-US", { timeZone: WIB_TIMEZONE, hour: "2-digit", minute: "2-digit", hour12: false });

type ChartData = DSTData & {
    index: number;
    timeString: string;
};

type Props = {
    data: DSTData[];
    period?: string;
};

function DSTChart({ data, period = "7 Days" }: Props) {
  const chartData: ChartData[] = data
    .filter(d => d.dst !== null)
    .map((d, index) => ({
      index,
      day: getWibDay(d.time),
      timeString: d.time.toLocaleString("en-US", { timeZone: WIB_TIMEZONE }),
      time: d.time,
      dst: d.dst
    }));

  const dayTicks = chartData
    .map((d, i) => ({ day: getWibDay(d.time), index: i}))
    .filter((item, i , arr) => {
      return i === 0 || item.day !== arr[i - 1].day;
    })
    .map((item) => item.index)

  const hourTicks = chartData
    .map((d, i) => ({ hour: getWibHour(d.time), index: i}))
    .filter((item, i, arr) => {
      const isNewhour = i === 0 || item.hour !== arr[i - 1].hour;
      const isInterval = item.hour % 1 === 0;

      return isNewhour && isInterval;
    }) 
    .map((item) => item.index)

  const activeTicks = period === "Today" ? hourTicks : dayTicks

  const CustomTick = ({ x, y, payload }: any) => {
    const d = chartData[payload.value];
    if (!d) return null;

    const date = formatWibDate(d.time);
    const time = formatWibTime(d.time);

    if (period === "Today") {
      return (
        <text x={x} y={y} textAnchor="middle" fontSize={10} fill="#333" fontWeight={"bold"}>
          <tspan x={x} dy="1.2em">{time}</tspan>
        </text>
      )
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
      <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 30, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="index"
          ticks={activeTicks}
          tickFormatter={(value: number) => {
            const d = chartData[value];
            if (d) {
              return formatWibDate(d.time) + ' ' + formatWibTime(d.time);
            }
            return "";
          }}
          tick={<CustomTick />}          
          textAnchor="middle"
          height={80}
          padding={{ left: 50, right: 50 }}          
        >
          <Label
            value="Time (WIB)"
            offset={-40}
            position="insideBottom"
          />
        </XAxis>

        <YAxis
          tick={{ fontSize: 12, fill: '#333', fontWeight: 'bold' }}
          domain={[-100, 100]}
        >
          <Label value="nT" offset={0} position="insideLeft"></Label>
        </YAxis>

        <Tooltip
          formatter={(value) => {
            if (Array.isArray(value)) {
              return [`${value.join(", ")} nT`, "Dst"];
            }
            return [`${value ?? "-"} nT`, "Dst"];
          }}
          labelFormatter={(label) => {
            if (typeof label !== "number" && typeof label !== "string") {
              return "";
            }
            const index = Number(label);
            const d = chartData[index];
            return d ? d.time.toLocaleString("en-US", { timeZone: WIB_TIMEZONE }) : "";
          }}
        />

        <Line
          type="monotone"
          dataKey="dst"
          stroke="#ff0000"
          dot={false}
          strokeWidth={2}
        />

        <Brush
          dataKey="index"
          height={15}
          stroke="#ff0000"
          travellerWidth={8}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default DSTChart;