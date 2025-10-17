// Load College AP Requirements JSON
const data = require('./ap_data.json');

// Function to compare AP courses for an INDIVIDUAL COLLEGE's requirements
function compareAPs(userCourses, requirements) {
    const result = {};

    userCourses.forEach(userCourse => {
        let found = false;

        // Loop through the requirements of this college
        for (const [requirement, courses] of Object.entries(requirements)) {
          for (const courseObj of courses) {
            // Check if current user course matches a requirement-satisfying course
            if (courseObj.course === userCourse.course) {
              found = true;
              let status = "no credit"; //default status

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

// Function to compare AP courses across ALL COLLEGES' requirements
function compareAllAPs(userCourses, requirements) {
  const collegeResults = [];

  // Loop through colleges in requirements and check for that AP course using compareAPs
  for (const [collegeName, collegeData] of Object.entries(requirements)) {
    if (collegeData.Requirements && Object.keys(collegeData.Requirements.length > 0)) {
      collegeResults[collegeName] = compareAPs(userCourses, collegeData.Requirements);
    } else {
      collegeResults[collegeName] = "No AP equivalent in requirement Data";
    }
  }

  // Returns a nested object
  return collegeResults;
}

// Export compareAllAPs function
module.exports = { compareAllAPs };