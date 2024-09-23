import { csharpDataStructures } from "../data_structures/csharpDataStructures";
import { typeMappings } from "../type_mapping/typeMapping";

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
        if (result is int[] resArray && expected is int[] expArray)
        {
            if (answerAnyOrder)
            {
                Array.Sort(resArray);
                Array.Sort(expArray);
            }
            return resArray.SequenceEqual(expArray);
        }
        else if (result is List<int> resList && expected is List<int> expList)
        {
            if (answerAnyOrder)
            {
                resList.Sort();
                expList.Sort();
            }
            return resList.SequenceEqual(expList);
        }
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
            Console.WriteLine(string.Join(", ", (int[]) result));
        }
        else if (result is List<int>)
        {
            Console.WriteLine(string.Join(", ", (List<int>) result));
        }
        else
        {
            Console.WriteLine(result);
        }
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
                    ? `new int[]{${testCase.output.join(', ')}}`
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
