﻿"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/eWartezimmerHub").build();

//Disable the send button until connection is established.
document.getElementById("sendButton").disabled = true;

var patient = null;

// Set the initial value of the variable
let guid = document.getElementById("guid").value;
var latitude = document.getElementById("latitude").value;
var longitude = document.getElementById("longitude").value;
var greeting = document.getElementById("greeting").value;

var map = L.map('map').setView([parseFloat(latitude),parseFloat(longitude)], 15.5);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var circle = L.circle([parseFloat(latitude),parseFloat(longitude)], {
    color: '#01c7b2',
    fillColor: '#01c7b2',
    fillOpacity: 0.420,
    radius: 0
}).addTo(map);

connection.on("ReceiveMessage", function (officeGuid, message) {
    if (officeGuid === "self") {
        var messageContainerDiv = document.createElement("div");
        messageContainerDiv.classList.add("message-container");
        messageContainerDiv.classList.add("right");
        var messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        messageContainerDiv.appendChild(messageDiv);
        document.getElementById("chatWindow").appendChild(messageContainerDiv);
        messageDiv.textContent = `${message}`;
    } else {
        var messageContainerDiv = document.createElement("div");
        messageContainerDiv.classList.add("message-container");
        messageContainerDiv.classList.add("left");
        var messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        messageContainerDiv.appendChild(messageDiv);
        document.getElementById("chatWindow").appendChild(messageContainerDiv);
        messageDiv.textContent = `${message}`;
    }
    // Scroll to the bottom of the chat window
    var chatWindow = document.getElementById("chatWindow");
    chatWindow.scrollTop = chatWindow.scrollHeight;
});

connection.on("Patient", (jsonPatient) => {
    var parsedPatient = JSON.parse(jsonPatient);
    console.log(parsedPatient);
    if (parsedPatient) {
        patient = parsedPatient;
        if (latitude.localeCompare(patient.Latitude) + longitude.localeCompare(patient.Longitude) == 0) {
            // do nothing
        } else {
            latitude = patient.Latitude;
            longitude = patient.Longitude;
            console.log([parseFloat(latitude), parseFloat(longitude)]);
            circle.setLatLng([parseFloat(latitude), parseFloat(longitude)]);
            map.flyTo([parseFloat(latitude), parseFloat(longitude)], 15.5);
        }
        circle.setRadius(patient.WaitingTime); // Update the circle radius
        map.fitBounds(circle.getBounds());
        document.getElementById("greeting").innerHTML = "Hallo, " + patient.Name + ".";
        document.getElementById("countdown").innerHTML = "Sie haben noch " + ((Math.floor(patient.WaitingTime / 60) > 0)? Math.floor(patient.WaitingTime / 60) + " Minuten und " : "") + patient.WaitingTime % 60 + " Sekunden Zeit, bis Sie an der Reihe sind.";
    }
});

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
    connection.invoke("SetConnectionId", guid);
}).catch(function (err) {
    return console.error(err.toString());
});

document.getElementById("chatInput").addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        var message = document.getElementById("chatInput").value;
        document.getElementById("chatInput").value = "";
        connection.invoke("SendMessageToOffice", message)
            .catch(function (err) {
                return console.error(err.toString());
            });
        event.preventDefault();
    }
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    var message = document.getElementById("chatInput").value;
    document.getElementById("chatInput").value = "";
    connection.invoke("SendMessageToOffice", message)
        .catch(function (err) {
            return console.error(err.toString());
        });
    event.preventDefault();
});

var marker;
function updateMarker() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;

            // Show user's location on the map
            if (marker) {
                marker.setLatLng([lat, lng]);
            } else {
                // Use Leaflet's default icon
                marker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'custom-marker',
                        iconSize: [12, 12],
                        html: '<div style="border: 2px solid red; border-radius: 50%; width: 12px; height: 12px;"></div>'
                    })
                }).addTo(map);
            }
        }, function (error) {
            console.error('Error getting geolocation:', error);
        });
    } else {
        console.error('Geolocation is not supported by your browser');
    }
}

setInterval(updateMarker, 2500);