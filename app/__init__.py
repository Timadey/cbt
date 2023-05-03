#!/usr/bin/python3
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bootstrap import Bootstrap
from flask_login import LoginManager
from flask_session import Session
from flask_cors import CORS

# Dependencies Initialization
db = SQLAlchemy()
migrate = Migrate()
bootstrap = Bootstrap()
cors = CORS()
sess = Session()
login_manager = LoginManager()
login_manager.login_view = 'teacher.auth.login'

# Blueprint imports

from app.teacher import bp as teacher_bp
from app.student import bp as student_bp
from config import Config
def create_app(config_class=Config):
    """Application factory function"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.url_map.strict_slashes = False

    # Init app dependencies
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    sess.init_app(app)
    bootstrap.init_app(app)
    cors.init_app(app)


    # Register Blueprints
    app.register_blueprint(teacher_bp)
    app.register_blueprint(student_bp)

    return app

from .models import CbtModel, Examination, Teacher,\
    Subject, QuestionPaper, Student, Result, User
# from app import routes
