import os
from flask import Flask, send_from_directory
from app.config import config_by_name
from app.extensions import db, migrate, cors
from app.common.responses import error_response, success_response
from app.common.errors import AppError

def create_app(config_name=None):
    if not config_name:
        config_name = os.getenv("FLASK_ENV", "development").lower()

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name["development"]))

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)

    # Register blueprints
    from app.auth.routes import auth_bp
    from app.users.routes import users_bp
    from app.community.routes import community_bp
    from app.problems.routes import problems_bp
    from app.submissions.routes import submissions_bp
    from app.progress.routes import progress_bp
    from app.leaderboard.routes import leaderboard_bp
    from app.moderation.routes import moderation_bp
    from app.notifications.routes import notifications_bp
    from app.admin.routes import admin_bp
    from app.events.routes import events_bp
    from app.common.upload_routes import uploads_bp
    from app.blogs.routes import blogs_bp
    from app.projects.routes import projects_bp
    from app.clubs.routes import clubs_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(community_bp)
    app.register_blueprint(problems_bp)
    app.register_blueprint(submissions_bp)
    app.register_blueprint(progress_bp)
    app.register_blueprint(leaderboard_bp)
    app.register_blueprint(moderation_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(uploads_bp)
    app.register_blueprint(blogs_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(clubs_bp)

    # Ensure tables are created automatically
    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            app.logger.warning(f"Could not auto-create tables: {e}")

    # Health check & system discovery endpoints
    @app.route("/health", methods=["GET"])
    def health():
        return success_response(data={"status": "healthy", "service": "Scriptorium API", "version": "1.0.0"})

    # Static uploads handler
    @app.route("/uploads/<path:filename>", methods=["GET"])
    def serve_upload(filename):
        upload_folder = app.config.get("UPLOAD_FOLDER", os.path.join(os.getcwd(), "uploads"))
        return send_from_directory(upload_folder, filename)

    @app.route("/api/v1", methods=["GET"])
    def api_index():
        return success_response(data={
            "product": "SCRIPTORIUM",
            "tagline": "Code. Connect. Compete.",
            "version": "v1",
            "documentation": "/docs"
        })

    # Global custom error handler
    @app.errorhandler(AppError)
    def handle_app_error(err):
        return error_response(
            code=err.code,
            message=err.message,
            details=err.details,
            status_code=err.status_code
        )

    @app.errorhandler(404)
    def handle_not_found(err):
        return error_response(
            code="NOT_FOUND",
            message="The requested URL was not found on this server.",
            status_code=404
        )

    @app.errorhandler(500)
    def handle_internal_server_error(err):
        app.logger.error(f"Internal server error: {err}")
        return error_response(
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected server error occurred.",
            status_code=500
        )

    return app

