"use strict";

// Generate QR code
let guid = document.getElementById("guid").value;
let baseurl = document.getElementById("baseurl").value;
var qrCodeDiv = document.getElementById("qrcode");
var qrCode = new QRCode(qrCodeDiv, {
    text: baseurl + "/Home/Patient/" + guid, // URL or text to encode
    width: 394,  // Width and height of the QR code (pixels)
    height: 394
});