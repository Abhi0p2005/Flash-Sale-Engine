package com.flashengine.flashEngine.exception;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<Map<String,Object>> handleOptimisticLockingFailure(ObjectOptimisticLockingFailureException ex){
        Map<String,Object> response = new HashMap<>();
        response.put("status", "BUSY");
        response.put("message", "System is busy processing transactions. Please retry your request");
        
        return new ResponseEntity<>(response, HttpStatus.TOO_MANY_REQUESTS);
    }
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String,Object>> handleDuplicateRequest(IllegalStateException ex){
        Map<String,Object> response = new HashMap<>();
        response.put("status","DUPLICATE");
        response.put("message",ex.getMessage());

        return new ResponseEntity<>(response,HttpStatus.CONFLICT);
    }

}
