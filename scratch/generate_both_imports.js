const fs = require('fs');
const path = require('path');

// ── METHOD NAME GENERATOR ──
function getMethodName(title) {
  let cleanTitle = title.replace(/\([^)]*\)/g, ''); // remove parentheses contents
  cleanTitle = cleanTitle.replace(/[^a-zA-Z0-9\s]/g, ''); // keep only alpha-numeric
  const words = cleanTitle.trim().split(/\s+/);
  if (words.length === 0 || words[0] === '') return 'solve';
  
  let method = words[0].toLowerCase();
  for (let i = 1; i < words.length; i++) {
    method += words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
  }
  return method;
}

// ── DYNAMIC BOILERPLATE GENERATOR ──
function generateBoilerplates(methodName) {
  return {
    "71": `from typing import List\n\nclass Solution:\n    def ${methodName}(self, nums: List[int]) -> int:\n        # Write your code here\n        pass\n`,
    "63": `class Solution {\n    ${methodName}(nums) {\n        // Write your code here\n    }\n}\nmodule.exports = Solution;\n`,
    "54": `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int ${methodName}(vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};\n`,
    "62": `class Solution {\n    public int ${methodName}(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}\n`
  };
}

// ── DYNAMIC DRIVER CODE GENERATOR ──
function generateDriverCodes(methodName) {
  return {
    "71": `# === Driver Code (hidden from student) ===\nimport sys, json\nif __name__ == "__main__":\n    input_data = sys.stdin.read().strip().splitlines()\n    nums = json.loads(input_data[0]) if input_data else []\n    sol = Solution()\n    result = sol.${methodName}(nums)\n    print(json.dumps(result))\n`,
    "63": `// === Driver Code (hidden from student) ===\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nconst nums = JSON.parse(input[0] || '[]');\nconst sol = new Solution();\nconst result = sol.${methodName}(nums);\nconsole.log(JSON.stringify(result));\n`,
    "54": `// === Driver Code (hidden from student) ===\n#include <iostream>\n#include <sstream>\nint main() {\n    string line;\n    getline(cin, line);\n    // Parse JSON array from stdin\n    vector<int> nums;\n    stringstream ss(line.substr(1, line.size()-2));\n    string token;\n    while(getline(ss, token, ',')) nums.push_back(stoi(token));\n    Solution sol;\n    cout << sol.${methodName}(nums) << endl;\n    return 0;\n}\n`,
    "62": `// === Driver Code (hidden from student) ===\nimport java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String line = sc.nextLine().trim();\n        line = line.substring(1, line.length()-1);\n        String[] parts = line.isEmpty() ? new String[0] : line.split(",");\n        int[] nums = new int[parts.length];\n        for(int i=0;i<parts.length;i++) nums[i]=Integer.parseInt(parts[i].trim());\n        Solution sol = new Solution();\n        System.out.println(sol.${methodName}(nums));\n    }\n}\n`
  };
}

// ── ESCAPE CSV HELPER ──
function escapeCSVCell(value) {
  if (value === null || value === undefined) return '';
  const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

// 1. UPDATE JSON PROBLEMS FILE (problems_import.json)
const jsonPath = path.join(__dirname, '..', 'problems_import.json');
let rawJsonProblems = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const updatedJsonProblems = rawJsonProblems.map(p => {
  const methodName = getMethodName(p.title);
  return {
    title: p.title,
    description: p.description,
    difficulty: p.difficulty,
    tags: p.tags,
    time_limit: p.time_limit,
    memory_limit: p.memory_limit,
    boilerplates: generateBoilerplates(methodName),
    driver_codes: generateDriverCodes(methodName),
    test_cases: p.test_cases
  };
});

fs.writeFileSync(jsonPath, JSON.stringify(updatedJsonProblems, null, 2), 'utf8');
console.log('Successfully updated problems_import.json with dynamic method names.');

// 2. DEFINE AND GENERATE DIFFERENT CSV PROBLEMS FILE (problems_import.csv)
const csvProblems = [
  {
    title: "Contains Duplicate",
    description: "Given an integer array `nums`, return `1` if any value appears at least twice in the array, and return `0` if every element is distinct.\n\n### Example\n- **Input:** `nums = [1,2,3,1]`\n- **Output:** `1`\n- **Explanation:** `1` appears twice.",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    time_limit: 1.5,
    memory_limit: 128,
    test_cases: [
      { input: "[1,2,3,1]\n", expected_output: "1", is_sample: true },
      { input: "[1,2,3,4]\n", expected_output: "0", is_sample: true },
      { input: "[1]\n", expected_output: "0", is_sample: false },
      { input: "[1,1]\n", expected_output: "1", is_sample: false },
      { input: "[2,14,18,22,22]\n", expected_output: "1", is_sample: false },
      { input: "[-1,-2,-3,-4,0]\n", expected_output: "0", is_sample: false },
      { input: "[3,3,3,3]\n", expected_output: "1", is_sample: false },
      { input: "[1,2,3,4,5,6,7,8,9,10]\n", expected_output: "0", is_sample: false },
      { input: "[10,9,8,7,6,5,4,3,2,10]\n", expected_output: "1", is_sample: false },
      { input: "[-100,100,200,-100]\n", expected_output: "1", is_sample: false }
    ]
  },
  {
    title: "Missing Number",
    description: "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.\n\n### Example\n- **Input:** `nums = [3,0,1]`\n- **Output:** `2`",
    difficulty: "Easy",
    tags: ["Array", "Math", "Bit Manipulation"],
    time_limit: 1.5,
    memory_limit: 128,
    test_cases: [
      { input: "[3,0,1]\n", expected_output: "2", is_sample: true },
      { input: "[0,1]\n", expected_output: "2", is_sample: true },
      { input: "[9,6,4,2,3,5,7,0,1]\n", expected_output: "8", is_sample: false },
      { input: "[0]\n", expected_output: "1", is_sample: false },
      { input: "[1]\n", expected_output: "0", is_sample: false },
      { input: "[1,2]\n", expected_output: "0", is_sample: false },
      { input: "[0,2]\n", expected_output: "1", is_sample: false },
      { input: "[0,3,2]\n", expected_output: "1", is_sample: false },
      { input: "[5,0,3,4,1]\n", expected_output: "2", is_sample: false },
      { input: "[6,4,3,2,5,0,1]\n", expected_output: "7", is_sample: false }
    ]
  },
  {
    title: "Best Time to Buy and Sell Stock",
    description: "Given an array `nums` representing stock prices where `nums[i]` is the price of a given stock on the `i`-th day, return the maximum profit you can achieve by buying on one day and selling on a future day. If you cannot achieve any profit, return `0`.\n\n### Example\n- **Input:** `nums = [7,1,5,3,6,4]`\n- **Output:** `5`\n- **Explanation:** Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.",
    difficulty: "Easy",
    tags: ["Array", "Dynamic Programming"],
    time_limit: 2.0,
    memory_limit: 256,
    test_cases: [
      { input: "[7,1,5,3,6,4]\n", expected_output: "5", is_sample: true },
      { input: "[7,6,4,3,1]\n", expected_output: "0", is_sample: true },
      { input: "[1,2]\n", expected_output: "1", is_sample: false },
      { input: "[2,1]\n", expected_output: "0", is_sample: false },
      { input: "[3,3,3,3]\n", expected_output: "0", is_sample: false },
      { input: "[1,2,3,4,5]\n", expected_output: "4", is_sample: false },
      { input: "[5,4,3,2,1]\n", expected_output: "0", is_sample: false },
      { input: "[2,4,1,5,0,6]\n", expected_output: "6", is_sample: false },
      { input: "[10,15,8,12,7,11]\n", expected_output: "5", is_sample: false },
      { input: "[3,8,1,2]\n", expected_output: "5", is_sample: false }
    ]
  },
  {
    title: "Third Maximum Number",
    description: "Given an integer array `nums`, return the third distinct maximum number in this array. If the third maximum does not exist, return the maximum number.\n\n### Example\n- **Input:** `nums = [3,2,1]`\n- **Output:** `1`\n- **Explanation:** The distinct maximums are 3, 2, and 1.",
    difficulty: "Easy",
    tags: ["Array", "Sorting"],
    time_limit: 1.5,
    memory_limit: 128,
    test_cases: [
      { input: "[3,2,1]\n", expected_output: "1", is_sample: true },
      { input: "[1,2]\n", expected_output: "2", is_sample: true },
      { input: "[2,2,3,1]\n", expected_output: "1", is_sample: false },
      { input: "[1]\n", expected_output: "1", is_sample: false },
      { input: "[1,2,2,5,3,5]\n", expected_output: "2", is_sample: false },
      { input: "[-1,2,-3,1,0]\n", expected_output: "-1", is_sample: false },
      { input: "[5,6,7,8]\n", expected_output: "6", is_sample: false },
      { input: "[10,10,10]\n", expected_output: "10", is_sample: false },
      { input: "[1,1,2,2]\n", expected_output: "2", is_sample: false },
      { input: "[1,2,3,4,5,6,7,8,9,10]\n", expected_output: "8", is_sample: false }
    ]
  },
  {
    title: "Maximum Product of Three Numbers",
    description: "Given an integer array `nums`, find three numbers whose product is maximum and return the maximum product.\n\n### Example\n- **Input:** `nums = [1,2,3]`\n- **Output:** `6`",
    difficulty: "Easy",
    tags: ["Array", "Math", "Sorting"],
    time_limit: 1.5,
    memory_limit: 128,
    test_cases: [
      { input: "[1,2,3]\n", expected_output: "6", is_sample: true },
      { input: "[1,2,3,4]\n", expected_output: "24", is_sample: true },
      { input: "[-1,-2,-3,4]\n", expected_output: "24", is_sample: false },
      { input: "[-10,-10,5,2]\n", expected_output: "500", is_sample: false },
      { input: "[-1,-2,-3,-4]\n", expected_output: "-6", is_sample: false },
      { input: "[0,0,0,4]\n", expected_output: "0", is_sample: false },
      { input: "[-1,0,1,2]\n", expected_output: "0", is_sample: false },
      { input: "[7,3,2,1,8]\n", expected_output: "168", is_sample: false },
      { input: "[-5,-6,1,2,3]\n", expected_output: "90", is_sample: false },
      { input: "[-100,-98,1,2,3,4]\n", expected_output: "39200", is_sample: false }
    ]
  },
  {
    title: "Find Minimum in Rotated Sorted Array",
    description: "Suppose an array of length `n` sorted in ascending order is rotated between `1` and `n` times. For example, the array `nums = [0,1,2,4,5,6,7]` might become `[4,5,6,7,0,1,2]`.\n\nGiven the sorted rotated array `nums`, return the minimum element of this array.\n\n### Example\n- **Input:** `nums = [3,4,5,1,2]`\n- **Output:** `1`",
    difficulty: "Medium",
    tags: ["Array", "Binary Search"],
    time_limit: 2.0,
    memory_limit: 256,
    test_cases: [
      { input: "[3,4,5,1,2]\n", expected_output: "1", is_sample: true },
      { input: "[4,5,6,7,0,1,2]\n", expected_output: "0", is_sample: true },
      { input: "[11,13,15,17]\n", expected_output: "11", is_sample: false },
      { input: "[2,1]\n", expected_output: "1", is_sample: false },
      { input: "[1]\n", expected_output: "1", is_sample: false },
      { input: "[5,1,2,3,4]\n", expected_output: "1", is_sample: false },
      { input: "[2,3,4,5,1]\n", expected_output: "1", is_sample: false },
      { input: "[10,20,30,40,5,6,7,8,9]\n", expected_output: "5", is_sample: false },
      { input: "[-5,-4,-3,-2,-6]\n", expected_output: "-6", is_sample: false },
      { input: "[9,10,1,2,3,4,5,6,7,8]\n", expected_output: "1", is_sample: false }
    ]
  },
  {
    title: "Find Peak Element",
    description: "A peak element is an element that is strictly greater than its neighbors.\n\nGiven an integer array `nums`, find a peak element, and return its index. If the array contains multiple peaks, return the index to any of the peaks.\n\n### Example\n- **Input:** `nums = [1,2,3,1]`\n- **Output:** `2`\n- **Explanation:** 3 is a peak element and your function should return the index number 2.",
    difficulty: "Medium",
    tags: ["Array", "Binary Search"],
    time_limit: 2.0,
    memory_limit: 256,
    test_cases: [
      { input: "[1,2,3,1]\n", expected_output: "2", is_sample: true },
      { input: "[1,2]\n", expected_output: "1", is_sample: true },
      { input: "[2,1]\n", expected_output: "0", is_sample: false },
      { input: "[1]\n", expected_output: "0", is_sample: false },
      { input: "[1,3,2,1]\n", expected_output: "1", is_sample: false },
      { input: "[1,2,3,4,5,4]\n", expected_output: "4", is_sample: false },
      { input: "[1,5,2,1,0]\n", expected_output: "1", is_sample: false },
      { input: "[10,20,30,40,50,40]\n", expected_output: "4", is_sample: false },
      { input: "[1,2,3,4,5]\n", expected_output: "4", is_sample: false },
      { input: "[5,4,3,2,1]\n", expected_output: "0", is_sample: false }
    ]
  },
  {
    title: "Container With Most Water",
    description: "Given an integer array `nums` of length `n` representing heights of lines, find two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.\n\n### Example\n- **Input:** `nums = [1,8,6,2,5,4,8,3,7]`\n- **Output:** `49`",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers"],
    time_limit: 2.0,
    memory_limit: 256,
    test_cases: [
      { input: "[1,8,6,2,5,4,8,3,7]\n", expected_output: "49", is_sample: true },
      { input: "[1,1]\n", expected_output: "1", is_sample: true },
      { input: "[4,3,2,1,4]\n", expected_output: "16", is_sample: false },
      { input: "[1,2,1]\n", expected_output: "2", is_sample: false },
      { input: "[1,2,4,3]\n", expected_output: "4", is_sample: false },
      { input: "[3,9,3,4,7,2,12,6]\n", expected_output: "35", is_sample: false },
      { input: "[0,2]\n", expected_output: "0", is_sample: false },
      { input: "[2,3,4,5,18,17,6]\n", expected_output: "17", is_sample: false },
      { input: "[10,9,8,7,6,5,4,3,2,1]\n", expected_output: "25", is_sample: false },
      { input: "[1,3,2,5,25,24,5]\n", expected_output: "24", is_sample: false }
    ]
  },
  {
    title: "Longest Consecutive Sequence",
    description: "Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence.\n\n### Example\n- **Input:** `nums = [100,4,200,1,3,2]`\n- **Output:** `4`\n- **Explanation:** The longest consecutive elements sequence is `[1, 2, 3, 4]`. Therefore its length is 4.",
    difficulty: "Medium",
    tags: ["Array", "Hash Table", "Union Find"],
    time_limit: 2.0,
    memory_limit: 256,
    test_cases: [
      { input: "[100,4,200,1,3,2]\n", expected_output: "4", is_sample: true },
      { input: "[0,3,7,2,5,8,4,6,0,1]\n", expected_output: "9", is_sample: true },
      { input: "[]\n", expected_output: "0", is_sample: false },
      { input: "[1]\n", expected_output: "1", is_sample: false },
      { input: "[2,2,2]\n", expected_output: "1", is_sample: false },
      { input: "[-1,9,0,8,-2,7,1]\n", expected_output: "4", is_sample: false },
      { input: "[5,4,3,2,1]\n", expected_output: "5", is_sample: false },
      { input: "[1,10,2,20,3,30,4,40]\n", expected_output: "4", is_sample: false },
      { input: "[100,102,104,106]\n", expected_output: "1", is_sample: false },
      { input: "[-5,-4,-3,-2,-1,0,1,2,3,4]\n", expected_output: "10", is_sample: false }
    ]
  },
  {
    title: "Trapping Rain Water",
    description: "Given `n` non-negative integers representing an elevation map `nums` where the width of each bar is 1, compute how much water it can trap after raining.\n\n### Example\n- **Input:** `nums = [0,1,0,2,1,0,1,3,2,1,2,1]`\n- **Output:** `6`",
    difficulty: "Hard",
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack"],
    time_limit: 3.0,
    memory_limit: 512,
    test_cases: [
      { input: "[0,1,0,2,1,0,1,3,2,1,2,1]\n", expected_output: "6", is_sample: true },
      { input: "[4,2,0,3,2,5]\n", expected_output: "9", is_sample: true },
      { input: "[]\n", expected_output: "0", is_sample: false },
      { input: "[3]\n", expected_output: "0", is_sample: false },
      { input: "[3,0,3]\n", expected_output: "3", is_sample: false },
      { input: "[1,2,3,4,5]\n", expected_output: "0", is_sample: false },
      { input: "[5,4,3,2,1]\n", expected_output: "0", is_sample: false },
      { input: "[0,2,0,3,1,0,1,3,2,1]\n", expected_output: "5", is_sample: false },
      { input: "[2,0,2]\n", expected_output: "2", is_sample: false },
      { input: "[5,2,1,2,1,5]\n", expected_output: "14", is_sample: false }
    ]
  }
];

const headers = ['title', 'description', 'difficulty', 'tags', 'time_limit', 'memory_limit', 'boilerplates', 'driver_codes', 'test_cases'];
const csvRows = [headers.join(',')];

for (const p of csvProblems) {
  const methodName = getMethodName(p.title);
  const boilerplates = generateBoilerplates(methodName);
  const driverCodes = generateDriverCodes(methodName);
  
  const row = [
    escapeCSVCell(p.title),
    escapeCSVCell(p.description),
    escapeCSVCell(p.difficulty),
    escapeCSVCell(p.tags.join(';')),
    escapeCSVCell(p.time_limit),
    escapeCSVCell(p.memory_limit),
    escapeCSVCell(boilerplates),
    escapeCSVCell(driverCodes),
    escapeCSVCell(p.test_cases)
  ];
  csvRows.push(row.join(','));
}

const csvPath = path.join(__dirname, '..', 'problems_import.csv');
fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');
console.log('Successfully generated different problems_import.csv with dynamic method names.');
