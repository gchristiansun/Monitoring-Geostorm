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

function BzChart({ data }: Props) {
  const chartData: ChartData[] = data
    .filter(d => d.bz !== null)
    .map((d, index) => ({
      index,
      timeString: d.time.toLocaleString(),
      time: d.time,
      bz: d.bz
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
          stroke="#ff7300"
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default BzChart;