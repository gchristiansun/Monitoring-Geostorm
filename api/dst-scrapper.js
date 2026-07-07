import axios from "axios";

function getDSTUrl(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(year).slice(-2);

  return {
    url: `https://wdc.kugi.kyoto-u.ac.jp/dst_realtime/${year}${month}/dst${yy}${month}.for.request`,
  };
}

function parseDSTHeader(line) {
  try {
    const yy = Number(line.substring(3, 5));
    const mm = Number(line.substring(5, 7));
    const dd = Number(line.substring(8, 10));

    if (Number.isNaN(yy) || Number.isNaN(mm) || Number.isNaN(dd)) return null;

    return {
      year: 2000 + yy,
      monthIndex: mm - 1,
      day: dd,
    };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    const sources = [
      getDSTUrl(now),
      ...(now.getMonth() !== sevenDaysAgo.getMonth()
        ? [getDSTUrl(sevenDaysAgo)]
        : []),
    ];

    let allData = [];

    for (let src of sources) {
      try {
        console.log("FETCH:", src.url);

        const response = await axios.get(src.url, {
          responseType: "text",
          transformResponse: [(data) => data],
        });

        const text = response.data;
        const lines = text.split("\n");

        for (let line of lines) {
          if (!line.startsWith("DST")) continue;
          if (line.length < 20) continue;

          const header = parseDSTHeader(line);
          if (!header) continue;

          const { year, monthIndex, day } = header;

          const valuesPart = line.substring(20);

          for (let i = 0; i < 24; i++) {
              const chunk = valuesPart.substring(i * 4, i * 4 + 4).trim();

              if (!chunk) continue;

              const value = Number(chunk);

              let finalValue = null;

              if (!Number.isNaN(value) && value > -500 && value < 100) {
                  finalValue = value;
              }

              allData.push({
                  datetime: new Date(
                      Date.UTC(year, monthIndex, day, i)
                  ).toISOString(),
                  dst: finalValue,
              });
          }
        }
      } catch (err) {
        console.error("FAILED:", src.url);
        console.error(err);
      }
    }

    const uniqueMap = new Map();
    allData.forEach((item) => {
      uniqueMap.set(item.datetime, item);
    });

    const uniqueData = Array.from(uniqueMap.values());
    
    uniqueData.sort(
      (a, b) =>
        new Date(a.datetime).getTime() -
        new Date(b.datetime).getTime()
    );
    
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    const nowTime = Date.now();

    // const filtered = uniqueData.filter(
    //   (d) =>
    //     nowTime - new Date(d.datetime).getTime() <= SEVEN_DAYS
    // );

    const filtered = uniqueData.filter((d) => {
  const diff = nowTime - new Date(d.datetime).getTime();

  return diff >= 0 && diff <= SEVEN_DAYS;
});

    console.log("TOTAL RAW:", allData.length);
    console.log("UNIQUE:", uniqueData.length);
    console.log("FINAL (7 DAYS):", filtered.slice(0, 1000));

    res.status(200).json({
      updated: new Date().toISOString(),
      total: filtered.length,
      data: filtered,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
}