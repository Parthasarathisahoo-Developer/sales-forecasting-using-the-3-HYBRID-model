"""
Main entry point for the backend application.
"""
from flask import Flask
from flask_cors import CORS
from routes.api import api
from config import DEBUG, HOST, PORT

def create_app():
    """
    Application factory - creates and configures the Flask app.
    """
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints
    app.register_blueprint(api)
    
    # Add a simple root endpoint
    @app.route('/')
    def home():
        return {
            'message': 'LSTM Model API',
            'version': '1.0',
            'endpoints': {
                'health': 'GET /api/health',
                'predict': 'POST /api/predict'
            }
        }
    
    return app


if __name__ == '__main__':
    app = create_app()
    print(f"\n✓ Flask app starting on http://{HOST}:{PORT}")
    print(f"✓ Health check: http://{HOST}:{PORT}/api/health")
    print(f"✓ Prediction: POST http://{HOST}:{PORT}/api/predict\n")
    app.run(host=HOST, port=PORT, debug=DEBUG)
