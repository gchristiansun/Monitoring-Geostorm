function convertToCSV(data: any[]) {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);

  const escapeValue = (value: any) => {
    if (value === null || value === undefined) return "";
    const stringValue = String(value);
    const escaped = stringValue.replaceAll(/"/g, '""');
    return `"${escaped}"`;
  };

  const headerRow = headers.join(",");
  const rows = data.map(row =>
    headers.map(field => escapeValue(row[field])).join(",")
  );

  return [headerRow, ...rows].join("\n");
}

function nameFileCSV(
  data: any[], 
  type: string,
  period?: string
): string{
  if (!data || data.length === 0) return `${type}_data.csv`;
  return `${type}_data_${period}.csv`;
}

export default function downloadCSV(
  data: any[],
  filename: string,
  period?: string
) {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const csv = convertToCSV(data);

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = nameFileCSV(data, filename, period);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url); 
}