// import axios from "axios";

// // 🔥 helper URL
// function getDSTUrl(date) {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const yy = String(year).slice(-2);

//   return {
//     url: `https://wdc.kugi.kyoto-u.ac.jp/dst_realtime/${year}${month}/dst${yy}${month}.for.request`,
//     year,
//     monthIndex: date.getMonth(),
//   };
// }

// export default async function handler(req, res) {
//   try {
//     const now = new Date();
//     const prev = new Date();
//     prev.setMonth(now.getMonth() - 1);

//     const sources = [getDSTUrl(now), getDSTUrl(prev)];

//     let allData = [];

//     for (let src of sources) {
//       try {
//         console.log("FETCH:", src.url);

//         const response = await axios.get(src.url, {
//           responseType: "text",
//           transformResponse: [(data) => data],
//         });

//         const text = response.data;

//         // 🔥 DEBUG (optional)
//         console.log("SAMPLE:", text.slice(0, 150));

//         const lines = text.split("\n");

//         for (let line of lines) {
//   if (!line.startsWith("DST")) continue;

//   const day = Number(line.substring(8, 10));
//   if (isNaN(day)) continue;

//   const valuesPart = line.substring(20).trim();
//   const values = valuesPart.split(/\s+/);

//   // 🔥 skip data belum lengkap
//   // if (values.length < 24) continue;

//   values.slice(0, 24).forEach((val, i) => {
//     const value = Number(val);

//     if (!isNaN(value) && value > -500 && value < 100) {
//       const dateObj = new Date(Date.UTC(
//         src.year,
//         src.monthIndex,
//         day,
//         i
//       ));

//       allData.push({
//         datetime: dateObj.toISOString(),
//         day,
//         hour: i + 1,
//         dst: value,
//       });
//     }
//   });
// }
//       } catch (err) {
//         console.error("FAILED:", src.url);
//       }
//     }

//     // 🔥 sort biar urut
//     allData.sort(
//       (a, b) =>
//         new Date(a.datetime).getTime() -
//         new Date(b.datetime).getTime()
//     );

//     // 🔥 filter 30 hari terakhir
//     const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
//     const nowTime = Date.now();

//     const filtered = allData.filter(
//       (d) =>
//         nowTime - new Date(d.datetime).getTime() <= THIRTY_DAYS
//     );

//     console.log("TOTAL RAW:", allData.length);
//     console.log("TOTAL 30 DAYS:", filtered.length);

//     res.status(200).json({
//       updated: new Date().toISOString(),
//       total: filtered.length,
//       data: filtered,
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       error: error.message,
//     });
//   }
// }

// import axios from "axios";

// // 🔥 helper URL
// function getDSTUrl(date) {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const yy = String(year).slice(-2);

//   return {
//     url: `https://wdc.kugi.kyoto-u.ac.jp/dst_realtime/${year}${month}/dst${yy}${month}.for.request`,
//   };
// }

// // 🔥 parse header DST (DST2603*01...)
// function parseDSTHeader(line) {
//   try {
//     const yy = Number(line.substring(3, 5));
//     const mm = Number(line.substring(5, 7));
//     const dd = Number(line.substring(8, 10));

//     if (isNaN(yy) || isNaN(mm) || isNaN(dd)) return null;

//     return {
//       year: 2000 + yy,
//       monthIndex: mm - 1,
//       day: dd,
//     };
//   } catch {
//     return null;
//   }
// }

// export default async function handler(req, res) {
//   try {
//     const now = new Date();
//     const prev = new Date();
//     prev.setMonth(now.getMonth() - 1);

//     const sources = [getDSTUrl(now), getDSTUrl(prev)];

//     let allData = [];

//     for (let src of sources) {
//       try {
//         console.log("FETCH:", src.url);

//         const response = await axios.get(src.url, {
//           responseType: "text",
//           transformResponse: [(data) => data],
//         });

//         const text = response.data;
//         const lines = text.split("\n");

//         for (let line of lines) {
//           if (!line.startsWith("DST")) continue;
//           if (line.length < 20) continue;

//           // 🔥 ambil tanggal dari header
//           const header = parseDSTHeader(line);
//           if (!header) continue;

//           const { year, monthIndex, day } = header;

//           // 🔥 ambil nilai DST
//           const valuesPart = line.substring(20).trim();
//           const values = valuesPart.split(/\s+/);

//           values.slice(0, 24).forEach((val, i) => {
//             const value = Number(val);

//             if (!isNaN(value) && value > -500 && value < 100) {
//               const dateObj = new Date(
//                 Date.UTC(year, monthIndex, day, i)
//               );

//               allData.push({
//                 datetime: dateObj.toISOString(), // tetap UTC
//                 day,
//                 hour: i,
//                 dst: value,
//               });
//             }
//           });
//         }
//       } catch (err) {
//         console.error("FAILED:", src.url);
//       }
//     }

//     // 🔥 sort
//     allData.sort(
//       (a, b) =>
//         new Date(a.datetime).getTime() -
//         new Date(b.datetime).getTime()
//     );

//     // 🔥 filter 30 hari terakhir
//     const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
//     const nowTime = Date.now();

//     const filtered = allData.filter(
//       (d) =>
//         nowTime - new Date(d.datetime).getTime() <= THIRTY_DAYS
//     );

//     console.log("TOTAL RAW:", allData.length);
//     console.log("TOTAL 30 DAYS:", filtered.length);
//     console.log("SAMPLE:", filtered.slice(0, 100));

//     res.status(200).json({
//       updated: new Date().toISOString(),
//       total: filtered.length,
//       data: filtered,
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       error: error.message,
//     });
//   }
// }


import axios from "axios";

// 🔥 helper URL
function getDSTUrl(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(year).slice(-2);

  return {
    url: `https://wdc.kugi.kyoto-u.ac.jp/dst_realtime/${year}${month}/dst${yy}${month}.for.request`,
  };
}

// 🔥 parse header DST (DST2603*01...)
function parseDSTHeader(line) {
  try {
    const yy = Number(line.substring(3, 5));
    const mm = Number(line.substring(5, 7));
    const dd = Number(line.substring(8, 10));

    if (isNaN(yy) || isNaN(mm) || isNaN(dd)) return null;

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

    // 🔥 smart source (hindari fetch berlebih)
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

          const valuesPart = line.substring(20).trim();
          const values = valuesPart.split(/\s+/);

          values.slice(0, 24).forEach((val, i) => {
            const value = Number(val);

            if (!isNaN(value) && value > -500 && value < 100) {
              const dateObj = new Date(
                Date.UTC(year, monthIndex, day, i)
              );

              allData.push({
                datetime: dateObj.toISOString(), // UTC
                day,
                hour: i,
                dst: value,
              });
            }
          });
        }
      } catch (err) {
        console.error("FAILED:", src.url);
      }
    }

    // 🔥 deduplicate (anti double)
    const uniqueMap = new Map();
    allData.forEach((item) => {
      uniqueMap.set(item.datetime, item);
    });

    const uniqueData = Array.from(uniqueMap.values());

    // 🔥 sort
    uniqueData.sort(
      (a, b) =>
        new Date(a.datetime).getTime() -
        new Date(b.datetime).getTime()
    );

    // 🔥 filter 7 hari terakhir
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    const nowTime = Date.now();

    const filtered = uniqueData.filter(
      (d) =>
        nowTime - new Date(d.datetime).getTime() <= SEVEN_DAYS
    );

    console.log("TOTAL RAW:", allData.length);
    console.log("UNIQUE:", uniqueData.length);
    console.log("FINAL (7 DAYS):", filtered.slice(0, 300));

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