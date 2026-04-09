import { useEffect, useState } from "react";
import Layout from "../layouts/Layout";
import Card from "../components/Card";
import Dropdown from "../components/DropdownButton";
import DSTChart from "../components/DSTChart";
import SWSChart from "../components/SWSChart";
import BzChart from "../components/BzChart";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusCircle from "../components/StatusCircle";
import  { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import React from "react";

type APIDSTData = {
  datetime: string;
  dst: number;
};

type DSTData = {
  time: Date;
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

    const last = data.at(-1)!;

    if (last.dst <= -246) return "Severe Storm";
    if (last.dst <= -140) return "Major Storm";
    if (last.dst <= -80) return "Moderate Storm";
    if (last.dst <= -45) return "Minor Storm";
    if (last.dst <= -26) return "Active"
    return "Quiet";
}

function getLatestSWStatus(data: SWData[]): SWStatus {
    if (!data.length) return "-";

    const last = data.at(-1)!;

    if (last.speed === null) return "-";
    if (last.speed > 500) return "HSSWS";
    return "Quiet";
}

function getLatestBzStatus(data: BzData[]): BzStatus {
    if (!data.length) return "-";

    const last = data.at(-1)!; 

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
    const [storm, setStorm] = useState<any>(null);
    const [selected, setSelected] = useState<string>(() => {
        const saved = localStorage.getItem("dropdown-selected");
        return saved || "Today";
    });

    useEffect(() => {
        const fetchData = () => {
        fetch("/api/dst-scrapper")
            .then((res) => res.json())
            .then((res) => {
              const parsed: DSTData[] = res.data.map((d: APIDSTData) => ({
                time: new Date(d.datetime),
                dst: d.dst,
              }));
              setDstData(parsed);
              setDstLoading(false);
            })
            .catch((err) => {
            console.error(err);
            setDstLoading(false);
            });
        };

        fetchData();
        const interval = setInterval(fetchData, 180000);
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
        const interval = setInterval(fetchSWData, 600000); 
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
            setBzLoading(false);
            });
        };

        fetchBzData();
        const interval = setInterval(fetchBzData, 600000); 
        return () => clearInterval(interval);
    }, []);

    const analyzeStorm = (data: DSTData[]) => {
      const sorted = [...data].sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
      );

      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].dst <= -100) {          
          let maxDst = -Infinity;
          let onsetIndex = 0;

          for (let j = 0; j < i; j++) {
            if (sorted[j].dst > maxDst) {
              maxDst = sorted[j].dst;
              onsetIndex = j;
            }
          }

          const onset = sorted[onsetIndex];
          const trigger = sorted[i];

          const onsetTime = new Date(onset.time).getTime();
          const triggerTime = new Date(trigger.time).getTime();
          const now = Date.now();
          
          const durationHours =
            (triggerTime - onsetTime) / (1000 * 60 * 60);
          
          const initialRemaining = 10 - durationHours;
          
          const elapsedSinceTrigger =
            (now - triggerTime) / (1000 * 60 * 60);
          
          const remainingHours = Math.max(
            0,
            initialRemaining - elapsedSinceTrigger
          );

          return {
            onset,
            trigger,
            durationHours,
            remainingHours,
          };
        }
      }

      return null;
    };

    const getUtcStartOfDay = (date: Date): number => {
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();

      return Date.UTC(year, month, day, 0, 0, 0);
    };

    const getUtcStartTime = (now: Date, daysAgo: number): number => {
      const startOfToday = getUtcStartOfDay(now);
      return startOfToday - daysAgo * 24 * 60 * 60 * 1000;
    };

    const getFilteredDstData = (allData: DSTData[], period: string): DSTData[] => {
  const now = new Date();
  const nowTime = now.getTime();

  if (period === "Today") {
    const startUTC = getUtcStartTime(now, 0);

    return allData.filter(d => {
      const t = new Date(d.time).getTime();
      return t >= startUTC && t <= nowTime;
    });
  }

  if (period === "3 Days") {
    const startUTC = getUtcStartTime(now, 2);

    return allData.filter(d => {
      const t = new Date(d.time).getTime();
      return t >= startUTC && t <= nowTime;
    });
  }

  if (period === "7 Days") {
    const startUTC = getUtcStartTime(now, 6);

    return allData.filter(d => {
      const t = new Date(d.time).getTime();
      return t >= startUTC && t <= nowTime;
    });
  }

  return allData;
};

    const getFilteredSWData = (allData: SWData[], period: string): SWData[] => {
        const now = new Date();
        const nowTime = now.getTime();

        if (period === "Today") {
            const startUTC = getUtcStartTime(now, 0);

            return allData.filter(d => {
            const t = new Date(d.time).getTime();
            return t >= startUTC && t <= nowTime;
            });
        } else if (period === "7 Days") {
            const startUTC = getUtcStartTime(now, 6);

            return allData.filter(d => {
            const t = new Date(d.time).getTime();
            return t >= startUTC && t <= nowTime;
            });
        } else if (period === "3 Days") {
            const startUTC = getUtcStartTime(now, 2);

            return allData.filter(d => {
            const t = new Date(d.time).getTime();
            return t >= startUTC && t <= nowTime;
            });
        }

        return allData;
    };

    const getFilteredBzData = (allData: BzData[], period: string): BzData[] => {
        const now = new Date();
        const nowTime = now.getTime();

        if (period === "Today") {
            const startUTC = getUtcStartTime(now, 0);

            return allData.filter(d => {
            const t = new Date(d.time).getTime();
            return t >= startUTC && t <= nowTime;
            });
        } else if (period === "7 Days") {
            const startUTC = getUtcStartTime(now, 6);

            return allData.filter(d => {
            const t = new Date(d.time).getTime();
            return t >= startUTC && t <= nowTime;
            });
        } else if (period === "3 Days") {
            const startUTC = getUtcStartTime(now, 2);

            return allData.filter(d => {
            const t = new Date(d.time).getTime();
            return t >= startUTC && t <= nowTime;
            });
        }

        return allData;
    };

  const filteredData = React.useMemo(() => 
    getFilteredDstData(dstData, selected),
    [dstData, selected]
  );
  const filteredSWSData = React.useMemo(() => 
    getFilteredSWData(swData, selected),
    [swData, selected]
  );
  const filteredBzData = React.useMemo(() => 
    getFilteredBzData(bzData, selected),
    [bzData, selected]
  );

  const dstStatus = React.useMemo(() => getLatestDSTStatus(dstData), [dstData]);
  const swStatus = React.useMemo(() => getLatestSWStatus(swData), [swData]);
  const bzStatus = React.useMemo(() => getLatestBzStatus(bzData), [bzData]);

  const dummyDstData = React.useMemo(() => {
    const now = new Date();

    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();
    const hour = now.getUTCHours();
    const minute = now.getUTCMinutes();

    const trigger = new Date(Date.UTC(year, month, day, hour, minute));

    return [    
      {
        time: new Date(trigger.getTime() - (9 * 60 + 58) * 60 * 1000),
        dst: -5,
      },

      { time: new Date(trigger.getTime() - 8 * 60 * 60 * 1000), dst: -20 },
      { time: new Date(trigger.getTime() - 7 * 60 * 60 * 1000), dst: -30 },
      { time: new Date(trigger.getTime() - 6 * 60 * 60 * 1000), dst: -40 },
      { time: new Date(trigger.getTime() - 5 * 60 * 60 * 1000), dst: -50 },
      { time: new Date(trigger.getTime() - 4 * 60 * 60 * 1000), dst: -60 },
      { time: new Date(trigger.getTime() - 3 * 60 * 60 * 1000), dst: -70 },
      { time: new Date(trigger.getTime() - 2 * 60 * 60 * 1000), dst: -80 },
      { time: new Date(trigger.getTime() - 1 * 60 * 60 * 1000), dst: -90 },
      
      { time: trigger, dst: -110 },
    ];
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const result = analyzeStorm(dummyDstData);
      setStorm(result);
    }, 300000); 

    return () => clearInterval(interval);
  }, [dummyDstData]);
  const lastDstData = React.useMemo(() => dstData.at(-1), [dstData]);
  const lastSwData = React.useMemo(() => swData.at(-1), [swData]);
  const lastBzData = React.useMemo(() => bzData.at(-1), [bzData]);

  const isStormActive = storm && storm?.remainingHours > 0;
  const remaining = storm?.remainingHours ?? 0;

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
            <p>Date</p>
            <div>
              {lastDstData?.time
                  ? lastDstData!.time.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      timeZone: "UTC",
                    })
                  : "-"}
            </div>
          </div>
          <div className="flex justify-between">
            <p>Time</p>
            <div className="flex gap-2">
              <p>
                {lastDstData?.time
                  ? lastDstData!.time.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "UTC",
                    })
                  : "-"
                }
              </p>
              <p className="font-semibold">
                UTC
              </p>
            </div>
          </div>
          <div className="flex justify-between">
            <p>Status:</p>
            <div className="flex items-center gap-2">
              <p>{dstStatus}</p>
              <StatusCircle status={dstStatus} />
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
                      timeZone: "UTC",
                    })
                  : "-"}
              </p>
            </div>  
          </div>
          <div className="flex justify-between">
            <p>Time</p>
            <div className="flex gap-2">
              <p>
                {lastSwData?.time
                  ? lastSwData!.time.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "UTC",
                    })
                  : "-"
                }
              </p>
              <p className="font-semibold">UTC</p>                        
            </div>
          </div>
          <div className="flex justify-between">
            <p>Status:</p>
            <div className="flex items-center gap-2">
              <p>{swStatus}</p>
              <StatusCircle status={swStatus} />
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
                    timeZone: "UTC",
                  })
                  : "-"
                }
              </p>
            </div>
          </div>
          <div className="flex justify-between">
              <p>Time:</p>
              <div className="flex gap-2">
                <p>
                  {
                    lastBzData?.time
                      ? lastBzData!.time.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                          timeZone: "UTC",
                      })
                    : "-"
                  }
                </p>
                <p className="font-semibold">
                  UTC
                </p>
              </div>
          </div>
          <div className="flex justify-between">
            <p>Status:</p>  
            <div className="flex items-center gap-2">
              <p>{bzStatus}</p>
              <StatusCircle status={bzStatus} />
            </div>
          </div> 
        </Card>        
      </div>

      <div className="flex flex-col gap-3">            
               
        <Card
          className={`relative overflow-hidden p-4 rounded-xl shadow-md transition-all duration-300 ${
            !isStormActive? "!bg-gray-50" : "!bg-red-500"
          }`}
        >          
          {isStormActive && (
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-red-600 to-red-800 opacity-20" />
          )}
          
          {isStormActive && (
            <div className="absolute inset-0 animate-pulse bg-red-800 opacity-10 z-0" />
          )}          
          <div className="relative z-10">
            {!storm ? (
              <p className="text-sm text-gray-500">No storm detected</p>
            ) : (
              <div className="space-y-2 text-sm text-white flex items-center justify-between">
                <p>
                  A MUF depression is expected to occur within the next{" "}
                  <span className="font-bold">
                    {remaining >= 1
                      ? `${Math.floor(remaining)} hours`
                      : `${Math.floor(remaining * 60)} minutes`
                    }
                  </span>
                </p>
                <ExclamationTriangleIcon className="w-7 h-7 text-white" />
              </div>
            )}
          </div>
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