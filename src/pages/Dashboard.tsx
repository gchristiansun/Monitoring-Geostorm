import { useEffect, useState } from "react";
import Layout from "../layouts/Layout";
import Card from "../components/Card";
import Dropdown from "../components/DropdownButton";
import DSTChart from "../components/DSTChart";
import SWSChart from "../components/SWSChart";
import BzChart from "../components/BzChart";
import LoadingSpinner from "../components/LoadingSpinner";

type DSTData = {
    datetime: string;
    day: number;
    hour: number;
    dst: number;
};

type SWData = {
    time: Date;
    speed: number | null;
};

type BzData = {
    time: Date;
    bz: number | null
}

type DSTStatus = "Quiet" | "Warning" | "Moderate" | "-";
type SWStatus = "Slow" | "Normal" | "Fast" | "-";
type BzStatus = "Quiet" | "Warning" | "-";

function getLatestDSTStatus(data: DSTData[]): DSTStatus {
    if (!data.length) return "-";

    const last = data.at(-1)!; // pasti ada karena data.length > 0

    if (last.dst <= -100) return "Moderate";
    if (last.dst <= -50) return "Warning";
    return "Quiet";
}

function getLatestSWStatus(data: SWData[]): SWStatus {
    if (!data.length) return "-";

    const last = data.at(-1)!; // pasti ada karena data.length > 0

    if (last.speed === null) return "-";
    if (last.speed >= 600) return "Fast";
    if (last.speed >= 400) return "Normal";
    return "Slow";
}

function getLatestBzStatus(data: BzData[]): BzStatus {
    if (!data.length) return "-";

    const last = data.at(-1)!; // pasti ada karena data.length > 0

    if (last.bz === null) return "-";
    if (last.bz > -10) return "Quiet";
    return "Warning";
}

export default function Dashboard() {
    const [dstData, setDstData] = useState<DSTData[]>([]);
    const [swData, setSwData] = useState<SWData[]>([]);
    const [bzData, setBzData] = useState<BzData[]>([]);
    const [dstLoading, setDstLoading] = useState(true);
    const [swLoading, setSwLoading] = useState(true);
    const [bzLoading, setBzLoading] = useState(true);
    const [selected, setSelected] = useState<string>(() => {
        const saved = localStorage.getItem("dropdown-selected");
        return saved || "Today";
    });

    useEffect(() => {
        const fetchData = () => {
        fetch("/api/dst-scrapper")
            .then((res) => res.json())
            .then((res) => {
            setDstData(res.data);
            setDstLoading(false);
            })
            .catch((err) => {
            console.error(err);
            setDstLoading(false);
            });
        };

        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchSWData = () => {
        fetch("/api/sw-data")
            .then((res) => res.json())
            .then((res) => {
            const processedData = res.data.map((d: any) => ({
                ...d,
                time: new Date(d.time)
            }));
            setSwData(processedData);
            setSwLoading(false);
            })
            .catch((err) => {
            console.error(err);
            setSwLoading(false);
            });
        };

        fetchSWData();
        const interval = setInterval(fetchSWData, 300000); // Update every 5 minutes
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchBzData = () => {
        fetch("/api/bz-data")
            .then((res) => res.json())
            .then((res) => {
            const processedData = res.data.map((d: any) => ({
                ...d,
                time: new Date(d.time)
            }));
            setBzData(processedData);
            setBzLoading(false);
            })
            .catch((err) => {
            console.error(err);
            setSwLoading(false);
            });
        };

        fetchBzData();
        const interval = setInterval(fetchBzData, 300000); // Update every 5 minutes
        return () => clearInterval(interval);
    }, []);

    const getFilteredDstData = (allData: DSTData[], period: string): DSTData[] => {
        const now = new Date();

        if (period === "Today") {
        return allData.filter(d => {
            const dt = new Date(d.datetime);
            return dt.toDateString() === now.toDateString();
        });
        } else if (period === "7 Days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 6); 
        sevenDaysAgo.setHours(0, 0, 0, 0);

        return allData.filter(d => {
            const dt = new Date(d.datetime);
            return dt >= sevenDaysAgo && dt <= now;
        });
        } else if (period === "3 Days") {
        const threeDaysAgo =  new Date();
        threeDaysAgo.setDate(now.getDate() - 2);
        threeDaysAgo.setHours(0, 0, 0, 0);

        return allData.filter(d => {
            const dt = new Date(d.datetime);
            return dt >= threeDaysAgo && dt <= now
        })
        }
        return allData;
    };

    const getFilteredSWData = (allData: SWData[], period: string): SWData[] => {
        const now = new Date();

        if (period === "Today") {
            return allData.filter(d => {
            const dt = new Date(d.time);
            return dt.toDateString() === now.toDateString();
            });
        } else if (period === "7 Days") {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 6);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            return allData.filter(d => {
            const dt = new Date(d.time);
            return dt >= sevenDaysAgo && dt <= now;
            });
        } else if (period === "3 Days") {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(now.getDate() - 2);
            threeDaysAgo.setHours(0, 0, 0, 0);

            return allData.filter(d => {
            const dt = new Date(d.time);
            return dt >= threeDaysAgo && dt <= now;
            });
        }

        return allData;
    };

    const getFilteredBzData = (allData: BzData[], period: string): BzData[] => {
        const now = new Date();

        if (period === "Today") {
            return allData.filter(d => {
            const dt = new Date(d.time);
            return dt.toDateString() === now.toDateString();
            });
        } else if (period === "7 Days") {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 6);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            return allData.filter(d => {
            const dt = new Date(d.time);
            return dt >= sevenDaysAgo && dt <= now;
            });
        } else if (period === "3 Days") {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(now.getDate() - 2);
            threeDaysAgo.setHours(0, 0, 0, 0);

            return allData.filter(d => {
            const dt = new Date(d.time);
            return dt >= threeDaysAgo && dt <= now;
            });
        }

        return allData;
    };

  const filteredData = getFilteredDstData(dstData, selected);
  const filteredSWSData = getFilteredSWData(swData, selected);
  const filteredBzData = getFilteredBzData(bzData, selected);

  const status = getLatestDSTStatus(dstData);
  const swStatus = getLatestSWStatus(swData);
  const bzStatus = getLatestBzStatus(bzData);

  return (
    <Layout>
      <div className="flex w-full justify-between items-start">
        <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
        <Dropdown onSelect={(period) => setSelected(period)}/>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="flex justify-between">
            Dst Index:
            <p className="font-bold">{dstData.at(-1)?.dst ?? "-"} nT</p>
          </div>
          <div className="flex justify-between">
            <p>Status:</p>
            <div>
              <p>{status}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex justify-between">
            Solar Wind Speed:
            <p className="font-bold">{swData.at(-1)?.speed ?? "-"} Km/s</p>
          </div>
          <div className="flex justify-between">
            <p>Status:</p>
            <div>
              <p>{swStatus}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex justify-between">
            IMF Bz:
            <p className="font-bold">{bzData.at(-1)?.bz ?? "-"} nT</p>
          </div>       
          <div className="flex justify-between">
            <p>Status:</p>  
            <div>
              <p>{bzStatus}</p>
            </div>
          </div>  
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <Card>
          <h2 className="font-semibold">Dst</h2>
          <br />
          {dstLoading ? (
            <div className="text-center"><LoadingSpinner size={30}/></div>
          ) : filteredData.length === 0 ? (
            <div className="text-center m-10">No Data Available</div>
          ) : (
            <DSTChart data={filteredData} period={selected} />
          )}
        </Card>
        <Card>
          <h2 className="font-semibold">Solar Wind Speed</h2>
          <br />
          {swLoading ? (
            <div className="text-center"><LoadingSpinner size={30}/></div>
          ) : filteredSWSData.length === 0 ? (
            <div className="text-center m-10">No Data Available</div>
          ) : (
            <SWSChart data={filteredSWSData} period={selected} />
          )}
        </Card>
        <Card>
          <h2 className="font-semibold">IMF Bz</h2>
          <br />
          {bzLoading ? (
            <div className="text-center"><LoadingSpinner size={30}/></div>
          ) : filteredBzData.length === 0 ? (
            <div className="text-center m-10">No Data Available</div>
          ) : (
            <BzChart data={filteredBzData} period={selected} />
          )}
        </Card>
      </div>
      
    </Layout>
  );
}
