import { jsonToPython } from "../converter/converter";
import { pythonDataStructures } from "../data_structures/pythonDataStructures";

export const pythonBasicHarness = (code: string, args: any, testCases: any[], answerAnyOrder: boolean = false) => `from collections import *
from array import *
from bisect import *
from typing import *
import collections
import array
import bisect
import heapq

${pythonDataStructures}

${code}

def sort_list(l):
    if isinstance(l, list):
        return sorted(sort_list(i) for i in l)
    return l

def run_test_cases():
    solution = Solution()
    test_cases = ${jsonToPython(testCases)}
    pyArgs = ${jsonToPython(args)}

    for i, test_case in enumerate(test_cases):
        # Submission
        if "output" in test_case:
            args = [test_case[arg] for arg in pyArgs]
            expected_output = test_case['output']
            answer_any_order = ${jsonToPython(answerAnyOrder)}

            result = solution.solve(*args)

            if answer_any_order and isinstance(result, list) and isinstance(expected_output, list):
                result = sort_list(result)
                expected_output = sort_list(expected_output)

            assert result == expected_output
        # Normal run
        else:
            args = [test_case[arg] for arg in pyArgs]
            result = solution.solve(*args)
            print(result)

run_test_cases()
`;
