import { Request, Response, NextFunction } from "express";
import problemsFacade from "../facade/ProblemsFacade";
import openAIFacade from "../facade/OpenAIFacade";
import compilerExplorerFacade from "../facade/CompilerExplorerFacade";

const extractTitleSlug = (urlString: string): string | null => {
  try {
    const url = new URL(urlString);
    const parts = url.pathname.split("/"); // ["", "problems", "two-sum", "description", ""]
    const index = parts.indexOf("problems");
    if (index !== -1 && parts.length > index + 1) {
      return parts[index + 1];
    }
    return null;
  } catch (e) {
    return null; // invalid URL
  }
}

export const getLeetcodeProblem = async (req: Request, res: Response, next: NextFunction) => {
  const { leetcodeUrl } = req.body;

  if (!leetcodeUrl || typeof leetcodeUrl !== "string") {
    return res.status(400).json({ error: "Missing or invalid leetcodeUrl" });
  }

  const titleSlug = extractTitleSlug(leetcodeUrl);
  if (!titleSlug) {
    return res.status(400).json({ error: "Invalid LeetCode problem URL format" });
  }

  const cachedProblem = await problemsFacade.getProblemByTitleSlug(titleSlug);

  let problem;
  if (!cachedProblem) {
    console.log("Problem not found in cache, getting it from LC and saving it");
  
    problem = await problemsFacade.getRawProblemFromLeetcode(titleSlug);

    await problemsFacade.storeProblemToCache(problem);
  } else {
    console.log("Problem found in cache, retrieving it from cache");
    problem = cachedProblem;
  }

  return res.status(200).json({
    message: "Problem saved successfully",
    problem,  
  });
};

export const getHintForLeetcodeProblem = async (req: Request, res: Response, next: NextFunction) => {
  const { leetcodeProblemTitle, code } = req.body;
  if (!leetcodeProblemTitle || !code) {
    return res.status(400).json({ error: "Missing or invalid parameters" });
  }

  const instructions = 'You are giving hints for a Leetcode problem. Do not give any spoilers for the problem. Give gradual hints based on the state of the code submitted.';
  const inputPrompt = `I am solving Leetcode problem ${leetcodeProblemTitle}. Here is my code: ${code}. Give me a hint without solving the problem for me.`;

  const responseText = await openAIFacade.sendChatGptMessage(instructions, inputPrompt);

  return res.status(200).json({
    message: responseText,
  });
};

export const runCode = async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Missing or invalid parameters" });
  }

  const response = await compilerExplorerFacade.compile("python", code);

  return res.status(200).json({
    output: response,
  });
};
 
