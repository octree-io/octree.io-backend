import { cppBasicHarness } from "../test_harness/basic/cppBasic";
import { csharpBasicHarness } from "../test_harness/basic/csharpBasic";
import { goBasicHarness } from "../test_harness/basic/goBasic";
import { javaBasicHarness } from "../test_harness/basic/javaBasic";
import { pythonBasicHarness } from "../test_harness/basic/pythonBasic";
import { rubyBasicHarness } from "../test_harness/basic/rubyBasic";
import { rustBasicHarness } from "../test_harness/basic/rustBasic";
import compilerExplorerFacade from "./CompilerExplorerFacade";
import gameRoomFacade from "./GameRoomFacade";
import problemsFacade from "./ProblemsFacade";

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
  async executeTestCases(roomId: string, language: string, code: string, dryRun: boolean = true) {
    const problemId = await gameRoomFacade.getCurrentProblemForRoom(roomId);
    const problem = await problemsFacade.getProblemById(problemId);

    if (!problem) {
      console.log("Failed to execute code, problem is null or undefined");
      return;
    }

    let testCases = [];
    const args = problem.args;
    const answerAnyOrder = problem.answerAnyOrder || false;
    const problemCategory = problem.problemCategory || "basic";

    if (dryRun) {
      const sampleTestCases = problem.sampleTestCases;

      testCases = sampleTestCases.map(({ input }: { input: any }) => ({
        ...input,
      }));
    } else {
      const judgeTestCases = problem.judgeTestCases;

      testCases = judgeTestCases.map(({ input, output }: { input: any, output: any }) => ({
        ...input,
        output,
      }));
    }

    const wrappedCode = languageMapping[language]?.[problemCategory]?.(code, args, testCases, answerAnyOrder) || "";
    const result = await compilerExplorerFacade.compile(language, wrappedCode);
    return result;
  }
}

const testCaseFacade = new TestCaseFacade();
export default testCaseFacade;
