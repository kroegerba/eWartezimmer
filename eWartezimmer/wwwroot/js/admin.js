"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/eWartezimmerHub").build();

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    return console.error(err.toString());
});

connection.on("AllOffices", (jsonListOfOffices) => {
    const offices = JSON.parse(jsonListOfOffices);

    // Create and append div elements for each patient
    offices.forEach((office) => {
        const element = document.getElementById(office.Guid);
        if (!element) {
            const div = document.createElement("div");
            div.classList.add("office");
            div.id = office.Guid;

            const OfficeButton = document.createElement("button");
            OfficeButton.classList.add("btn");
            OfficeButton.classList.add("btn-primary");
            OfficeButton.innerHTML = "Praxis-Link in Zwischenablage";
            OfficeButton.addEventListener("click", function() {
                navigator.clipboard.writeText(office.Link).then(function() {
                    console.log("Copied to clipboard: " + office.Link);
                }).catch(function(err) {
                    console.error("Could not copy text: ", err);
                });
            });
            div.appendChild(OfficeButton);

            const NameInput = document.createElement("input");
            NameInput.classList.add("nameInput");
            NameInput.setAttribute("type", "text");
            NameInput.setAttribute("name", "Name");
            NameInput.setAttribute("value", office.Name);
            NameInput.setAttribute("placeholder", "Praxisname");
            NameInput.addEventListener("change", function (event) {
                connection.invoke("ChangeOfficeName", office.Guid, event.target.value)
                    .catch(function (err) {
                        return console.error(err.toString());
                    });
            });
            div.appendChild(NameInput);

            const AddressInput = document.createElement("input");
            AddressInput.classList.add("addressInput");
            AddressInput.setAttribute("type", "text");
            AddressInput.setAttribute("name", "Address");
            AddressInput.setAttribute("placeholder", "Adresse");
            AddressInput.addEventListener("change", function (event) {
                $.get(location.protocol + '//nominatim.openstreetmap.org/search?format=json&limit=1&q=' + event.target.value, function (data) {
                    connection.invoke("ChangeOfficeLocation", office.Guid, event.target.value, data[0].lat, data[0].lon)
                        .catch(function (err) {
                            return console.error(err.toString());
                        });
                });
            });
            div.appendChild(AddressInput);

            const LatitudeInput = document.createElement("input");
            LatitudeInput.classList.add("latitudeInput");
            LatitudeInput.setAttribute("type", "text");
            LatitudeInput.setAttribute("name", "Latitude");
            LatitudeInput.setAttribute("value", office.Latitude);
            LatitudeInput.setAttribute("disabled", "");
            div.appendChild(LatitudeInput);

            const LongitudeInput = document.createElement("input");
            LongitudeInput.classList.add("longitudeInput");
            LongitudeInput.setAttribute("type", "text");
            LongitudeInput.setAttribute("name", "Longitude");
            LongitudeInput.setAttribute("value", office.Longitude);
            LongitudeInput.setAttribute("disabled", "");
            div.appendChild(LongitudeInput);

            // add div to container
            container.appendChild(div);
        } else {
            // element already existing, only update where changed
            var labelElement = element.querySelector(".nameInput");
            if (labelElement) {
                // If labelElement is found, update its textContent
                labelElement.textContent = office.Name;
            } else {
                // If labelElement is not found, log an error or handle accordingly
                console.log("Label element with class 'nameInput' not found.");
            }

            // element already existing, only update where changed
            var labelElement = element.querySelector(".latitudeInput");
            if (labelElement) {
                // If labelElement is found, update its textContent
                labelElement.setAttribute("value", office.Latitude);
            } else {
                // If labelElement is not found, log an error or handle accordingly
                console.log("Label element with class 'latitudeInput' not found.");
            }

            // element already existing, only update where changed
            var labelElement = element.querySelector(".longitudeInput");
            if (labelElement) {
                // If labelElement is found, update its textContent
                labelElement.setAttribute("value", office.Longitude);
            } else {
                // If labelElement is not found, log an error or handle accordingly
                console.log("Label element with class 'longitudeInput' not found.");
            }

        }
    });
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    var name = prompt("Bitte geben Sie den Namen der Praxis ein:");
    if (name) {
        connection.invoke("CreateOffice", name).catch(function (err) {
            return console.error(err.toString());
        });
    }
    event.preventDefault();
});