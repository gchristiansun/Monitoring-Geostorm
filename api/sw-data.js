import { fetchData, parseValue } from "./fetch-data.js"

const fetchSolarWindSpeed = () => {
  return fetchData(
    // "https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json",
    "https://services.swpc.noaa.gov/products/geospace/propagated-solar-wind.json",
    (row) => ({
      time: new Date(row[0]),
      density: parseValue(row[2]),
      speed: parseValue(row[1]),
      temperature: parseValue(row[3]),
      // propagated_time: parseValue(row[11])
    })
  );
};

export default async function handler(req, res) {
  try {
    const data = await fetchSolarWindSpeed();

    res.status(200).json({
      updated: new Date().toISOString(),
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}