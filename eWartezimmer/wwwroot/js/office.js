"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/eWartezimmerHub").build();
let guid = document.getElementById("guid").value;

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
    connection.invoke("SetConnectionId", guid).catch(function (err) {
        return console.error(err.toString());
    });
}).catch(function (err) {
    return console.error(err.toString());
});

function formatTime(seconds) {
    // Calculate hours, minutes, and remaining seconds
    var hours = Math.floor(seconds / 3600);
    var remainingSeconds = seconds % 3600;
    var minutes = Math.floor(remainingSeconds / 60);
    var remainingSeconds = remainingSeconds % 60;

    // Pad hours, minutes, and seconds with leading zeros if necessary
    var formattedHours = hours.toString().padStart(2, '0');
    var formattedMinutes = minutes.toString().padStart(2, '0');
    var formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    // Concatenate hours, minutes, and seconds with ":" separator
    return formattedHours + ":" + formattedMinutes + ":" + formattedSeconds;
}

function moveDown(element){
    var lowerSibling = element.nextElementSibling;
    if(lowerSibling === null) return;
    lowerSibling.insertAdjacentElement("afterend", element);
    var elemChat = element.querySelector(".chat-window");
    elemChat.scrollTop = elemChat.scrollHeight;
    var siblChat = lowerSibling.querySelector(".chat-window");
    siblChat.scrollTop = siblChat.scrollHeight;
}

connection.on("AllQueuers", (jsonListOfQueuers) => {
    // Parse the JSON list of patients
    const patients = JSON.parse(jsonListOfQueuers);

    // Get the container element
    const container = document.getElementById("container");

    // Sort the patients based on a specific property, for example, patient name
    patients.sort((a, b) => a.TurnInLine - b.TurnInLine);

    // Create and append div elements for each patient
    patients.forEach((patient) => {
        const element = document.getElementById(patient.Guid);
        if (!element) {
            // element with id does not exist yet, create it
            const div = document.createElement("div");
            div.classList.add("patient");
            if (patient.TurnInLine === 0) {
                div.classList.add("inTreatment");
            } else {
                div.classList.remove("inTreatment");
            }
            div.id = patient.Guid;

            const left = document.createElement("div");
            left.classList.add("info-container");
            div.appendChild(left);

            const TurnInLineLabel = document.createElement("label");
            TurnInLineLabel.textContent = patient.TurnInLine;
            TurnInLineLabel.classList.add("turnnumber");

            const QrCodeButton = document.createElement("button");
            QrCodeButton.classList.add("btn");
            QrCodeButton.classList.add("btn-primary");
            QrCodeButton.innerHTML = "QR";
            QrCodeButton.addEventListener("click", function() {
                window.open("/Home/QrCode/" + patient.Guid);
            });

            const AheadButton = document.createElement("button");
            AheadButton.classList.add("btn");
            AheadButton.classList.add("btn-primary");
            AheadButton.classList.add("ahead");
            AheadButton.innerHTML = "ahead";
            AheadButton.addEventListener("click", function() {
                connection.invoke("LetSomeoneGoAhead", patient.Guid)
                    .catch(function (err) {
                        return console.error(err.toString());
                    });
                moveDown(div);
            });

            // Create a container for the inline elements
            const topContainer = document.createElement("div");
            topContainer.classList.add("inline-container");

            // Append the elements to the container
            topContainer.appendChild(TurnInLineLabel);
            topContainer.appendChild(QrCodeButton);
            topContainer.appendChild(AheadButton);

            // Append the container to the left div
            left.appendChild(topContainer);

            const NameInput = document.createElement("input");
            NameInput.classList.add("nameInput");
            NameInput.setAttribute("type", "text");
            NameInput.setAttribute("name", "Name");
            NameInput.setAttribute("value", patient.Name);
            NameInput.addEventListener("change", function(event) {
                connection.invoke("ChangeName", patient.Guid, event.target.value)
                    .catch(function (err) {
                        return console.error(err.toString());
                    });
            });
            left.appendChild(NameInput);

            // WaitingTime
            const WaitingTimeLabel = document.createElement("label");
            WaitingTimeLabel.textContent = "Wartezeit";
            WaitingTimeLabel.classList.add("waitingTimeLabel");

            const WaitingTimeInput = document.createElement("input");
            WaitingTimeInput.setAttribute("type", "text");
            WaitingTimeInput.classList.add("waitingTimeInput");
            WaitingTimeInput.setAttribute("name", "WaitingTime");
            WaitingTimeInput.setAttribute("value", patient.WaitingTime);
            WaitingTimeInput.setAttribute("readonly", true);

            const waitingTimeContainer = document.createElement("div");
            waitingTimeContainer.classList.add("inline-container");
            waitingTimeContainer.appendChild(WaitingTimeInput);
            waitingTimeContainer.appendChild(WaitingTimeLabel);
            left.appendChild(waitingTimeContainer);

            // patient.TreatmentTimeElapsed
            const TreatmentTimeElapsedLabel = document.createElement("label");
            TreatmentTimeElapsedLabel.classList.add("treatmentTimeElapsedLabel");
            TreatmentTimeElapsedLabel.textContent = "Behandlungszeit";

            const TreatmentTimeElapsedInput = document.createElement("input");
            TreatmentTimeElapsedInput.setAttribute("type", "text");
            TreatmentTimeElapsedInput.classList.add("treatmentTimeElapsedInput");
            TreatmentTimeElapsedInput.setAttribute("name", "TreatmentTimeElapsed");
            TreatmentTimeElapsedInput.setAttribute("value", formatTime(patient.TreatmentTimeElapsed));
            TreatmentTimeElapsedInput.setAttribute("readonly", true);

            const treatmentTimeElapsedContainer = document.createElement("div");
            treatmentTimeElapsedContainer.classList.add("inline-container");
            treatmentTimeElapsedContainer.appendChild(TreatmentTimeElapsedInput);
            treatmentTimeElapsedContainer.appendChild(TreatmentTimeElapsedLabel);
                        left.appendChild(treatmentTimeElapsedContainer);

            // patient.TreatmentDuration
            const TreatmentDurationLabel = document.createElement("label");
            TreatmentDurationLabel.classList.add("treatmentDurationLabel");
            TreatmentDurationLabel.textContent = "Behandlungsdauer";

            const TreatmentDurationInput = document.createElement("input");
            TreatmentDurationInput.setAttribute("type", "text");
            TreatmentDurationInput.classList.add("treatmentDurationInput");
            TreatmentDurationInput.setAttribute("name", "TreatmentDuration");
            TreatmentDurationInput.setAttribute("value", formatTime(patient.TreatmentDuration));
            TreatmentTimeElapsedInput.setAttribute("readonly", true);
            
            TreatmentDurationInput.addEventListener("click", function(event) {
                var duration = prompt("Bitte geben Sie die neue Behandlungsdauer des Patienten ein (in Minuten):");
                if (duration) {
                    connection.invoke("ChangeTreatmentDuration", patient.Guid, duration)
                        .catch(function (err) {
                            return console.error(err.toString());
                        });
                }
            });

            const treatmentDurationContainer = document.createElement("div");
            treatmentDurationContainer.classList.add("inline-container");
            treatmentDurationContainer.appendChild(TreatmentDurationInput);
            treatmentDurationContainer.appendChild(TreatmentDurationLabel);
            left.appendChild(treatmentDurationContainer);

            const right = document.createElement("div");
            right.classList.add("chat-container");
            div.appendChild(right);

            const chatWindow = document.createElement("div");
            chatWindow.classList.add("chat-window");
            right.appendChild(chatWindow);

            const chatInputArea = document.createElement("div");
            chatInputArea.classList.add("chat-input-area");
            right.appendChild(chatInputArea);

            const MessageInput = document.createElement("input");
            MessageInput.setAttribute("type", "text");
            MessageInput.setAttribute("name", "Message");
            MessageInput.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    connection.invoke("SendMessageToPatient", patient.Guid, MessageInput.value)
                    .catch(function (err) {
                        return console.error(err.toString());
                    });
                    const element = document.getElementById(patient.Guid);
                    if (element) {
                        var chatWindow = element.querySelector(".chat-window");
                        var messageContainerDiv = document.createElement("div");
                        messageContainerDiv.classList.add("message-container");
                        messageContainerDiv.classList.add("right");
                        var messageDiv = document.createElement("div");
                        messageDiv.classList.add("message");
                        messageDiv.textContent = MessageInput.value;
                        messageContainerDiv.appendChild(messageDiv);
                        chatWindow.appendChild(messageContainerDiv);
                        // Scroll to the bottom of the chat window
                        chatWindow.scrollTop = chatWindow.scrollHeight;
                    }
                }
            });
            chatInputArea.appendChild(MessageInput);

            const SendMessageButton = document.createElement("button");
            SendMessageButton.classList.add("btn");
            SendMessageButton.classList.add("btn-primary");
            SendMessageButton.innerHTML = "send";
            SendMessageButton.addEventListener("click", function() {
                connection.invoke("SendMessageToPatient", patient.Guid, MessageInput.value)
                    .catch(function (err) {
                        return console.error(err.toString());
                    });
                const element = document.getElementById(patient.Guid);
                if (element) {
                    var chatWindow = element.querySelector(".chat-window");
                    var messageContainerDiv = document.createElement("div");
                    messageContainerDiv.classList.add("message-container");
                    messageContainerDiv.classList.add("right");
                    var messageDiv = document.createElement("div");
                    messageDiv.classList.add("message");
                    messageDiv.textContent = MessageInput.value;
                    messageContainerDiv.appendChild(messageDiv);
                    chatWindow.appendChild(messageContainerDiv);
                    // Scroll to the bottom of the chat window
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                }
            });
            chatInputArea.appendChild(SendMessageButton);

            // add div to container
            container.appendChild(div);
        } else {
            // element already existing, only update where changed
            if (patient.TurnInLine === 0) {
                element.classList.add("inTreatment");
                element.querySelector(".waitingTimeInput").style.display = "none";
                element.querySelector(".waitingTimeLabel").style.display = "none";
                element.querySelector(".treatmentTimeElapsedInput").style.display = "inline-block";
                element.querySelector(".treatmentTimeElapsedLabel").style.display = "inline-block";
                element.querySelector(".ahead").disabled = true;
            } else {
                element.classList.remove("inTreatment");
                element.querySelector(".waitingTimeInput").style.display = "inline-block";
                element.querySelector(".waitingTimeLabel").style.display = "inline-block";
                element.querySelector(".treatmentTimeElapsedInput").style.display = "none";
                element.querySelector(".treatmentTimeElapsedLabel").style.display = "none";
                element.querySelector(".ahead").disabled = false;
            }
            var labelElement = element.querySelector(".turnnumber");
            if (labelElement) {
                // If labelElement is found, update its textContent
                labelElement.textContent = patient.TurnInLine;
                if (patient.TurnInLine === 0) {
                    element.classList.add("inTreatment");
                }
            }
            const WaitingTimeInput = element.querySelector(".waitingTimeInput");
            if (WaitingTimeInput) {
                WaitingTimeInput.setAttribute("value", formatTime(patient.WaitingTime));
            }
            const TreatmentDurationInput = element.querySelector(".treatmentDurationInput");
            if (TreatmentDurationInput) {
                TreatmentDurationInput.setAttribute("value", formatTime(patient.TreatmentDuration));
            }
            const TreatmentTimeElapsedInput = element.querySelector(".treatmentTimeElapsedInput");
            if (TreatmentTimeElapsedInput) {
                TreatmentTimeElapsedInput.setAttribute("value", formatTime(patient.TreatmentTimeElapsed));
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

connection.on("ReceiveMessage", function (patientGuid, message) {
    console.log("ReceivedMessage" + message + " by " + patientGuid);
    const element = document.getElementById(patientGuid);
    if (element) {
        var chatWindow = element.querySelector(".chat-window");
        var messageContainerDiv = document.createElement("div");
        messageContainerDiv.classList.add("message-container");
        messageContainerDiv.classList.add("left");
        var messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        messageDiv.textContent = message;
        messageContainerDiv.appendChild(messageDiv);
        chatWindow.appendChild(messageContainerDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
});

connection.on("queueUpdateReceived", function (jsonListOfQueuers) {
    console.log(jsonListOfQueuers);
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    console.log("send button pressed");
    // Prompt to input the name of the patient
    var name = prompt("Bitte geben Sie den Namen des Patienten ein:");
    if (name) {
        // Create a patient if name is given
        connection.invoke("CreatePatient", guid, name).catch(function (err) {
            return console.error(err.toString());
        });
    }
    event.preventDefault();
});