

# Code  
## Ausführung  
#### Konfiguration  
Der Code erwartet als Konfiguration eine Umgebungsvariable namens "eWartezimmerAdminKey", deren Inhalt als Admin-Passwort behandelt wird.  
(Hierdurch entsteht der Endpoint: ```<BaseUrl>/Home/Admin/{AdminKey}``` welcher zum Nutzen des Codes in der Rolle Administrator benötigt wird.)  
#### Dev-Umgebung
In der Dev-Umgebung kann der Code mittels ```dotnet run``` ausgeführt werden.  
Falls er noch nicht kompiliert ist passiert dies automatisch.  
Mit ```dotnet clean``` kann das lokale Debug-Release "aufgeräumt" werden. (Manchmal löst dies schon etwaige Probleme.)  
  
#### Prod-Umgebung  
In der Prod-Umgebung wurde mittels ```dotnet publish -c Release``` ein Release gebaut.  
Dieses wurde als Site im dortigen IIS konfiguriert.  
  
## Abhängigkeiten  

Zum Anzeigen der Karte, des Kreises und der Position in der Patienten-Ansicht nutzen wir das Framework [Leaflet.js](https://leafletjs.com/).  
Dies ist als ```wwwroot/js/leaflet.js``` im Repo commited.  
Unter der Haube nutzt [Leaflet.js](https://leafletjs.com/) die Kartendaten von [OpenStreetMap](https://www.openstreetmap.org/).  
Für das Generieren von QR-Codes nutzen wir [QRCode.js](https://github.com/davidshimjs/qrcodejs),  
ebenfalls als ```wwwroot/lib/qrcode.js``` im Repo commited.  
  
## Programmablauf und Struktur  
Haupteinstiegspunkt ist die Datei ```Program.cs``` (C#).  
Hierin enthalten ist die Konfiguration der ASP.NET Middleware.  
Es werden die Services:  
  
- ControllersWithViews (ASP.NET MVC)  
- SignalR (open-source, Echtzeit-Messaging Framework von Microsoft)  
- ```QueueManager.cs``` (C#) (eigene Klasse zur Objektverwaltung) als Singleton  
  
geladen und eine BaseUrl ermittelt.  
Der einzige MVC Controller ist der HomeController in ```Controllers/HomeController.cs``` (C#).  
Dieser bietet vier für die Applikation relevante Routen an:
- ```/Home/Admin/{guid}```  
Der Aufruf dieser Route erzeugt ein ```Models/AdminViewModel.cs``` (C#).  
Dieses enthält die BaseUrl und den Bool-Wert, ob die übergebene guid dem AdminKey entspricht.  
Das AdminViewModel wird an den View ```Views/Home/Admin.cshtml``` (C#/HTML) übergeben.  
Dieser nutzt ```wwwroot/css/admin.css``` (CSS) für das Styling und ```wwwroot/js/admin.js``` (JS) & ```wwwroot/js/signalr/dist/browser/signalr.js``` (JS) für die Frontend-Funktionalität.  
Wenn die übergebene guid nicht dem AdminKey entspricht zeigt der Browser eine weiße Seite an.  
- ```/Home/Office/{guid}```
Der Aufruf dieser Route erzeugt ein ```Models/OfficeViewModel.cs``` (C#).  
Dieses enthält die BaseUrl und eine Objekt-Instanz von ```Office.cs``` (C#), welche guid entspricht, oder null.  
Das OfficeViewModel wird an den View ```Views/Home/Office.cshtml``` (C#/HTML) übergeben.  
Dieses nutzt ```wwwroot/css/office.css``` (CSS) für das Styling und ```wwwroot/js/office.js``` (JS) & ```wwwroot/js/signalr/dist/browser/signalr.js``` (JS) für die Frontend-Funktionalität.  
Wenn die übergebene guid nicht der guid eines Offices im Backend entspricht zeigt der Browser eine weiße Seite an.  
- ```/Home/QrCode/{guid}```  
Der Aufruf dieser Route erzeugt ein ```Models/QrCodeViewModel.cs``` (C#).  
Dieses enthält die BaseUrl und eine Objekt-Instanz von ```Patient.cs``` (C#), welche guid entspricht, oder null.  
Das QrCodeViewModel wird an den View ```Views/Home/QrCode.cshtml``` (C#/HTML) übergeben.  
Dieses nutzt ```wwwroot/css/qrcode.css``` (CSS) für das Styling und ```wwwroot/js/qrcode.js``` (JS) & ```wwwroot/lib/qrcode/qrcode.js``` (JS) für die Frontend-Funktionalität.  
Wenn die übergebene guid nicht der guid eines Patienten im Backend entspricht zeigt der Browser eine weiße Seite an.  
- ```/Home/Patient/{guid}```  
Der Aufruf dieser Route erzeugt ein ```Models/PatientViewModel.cs```(C#).  
Dieses enthält die BaseUrl und eine Objekt-Instanz von ```Patient.cs```(C#), welche guid entspricht, oder null.  
Das PatientViewModel wird an den View ```Views/Home/Patient.cshtml```(C#/HTML) übergeben.  
Dieses nutzt ```wwwroot/css/patient.css``` (CSS) für das Styling und ```wwwroot/js/patient.js``` (JS) & ```wwwroot/js/signalr/dist/browser/signalr.js``` (JS) & ```wwwroot/lib/leaflet/leaflet.js``` (JS) für die Frontend-Funktionalität.  
  
Alle Views, außer QrCode, bauen mittels SignalR eine Echtzeitverbindung zum Backend auf.  
Über diese können Views (JS) Hub-Funktionen (C#) aufrufen und umgekehrt.  
Der ```Hubs/EWartezimmerHub.cs``` (C#) hat eine Referenz zum QueueManager und der QueueManager, via Dependecy Injection, einen IHubContext vom Typ EWartezimmerHub.  



# Historie  
Der Verlauf der Entwicklung orientierte sich zuerst am Patienten. Zuerst sollte eine Karte angezeigt, werden können. Hierzu wurde das Leaflet-Tutorial "Quick Start" genutzt, die Kapitel: "Setting up the Map", "Markers Circles Poligons" waren hierbei relevant: https://leafletjs.com/examples/quick-start/

Da die Entwickler mit SignalR für Echtzeit-Kommunikation bereits vertraut waren, nutzten sie die Dokumentation zu Hubs von SignalR als Schablone:
https://learn.microsoft.com/en-us/aspnet/core/signalr/hubs?view=aspnetcore-8.0

Vom Patienten ausgehend, wurde als nächstes eine Listenverwaltung und anschließend eine Adminverwaltung hinzuprogrammiert.
