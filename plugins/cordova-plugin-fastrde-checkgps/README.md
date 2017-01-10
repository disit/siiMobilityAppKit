# cordova-plugin-fastrde-checkgps 
Plugin to Check if GPS enabled on iOS and Android

## install
```
yourAppDir$ phonegap plugin add https://github.com/fastrde/cordova-plugin-fastrde-checkgps.git
```

## usage

```javascript
CheckGPS.check(function win(){
    //GPS is enabled!

  },
  function fail(){
    //GPS is disabled!

  });
```
