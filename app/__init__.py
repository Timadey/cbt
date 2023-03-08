#!/usr/bin/python3
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bootstrap import Bootstrap
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

db = SQLAlchemy()
db.init_app(app)
migrate = Migrate(app, db)
bootstrap = Bootstrap(app)

from .models import CbtModel, Examination, Teacher, Subject, QuestionPaper
from app import routes
