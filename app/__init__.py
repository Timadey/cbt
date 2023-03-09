#!/usr/bin/python3
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bootstrap import Bootstrap
from flask_user import UserManager
from flask_login import LoginManager
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

db = SQLAlchemy()
db.init_app(app)
migrate = Migrate(app, db)
bootstrap = Bootstrap(app)
login_manager = LoginManager(app)
login_manager.init_app(app)
login_manager.login_view = 'teacher_login'

from .models import CbtModel, Examination, Teacher,\
    Subject, QuestionPaper, Student, Result, User
from app import routes

# user_manager = UserManager(app, db, User)
