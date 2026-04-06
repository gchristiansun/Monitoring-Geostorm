import { useEffect, useState } from "react";
import Layout from "../layouts/Layout";
import Card from "../components/Card";
import Dropdown from "../components/DropdownButton";
import LoadingSpinner from "../components/LoadingSpinner";
import DataTable from "../components/DataTable";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import Button from "../components/Button";
import ConvertToCSV from "../components/DownloadCSV";

import type { ColumnDef } from "@tanstack/react-table";

type DSTData = {
  datetime: string;
  // day: number | null;
  // hour: number | null;
  dst: number | null;
}

type SolarWindData = {
  time: string;
  density?: number | null;
  speed?: number | null;
  temperature?: number | null;
};

type BzData = {
  time: string;
  bx?: number | null;
  by?: number | null;
  bz?: number | null;
}

const WIB_TIMEZONE = "Asia/Jakarta";

const getWibStartOfDayUtc = (date: Date): number => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: WIB_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year")?.value ?? 0);
  const month = Number(parts.find((part) => part.type === "month")?.value ?? 0);
  const day = Number(parts.find((part) => part.type === "day")?.value ?? 0);

  return Date.UTC(year, month - 1, day, -7, 0, 0);
};

const getWibStartTime = (now: Date, daysAgo: number): number => {
  return getWibStartOfDayUtc(now) - daysAgo * 24 * 60 * 60 * 1000;
};

const formatWibDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", { timeZone: WIB_TIMEZONE });

const columnsDst: ColumnDef<DSTData>[] = [
  {
    accessorKey: "datetime",
    header: "Time",
    cell: ({ getValue }) => formatWibDateTime(getValue() as string),
  }, 
  // {
  //   accessorKey: "day",
  //   header: "Day",
  //   cell: ({ getValue }) => getValue() != null ? Number(getValue()).toFixed(0) : "N/A"
  // },
  // {
  //   accessorKey: "hour",
  //   header: "Hour",
  //   cell: ({ getValue }) => getValue() != null ? Number(getValue()).toFixed(2) : "N/A"
  // },
  {
    accessorKey: "dst",
    header: "Dst (nT)",
    cell: ({ getValue }) => getValue() != null ? Number(getValue()).toFixed(2) : "N/A"
  },
]

const columnsSWS: ColumnDef<SolarWindData>[] = [
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ getValue }) => formatWibDateTime(getValue() as string),
  },
  {
    accessorKey: "density",
    header: "Density (n/cm³)",
    cell: ({ getValue }) =>
      getValue() != null ? Number(getValue()).toFixed(2) : "N/A",
  },
  {
    accessorKey: "speed",
    header: "Speed (km/s)",
    cell: ({ getValue }) =>
      getValue() != null ? Number(getValue()).toFixed(2) : "N/A",
  },
  {
    accessorKey: "temperature",
    header: "Temperature (K)",
    cell: ({ getValue }) =>
      getValue() != null ? Number(getValue()).toFixed(0) : "N/A",
  },
];

const columnsIMF: ColumnDef<BzData>[] = [
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ getValue }) => formatWibDateTime(getValue() as string),
  }, 
  {
    accessorKey: "bx",
    header: "Bx (nT)",
    cell: ({ getValue }) => getValue() != null ? Number(getValue()).toFixed(2) : "N/A"
  },
  {
    accessorKey: "by",
    header: "By (nT)",
    cell: ({ getValue }) => getValue() != null ? Number(getValue()).toFixed(2) : "N/A"
  },
  {
    accessorKey: "bz",
    header: "Bz (nT)",
    cell: ({ getValue }) => getValue() != null ? Number(getValue()).toFixed(2) : "N/A"
  },
]

export default function Dataset() {
  const [swsdata, setSWSData] = useState<SolarWindData[]>([]);
  const [bzdata, setBzData] = useState<BzData[]>([]);
  const [dstdata, setDstData] = useState<DSTData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>(() => {
        const saved = localStorage.getItem("dropdown-selected");
        return saved || "Today";
    });

  useEffect(() => {
    const fetchDstData = async () => {
      try {
        const res = await fetch("/api/dst-scrapper");
        if (!res.ok) throw new Error("Failed to fetch");

        const json = await res.json();
        setDstData(json.data)
      } catch (err) {
        console.error("Error fetching", err)
      } finally {
        setLoading(false)
      }
    };

    fetchDstData();

    const interval = setInterval(fetchDstData, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchSWSData = async () => {
      try {
        const res = await fetch("/api/sw-data");
        if (!res.ok) throw new Error("Failed to fetch");

        const json = await res.json();
        setSWSData(json.data);
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSWSData();

    const interval = setInterval(fetchSWSData, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchBzData = async () => {
      try {
        const res = await fetch("/api/bz-data");
        if (!res.ok) throw new Error("Failed to fetch");

        const json = await res.json();
        setBzData(json.data)
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setLoading(false)
      }
    };

    fetchBzData();

    const interval = setInterval(fetchBzData, 300000);
    return () => clearInterval(interval)
  }, []);

  const getFilteredDstData = (
    allData: DSTData[],
    period: string
  ): DSTData[] => {
    const now = new Date();
    const nowTime = now.getTime();
    const daysAgo = period === "3 Days" ? 2 : period === "7 Days" ? 6 : 0;
    const startTime = getWibStartTime(now, daysAgo);

    return allData.filter((d) => {
      const t = new Date(d.datetime).getTime();
      return t >= startTime && t <= nowTime;
    });
  };

  const getFilteredSWData = (
    allData: SolarWindData[],
    period: string
  ): SolarWindData[] => {
    const now = new Date();
    const nowTime = now.getTime();
    const daysAgo = period === "3 Days" ? 2 : period === "7 Days" ? 6 : 0;
    const startTime = getWibStartTime(now, daysAgo);

    return allData.filter((d) => {
      const t = new Date(d.time).getTime();
      return t >= startTime && t <= nowTime;
    });
  };

  const getFilteredBzData = (
    allData: BzData[],
    period: string
  ): BzData[] => {
    const now = new Date();
    const nowTime = now.getTime();
    const daysAgo = period === "3 Days" ? 2 : period === "7 Days" ? 6 : 0;
    const startTime = getWibStartTime(now, daysAgo);

    return allData.filter((d) => {
      const t = new Date(d.time).getTime();
      return t >= startTime && t <= nowTime;
    });
  };

  const filteredDstData = getFilteredDstData(dstdata, selected)
  const filteredSWSData = getFilteredSWData(swsdata, selected)
  const filteredIMFData = getFilteredBzData(bzdata, selected)

  return (
    <Layout>
      <div className="flex flex-row items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Dataset</h1>
        <Dropdown onSelect={(period) => setSelected(period)} />
      </div>

      <div className="flex flex-col gap-3">
        <Card>
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Dst</h2>
            <Button className="!bg-[#833AB4] hover:!bg-[#833AB4]" onClick={() => ConvertToCSV(filteredDstData, "dst", selected)}>
              <ArrowDownTrayIcon className="w-4 h-4" />
            </Button>
          </div>
          <br />

          {loading ? (
            <div className="text-center">
              <LoadingSpinner size={30} />
            </div>
          ) : (
            <DataTable<DSTData>
              data={filteredDstData}
              columns={columnsDst}
            />
          )}
        </Card>
        <Card>
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Solar Wind</h2>
            <Button className="!bg-[#833AB4] hover:!bg-[#833AB4]" onClick={() => ConvertToCSV(filteredSWSData, "solarwind", selected)}>
              <ArrowDownTrayIcon className="w-4 h-4" />            
            </Button>
          </div>
          <br />

          {loading ? (
            <div className="text-center">
              <LoadingSpinner size={30} />
            </div>
          ) : (
            <DataTable<SolarWindData>
              data={filteredSWSData}
              columns={columnsSWS}
            />
          )}
        </Card>
        <Card>
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">IMF</h2>
            <Button className="!bg-[#833AB4] hover:!bg-[#833AB4]" onClick={() => ConvertToCSV(filteredIMFData, "imf", selected)}>
              <ArrowDownTrayIcon className="w-4 h-4" />
            </Button>
          </div>
          <br />

          {loading ? (
            <div className="text-center">
              <LoadingSpinner size={30} />
            </div>
          ) : (
            <DataTable<BzData>
              data={filteredIMFData}
              columns={columnsIMF}
            />
          )}
        </Card>
      </div>
    </Layout>
  );
}
