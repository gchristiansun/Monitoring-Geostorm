import { fetchData, parseValue } from "./fetch-data.js"

const fetchIMFBz = () => {
  return fetchData(
    // "https://services.swpc.noaa.gov/products/solar-wind/mag-7-day.json",
    "https://services.swpc.noaa.gov/products/geospace/propagated-solar-wind.json",
    (row) => ({
      time: new Date(row[0]),
      bx: parseValue(row[4]),
      by: parseValue(row[5]),
      bz: parseValue(row[6]),
    })
  );
};

export default async function handler(req, res) {
  try {
    const data = await fetchIMFBz();

    res.status(200).json({
      updated: new Date().toISOString(),
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}