import { useEffect, useState } from "react";
import Layout from "../layouts/Layout";
import Card from "../components/Card";
import Dropdown from "../components/DropdownButton";
import LoadingSpinner from "../components/LoadingSpinner";
import DataTable from "../components/DataTable";

import type { ColumnDef } from "@tanstack/react-table";

type DSTData = {
  datetime: string;
  day: number | null;
  hour: number | null;
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

const columnsDst: ColumnDef<DSTData>[] = [
  {
    accessorKey: "datetime",
    header: "Time",
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(),
  }, 
  {
    accessorKey: "day",
    header: "Day",
    cell: ({ getValue }) => getValue() != null ? Number(getValue()).toFixed(0) : "N/A"
  },
  {
    accessorKey: "hour",
    header: "Hour",
    cell: ({ getValue }) => getValue() != null ? Number(getValue()).toFixed(2) : "N/A"
  },
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
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(),
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
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(),
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

    if (period === "Today") {
      return allData.filter((d) => {
        const dt = new Date(d.datetime);
        return dt.toDateString() === now.toDateString();
      });
    }

    if (period === "3 Days") {
      const start = new Date();
      start.setDate(now.getDate() - 2);
      start.setHours(0, 0, 0, 0);

      return allData.filter((d) => {
        const dt = new Date(d.datetime);
        return dt >= start && dt <= now;
      });
    }

    if (period === "7 Days") {
      const start = new Date();
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      return allData.filter((d) => {
        const dt = new Date(d.datetime);
        return dt >= start && dt <= now;
      });
    }

    return allData;
  };

  const getFilteredSWData = (
    allData: SolarWindData[],
    period: string
  ): SolarWindData[] => {
    const now = new Date();

    if (period === "Today") {
      return allData.filter((d) => {
        const dt = new Date(d.time);
        return dt.toDateString() === now.toDateString();
      });
    }

    if (period === "3 Days") {
      const start = new Date();
      start.setDate(now.getDate() - 2);
      start.setHours(0, 0, 0, 0);

      return allData.filter((d) => {
        const dt = new Date(d.time);
        return dt >= start && dt <= now;
      });
    }

    if (period === "7 Days") {
      const start = new Date();
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      return allData.filter((d) => {
        const dt = new Date(d.time);
        return dt >= start && dt <= now;
      });
    }

    return allData;
  };

  const getFilteredBzData = (
    allData: BzData[],
    period: string
  ): BzData[] => {
    const now = new Date();

    if (period === "Today") {
      return allData.filter((d) => {
        const dt = new Date(d.time);
        return dt.toDateString() === now.toDateString();
      });
    }

    if (period === "3 Days") {
      const start = new Date();
      start.setDate(now.getDate() - 2);
      start.setHours(0, 0, 0, 0);

      return allData.filter((d) => {
        const dt = new Date(d.time);
        return dt >= start && dt <= now;
      });
    }

    if (period === "7 Days") {
      const start = new Date();
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      return allData.filter((d) => {
        const dt = new Date(d.time);
        return dt >= start && dt <= now;
      });
    }

    return allData;
  };

  // const filteredDstData = useMemo(() => {
  //   const result = getFilteredDstData(dstdata, selectedPeriod);
  //   if (selectedPeriod === "Today" && result.length === 0) {
  //     return [
  //       {
  //         datetime: new Date().toISOString(),
  //         day: null,
  //         hour: null,
  //         dst: null,
  //       },
  //     ];
  //   }

  //   return result;
  // }, [dstdata, selectedPeriod]);

  // const filteredSWSData = useMemo(() => {
  //   const result = getFilteredSWData(swsdata, selectedPeriod);
  //   if (selectedPeriod === "Today" && result.length === 0) {
  //     return [
  //       {
  //         time: new Date().toISOString(),
  //         density: null,
  //         speed: null,
  //         temperature: null,
  //       },
  //     ];
  //   }

  //   return result;
  // }, [swsdata, selectedPeriod]);

  // const filteredIMFData = useMemo(() => {
  //   const result = getFilteredBzData(bzdata, selectedPeriod);
  //   if (selectedPeriod === "Today" && result.length === 0) {
  //     return [
  //       {
  //         time: new Date().toISOString(),
  //         bx: null,
  //         by: null,
  //         bz: null,
  //       },
  //     ];
  //   }

  //   return result;
  // }, [bzdata, selectedPeriod]);

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
          <h2 className="font-semibold">Dst</h2>
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
          <h2 className="font-semibold">Solar Wind</h2>
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
          <h2 className="font-semibold">IMF</h2>
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
