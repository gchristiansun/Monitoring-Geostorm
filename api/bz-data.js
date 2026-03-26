import axios from "axios";

async function fetchIMFBz() {
  try {
    const res = await axios.get(
      "https://services.swpc.noaa.gov/products/solar-wind/mag-7-day.json"
    );

    const raw = res.data;
    const rows = raw.slice(1);

    const data = rows.map((row) => {
      const parse = (val) => {
        if (val === null || val === "" || val === "null") return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
      };

      return {
        time: new Date(row[0]),
        bx: parse(row[1]),
        by: parse(row[2]),
        bz: parse(row[3]),
      };
    });

    return data;
  } catch (err) {
    console.error("Error fetching bz:", err);
    return [];
  }
}

export default async function handler(req, res) {
  try {
    const data = await fetchIMFBz();

    res.status(200).json({
      updated: new Date().toISOString(),
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
}