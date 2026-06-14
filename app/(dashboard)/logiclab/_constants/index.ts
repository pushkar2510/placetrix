import { Language, IdeSettings } from "../_types";

export const LANGUAGES: Language[] = [
  { id: 62, name: "Java (OpenJDK 13)", value: "java", extension: "java" },
  { id: 71, name: "Python 3", value: "python", extension: "py" },
  {
    id: 63,
    name: "JavaScript (Node.js)",
    value: "javascript",
    extension: "js",
  },
  { id: 54, name: "C++ (GCC 9.2)", value: "cpp", extension: "cpp" },
];

export const DEFAULT_IDE_SETTINGS: IdeSettings = {
  fontSize: 13,
  wordWrap: "on",
  buttonPosition: "toolbar",
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/15 dark:border-emerald-500/20",
  Medium:
    "text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/15 dark:border-amber-500/20",
  Hard: "text-rose-600 dark:text-rose-400 bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/15 dark:border-rose-500/20",
};

export const CODE_TEMPLATES: Record<string, string> = {
  python: `# ==============================================================================
# LOGICLAB PLAYGROUND - PYTHON 3
# ==============================================================================
# This is a free programming sandbox where you can write, execute, and test code.
# 
# Features:
# 1. Custom Stdin: Type input into the 'Stdin Input' panel to read it here.
# 2. Resizable Layouts: Switch between Standard, Stacked, or Column layouts
#    using the layout button in the top right of the navbar.
# 3. Stopwatch: Track your speed with the 'Coding Time' timer.
# 4. Multi-language: Use the language selector in the editor toolbar.
# ==============================================================================

import sys

def main():
    print("Welcome to the LogicLab Playground!")
    print("-----------------------------------")
    print("How to use this Sandbox:")
    print("1. Write your code here in the editor.")
    print("2. Add optional inputs in the 'Stdin Input' panel.")
    print("3. Click the 'Run' button above or press Ctrl + ' to execute.")
    print("-----------------------------------")
    
    # Reading stdin inputs if any
    inputs = sys.stdin.read().strip()
    if inputs:
        print(f"Stdin Input received:\\n{inputs}")
    else:
        print("Tip: Provide stdin inputs in the Stdin panel to read them dynamically.")

if __name__ == "__main__":
    main()
`,
  javascript: `// ==============================================================================
// LOGICLAB PLAYGROUND - JAVASCRIPT
// ==============================================================================
// This is a free programming sandbox where you can write, execute, and test code.
// 
// Features:
// 1. Custom Stdin: Type input into the 'Stdin Input' panel to read it here.
// 2. Resizable Layouts: Switch between Standard, Stacked, or Column layouts
//    using the layout button in the top right of the navbar.
// 3. Stopwatch: Track your speed with the 'Coding Time' timer.
// 4. Multi-language: Use the language selector in the editor toolbar.
// ==============================================================================

const fs = require('fs');

function main() {
    console.log("Welcome to the LogicLab Playground!");
    console.log("-----------------------------------");
    console.log("How to use this Sandbox:");
    console.log("1. Write your code here in the editor.");
    console.log("2. Add optional inputs in the 'Stdin Input' panel.");
    console.log("3. Click the 'Run' button above or press Ctrl + ' to execute.");
    console.log("-----------------------------------");

    try {
        const stdin = fs.readFileSync(0, 'utf-8').trim();
        if (stdin) {
            console.log("Stdin Input received:\\n" + stdin);
        } else {
            console.log("Tip: Provide stdin inputs in the Stdin panel to read them dynamically.");
        }
    } catch (e) {
        console.log("Tip: Provide stdin inputs in the Stdin panel to read them dynamically.");
    }
}

main();
`,
  cpp: `// ==============================================================================
// LOGICLAB PLAYGROUND - C++
// ==============================================================================
// This is a free programming sandbox where you can write, execute, and test code.
// 
// Features:
// 1. Custom Stdin: Type input into the 'Stdin Input' panel to read it here.
// 2. Resizable Layouts: Switch between Standard, Stacked, or Column layouts
//    using the layout button in the top right of the navbar.
// 3. Stopwatch: Track your speed with the 'Coding Time' timer.
// 4. Multi-language: Use the language selector in the editor toolbar.
// ==============================================================================

#include <iostream>
#include <string>

using namespace std;

int main() {
    cout << "Welcome to the LogicLab Playground!" << endl;
    cout << "-----------------------------------" << endl;
    cout << "How to use this Sandbox:" << endl;
    cout << "1. Write your code here in the editor." << endl;
    cout << "2. Add optional inputs in the 'Stdin Input' panel." << endl;
    cout << "3. Click the 'Run' button above or press Ctrl + ' to execute." << endl;
    cout << "-----------------------------------" << endl;

    string line;
    bool hasInput = false;
    while (getline(cin, line)) {
        if (!hasInput) {
            cout << "Stdin Input received:" << endl;
            hasInput = true;
        }
        cout << line << endl;
    }

    if (!hasInput) {
        cout << "Tip: Provide stdin inputs in the Stdin panel to read them dynamically." << endl;
    }

    return 0;
}
`,
  java: `// ==============================================================================
// LOGICLAB PLAYGROUND - JAVA
// ==============================================================================
// This is a free programming sandbox where you can write, execute, and test code.
// 
// Features:
// 1. Custom Stdin: Type input into the 'Stdin Input' panel to read it here.
// 2. Resizable Layouts: Switch between Standard, Stacked, or Column layouts
//    using the layout button in the top right of the navbar.
// 3. Stopwatch: Track your speed with the 'Coding Time' timer.
// 4. Multi-language: Use the language selector in the editor toolbar.
// ==============================================================================

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to the LogicLab Playground!");
        System.out.println("-----------------------------------");
        System.out.println("How to use this Sandbox:");
        System.out.println("1. Write your code here in the editor.");
        System.out.println("2. Add optional inputs in the 'Stdin Input' panel.");
        System.out.println("3. Click the 'Run' button above or press Ctrl + ' to execute.");
        System.out.println("-----------------------------------");

        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextLine()) {
            System.out.println("Stdin Input received:");
            while (scanner.hasNextLine()) {
                System.out.println(scanner.nextLine());
            }
        } else {
            System.out.println("Tip: Provide stdin inputs in the Stdin panel to read them dynamically.");
        }
        scanner.close();
    }
}
`,
};
