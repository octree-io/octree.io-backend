import axios from "axios";
import mongoDbClient from "../db/mongodb.db";

class ProblemsFacade {
  async getProblemById(id: number) {
    try {
      const mongoDbInstance = mongoDbClient.getDb();
      const problemsCollection = mongoDbInstance?.collection("problems");

      const problem = await problemsCollection?.findOne({ id });

      return problem;
    } catch (error) {
      console.log("Failed to retrieve problem by ID:", error);
    }
  }

  async storeProblemToCache(json: any) {
    try {
      const mongoDbInstance = mongoDbClient.getDb();
      const problemsCacheCollection = mongoDbInstance?.collection("problems_cache");

      const titleSlug = json.data?.question?.titleSlug;
      if (!titleSlug) throw new Error("Missing titleSlug");

      await problemsCacheCollection?.updateOne(
        { "data.question.titleSlug": titleSlug },
        { $set: json },
        { upsert: true }
      );
    } catch (error) {
      console.log("Failed to store problem:", error);
    }
  }
  
  async getProblemByTitleSlug(titleSlug: string) {
    try {
      const mongoDbInstance = mongoDbClient.getDb();
      const problemsCacheCollection = mongoDbInstance?.collection("problems_cache");

      const problem = await problemsCacheCollection?.findOne({ "data.question.titleSlug": titleSlug });

      return problem;
    } catch (error) {
      console.log("Failed to retrieve problem by title slug:", error);
    }
  }

  async getRawProblemFromLeetcode(titleSlug: string) {
    const query = `
      query questionDetail($titleSlug: String!) {
        languageList {
          id
          name
        }
        submittableLanguageList {
          id
          name
          verboseName
        }
        statusList {
          id
          name
        }
        questionDiscussionTopic(questionSlug: $titleSlug) {
          id
          commentCount
          topLevelCommentCount
        }
        ugcArticleOfficialSolutionArticle(questionSlug: $titleSlug) {
          uuid
          chargeType
          canSee
          hasVideoArticle
        }
        question(titleSlug: $titleSlug) {
          title
          titleSlug
          questionId
          questionFrontendId
          questionTitle
          translatedTitle
          content
          translatedContent
          categoryTitle
          difficulty
          stats
          companyTagStatsV2
          topicTags {
            name
            slug
            translatedName
          }
          similarQuestionList {
            difficulty
            titleSlug
            title
            translatedTitle
            isPaidOnly
          }
          mysqlSchemas
          dataSchemas
          frontendPreviews
          likes
          dislikes
          isPaidOnly
          status
          canSeeQuestion
          enableTestMode
          metaData
          enableRunCode
          enableSubmit
          enableDebugger
          envInfo
          isLiked
          nextChallenges {
            difficulty
            title
            titleSlug
            questionFrontendId
          }
          libraryUrl
          adminUrl
          hints
          codeSnippets {
            code
            lang
            langSlug
          }
          exampleTestcaseList
          hasFrontendPreview
        }
      }
    `;

    const requestBody = {
      query,
      variables: {
        titleSlug
      },
      operationName: "questionDetail",
    };

    const response = await axios.post('https://leetcode.com/graphql', requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0',
      },
    });

    return response.data;
  }
}

const problemsFacade = new ProblemsFacade();
export default problemsFacade;
