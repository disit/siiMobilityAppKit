package org.disit.siiMobile.backgroundService;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.provider.Settings;

import com.red_folder.phonegap.plugin.backgroundservice.BackgroundService;




public class BackgroundTracker extends BackgroundService implements
		LocationListener {

	private Location location;
	private LocationManager locationManager;
	private boolean isThreadStarted = false;
	private HandlerThread thread;
	private SimpleDateFormat dateFormat = new SimpleDateFormat(
			"yyyy-MM-dd HH:mm:ss", Locale.ITALY);

	private int doWorkIntervalPeriod = 30000;
	private int scanAndSendPeriod = 180000;
	private int resendIntervalPeriod = 30000;

	private long countExecution = 0;
	private long lastStarting = new Date().getTime();
	private long now = 0;

	private JSONObject logBackgroundService;
	private int sizeOfLogBackgroundTracker = 500;

	private int maxAgeLocation = 30000;
	private int counterOfLocationRequest;
	private int limitOfLocationRequest = 2;


	private JSONObject result = new JSONObject();
	private Handler myHandler;

	@Override
	protected JSONObject doWork() {
		setMilliseconds(doWorkIntervalPeriod);
		this.now = new Date().getTime();
		dateFormat.setTimeZone(TimeZone.getTimeZone("Europe/Rome"));

		try {
			logBackgroundService = loadJSONObject("logBackgroundService.json");
			if (logBackgroundService.isNull("lines")) {
				initLog();
			}
		} catch (JSONException e) {
			initLog();
			e.printStackTrace();
		}


		this.counterOfLocationRequest = 0;
		countExecution++;
		long slotToExecute = 1 + (this.now - lastStarting)/doWorkIntervalPeriod;
		writeLog("START SERVICE " + countExecution + " ON " + slotToExecute + " FROM " + dateFormat.format(new Date(lastStarting)));

		locationManager = (LocationManager) this.getSystemService(Context.LOCATION_SERVICE);

		location = null;
		if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)|| locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
			if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
				location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
			} else if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER) && location == null) {
				location = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
			}
			if (location != null) {
				if (location.getLatitude() != 0 && location.getLongitude() != 0) {
					if (Math.abs(location.getTime() - this.now) < this.maxAgeLocation) {

					} else {
						writeLog("LOCATION OLD");
						requestNewLocation();
					}
				}
			} else {
				writeLog("LOCATION NULL");
				requestNewLocation();
			}
		} else {
			writeLog("NO LOCATION PROVIDER ACTIVE");
		}

		JSONObject message = new JSONObject();
		try {
			message = new JSONObject().put("Message", logBackgroundService.toString());
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return message;
	}

	private void cleanLogBackgroundTracker() {
		try {
			logBackgroundService.put("lines", JSONUtility.subArrayFromEnd(
					logBackgroundService.getJSONArray("lines"), sizeOfLogBackgroundTracker));
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}

	private void initLog() {
		logBackgroundService = new JSONObject();
		try {
			logBackgroundService.put("lines", new JSONArray());
		} catch (JSONException e) {
			e.printStackTrace();
		}

	}

	@Override
	protected JSONObject getConfig() {
		JSONObject result = new JSONObject();

		/*
		 * try { result.put("HelloTo", this.mHelloTo); } catch (JSONException e)
		 * { }
		 */

		return result;
	}

	@Override
	protected void setConfig(JSONObject config) {
		
	}

	@Override
	protected JSONObject initialiseLatestResult() {
		return null;
	}

	@Override
	protected void onTimerEnabled() {
		Intent intent = new Intent(this, BackgroundTracker.class);
		PendingIntent pintent = PendingIntent.getService(this, 0, intent, 0);
		AlarmManager alarmManager = (AlarmManager)getSystemService(Context.ALARM_SERVICE);
		alarmManager.setRepeating(AlarmManager.RTC_WAKEUP, System.currentTimeMillis(), doWorkIntervalPeriod, pintent);
	}

	@Override
	protected void onTimerDisabled() {

	}
	
	private void requestNewLocation(){
		writeLog("TRY TO GET NEW LOCATION-" + this.counterOfLocationRequest);
		
		if (!isThreadStarted) {
			this.thread = new HandlerThread(
					"LooperForGPSRequestTracker",
					Thread.MAX_PRIORITY);
			thread.start();
			isThreadStarted = true;
		}
		try {
			Criteria criteria = new Criteria();
			criteria.setAccuracy(Criteria.ACCURACY_FINE);
			
			locationManager.requestSingleUpdate(criteria, this, this.thread.getLooper());
			myHandler = new Handler(this.thread.getLooper());
			myHandler.postDelayed (new Runnable() {
				public void run() {
					locationManager.removeUpdates(BackgroundTracker.this);
					writeLog("STOP UPDATING POSITION");
				}
			}, 6000);

		} catch (Exception e) {
			writeLog("REQUEST POSITION EXCEPTION");
			e.printStackTrace();
		}
	}
	
	@Override
	public void onLocationChanged(Location currentLocation) {
		myHandler.removeCallbacksAndMessages(null);
		writeLog("NEW LOCATION TIME: " + dateFormat.format(new Date(currentLocation.getTime())));
		//writeLog("LAT: " + currentLocation.getLatitude() + " LON: " + currentLocation.getLongitude() + " PROV: " + currentLocation.getProvider());
			if (currentLocation.getLatitude() != 0 && currentLocation.getLongitude() != 0) {
				if (Math.abs(currentLocation.getTime() - new Date().getTime()) < this.maxAgeLocation) {
					location = currentLocation;

				} else {
					writeLog("ALSO NEW LOCATION IS OLD");
					if(this.counterOfLocationRequest < this.limitOfLocationRequest){
						this.counterOfLocationRequest++;
						requestNewLocation();
					}
				}
			}
	}

	@Override
	public void onStatusChanged(String provider, int status, Bundle extras) {

	}

	@Override
	public void onProviderEnabled(String provider) {

	}

	@Override
	public void onProviderDisabled(String provider) {

	}

	private void saveJSONArray(String filename, JSONArray jsonToSave) {
		FileOutputStream fos;
		Writer out;

		File file = new File(getFilesDir(), filename);

		try {
			fos = this.openFileOutput(file.getName(), Context.MODE_PRIVATE);
			out = new OutputStreamWriter(fos);
			out.write(jsonToSave.toString());
			out.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private JSONArray loadJSONArray(String filename) throws JSONException {
		FileInputStream fis;
		try {
			fis = this.openFileInput(filename);
			BufferedReader in = new BufferedReader(new InputStreamReader(fis));
			String completeJson = "";
			String s;
			while ((s = in.readLine()) != null) {
				completeJson += s;
			}
			in.close();
			if (completeJson != "") {
				return new JSONArray(completeJson);

			} else {
				return new JSONArray();
			}
		} catch (IOException e) {
			e.printStackTrace();
			return new JSONArray();
		}
	}

	private void saveJSONObject(String filename, JSONObject jsonToSave) {
		FileOutputStream fos;
		Writer out;

		File file = new File(getFilesDir(), filename);

		try {
			fos = this.openFileOutput(file.getName(), Context.MODE_PRIVATE);
			out = new OutputStreamWriter(fos);
			out.write(jsonToSave.toString());
			out.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private JSONObject loadJSONObject(String filename) throws JSONException {
		FileInputStream fis;
		try {
			fis = this.openFileInput(filename);
			BufferedReader in = new BufferedReader(new InputStreamReader(fis));
			String completeJson = "";
			String s;
			while ((s = in.readLine()) != null) {
				completeJson += s;
			}
			in.close();
			if (completeJson != "") {
				return new JSONObject(completeJson);

			} else {
				return new JSONObject();
			}
		} catch (IOException e) {
			e.printStackTrace();
			return new JSONObject();
		}
	}
	
	private void writeLog(String textToWrite){
		System.out.println(textToWrite);
		try {
			logBackgroundService.getJSONArray("lines").put(
					new JSONObject().put("line",
							"[" + dateFormat.format(new Date())
									+ "] " + textToWrite));
		} catch (JSONException e1) {
			e1.printStackTrace();
		}
		cleanLogBackgroundTracker();
		saveJSONObject("logBackgroundService.json", logBackgroundService);
	}

}
