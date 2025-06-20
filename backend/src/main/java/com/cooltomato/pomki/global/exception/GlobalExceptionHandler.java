package com.cooltomato.pomki.global.exception;
 
import io.jsonwebtoken.ExpiredJwtException;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.validation.FieldError;

import java.sql.SQLException;

@Hidden
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(AlreadyExistsMemberException.class)
    public ResponseEntity<String> handleAlreadyExistsMemberException(AlreadyExistsMemberException exception){
        log.error("{} : AlreadyExistsMember", exception.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(exception.getMessage());
    }
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException exception) {
        log.error("Runtime exception: ", exception);
        String message="Request Failed";
        if(exception.getCause()==null){
            message = exception.getMessage();
        }

        return ResponseEntity.badRequest().body(message);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneralException(Exception exception) {
        log.error("General exception: ", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal Server Error");
    }
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<String> handleNotFoundException(NotFoundException exception) {
        log.error("NotFoundException: ", exception);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(exception.getMessage());
    }
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<String> handleUsernameNotFoundException(UsernameNotFoundException exception) {
        log.error("UsernameNotFoundException: ", exception);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(exception.getMessage());
    }
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<String> handleBadRequestException(BadRequestException exception) {
        log.error("BadRequestException: ", exception);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(exception.getMessage());
    }
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<String> handleBadCredentialsException(BadCredentialsException exception) {
        log.error("BadCredentialsException: ", exception);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(exception.getMessage());
    }
    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<String> handleExpiredJwtException(ExpiredJwtException exception) {
        log.error("JWT token is expired: ", exception);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token is expired");
    }
    @ExceptionHandler(SQLException.class)
    public ResponseEntity<String> handleSQLException(SQLException exception) {
        log.error("SQLException: ", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal Server Error");
    }
    @ExceptionHandler(AlreadyExistsEmailException.class)
    public ResponseEntity<String> handleAlreadyExistsEmailException(AlreadyExistsEmailException exception){
        log.error("{} : AlreadyExistsEmailException", exception.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(exception.getMessage());
    }
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentExceptionException(IllegalArgumentException exception){
        log.error("{} : IllegalArgumentExceptionException", exception.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST )
                .body(exception.getMessage());
    }
    @ExceptionHandler(MemberRegisterException.class)
    public ResponseEntity<String> handleMemberRegisterException(MemberRegisterException exception) {
        log.error("MemberRegisterException: ", exception);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(exception.getMessage());
    }
    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<String> handleInvalidTokenException(InvalidTokenException exception) {
        log.error("InvalidTokenException: ", exception);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(exception.getMessage());
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationException(MethodArgumentNotValidException exception) {
        log.error("Validation exception: ", exception);
        
        StringBuilder errorMessage = new StringBuilder();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            if (errorMessage.length() > 0) {
                errorMessage.append(", ");
            }
            errorMessage.append(fieldError.getDefaultMessage());
        }
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMessage.toString());
    }
}