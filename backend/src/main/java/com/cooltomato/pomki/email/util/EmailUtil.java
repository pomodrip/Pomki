package com.cooltomato.pomki.email.util;

import java.security.SecureRandom;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EmailUtil {
    
    private final JavaMailSender mailSender;
    @Value("${pomki.email.sender-name}")
    private String senderName;
    @Value("${pomki.email.sender-name}")
    private String fromEmail;
    
    public void sendEmail(String toEmail, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderName + " <" + fromEmail + ">");
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(content);
        
        mailSender.send(message);
    }
    
    public static String generateCode(int length) {
        String charSet = "0123456789";
        StringBuilder sb = new StringBuilder();
        SecureRandom random = new SecureRandom();
        for (int i = 0; i < length; i++) {
            int randomIndex = random.nextInt(charSet.length());
            sb.append(charSet.charAt(randomIndex));
        }
        return sb.toString();
    }
} 