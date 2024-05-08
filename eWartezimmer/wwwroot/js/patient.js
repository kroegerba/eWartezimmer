"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/eWartezimmerHub").build();

//Disable the send button until connection is established.
document.getElementById("sendButton").disabled = true;

var map = L.map('map').setView([51.934328,7.651021], 15.5);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Set the initial value of the variable
let guid = document.getElementById("guid").value;

var circle = L.circle([51.934328,7.651021], {
    color: '#01c7b2',
    fillColor: '#01c7b2',
    fillOpacity: 0.420,
    radius: 0
}).addTo(map);

connection.on("ReceiveMessage", function (user, message) {
    var li = document.createElement("li");
    document.getElementById("messagesList").appendChild(li);
    // We can assign user-supplied strings to an element's textContent because it
    // is not interpreted as markup. If you're assigning in any other way, you 
    // should be aware of possible script injection concerns.
    li.textContent = `${user} says ${message}`;
});

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    return console.error(err.toString());
});

// Function to update the countdown variable and display it
//function updateCountdown() {
//  // Decrement the countdown value
//
//  // Display the countdown value
//  document.getElementById("countdown").innerHTML = "Sie haben noch " + ((Math.floor(countdownValue / 60) > 0)? Math.floor(countdownValue / 60) + " Minuten und " : "") + countdownValue % 60 + " Sekunden Zeit, bis Sie an der Reihe sind.";
//  
//  circle.setRadius(countdownValue)
//
//  // Check if the countdown has reached zero
//  if (countdownValue <= 0) {
//    clearInterval(interval); // Stop the countdown
//    document.getElementById("countdown").innerHTML = "Countdown finished!";
//  }
//}

connection.on("AllQueuers", (jsonListOfQueuers) => {
  console.log("all queuers");
  // Parse the JSON list of patients
  const patients = JSON.parse(jsonListOfQueuers);


  

  const yourPatient = patients.find(patient => patient.Guid === guid);
  if (yourPatient) {
      console.log(yourPatient.WaitingTime);
      circle.setRadius(yourPatient.WaitingTime); // Update the circle radius
      map.fitBounds(circle.getBounds());
      document.getElementById("countdown").innerHTML = "Sie haben noch " + ((Math.floor(yourPatient.WaitingTime / 60) > 0)? Math.floor(yourPatient.WaitingTime / 60) + " Minuten und " : "") + yourPatient.WaitingTime % 60 + " Sekunden Zeit, bis Sie an der Reihe sind.";
  }
});

document.getElementById("sendButton").addEventListener("click", function (event) {
  var user = document.getElementById("userInput").value;
  var message = document.getElementById("messageInput").value;
  connection.invoke("SendMessage", user, message).catch(function (err) {
      return console.error(err.toString());
  });
  event.preventDefault();
});





// Call the updateCountdown function every second
// const interval = setInterval(updateCountdown, 1000);

