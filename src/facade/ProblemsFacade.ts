import mongoDbClient from "../db/mongodb.db";

class ProblemsFacade {
  async getProblemById(id: number) {
    // TODO: Cache problems
    try {
      const mongoDbInstance = mongoDbClient.getDb();
      const problemsCollection = mongoDbInstance?.collection("problems");

      const problem = await problemsCollection?.findOne({ id });

      return problem;
    } catch (error) {
      console.log("Failed to retrieve problem by ID:", error);
    }
  }
}

const problemsFacade = new ProblemsFacade();
export default problemsFacade;
