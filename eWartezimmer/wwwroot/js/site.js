// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

var map = L.map('map').setView([51.934328,7.651021], 15.5);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Set the initial value of the variable
let countdownValue = 500;

var circle = L.circle([51.934328,7.651021], {
    color: '#01c7b2',
    fillColor: '#01c7b2',
    fillOpacity: 0.420,
    radius: countdownValue
}).addTo(map);

// Function to update the countdown variable and display it
function updateCountdown() {
  // Decrement the countdown value
  countdownValue--;

  // Display the countdown value
  circle.setRadius(countdownValue)
  circle.radius--;
  // Check if the countdown has reached zero
  if (countdownValue <= 0) {
    clearInterval(interval); // Stop the countdown
  }
}

  // Call the updateCountdown function every second
  const interval = setInterval(updateCountdown, 1000);