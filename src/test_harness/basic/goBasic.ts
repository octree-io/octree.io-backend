import { jsonToGo } from "../converter/converter";

export const goBasicHarness = (code: string, args: any, testCases: any[], answerAnyOrder: boolean = false) => `package main

import (
  "fmt"
  "reflect"
  "sort"
  "os"
)

${code}

func runTestCases() {
  testCases := []map[string]interface{}{
    ${testCases.map(jsonToGo).join(",\n    ")},
  }
  goArgs := []string{${Object.keys(args).map(arg => `"${arg}"`).join(", ")}}

  for i, testCase := range testCases {
    var result interface{}
    if expectedOutput, found := testCase["output"]; found {
      args := injectArgs(testCase, goArgs)
      result = callSolve(reflect.ValueOf(solve), args)
      answerAnyOrder := ${jsonToGo(answerAnyOrder)}

      if answerAnyOrder {
        if reflect.TypeOf(result).Kind() == reflect.Slice && reflect.TypeOf(expectedOutput).Kind() == reflect.Slice {
          result = sortSlice(result)
          expectedOutput = sortSlice(expectedOutput)
        }
      }

      // Compare results
      if !reflect.DeepEqual(result, expectedOutput) {
        fmt.Printf("Test case %d failed. Expected %v but got %v\\n", i+1, expectedOutput, result)
        os.Exit(1)
        return
      }
    } else {
      // Normal run (no output comparison)
      args := injectArgs(testCase, goArgs)
      result = callSolve(reflect.ValueOf(solve), args)
      fmt.Println(result)
    }
  }
}

func injectArgs(testCase map[string]interface{}, goArgs []string) []reflect.Value {
  var args []reflect.Value
  for _, arg := range goArgs {
    if value, found := testCase[arg]; found {
      args = append(args, reflect.ValueOf(value))
    }
  }
  return args
}

func callSolve(function reflect.Value, args []reflect.Value) interface{} {
  results := function.Call(args)
  if len(results) > 0 {
    return results[0].Interface()
  }
  return nil
}

func sortSlice(data interface{}) interface{} {
  sorted := reflect.ValueOf(data)
  temp := make([]interface{}, sorted.Len())
  for i := 0; i < sorted.Len(); i++ {
    temp[i] = sorted.Index(i).Interface()
  }
  sort.Slice(temp, func(i, j int) bool {
    return fmt.Sprint(temp[i]) < fmt.Sprint(temp[j])
  })
  return temp
}

func main() {
  runTestCases()
}
`;
