import axios from "axios";

const compilers: { [key: string]: string } = {
  "python": "python312",
  "java": "java2102",
  "cpp": "g142",
  "csharp": "dotnet80csharpcoreclr",
  "typescript": "tsc_0_0_35_gc",
  "ruby": "ruby334",
  "go": "gl1221",
  "rust": "r1810",
  "ocaml": "ocaml5200",
};

class CompilerExplorerFacade {
  private apiUrl = "https://godbolt.org/api";

  async compile(language: string, code: string) {
    const compiler = compilers[language];
    const lang = language === "cpp" ? "c++" : language;

    const payload = {
      source: code,
      compiler,
      options: {
        userArguments: "",
        executeParameters: {
          args: "",
          stdin: "",
          runtimeTools: []
        },
        compilerOptions: {
          executorRequest: true,
          skipAsm: true,
          overrides: []
        },
        filters: {
          execute: true
        },
        tools: [],
        libraries: []
      },
      lang,
      files: [],
      allowStoreCodeDebug: true
    };

    try {
      const response = await axios.post(`${this.apiUrl}/compiler/${compiler}/compile`, payload, {
        headers: {
          "User-Agent": "octree.io",
          "Content-Type": "application/json",
        },
      });

      console.log("Compilation result:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error compiling code:", error.response ? error.response.data : error.message);
      throw error;
    }
  }
}

const compilerExplorerFacade = new CompilerExplorerFacade();
export default compilerExplorerFacade;
