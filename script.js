// Load College AP Requirements JSON
const data = require('./ap_data.json');

// Test input AP classes and scores
const testCourses = [
    { course: "Calculus AB", score: 4},
    { course: "Computer Science Principles", score: 5},
    { course: "Spanish Language and Culture", score: 5},
    { course: "United States History", score: 3}
]

// Main function to compare AP courses with college GEs
function compareAPs(userCourses, requirements) {
    const result = {};

    // Loop through list of user's classes
    userCourses.forEach(userCourse => {
        let found = false;

        for (const [requirement, courses] of Object.entries(requirements)) {
      for (const courseObj of courses) {
        if (courseObj.course === userCourse.course) {
          found = true;
          let status = "no credit";

          if (courseObj.score && courseObj.score[userCourse.score]) {
            status = courseObj.score[userCourse.score];
          } else if (requirement === "No Credit") {
            status = "no credit";
          }

          if (!result[requirement]) {
            result[requirement] = [];
          }

          result[requirement].push({
            course: userCourse.course,
            score: userCourse.score,
            status: status
          });

          break; // Stop the loop for courses in that category
        }
      }

      if (found) break; // If course is found, don't search other categories
    }

    // If course not found in any category
    if (!found) {
      if (!result["Unrecognized"]) {
        result["Unrecognized"] = [];
      }
      result["Unrecognized"].push({
        course: userCourse.course,
        score: userCourse.score,
        status: "unknown course"
      });
    }
  });

  return result;
}

// Test in Console
const output = compareAPs(testCourses, data.Seventh.Requirements);

console.log("AP Course Comparison:");
for (const [requirement, courses] of Object.entries(output)) {
  console.log(`\n${requirement}:`);
  courses.forEach(c => {
    console.log(` - ${c.course} (Score: ${c.score}) → ${c.status}`);
  });
}