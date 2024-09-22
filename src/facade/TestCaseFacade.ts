import { pythonBasicHarness } from "../test_harness/basic/pythonBasic";

const problems = {
  "two-sum": {
    
  }
};

class TestCaseFacade {
  wrapTestHarness(language: string, code: string, problem: string) {
    const args = {
      "nums": "int[]",
      "target": "int"
    };

    let answerAnyOrder = false;
    if (problem === "two-sum") {
      answerAnyOrder = true;
    }

    const testCases = [
      {
        "nums": [2, 7, 11, 15],
        "target": 9,
        "output": [1, 0],
      }
    ];

    return pythonBasicHarness(code, args, testCases, answerAnyOrder);
  }
}

const testCaseFacade = new TestCaseFacade();
export default testCaseFacade;
