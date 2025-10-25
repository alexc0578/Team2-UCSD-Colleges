const { compareAllAPs } = require('./script.js')
const data = require('./ap_data.json');

// Test input AP classes and scores
const testCourses = [
    { course: "Calculus AB", score: 4},
    { course: "Computer Science Principles", score: 5},
    { course: "Spanish Language and Culture", score: 5},
    { course: "United States History", score: 3}
]

// Test in Console
const output = compareAllAPs(testCourses, data)

console.log("AP Course Comparison:");
for (const [college, result] of Object.entries(output)) {
  console.log(`\n--------------------${college} College--------------------`);
  if (typeof result == "string") {
    console.log(result);
    continue;
  }

  for (const [requirement, courses] of Object.entries(result)) {
    console.log(`\n${requirement}:`);
    courses.forEach(c => {
      console.log(` - ${c.course}: Score of ${c.score} ${c.status}`);
    })
  }

}