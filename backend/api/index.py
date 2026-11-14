import os
import sys
import traceback

# Ensure backend root is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
root_dir = os.path.dirname(parent_dir)

for p in [parent_dir, root_dir, current_dir]:
    if os.path.exists(p) and p not in sys.path:
        sys.path.insert(0, p)

class VercelPathMiddleware:
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        # Restore real requested URI if Vercel internal rewrites rewrote PATH_INFO to /api/index.py
        original_path = (
            environ.get("HTTP_X_MATCHED_PATH")
            or environ.get("HTTP_X_FORWARDED_URI")
            or environ.get("HTTP_X_NOW_ROUTE_MATCHES")
        )
        if original_path:
            clean_path = original_path.split("?", 1)[0]
            environ["PATH_INFO"] = clean_path
        elif environ.get("PATH_INFO") in ["/api/index.py", "/api/index", "/api"]:
            environ["PATH_INFO"] = "/"
        return self.wsgi_app(environ, start_response)

try:
    try:
        from app import create_app
    except ImportError:
        from backend.app import create_app

    app = create_app(os.getenv("FLASK_ENV", "production"))
    app.wsgi_app = VercelPathMiddleware(app.wsgi_app)
except Exception as e:
    from flask import Flask, jsonify
    err_app = Flask(__name__)
    err_msg = f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"

    @err_app.route("/", defaults={"path": ""})
    @err_app.route("/<path:path>")
    def catch_all_error(path):
        return jsonify({
            "status": "error",
            "message": "Scriptorium Backend failed to start on Vercel.",
            "error": err_msg
        }), 500

    app = err_app

