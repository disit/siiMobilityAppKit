# [Sii-Mobility](http://www.sii-mobility.org) Dev Kit [Mobile App](http://www.km4city.org/app/)[Km4city](http://www.km4city.org)

[Sii-Mobility](http://www.sii-mobility.org) Dev Kit [Mobile App](http://www.km4city.org/app/)[Km4city](http://www.km4city.org) è un kit di sviluppo per creare app ibride (attraverso il framework [Apache Cordova](https://cordova.apache.org) utilizzando l'infastruttura [Km4city](http://www.km4city.org) creata e mantenuta da [Disit Lab](http://www.disit.org) presso l'[Università degli studi di Firenze](http://www.unifi.it).

Read this in other languages: [English](https://github.com/disit/siiMobilityAppKit/blob/master/Readme.en.md)

## Getting Started

# Requirements

 - [Java Development Kit >= 1.8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
 - [Node.js >= LTS 8.9.1](https://nodejs.org/it/) 
 - [Cordova Apache >= 7.1.0] (https://cordova.apache.org/)
 - Android Studio >= 3.0.0](https://developer.android.com/studio/index.html)
 - [Grunt >= 1.0.1](https://gruntjs.com/)
 - Driver USB relativi al dispositivo sul quale andrete a testare l'app generata (per esempio quelli [SAMSUNG](http://downloadcenter.samsung.com/content/DR/201602/20160217043054798/SAMSUNG_USB_Driver_for_Mobile_Phones_v1.5.45.00.exe))

# First Start

 1. Installati i requisiti dovrete scaricare questo progetto da github e posizionarlo in una cartella all'interno del PC
 2. Aprite il "Prompt dei comandi" e navigate fino a raggiungere la root del progetto.
 3. Installate i seguenti pacchetti con i comandi:
	* npm install grunt-json-merger
	* npm install grunt-contrib-concat
	* npm install grunt-contrib-clean 
 4. Eseguite il comando 'build' (tale comando unirà rispettivamente i file js e i file json delle labels e salverà i file risultanti in www/js/build)
 5. Risultato building
	* Se tutto è andato a buon fine avrete ricevuto come output (ovviamente i secondi che ha impiegato ad eseguire il build possono cambiare), seguito dal percorso che indica dove è stato creato l'APK di debug (di default %YOUR_FOLDER%/siiMobilityAppKit/platforms/android/build/outputs/apk/android-debug.apk:
	```
	BUILD SUCCESSFUL in 3m 40s
		47 actionable tasks: 13 executed, 34 up-to-date
		Built the following apk(s):
		```
 	* Se appare un messaggio di errore relativo a licenze non accettate, si deve aprire Android Studio e controllare che sia stato installato l'SDK attraverso l'SDK Manager e installare eventuali aggiornamenti proposti. Durante tali aggiornamenti vi sarà richiesto di accettare alcune licenze e questo sbloccherà l'errore che si presentava durante il build dell'apk. Fatto questo ripartite dal punto 4.

N.B.: Quando viene creato un nuovo modulo, per la visualizzazione del nuovo bottone nel menù, si deve inserire l'oggetto JSON relativo al bottone all'interno del file www/js/data/json/PrincipalMenu.json

## Bugs and Issues

Hai problemi a sviluppare con questo App Kit? [Apri un nuovo Issue](https://github.com/disit/siiMobilityAppKit/issues) qui su GitHub.


## License

 ITALIANO:

Termini e modalità di utilizzo del software denominato Sii-Mobility Dev Kit Mobile App Km4City. Che è da intendere come uno strumento di sviluppo per moduli della applicazione mobile Sii-Mobility APPs, denominata "Firenze dove cosa", "Toscana dove cosa", e che utilizzano tecnologia Km4City.org.

Potete utilizzare, distribuire, modificare Sii-Mobility Dev Kit Mobile App Km4City nei termini indicati dalla GNU Affero GPL (AGPL). Solo per lo sviluppo di moduli dell'applicazione mobile Sii-Mobility APPs, denominata "Firenze dove cosa", "Toscana dove cosa", e che utilizzano tecnologia Km4City.org, se non altrimenti concordato con DISIT.org.

Sii-Mobility Dev Kit Mobile App Km4City copyright © DISIT lab and Sii-Mobility.org
Sii-Mobility Dev Kit Mobile App Km4City has been developed and is maintained by DISIT lab e Sii-Mobility.org

License: The interactive user interfaces in modified source and object code versions of this program must display Appropriate Legal Notices, as required under Section 5 of the GNU Affero GPL . In accordance with Section 7(b) of the GNU Affero GPL , these Appropriate Legal Notices must retain the display of the "Sii-Mobility Dev Kit Mobile App Km4City" logo. The Logo "Sii-Mobility Dev Kit Mobile App Km4City" must be a clickable link that leads directly to the Internet URL http://www.sii-mobility.org oppure a DISIT Lab., using technology derived from  Http://www.km4city.org

Questa applicazione è stata sviluppata ed è accessibile per permettero lo sviluppo di moduli aggiuntivi sulle App Sii-Mobility e che usano tecnologia Km4City.  La stessa applicazione è oggetto di un tutorial dove è stato presentato il codice sorgente e il procedimento per svilupparla in modo rapido. L’applicazione con i suoi sorgenti sono concessi in licenza Open Source, GNU Affero GPL . I dati utilizzati e su cui si basa l’applicazione sono stati forniti dal Comune di Firenze come Open Data e da servizi della Regione Toscana, dalla città Metropolitana di Firenze, e da Lamma. La descrizione di questi dati è accessibile su DISIT.org e Sii-Mobility.org, ed in particolare i dati fanno riferimento al modello aperto Km4City ed al processo di ingestione, aggregazione, quality improvement e riconciliazione descritto durante l’evento stesso.
Gli sviluppatori non garantiscono che il servizio oggi attivo sul quale si basa questa applicazione come strumento di sviluppo possa mantenersi nella stessa forma e/o attivo per sempre e/o nelle prossime settimane.  Se intendete creare altre applicazioni partendo da questo codice, anche solo in parte, tutto il testo contenuto in questa pagina deve essere riportato in ogni nuova versione di questo software, in una posizione analoga a quella attuale, nel menu principale. Essendo Open Source il codice stesso deve essere ri-pubblicato, a questo fine potete inviarlo a info@disit.org oppure pubblicarlo su altro sito web comunicandolo sempre a info@disit.org, in modo che questo stesso codice possa essere via via migliorato per tutti. La stessa procedura puo' essere seguita per pubblicare nuovi moduli per le applicazioni Sii-mobility.

ENGLISH:
Terms and methods of use of the software called Sii-Mobility Mobile App Dev Kit Km4City . Which is to be understood as a development tool for mobile applications modules of Sii- Mobility Apps, called " Florence where what", " Tuscany Where what" and that use Km4City.org technology.

You can use, distribute, modify Sii- Mobility Mobile App Dev Kit Km4City within the terms specified by the GNU Affero GPL ( AGPL ) . Only for the development of the mobile application modules Sii- Mobility APPs , called " Florence where what", " Tuscany where what ," and that use Km4City.org technology, if not otherwise agreed with DISIT.org.

Sii-Mobility Dev Kit Mobile App Km4City copyright © DISIT lab and Sii-Mobility.org
Sii-Mobility Dev Kit Mobile App Km4City has been developed and is maintained by DISIT lab e Sii-Mobility.org

License: The interactive user interfaces in modified source and object code versions of this program must display Appropriate Legal Notices, as required under Section 5 of the GNU Affero GPL . In accordance with Section 7(b) of the GNU Affero GPL , these Appropriate Legal Notices must retain the display of the "Sii-Mobility Dev Kit Mobile App Km4City" logo. The Logo "Sii-Mobility Dev Kit Mobile App Km4City" must be a clickable link that leads directly to the Internet URL http://www.sii-mobility.org oppure a DISIT Lab., using technology derived from  Http://www.km4city.org

This application has been developed and is available for to make easier the work of developers in producing additional modules for the App Sii-Mobility using Km4City technology. The application has been the subject of a tutorial where it has been presented as source code and how to develop it quickly. The application and its sources are licensed Open Source, Affero GPL. The data used and on which the application was provided by the city as open data and services of the Tuscany Region, the underground city of Florence, and Lamma. The description of this data is available on DISIT.org and Sii-Mobility.org, and in particular the data refer to the open model Km4City and the ingestion process, aggregation, quality improvement and Reconciliation described during the event itself.
Developers do not guarantee that the service active today that underpins this application as a development tool can remain in the same shape and / or active forever and / or in the coming weeks. If you want to create other applications from this code, even in part, all the text on this page should be included in all new version of this software, in a position similar to the current one, in the main menu. Being open source the code itself must be re-published, for this purpose you can send it to info@disit.org or post it on another web site notifying always info@disit.org, so that the same code can be gradually improved for all. The same procedure can be followed to publish new modules for the Sii-mobility Apps.


 
