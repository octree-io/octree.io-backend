import { NextFunction, Request, Response } from "express";
import knex from "../db/knex.db";
import { v4 as uuidv4 } from "uuid";
import { getRandomString } from "../utils/stringUtil";
import triviaFacade from "../facade/TriviaFacade";
import Groq from "groq-sdk";

// TODO: Refactor

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const getQuestionBanks = async (req: Request, res: Response, next: NextFunction) => {
  const username = req.user?.username;

  if (!username) {
    return res.status(400).json({ message: "Invalid username" });
  }

  try {
    const results = await knex("trivia_question_banks")
    .select()
    .where({ created_by: username });
  
    const questionBanks = results.map((result: any) => ({
      questionBankId: result.question_bank_id,
      title: result.title,
    }));
    
    return res.status(200).json({ questionBanks });
  } catch (error) {
    console.log("Error retrieving question banks:", error);
    return res.status(500).json({ message: "Error while retrieving question bank" });
  }
};

export const createQuestionBank = async (req: Request, res: Response, next: NextFunction) => {
  const { title, questions } = req.body;
  const username = req.user?.username;

  if (!title || !questions) {
    return res.status(400).json({ message: "Title and question must not be blank" });
  }

  if (!username) {
    return res.status(400).json({ message: "Invalid username" });
  }

  try {
    const questionsArray = questions
    .split("\n")
    .map((question: string) => question.trim())
    .filter((question: string) => question.length > 0);

    if (questionsArray.length === 0) {
      return res.status(400).json({ message: "At least one valid question is required." });
    }

    await knex.transaction(async (trx) => {
      const questionBankId = uuidv4();

      await trx("trivia_question_banks")
        .insert({
          question_bank_id: questionBankId,
          title,
          created_by: username,
        });

      const triviaQuestions = questionsArray.map((question: string) => ({
        question_id: uuidv4(),
        question_bank_id: questionBankId,
        question_text: question,
      }));

      await trx("trivia_questions")
        .insert(triviaQuestions);
    });

    return res.status(200).json({ message: "Created question bank" });
  } catch (error) {
    console.log("Error creating question bank:", error);
    return res.status(500).json({ message: "Error while creating question bank" });
  }
};

export const deleteQuestionBank = async (req: Request, res: Response, next: NextFunction) => {
  const { questionBankId } = req.params;
  const username = req.user?.username;

  if (!questionBankId) {
    return res.status(400).json({ message: "Question bank ID must not be blank" });
  }

  if (!username) {
    return res.status(400).json({ message: "Invalid username" });
  }

  try {
    const questionBank = await knex("trivia_question_banks")
      .select()
      .where({ question_bank_id: questionBankId, created_by: username })
      .first();

    if (!questionBank) {
      return res.status(404).json({ message: "Question bank not found or not owned by user" });
    }

    await knex.transaction(async (trx) => {
      await trx("trivia_questions")
        .where({ question_bank_id: questionBankId })
        .del();

      await trx("trivia_question_banks")
        .where({ question_bank_id: questionBankId })
        .del();

      await trx("trivia_rooms")
        .where({ question_bank_id: questionBankId })
        .del();
    });

    return res.status(200).json({ message: "Deleted question bank" });
  } catch (error) {
    console.error("Error deleting question bank:", error);
    return res.status(500).json({ message: "Error while deleting question bank" });
  }
};

export const createTriviaRoom = async (req: Request, res: Response, next: NextFunction) => {
  const { questionBankId } = req.body;
  const username = req.user?.username;
  const roomId = getRandomString(8);
  const roundDuration = 7200;

  if (!username) {
    return res.status(400).json({ message: "Invalid username" });
  }

  try {
    await knex("trivia_rooms")
      .insert({
        room_id: roomId,
        question_bank_id: questionBankId,
        round_duration: roundDuration,
        created_by: username,
      });

    await triviaFacade.scheduleRoomEnd(roomId, roundDuration * 1000);

    return res.status(200).json({ message: "Successfully created Trivia room", roomId });
  } catch (error) {
    console.error("Error creating trivia room:", error);
    return res.status(500).json({ message: "Error while creating trivia room" });
  }
};

export const getTriviaRoom = async (req: Request, res: Response, next: NextFunction) => {
  const { roomId } = req.params;
  const username = req.user?.username;

  if (!roomId) {
    return res.status(400).json({ message: "roomId must be valid" });
  }

  if (!username) {
    return res.status(400).json({ message: "Invalid username" });
  }

  try {
    const triviaRoom = await knex("trivia_rooms")
      .select("question_bank_id", "round_duration", "created_at")
      .where({ room_id: roomId })
      .first();

    if (!triviaRoom) {
      return res.status(404).json({ message: "Trivia room not found." });
    }

    const { question_bank_id: questionBankId, round_duration: roundDuration, created_at: createdAt } = triviaRoom;

    const currentTime = new Date().getTime();
    const roomStartTime = new Date(createdAt).getTime();
    const roundEndTime = roomStartTime + roundDuration * 1000;
    const timeRemaining = roundEndTime - currentTime;
    const timeRemainingInMs = Math.max(Math.floor(timeRemaining), 0);

    const questionBankQuestions = await knex("trivia_questions")
      .select("question_id", "question_text")
      .where({ question_bank_id: questionBankId });

    const questions = questionBankQuestions.map((question: any) => ({
      questionId: question.question_id,
      questionText: question.question_text,
    }));

    return res.status(200).json({ questions, timeRemainingInMs });
  } catch (error) {
    console.error("Error retrieving trivia room:", error);
    return res.status(500).json({ message: "Error while retrieving trivia room" });
  }
};

export const gradeAnswers = async (req: Request, res: Response, next: NextFunction) => {
  const { answers } = req.body;
  const username = req.user?.username;

  if (!answers || typeof answers !== "object") {
    return res.status(400).json({ message: "Invalid answers format." });
  }

  if (!username) {
    return res.status(400).json({ message: "Invalid username" });
  }

  try {
    const questionIds = Object.keys(answers);

    const questions = await knex("trivia_questions")
      .select("question_id", "question_text")
      .whereIn("question_id", questionIds);

    const questionTextMapping: { [key: string]: string } = {};
    questions.forEach((question) => {
      questionTextMapping[question.question_id] = question.question_text;
    });

    const responses = questionIds
      .map((questionId, index) => {
        const questionText = questionTextMapping[questionId];
        const userResponse = answers[questionId];
        return `${index + 1}. ${questionText}\nAnswer: ${userResponse}`;
      })
      .join("\n\n");

    const prompt = `
      I want you to grade these answers for these questions. For each question, put either a Yes or No for whether or not it passes an interview. Explain in-depth what the right answer is supposed to be. Be strict about the grading to make sure that the explanations are correct. It is acceptable if there are no specific examples unless the question specifically asks for examples.

      ${responses}
    `;

    const chatCompletion = await groqClient.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
    });

    const answer = chatCompletion.choices[0].message.content;

    await knex("trivia_submissions")
      .insert({
        submission_id: uuidv4(),
        username,
        prompt: responses,
        answer,
      });

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Error grading answers:", error);
    return res.status(500).json({ message: "Error while grading answers." });
  }
};
