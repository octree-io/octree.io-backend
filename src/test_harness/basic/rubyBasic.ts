import { jsonToRuby } from "../converter/converter";

export const rubyBasicHarness = (code: string, args: any, testCases: any[], answerAnyOrder: boolean = false) => `
${code}

def run_test_cases
    # solution = Solution.new
    test_cases = ${jsonToRuby(testCases)}
    rbArgs = ${jsonToRuby(args)}

    test_cases.each_with_index do |test_case, i|
        args = rbArgs.keys.map { |arg| test_case[arg] }
        # result = solution.solve(*args)
        result = solve(*args)

        # Submission
        if test_case.has_key?('output')
            expected_output = test_case['output']
            answer_any_order = ${jsonToRuby(answerAnyOrder)}

            if answer_any_order && result.is_a?(Array) && expected_output.is_a?(Array)
                result = result.sort
                expected_output = expected_output.sort
            end

            if result != expected_output
                raise "Test case \#{i+1} failed: expected \#{expected_output}, got \#{result}"
            end
        # Normal run
        else
            puts result
        end
    end
end

run_test_cases
`;
