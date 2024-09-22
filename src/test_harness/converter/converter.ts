export const jsonToPython = (data: any): string => {
  if (data === null) return "None";
  if (typeof data === "boolean") return data ? "True" : "False";
  if (Array.isArray(data)) return `[${data.map(jsonToPython).join(", ")}]`;
  if (typeof data === "object") {
    return `{${Object.entries(data)
      .map(([key, value]) => `"${key}": ${jsonToPython(value)}`)
      .join(", ")}}`;
  }
  if (typeof data === "string") return `"${data}"`;
  return String(data);
}
