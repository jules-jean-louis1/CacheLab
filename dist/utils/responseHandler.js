"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.ResponseHandler = void 0;
class ResponseHandler {
    static success(data, message, statusCode = 200) {
        return {
            success: true,
            message,
            data,
            statusCode,
            timestamp: new Date().toISOString()
        };
    }
    static error(error, statusCode = 500, details) {
        return {
            success: false,
            error,
            statusCode,
            timestamp: new Date().toISOString(),
            details
        };
    }
    static validationError(errors) {
        return this.error("Validation failed", 400, { validationErrors: errors });
    }
    static notFound(resource) {
        return this.error(`${resource} not found`, 404);
    }
    static conflict(resource) {
        return this.error(`${resource} already exists`, 409);
    }
    static internalError(message = "Internal server error") {
        return this.error(message, 500);
    }
}
exports.ResponseHandler = ResponseHandler;
class ErrorHandler {
    static handleError(error, context) {
        console.error(`Error in ${context || 'unknown context'}:`, error);
        if (error.message.includes('already exists')) {
            return ResponseHandler.conflict(error.message);
        }
        if (error.message.includes('not found')) {
            return ResponseHandler.notFound(error.message);
        }
        return ResponseHandler.internalError(error.message);
    }
    static async asyncErrorHandler(operation, context) {
        try {
            const result = await operation();
            return ResponseHandler.success(result);
        }
        catch (error) {
            return this.handleError(error, context);
        }
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=responseHandler.js.map