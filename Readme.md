# [Sii-Mobility](http://www.sii-mobility.org) Dev Kit [Mobile App](http://www.km4city.org/app/)[Km4city](http://www.km4city.org)

[Sii-Mobility](http://www.sii-mobility.org) Dev Kit [Mobile App](http://www.km4city.org/app/)[Km4city](http://www.km4city.org) è un kit di sviluppo per creare app ibride (attraverso il framework [Apache Cordova](https://cordova.apache.org) utilizzando l'infastruttura [Km4city](http://www.km4city.org) creata e mantenuta da [Disit Lab](http://www.disit.org) presso l'[Università degli studi di Firenze](http://www.unifi.it).

## Getting Started

# Requirements

 - [Java Development Kit >= 1.8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
 - [Node.js >= LTS 6.9.4](https://nodejs.org/it/) 
 - Cordova Apache >= 6.4.0 (Si può installare con il comando `npm install -g cordova` dato all'interno del "Prompt dei comandi"
 - [Android Studio >= 2.2.3](https://developer.android.com/studio/index.html)
 - Driver USB relativi al dispositivo sul quale andrete a testare l'app generata (per esempio quelli [SAMSUNG](http://downloadcenter.samsung.com/content/DR/201602/20160217043054798/SAMSUNG_USB_Driver_for_Mobile_Phones_v1.5.45.00.exe))

# First Start

 1. Installati i requisiti dovrete scaricare questo progetto da github e posizionarlo in una cartella all'interno del PC
 2. Aprite il "Prompt dei comandi" e navigate fino a raggiungere la root del progetto.
 3. Eseguite il comando `cordova build android`
 4. Risultato building
	1. Se tutto è andato a buon fine avrete ricevuto come output (ovviamente i secondi che ha impiegato ad eseguire il build possono cambiare), seguito dal percorso che indica dove è stato creato l'APK di debug (di default %YOUR_FOLDER%/siiMobilityAppKit/platforms/android/build/outputs/apk/android-debug.apk:
	```
	BUILD SUCCESSFUL
	Total time: 5.169 secs
	Built the following apk(s)
	```
 	2. Se appare un messaggio di errore relativo a licenze non accettate, si deve aprire Android Studio e controllare che sia stato installato l'SDK attraverso l'SDK Manager e installare eventuali aggiornamenti proposti. Durante tali aggiornamenti vi sarà richiesto di accettare alcune licenze e questo sbloccherà l'errore che si presentava durante il build dell'apk. Fatto questo ripartite dal punto 3.

## Bugs and Issues

Hai problemi a sviluppare con questo App Kit? [Apri un nuovo Issue](https://github.com/disit/siiMobilityAppKit/issues) qui su GitHub.


## License

Termini e modalità di utilizzo del software denominato Sii-Mobility Dev Kit Mobile App Km4City. Che è da intendere come uno strumento di sviluppo per moduli della applicazione mobile Sii-Mobility APPs, denominata "Firenze dove cosa", "Toscana dove cosa", e che utilizzano tecnologia Km4City.org.
 
Potete utilizzare, distribuire, modificare Sii-Mobility Dev Kit Mobile App Km4City nei termini indicati dalla GNU Affero GPL (AGPL). Solo per lo sviluppo di moduli dell'applicazione mobile Sii-Mobility APPs, denominata "Firenze dove cosa", "Toscana dove cosa", e che utilizzano tecnologia Km4City.org, se non altrimenti concordato con DISIT.org.

Sii-Mobility Dev Kit Mobile App Km4City copyright © DISIT lab and Sii-Mobility.org
Sii-Mobility Dev Kit Mobile App Km4City has been developed and is maintained by DISIT lab e Sii-Mobility.org

License: The interactive user interfaces in modified source and object code versions of this program must display Appropriate Legal Notices, as required under Section 5 of the GNU Affero GPL . In accordance with Section 7(b) of the GNU Affero GPL , these Appropriate Legal Notices must retain the display of the "Sii-Mobility Dev Kit Mobile App Km4City" logo. The Logo "Sii-Mobility Dev Kit Mobile App Km4City" must be a clickable link that leads directly to the Internet URL http://www.sii-mobility.org oppure a DISIT Lab., using technology derived from  Http://www.km4city.org

Questa applicazione è stata sviluppata ed è accessibile per permettero lo sviluppo di moduli aggiuntivi sulle App Sii-Mobility e che usano tecnologia Km4City.  La stessa applicazione è oggetto di un tutorial dove è stato presentato il codice sorgente e il procedimento per svilupparla in modo rapido. L’applicazione con i suoi sorgenti sono concessi in licenza Open Source, GNU Affero GPL . I dati utilizzati e su cui si basa l’applicazione sono stati forniti dal Comune di Firenze come Open Data e da servizi della Regione Toscana, dalla città Metropolitana di Firenze, e da Lamma. La descrizione di questi dati è accessibile su DISIT.org e Sii-Mobility.org, ed in particolare i dati fanno riferimento al modello aperto Km4City ed al processo di ingestione, aggregazione, quality improvement e riconciliazione descritto durante l’evento stesso.
Gli sviluppatori non garantiscono che il servizio oggi attivo sul quale si basa questa applicazione come strumento di sviluppo possa mantenersi nella stessa forma e/o attivo per sempre e/o nelle prossime settimane.  Se intendete creare altre applicazioni partendo da questo codice, anche solo in parte, tutto il testo contenuto in questa pagina deve essere riportato in ogni nuova versione di questo software, in una posizione analoga a quella attuale, nel menu principale. Essendo Open Source il codice stesso deve essere ri-pubblicato, a questo fine potete inviarlo a info@disit.org oppure pubblicarlo su altro sito web comunicandolo sempre a info@disit.org, in modo che questo stesso codice possa essere via via migliorato per tutti. La stessa procedura puo' essere seguita per pubblicare nuovi moduli per le applicazioni Sii-mobility.