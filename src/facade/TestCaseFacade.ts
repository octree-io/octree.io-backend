import { cppBasicHarness } from "../test_harness/basic/cppBasic";
import { csharpBasicHarness } from "../test_harness/basic/csharpBasic";
import { goBasicHarness } from "../test_harness/basic/goBasic";
import { javaBasicHarness } from "../test_harness/basic/javaBasic";
import { pythonBasicHarness } from "../test_harness/basic/pythonBasic";
import { rubyBasicHarness } from "../test_harness/basic/rubyBasic";
import { rustBasicHarness } from "../test_harness/basic/rustBasic";

const languageMapping: { [key: string]: any } = {
  python: {
    basic: pythonBasicHarness,
  },
  java: {
    basic: javaBasicHarness,
  },
  cpp: {
    basic: cppBasicHarness,
  },
  csharp: {
    basic: csharpBasicHarness,
  },
  rust: {
    basic: rustBasicHarness,
  },
  ruby: {
    basic: rubyBasicHarness,
  },
  go: {
    basic: goBasicHarness,
  },
};

class TestCaseFacade {
  wrapTestHarness(language: string, code: string, problem: string) {
    // TODO: Pull problem document from DB

    const args = {
      "nums": "int[]",
      "target": "int"
    };

    const testCases = [
      {
        "nums": [2, 7, 11, 15],
        "target": 9,
        "output": [1, 0],
      }
    ];

    let answerAnyOrder = false;
    if (problem === "two-sum") {
      answerAnyOrder = true;
    }

    // const args = {
    //   s: "string"
    // };

    // const testCases = [
    //   {
    //     s: "abcdef",
    //     output: true,
    //   },
    // ];

    const harness = languageMapping[language]?.["basic"]?.(code, args, testCases, answerAnyOrder);
    console.log(harness);
    return harness || "";
  }
}

const testCaseFacade = new TestCaseFacade();
export default testCaseFacade;
