"""
Configuration settings for the backend application.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Model paths
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'lstm_model.keras')

# Flask settings
FLASK_ENV = os.getenv('FLASK_ENV', 'development')
DEBUG = FLASK_ENV == 'development'
HOST = os.getenv('FLASK_HOST', '0.0.0.0')
PORT = int(os.getenv('FLASK_PORT', 5000))

# Model settings
MODEL_BATCH_SIZE = int(os.getenv('MODEL_BATCH_SIZE', 32))
MODEL_SEQUENCE_LENGTH = int(os.getenv('MODEL_SEQUENCE_LENGTH', 100))
