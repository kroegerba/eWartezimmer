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
    // container.innerHTML = "";

    patients.sort((a, b) => a.TurnInLine - b.TurnInLine);

    // Create and append div elements for each patient
    patients.forEach((patient) => {
        const element = document.getElementById(patient.Guid);
        if (!element) {
            // element with id does not exist yet, create it
            console.log("Parent element has a child with ID 'childElementId'");
            const div = document.createElement("div");
            div.classList.add("patient");
            div.id = patient.Guid;
            div.textContent = `Name: ${patient.Name}, GUID: ${patient.Guid}, Connection ID: ${patient.ConnectionId}, TurnInLine: ${patient.TurnInLine}`; // Example properties
            container.appendChild(div);
        } else {
            // element already existing, only update where changed
        }

        const existingPatientDivs = container.querySelectorAll(".patient");

        // Remove patient divs from the container if their ID is not present in patients
        existingPatientDivs.forEach((existingDiv) => {
            if (!patients.some(patient => patient.Guid === existingDiv.id)) {
                // ID of existing div is not present in patients array, remove it from the container
                existingDiv.remove();
            }
        });



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