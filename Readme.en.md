# [Sii-Mobility](http://www.sii-mobility.org) Dev Kit [Mobile App](http://www.km4city.org/app/)[Km4city](http://www.km4city.org)

[Sii-Mobility](http://www.sii-mobility.org) Dev Kit [Mobile App](http://www.km4city.org/app/)[Km4city](http://www.km4city.org) is a development kit for creating hybrid apps (using the framework [Apache Cordova](https://cordova.apache.org) using infrastracture [Km4city](http://www.km4city.org) created and mantained by [Disit Lab](http://www.disit.org) on the [University of Florence](http://www.unifi.it).

Read this in other languages: [Italian](https://github.com/disit/siiMobilityAppKit/blob/master/Readme.md)

## Getting Started

# Requirements

 - [Java Development Kit >= 1.8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
 - [Node.js >= LTS 8.9.1](https://nodejs.org/it/) 
 - [Cordova Apache >= 7.1.0] (https://cordova.apache.org/)
 - Android Studio >= 3.0.0](https://developer.android.com/studio/index.html)
 - [Grunt >= 1.0.1](https://gruntjs.com/)
 - USB drivers related to the device on which you will test the generated app (i.e. [SAMSUNG](http://downloadcenter.samsung.com/content/DR/201602/20160217043054798/SAMSUNG_USB_Driver_for_Mobile_Phones_v1.5.45.00.exe))

# First Start

 1. Installed the requirements you will need to download this project from github and place it in a folder within the PC.
 2. Open the "Command Prompt" and navigate to the project root.
 3. Install the following packages with commands:
	* npm install grunt-json-merger
	* npm install grunt-contrib-concat
	* npm install grunt-contrib-clean 
 4. Run the 'build' command (this command will merge the js and json labels files respectively and save the resulting files in www/js/build)
 5. Building result
	* If everything has been successful you will have received as output (obviously the seconds that took to build can change), followed by the path that indicates where the debug APK was created. (di default %YOUR_FOLDER%/siiMobilityAppKit/platforms/android/build/outputs/apk/android-debug.apk:
	```
	BUILD SUCCESSFUL in 3m 40s
		47 actionable tasks: 13 executed, 34 up-to-date
		Built the following apk(s):
		```
 	* If an error message appears regarding licenses that are not accepted, you must open Android Studio and check that the SDK has been installed via SDK Manager and install any proposed updates. During such updates you will be asked to accept some licenses and this will unlock the error that occurred during apk build. Once this is done, follow point 4.

N.B.: When a new module is created, for the display of the new button in the menu, you must insert the JSON object relative to the button in the file www/js/data/json/PrincipalMenu. json.

## Bugs and Issues

Do you have any problems developing with this App Kit [Open a new Issue](https://github.com/disit/siiMobilityAppKit/issues) here on GitHub.


## License

ENGLISH:
Terms and methods of use of the software called Sii-Mobility Mobile App Dev Kit Km4City . Which is to be understood as a development tool for mobile applications modules of Sii- Mobility Apps, called " Florence where what", " Tuscany Where what" and that use Km4City.org technology.

You can use, distribute, modify Sii- Mobility Mobile App Dev Kit Km4City within the terms specified by the GNU Affero GPL ( AGPL ) . Only for the development of the mobile application modules Sii- Mobility APPs , called " Florence where what", " Tuscany where what ," and that use Km4City.org technology, if not otherwise agreed with DISIT.org.

Sii-Mobility Dev Kit Mobile App Km4City copyright © DISIT lab and Sii-Mobility.org
Sii-Mobility Dev Kit Mobile App Km4City has been developed and is maintained by DISIT lab e Sii-Mobility.org

License: The interactive user interfaces in modified source and object code versions of this program must display Appropriate Legal Notices, as required under Section 5 of the GNU Affero GPL . In accordance with Section 7(b) of the GNU Affero GPL , these Appropriate Legal Notices must retain the display of the "Sii-Mobility Dev Kit Mobile App Km4City" logo. The Logo "Sii-Mobility Dev Kit Mobile App Km4City" must be a clickable link that leads directly to the Internet URL http://www.sii-mobility.org oppure a DISIT Lab., using technology derived from  Http://www.km4city.org

This application has been developed and is available for to make easier the work of developers in producing additional modules for the App Sii-Mobility using Km4City technology. The application has been the subject of a tutorial where it has been presented as source code and how to develop it quickly. The application and its sources are licensed Open Source, Affero GPL. The data used and on which the application was provided by the city as open data and services of the Tuscany Region, the underground city of Florence, and Lamma. The description of this data is available on DISIT.org and Sii-Mobility.org, and in particular the data refer to the open model Km4City and the ingestion process, aggregation, quality improvement and Reconciliation described during the event itself.
Developers do not guarantee that the service active today that underpins this application as a development tool can remain in the same shape and / or active forever and / or in the coming weeks. If you want to create other applications from this code, even in part, all the text on this page should be included in all new version of this software, in a position similar to the current one, in the main menu. Being open source the code itself must be re-published, for this purpose you can send it to info@disit.org or post it on another web site notifying always info@disit.org, so that the same code can be gradually improved for all. The same procedure can be followed to publish new modules for the Sii-mobility Apps.


 
