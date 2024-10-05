import { typeMappings } from "../type_mapping/typeMapping";

export const javaBasicHarness = (code: string, args: any, testCases: any[], answerAnyOrder: boolean = false) => `
import java.util.*;
import java.lang.*;
import java.io.*;

${code}

class TestHelper {
    @SuppressWarnings("unchecked")
    public static boolean compareResults(Object result, Object expected, boolean answerAnyOrder) {
        if (result instanceof int[] && expected instanceof int[]) {
            int[] resArray = (int[]) result;
            int[] expArray = (int[]) expected;

            if (answerAnyOrder) {
                Arrays.sort(resArray);
                Arrays.sort(expArray);
            }

            return Arrays.equals(resArray, expArray);
        } else if (result instanceof List && expected instanceof List) {
            List<?> resList = (List<?>) result;
            List<?> expList = (List<?>) expected;

            if (answerAnyOrder) {
                Collections.sort((List<Comparable>) resList);
                Collections.sort((List<Comparable>) expList);
            }

            return compareListOfLists(resList, expList, answerAnyOrder);
        } else if (result instanceof Integer && expected instanceof Integer) {
            return result.equals(expected);
        } else if (result instanceof String && expected instanceof String) {
            return result.equals(expected);
        } else if (result instanceof Boolean && expected instanceof Boolean) {
            return result.equals(expected);
        }
        return false;
    }

    @SuppressWarnings("unchecked")
    private static boolean compareListOfLists(List<?> result, List<?> expected, boolean answerAnyOrder) {
        if (result.size() != expected.size()) {
            return false;
        }
        for (int i = 0; i < result.size(); i++) {
            Object resElement = result.get(i);
            Object expElement = expected.get(i);
            if (resElement instanceof List && expElement instanceof List) {
                List<?> resSubList = (List<?>) resElement;
                List<?> expSubList = (List<?>) expElement;
                if (!compareListOfLists(resSubList, expSubList, answerAnyOrder)) {
                    return false;
                }
            } else if (!resElement.equals(expElement)) {
                return false;
            }
        }
        return true;
    }

    public static void printResult(Object result) {
        if (result instanceof int[]) {
            System.out.println(Arrays.toString((int[]) result));
        } else if (result instanceof List) {
            System.out.println(listToString((List<?>) result));
        } else if (result instanceof Integer || result instanceof String || result instanceof Boolean) {
            System.out.println(result);
        } else {
            System.out.println(result);
        }
    }

    private static String listToString(List<?> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            Object item = list.get(i);
            if (item instanceof List) {
                sb.append(listToString((List<?>) item));
            } else {
                sb.append(item.toString());
            }
            if (i != list.size() - 1) {
                sb.append(", ");
            }
        }
        sb.append("]");
        return sb.toString();
    }
}

class TestHarness {
    public static void main(String[] args) {
        Solution solution = new Solution();

        List<Map<String, Object>> testCases = new ArrayList<>();

        ${testCases.map((testCase, index) => {
          return `
          Map<String, Object> testCase${index} = new HashMap<>();
          ${Object.keys(args).map(arg => {
            const type = args[arg];
            const value = testCase[arg];

            if (type === 'int[]') {
              return `testCase${index}.put("${arg}", new int[]{${value.join(', ')}});`;
            } else if (type === 'int') {
              return `testCase${index}.put("${arg}", ${value});`;
            } else if (type === 'string') {
              return `testCase${index}.put("${arg}", "${value}");`;
            } else if (type === 'List' || type === 'string[]') {
              return `testCase${index}.put("${arg}", Arrays.asList(${value.map((v: any) => `"${v}"`).join(', ')}));`;
            } else {
              return `testCase${index}.put("${arg}", ${value});`;
            }
          }).join('\n')}
          ${
            testCase.output
              ? `testCase${index}.put("expected", ${
                  Array.isArray(testCase.output)
                    ? `Arrays.asList(${testCase.output.map((o: any) => Array.isArray(o) ? `Arrays.asList(${o.map((v: any) => `"${v}"`).join(', ')})` : `"${o}"`).join(', ')})`
                    : `"${testCase.output}"`
                });`
              : ''
          }
          testCases.add(testCase${index});
          `;
        }).join('')}

        String[] argNames = new String[] { ${Object.keys(args).map(arg => `"${arg}"`).join(', ')} };

        for (int i = 0; i < testCases.size(); i++) {
            Map<String, Object> testCase = testCases.get(i);
            Object[] methodArgs = new Object[argNames.length];

            for (int j = 0; j < argNames.length; j++) {
                methodArgs[j] = testCase.get(argNames[j]);
            }

            Object result = solution.solve(${Object.keys(args).map((arg, idx) => `((${(typeMappings as any).java[args[arg]]}) methodArgs[${idx}])`).join(', ')});
            Object expected = testCase.get("expected");

            boolean answerAnyOrder = ${answerAnyOrder || false};

            if (testCase.get("expected") != null) {
                if (!TestHelper.compareResults(result, expected, answerAnyOrder)) {
                    System.exit(1);
                }
            } else {
                TestHelper.printResult(result);
            }
        }
    }
}
`;
