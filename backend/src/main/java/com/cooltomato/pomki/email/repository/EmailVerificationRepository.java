package com.cooltomato.pomki.email.repository;

import org.springframework.data.repository.CrudRepository;

import com.cooltomato.pomki.email.entity.EmailVerification;

public interface EmailVerificationRepository extends CrudRepository<EmailVerification, String> {
} 