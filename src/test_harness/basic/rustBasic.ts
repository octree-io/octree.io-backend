export const rustBasicHarness = (code: string, args: any, testCases: any[], answerAnyOrder: boolean = false) => `
use std::any::Any;
use std::cmp::*;
use std::collections::*;
use std::fmt::Debug;
use std::io::*;
use std::iter::*;
use std::mem::*;
use std::ops::*;
use std::path::*;
use std::sync::*;
use std::thread::*;
use std::time::*;
use std::vec::*;
use std::option::*;

pub struct Solution;

${code}

fn compare_results(result: &dyn Any, expected: &dyn Any, answer_any_order: bool) -> bool {
    // Case 1: Vec<i32> comparison
    if let (Some(result_vec), Some(expected_vec)) = (result.downcast_ref::<Vec<i32>>(), expected.downcast_ref::<Vec<i32>>()) {
        if answer_any_order {
            // Sort and compare
            let mut sorted_result = result_vec.clone();
            let mut sorted_expected = expected_vec.clone();
            sorted_result.sort_unstable();
            sorted_expected.sort_unstable();
            return sorted_result == sorted_expected;
        }
        return result_vec == expected_vec;
    }

    // Case 2: Vec<String> comparison
    if let (Some(result_vec), Some(expected_vec)) = (result.downcast_ref::<Vec<String>>(), expected.downcast_ref::<Vec<String>>()) {
        if answer_any_order {
            // Sort and compare
            let mut sorted_result = result_vec.clone();
            let mut sorted_expected = expected_vec.clone();
            sorted_result.sort_unstable();
            sorted_expected.sort_unstable();
            return sorted_result == sorted_expected;
        }
        return result_vec == expected_vec;
    }

    // Case 3: Single String comparison
    if let (Some(result_str), Some(expected_str)) = (result.downcast_ref::<String>(), expected.downcast_ref::<String>()) {
        return result_str == expected_str;
    }

    // Case 4: Single i32 comparison
    if let (Some(result_num), Some(expected_num)) = (result.downcast_ref::<i32>(), expected.downcast_ref::<i32>()) {
        return result_num == expected_num;
    }

    // Case 5: Single bool comparison
    if let (Some(result_bool), Some(expected_bool)) = (result.downcast_ref::<bool>(), expected.downcast_ref::<bool>()) {
        return result_bool == expected_bool;
    }

    // Fallback for non-matching types or unsupported types
    false
}

macro_rules! clone_any {
    ($value:expr, $arg_name:expr, $($t:ty),+) => {
        $(
            if let Some(val) = $value.downcast_ref::<$t>() {
                return Box::new(val.clone()) as Box<dyn Any>;
            }
        )+
        panic!("Unsupported argument type for '{}'", $arg_name);
    };
}

fn clone_boxed_any(value: &Box<dyn Any>, arg_name: &str) -> Box<dyn Any> {
    clone_any!(value, arg_name,
        i32, i64, f64, bool, char,
        String, &str,
        Vec<i32>, Vec<i64>, Vec<f64>, Vec<bool>, Vec<char>,
        Vec<String>, Vec<&str>
    );
}

fn print_result(result: &dyn std::fmt::Debug) {
    println!("{:?}", result);
}

fn main() {
    let solution = Solution::new();

    let test_cases: Vec<std::collections::HashMap<&str, Box<dyn Any>>> = vec![
        ${testCases.map((testCase, index) => {
            return `{
                let mut test_case${index} = std::collections::HashMap::new();
                ${Object.keys(args).map(arg => {
                    const type = args[arg];
                    const value = testCase[arg];

                    if (type === 'int[]') {
                        return `test_case${index}.insert("${arg}", Box::new(vec![${value.join(', ')}]) as Box<dyn Any>);`;
                    } else if (type === 'int') {
                        return `test_case${index}.insert("${arg}", Box::new(${value}) as Box<dyn Any>);`;
                    } else if (type === 'string') {
                        return `test_case${index}.insert("${arg}", Box::new("${value}") as Box<dyn Any>);`;
                    } else {
                        return `test_case${index}.insert("${arg}", Box::new(${value}) as Box<dyn Any>);`;
                    }
                }).join('\n')}
                ${
                  testCase.output
                    ? `test_case${index}.insert("expected", Box::new(vec![${testCase.output.join(', ')}]) as Box<dyn Any>);`
                    : ''
                }
                test_case${index}
            }`;
        }).join(',\n')}
    ];

    let arg_names = vec![${Object.keys(args).map(arg => `"${arg}"`).join(', ')}];

    for test_case in test_cases.iter() {
        let mut method_args: Vec<Box<dyn Any>> = vec![];

        for arg_name in arg_names.iter() {
            let value = test_case.get(arg_name).unwrap();
            method_args.push(clone_boxed_any(value, arg_name));
        }

        let result = solution.solve(${Object.keys(args)
          .map((arg, idx) => {
            const type = args[arg];
            if (type === "int[]") {
              return `method_args[${idx}].downcast_ref::<Vec<i32>>().unwrap().clone()`;
            } else if (type === "int") {
              return `*method_args[${idx}].downcast_ref::<i32>().unwrap()`;
            } else if (type === "string") {
              return `method_args[${idx}].downcast_ref::<String>().unwrap().clone()`;
            } else {
              return `method_args[${idx}]`;
            }
          })
          .join(", ")});

        if let Some(expected_box) = test_case.get("expected") {
            // Safely downcast expected to possible types
            if let Some(expected_vec_i32) = expected_box.downcast_ref::<Vec<i32>>() {
                // Compare Vec<i32>
                if !compare_results(&result, expected_vec_i32, ${answerAnyOrder}) {
                    println!("Wrong answer: expected {:?}, got {:?}", expected_vec_i32, result);
                    std::process::exit(1);
                }
            } else if let Some(expected_i32) = expected_box.downcast_ref::<i32>() {
                // Compare i32
                if !compare_results(&result, expected_i32, ${answerAnyOrder}) {
                    println!("Wrong answer: expected {:?}, got {:?}", expected_i32, result);
                    std::process::exit(1);
                }
            } else if let Some(expected_string) = expected_box.downcast_ref::<String>() {
                // Compare String
                if !compare_results(&result, expected_string, ${answerAnyOrder}) {
                    println!("Wrong answer: expected {:?}, got {:?}", expected_string, result);
                    std::process::exit(1);
                }
            } else if let Some(expected_bool) = expected_box.downcast_ref::<bool>() {
                // Compare bool
                if !compare_results(&result, expected_bool, ${answerAnyOrder}) {
                    println!("Wrong answer: expected {:?}, got {:?}", expected_bool, result);
                    std::process::exit(1);
                }
            } else {
                println!("Unsupported or unexpected type for expected value.");
                std::process::exit(1);
            }
        } else {
            print_result(&result);
        }
    }
}
`;
