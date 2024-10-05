import { cppDataStructures } from "../data_structures/cppDataStructures";
import { typeMappings } from "../type_mapping/typeMapping";

export const cppBasicHarness = (
  code: string,
  args: any,
  testCases: any[],
  answerAnyOrder: boolean = false
) => `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <unordered_map>
#include <set>
#include <cmath>
#include <queue>
#include <stack>
#include <deque>
#include <cstdlib>
#include <climits>
#include <any>

using namespace std;

${cppDataStructures}

${code}

class TestHelper {
public:
    static bool compareResults(const std::vector<int>& result, const std::vector<int>& expected, bool answerAnyOrder) {
        std::vector<int> resArray = result;
        std::vector<int> expArray = expected;

        if (answerAnyOrder) {
            std::sort(resArray.begin(), resArray.end());
            std::sort(expArray.begin(), expArray.end());
        }

        return resArray == expArray;
    }

    static bool compareResults(const std::vector<int>& result, const std::vector<int>& expected) {
        return result == expected;
    }

    static bool compareResults(int result, int expected) {
        return result == expected;
    }

    static bool compareResults(const std::string& result, const std::string& expected) {
        return result == expected;
    }

    static bool compareResults(bool result, bool expected) {
        return result == expected;
    }

    static void printResult(const std::vector<int>& result) {
        for (int val : result) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }

    static void printResult(int result) {
        std::cout << result << std::endl;
    }

    static void printResult(const std::string& result) {
        std::cout << result << std::endl;
    }

    static void printResult(bool result) {
        std::cout << std::boolalpha << result << std::endl;
    }
};

class TestHarness {
public:
    void run() {
        Solution solution;

        std::vector<std::map<std::string, std::any>> testCases;

        ${testCases.map((testCase, index) => {
          return `
          std::map<std::string, std::any> testCase${index};
          ${Object.keys(args).map(arg => {
            const type = args[arg];
            const value = testCase[arg];

            if (type === "int[]") {
              return `testCase${index}["${arg}"] = std::vector<int>{${value.join(", ")}};`;
            } else if (type === "int") {
              return `testCase${index}["${arg}"] = ${value};`;
            } else if (type === "string") {
              return `testCase${index}["${arg}"] = std::string("${value}");`;
            } else {
              return `testCase${index}["${arg}"] = ${value};`;
            }
          }).join("\n")}
          ${
            testCase.output
              ? `testCase${index}["expected"] = ${
                  typeof testCase.output === 'object'
                    ? `std::vector<int>{${testCase.output.join(', ')}}`
                    : testCase.output
                };`
              : ''
          }
          testCases.push_back(testCase${index});
          `;
        }).join('')}

        std::vector<std::string> argNames = { ${Object.keys(args).map(arg => `"${arg}"`).join(', ')} };

        for (int i = 0; i < testCases.size(); i++) {
            std::map<std::string, std::any> testCase = testCases[i];

            std::vector<std::any> methodArgs;
            for (const std::string& argName : argNames) {
                methodArgs.push_back(testCase[argName]);
            }

            auto result = solution.solve(
                ${Object.keys(args).map((arg, idx) => {
                  const cppType = (typeMappings as any).cpp[args[arg]];
                  return `std::any_cast<${cppType}>(methodArgs[${idx}])`;
                }).join(', ')}
            );

            if (testCase.find("expected") != testCase.end()) {
                bool answerAnyOrder = ${answerAnyOrder || false};
                auto expected = testCase["expected"];

                if (expected.type() == typeid(int)) {
                    if (std::any_cast<int>(result) != std::any_cast<int>(expected)) {
                        std::cerr << "Wrong answer" << std::endl;
                        std::exit(1);
                    }
                } else if (expected.type() == typeid(bool)) {
                    if (std::any_cast<bool>(result) != std::any_cast<bool>(expected)) {
                        std::cerr << "Wrong answer" << std::endl;
                        std::exit(1);
                    }
                } else if (expected.type() == typeid(std::string)) {
                    if (std::any_cast<std::string>(result) != std::any_cast<std::string>(expected)) {
                        std::cerr << "Wrong answer" << std::endl;
                        std::exit(1);
                    }
                } else if (expected.type() == typeid(std::vector<int>)) {
                    auto expectedVec = std::any_cast<std::vector<int>>(expected);
                    auto resultVec = std::any_cast<std::vector<int>>(result);

                    // If answerAnyOrder is true, sort the vectors before comparing
                    if (answerAnyOrder) {
                        std::sort(expectedVec.begin(), expectedVec.end());
                        std::sort(resultVec.begin(), resultVec.end());
                    }

                    if (resultVec != expectedVec) {
                        std::cerr << "Wrong answer" << std::endl;
                        std::exit(1);
                    }
                } else {
                    std::cerr << "Unsupported expected type" << std::endl;
                    std::exit(1);
                }
            } else {
                TestHelper::printResult(result);
            }
        }
    }
};

int main() {
    TestHarness testHarness;
    testHarness.run();
    return 0;
}
`;
