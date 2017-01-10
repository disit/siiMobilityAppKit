package org.disit.siiMobile.backgroundService;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class ShaAlgoritm {

    public static String calculate(String text) throws NoSuchAlgorithmException {
    	MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(text.getBytes());
        
        byte byteData[] = md.digest();
 
        StringBuffer sb = new StringBuffer();
        for (int i = 0; i < byteData.length; i++) {
         sb.append(Integer.toString((byteData[i] & 0xff) + 0x100, 16).substring(1));
        }
     
        return sb.toString();
    }

}