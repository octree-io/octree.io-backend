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

export const jsonToGo = (data: any): string =>  {
  if (Array.isArray(data)) {
      // If the data is an array, recursively convert each element
      return '[]interface{}{' + data.map(jsonToGo).join(', ') + '}';
  } else if (typeof data === 'object' && data !== null) {
      // If the data is an object, recursively convert each key-value pair
      let objectEntries = Object.entries(data)
          .map(([key, value]) => `"${key}": ${jsonToGo(value)}`)
          .join(', ');
      return `map[string]interface{}{${objectEntries}}`;
  } else if (typeof data === 'string') {
      // If the data is a string, wrap it in double quotes
      return `"${data}"`;
  } else if (typeof data === 'number') {
      // If the data is a number, return it as-is
      return data.toString();
  } else if (typeof data === 'boolean') {
      // Convert boolean values to "true" or "false"
      return data ? 'true' : 'false';
  } else if (data === null) {
      // Convert null values to Go's zero value "nil"
      return 'nil';
  } else {
      throw new Error(`Unsupported data type: ${typeof data}`);
  }
}
