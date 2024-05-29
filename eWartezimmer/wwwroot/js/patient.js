"use strict";

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
    if (officeGuid === "self")
    {
        var li = document.createElement("li");
        document.getElementById("messagesList").appendChild(li);
        // We can assign user-supplied strings to an element's textContent because it
        // is not interpreted as markup. If you're assigning in any other way, you 
        // should be aware of possible script injection concerns.
        li.textContent = `Patient says ${message}`;
    } else {
        var li = document.createElement("li");
        document.getElementById("messagesList").appendChild(li);
        // We can assign user-supplied strings to an element's textContent because it
        // is not interpreted as markup. If you're assigning in any other way, you 
        // should be aware of possible script injection concerns.
        li.textContent = `Office says ${message}`;
    }
});

connection.on("Patient", (jsonPatient) => {
    var parsedPatient = JSON.parse(jsonPatient);
    console.log(parsedPatient);
    if (parsedPatient) {
        patient = parsedPatient;
        if (latitude.localeCompare(patient.Latitude) + longitude.localeCompare(patient.Longitude) == 0) {

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

document.getElementById("messageInput").addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        var message = document.getElementById("messageInput").value;
        connection.invoke("SendMessageToOffice", message)
            .catch(function (err) {
                return console.error(err.toString());
            });
        event.preventDefault();
    }
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    var message = document.getElementById("messageInput").value;
    connection.invoke("SendMessageToOffice", message)
        .catch(function (err) {
            return console.error(err.toString());
        });
    var li = document.createElement("li");
    document.getElementById("messagesList").appendChild(li);
    li.textContent = `Patient says ${message}`;
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