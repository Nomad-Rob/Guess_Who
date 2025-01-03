// A few random placeholders for people without pictures
var randomPlaceholders = [
  "Pictures/random/placeholder1.jpg",
  "Pictures/random/placeholder2.jpg",
  "Pictures/random/placeholder3.jpg",
  "Pictures/random/placeholder4.jpg",
  "Pictures/random/placeholder5.jpg",
  "Pictures/random/placeholder6.jpg",
  "Pictures/random/placeholder7.jpg"
];

var people = []; // Will be loaded from JSON
var person = null; // The currently displayed person

// Fetch people.json and then initialize the game
fetch('people.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Store the loaded data in our global `people` variable
    people = data;

    // Now that we have people, set up the game
    getPerson();
    updateScore();

    loadOptions(people.map(x => x.firstName).filter(unique).sort(), document.getElementById("firstName"));
    loadOptions(people.map(x => x.lastName).filter(unique).sort(), document.getElementById("lastName"));

    // Attach event listeners
    document.getElementById("check").addEventListener("click", check);
    document.getElementById("skip").addEventListener("click", skip);
  })
  .catch(err => {
    console.error('Error fetching people.json:', err);
  });

// -----------------------------
//        Game Functions
// -----------------------------
function getPerson() {
  // Include everyone who isn't done and isn't skipped, even if they have no picture
  var possibilities = people.filter(x => !x.done && !x.skip);

  // If no possibilities remain, reset skip flags or see if the game is won
  if (possibilities.length === 0) {
    // Re-check among all who aren't done (this ensures we cycle through all again)
    possibilities = people.filter(x => !x.done);
    // Clear skip flags
    people.forEach(x => { x.skip = null; });
  }

  // If we still have some to guess, pick one at random
  if (possibilities.length > 0) {
    // If there's more than 1 possibility, avoid picking the same person consecutively
    if (possibilities.length > 1 && person) {
      possibilities = possibilities.filter(x =>
        x.firstName !== person.firstName || x.lastName !== person.lastName
      );
    }

    // Randomly select a person
    person = possibilities[Math.floor(Math.random() * possibilities.length)];

    // 1) Display the position in bold (above the image). If no position, show blank.
    document.getElementById("position").innerText = person.position || "";

    // 2) Decide which image to show
    let imgSrc = person.picture;
    if (!imgSrc) {
      const randomIndex = Math.floor(Math.random() * randomPlaceholders.length);
      imgSrc = randomPlaceholders[randomIndex];
    }
    console.log("Chose placeholder:", imgSrc);

    document.getElementById("img").src = imgSrc;

    // 3) Show initials in the title text (optional)
    const firstInitial = person.firstName ? person.firstName[0].toUpperCase() : "";
    const lastInitial = person.lastName ? person.lastName[0].toUpperCase() : "";
    document.getElementById("img").title = firstInitial + lastInitial;

    // 4) Display the phrase underneath the picture (if present)
    document.getElementById("phrase").innerText = person.phrase || "";
  } else {
    // We've guessed everyone!
    win();
  }
}

function win() {
  var pictured = people
    .filter(x => x.picture)
    .map(x => x.firstName + " " + x.lastName)
    .join("<br>");
  var notpictured = people
    .filter(x => !x.picture)
    .map(x => x.firstName + " " + x.lastName)
    .join("<br>");

  var resultElement = document.getElementById("result");
  resultElement.innerHTML =
    "You got them all!<br><br>" +
    pictured +
    "<br><br>Not Pictured:<br>" +
    notpictured;

  resultElement.classList.remove("alert-success", "alert-warning", "alert-danger");

  // Hide the play area and score board
  document.getElementById("play").style.display = "none";
  document.getElementById("score").style.display = "none";
}

function loadOptions(list, select) {
  list.forEach(item => {
    var opt = document.createElement("option");
    opt.text = item;
    opt.value = item;
    select.add(opt, null);
  });
}

function unique(value, index, self) {
  return self.indexOf(value) === index;
}

// Message arrays
var successMessages = ["You got it!", "Great job!"];
var halfRightMessages = ["So close!", "You're half right!"];
var failureMessages = ["Try again!", "Not even close!", "Did you even try?"];

function check() {
  var firstNameSelected = document.getElementById("firstName").value;
  var lastNameSelected = document.getElementById("lastName").value;
  var resultElement = document.getElementById("result");

  removeResultStyles();

  if (firstNameSelected === person.firstName && lastNameSelected === person.lastName) {
    resultElement.innerHTML = successMessages[Math.floor(Math.random() * successMessages.length)];
    resultElement.classList.add("alert-success");

    // Mark person as done
    people.find(
      ({ firstName, lastName }) =>
        firstName === person.firstName && lastName === person.lastName
    ).done = true;

    getPerson();
    updateScore();

  } else if (firstNameSelected === person.firstName || lastNameSelected === person.lastName) {
    resultElement.innerHTML = halfRightMessages[Math.floor(Math.random() * halfRightMessages.length)];
    resultElement.classList.add("alert-warning");

  } else {
    resultElement.innerHTML = failureMessages[Math.floor(Math.random() * failureMessages.length)];
    resultElement.classList.add("alert-danger");
  }
}

function skip() {
  var foundPerson = people.find(
    ({ firstName, lastName }) =>
      firstName === person.firstName && lastName === person.lastName
  );
  if (foundPerson) {
    foundPerson.skip = true;
  }

  var resultElement = document.getElementById("result");
  resultElement.innerHTML = "";
  removeResultStyles();
  getPerson();
}

function removeResultStyles() {
  var resultElement = document.getElementById("result");
  resultElement.classList.remove("alert-success", "alert-warning", "alert-danger");
}

function updateScore() {
  // Count how many are done
  document.getElementById("done").innerHTML = people.filter(x => x.done).length;

  // Count how many still left that have not been done.
  document.getElementById("left").innerHTML = people.filter(x => !x.done).length;
}

function cheat(advance) {
  document.getElementById("firstName").value = person.firstName;
  document.getElementById("lastName").value = person.lastName;

  if (advance) {
    check();
  }

  return person.firstName + " " + person.lastName;
}
