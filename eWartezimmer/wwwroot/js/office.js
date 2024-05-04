"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/eWartezimmerHub").build();

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    return console.error(err.toString());
});

function formatTime(time) {
    const minutes = ("" + (Math.floor(time / 60))).length = 1 ? "0" + Math.floor(time / 60) : Math.floor(time / 60);
    const separator = ":";
    const seconds = ("" + (time % 60)).length = 1 ? "0" + time % 60 : time % 60;
    return minutes + separator + seconds;
}

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
            NameInput.classList.add("nameInput");
            NameInput.setAttribute("type", "text");
            NameInput.setAttribute("name", "Name");
            NameInput.setAttribute("value", patient.Name);
            div.appendChild(NameInput);

            // WaitingTime
            const WaitingTimeLabel = document.createElement("label");
            WaitingTimeLabel.textContent = "Wartezeit";
            WaitingTimeLabel.classList.add("waitingTimeLabel");
            div.appendChild(WaitingTimeLabel);

            const WaitingTimeInput = document.createElement("input");
            WaitingTimeInput.setAttribute("type", "text");
            WaitingTimeInput.classList.add("waitingTimeInput");
            WaitingTimeInput.setAttribute("name", "WaitingTime");
            WaitingTimeInput.setAttribute("value", patient.WaitingTime);
            WaitingTimeInput.setAttribute("readonly", true);
            div.appendChild(WaitingTimeInput);

            // patient.TreatmentTimeElapsed
            const TreatmentTimeElapsedLabel = document.createElement("label");
            TreatmentTimeElapsedLabel.classList.add("treatmentTimeElapsedLabel");
            TreatmentTimeElapsedLabel.textContent = "Behandlungszeit";
            div.appendChild(TreatmentTimeElapsedLabel);

            const TreatmentTimeElapsedInput = document.createElement("input");
            TreatmentTimeElapsedInput.setAttribute("type", "text");
            TreatmentTimeElapsedInput.classList.add("treatmentTimeElapsedInput");
            TreatmentTimeElapsedInput.setAttribute("name", "TreatmentTimeElapsed");
            TreatmentTimeElapsedInput.setAttribute("value", patient.TreatmentTimeElapsed); // Set the value of the input to the attribute value
            TreatmentTimeElapsedInput.setAttribute("readonly", true);
            div.appendChild(TreatmentTimeElapsedInput);



            // patient.TreatmentDuration
            const TreatmentDurationLabel = document.createElement("label");
            TreatmentDurationLabel.classList.add("treatmentDurationLabel");
            TreatmentDurationLabel.textContent = "Behandlungsdauer";
            div.appendChild(TreatmentDurationLabel);

            const TreatmentDurationInput = document.createElement("input");
            TreatmentDurationInput.setAttribute("type", "text");
            TreatmentDurationInput.classList.add("treatmentDurationInput");
            TreatmentDurationInput.setAttribute("name", "TreatmentDuration");
            TreatmentDurationInput.setAttribute("value", patient.TreatmentDuration); // Set the value of the input to the attribute value
            TreatmentDurationInput.setAttribute("readonly", true);
            div.appendChild(TreatmentDurationInput);





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
            var labelElement = element.querySelector(".waitingTimeInput");
            if (labelElement) {
                // If labelElement is found, update its textContent
                labelElement.setAttribute("value", patient.WaitingTime);
            }
            else {
                // If labelElement is not found, log an error or handle accordingly
                console.log("Label element with class 'turnnumber' not found.");
            }
            var labelElement = element.querySelector(".treatmentTimeElapsedInput");
            if (labelElement) {
                // If labelElement is found, update its textContent
                labelElement.setAttribute("value", patient.TreatmentTimeElapsed);
            }
            else {
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
