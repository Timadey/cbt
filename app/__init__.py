#!/usr/bin/python3
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bootstrap import Bootstrap
from flask_login import LoginManager
from config import Config

# Dependencies Initialization
db = SQLAlchemy()
migrate = Migrate()
bootstrap = Bootstrap()
login_manager = LoginManager()
login_manager.login_view = 'teacher.login'

# Blueprint imports
from app.teacher import bp as teacher_bp

def create_app(config_class=Config):
    """Application factory function"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Init app dependencies
    db.init_app(app)
    migrate.init_app(app, db)
    bootstrap.init_app(app)
    login_manager.init_app(app)

    # Register Blueprints
    app.register_blueprint(teacher_bp)
    return app


from .models import CbtModel, Examination, Teacher,\
    Subject, QuestionPaper, Student, Result, User
# from app import routes
