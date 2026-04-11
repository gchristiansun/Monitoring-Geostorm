import axios from "axios";

export const parseValue = (val) => {
  if (val === null || val === "" || val === "null") return null;
  const num = Number(val);
  return Number.isNaN(num) ? null : num;
};

export const fetchData = async (url, mapper) => {
  try {
    const res = await axios.get(url);
    const rows = res.data.slice(1);

    return rows.map((row) => mapper(row));
  } catch (err) {
    console.error("Error fetching data:", err);
    return [];
  }
};