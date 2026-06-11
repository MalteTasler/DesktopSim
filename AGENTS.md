# DesktopSim

DesktopSim ist eine React-Web-App zur Simulation einer Desktop-Oberflaeche.

## Coding-Style

- Bestehende Komponentenstruktur und Styling-Konventionen beibehalten.
- Keep it simple.
  - Komponenten und Hooks moeglichst unter 200 Zeilen halten; groeßere UI-Bereiche in fokussierte Unterkomponenten aufteilen.
  - Pro Datei moeglichst nur eine Komponente bzw. ein Hook.

## Qualitaets-Pruefung

- Bei Codeaenderungen `npm run build` ausfuehren, sofern keine nachvollziehbaren Gruende dagegen sprechen.
- Bei UI-Äenderungen mindestens den betroffenen Haupt-Workflow im Browser pruefen.

## UI-/UX-Architektur

- Damit alle UI-Elemente sich vorhersehbar und einheitlich verhalten, sollten sich alle Features hinsichtlich ihrer verwendeten UI-Elemente konsistent an einem festen Organisationsschema orientieren. Sowohl vom Verhalten, als auch vo Code. Dieses Schema ist ueber UI-Kategorien abgebildet.
  - Eine UI-Kategorie beschreibt einen abstrakten Typ von UI-Element mit gemeinsamen Eigenschaften und Verhalten.
  - Ein UI-Element ist eine konkrete Instanz im Interface und muss einer UI-Kategorie zugeordnet sein.

### UI-Kategorien

- Die UI-Kategorien sind hierarchisch organisiert. Jede Kategorie erbt die Eigenschaften von ihrer uebergeordneten Kategorie.

#### Hierarchie

- Space
  - Shell
  - Window
  - Flyout
    - Context Menu
    - Panel
- Background
- Desktop-Icon

#### Eigenschaften

| UI-Kategorie         | Ausloesung                                                    | Schließung                                  | Darstellung                                                                            | verschiebbar? | Scope                              | Aehnlichkeit/Referenz                               |
|----------------------|---------------------------------------------------------------|---------------------------------------------|----------------------------------------------------------------------------------------|---------------|------------------------------------|-----------------------------------------------------|
| Space                |                                                               |                                             | immer rechteckige Flaeche (aber mit abgerundeten Kanten, einheitlicher Corner-Radius)  |               |                                    |                                                     |
| Shell                | immer sichtbar                                                | -                                           | fest am unteren Rand                                                                   | -             | OS                                 | am meisten Aehnlichkeit mit Taskbar von MS-Windows  |
| Window (dt. Fenster) | Start von Anwendung ueber Icon                                | ueber X-Button in Window oder ueber Taskbar |                                                                                        | ✓             | stellt Inhalte einer Anwendung dar | am meisten Aehnlichkeit mit MS-Windows              |
| Flyout               |                                                               | irgendwo außerhalb interagieren             |                                                                                        |               | stellt Inhalte des OS dar          |                                                     |
| Context Menu         | durch Rechtsklick oder Long Press erzeugt (an entspr. Stelle) |                                             |                                                                                        | -             | OS + Anwendung                     |                                                     |
| Panel                | Waehlen von entsprechender Flaeche in Shell                   |                                             |                                                                                        | -             | OS + Anwendung                     |                                                     |
| Background           | immer im Hintergrund sichtbar                                 | -                                           | Bild/Muster in Vollbild                                                                | -             | OS                                 | MS-Windows                                          |
| Desktop-Icon         | immer auf zweiter Hintergrund-Ebene sichtbar                  | -                                           | beliebig, aber innerhalb rechteckiger Grenzen                                          | ✓             | OS                                 | MS-Windows                                          |
