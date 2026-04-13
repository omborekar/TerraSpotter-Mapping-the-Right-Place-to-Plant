package com.example.terraspoter.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/*
 Project: TerraSpotter Platform
 Author: Om Borekar
 Year: 2026
 Description: Global Catch-All Exception Handler including filesystem/upload errors.
*/
@ControllerAdvice
public class GlobalExceptionHandler {

    // Catch-All Exception Handling
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAllExceptions(Exception ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Internal Server Error");
        body.put("message", ex.getMessage());

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // specific FileSystem Handling Exception
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Object> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.EXPECTATION_FAILED.value());
        body.put("error", "Payload Too Large");
        body.put("message", "File is too large! Maximum allowed upload size is exceeded.");

        return new ResponseEntity<>(body, HttpStatus.EXPECTATION_FAILED);
    }
}
