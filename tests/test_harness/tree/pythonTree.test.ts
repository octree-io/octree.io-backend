import { pythonTreeHarness } from "../../../src/test_harness/tree/pythonTree";

describe("Python Tree Harness", () => {
  test("should work with root args", () => {
    const code = `class Solution:
    def solve(self, root: Optional[TreeNode], targetSum: int) -> bool:
        def dfs(node, S):
            if not node: return False

            S -= node.val

            if not node.left and not node.right:
                return S == 0

            return dfs(node.left, S) or dfs(node.right, S)

        return dfs(root, targetSum)`;

    const args = {
      root: "TreeNode",
      targetSum: "int"
    };

    const testCases = [
      {
        root: [5,4,8,11,null,13,4,7,2,null,null,null,1],
        targetSum: 22,
        output: true,
      },
      {
        root: [1,2,3],
        targetSum: 5,
        output: false,
      }
    ];

    const expectedCode = `from array import *
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
    def solve(self, root: Optional[TreeNode], targetSum: int) -> bool:
        def dfs(node, S):
            if not node: return False

            S -= node.val

            if not node.left and not node.right:
                return S == 0

            return dfs(node.left, S) or dfs(node.right, S)

        return dfs(root, targetSum)

def list_to_tree(lst):
    if not lst:
        return None

    root = TreeNode(lst[0])
    queue = collections.deque([root])
    index = 1

    while queue and index < len(lst):
        node = queue.popleft()

        if index < len(lst) and lst[index] is not None:
            node.left = TreeNode(lst[index])
            queue.append(node.left)
        else:
            node.left = None
        index += 1

        if index < len(lst) and lst[index] is not None:
            node.right = TreeNode(lst[index])
            queue.append(node.right)
        else:
            node.right = None
        index += 1

    return root

def tree_to_list(root):
    if not root:
        return []
    result = []
    queue = collections.deque([root])
    while queue:
        node = queue.popleft()
        if node:
            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append(None)
    # Remove trailing None's
    while result and result[-1] is None:
        result.pop()
    return result

def sort_list(l):
    if isinstance(l, list):
        return sorted(sort_list(i) for i in l)
    return l

def run_test_cases():
    test_cases = [{"root": [5, 4, 8, 11, None, 13, 4, 7, 2, None, None, None, 1], "targetSum": 22, "output": True}, {"root": [1, 2, 3], "targetSum": 5, "output": False}]
    pyArgs = {"root": "TreeNode", "targetSum": "int"}
    argNames = list(pyArgs.keys())
    argTypes = pyArgs

    for i, test_case in enumerate(test_cases):
        method_args = []
        for arg in argNames:
            argType = argTypes[arg]
            value = test_case.get(arg, None)
            if argType == 'TreeNode' and value is not None:
                value = list_to_tree(value)
            method_args.append(value)

        solution = Solution()
        result = solution.solve(*method_args)

        if "output" in test_case:
            expected_output = test_case['output']
            answer_any_order = False

            if isinstance(result, TreeNode):
                result = tree_to_list(result)
            if isinstance(expected_output, list):
                expected_output = expected_output
            elif isinstance(expected_output, TreeNode):
                expected_output = tree_to_list(expected_output)

            if answer_any_order and isinstance(result, list) and isinstance(expected_output, list):
                result = sort_list(result)
                expected_output = sort_list(expected_output)

            assert result == expected_output
        else:
            if isinstance(result, TreeNode):
                result = tree_to_list(result)
            print(result)

run_test_cases()
`;

    const wrappedCode = pythonTreeHarness(code, args, testCases, false);

    expect(wrappedCode).toEqual(expectedCode);
  });

  test("should work with two non-root args", () => {
    const code = `class Solution:
    def solve(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        if p == None and q == None: return True
        if p == None or q == None: return False
        if p.val != q.val: return False

        return self.solve(p.left, q.left) and self.solve(p.right, q.right)`;

    const args = {
      p: "TreeNode",
      q: "TreeNode"
    };

    const testCases = [{
      p: [1,2,3],
      q: [1,2,3],
      output: true
    }];

    const expectedCode = `from array import *
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
    def solve(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        if p == None and q == None: return True
        if p == None or q == None: return False
        if p.val != q.val: return False

        return self.solve(p.left, q.left) and self.solve(p.right, q.right)

def list_to_tree(lst):
    if not lst:
        return None

    root = TreeNode(lst[0])
    queue = collections.deque([root])
    index = 1

    while queue and index < len(lst):
        node = queue.popleft()

        if index < len(lst) and lst[index] is not None:
            node.left = TreeNode(lst[index])
            queue.append(node.left)
        else:
            node.left = None
        index += 1

        if index < len(lst) and lst[index] is not None:
            node.right = TreeNode(lst[index])
            queue.append(node.right)
        else:
            node.right = None
        index += 1

    return root

def tree_to_list(root):
    if not root:
        return []
    result = []
    queue = collections.deque([root])
    while queue:
        node = queue.popleft()
        if node:
            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append(None)
    # Remove trailing None's
    while result and result[-1] is None:
        result.pop()
    return result

def sort_list(l):
    if isinstance(l, list):
        return sorted(sort_list(i) for i in l)
    return l

def run_test_cases():
    test_cases = [{"p": [1, 2, 3], "q": [1, 2, 3], "output": True}]
    pyArgs = {"p": "TreeNode", "q": "TreeNode"}
    argNames = list(pyArgs.keys())
    argTypes = pyArgs

    for i, test_case in enumerate(test_cases):
        method_args = []
        for arg in argNames:
            argType = argTypes[arg]
            value = test_case.get(arg, None)
            if argType == 'TreeNode' and value is not None:
                value = list_to_tree(value)
            method_args.append(value)

        solution = Solution()
        result = solution.solve(*method_args)

        if "output" in test_case:
            expected_output = test_case['output']
            answer_any_order = False

            if isinstance(result, TreeNode):
                result = tree_to_list(result)
            if isinstance(expected_output, list):
                expected_output = expected_output
            elif isinstance(expected_output, TreeNode):
                expected_output = tree_to_list(expected_output)

            if answer_any_order and isinstance(result, list) and isinstance(expected_output, list):
                result = sort_list(result)
                expected_output = sort_list(expected_output)

            assert result == expected_output
        else:
            if isinstance(result, TreeNode):
                result = tree_to_list(result)
            print(result)

run_test_cases()
`;

    const wrappedCode = pythonTreeHarness(code, args, testCases, false);

    expect(wrappedCode).toEqual(expectedCode);
  });
});