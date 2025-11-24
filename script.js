// --------- GLOBAL STATE ---------
let apData = null;              // JSON data from ap_data.json
const userCourses = [];         // AP courses the user enters
let selectedCollege = "Revelle"; // default selected tab

// Only run DOM code in the browser (so tests in Node don't explode)
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    // 1. Load ap_data.json
    fetch("./ap_data.json")
      .then((res) => res.json())
      .then((json) => {
        apData = json;
        console.log("AP data loaded:", apData);
      })
      .catch((err) => {
        console.error("Error loading ap_data.json:", err);
      });

    // 2. Grab DOM elements
    const form = document.getElementById("ap-form");
    const courseInput = document.getElementById("course");
    const scoreSelect = document.getElementById("score");
    const courseList = document.getElementById("course-list");
    const compareBtn = document.getElementById("compare-btn");
    const resultsEl = document.getElementById("results");

    // --- NEW: tab buttons ---
    const tabButtons = document.querySelectorAll(".college-tabs .tab");

    // When a tab is clicked, update active styling + selectedCollege
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        // remove .active from all tabs
        tabButtons.forEach((b) => b.classList.remove("active"));
        // add .active to the clicked tab
        btn.classList.add("active");
        // store which college is selected
        selectedCollege = btn.dataset.college; // e.g., "Revelle"
        console.log("Selected college:", selectedCollege);
      });
    });

    // 3. Handle adding a course
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const courseName = courseInput.value.trim();
      const scoreValue = scoreSelect.value;

      if (!courseName) return;

      // Save course
      userCourses.push({
        course: courseName,
        score: scoreValue,
      });

      // Display in the list
      const li = document.createElement("li");
      li.textContent = `${courseName} (score ${scoreValue})`;
      courseList.appendChild(li);

      courseInput.value = "";
    });

    // 4. Handle compare button
    compareBtn.addEventListener("click", () => {
      if (!apData) {
        resultsEl.textContent =
          "Still loading college data. Try again in a moment.";
        return;
      }

      if (userCourses.length === 0) {
        resultsEl.textContent = "Please add at least one AP course first.";
        return;
      }

      // Get all colleges' results
      const allResults = compareAllAPs(userCourses, apData);

      // Show only the selected college's result
      const collegeResult = allResults[selectedCollege];

      let displayText;
      if (typeof allResults === "string") {
        // e.g., "No AP equivalent in requirement Data"
        displayText = allResults;
      } else {
        displayText = JSON.stringify(allResults, null, 2);
      }

      resultsEl.textContent = displayText;
    });
  });
}

// --------- LOGIC FUNCTIONS (same as before) ---------

// Compare AP courses for an INDIVIDUAL COLLEGE's requirements
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

// Compare AP courses across ALL colleges
function compareAllAPs(userCourses, requirements) {
  const collegeResults = {};

  for (const [collegeName, collegeData] of Object.entries(requirements)) {
    if (
      collegeData.Requirements &&
      Object.keys(collegeData.Requirements).length > 0
    ) {
      collegeResults[collegeName] = compareAPs(
        userCourses,
        collegeData.Requirements
      );
    } else {
      collegeResults[collegeName] = "No AP equivalent in requirement Data";
    }
  }

  return collegeResults;
}

// Optional: export for Node tests
if (typeof module !== "undefined") {
  module.exports = { compareAPs, compareAllAPs };
}