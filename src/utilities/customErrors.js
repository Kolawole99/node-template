class MyError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class CustomValidationError extends MyError {}
class CustomControllerError extends MyError {}

global.CustomValidationError = CustomValidationError;
global.CustomControllerError = CustomControllerError;
