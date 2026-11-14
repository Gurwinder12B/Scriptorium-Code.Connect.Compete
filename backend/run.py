import os
import sys
import traceback
from flask import Flask, jsonify

class DiagnosticWSGIMiddleware:
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        try:
            return self.wsgi_app(environ, start_response)
        except Exception as e:
            trace = traceback.format_exc()
            print(f"[RUNTIME CRASH IN WSGI]:\n{trace}", file=sys.stderr)
            import json
            payload = json.dumps({
                "status": "error",
                "code": 500,
                "title": "Scriptorium WSGI Runtime Error",
                "error_type": type(e).__name__,
                "error_message": str(e),
                "traceback": trace.splitlines()
            }, indent=2).encode("utf-8")
            start_response("500 Internal Server Error", [
                ("Content-Type", "application/json"),
                ("Content-Length", str(len(payload)))
            ])
            return [payload]

try:
    from app import create_app
    app = create_app(os.getenv("FLASK_ENV", "production" if os.getenv("VERCEL") else "development"))
    app.wsgi_app = DiagnosticWSGIMiddleware(app.wsgi_app)
except Exception as e:
    err_trace = traceback.format_exc()
    print(f"[FATAL STARTUP ERROR IN SCRIPTORIUM]:\n{err_trace}", file=sys.stderr)
    err_app = Flask(__name__)

    @err_app.route("/", defaults={"path": ""})
    @err_app.route("/<path:path>")
    def startup_error(path):
        return jsonify({
            "status": "error",
            "code": 500,
            "title": "Scriptorium Backend Startup Failure",
            "error_type": type(e).__name__,
            "error_message": str(e),
            "traceback": err_trace.splitlines()
        }), 500

    app = err_app

if __name__ == "__main__":
    from app.extensions import db
    with app.app_context():
        # Ensure database tables exist in local development
        db.create_all()
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=app.config.get("DEBUG", True))

