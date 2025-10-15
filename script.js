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

    // Loop through list of user's AP courses
    userCourses.forEach(userCourse => {
        let found = false;

        // Loop through the list of courses for each requirement
        for (const [requirement, courses] of Object.entries(requirements)) {
          for (const courseObj of courses) {
            // Check if current user course matches a requirement-satisfying course
            if (courseObj.course === userCourse.course) {
              found = true;
              let status = "no credit"; // No credit = default status

              // Check if valid score exists for current course
              if (courseObj.score && courseObj.score[userCourse.score]) {
                status = courseObj.score[userCourse.score]; // Change status based on score ("parcial/complete")
              } else if (requirement === "No Credit") {
                status = "no credit";
              }

              // Initialize the requirement status to result if not added already
              if (!result[requirement]) {
                result[requirement] = [];
              }

              // Add the course comparison result to corresponding requirement
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

    // If course not found in any category, mark as "unrecognized"
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