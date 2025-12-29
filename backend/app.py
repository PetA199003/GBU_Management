import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

from config import config
from models import db

# Import routes
from routes.auth import auth_bp
from routes.users import users_bp
from routes.projects import projects_bp
from routes.bereiche import bereiche_bp
from routes.gbu import gbu_bp
from routes.participants import participants_bp
from routes.unterweisung import unterweisung_bp
from routes.pdf import pdf_bp

def create_app(config_name='default'):
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    CORS(app)
    JWTManager(app)
    Migrate(app, db)

    # Create upload and pdf directories
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['PDF_FOLDER'], exist_ok=True)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(projects_bp, url_prefix='/api/projects')
    app.register_blueprint(bereiche_bp, url_prefix='/api/bereiche')
    app.register_blueprint(gbu_bp, url_prefix='/api/gbu')
    app.register_blueprint(participants_bp, url_prefix='/api/participants')
    app.register_blueprint(unterweisung_bp, url_prefix='/api/unterweisung')
    app.register_blueprint(pdf_bp, url_prefix='/api/pdf')

    # Health check endpoint
    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok'}), 200

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

    return app

if __name__ == '__main__':
    app = create_app(os.environ.get('FLASK_ENV', 'development'))
    app.run(host='0.0.0.0', port=5000, debug=True)
