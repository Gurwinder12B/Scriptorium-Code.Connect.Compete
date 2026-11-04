class AppError(Exception):
    def __init__(self, message, code="APP_ERROR", status_code=400, details=None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}

class ValidationError(AppError):
    def __init__(self, message="Validation error", details=None):
        super().__init__(message, code="VALIDATION_ERROR", status_code=400, details=details)

class UnauthorizedError(AppError):
    def __init__(self, message="Authentication required"):
        super().__init__(message, code="AUTH_REQUIRED", status_code=401)

class ForbiddenError(AppError):
    def __init__(self, message="You do not have permission to perform this action"):
        super().__init__(message, code="FORBIDDEN", status_code=403)

class NotFoundError(AppError):
    def __init__(self, message="Resource not found"):
        super().__init__(message, code="NOT_FOUND", status_code=404)

class ConflictError(AppError):
    def __init__(self, message="Resource conflict"):
        super().__init__(message, code="CONFLICT", status_code=409)

