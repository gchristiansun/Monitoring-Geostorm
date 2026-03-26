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

type SWData = {
    time: Date;
    speed: number | null;
};

type ChartData = SWData & {
    index: number;
    timeString: string;
};

type Props = {
    data: SWData[];
    period?: string;
};

function SWSChart({ data }: Props) {
  const chartData: ChartData[] = data
    .filter(d => d.speed !== null)
    .map((d, index) => ({
      index,
      timeString: d.time.toLocaleString(),
      time: d.time,
      speed: d.speed
    }));

  const timeTicks = chartData
    .filter((_, i) => i % Math.max(1, Math.floor(chartData.length / 10)) === 0)
    .map(d => d.index);

  return (
    <ResponsiveContainer width="100%" height={400} className='focus:b-0 onClick:b-0'>
      <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 15, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="index"
          ticks={timeTicks}
          tickFormatter={(value: number) => {
            const d = chartData[value];
            if (d) {
              return d.time.toLocaleDateString() + ' ' + d.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }
            return "";
          }}
          tick={{ fontSize: 10, fill: "#333", fontWeight: "bold" }}
          angle={-45}
          textAnchor="end"
          height={80}
        >
          <Label
            value="Time"
            offset={-10}
            position="insideBottom"
          />
        </XAxis>

        <YAxis
          tick={{ fontSize: 12, fill: '#333', fontWeight: 'bold' }}
          domain={[300, 800]}
        >
          <Label value="Km/s" offset={0} position="insideLeft"></Label>
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
            return d ? d.time.toLocaleString() : "";
          }}
        />

        <Line
          type="monotone"
          dataKey="speed"
          stroke="#ff7300"
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default SWSChart;