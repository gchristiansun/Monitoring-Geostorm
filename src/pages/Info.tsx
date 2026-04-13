import Layout from "../layouts/Layout";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export default function Info() {
    return (
        <Layout>
            <div className="flex flex-col h-screen justify-between">
                <div>
                    <style>{`summary::-webkit-details-marker { display: none; } summary::marker { display: none; } details[open] summary .info-arrow { transform: rotate(180deg); }`}</style>
                    <div className="flex flex-col gap-3 mb-4">
                        <h1 className="text-3xl font-semibold">Information</h1>                        
                        <p className="text-[var(--muted-foreground)] leading-7">
                            This monitoring dashboard displays geomagnetic and solar wind conditions using three data streams: the Dst index, Solar Wind Speed, and IMF Bz. The information below explains the data sources, thresholds, and how the MUF depression warning system is derived.
                        </p>     
                    </div>          
                    <div className="flex flex-col gap-3">
                        <details className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-0 shadow-sm overflow-hidden">
                            <summary className="cursor-pointer flex items-center justify-between px-6 py-4 text-xl font-semibold text-[var(--foreground)] bg-[var(--card)]">
                                <span>Dataset Sources</span>
                                <span className="info-arrow transition-transform duration-200">▾</span>
                            </summary>
                            <div className="grid gap-4 p-6 text-[var(--muted-foreground)]">
                                <div className="rounded-2xl bg-[var(--background)] border border-[var(--border)] p-5">
                                    <p className="font-semibold text-[var(--foreground)]">Dst Index</p>
                                    <p className="mt-2">
                                        Derived from geomagnetic observatory measurements that represent the intensity of the global ring current. Lower Dst values indicate stronger geomagnetic storms.
                                    </p>
                                    <p className="mt-2">
                                        Data sourced from the: 
                                        <a href="https://wdc.kugi.kyoto-u.ac.jp/index.html"> 
                                            World Data Center for Geomagnetism, Kyoto
                                            <ArrowTopRightOnSquareIcon className="inline w-4 h-4 ml-1" />
                                        </a>
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-[var(--background)] border border-[var(--border)] p-5">
                                    <p className="font-semibold text-[var(--foreground)]">Solar Wind Speed</p>
                                    <p className="mt-2">
                                        Collected from solar wind measurements. High-speed solar wind streams can interact with Earth's magnetosphere and drive geomagnetic activity.
                                    </p>
                                    <p className="mt-2">
                                        Data sourced from the: 
                                        <a href="https://www.swpc.noaa.gov/products/real-time-solar-wind"> 
                                            National Oceanic and Atmospheric Administration
                                            <ArrowTopRightOnSquareIcon className="inline w-4 h-4 ml-1" />
                                        </a>
                                        
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-[var(--background)] border border-[var(--border)] p-5">
                                    <p className="font-semibold text-[var(--foreground)]">IMF Bz</p>
                                    <p className="mt-2">
                                        The southward/upward component of the interplanetary magnetic field. Negative Bz values typically enhance coupling between the solar wind and Earth's magnetosphere.
                                    </p>
                                    <p className="mt-2">
                                        Data sourced from the: 
                                        <a href="https://www.swpc.noaa.gov/products/real-time-solar-wind"> 
                                            National Oceanic and Atmospheric Administration
                                            <ArrowTopRightOnSquareIcon className="inline w-4 h-4 ml-1" />
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </details>

                        <details className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-0 shadow-sm overflow-hidden">
                            <summary className="cursor-pointer flex items-center justify-between px-6 py-4 text-xl font-semibold text-[var(--foreground)] bg-[var(--card)]">
                                <span>Thresholds Used</span>
                                <span className="info-arrow transition-transform duration-200">▾</span>
                            </summary>
                            <div className="space-y-4 p-6 text-[var(--muted-foreground)]">
                                <p>
                                    The dashboard uses predefined thresholds to classify geomagnetic conditions and determine alert levels.
                                </p>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-2xl bg-[var(--background)] border border-[var(--border)] p-5">
                                        <p className="font-semibold text-[var(--foreground)]">Dst Status</p>
                                        <p className="mt-2">
                                            Severe Storm when Dst ≤ -246, Major Storm when Dst ≤ -140, Moderate Storm when Dst ≤ -80, Minor Storm when Dst ≤ -45, Active when Dst ≤ -26, and Quiet when Dst is greater than -26.
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-[var(--background)] border border-[var(--border)] p-5">
                                        <p className="font-semibold text-[var(--foreground)]">Solar Wind Speed</p>
                                        <p className="mt-2">
                                            Values above 500 km/s are considered high-speed streams and may trigger enhanced geomagnetic activity.
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-[var(--background)] border border-[var(--border)] p-5 md:col-span-2">
                                        <p className="font-semibold text-[var(--foreground)]">IMF Bz</p>
                                        <p className="mt-2">
                                            Values less than -10 nT or greater than +10 nT are treated as warning-level conditions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </details>

                        <details className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-0 shadow-sm overflow-hidden">
                            <summary className="cursor-pointer flex items-center justify-between px-6 py-4 text-xl font-semibold text-[var(--foreground)] bg-[var(--card)]">
                                <span>MUF Depression Warning System</span>
                                <span className="info-arrow transition-transform duration-200">▾</span>
                            </summary>
                            <div className="space-y-4 p-6 text-[var(--muted-foreground)]">
                                <p>
                                    The MUF depression warning is estimated from recent Dst behavior and storm onset characteristics.
                                </p>
                                <div className="space-y-4">
                                    <div className="rounded-2xl bg-[var(--background)] border border-[var(--border)] p-5">
                                        <p className="font-semibold text-[var(--foreground)]">Step 1</p>
                                        <p className="mt-2">
                                            Identify the initial time the Dst index drops below -100 nT. This is considered the storm trigger point.
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-[var(--background)] border border-[var(--border)] p-5">
                                        <p className="font-semibold text-[var(--foreground)]">Step 2</p>
                                        <p className="mt-2">
                                            Determine the storm onset time by finding the highest Dst value before the trigger event.
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-[var(--background)] border border-[var(--border)] p-5">
                                        <p className="font-semibold text-[var(--foreground)]">Step 3</p>
                                        <p className="mt-2">
                                            Calculate the elapsed time from onset to trigger and subtract that from a default 10-hour alert window.
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-[var(--background)] border border-[var(--border)] p-5">
                                        <p className="font-semibold text-[var(--foreground)]">Step 4</p>
                                        <p className="mt-2">
                                            Subtract the time already passed since the trigger to estimate remaining warning time.
                                        </p>
                                    </div>
                                </div>
                                <p className="font-semibold text-[var(--foreground)]">
                                    Early warning formula:
                                </p>
                                <p className="rounded-2xl bg-[var(--background)] border border-[var(--border)] p-4 text-[var(--muted-foreground)]">
                                    10 jam - (waktu onset ke titik kritis -100 nT)
                                </p>
                                <p>
                                    If the remaining warning time is positive, the system reports an active MUF depression warning. When the warning time reaches zero, the alert is considered expired.
                                </p>
                            </div>
                        </details>

                        <details className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-0 shadow-sm overflow-hidden">
                            <summary className="cursor-pointer flex items-center justify-between px-6 py-4 text-xl font-semibold text-[var(--foreground)] bg-[var(--card)]">
                                <span>How to Use</span>
                                <span className="info-arrow transition-transform duration-200">▾</span>
                            </summary>
                            <div className="p-6 text-[var(--muted-foreground)] leading-7">
                                Select a time range from the dashboard menu to view data for Today, the last 3 days, or the last 7 days. The charts and status cards update automatically based on the selected period.
                            </div>
                        </details>
                    </div>                           
                </div>
                <footer className="text-center text-sm text-gray-500 py-4">
                    © 2026 Geo-Ionospheric Storm and Early Warning System. All rights reserved.
                </footer>      
            </div>                       
        </Layout>
    )
}