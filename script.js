import data from './ap_data.json' assert { type: "json" };
console.log("script.js loaded")

// ---------------------------------------------------------
// Function to obtain list of unique courses in ap_data.json
// ---------------------------------------------------------
function getAllAPCourses() {
    const courses = new Set();

    for (const college of Object.values(data)) {
        if (!college.Requirements) continue;

        for (const category of Object.values(college.Requirements)) {
            for (const courseObj of category) {
                courses.add(courseObj.course);
            }
        }
    }
    return Array.from(courses);
}

// ---------------------------------------------------------
// On window load: populate AP class choice dropdown
// ---------------------------------------------------------
window.onload = () => {
    const dropdown = document.getElementById("apCourseSelect");
    dropdown.innerHTML = "<option value=''>Select a course</option>";

    const courseList = getAllAPCourses();

    courseList.forEach(course => {
        const option = document.createElement("option");
        option.value = course;
        option.textContent = course;
        dropdown.appendChild(option);
    });
};

// ---------------------------------------------------------
// Update list of courses selected by user
// ---------------------------------------------------------
let userCourses = [];

document.getElementById("addCourseBtn").addEventListener("click", () => {
    const course = document.getElementById("apCourseSelect").value;
    const score = document.getElementById("apScoreSelect").value;

    if (!course || !score) {
        alert("Please select both a course and a score.");
        return;
    }

    userCourses.push({ course, score });

    document.getElementById("selectedCourses").innerHTML += `
        <p>${course} — Score: ${score}</p>
    `;
});


// ---------------------------------------------------------
// Function to compare AP courses for an INDIVIDUAL COLLEGE's requirements
// ---------------------------------------------------------
function compareAPs(userCourses, requirements) {
  const result = {};

  userCourses.forEach((userCourse) => {
    let found = false;

    // Loop through the requirements of this college
    for (const [requirement, courses] of Object.entries(requirements)) {
      for (const courseObj of courses) {
        // Check if current user course matches a requirement-satisfying course
        if (courseObj.course === userCourse.course) {
          found = true;
          let status = "no credit"; // default status

          // Check if valid score exists for current course
          if (courseObj.score && courseObj.score[userCourse.score]) {
            status = courseObj.score[userCourse.score]; // e.g., "partial", "complete"
          } else if (requirement === "No Credit") {
            status = "no credit";
          }

          // Initialize the requirement in result if not added already
          if (!result[requirement]) {
            result[requirement] = [];
          }

          // Add this course result to that requirement
          result[requirement].push({
            course: userCourse.course,
            score: userCourse.score,
            status: status,
          });

          break; // stop searching this requirement's courses
        }
      }

      if (found) break; // if course was found, no need to check other requirements
    }

    // If course never matched, mark as "Unrecognized"
    if (!found) {
      if (!result["Unrecognized"]) {
        result["Unrecognized"] = [];
      }
      result["Unrecognized"].push({
        course: userCourse.course,
        score: userCourse.score,
        status: "unknown course",
      });
    }
  });

  return result;
}

// ---------------------------------------------------------
// Function to compare AP courses across ALL COLLEGES' requirements
// ---------------------------------------------------------
function compareAllAPs(userCourses, requirements) {
  const collegeResults = {};

  for (const [collegeName, collegeData] of Object.entries(requirements)) {
    if (collegeData.Requirements && Object.keys(collegeData.Requirements).length > 0) {
      collegeResults[collegeName] = compareAPs(userCourses, collegeData.Requirements);
    } else {
      collegeResults[collegeName] = "No AP equivalent in requirement Data";
    }
  }

  return collegeResults;
}

// ---------------------------------------------------------
// Show results to user
// ---------------------------------------------------------
document.getElementById("calculateBtn").addEventListener("click", () => {
    const results = compareAllAPs(userCourses, data);
    document.getElementById("results").textContent = JSON.stringify(results, null, 2);
});

// Expose to HTML
window.compareAllAPs = compareAllAPs;
