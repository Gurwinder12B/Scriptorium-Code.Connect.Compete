from flask import jsonify

def success_response(data=None, meta=None, status_code=200):
    payload = {
        "success": True,
        "data": data if data is not None else {}
    }
    if meta is not None:
        payload["meta"] = meta
    return jsonify(payload), status_code

def created_response(data=None, meta=None, message=None, status_code=201):
    payload = {
        "success": True,
        "data": data if data is not None else {}
    }
    if message:
        payload["message"] = message
    if meta is not None:
        payload["meta"] = meta
    return jsonify(payload), status_code

def error_response(code="INTERNAL_ERROR", message="An unexpected error occurred.", details=None, status_code=500):
    payload = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details or {}
        }
    }
    return jsonify(payload), status_code

