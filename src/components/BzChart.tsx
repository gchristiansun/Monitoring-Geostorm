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

type BzData = {
    time: Date;
    bz: number | null;
};

type ChartData = BzData & {
    index: number;
    timeString: string;
};

type Props = {
    data: BzData[];
    period?: string;
};

function BzChart({ data, period = "7 Days" }: Props) {
  const chartData: ChartData[] = data
    .filter(d => d.bz !== null)
    .map((d, index) => ({
      index,
      day: d.time.getDate(),
      timeString: d.time.toLocaleString(),
      time: d.time,
      bz: d.bz
    }));

  const dayTicks = chartData
    .map((d, i) => ({ day: d.time.getDate(), index: i}))
    .filter((item, i , arr) => {
      return i === 0 || item.day !== arr[i - 1].day;
    })
    .map((item) => item.index)

  const hourTicks = chartData
    .map((d, i) => ({ hour: d.time.getHours(), index: i}))
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

    const date = d.time.toLocaleDateString();
    const time = d.time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

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
              return d.time.toLocaleDateString() + ' ' + d.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }
            return "";
          }}
          tick={<CustomTick />}          
          textAnchor="middle"
          height={80}
          padding={{ left: 50, right: 50 }}          
        >
          <Label
            value="Time"
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
            return d ? d.time.toLocaleString() : "";
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
      </LineChart>
    </ResponsiveContainer>
  );
}

export default BzChart;