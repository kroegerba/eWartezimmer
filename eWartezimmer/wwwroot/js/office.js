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
            if (patient.TurnInLine === 0) {
                div.classList.add("inTreatment");
            }
            div.id = patient.Guid;

            const TurnInLineLabel = document.createElement("label");
            TurnInLineLabel.textContent = patient.TurnInLine;
            TurnInLineLabel.classList.add("turnnumber");
            div.appendChild(TurnInLineLabel);

            const NameInput = document.createElement("input");
            NameInput.setAttribute("type", "text");
            NameInput.setAttribute("name", "Name");
            NameInput.setAttribute("value", patient.Name);
            div.appendChild(NameInput);
            div.appendChild(document.createElement("br"));

            // patient.TreatmentDuration
            // patient.TreatmentTimeElapsed
            const TreatmentTimeElapsedLabel = document.createElement("label");
            TreatmentTimeElapsedLabel.textContent = "TreatmentTimeElapsed";
            div.appendChild(TreatmentTimeElapsedLabel);

            const TreatmentTimeElapsedInput = document.createElement("input");
            TreatmentTimeElapsedInput.setAttribute("type", "text");
            TreatmentTimeElapsedInput.setAttribute("name", "TreatmentTimeElapsed");
            TreatmentTimeElapsedInput.setAttribute("value", patient.TreatmentTimeElapsed); // Set the value of the input to the attribute value
            TreatmentTimeElapsedInput.setAttribute("readonly", true);
            div.appendChild(TreatmentTimeElapsedInput);

            div.appendChild(document.createElement("br"));

            // WaitingTime
            const WaitingTimeLabel = document.createElement("label");
            WaitingTimeLabel.textContent = "WaitingTime";
            div.appendChild(WaitingTimeLabel);

            const WaitingTimeInput = document.createElement("input");
            WaitingTimeInput.setAttribute("type", "text");
            WaitingTimeInput.setAttribute("name", "WaitingTime");
            WaitingTimeInput.setAttribute("value", patient.WaitingTime); // Set the value of the input to the attribute value
            WaitingTimeInput.setAttribute("readonly", true);
            div.appendChild(WaitingTimeInput);

            // add div to container
            container.appendChild(div);
        } else {
            // element already existing, only update where changed
            var labelElement = element.querySelector(".turnnumber");
            if (labelElement) {
                // If labelElement is found, update its textContent
                labelElement.textContent = patient.TurnInLine;
                if (patient.TurnInLine === 0) {
                    element.classList.add("inTreatment");
                }
            } else {
                // If labelElement is not found, log an error or handle accordingly
                console.log("Label element with class 'turnnumber' not found.");
            }
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
