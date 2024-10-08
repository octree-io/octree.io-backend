export function jsonToOCaml(value: any): string {
  if (value === null) {
    return 'None';
  } else if (typeof value === 'number') {
    return value.toString();
  } else if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  } else if (typeof value === 'string') {
    return `"${value}"`;
  } else if (Array.isArray(value)) {
    return `[${value.map(jsonToOCaml).join('; ')}]`;
  } else if (typeof value === 'object') {
    const entries = Object.entries(value).map(
      ([k, v]) => `let ${k} = ${jsonToOCaml(v)} in`
    );
    return entries.join('\n    ');
  } else {
    throw new Error(`Unsupported type: ${typeof value}`);
  }
}

export function getOutputType(testCases: any[]): string | null {
  for (const testCase of testCases) {
    if ('output' in testCase) {
      return inferOCamlType(testCase['output']);
    }
  }
  return null;
}

function inferOCamlType(value: any): string {
  if (value === null) {
    return 'unit';
  } else if (typeof value === 'number') {
    return 'int';
  } else if (typeof value === 'boolean') {
    return 'bool';
  } else if (typeof value === 'string') {
    return 'string';
  } else if (Array.isArray(value)) {
    const elementType = inferOCamlType(value[0]);
    return `${elementType} list`;
  } else if (typeof value === 'object') {
    // For simplicity, treat as an association list
    return '(string * ' + inferOCamlType(Object.values(value)[0]) + ') list';
  } else {
    return 'unknown';
  }
}
