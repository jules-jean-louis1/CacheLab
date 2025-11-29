import { ApiResponse, ErrorResponse } from "../types/types";

export class ResponseHandler {
    static success<T>(data: T, message?: string, statusCode: number = 200): ApiResponse<T> {
        return {
            success: true,
            message,
            data,
            statusCode,
            timestamp: new Date().toISOString()
        };
    }

    static error(error: string, statusCode: number = 500, details?: any): ErrorResponse {
        return {
            success: false,
            error,
            statusCode,
            timestamp: new Date().toISOString(),
            details
        };
    }

    static validationError(errors: string[]): ErrorResponse {
        return this.error(
            "Validation failed",
            400,
            { validationErrors: errors }
        );
    }

    static notFound(resource: string): ErrorResponse {
        return this.error(`${resource} not found`, 404);
    }

    static conflict(resource: string): ErrorResponse {
        return this.error(`${resource} already exists`, 409);
    }

    static internalError(message: string = "Internal server error"): ErrorResponse {
        return this.error(message, 500);
    }
}

export class ErrorHandler {
    static handleError(error: Error, context?: string): ErrorResponse {
        console.error(`Error in ${context || 'unknown context'}:`, error);
        
        if (error.message.includes('already exists')) {
            return ResponseHandler.conflict(error.message);
        }
        
        if (error.message.includes('not found')) {
            return ResponseHandler.notFound(error.message);
        }
        
        return ResponseHandler.internalError(error.message);
    }

    static async asyncErrorHandler<T>(
        operation: () => Promise<T>,
        context: string
    ): Promise<ApiResponse<T> | ErrorResponse> {
        try {
            const result = await operation();
            return ResponseHandler.success(result);
        } catch (error) {
            return this.handleError(error as Error, context);
        }
    }
}