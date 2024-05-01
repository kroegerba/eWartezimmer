"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/eWartezimmerHub").build();

RegisterAsNewQueuer

connection.start().then(function () {
    connection.invoke("RegisterAsNewQueuer", "user's name").catch(function (err) {
        return console.error(err.toString());
    });
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    return console.error(err.toString());
});