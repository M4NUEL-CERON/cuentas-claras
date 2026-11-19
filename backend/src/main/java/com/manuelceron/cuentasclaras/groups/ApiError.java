package com.manuelceron.cuentasclaras.groups;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Errors the API returns on purpose; the message is safe to show to the user. */
public final class ApiError {

    private ApiError() {
    }

    public static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    public static ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }

    public static ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }
}
