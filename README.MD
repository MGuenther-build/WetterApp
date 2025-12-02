# WetterApp

**WetterApp** ist eine moderne Python-Flask-Anwendung inkl.Pandas zur Anzeige historischer Wetterdaten und weltweiter 3-Tage-Wettervorhersagen. Die App kombiniert eine transparente Kacheloptik mit interaktiven Diagrammen und nutzt die OpenWeatherMap-API sowie Charts.js für eine visuell ansprechende Darstellung.

## Features
- **Wetterarchiv Europa (1860–2022)**: Zugriff auf Tageshöchsttemperaturen aller verfügbaren Wetterstationen in Europa. Die Daten reichen je nach Station bis ins 19. Jahrhundert zurück.
- **Interaktive Jahrescharts**: Darstellung der historischen Temperaturen in einem Jahresdiagramm. Beim Überfahren eines Tages mit der Maus erscheint ein Popup mit Datum und Temperatur.
- **3-Tage-Wettervorhersage weltweit**: Abfrage aktueller Wetterdaten über die OpenWeatherMap-API für jeden beliebigen Ort weltweit.
- **GeocodeAPI**: Unterstützt bei der Eingabe eines Ortes in der Wettervorhersage mit Vorschlägen von Orten, für die eine Wettervorhersage vorhanden ist.
- **Kacheloptik für Vorhersage**: Drei nebeneinander angeordnete, smartphoneartige Kacheln zeigen Maximal- und Minimaltemperaturen pro Tag.
- **Tagesverlauf-Diagramm**: Charts.js zeigt den Temperaturverlauf über den Tag. Beim Überfahren mit der Maus erscheinen Zusatzinfos wie Uhrzeit, Temperatur, Luftfeuchtigkeit und gefühlte Temperatur.
- **Bewölkungsgrad im 3-Stunden-Takt**: Unterhalb der Kacheln wird die Bewölkung angezeigt. Tooltips geben Auskunft über Wetterzustand wie „bewölkt“, „Regen“ oder „sonnig“.
- **Moderne Benutzeroberfläche**: Die App setzt auf eine transparente, responsive Kacheloptik für eine intuitive Bedienung.

## Klonen
   ```bash
   git clone https://github.com/MGuenther-build/WetterApp.git
   ```

## Start der App
   ``` bash
   FlaskMain.py
   ```

# Technologie
* Python: Programmiersprache für Backend und Logik.
* Flask: Webframework zur Bereitstellung der App.
* Charts.js: Für interaktive Diagramme und visuelle Darstellung.
* OpenWeatherMap API: Für die weltweite Wettervorhersage.
* Geocode API: Für die Autovervollständigung in der weltweiten Wettervorhersage.
* HTML/CSS/JavaScript: Für die moderne Kacheloptik und Interaktivität.

# Lizenz
Diese App unterliegt der MIT-Lizenz. Sie kann von Jedem herunterladen oder geklont werden und dann natürlich auch verändert/erweitert werden! Ich bin dann allerdings nicht mehr Teil solcher Projekte.

# Autor
Martin Günther

# Link zum Projekt
https://www.mguenther-build.de/portfolio

# Link zur App
https://wetterapp.mguenther-build.de
