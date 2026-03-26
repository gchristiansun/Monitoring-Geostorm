import axios from "axios";

// 🔥 helper URL
function getDSTUrl(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(year).slice(-2);

  return {
    url: `https://wdc.kugi.kyoto-u.ac.jp/dst_realtime/${year}${month}/dst${yy}${month}.for.request`,
    year,
    monthIndex: date.getMonth(),
  };
}

export default async function handler(req, res) {
  try {
    const now = new Date();
    const prev = new Date();
    prev.setMonth(now.getMonth() - 1);

    const sources = [getDSTUrl(now), getDSTUrl(prev)];

    let allData = [];

    for (let src of sources) {
      try {
        console.log("FETCH:", src.url);

        const response = await axios.get(src.url, {
          responseType: "text",
          transformResponse: [(data) => data],
        });

        const text = response.data;

        // 🔥 DEBUG (optional)
        console.log("SAMPLE:", text.slice(0, 150));

        const lines = text.split("\n");

        for (let line of lines) {
  if (!line.startsWith("DST")) continue;

  const day = Number(line.substring(8, 10));
  if (isNaN(day)) continue;

  const valuesPart = line.substring(20).trim();
  const values = valuesPart.split(/\s+/);

  // 🔥 skip data belum lengkap
  // if (values.length < 24) continue;

  values.slice(0, 24).forEach((val, i) => {
    const value = Number(val);

    if (!isNaN(value) && value > -500 && value < 100) {
      const dateObj = new Date(
        src.year,
        src.monthIndex,
        day,
        i
      );

      allData.push({
        datetime: dateObj.toISOString(),
        day,
        hour: i + 1,
        dst: value,
      });
    }
  });
}
      } catch (err) {
        console.error("FAILED:", src.url);
      }
    }

    // 🔥 sort biar urut
    allData.sort(
      (a, b) =>
        new Date(a.datetime).getTime() -
        new Date(b.datetime).getTime()
    );

    // 🔥 filter 30 hari terakhir
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const nowTime = Date.now();

    const filtered = allData.filter(
      (d) =>
        nowTime - new Date(d.datetime).getTime() <= THIRTY_DAYS
    );

    console.log("TOTAL RAW:", allData.length);
    console.log("TOTAL 30 DAYS:", filtered.length);

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
