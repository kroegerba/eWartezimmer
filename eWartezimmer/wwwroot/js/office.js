"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/eWartezimmerHub").build();

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    return console.error(err.toString());
});

connection.on("AllQueuers", function (jsonListOfQueuers) {
    console.log(jsonListOfQueuers);
});

function updateCountdown() {
    connection.invoke("TellMeAllQueuers");
}

// Call the updateCountdown function every second
const interval = setInterval(updateCountdown, 1000);