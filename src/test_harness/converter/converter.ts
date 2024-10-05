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

export const jsonToRuby = (obj: any): string => {
  if (Array.isArray(obj)) {
      return `[${obj.map(jsonToRuby).join(', ')}]`;
  } else if (typeof obj === 'object' && obj !== null) {
      const entries = Object.entries(obj).map(
          ([key, value]) => `"${key}" => ${jsonToRuby(value)}`
      );
      return `{${entries.join(', ')}}`;
  } else if (typeof obj === 'string') {
      return `"${obj}"`;
  } else {
      return String(obj);
  }
}

export const jsonToGo = (data: any): string => {
  if (data === null) return "nil";
  if (typeof data === "boolean") return data ? "true" : "false";
  if (Array.isArray(data)) return `[]${getGoType(data[0])}{${data.map(jsonToGo).join(", ")}}`;
  if (typeof data === "object") {
    return `{${Object.entries(data)
      .map(([key, value]) => `"${key}": ${jsonToGo(value)}`)
      .join(", ")}}`;
  }
  if (typeof data === "string") return `"${data}"`;
  return String(data);
};

const getGoType = (data: any): string => {
  if (Array.isArray(data)) return `[]${getGoType(data[0])}`;
  if (typeof data === "number") return "int";
  if (typeof data === "boolean") return "bool";
  if (typeof data === "string") return "string";
  if (typeof data === "object") return "struct";
  return "interface{}";
};

export const jsonToRust = (value: any) => {
  if (Array.isArray(value)) {
    return `vec![${value.map(v => (typeof v === 'string' ? `"${v}"` : v)).join(', ')}]`;
  } else if (typeof value === 'string') {
    return `"${value}"`;
  } else if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  } else {
    return value;
  }
}
