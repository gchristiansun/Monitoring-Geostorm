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

type DSTStatus = "Severe Storm" | "Major Storm" | "Moderate Storm" | "Minor Storm" | "Active" | "Quiet" | "-";
type SWStatus = "HSSWS" | "Quiet" | "-";
type BzStatus = "Quiet" | "Warning" | "-";

function getLatestDSTStatus(data: DSTData[]): DSTStatus {
    if (!data.length) return "-";

    const last = data.at(-1)!; // pasti ada karena data.length > 0

    if (last.dst <= -246) return "Severe Storm";
    if (last.dst <= -140) return "Major Storm";
    if (last.dst <= -80) return "Moderate Storm";
    if (last.dst <= -45) return "Minor Storm";
    if (last.dst <= -26) return "Active"
    return "Quiet";
}

function getLatestSWStatus(data: SWData[]): SWStatus {
    if (!data.length) return "-";

    const last = data.at(-1)!; // pasti ada karena data.length > 0

    if (last.speed === null) return "-";
    if (last.speed > 6500) return "HSSWS";
    return "Quiet";
}

function getLatestBzStatus(data: BzData[]): BzStatus {
    if (!data.length) return "-";

    const last = data.at(-1)!; // pasti ada karena data.length > 0

    if (last.bz === null) return "-";
    if (last.bz <= -10 || last.bz >= 10) return "Warning";
    return "Quiet";
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

  //   const formatDate = (date: Date) =>
  // date.toISOString().split("T")[0];

    const analyzeStorm = (data: DSTData[]) => {
      // pastikan urut waktu
      const sorted = [...data].sort(
        (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      );

      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].dst <= -100) {
          // cari onset (peak sebelum drop)
          let maxDst = sorted[i].dst;
          let onsetIndex = i;

          for (let j = i - 1; j >= 0; j--) {
            if (sorted[j].dst > maxDst) {
              maxDst = sorted[j].dst;
              onsetIndex = j;
            } else {
              break;
            }
          }

          const onset = sorted[onsetIndex];
          const trigger = sorted[i];

          const onsetTime = new Date(onset.datetime).getTime();
          const triggerTime = new Date(trigger.datetime).getTime();

          const diffHours = (triggerTime - onsetTime) / (1000 * 60 * 60);

          const remaining = 10 - diffHours;

          return {
            onset,
            trigger,
            durationHours: diffHours,
            remainingHours: remaining,
          };
        }
      }

      return null;
    };

    const getFilteredDstData = (allData: DSTData[], period: string): DSTData[] => {
  const now = new Date();
  const nowTime = now.getTime();

  if (period === "Today") {
    return allData.filter(d => {
      const dt = new Date(d.datetime);

      return (
        dt.getUTCFullYear() === now.getUTCFullYear() &&
        dt.getUTCMonth() === now.getUTCMonth() &&
        dt.getUTCDate() === now.getUTCDate()
      );
    });
  }

  if (period === "7 Days") {
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

    return allData.filter(d => {
      const dt = new Date(d.datetime).getTime();
      return nowTime - dt <= SEVEN_DAYS;
    });
  }

  if (period === "3 Days") {
    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

    return allData.filter(d => {
      const dt = new Date(d.datetime).getTime();
      return nowTime - dt <= THREE_DAYS;
    });
  }

  return allData;
};

    // const getFilteredDstData = (allData: DSTData[], period: string): DSTData[] => {
    //     const now = new Date();

    //     if (period === "Today") {
    //     return allData.filter(d => {
    //         const dt = new Date(d.datetime);
    //         return dt.toDateString() === now.toDateString();
    //     });
    //     // if (period === "Today") {
    //     //   const todayStr = formatDate(new Date());

    //     //   return allData.filter(d => {
    //     //     const dt = new Date(d.datetime);
    //     //     return formatDate(dt) === todayStr;
    //     // })
    //     } else if (period === "7 Days") {
    //     const sevenDaysAgo = new Date();
    //     sevenDaysAgo.setDate(now.getDate() - 6); 
    //     sevenDaysAgo.setHours(0, 0, 0, 0);

    //     return allData.filter(d => {
    //         const dt = new Date(d.datetime);
    //         return dt >= sevenDaysAgo && dt <= now;
    //     });
    //     } else if (period === "3 Days") {
    //     const threeDaysAgo =  new Date();
    //     threeDaysAgo.setDate(now.getDate() - 2);
    //     threeDaysAgo.setHours(0, 0, 0, 0);

    //     return allData.filter(d => {
    //         const dt = new Date(d.datetime);
    //         return dt >= threeDaysAgo && dt <= now
    //     })
    //     }
    //     return allData;
    // };

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
  const dummyDstData: DSTData[] = [
    { datetime: "2026-03-30T00:00:00Z", dst: -20, day: 30, hour: 0 },
    { datetime: "2026-03-30T01:00:00Z", dst: -10, day: 30, hour: 1 },
    { datetime: "2026-03-30T02:00:00Z", dst: -5,  day: 30, hour: 2 },
    { datetime: "2026-03-30T03:00:00Z", dst: -15, day: 30, hour: 3 },
    { datetime: "2026-03-30T04:00:00Z", dst: -50, day: 30, hour: 4 },
    { datetime: "2026-03-30T05:00:00Z", dst: -80, day: 30, hour: 5 },
    { datetime: "2026-03-30T06:00:00Z", dst: -120, day: 30, hour: 6 },
  ];
  // const result = analyzeStorm(dstData);
  const result = analyzeStorm(dummyDstData)
  const lastDstData = dstData.at(-1);
  const lastSwData = swData.at(-1);
  const lastBzData = bzData.at(-1);

  return (
    <Layout>
      <div className="flex flex-row items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Dropdown onSelect={(period) => setSelected(period)} />
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <div className="flex justify-between">
            Dst Index:
            <p className="font-bold">{lastDstData?.dst ?? "-"} nT</p>
          </div>
          <div className="flex justify-between">
            <p>Status:</p>
            <div>
              <p>{status}</p>
            </div>
          </div>
          <div className="flex justify-between">
            <p>Date</p>
            <div>
              {/* <p>{dstData.at(-1)?.dateti}</p> */}
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex justify-between">
            Solar Wind Speed:
            <p className="font-bold">{lastSwData?.speed ?? "-"} Km/s</p>
          </div>          
          <div className="flex justify-between">
            <p>Date:</p>
            <div>
              <p>
                {lastSwData?.time
                  ? lastSwData!.time.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                    })
                  : "-"}
              </p>
            </div>  
          </div>
          <div className="flex justify-between">
            <p>Time</p>
            <div>
              <p>
                {lastSwData?.time
                  ? lastSwData!.time.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : "-"
                }                
              </p>
            </div>
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
            <p className="font-bold">{lastBzData?.bz ?? "-"} nT</p>
          </div>                  
          <div className="flex justify-between">
            <p>Date:</p>
            <div>
              <p>{
                lastBzData?.time
                  ? lastBzData!.time.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                  })
                  : "-"
                }
              </p>
            </div>
          </div>
          <div className="flex justify-between">
              <p>Time:</p>
              <div>
                <p>
                  {
                    lastBzData?.time
                      ? lastBzData!.time.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                      })
                    : "-"
                  }
                </p>
              </div>
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
          <h2 className="font-semibold text-lg mb-2">Storm Analysis</h2>

          {!result ? (
            <p className="text-sm text-gray-500">No storm detected</p>
          ) : (
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Onset:</span>{" "}
                {new Date(result.onset.datetime).toLocaleString()}
              </p>

              <p>
                <span className="font-medium">Trigger (-100):</span>{" "}
                {new Date(result.trigger.datetime).toLocaleString()}
              </p>

              <p>
                <span className="font-medium">Duration:</span>{" "}
                {result.durationHours.toFixed(2)} hours
              </p>

              <p>
                <span className="font-medium">Remaining:</span>{" "}
                {Math.max(0, result.remainingHours).toFixed(2)} hours
              </p>
            </div>
          )}
        </Card>
        <Card>
          <h2 className="font-semibold">Dst</h2>
          <br />
          {dstLoading ? (
            <div className="text-center"><LoadingSpinner size={30}/></div>
          ) : filteredData.length === 0 ? (
            <div className="text-center m-10">No data available</div>
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
            <div className="text-center m-10">No data available</div>
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
            <div className="text-center m-10">No data available</div>
          ) : (
            <BzChart data={filteredBzData} period={selected} />
          )}
        </Card>
      </div>
      
    </Layout>
  );
}
