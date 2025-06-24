package com.cooltomato.pomki.global.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Configurable;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;

import jakarta.annotation.PostConstruct;

@Configurable
public class FCMConfig {
    private FirebaseApp firebaseApp;

    @PostConstruct
    public FirebaseApp initializeFcm() throws IOException {
        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.getApplicationDefault())
                .build();
        firebaseApp = FirebaseApp.initializeApp(options);
        return firebaseApp;
    }

    public FirebaseMessaging initFirebaseMessaging() {
        return FirebaseMessaging.getInstance(firebaseApp);
    }
}
