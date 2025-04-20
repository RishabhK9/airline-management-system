from flask import Flask, jsonify
from flask_cors import CORS
from routes.procedures import proc_bp
from routes.views import views_bp
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(proc_bp)
    app.register_blueprint(views_bp)
    
    @app.route('/')
    def hello():
        return jsonify({
            'message': 'Welcome to the Airline Management System API',
            'endpoints': {
                'views': '/api/view/<view_name>',
                'procedures': '/api/proc/<proc_name>'
            }
        })
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=Config.DEBUG) 