enum ResponseMessage {
    SUCCESS = "Successfull",
    BLANK_INPUT = "Input cannot be blank",
    TOKEN_INVALID = "Token is invalid",
    TOKEN_MISSING = "Missing token",
    ACCESS_DENIED = "Access denied",
    ARRAY_IS_EMPTY = "Array cannot be empty",
    PAYLOAD_IS_REQUIRED = "Payload is required",
    USER_ALREADY_EXISTS = "User already exists",
    USER_ALREADY_LOGIN = "User already login",
    NOT_FOUND = "Not found",
    WRONG_PASSWORD = "Wrong password",
    GENERATE_TOKEN_ERROR = "Generate token error",
    UNEXPECTED_ERROR = "Unexpected Error",
}

enum RequestMethod {
    POST = "POST",
    PUT = "PUT",
    GET = "GET",
    DELETE = "DELETE",
    PATCH = "PATCH",
}

enum AuthToken {
    RF = "refreshToken",
    AC = "accessToken",
}

export {ResponseMessage, RequestMethod, AuthToken};
