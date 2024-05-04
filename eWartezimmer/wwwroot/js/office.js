"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/eWartezimmerHub").build();

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    return console.error(err.toString());
});

connection.on("AllQueuers", (jsonListOfQueuers) => {
    // Parse the JSON list of patients
    const patients = JSON.parse(jsonListOfQueuers);

    // Sort the patients based on a specific property, for example, patient name
    patients.sort((a, b) => (a.name > b.name) ? 1 : -1);

    // Get the container element
    const container = document.getElementById("container");

    // Clear existing content in the container
    container.innerHTML = "";

    patients.sort((a, b) => a.TurnInLine - b.TurnInLine);

    // Create and append div elements for each patient
    patients.forEach((patient) => {
        const div = document.createElement("div");
        div.textContent = `Name: ${patient.Name}, GUID: ${patient.Guid}, Connection ID: ${patient.ConnectionId}, TurnInLine: ${patient.TurnInLine}`; // Example properties
        container.appendChild(div);
    });
});

connection.on("queueUpdateReceived", function (jsonListOfQueuers) {
    console.log(jsonListOfQueuers);
});

function updateCountdown() {
    connection.invoke("TellMeAllQueuers");
}

// Call the updateCountdown function every second
const interval = setInterval(updateCountdown, 1000);

// Get the container and its child items
var container = document.getElementById("container");
var items = container.getElementsByClassName("item");

// Convert items to an array for sorting
var itemsArray = Array.prototype.slice.call(items);

// Sort items based on the "data-order" attribute
itemsArray.sort(function (a, b) {
    var orderA = parseInt(a.getAttribute("data-order"));
    var orderB = parseInt(b.getAttribute("data-order"));
    return orderA - orderB;
});

// Empty the container
container.innerHTML = "";

// Append sorted items back to the container
itemsArray.forEach(function (item) {
    container.appendChild(item);
});