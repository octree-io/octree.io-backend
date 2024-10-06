import { Request, Response, NextFunction } from "express";
import testCaseFacade from "../facade/TestCaseFacade";
import eventBus from "../utils/eventBus";

export const runCode = async (req: Request, res: Response, next: NextFunction) => {
  const { roomId, language, code } = req.body;

  if (!roomId || !language || !code) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  try {
    const output: any = await testCaseFacade.executeTestCases(roomId, language, code, req?.user?.username, "run", true);

    return res.status(200).json({
        stdout: output.stdout,
        stderr: output.stderr,
        execTime: output.execTime,
        timedOut: output.timedOut,
        submissionId: output.submissionId,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Error" });
  }
};

export const submitCode = async (req: Request, res: Response, next: NextFunction) => {
  const { roomId, language, code } = req.body;

  if (!roomId || !language || !code) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  const result: any = await testCaseFacade.executeTestCases(roomId, language, code, req?.user?.username, "submit", false);

  eventBus.emit("submitCodeResponse", { roomId, user: req.user, result, language });

  return res.status(200).json({ message: "Code executed" });
};
