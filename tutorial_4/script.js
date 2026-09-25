// ============================================================
// TUTORIAL 4: JAVASCRIPT FUNDAMENTALS
// RSVP card — wire up the behavior
// ============================================================
//
// BEFORE YOU START: open the browser console (F12 → Console)
// You'll use it to check your work throughout.
//
// Run this any time to see the current state of your variables:
//   checkStatus()
//
// ============================================================


// ── 1. DATA: what are we tracking? ──────────────────────────
//
// These two variables represent the user's choice.
// Only one can be true at a time.
// (Later, think about whether you need both.)

let isGoing    = false;
let isNotGoing = false;
let guests = [];

// ── 2. ELEMENTS: find everything we'll need ─────────────────
//
// We grab all the elements once, at the top.
// Then we use the variables below instead of querySelector every time.

const nameInput    = document.querySelector('#name-input');
const guestInput   = document.querySelector('#guest-input');
const guestField   = document.querySelector('#guest-field');

// Try getting the yes, no, confirmation and regret elements from the html.
const btnYes       = document.getElementById("btn-yes");
const btnNo        = document.getElementById("btn-no");
const confirmButton= document.getElementById("confirmation-btn");
const confirmation = document.getElementById("confirmation");
const regret       = document.getElementById("regret");

// Updating the items of guest list
const guestsText   = document.getElementById("total-guests");
const guestList    = document.getElementById("guest-list");


// ── 3. HELPERS: small functions that do one thing ───────────
//
// getName() returns the name from the input, or 'Someone' if it's empty.
// .trim() removes whitespace from both ends of a string.

const getName = () => {
  const raw = nameInput.value.trim();
  return raw || 'Someone';
  // What does || do here? If raw is an empty string (falsy), return 'Someone'.
};

// getGuests() returns the guest count as a NUMBER.
// Try: console.log(typeof guestInput.value) — what do you see?
// Number() converts the string "3" to the number 3.

const getGuests = () => Number(guestInput.value);


// ── 4. TASK 1 & 2: wire up the YES button ───────────────────
//
// When the user clicks Going:
//   - set isGoing = true, isNotGoing = false
//   - add 'active' class to btnYes, remove it from btnNo
//   - remove 'hidden' from guestField (show it)
//   - remove 'hidden' from confirmation, add 'hidden' to regret
//   - call updateConfirmation() (written below in Task 3)

btnYes.addEventListener('click', () => {

  // YOUR CODE HERE
  if(getName() == "Someone") {
    alert ('Name is missing!');
    return;
  }
  let name = getName();
  isGoing = true;
  btnYes.classList.add("active");
  btnNo.classList.remove("active");
  guestField.classList.remove("hidden");
  confirmation.classList.remove("hidden");
  regret.classList.add("hidden");
  confirmation.textContent = `${name} is coming!`;
  updateConfirmation();
});


// When the user clicks Can't make it:
//   - set isGoing = false, isNotGoing = true
//   - add 'active' class to btnNo, remove it from btnYes
//   - add 'hidden' to guestField (hide it)
//   - add 'hidden' to confirmation, remove 'hidden' from regret
//   - set regret.textContent using a template literal with getName()

btnNo.addEventListener('click', () => {

  // YOUR CODE HERE
  if(getName() == "Someone") {
    alert ('Name is missing!');
    return;
  }
  let name = getName();
  isGoing = false;
  btnYes.classList.remove("active");
  btnNo.classList.add("active");
  guestField.classList.add("hidden");
  confirmation.classList.add("hidden");
  regret.classList.remove("hidden");
  regret.textContent = `${name} is not coming :(`;
  updateConfirmation();
});


// ── 5. TASK 3 & 4: build the confirmation message ───────────
//
// updateConfirmation() assembles the message from name + guest count.
//
// Template literal syntax:  `${expression} rest of string`
//
// The guest count needs a conditional:
//   0 guests → "flying solo."
//   1 guest  → "bringing 1 guest."
//   2+ guests → "bringing 3 guests."
//
// Hint: write the conditional first, store the result in a variable,
// then use that variable in the template literal.

const updateConfirmation = () => {
  const guests = getGuests();
  
  // YOUR CODE HERE: build guestLine based on guests value
  let guestLine = "";
  if(guests == 0) {
    guestLine = "Flying Solo";
  } else {
    if (guests == 1) {
      guestLine = `${guests} guest.`;
    } else {
      guestLine = `${guests} guests.`;
    }
  }

  // YOUR CODE HERE: set confirmation.textContent using a template literal
  confirmation.textContent = `${getName()} is coming - ${guestLine}`
  // Example shape: `${getName()} is coming — ${guestLine}`

};

const updateRegret = () => {
  regret.textContent = `${getName()} is not coming :(`
}

const onConfirm = () => {
  if(getName() == "Someone") {
    return;
  }
  console.log('pressed confirm');
  guests.push({name: getName(), guests: getGuests(), status: isGoing});
  console.log(guests);
  updateGuestList();
  // let guestCount = guests.length + 
  // guestsText.classList.remove("hidden");
  // guestsText.textContent = `${guests} people confirmed so far`;
  resetCard();
};

const updateGuestList = () => {
  // update Guest Count;
  const latestGuest = guests[guests.length - 1];
  const guestCount = guests.reduce((t, g) => t + (!!g.status ? g.guests + 1 : 0), 0);
  guestsText.textContent = `${guestCount} people confirmed so far`;
  // add guests to list like Siddharth + guestCount;
  const newGuest = document.createElement('div');
  newGuest.textContent = `${latestGuest.name}, ${latestGuest.guests}, ${!!latestGuest.status ? 'Going' : 'Not Going'}`;
  guestList.appendChild(newGuest);
};


// ── 6. TASK 5: live updates ──────────────────────────────────
//
// Add 'input' event listeners to nameInput and guestInput.
// Each one should check whether the user has made a choice yet,
// and if so, call the right update function.
//
// Hint: use the isGoing and isNotGoing variables to check.

nameInput.addEventListener('input', () => {

  // YOUR CODE HERE
  updateConfirmation();
  updateRegret();
});

guestInput.addEventListener('input', () => {

  // YOUR CODE HERE
  updateConfirmation();
});

confirmButton.addEventListener('click', () => {

  // YOUR CODE HERE
  console.log("Pressed confirm");
  
  onConfirm();
});

// nameInput.addEventListener('input', () => {
//   console.log(getName());
//   if(getName() == "Someone") {
//     btnNo.disabled = true;
//     btnYes.disabled = true;
//   } else {
//     btnNo.disabled = false;
//     btnYes.disabled = false;
//   }
// })

// document.addEventListener("DOMContentLoaded", (event) => {
//     if(getName() == "Someone") {
//       btnNo.disabled = "true";
//       btnYes.disabled = "true";
//     } else {
//       btnNo.disabled = "false";
//       btnYes.disabled = "false";
//     }
// });


// ── DEBUGGING ────────────────────────────────────────────────
//
// Type checkStatus() in the browser console to see current variable values.

const checkStatus = () => {
  console.log('=== current state ===');
  console.log('isGoing:    ', isGoing);
  console.log('isNotGoing: ', isNotGoing);
  console.log('name:       ', nameInput.value);
  console.log('guests:     ', getGuests(), '(type:', typeof getGuests(), ')');
  console.log('raw value:  ', guestInput.value, '(type:', typeof guestInput.value, ')');
  console.log('====================');
};

// Type resetCard() in the browser console to clear everything and start over.

const resetCard = () => {
  isGoing    = false;
  isNotGoing = false;

  nameInput.value  = '';
  guestInput.value = '0';

  btnYes.classList.remove('active');
  btnNo.classList.remove('active');

  guestField.classList.add('hidden');
  confirmation.classList.add('hidden');
  regret.classList.add('hidden');

  confirmation.textContent = '';
  regret.textContent       = '';

  console.log('Card reset.');
};