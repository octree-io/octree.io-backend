import { csharpDataStructures } from "../data_structures/csharpDataStructures";

export const csharpBasicHarness = (code: string, args: any, testCases: any[], answerAnyOrder: boolean = false) => `
using System;
using System.Collections.Generic;
using System.Linq;

${csharpDataStructures}

${code}

public static class TestHelper
{
    public static bool CompareResults(object result, object expected, bool answerAnyOrder)
    {
        // Handle List<List<int>> or int[][] comparison
        if (result is List<List<int>> resListList && expected is List<List<int>> expListList)
        {
            if (answerAnyOrder)
            {
                foreach (var list in resListList) list.Sort();
                foreach (var list in expListList) list.Sort();
                resListList.Sort((a, b) => a.Count - b.Count);
                expListList.Sort((a, b) => a.Count - b.Count);
            }
            return resListList.SequenceEqual(expListList, new ListComparer<int>());
        }
        else if (result is int[][] resArrayArray && expected is int[][] expArrayArray)
        {
            if (answerAnyOrder)
            {
                foreach (var array in resArrayArray) Array.Sort(array);
                foreach (var array in expArrayArray) Array.Sort(array);
                Array.Sort(resArrayArray, (a, b) => a.Length - b.Length);
                Array.Sort(expArrayArray, (a, b) => a.Length - b.Length);
            }
            return resArrayArray.SequenceEqual(expArrayArray, new ArrayComparer<int>());
        }

        // Handle List<List<string>> or string[][] comparison
        else if (result is List<List<string>> resListListStr && expected is List<List<string>> expListListStr)
        {
            if (answerAnyOrder)
            {
                foreach (var list in resListListStr) list.Sort();
                foreach (var list in expListListStr) list.Sort();
                resListListStr.Sort((a, b) => a.Count - b.Count);
                expListListStr.Sort((a, b) => a.Count - b.Count);
            }
            return resListListStr.SequenceEqual(expListListStr, new ListComparer<string>());
        }
        else if (result is string[][] resArrayArrayStr && expected is string[][] expArrayArrayStr)
        {
            if (answerAnyOrder)
            {
                foreach (var array in resArrayArrayStr) Array.Sort(array);
                foreach (var array in expArrayArrayStr) Array.Sort(array);
                Array.Sort(resArrayArrayStr, (a, b) => a.Length - b.Length);
                Array.Sort(expArrayArrayStr, (a, b) => a.Length - b.Length);
            }
            return resArrayArrayStr.SequenceEqual(expArrayArrayStr, new ArrayComparer<string>());
        }

        // Handle List<int> or int[] comparison
        else if (result is List<int> resList && expected is List<int> expList)
        {
            if (answerAnyOrder)
            {
                resList.Sort();
                expList.Sort();
            }
            return resList.SequenceEqual(expList);
        }
        else if (result is int[] resArray && expected is int[] expArray)
        {
            if (answerAnyOrder)
            {
                Array.Sort(resArray);
                Array.Sort(expArray);
            }
            return resArray.SequenceEqual(expArray);
        }

        // Handle List<string> or string[] comparison
        else if (result is List<string> resStrList && expected is List<string> expStrList)
        {
            if (answerAnyOrder)
            {
                resStrList.Sort();
                expStrList.Sort();
            }
            return resStrList.SequenceEqual(expStrList);
        }
        else if (result is string[] resStrArray && expected is string[] expStrArray)
        {
            if (answerAnyOrder)
            {
                Array.Sort(resStrArray);
                Array.Sort(expStrArray);
            }
            return resStrArray.SequenceEqual(expStrArray);
        }

        // Handle single int, string, and bool comparison
        else if (result is int resInt && expected is int expInt)
        {
            return resInt == expInt;
        }
        else if (result is string resStr && expected is string expStr)
        {
            return resStr == expStr;
        }
        else if (result is bool resBool && expected is bool expBool)
        {
            return resBool == expBool;
        }

        return false;
    }

    public static void PrintResult(object result)
    {
        if (result is int[])
        {
            Console.WriteLine(string.Join(", ", (int[])result));
        }
        else if (result is List<int>)
        {
            Console.WriteLine(string.Join(", ", (List<int>)result));
        }
        else if (result is int[][])
        {
            foreach (var array in (int[][])result)
            {
                Console.WriteLine("[" + string.Join(", ", array) + "]");
            }
        }
        else if (result is List<List<int>>)
        {
            foreach (var list in (List<List<int>>)result)
            {
                Console.WriteLine("[" + string.Join(", ", list) + "]");
            }
        }
        else if (result is List<string>)
        {
            Console.WriteLine(string.Join(", ", (List<string>)result));
        }
        else if (result is string[][])
        {
            foreach (var array in (string[][])result)
            {
                Console.WriteLine("[" + string.Join(", ", array) + "]");
            }
        }
        else if (result is List<List<string>>)
        {
            foreach (var list in (List<List<string>>)result)
            {
                Console.WriteLine("[" + string.Join(", ", list) + "]");
            }
        }
        else
        {
            Console.WriteLine(result);
        }
    }
}

// Comparer for List<List<T>> to handle comparison of nested lists
public class ListComparer<T> : IEqualityComparer<List<T>>
{
    public bool Equals(List<T> x, List<T> y)
    {
        return x.SequenceEqual(y);
    }

    public int GetHashCode(List<T> obj)
    {
        return obj.GetHashCode();
    }
}

// Comparer for T[][] to handle comparison of nested arrays
public class ArrayComparer<T> : IEqualityComparer<T[]>
{
    public bool Equals(T[] x, T[] y)
    {
        return x.SequenceEqual(y);
    }

    public int GetHashCode(T[] obj)
    {
        return obj.GetHashCode();
    }
}

public class TestHarness
{
    public static void Main(string[] args)
    {
        Solution solution = new Solution();

        var testCases = new List<Dictionary<string, object>>();

        ${testCases.map((testCase, index) => {
          return `
          var testCase${index} = new Dictionary<string, object>();
          ${Object.keys(args).map(arg => {
            const type = args[arg];
            const value = testCase[arg];

            if (type === 'int[]') {
              return `testCase${index}["${arg}"] = new int[]{${value.join(', ')}};`;
            } else if (type === 'int[][]') {
              return `testCase${index}["${arg}"] = new int[][]{${value.map((arr: any) => `new int[]{${arr.join(', ')}}`).join(', ')}};`;
            } else if (type === 'List<int[]>') {
              return `testCase${index}["${arg}"] = new List<int[]> { ${value.map((arr: any) => `new int[]{${arr.join(', ')}}`).join(', ')} };`;
            } else if (type === 'List<List<int>>') {
              return `testCase${index}["${arg}"] = new List<List<int>> { ${value.map((list: any) => `new List<int> { ${list.join(', ')} }`).join(', ')} };`;
            } else if (type === 'List<string[]>') {
              return `testCase${index}["${arg}"] = new List<string[]> { ${value.map((arr: any) => `new string[]{${arr.join(', ')}}`).join(', ')} };`;
            } else if (type === 'string[][]') {
              return `testCase${index}["${arg}"] = new string[][]{${value.map((arr: any) => `new string[]{${arr.join(', ')}}`).join(', ')}};`;
            } else if (type === 'List<List<string>>') {
              return `testCase${index}["${arg}"] = new List<List<string>> { ${value.map((list: any) => `new List<string> { ${list.join(', ')} }`).join(', ')} };`;
            } else if (type === 'int') {
              return `testCase${index}["${arg}"] = ${value};`;
            } else if (type === 'string') {
              return `testCase${index}["${arg}"] = "${value}";`;
            } else {
              return `testCase${index}["${arg}"] = ${value};`;
            }
          }).join('\n')}
          ${
            testCase.output
              ? `testCase${index}["expected"] = ${
                  typeof testCase.output === 'object'
                    ? testCase.output[0] instanceof Array
                      ? `new int[][]{${testCase.output.map((arr: any) => `new int[]{${arr.join(', ')}}`).join(', ')}}`
                      : `new List<int[]> { ${testCase.output.map((arr: any) => `new int[]{${arr.join(', ')}}`).join(', ')} }`
                    : testCase.output
                };`
              : ''
          }
          testCases.Add(testCase${index});
          `;
        }).join('')}

        string[] argNames = new string[] { ${Object.keys(args).map(arg => `"${arg}"`).join(', ')} };

        foreach (var testCase in testCases)
        {
            object[] methodArgs = new object[argNames.Length];

            for (int j = 0; j < argNames.Length; j++)
            {
                methodArgs[j] = testCase[argNames[j]];
            }

            var result = solution.Solve(${Object.keys(args).map((arg, idx) => `((${args[arg]}) methodArgs[${idx}])`).join(', ')});
            object expected = null;
            if (testCase.ContainsKey("expected"))
            {
                expected = testCase["expected"];
            }

            bool answerAnyOrder = ${answerAnyOrder || false};

            if (testCase.ContainsKey("expected") && testCase["expected"] != null)
            {
                if (!TestHelper.CompareResults(result, expected, answerAnyOrder))
                {
                    Console.WriteLine("Wrong answer");
                    Environment.Exit(1);
                }
            }
            else
            {
                TestHelper.PrintResult(result);
            }
        }
    }
}
`;
