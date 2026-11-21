const NICHES=["Zahnarztpraxen","Physiotherapeuten","Immobilienmakler","Anwaltskanzleien","Steuerberater","Restaurants","Autohäuser","Fitnessstudios","Handwerksbetriebe","Online-Shops","Hotels","Kosmetikstudios","Versicherungsmakler","Fahrschulen","Coaches & Berater","Pflegedienste","Hausverwaltungen","Tierarztpraxen","Recruiting-Agenturen","Solarfirmen"];
const PRODUCTS={
"KI-Telefonassistent":["verpasste Anrufe","nimmt jeden Anruf rund um die Uhr an, beantwortet Fragen und bucht Termine","verpasste Anrufe pro Woche"],
"KI-Terminbuchung":["Terminchaos und Ausfälle","bucht, verschiebt und erinnert Termine automatisch","ausgefallene Termine pro Woche"],
"Lead-Qualifizierungs-Bot":["Zeit mit unpassenden Anfragen","fragt jede Anfrage vor und schickt nur die heißen Leads weiter","verlorene Anfragen pro Woche"],
"WhatsApp-Kundenservice-Bot":["immer gleiche Kundenfragen","beantwortet Standardfragen sofort per WhatsApp","unbeantwortete Anfragen pro Woche"],
"Bewertungs-Automation":["zu wenige Google-Bewertungen","bittet zufriedene Kunden automatisch um eine Bewertung","Kunden, die wegen schwacher Bewertungen woanders hingehen, pro Woche"],
"Angebots-Generator":["stundenlanges Angebote-Schreiben","erstellt aus wenigen Angaben ein fertiges Angebot in Minuten","Angebote, die zu spät rausgehen, pro Woche"],
"Website-Chatbot":["Besucher, die ohne Anfrage gehen","beantwortet Fragen auf der Website und sammelt Kontaktdaten","verlorene Website-Anfragen pro Woche"],
"Follow-up-Automation":["Anfragen, die im Sand verlaufen","fasst automatisch nach, bis der Kunde antwortet","Anfragen ohne Nachfassen pro Woche"],
"Dokumenten-KI":["Papierkram und Datenerfassung","liest Dokumente aus und überträgt die Daten automatisch","Stunden Papierkram pro Woche"],
"Rechnungs- & Mahn-Automation":["offene Rechnungen","verschickt Rechnungen und Erinnerungen automatisch","überfällige Rechnungen pro Woche"]};
const PRICES=[[1500,300],[2500,500],[990,199],[3500,750],[2000,400],[5000,1000]];
const fmt=n=>Math.round(n).toLocaleString("de-DE")+" €";
const priceTxt=m=>`${fmt(m[0])} Einrichtung + ${fmt(m[1])}/Monat`;
const pilotTxt=m=>`${fmt(m[0]*0.5)} Einrichtung + ${fmt(m[1])}/Monat`;

const PREP=c=>[`30 bis 50 Leads aus der Branche ${c.n} im Tab „Leads“ eintragen`,`Pro Lead eine konkrete Beobachtung notieren (z. B. ${c.pain})`,`Eine Vorschau vom ${c.p} erstellen: Screenshot oder 60-Sekunden-Loom-Video`,`Den Ein-Satz-Pitch 10-mal laut üben, bis er natürlich klingt`,`Einstieg und die 3 häufigsten Einwände mit einem Freund durchspielen`,`Feste Call-Blöcke im Kalender eintragen: 9–11 Uhr und 14–16 Uhr`];

const CALL=c=>[
["1 · Ehrlicher Einstieg (Unterbrechung anerkennen)",`Guten Tag Herr/Frau …, hier ist [Name] von [Agentur]. Ganz ehrlich: Ich rufe unangekündigt an. Geben Sie mir 30 Sekunden, warum ich anrufe, und dann entscheiden Sie, ob wir weiterreden?`,"Wer die Störung offen zugibt, senkt den Abwehrreflex. Nie „Haben Sie kurz Zeit?“ fragen."],
["2 · Grund des Anrufs",`Ich arbeite mit ${c.n} und sehe immer wieder dasselbe Problem: ${c.pain}. Ich habe mir Ihren Betrieb angeschaut und dazu eine konkrete Idee. Darf ich Ihnen zwei kurze Fragen stellen?`,"Nenne deine Beobachtung zum Lead, das zeigt, dass du dich vorbereitet hast."],
["3 · Problem-Fragen (Kunde redet 70 %)",`Wie läuft das bei Ihnen aktuell mit ${c.pain}? … Wie oft passiert das ungefähr pro Woche? … Und was ist ein neuer Kunde für Sie im Schnitt wert?`,"Notiere die Zahlen. Damit rechnest du im Demo-Termin den Nutzen vor."],
["4 · Schmerz bewusst machen",`Wenn ich richtig rechne, gehen Ihnen dadurch jeden Monat grob [Zahl] € verloren. Ist das ungefähr realistisch?`,"Der Kunde soll den Verlust selbst bestätigen. Ein Ja hier ist mehr wert als jede Präsentation."],
["5 · Ziel des Anrufs: der Demo-Termin",`Genau dafür habe ich eine Lösung für ${c.n} konzipiert: Ein ${c.p}, der ${c.does}. Ich habe schon eine Vorschau vorbereitet, wie das bei Ihnen aussehen würde. Wollen wir uns 15 Minuten nehmen, dann zeige ich sie Ihnen? Passt Ihnen eher Dienstag um 10 oder Donnerstag um 14 Uhr?`,"Im Kaltanruf nicht verkaufen, sondern den Termin. Immer zwei Uhrzeiten zur Wahl anbieten."],
["6 · Bestätigen",`Super, ich schicke Ihnen gleich eine kurze Bestätigung. Damit ich die Vorschau perfekt anpasse: Wer entscheidet außer Ihnen noch mit?`,"So vermeidest du im Termin das „Muss ich noch mit meinem Partner besprechen“."]];

const DEMO=c=>[
["1 · Rückblick",`Letztes Mal haben Sie gesagt, dass Ihnen durch ${c.pain} etwa [Zahl] € im Monat verloren gehen. Hat sich daran etwas geändert?`,"Starte mit SEINEN Worten und Zahlen, nicht mit deinem Produkt."],
["2 · Vorschau zeigen",`Ich zeige Ihnen jetzt, wie der ${c.p} bei Ihnen funktionieren würde. Achten Sie mal darauf, wie …`,"Maximal 5 Minuten zeigen. Danach fragen: „Wie würde das bei Ihnen im Alltag helfen?“"],
["3 · Nutzen vorrechnen",`Sie verlieren aktuell [Verlust] € im Monat. Die Lösung kostet ${fmt(c.m[1])} im Monat. Selbst wenn wir nur ein Drittel zurückholen, verdienen Sie daran.`,"Nutze den ROI-Rechner unten und lies die Zahlen live vor."],
["4 · Angebot mit Pilot-Vorteil",`Normal kostet die Einrichtung ${fmt(c.m[0])}. Ich nehme aber gerade nur 3 Pilotkunden aus der Branche ${c.n} auf, dafür halbiere ich die Einrichtung auf ${fmt(c.m[0]*0.5)}. Im Gegenzug wünsche ich mir nach 30 Tagen ein ehrliches Feedback.`,"Echte Knappheit, ehrlich begründet. Wirkt stärker als jeder Rabatt."],
["5 · Risiko abnehmen",`Und damit Sie kein Risiko haben: Wenn das System nach 30 Tagen nicht läuft wie besprochen, können Sie das Monatsabo sofort beenden.`,"Eine Garantie senkt die Hürde enorm. Biete nur an, was du einhalten kannst."],
["6 · Abschlussfrage, dann schweigen",`Sollen wir starten? Dann schicke ich Ihnen heute das Angebot, nach der Anzahlung legen wir los, und in 14 Tagen läuft alles.`,"Nach der Frage nichts mehr sagen. Wer zuerst redet, verliert."]];

const OBJ=c=>[
["„Zu teuer.“",`Verstehe ich. Darf ich fragen: Zu teuer im Vergleich wozu? Sie haben gesagt, ${c.pain} kostet Sie rund [Zahl] € im Monat. Die Lösung kostet ${fmt(c.m[1])}. Ist das Problem eher der Betrag oder die Unsicherheit, ob es funktioniert?`],
["„Keine Zeit.“",`Genau deshalb rufe ich an, das System soll Ihnen Zeit sparen. Für Sie sind es nur 30 Minuten, den Rest übernehme ich. Passt eher Dienstag oder Donnerstag für 15 Minuten?`],
["„Schicken Sie mir Infos.“",`Mache ich gern. Damit ich nicht irgendwas schicke: Was wäre für Sie das Wichtigste? … Und wann schauen wir es kurz gemeinsam an, damit es nicht untergeht?`],
["„Haben wir schon.“",`Super, dann kennen Sie das Thema. Was läuft gut, und was würden Sie sich besser wünschen?`],
["„Muss ich mir überlegen.“",`Klar, das ist eine Entscheidung. Was genau möchten Sie noch klären, den Preis, den Aufwand oder ob es wirklich funktioniert? Lassen Sie es uns direkt besprechen.`],
["„Funktioniert KI überhaupt?“",`Berechtigte Frage. Deshalb gibt es die 30-Tage-Zusage: Sie sehen echte Ergebnisse, bevor Sie sich langfristig binden.`],
["„Wer sind Sie überhaupt?“",`Gute Frage. Ich bin auf ${c.n} spezialisiert und baue genau diese eine Lösung. Ich bin noch eine junge Agentur, deshalb gibt es gerade den Pilotpreis.`]];

const FOLLOW=c=>[
["Bestätigung nach dem Call (WhatsApp/E-Mail)",`Hallo Herr/Frau …, danke für das nette Gespräch! Wie besprochen zeige ich Ihnen am [Tag] um [Uhrzeit] in 15 Minuten, wie der ${c.p} bei Ihnen ${c.pain} lösen kann. Bis dann! [Name]`],
["Nachfassen nach 2 Tagen",`Hallo Herr/Frau …, kurz nachgehakt: Konnten Sie sich die Vorschau anschauen? Ich habe noch einen von 3 Pilotplätzen für ${c.n} frei. Passt ein kurzer Call diese Woche?`],
["Nachfassen nach 5 Tagen",`Hallo Herr/Frau …, eine Frage noch: Ist ${c.pain} für Sie gerade überhaupt ein Thema? Ein kurzes Ja oder Nein reicht mir völlig.`],
["Letzte Nachricht nach 10 Tagen",`Hallo Herr/Frau …, ich will nicht nerven, deshalb meine letzte Nachricht dazu: Wenn das Thema später wieder aktuell wird, melden Sie sich gern. Alles Gute! [Name]`],
["Angebot nach dem Ja",`Hallo Herr/Frau …, wie besprochen anbei Ihr Angebot für den ${c.p}: Einrichtung ${fmt(c.m[0]*0.5)} (Pilotpreis), danach ${fmt(c.m[1])} im Monat, monatlich kündbar nach 30 Tagen. Nach Eingang der Anzahlung von 50 % starten wir mit dem Kickoff. Ich freue mich!`]];

const BUILD=c=>["Angebot und Vertrag schicken, 50 % Anzahlung kassieren, erst dann bauen!","Kickoff-Call: Ziele, Abläufe, Zugänge, häufige Kundenfragen sammeln",`Ersten Prototyp vom ${c.p} in 7 Tagen bauen`,"Prototyp zeigen, Feedback einholen, eine Korrekturrunde","Livegang mit kurzer Einweisung fürs Team","Restzahlung und Monatsabo starten","Nach 2 Wochen Ergebnisse zeigen und um ein Testimonial bitten",`Nach Empfehlungen fragen: „Welche anderen ${c.n} kennen Sie?“`];

const COACH=[
["Verkaufe das Ergebnis, nicht die Technik","Niemand kauft „KI“. Kunden kaufen mehr Termine, weniger Stress und mehr Umsatz. Sprich in Euro und Stunden."],
["Zwei Schritte: Anruf → Demo → Abschluss","Im Kaltanruf verkaufst du nur den 15-Minuten-Termin. Erst in der Demo kommen Preis und Abschluss. So bleibt der Druck im ersten Call niedrig."],
["Fragen statt reden","Wer fragt, führt. Lass den Kunden sein Problem und seine Zahlen selbst nennen. Was er selbst sagt, glaubt er."],
["Ehrlich bleiben","Sag „Ich habe eine Vorschau vorbereitet“, nicht „Das läuft schon bei 20 Kunden“. Ehrlichkeit macht dich vertrauenswürdig und schützt dich rechtlich."],
["Immer einen nächsten Schritt","Kein Gespräch endet ohne Termin oder klares Nein. Trag jeden Rückruf mit Datum im Tab „Leads“ ein."],
["Nachfassen ist alles","Die meisten Abschlüsse kommen nach mehreren Kontakten. Fass nach 2, 5 und 10 Tagen nach, die Vorlagen findest du im Tab „Demo & Abschluss“."],
["Die Zahlen des Spiels","Grobe Richtwerte: 100 Wählversuche → 40 Gespräche → 8 Demos → 2 Abschlüsse. Jedes Nein bringt dich dem Ja näher."],
["Eine Nische, volle Konzentration","Bleib den ganzen Sprint bei einer Branche. Du lernst ihre Sprache und wirst mit jedem Gespräch besser."],
["Rechtlicher Hinweis zur Kaltakquise","In Deutschland sind unaufgeforderte Werbeanrufe auch bei Firmen nur erlaubt, wenn ein mutmaßliches Interesse besteht (§ 7 UWG). Ein konkreter Bezug zum Betrieb hilft, Garantie ist er nicht. Sicherer sind LinkedIn, E-Mail mit Bezug oder persönlicher Besuch. Lass dich im Zweifel rechtlich beraten."]];

const MISSION=d=>d<=3?["Vorbereiten","Leads sammeln, Vorschau bauen, Pitch üben. Ziel: 30 Leads und ein fertiges Mockup."]:d<=10?["Telefonieren","Heute 20 Wählversuche in zwei Blöcken. Ziel: 2 Demo-Termine diese Woche."]:d<=24?["Demos & Nachfassen","20 Wählversuche plus alle fälligen Rückrufe. Jede Demo endet mit der Abschlussfrage."]:["Abschließen","Alle offenen Demos und Angebote nachfassen. Jetzt zählt jede Zusage."];