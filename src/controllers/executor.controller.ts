import { Request, Response, NextFunction } from "express";
import compilerExplorerFacade from "../facade/CompilerExplorerFacade";
import testCaseFacade from "../facade/TestCaseFacade";

export const executeCode = async (req: Request, res: Response, next: NextFunction) => {
    const language = req.body.language;
    const code = req.body.code;

    const wrappedCode = testCaseFacade.wrapTestHarness(language, code, "two-sum");

    try {
      const output: any = await compilerExplorerFacade.compile(language, wrappedCode);

      return res.status(200).json({
          stdout: output.stdout,
          stderr: output.stderr,
          execTime: output.execTime,
          timedOut: output.timedOut,
      });
    } catch (error: any) {
      return res.status(500).json({ message: "Error" });
    }
};

// TODO: runCode
// TODO: submitCode
