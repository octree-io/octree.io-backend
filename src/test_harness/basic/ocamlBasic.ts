import { getOutputType, jsonToOCaml } from "../converter/ocamlConverter";

export const ocamlBasicHarness = (
  code: string,
  args: any,
  testCases: any[],
  answerAnyOrder: boolean = false
) => {
  let testCasesCode = '';

  const argNames = Object.keys(args);
  const outputType = getOutputType(testCases);

  testCases.forEach((testCase, index) => {
    const argAssignments = argNames
      .map((arg) => {
        const value = testCase[arg];
        return `let ${arg} = ${jsonToOCaml(value)} in`;
      })
      .join('\n    ');

      if ('output' in testCase) {
        const expectedOutput = jsonToOCaml(testCase['output']);
  
        let testCaseCode = `
  (* Test case ${index + 1} *)
  let () =
      ${argAssignments}
      let expected_output = ${expectedOutput} in
      let result = solve ${argNames.join(' ')} in
      ${
        answerAnyOrder && outputType && outputType.startsWith('int list')
          ? `
      let result = deep_sort result in
      let expected_output = deep_sort expected_output in
      `
          : ''
      }
      if result = expected_output then
        Printf.printf "Test case ${index + 1} passed\\n"
      else begin
        Printf.printf "Test case ${index + 1} failed: Expected %s but got %s\\n"
          (string_of_result expected_output) (string_of_result result);
        exit 1
      end
  `;
        testCasesCode += testCaseCode;
      } else {
        let testCaseCode = `
  (* Test case ${index + 1} *)
  let () =
      ${argAssignments}
      let result = solve ${argNames.join(' ')} in
      Printf.printf "Test case ${index + 1} result: %s\\n" (string_of_result result)
  `;
        testCasesCode += testCaseCode;
      }
  });

  // Generate deep_sort function based on outputType
  let deepSortFunction = '';
  if (answerAnyOrder) {
    if (outputType === 'int list') {
      deepSortFunction = `
let deep_sort lst =
  List.sort compare lst
`;
    } else if (outputType === 'int list list') {
      deepSortFunction = `
let deep_sort lst =
  List.map (fun sublist -> List.sort compare sublist) lst
  |> List.sort compare
`;
    } else {
      // Handle other types as needed
      deepSortFunction = `
(* deep_sort function for output type ${outputType} not implemented *)
let deep_sort x = x
`;
    }
  }

  // Function to convert result to string for printing
  let stringOfResultFunction = '';
  if (outputType === 'int') {
    stringOfResultFunction = `
  let string_of_result res = string_of_int res
  `;
  } else if (outputType === 'float') {
    stringOfResultFunction = `
  let string_of_result res = string_of_float res
  `;
  } else if (outputType === 'bool') {
    stringOfResultFunction = `
  let string_of_result res = if res then "true" else "false"
  `;
  } else if (outputType === 'char') {
    stringOfResultFunction = `
  let string_of_result res = String.make 1 res
  `;
  } else if (outputType === 'string') {
    stringOfResultFunction = `
  let string_of_result res = res
  `;
  } else if (outputType === 'int list') {
    stringOfResultFunction = `
  let string_of_result res =
    "[" ^ String.concat "; " (List.map string_of_int res) ^ "]"
  `;
  } else if (outputType === 'float list') {
    stringOfResultFunction = `
  let string_of_result res =
    "[" ^ String.concat "; " (List.map string_of_float res) ^ "]"
  `;
  } else if (outputType === 'bool list') {
    stringOfResultFunction = `
  let string_of_result res =
    "[" ^ String.concat "; " (List.map (fun b -> if b then "true" else "false") res) ^ "]"
  `;
  } else if (outputType === 'char list') {
    stringOfResultFunction = `
  let string_of_result res =
    "[" ^ String.concat "; " (List.map (fun c -> "'" ^ String.make 1 c ^ "'") res) ^ "]"
  `;
  } else if (outputType === 'string list') {
    stringOfResultFunction = `
  let string_of_result res =
    "[" ^ String.concat "; " res ^ "]"
  `;
  } else if (outputType === 'int list list') {
    stringOfResultFunction = `
  let string_of_result res =
    "[" ^ String.concat "; " (List.map (fun lst -> "[" ^ String.concat "; " (List.map string_of_int lst) ^ "]") res) ^ "]"
  `;
  } else if (outputType === 'float list list') {
    stringOfResultFunction = `
  let string_of_result res =
    "[" ^ String.concat "; " (List.map (fun lst -> "[" ^ String.concat "; " (List.map string_of_float lst) ^ "]") res) ^ "]"
  `;
  } else if (outputType === 'bool list list') {
    stringOfResultFunction = `
  let string_of_result res =
    "[" ^ String.concat "; " (List.map (fun lst -> "[" ^ String.concat "; " (List.map (fun b -> if b then "true" else "false") lst) ^ "]") res) ^ "]"
  `;
  } else if (outputType === 'char list list') {
    stringOfResultFunction = `
  let string_of_result res =
    "[" ^ String.concat "; " (List.map (fun lst -> "[" ^ String.concat "; " (List.map (fun c -> "'" ^ String.make 1 c ^ "'") lst) ^ "]") res) ^ "]"
  `;
  } else if (outputType === 'string list list') {
    stringOfResultFunction = `
  let string_of_result res =
    "[" ^ String.concat "; " (List.map (fun lst -> "[" ^ String.concat "; " lst ^ "]") res) ^ "]"
  `;
  } else {
    // Handle other types as needed
    stringOfResultFunction = `
  let string_of_result _ = "<output>"
  `;
  }

  return `
${code}

${answerAnyOrder ? deepSortFunction : ''}

${stringOfResultFunction}

${testCasesCode}
`;
};
