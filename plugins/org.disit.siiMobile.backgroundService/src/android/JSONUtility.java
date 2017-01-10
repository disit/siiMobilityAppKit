package org.disit.siiMobile.backgroundService;

import org.json.JSONArray;
import org.json.JSONException;

public class JSONUtility {

	public static JSONArray concatArray(JSONArray... arrs) throws JSONException {
		JSONArray result = new JSONArray();
		for (JSONArray arr : arrs) {
			for (int i = 0; i < arr.length(); i++) {
				result.put(arr.getJSONObject(i));
			}
		}
		return result;
	}

	public static JSONArray subArrayFromEnd(JSONArray jsonArray, int newSize)
			throws JSONException {
		if (jsonArray.length() < newSize) {
			return jsonArray;
		}
		JSONArray result = new JSONArray();
		for (int i = jsonArray.length() - newSize; i < jsonArray.length(); i++) {
			result.put(jsonArray.getJSONObject(i));
		}
		return result;
	}

	public static JSONArray subArrayFromStart(JSONArray jsonArray, int newSize)
			throws JSONException {
		if (jsonArray.length() < newSize) {
			return jsonArray;
		}
		JSONArray result = new JSONArray();
		for (int i = 0; i < newSize; i++) {
			result.put(jsonArray.getJSONObject(i));
		}
		return result;
	}

	public static JSONArray subArrayFromIndexToEnd(JSONArray jsonArray, int index)
			throws JSONException {
		JSONArray result = new JSONArray();
		if (jsonArray.length() < index) {
			return new JSONArray();
		}
		for (int i = index; i < jsonArray.length(); i++) {
			if (i >= 0) {
				result.put(jsonArray.getJSONObject(i));
			}
		}
		return result;
	}

}