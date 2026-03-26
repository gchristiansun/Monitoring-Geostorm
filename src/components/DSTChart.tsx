import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

type DSTData = {
  day: number;
  hour: number;
  dst: number;
};

type ChartData = DSTData & {
  index: number;
  time: string;
};

type Props = {
  data: DSTData[];
  period?: string;
};

function DSTChart({ data, period = "30 Days" }: Props) {
  const chartData: ChartData[] = data.map((d, index) => ({
    index,
    time: `D${d.day} H${d.hour}`,
    day: d.day,
    hour: d.hour,
    dst: d.dst
  }));

  const dayTicks = chartData
  .map((d, i) => ({ day: d.day, index: i }))
  .filter((item, i, arr) => {
    return i === 0 || item.day !== arr[i - 1].day;
  })
  .map((item) => item.index);

  return (    
    <ResponsiveContainer width="100%" height={400} className='focus:b-0 onClick:b-0'>
      <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 15, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
            dataKey="index"
            ticks={period === "Today" ? chartData.map(d => d.index) : dayTicks}
            tickFormatter={(value: number) => {
                const d = chartData[value];
                if (period === "Today") {
                return d ? `H${d.hour}` : "";
                }
                return d ? `D${d.day}` : "";
            }}
            tick={{ fontSize: 12, fill: "#333", fontWeight: "bold" }}
        >
        <Label
            value={period === "Today" ? "Hour" : "Day"}
            offset={-10}
            position="insideBottom"
        />
        </XAxis>

        <YAxis 
          tick={{ fontSize: 12, fill: '#333', fontWeight: 'bold' }}
        >
          <Label value="nT" offset={0} position="insideLeft"></Label>
        </YAxis>

        <Tooltip
          formatter={(value) => {
            if (Array.isArray(value)) {
              return [`${value.join(", ")} nT`, "DST"];
            }
            return [`${value ?? "-"} nT`, "DST"];
          }}
          labelFormatter={(label) => {
            if (typeof label !== "number" && typeof label !== "string") {
              return "";
            }
            const index = Number(label);
            const d = chartData[index];
            return d ? `Day ${d.day}, Hour ${d.hour}` : "";
          }}
        />

        <Line
          type="monotone"
          dataKey="dst"
          stroke="#ff7300"
          dot={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default DSTChart;

