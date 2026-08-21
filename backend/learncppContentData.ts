/**
 * LearnCpp.com Official Curriculum Content Dataset
 * Comprehensive modules and lessons covering Chapters 0-28 and Appendices
 */

export interface LearnCppLessonData {
  slug: string;
  title: string;
  summary: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  estimatedMinutes: number;
  learningObjectives: string[];
  blocks: Array<{
    blockType: "MARKDOWN" | "CODE" | "NOTE" | "QUIZ";
    content: any;
    language?: string;
  }>;
}

export interface LearnCppChapterData {
  slug: string;
  title: string;
  summary: string;
  orderIndex: number;
  estimatedMinutes: number;
  lessons: LearnCppLessonData[];
}

export const LEARNCPP_CHAPTERS_DATA: LearnCppChapterData[] = [
  // ==========================================
  // CHAPTER 0: Introduction & Getting Started
  // ==========================================
  {
    slug: "chapter-00-getting-started",
    title: "Chapter 0: Introduction & Getting Started",
    summary: "Understand programming languages, C++ history, compilers, linkers, IDE setup, and compiler configuration.",
    orderIndex: 1,
    estimatedMinutes: 60,
    lessons: [
      {
        slug: "0-1-introduction-to-cplusplus",
        title: "0.1 — Introduction to C/C++",
        summary: "What is C++, where did it come from, and why is it one of the most powerful languages today?",
        difficulty: "BEGINNER",
        estimatedMinutes: 15,
        learningObjectives: [
          "Understand the origins of C and Bjarne Stroustrup's creation of C++",
          "Understand design philosophy: zero-overhead abstractions and direct hardware control",
          "Understand where C++ is used: game development, operating systems, finance, embedded, and high-performance computing",
        ],
        blocks: [
          {
            blockType: "MARKDOWN",
            content: {
              markdown:
                "### The Philosophy of C++\n\nC++ was developed by **Bjarne Stroustrup** at Bell Labs starting in 1979 as an extension to the C language. His goal was to combine C's raw speed and hardware access with high-level object-oriented programming abstractions.\n\nKey design principles of C++ include:\n- **Zero-overhead principle**: What you don't use, you don't pay for. And what you do use, you couldn't hand code any better.\n- **Direct hardware mapping**: Types and operations map directly to CPU instructions and memory architectures.\n- **Portability and standards**: Governed by the ISO C++ standards committee (C++11, C++14, C++17, C++20, C++23).",
            },
          },
          {
            blockType: "NOTE",
            content: {
              markdown:
                "C++ is an evolving language. In modern C++ (C++11 through C++23), manual memory management is largely replaced with smart pointers, type deduction (`auto`), and standard container abstractions.",
            },
          },
          {
            blockType: "QUIZ",
            content: {
              question: "What is the 'Zero-Overhead Principle' in C++?",
              options: [
                "C++ programs use zero memory at runtime.",
                "Abstractions you don't use cost nothing, and abstractions you use are as fast as hand-written assembly.",
                "Compilers produce zero binary output if there are no errors.",
                "C++ requires zero third-party dependencies.",
              ],
              correctAnswerIndex: 1,
              explanation:
                "The zero-overhead principle means that language features and abstractions have zero runtime overhead if unused, and are as efficient as manual low-level implementations when used.",
            },
          },
        ],
      },
      {
        slug: "0-2-compilers-linkers-libraries",
        title: "0.2 — Compilers, Linkers, and Libraries",
        summary: "How source code (.cpp) is transformed into an executable binary through preprocessing, compilation, and linking.",
        difficulty: "BEGINNER",
        estimatedMinutes: 20,
        learningObjectives: [
          "Understand the 4 phases: Preprocessing, Compiling, Assembling, and Linking",
          "Understand the difference between compilation errors and linker errors (LNK / undefined reference)",
          "Learn how header files (.h/.hpp) and implementation files (.cpp) work together",
        ],
        blocks: [
          {
            blockType: "MARKDOWN",
            content: {
              markdown:
                "### The C++ Build Pipeline\n\n```\nSource Code (.cpp) \n      ↓ [Preprocessor: resolves #include, #define]\nPreprocessed Code\n      ↓ [Compiler: translates to machine instructions]\nObject Files (.o / .obj)\n      ↓ [Linker: resolves function definitions & standard libraries]\nExecutable Binary (.exe / a.out)\n```\n\n- **Compiler errors**: Occur when code violates syntax or type rules.\n- **Linker errors**: Occur when a declared symbol (like a function) cannot be found in any compiled object file or linked library.",
            },
          },
          {
            blockType: "CODE",
            content: {
              title: "Basic C++ Compilation from Terminal",
              code:
                "// Compile single file with warnings and C++20 standard\ng++ -std=c++20 -Wall -Wextra -O2 main.cpp -o main\n\n// Run executable\n./main",
            },
            language: "console",
          },
          {
            blockType: "NOTE",
            content: {
              markdown:
                "Always compile with `-Wall -Wextra -Wpedantic` (GCC/Clang) or `/W4` (MSVC) to catch bugs before runtime.",
            },
          },
        ],
      },
    ],
  },

  // ==========================================
  // CHAPTER 1: C++ Basics
  // ==========================================
  {
    slug: "chapter-01-cpp-basics",
    title: "Chapter 1: C++ Basics",
    summary: "Statements, variables, initialization forms, standard input/output (cout/cin), literals, and operators.",
    orderIndex: 2,
    estimatedMinutes: 75,
    lessons: [
      {
        slug: "1-1-structure-of-a-program",
        title: "1.1 — Statements and Structure of a Program",
        summary: "The main() entry point, statements, expressions, and standard namespace basics.",
        difficulty: "BEGINNER",
        estimatedMinutes: 15,
        learningObjectives: [
          "Write the standard `int main()` entry point",
          "Understand expression statements and semicolons",
          "Understand `std::cout` and `std::endl` / `\\n`",
        ],
        blocks: [
          {
            blockType: "MARKDOWN",
            content: {
              markdown:
                "### The Structure of a C++ Program\n\nEvery C++ executable program must contain exactly one `main()` function, which serves as the entry point for execution.",
            },
          },
          {
            blockType: "CODE",
            content: {
              title: "Hello World in Modern C++",
              code:
                "#include <iostream>\n\nint main() {\n    std::cout << \"Hello, DSA-Tracker!\\n\";\n    return 0; // 0 indicates successful execution\n}",
            },
            language: "cpp",
          },
          {
            blockType: "NOTE",
            content: {
              markdown:
                "**Best practice**: Prefer `\\n` over `std::endl` for newlines. `std::endl` causes an explicit buffer flush, which can degrade I/O performance significantly in competitive programming and large data transfers.",
            },
          },
          {
            blockType: "QUIZ",
            content: {
              question: "Why is '\\n' preferred over 'std::endl' in performance-critical code?",
              options: [
                "'\\n' takes less memory in the compiled binary.",
                "'std::endl' always forces a buffer flush (`std::flush`), slowing down I/O operations.",
                "'std::endl' is deprecated in modern C++20.",
                "'\\n' automatically converts integers to strings.",
              ],
              correctAnswerIndex: 1,
              explanation:
                "`std::endl` writes a newline AND explicitly flushes the output stream buffer. Using `\\n` allows the OS/runtime to buffer output efficiently.",
            },
          },
        ],
      },
      {
        slug: "1-2-variable-initialization",
        title: "1.2 — Variable Assignment and Direct List Initialization",
        summary: "Copy initialization, direct initialization, and modern uniform brace list initialization (C++11).",
        difficulty: "BEGINNER",
        estimatedMinutes: 20,
        learningObjectives: [
          "Understand uninitialized variables and undefined behavior",
          "Master uniform brace initialization `{}` (direct list initialization)",
          "Understand why brace initialization prevents narrowing conversions",
        ],
        blocks: [
          {
            blockType: "MARKDOWN",
            content: {
              markdown:
                "### Variable Initialization Forms in C++\n\nC++ provides four primary ways to initialize variables:\n\n```cpp\nint a;         // Uninitialized (holds indeterminate garbage value!)\nint b = 5;     // Copy initialization\nint c( 6 );    // Direct initialization (parentheses)\nint d { 7 };   // Direct list initialization / Brace initialization (Preferred!)\nint e {};      // Value initialization (initializes to 0 / default)\n```",
            },
          },
          {
            blockType: "CODE",
            content: {
              title: "Brace Initialization Prevents Narrowing Bugs",
              code:
                "int w1 = 4.5;    // Compiles! Truncates to 4 silently (bug prone)\n// int w2 { 4.5 }; // COMPILER ERROR! Narrowing conversion from double to int prevented",
            },
            language: "cpp",
          },
          {
            blockType: "NOTE",
            content: {
              markdown:
                "**Best Practice**: Always initialize your variables upon definition. Use brace initialization `{}` by default because it disallows dangerous implicit narrowing conversions.",
            },
          },
        ],
      },
    ],
  },

  // ==========================================
  // CHAPTER 2: Functions and Files
  // ==========================================
  {
    slug: "chapter-02-functions-and-files",
    title: "Chapter 2: Functions and Files",
    summary: "Functions, return values, parameters, local scope, forward declarations, header files, and header guards.",
    orderIndex: 3,
    estimatedMinutes: 80,
    lessons: [
      {
        slug: "2-1-function-parameters-and-scope",
        title: "2.1 — Function Parameters, Return Values, and Scope",
        summary: "Pass by value mechanics, local variable lifetimes, and modular code design.",
        difficulty: "BEGINNER",
        estimatedMinutes: 20,
        learningObjectives: [
          "Define user functions with return types and parameters",
          "Understand automatic storage duration (stack allocation and destruction)",
          "Understand early returns and function composition",
        ],
        blocks: [
          {
            blockType: "CODE",
            content: {
              title: "Clean Function Example",
              code:
                "#include <iostream>\n\nint add(int x, int y) {\n    return x + y;\n}\n\nint main() {\n    std::cout << \"Sum: \" << add(5, 3) << '\\n';\n    return 0;\n}",
            },
            language: "cpp",
          },
        ],
      },
      {
        slug: "2-2-headers-and-guards",
        title: "2.2 — Header Files, Header Guards, and #pragma once",
        summary: "Splitting code across multiple files, forward declarations, and preventing duplicate definitions.",
        difficulty: "BEGINNER",
        estimatedMinutes: 25,
        learningObjectives: [
          "Understand `#include \"header.h\"` vs `#include <header>`",
          "Write header guards using `#ifndef`, `#define`, `#endif` and `#pragma once`",
          "Follow the One Definition Rule (ODR)",
        ],
        blocks: [
          {
            blockType: "CODE",
            content: {
              title: "math_utils.h (Header Guard Pattern)",
              code:
                "#pragma once\n// Or traditional include guards:\n// #ifndef MATH_UTILS_H\n// #define MATH_UTILS_H\n\nint add(int a, int b);\nint multiply(int a, int b);\n\n// #endif",
            },
            language: "cpp",
          },
        ],
      },
    ],
  },

  // ==========================================
  // CHAPTER 4: Fundamental Data Types
  // ==========================================
  {
    slug: "chapter-04-fundamental-types",
    title: "Chapter 4: Fundamental Data Types",
    summary: "Signed and unsigned integers, fixed-width types (cstdint), floating point, boolean, and sizeof.",
    orderIndex: 4,
    estimatedMinutes: 70,
    lessons: [
      {
        slug: "4-1-integers-and-size-t",
        title: "4.1 — Fixed-Width Integers and size_t",
        summary: "Why standard `int` size varies across architectures and why `<cstdint>` (int32_t, int64_t) is essential.",
        difficulty: "BEGINNER",
        estimatedMinutes: 20,
        learningObjectives: [
          "Understand `std::int32_t`, `std::int64_t`, and `std::uint64_t`",
          "Understand `std::size_t` for indexing and array sizes",
          "Avoid unsigned integer underflow bugs in loop decrements",
        ],
        blocks: [
          {
            blockType: "CODE",
            content: {
              title: "Fixed-Width Types from <cstdint>",
              code:
                "#include <iostream>\n#include <cstdint> // for int64_t, size_t\n\nint main() {\n    std::int64_t largeValue { 9'000'000'000'000'000'000LL };\n    std::size_t arrayLength { 100 };\n    \n    std::cout << \"Bytes: \" << sizeof(largeValue) << '\\n'; // Always 8 bytes\n    return 0;\n}",
            },
            language: "cpp",
          },
          {
            blockType: "NOTE",
            content: {
              markdown:
                "**Warning**: Avoid using `unsigned int` for arithmetic or loop counters because subtracting past zero triggers wrap-around underflow (`0u - 1u == 4294967295u`), creating infinite loops.",
            },
          },
        ],
      },
    ],
  },

  // ==========================================
  // CHAPTER 12: References and Pointers
  // ==========================================
  {
    slug: "chapter-12-references-and-pointers",
    title: "Chapter 12: References and Pointers",
    summary: "Lvalue references, pass by const reference, memory addresses, pointer dereferencing, and nullptr.",
    orderIndex: 5,
    estimatedMinutes: 90,
    lessons: [
      {
        slug: "12-1-pass-by-const-reference",
        title: "12.1 — Lvalue References and Pass-by-Const-Reference",
        summary: "Eliminate expensive copies for large structs, strings, and vectors in function parameters.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 25,
        learningObjectives: [
          "Understand aliases vs copies",
          "Master `const std::string&` and `const std::vector<int>&` parameter passing",
          "Know when to pass by value (primitives) vs pass by const reference (objects/containers)",
        ],
        blocks: [
          {
            blockType: "CODE",
            content: {
              title: "Pass by Const Reference Pattern",
              code:
                "#include <iostream>\n#include <string>\n#include <vector>\n\n// Fast: Zero copy overhead\nvoid printArray(const std::vector<int>& arr) {\n    for (int val : arr) {\n        std::cout << val << ' ';\n    }\n    std::cout << '\\n';\n}\n\nint main() {\n    std::vector<int> numbers { 1, 2, 3, 4, 5 };\n    printArray(numbers);\n    return 0;\n}",
            },
            language: "cpp",
          },
          {
            blockType: "NOTE",
            content: {
              markdown:
                "**Rule of Thumb**: Pass fundamental types (`int`, `double`, `char`, `bool`) by value. Pass compound types (`std::string`, `std::vector`, user classes) by `const &` to avoid allocation and copying.",
            },
          },
        ],
      },
      {
        slug: "12-2-pointers-and-nullptr",
        title: "12.2 — Pointers, Address-Of (&), Dereference (*), and nullptr",
        summary: "Memory address mechanics, pointer arithmetic, and safe null checks.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 30,
        learningObjectives: [
          "Understand the address-of operator `&` and dereference operator `*`",
          "Always initialize pointers to a valid address or `nullptr`",
          "Understand pointer reassignment vs value modification",
        ],
        blocks: [
          {
            blockType: "CODE",
            content: {
              title: "Pointers and Nullptr Safety",
              code:
                "#include <iostream>\n\nint main() {\n    int val { 42 };\n    int* ptr { &val }; // Pointer holding memory address of val\n\n    std::cout << \"Address: \" << ptr << '\\n';\n    std::cout << \"Value: \" << *ptr << '\\n'; // Dereference\n\n    *ptr = 99; // Modifies val directly\n    std::cout << \"Updated val: \" << val << '\\n'; // 99\n\n    int* nullPtr { nullptr };\n    if (nullPtr != nullptr) {\n        std::cout << *nullPtr;\n    }\n    return 0;\n}",
            },
            language: "cpp",
          },
        ],
      },
    ],
  },

  // ==========================================
  // CHAPTER 14 & 15: Classes & OOP
  // ==========================================
  {
    slug: "chapter-14-classes-and-oop",
    title: "Chapter 14: Introduction to Classes & Encapsulation",
    summary: "Object-oriented programming, member variables, member functions, access specifiers (public/private), and getters/setters.",
    orderIndex: 6,
    estimatedMinutes: 90,
    lessons: [
      {
        slug: "14-1-classes-and-encapsulation",
        title: "14.1 — Classes, Access Specifiers, and Invariants",
        summary: "Create custom types with encapsulated state and member functions.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 30,
        learningObjectives: [
          "Understand `class` vs `struct` (default private vs public access)",
          "Protect object invariants via private members",
          "Write const member functions that do not mutate state",
        ],
        blocks: [
          {
            blockType: "CODE",
            content: {
              title: "Encapsulated Point2D Class",
              code:
                "#include <iostream>\n\nclass Point2D {\nprivate:\n    double m_x { 0.0 };\n    double m_y { 0.0 };\n\npublic:\n    Point2D() = default;\n    Point2D(double x, double y) : m_x{x}, m_y{y} {}\n\n    // Const member function: guarantees no mutation of object\n    double getX() const { return m_x; }\n    double getY() const { return m_y; }\n\n    void moveBy(double dx, double dy) {\n        m_x += dx;\n        m_y += dy;\n    }\n};\n\nint main() {\n    Point2D p { 3.0, 4.0 };\n    p.moveBy(1.0, -2.0);\n    std::cout << \"Point: (\" << p.getX() << \", \" << p.getY() << \")\\n\";\n    return 0;\n}",
            },
            language: "cpp",
          },
        ],
      },
    ],
  },

  // ==========================================
  // CHAPTER 16: Dynamic Arrays (std::vector)
  // ==========================================
  {
    slug: "chapter-16-std-vector",
    title: "Chapter 16: Dynamic Arrays — std::vector",
    summary: "Dynamic memory arrays, vector indexing, push_back/emplace_back, capacity vs size, and iteration patterns.",
    orderIndex: 7,
    estimatedMinutes: 80,
    lessons: [
      {
        slug: "16-1-vector-operations-and-capacity",
        title: "16.1 — std::vector Operations, Memory Allocation, and Reserve",
        summary: "Deep dive into how std::vector dynamically doubles capacity and how std::vector::reserve avoids reallocations.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 25,
        learningObjectives: [
          "Understand dynamic contiguous heap allocation in std::vector",
          "Differentiate `size()` (elements present) from `capacity()` (memory allocated)",
          "Use `reserve()` to optimize allocations in linear algorithms",
        ],
        blocks: [
          {
            blockType: "CODE",
            content: {
              title: "std::vector Reserve and Growth",
              code:
                "#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> vec;\n    vec.reserve(1000); // Pre-allocates memory for 1000 items (0 reallocations!)\n\n    for (int i = 0; i < 1000; ++i) {\n        vec.push_back(i * 2);\n    }\n\n    std::cout << \"Size: \" << vec.size() << \", Capacity: \" << vec.capacity() << '\\n';\n    return 0;\n}",
            },
            language: "cpp",
          },
        ],
      },
    ],
  },

  // ==========================================
  // CHAPTER 22: Smart Pointers & Move Semantics
  // ==========================================
  {
    slug: "chapter-22-smart-pointers",
    title: "Chapter 22: Move Semantics & Smart Pointers",
    summary: "RAII, std::unique_ptr, std::shared_ptr, std::make_unique, and eliminating memory leaks forever.",
    orderIndex: 8,
    estimatedMinutes: 85,
    lessons: [
      {
        slug: "22-1-unique-ptr-and-raii",
        title: "22.1 — Resource Acquisition Is Initialization (RAII) & std::unique_ptr",
        summary: "How modern C++ manages memory automatically without manual `delete`.",
        difficulty: "ADVANCED",
        estimatedMinutes: 30,
        learningObjectives: [
          "Understand RAII: deterministic resource destruction when going out of scope",
          "Master `std::unique_ptr` and `std::make_unique`",
          "Understand move semantics with `std::move`",
        ],
        blocks: [
          {
            blockType: "CODE",
            content: {
              title: "Zero-Leak Smart Pointers with std::make_unique",
              code:
                "#include <iostream>\n#include <memory> // for std::unique_ptr, std::make_unique\n\nclass Resource {\npublic:\n    Resource() { std::cout << \"Resource acquired\\n\"; }\n    ~Resource() { std::cout << \"Resource destroyed (Auto RAII!)\\n\"; }\n    void doWork() { std::cout << \"Working...\\n\"; }\n};\n\nvoid process() {\n    // Automatically freed when function exits, even if exceptions occur!\n    auto res = std::make_unique<Resource>();\n    res->doWork();\n}\n\nint main() {\n    process();\n    return 0;\n}",
            },
            language: "cpp",
          },
        ],
      },
    ],
  },

  // ==========================================
  // CHAPTER 26: Templates and Generic Programming
  // ==========================================
  {
    slug: "chapter-26-templates",
    title: "Chapter 26: Templates and Generic Programming",
    summary: "Function templates, class templates, template type deduction, and generic algorithms.",
    orderIndex: 9,
    estimatedMinutes: 80,
    lessons: [
      {
        slug: "26-1-function-templates",
        title: "26.1 — Function Templates and Type Deductions",
        summary: "Write type-agnostic algorithms that the compiler instantiates efficiently at compile time.",
        difficulty: "ADVANCED",
        estimatedMinutes: 25,
        learningObjectives: [
          "Define generic functions with `template <typename T>`",
          "Understand compile-time instantiation and zero-runtime penalty",
          "Combine templates with standard containers",
        ],
        blocks: [
          {
            blockType: "CODE",
            content: {
              title: "Generic Swap and Min Templates",
              code:
                "#include <iostream>\n#include <string>\n\ntemplate <typename T>\nT myMax(T a, T b) {\n    return (a > b) ? a : b;\n}\n\nint main() {\n    std::cout << myMax(10, 20) << '\\n';       // Instantiates myMax<int>\n    std::cout << myMax(3.14, 2.71) << '\\n';   // Instantiates myMax<double>\n    std::cout << myMax(std::string(\"apple\"), std::string(\"zebra\")) << '\\n';\n    return 0;\n}",
            },
            language: "cpp",
          },
        ],
      },
    ],
  },
];
