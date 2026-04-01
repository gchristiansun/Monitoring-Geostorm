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
  datetime: string;
  day: number;
  hour: number;
  dst: number;
};

type ChartData = DSTData & {
  index: number;
  datetime: string;
};

type Props = {
  data: DSTData[];
  period?: string;
};

function DSTChart({ data, period = "7 Days" }: Props) {
  const chartData: ChartData[] = data.map((d, index) => {

  return {
    index,
    datetime: d.datetime, // ✅ ini yang penting
    day: d.day,
    hour: d.hour,
    dst: d.dst
  };
});
  // const chartData: ChartData[] = data.map((d, index) => ({
  //   index,
  //   datetime: date.toISOString(),
  //   time: `D${d.day} H${d.hour}`,
  //   day: d.day,
  //   hour: d.hour,
  //   dst: d.dst
  // }));

  // const chartData = data.map((d, index) => {
  //   const date = new Date(Date.UTC(2026, 0, d.day, d.hour)); // contoh bulan

  //   return {
  //     index,
  //     time: date,
  //     day: d.day,
  //     hour: d.hour,
  //     dst: d.dst
  //   };
  // });

  const dayTicks = chartData
  .map((d, i) => ({ day: d.day, index: i }))
  .filter((item, i, arr) => {
    return i === 0 || item.day !== arr[i - 1].day;
  })
  .map((item) => item.index);

  return (    
    <ResponsiveContainer width="100%" height={400} className='focus:b-0 onClick:b-0'>
      <LineChart data={chartData} margin={{ top: 20, right: 30, bottom: 30, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
            dataKey="datetime"
            // ticks={period === "Today" ? chartData.map(d => d.index) : dayTicks}
            tickFormatter={(value) => {
                const date = new Date(value);
                if (period === "Today") {
                return `${date.getUTCHours()}:00`;
                }
                return `${date.getUTCDate()}`
            }}
            tick={{ fontSize: 12, fill: "#333", fontWeight: "bold" }}          
            padding={{ left: 25, right: 25 }}
        >
        <Label
            value={period === "Today" ? "Hour" : "Day"}
            offset={-40}
            position="insideBottom"
        />
        </XAxis>

        <YAxis 
          tick={{ fontSize: 12, fill: '#333', fontWeight: 'bold' }}
          domain={[-140, 140]}
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

            return d
              ? new Date(d.datetime).toLocaleString()
              : "";
          }}
        />

        <Line
          type="monotone"
          dataKey="dst"
          stroke="#ff7300"
          dot={false}        
        />

        <Brush 
          dataKey="day"
          height={15}
          stroke="#ff7300"
          travellerWidth={8}                    
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default DSTChart;

