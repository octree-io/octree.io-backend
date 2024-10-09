import { pythonBasicHarness } from "../../../src/test_harness/basic/pythonBasic";

describe("Python Basic Harness", () => {
  test("happy case", () => {
    const code = `class Solution:
    def solve(self, s):
        return s == "abcdef"`;

    const args = {
      s: "string"
    };

    const testCases = [{
      s: "abcdef",
      output: true
    }];

    const expectedCode = `from collections import *
from array import *
from bisect import *
from typing import *
import collections
import array
import bisect
import heapq

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class GraphNode:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []


class Solution:
    def solve(self, s):
        return s == "abcdef"

def sort_list(l):
    if isinstance(l, list):
        return sorted(sort_list(i) for i in l)
    return l

def run_test_cases():
    solution = Solution()
    test_cases = [{"s": "abcdef", "output": True}]
    pyArgs = {"s": "string"}

    for i, test_case in enumerate(test_cases):
        # Submission
        if "output" in test_case:
            args = [test_case[arg] for arg in pyArgs]
            expected_output = test_case['output']
            answer_any_order = False

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

    const wrappedCode = pythonBasicHarness(code, args, testCases, false);
    expect(wrappedCode).toEqual(expectedCode);
  });
});