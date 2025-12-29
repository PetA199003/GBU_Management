# GBU Management System - Benutzerhandbuch

## Inhaltsverzeichnis

1. [Einführung](#einführung)
2. [Benutzerrollen](#benutzerrollen)
3. [Erste Schritte](#erste-schritte)
4. [Projektverwaltung](#projektverwaltung)
5. [Gefährdungsbeurteilungen (GBU)](#gefährdungsbeurteilungen-gbu)
6. [Teilnehmerverwaltung](#teilnehmerverwaltung)
7. [Unterweisungen](#unterweisungen)
8. [PDF-Export](#pdf-export)

## Einführung

Das GBU Management System ist eine webbasierte Anwendung zur Verwaltung von Gefährdungsbeurteilungen für Produktionen und Veranstaltungen. Es implementiert das STOP-Prinzip (Substitution, Technisch, Organisatorisch, Persönlich) nach dem Hamburger Modell.

### Hauptfunktionen

- Projektverwaltung mit Saisonabhängigkeit (Indoor/Outdoor)
- Erstellung und Verwaltung von Gefährdungsbeurteilungen
- Vordefinierte GBU-Vorlagen
- Bereichsverwaltung mit Zuweisung an Bereichsleiter
- Teilnehmerverwaltung mit CSV-Import
- Digitale Unterschriftenfunktion (iPad-kompatibel)
- Generierung von Unterweisungen
- PDF-Export für Dokumentation

## Benutzerrollen

### Admin
- Vollzugriff auf alle Funktionen
- Benutzerverwaltung
- Projektverwaltung
- Globale GBU-Vorlagen erstellen
- Bereiche verwalten

### Technischer Leiter
- Projekte erstellen und verwalten
- Bereichsleiter zuweisen
- GBUs für Projekte erstellen
- Unterweisungen generieren

### Projektleiter
- Projekte erstellen und verwalten
- Benutzer zu Projekten zuweisen
- GBUs bearbeiten
- Teilnehmer verwalten

### Bereichsleiter
- Zugewiesene Bereiche bearbeiten
- Gefährdungen in eigenen Bereichen erstellen/bearbeiten
- Maßnahmen dokumentieren

### User (nur Lesen)
- Zugewiesene Projekte ansehen
- GBUs und Unterweisungen lesen
- Keine Bearbeitungsrechte

## Erste Schritte

### 1. Anmeldung

1. Öffnen Sie die Anwendung im Browser
2. Geben Sie Ihre Zugangsdaten ein
3. Klicken Sie auf "Anmelden"

**Standard-Admin-Zugangsdaten** (bei Erstinstallation):
- Benutzername: `admin`
- Passwort: `admin123`

**Wichtig**: Ändern Sie das Passwort sofort nach der ersten Anmeldung!

### 2. Passwort ändern

1. Klicken Sie auf Ihren Namen in der Navigationsleiste
2. Wählen Sie "Passwort ändern"
3. Geben Sie Ihr altes und neues Passwort ein
4. Bestätigen Sie die Änderung

## Projektverwaltung

### Neues Projekt erstellen

1. Navigieren Sie zu "Neues Projekt" in der Menüleiste
2. Füllen Sie die Projektdaten aus:
   - **Projektname** (Pflichtfeld)
   - **Beschreibung**
   - **Ort** (Veranstaltungsort)
   - **Aufbaudatum** (Wann wird aufgebaut?)
   - **Startdatum** (Veranstaltungsbeginn)
   - **Enddatum** (Veranstaltungsende)
   - **Saison** (Frühling, Sommer, Herbst, Winter)
   - **Indoor/Outdoor** (Indoor, Outdoor, Beides)
3. Klicken Sie auf "Projekt erstellen"

**Hinweis**: Die Saison wird automatisch aus dem Startdatum berechnet, wenn nicht manuell angegeben.

### Benutzer zu Projekten zuweisen

1. Öffnen Sie das Projekt
2. Wechseln Sie zur Registerkarte "Team"
3. Klicken Sie auf "Benutzer zuweisen"
4. Wählen Sie den Benutzer aus der Liste
5. Bestätigen Sie die Zuweisung

### Bereiche zuweisen

1. Öffnen Sie das Projekt
2. Wechseln Sie zur Registerkarte "Bereiche"
3. Klicken Sie auf "Bereich zuweisen"
4. Wählen Sie:
   - Bereich (z.B. "Büro & Bildschirmarbeitsplatz")
   - Bereichsleiter
5. Bestätigen Sie die Zuweisung

## Gefährdungsbeurteilungen (GBU)

### Das STOP-Prinzip

Das System verwendet das STOP-Prinzip in hierarchischer Reihenfolge:

1. **S - Substitution**: Gefahren beseitigen oder weniger gefährliche Stoffe einsetzen
2. **T - Technische Maßnahmen**: Technische Lösungen zur Risikominimierung
3. **O - Organisatorische Maßnahmen**: Organisatorische und kollektive Lösungen
4. **P - Persönliche Schutzausrüstung**: Als letzte Maßnahme

### GBU-Vorlage verwenden

1. Öffnen Sie das Projekt
2. Klicken Sie auf "GBU bearbeiten"
3. Klicken Sie auf "Vorlage hinzufügen"
4. Wählen Sie eine passende Vorlage basierend auf:
   - Saison (entsprechend Ihrem Projekt)
   - Indoor/Outdoor
5. Klicken Sie auf "Hinzufügen"

Die Gefährdungen aus der Vorlage werden in Ihr Projekt kopiert und können angepasst werden.

### Neue Gefährdung erstellen

1. Klicken Sie im GBU-Editor auf "Neue Gefährdung"
2. Füllen Sie die Felder aus:
   - **Bereich** (zugeordneter Bereich)
   - **Tätigkeit** (beschreibt die Tätigkeit)
   - **Gefährdung** (Art der Gefährdung)
   - **Gefährdungsfaktoren** (spezifische Faktoren)
   - **Belastungsfaktoren**

3. **Risikobewertung**:
   - **Schadenschwere** (1-3): Wie schwer wäre ein Schaden?
   - **Wahrscheinlichkeit** (1-3): Wie wahrscheinlich ist der Schaden?
   - Risiko wird automatisch berechnet und farblich dargestellt:
     - 🟢 Grün: Niedriges Risiko (1-2)
     - 🟡 Gelb: Mittleres Risiko (3-4)
     - 🔴 Rot: Hohes Risiko (6-9)

4. **STOP-Maßnahmen markieren**:
   - Setzen Sie Häkchen bei zutreffenden Maßnahmen
   - Beschreiben Sie konkrete Maßnahmen im Textfeld

5. **Weitere Informationen**:
   - Überprüfung der Wirksamkeit
   - Meldung bei Mängeln
   - Gesetzliche Regelungen
   - Sonstige Bemerkungen

6. Speichern Sie die Gefährdung

### Gefährdung bearbeiten

1. Klicken Sie in der GBU-Übersicht auf "Bearbeiten" bei der gewünschten Gefährdung
2. Nehmen Sie Änderungen vor
3. Speichern Sie die Änderungen

## Teilnehmerverwaltung

### Teilnehmer manuell hinzufügen

1. Öffnen Sie das Projekt
2. Klicken Sie auf "Teilnehmer verwalten"
3. Klicken Sie auf "Teilnehmer hinzufügen"
4. Geben Sie die Daten ein:
   - Vorname
   - Nachname
   - E-Mail
   - Position
   - Firma
5. Speichern

### Teilnehmer per CSV importieren

1. Bereiten Sie eine CSV-Datei mit folgenden Spalten vor:
   ```
   first_name,last_name,email,position,company
   Max,Mustermann,max@beispiel.de,Techniker,Firma GmbH
   Erika,Musterfrau,erika@beispiel.de,Leitung,Firma GmbH
   ```

2. Klicken Sie auf "CSV importieren"
3. Wählen Sie Ihre CSV-Datei
4. Die Teilnehmer werden importiert und angezeigt

### Digitale Unterschrift erfassen

1. Öffnen Sie die Teilnehmerliste
2. Klicken Sie bei einem Teilnehmer auf "Unterschreiben"
3. Der Teilnehmer unterschreibt mit dem Finger oder Apple Pencil (iPad)
4. Klicken Sie auf "Speichern"
5. Die Unterschrift wird als digitale Signatur gespeichert

**Hinweis**: Für iPad-Benutzer ist diese Funktion touchscreen-optimiert.

## Unterweisungen

### Unterweisung generieren

1. Öffnen Sie das Projekt
2. Klicken Sie auf "Unterweisung erstellen"
3. Klicken Sie auf "Unterweisung generieren"
4. Eine Standard-Unterweisung wird basierend auf dem Projekt erstellt mit:
   - Veranstaltungsinformationen
   - Organisationsstruktur
   - Allgemeine Hinweise
   - Notfall- und Räumungsregeln

### Unterweisung bearbeiten

1. Passen Sie die generierten Texte an Ihre Bedürfnisse an
2. Fügen Sie zusätzliche Regeln hinzu
3. Speichern Sie die Änderungen

## PDF-Export

### GBU als PDF exportieren

1. Öffnen Sie den GBU-Editor für das Projekt
2. Klicken Sie auf "PDF exportieren"
3. Das PDF wird mit allen Gefährdungen generiert:
   - Projektinformationen
   - Alle Gefährdungen nach Bereichen gruppiert
   - Farbcodierte Risikobewertung
   - STOP-Prinzip Legende

### Teilnehmerliste als PDF

1. Öffnen Sie die Teilnehmerverwaltung
2. Klicken Sie auf "PDF exportieren"
3. Das PDF enthält:
   - Alle Teilnehmer
   - Unterschriftenfelder (für analoge Unterschriften)
   - Datumsfelder
   - Leere Zeilen für zusätzliche Teilnehmer

### Unterweisung als PDF

1. Öffnen Sie die Unterweisung
2. Klicken Sie auf "PDF exportieren"
3. Das PDF enthält:
   - Titel und Veranstaltungsinfos
   - Organisation
   - Allgemeine Hinweise
   - Notfall- und Räumungsregeln
   - Zusätzliche Regeln

## Tipps und Best Practices

### Workflow für ein neues Projekt

1. **Projekt anlegen**
   - Alle Stammdaten erfassen
   - Saison und Indoor/Outdoor festlegen

2. **Team zusammenstellen**
   - Technischen Leiter zuweisen
   - Projektleiter zuweisen
   - Bereichsleiter für relevante Bereiche zuweisen

3. **GBU erstellen**
   - Passende Vorlagen auswählen
   - Projektspezifische Gefährdungen ergänzen
   - Jeder Bereichsleiter bearbeitet seinen Bereich

4. **Maßnahmen festlegen**
   - STOP-Prinzip anwenden
   - Konkrete Maßnahmen beschreiben
   - Überprüfungsprozesse definieren

5. **Teilnehmer vorbereiten**
   - Teilnehmerliste erstellen (CSV-Import)
   - Unterweisung generieren und anpassen

6. **Vor Ort**
   - Teilnehmerliste ausdrucken oder digital unterschreiben lassen
   - Unterweisung durchführen
   - GBU bei Bedarf aktualisieren

7. **Abschluss**
   - Finale PDFs exportieren
   - Projekt als "abgeschlossen" markieren
   - Dokumentation archivieren

### Sicherheitshinweise

- **Regelmäßige Backups**: Sichern Sie die Datenbank regelmäßig
- **Passwortsicherheit**: Verwenden Sie starke Passwörter
- **Zugriffsrechte**: Weisen Sie Benutzern nur die notwendigen Rechte zu
- **Aktualisierung**: Halten Sie das System aktuell

## Häufig gestellte Fragen (FAQ)

**F: Kann ich eine GBU für mehrere Projekte verwenden?**
A: Ja, erstellen Sie eine globale Vorlage, die dann in verschiedenen Projekten wiederverwendet werden kann.

**F: Wie ändere ich eine Gefährdung nachträglich?**
A: Klicken Sie auf "Bearbeiten" in der GBU-Übersicht, nehmen Sie Änderungen vor und speichern Sie.

**F: Kann ich eigene Bereiche hinzufügen?**
A: Ja, als Admin können Sie unter "Benutzerverwaltung" neue Bereiche erstellen.

**F: Werden digitale Unterschriften rechtlich anerkannt?**
A: Digitale Unterschriften können je nach Rechtslage unterschiedlich behandelt werden. Klären Sie dies mit Ihrer Rechtsabteilung.

**F: Wie exportiere ich alle Daten eines Projekts?**
A: Exportieren Sie die GBU, Teilnehmerliste und Unterweisung jeweils als PDF.

## Support

Bei Fragen oder Problemen wenden Sie sich an Ihren Systemadministrator oder erstellen Sie ein Issue im GitHub-Repository.
