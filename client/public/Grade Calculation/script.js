// ---------- SGPA Part ----------
function addSubject() {
  let div = document.getElementById("subjects");

  let gradeInput = document.createElement("input");
  gradeInput.type = "number";
  gradeInput.placeholder = "Grade Point";

  let creditInput = document.createElement("input");
  creditInput.type = "number";
  creditInput.placeholder = "Credits";

  let br = document.createElement("br");

  div.appendChild(gradeInput);
  div.appendChild(creditInput);
  div.appendChild(br);
}

function calculateSGPA() {
  let inputs = document.querySelectorAll("#subjects input");

  let totalPoints = 0;
  let totalCredits = 0;

  for (let i = 0; i < inputs.length; i += 2) {
    let gradePoint = Number(inputs[i].value);
    let credit = Number(inputs[i + 1].value);

    if (gradePoint > 0 && credit > 0) {
      totalPoints += gradePoint * credit;
      totalCredits += credit;
    }
  }

  if (totalCredits === 0) {
    document.getElementById("sgpaResult").innerHTML =
      "❌ Please enter valid grade points and credits.";
    return;
  }

  let sgpa = totalPoints / totalCredits;

  document.getElementById("sgpaResult").innerHTML =
    "✅ Your SGPA is: " + sgpa.toFixed(2);
}

// ---------- CGPA Part ----------
function addSemester() {
  let div = document.getElementById("semesters");

  let input = document.createElement("input");
  input.type = "number";
  input.step = "0.01";
  input.placeholder = "Semester SGPA";

  div.appendChild(document.createElement("br"));
  div.appendChild(input);
}

function calculateCGPA() {
  let inputs = document.querySelectorAll("#semesters input");

  let sum = 0;
  let count = 0;

  inputs.forEach(input => {
    let sgpa = Number(input.value);

    if (sgpa > 0) {
      sum += sgpa;
      count++;
    }
  });

  if (count === 0) {
    document.getElementById("cgpaResult").innerHTML =
      "❌ Please enter at least one semester SGPA.";
    return;
  }

  let cgpa = sum / count;

  document.getElementById("cgpaResult").innerHTML =
    "✅ Your CGPA is: " + cgpa.toFixed(2);
}