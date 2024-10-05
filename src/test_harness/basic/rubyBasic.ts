import { jsonToRuby } from "../converter/converter";

export const rubyBasicHarness = (code: string, args: any, testCases: any[], answerAnyOrder: boolean = false) => `
${code}

def deep_sort(obj)
  # Recursive function to sort arrays deeply
  if obj.is_a?(Array)
    obj.map { |el| deep_sort(el) }.sort
  else
    obj
  end
end

def run_test_cases
    test_cases = ${jsonToRuby(testCases)}
    rbArgs = ${jsonToRuby(args)}

    test_cases.each_with_index do |test_case, i|
        args = rbArgs.keys.map { |arg| test_case[arg] }
        result = solve(*args)

        # Submission
        if test_case.has_key?('output')
            expected_output = test_case['output']
            answer_any_order = ${jsonToRuby(answerAnyOrder)}

            if answer_any_order && result.is_a?(Array) && expected_output.is_a?(Array)
                result = deep_sort(result)
                expected_output = deep_sort(expected_output)
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
