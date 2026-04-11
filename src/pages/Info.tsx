import Layout from "../layouts/Layout";

export default function Info() {
    return (
        <Layout>
            <div className="space-y-8 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-3xl font-semibold mb-4 text-[var(--foreground)]">Information</h1>
                    <p className="text-[var(--muted-foreground)] leading-7">
                        This monitoring dashboard displays geomagnetic and solar wind conditions using three data streams: the Dst index, Solar Wind Speed, and IMF Bz. The information below explains the data sources, thresholds, and how the MUF depression warning system is derived.
                    </p>
                </div>

                <section className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-3 text-[var(--foreground)]">Dataset Sources</h2>
                    <ul className="list-disc list-inside space-y-2 text-[var(--muted-foreground)]">
                        <li>
                            <strong>Dst Index:</strong> Derived from geomagnetic observatory measurements that represent the intensity of the global ring current. Lower Dst values indicate stronger geomagnetic storms.
                        </li>
                        <li>
                            <strong>Solar Wind Speed:</strong> Collected from solar wind measurements. High-speed solar wind streams can interact with Earth's magnetosphere and drive geomagnetic activity.
                        </li>
                        <li>
                            <strong>IMF Bz:</strong> The southward/upward component of the interplanetary magnetic field. Negative Bz values typically enhance coupling between the solar wind and Earth's magnetosphere.
                        </li>
                    </ul>
                </section>

                <section className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-3 text-[var(--foreground)]">Thresholds Used</h2>
                    <div className="space-y-3 text-[var(--muted-foreground)]">
                        <p>
                            The dashboard uses predefined thresholds to classify geomagnetic conditions and determine alert levels.
                        </p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>
                                <strong>Dst Status:</strong>
                                <ul className="list-disc list-inside ml-5 space-y-1">
                                    <li>Dst &le; -246: Severe Storm</li>
                                    <li>Dst &le; -140: Major Storm</li>
                                    <li>Dst &le; -80: Moderate Storm</li>
                                    <li>Dst &le; -45: Minor Storm</li>
                                    <li>Dst &le; -26: Active</li>
                                    <li>Dst  -26: Quiet</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Solar Wind Speed:</strong> Values above 500 km/s are considered high-speed streams and may trigger enhanced geomagnetic activity.
                            </li>
                            <li>
                                <strong>IMF Bz:</strong> Values less than -10 nT or greater than +10 nT are treated as warning-level conditions.
                            </li>
                        </ul>
                    </div>
                </section>

                <section className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-3 text-[var(--foreground)]">MUF Depression Warning System</h2>
                    <div className="space-y-3 text-[var(--muted-foreground)]">
                        <p>
                            The MUF depression warning is estimated from recent Dst behavior and storm onset characteristics.
                        </p>
                        <ol className="list-decimal list-inside space-y-2 ml-5">
                            <li>
                                Identify the first time the Dst index drops below -100 nT. This is considered the storm trigger point.
                            </li>
                            <li>
                                Determine the storm onset time by finding the highest Dst value before the trigger event.
                            </li>
                            <li>
                                Calculate the elapsed time from onset to trigger, then subtract that from a default 10-hour alert window.
                            </li>
                            <li>
                                Subtract the time already passed since the trigger to estimate remaining warning time.
                            </li>
                        </ol>
                        <p>
                            If the remaining warning time is positive, the system reports an active MUF depression warning. When the warning time reaches zero, the alert is considered expired.
                        </p>
                    </div>
                </section>

                <section className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-3 text-[var(--foreground)]">How to Use</h2>
                    <p className="text-[var(--muted-foreground)] leading-7">
                        Select a time range from the dashboard menu to view data for Today, the last 3 days, or the last 7 days. The charts and status cards update automatically based on the selected period.
                    </p>
                </section>
            </div>
        </Layout>
    )
}