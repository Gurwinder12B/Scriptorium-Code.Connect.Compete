import os
import sys
import traceback

# Ensure both project root and backend folder are in Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "backend")

for p in [backend_dir, root_dir, current_dir]:
    if os.path.exists(p) and p not in sys.path:
        sys.path.insert(0, p)

try:
    try:
        from app import create_app
    except ImportError:
        from backend.app import create_app

    app = create_app(os.getenv("FLASK_ENV", "production"))
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

