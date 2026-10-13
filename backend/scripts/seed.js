const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const Question = require("../models/Question");

const sampleQuestions = [
  // --- PROGRAMMING ---
  {
    question: "Which data structure follows the First In, First Out (FIFO) principle?",
    options: ["Stack", "Queue", "Binary Tree", "Hash Table"],
    correctAnswer: 1,
    category: "Programming",
    difficulty: "Easy",
    explanation: "A Queue operates on the FIFO (First In, First Out) principle, where the first element added is the first one removed."
  },
  {
    question: "Which HTTP status code signifies that a resource was successfully created?",
    options: ["200 OK", "201 Created", "204 No Content", "301 Moved Permanently"],
    correctAnswer: 1,
    category: "Programming",
    difficulty: "Easy",
    explanation: "HTTP 201 Created indicates that the request has succeeded and led to the creation of a new resource."
  },
  {
    question: "What is the average time complexity of searching an element in a balanced Binary Search Tree (BST)?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
    correctAnswer: 2,
    category: "Programming",
    difficulty: "Medium",
    explanation: "In a balanced BST, each comparison cuts the search space in half, resulting in O(log n) average time complexity."
  },
  {
    question: "Which design pattern ensures that a class has only one instance and provides a global point of access to it?",
    options: ["Factory Pattern", "Singleton Pattern", "Observer Pattern", "Adapter Pattern"],
    correctAnswer: 1,
    category: "Programming",
    difficulty: "Medium",
    explanation: "The Singleton Pattern restricts instantiation of a class to a single object."
  },
  {
    question: "Which sorting algorithm has a worst-case time complexity of O(n log n) and is guaranteed to be stable?",
    options: ["Quick Sort", "Heap Sort", "Merge Sort", "Bubble Sort"],
    correctAnswer: 2,
    category: "Programming",
    difficulty: "Hard",
    explanation: "Merge Sort guarantees O(n log n) time complexity in all cases (worst, best, average) and maintains stability."
  },
  {
    question: "In the OSI model, at which layer do IP addresses and routers operate?",
    options: ["Data Link Layer", "Network Layer", "Transport Layer", "Session Layer"],
    correctAnswer: 1,
    category: "Programming",
    difficulty: "Hard",
    explanation: "The Network Layer (Layer 3) handles logical addressing (IPv4/IPv6) and path determination (routing)."
  },
  {
    question: "What does the 'S' stand for in the SOLID design principles?",
    options: ["Single Responsibility", "State Management", "Structured Typing", "System Isolation"],
    correctAnswer: 0,
    category: "Programming",
    difficulty: "Easy",
    explanation: "The Single Responsibility Principle states that a class should have one, and only one, reason to change."
  },

  // --- JAVA ---
  {
    question: "Which component of the Java platform is responsible for converting bytecode into machine code at runtime?",
    options: ["JDK", "JRE", "JIT Compiler", "JavaDoc"],
    correctAnswer: 2,
    category: "Java",
    difficulty: "Easy",
    explanation: "The Just-In-Time (JIT) compiler inside the JVM compiles bytecode into native machine instructions at runtime."
  },
  {
    question: "Which keyword in Java prevents a class from being inherited and a method from being overridden?",
    options: ["static", "final", "abstract", "synchronized"],
    correctAnswer: 1,
    category: "Java",
    difficulty: "Easy",
    explanation: "In Java, marking a class as 'final' prevents inheritance, and marking a method as 'final' prevents overriding."
  },
  {
    question: "Which collection in Java maintains insertion order and allows duplicate elements?",
    options: ["HashSet", "TreeSet", "ArrayList", "HashMap"],
    correctAnswer: 2,
    category: "Java",
    difficulty: "Medium",
    explanation: "ArrayList is an ordered list collection that preserves insertion order and allows duplicates."
  },
  {
    question: "What is the size of a primitive 'float' data type in Java?",
    options: ["16 bits", "32 bits", "64 bits", "128 bits"],
    correctAnswer: 1,
    category: "Java",
    difficulty: "Medium",
    explanation: "In Java, a float is a single-precision 32-bit IEEE 754 floating point."
  },
  {
    question: "What happens when you invoke the wait() method on an object without holding its monitor lock in Java?",
    options: [
      "The thread blocks indefinitely",
      "IllegalMonitorStateException is thrown",
      "NullPointerException is thrown",
      "The method succeeds silently"
    ],
    correctAnswer: 1,
    category: "Java",
    difficulty: "Hard",
    explanation: "Calling wait() outside of a synchronized block or method throws java.lang.IllegalMonitorStateException."
  },
  {
    question: "Which Garbage Collector was introduced as the default GC starting from Java 9?",
    options: ["Serial GC", "Parallel GC", "G1 (Garbage-First) GC", "ZGC"],
    correctAnswer: 2,
    category: "Java",
    difficulty: "Hard",
    explanation: "The G1 (Garbage-First) GC became the default collector in Java 9, replacing the Parallel GC."
  },
  {
    question: "Can an abstract class in Java have a constructor?",
    options: [
      "Yes, and it is called when a subclass is instantiated",
      "No, abstract classes cannot have constructors",
      "Only if it contains no abstract methods",
      "Only if the constructor is private"
    ],
    correctAnswer: 0,
    category: "Java",
    difficulty: "Medium",
    explanation: "Abstract classes can define constructors, which are called via super() during subclass instantiation."
  },

  // --- PYTHON ---
  {
    question: "Which built-in Python function returns the number of items in a list or sequence?",
    options: ["count()", "size()", "len()", "length()"],
    correctAnswer: 2,
    category: "Python",
    difficulty: "Easy",
    explanation: "The len() function returns the length (the number of items) of an object."
  },
  {
    question: "Which of the following data types in Python is immutable?",
    options: ["List", "Dictionary", "Set", "Tuple"],
    correctAnswer: 3,
    category: "Python",
    difficulty: "Easy",
    explanation: "Tuples and strings are immutable in Python, whereas lists, dictionaries, and sets are mutable."
  },
  {
    question: "What will the Python expression [x**2 for x in range(4) if x % 2 == 0] produce?",
    options: ["[0, 4]", "[0, 1, 4, 9]", "[4, 16]", "[0, 2]"],
    correctAnswer: 0,
    category: "Python",
    difficulty: "Medium",
    explanation: "range(4) produces 0, 1, 2, 3. Even numbers are 0 and 2. Squaring them yields [0, 4]."
  },
  {
    question: "What is the primary function of the Python Global Interpreter Lock (GIL)?",
    options: [
      "To optimize memory usage across processes",
      "To restrict execution of Python bytecode to one thread at a time",
      "To encrypt Python source code before compilation",
      "To prevent unauthorized module imports"
    ],
    correctAnswer: 1,
    category: "Python",
    difficulty: "Medium",
    explanation: "The CPython GIL is a mutex that prevents multiple native threads from executing Python bytecode concurrently."
  },
  {
    question: "In Python, which dunder method is invoked when an object is called as a function (e.g., obj())?",
    options: ["__init__", "__call__", "__apply__", "__execute__"],
    correctAnswer: 1,
    category: "Python",
    difficulty: "Hard",
    explanation: "Defining __call__ on a Python class allows instances of that class to be invoked like functions."
  },
  {
    question: "What does the 'yield from' statement do in Python generator functions?",
    options: [
      "Terminates the generator and returns a value",
      "Delegates iteration to a subgenerator or iterable",
      "Imports generators from an external package",
      "Converts a generator into an async coroutine"
    ],
    correctAnswer: 1,
    category: "Python",
    difficulty: "Hard",
    explanation: "'yield from <iterable>' transparently delegates generator production and communication to a sub-iterable."
  },
  {
    question: "How do you create a shallow copy of a list named 'my_list' using slicing in Python?",
    options: ["my_list[0]", "my_list[:]", "my_list[::0]", "my_list[..]"],
    correctAnswer: 1,
    category: "Python",
    difficulty: "Easy",
    explanation: "my_list[:] creates a shallow copy containing all elements of the original list."
  },

  // --- SQL ---
  {
    question: "Which SQL clause is used to filter rows returned by a query?",
    options: ["GROUP BY", "ORDER BY", "WHERE", "HAVING"],
    correctAnswer: 2,
    category: "SQL",
    difficulty: "Easy",
    explanation: "The WHERE clause is used to filter records based on specified condition(s) before any grouping."
  },
  {
    question: "Which SQL statement is used to remove all records from a table without logging individual row deletions?",
    options: ["DELETE", "DROP", "TRUNCATE", "REMOVE"],
    correctAnswer: 2,
    category: "SQL",
    difficulty: "Easy",
    explanation: "TRUNCATE TABLE quickly removes all rows from a table and typically uses fewer transaction log resources than DELETE."
  },
  {
    question: "What is the main difference between WHERE and HAVING in SQL?",
    options: [
      "WHERE filters groups after aggregation, HAVING filters rows before aggregation",
      "WHERE filters rows before aggregation, HAVING filters aggregated groups",
      "WHERE can only be used with numeric data, HAVING with strings",
      "There is no difference; they are aliases"
    ],
    correctAnswer: 1,
    category: "SQL",
    difficulty: "Medium",
    explanation: "WHERE filters rows before GROUP BY aggregation; HAVING filters groups after aggregate calculations."
  },
  {
    question: "Which type of SQL JOIN returns all rows from the left table and matched rows from the right table?",
    options: ["INNER JOIN", "RIGHT JOIN", "FULL OUTER JOIN", "LEFT JOIN"],
    correctAnswer: 3,
    category: "SQL",
    difficulty: "Medium",
    explanation: "A LEFT JOIN (or LEFT OUTER JOIN) returns all records from the left table and matching records from the right table."
  },
  {
    question: "In database transaction theory, what does the 'I' in ACID stand for?",
    options: ["Indexing", "Isolation", "Integrity", "Iteration"],
    correctAnswer: 1,
    category: "SQL",
    difficulty: "Medium",
    explanation: "ACID stands for Atomicity, Consistency, Isolation, and Durability."
  },
  {
    question: "Which isolation level in ANSI SQL prevents Dirty Reads, Non-Repeatable Reads, and Phantom Reads?",
    options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
    correctAnswer: 3,
    category: "SQL",
    difficulty: "Hard",
    explanation: "Serializable is the strictest isolation level, completely preventing dirty reads, non-repeatable reads, and phantom reads."
  },
  {
    question: "What is a clustered index in relational databases?",
    options: [
      "An index that dictates the physical order of data rows on disk",
      "An index that can be created only on non-unique columns",
      "An index stored in a separate table file away from table data",
      "An index designed exclusively for full-text search"
    ],
    correctAnswer: 0,
    category: "SQL",
    difficulty: "Hard",
    explanation: "A clustered index determines the physical order in which data is stored in the table; hence, a table can only have one clustered index."
  },

  // --- GENERAL KNOWLEDGE ---
  {
    question: "Who is widely regarded as the 'Father of Modern Computer Science'?",
    options: ["Charles Babbage", "Alan Turing", "John von Neumann", "Ada Lovelace"],
    correctAnswer: 1,
    category: "General Knowledge",
    difficulty: "Easy",
    explanation: "Alan Turing formulated the Turing Machine concept and is widely celebrated as the father of modern theoretical computer science."
  },
  {
    question: "Who invented the World Wide Web (WWW) in 1989 while working at CERN?",
    options: ["Tim Berners-Lee", "Marc Andreessen", "Vint Cerf", "Linus Torvalds"],
    correctAnswer: 0,
    category: "General Knowledge",
    difficulty: "Easy",
    explanation: "Sir Tim Berners-Lee invented the World Wide Web in 1989 while working as a software engineer at CERN."
  },
  {
    question: "In what year was the first version of the Linux kernel released by Linus Torvalds?",
    options: ["1985", "1991", "1995", "1998"],
    correctAnswer: 1,
    category: "General Knowledge",
    difficulty: "Medium",
    explanation: "Linus Torvalds published the first version of the Linux kernel (version 0.01) in September 1991."
  },
  {
    question: "What does the abbreviation 'DNS' stand for in computer networking?",
    options: [
      "Domain Name System",
      "Digital Network Service",
      "Data Node Standard",
      "Dynamic Routing Selector"
    ],
    correctAnswer: 0,
    category: "General Knowledge",
    difficulty: "Easy",
    explanation: "DNS stands for Domain Name System, which translates human-friendly domain names to IP addresses."
  },
  {
    question: "Which computer beat World Chess Champion Garry Kasparov in 1997?",
    options: ["Deep Blue", "Watson", "AlphaGo", "ENIAC"],
    correctAnswer: 0,
    category: "General Knowledge",
    difficulty: "Medium",
    explanation: "IBM's Deep Blue defeated World Chess Champion Garry Kasparov in a six-game match in 1997."
  },
  {
    question: "What was the name of the first computer programmer in history?",
    options: ["Grace Hopper", "Ada Lovelace", "Katherine Johnson", "Margaret Hamilton"],
    correctAnswer: 1,
    category: "General Knowledge",
    difficulty: "Hard",
    explanation: "Ada Lovelace is recognized as the world's first computer programmer for writing an algorithm intended for Babbage's Analytical Engine."
  },
  {
    question: "Which encryption algorithm is based on the mathematical difficulty of factoring large composite integers?",
    options: ["AES", "RSA", "SHA-256", "Blowfish"],
    correctAnswer: 1,
    category: "General Knowledge",
    difficulty: "Hard",
    explanation: "RSA (Rivest-Shamir-Adleman) public-key cryptosystem relies on the practical difficulty of factoring the product of two large prime numbers."
  }
];

async function seedDatabase() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/quizmaster";

  console.log("=========================================");
  console.log(" QuizMaster - Database Seeder");
  console.log("=========================================");
  console.log(`Target MongoDB URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@")}`);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });
    console.log("Connected to MongoDB successfully.\n");

    let insertedCount = 0;
    let skippedCount = 0;

    for (const qData of sampleQuestions) {
      // Check if question with exact text already exists
      const existing = await Question.findOne({ question: qData.question });
      if (existing) {
        skippedCount++;
      } else {
        await Question.create(qData);
        insertedCount++;
      }
    }

    const totalInDb = await Question.countDocuments();

    console.log("Seed Summary:");
    console.log(`- New questions inserted: ${insertedCount}`);
    console.log(`- Existing questions skipped: ${skippedCount}`);
    console.log(`- Total questions now in DB: ${totalInDb}`);

    // Print breakdown by category
    const categories = await Question.aggregate([
      { $group: { _id: { category: "$category", difficulty: "$difficulty" }, count: { $sum: 1 } } },
      { $sort: { "_id.category": 1, "_id.difficulty": 1 } }
    ]);

    console.log("\nCategory & Difficulty Breakdown:");
    categories.forEach(item => {
      console.log(`  • ${item._id.category} (${item._id.difficulty}): ${item.count} question(s)`);
    });

    console.log("\nDatabase seeding completed successfully!");
  } catch (error) {
    console.error("\nSeeding Failed!");
    console.error(`Error details: ${error.message}`);
    console.error("Tip: Check if MongoDB is running or if your MONGODB_URI connection string is correct.");
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleQuestions };
