interface TestCase {
  input: {
    [key: string]: any;
  };
  output: any;
}

export interface Problem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  starterCode: {
    [key: string]: string;
  };
  problemCategory: "basic" | "list" | "tree" | "graph" | "custom";
  problemType?: "returnNode" | "returnBoolean" | "returnList" | "returnTree" | "returnGraph" | "returnInt" | "inPlace";
  answerAnyOrder?: boolean;
  args: {
    [key: string]: string;
  };
  returnType: string;
  sampleTestCases: TestCase[];
  judgeTestCases: TestCase[];
  constraints: string[];
  topics: string[];
  companies: string[];
  followUp?: string;
}
