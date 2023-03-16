#!/usr/bin/python3
from flask import Blueprint

bp = Blueprint('main', __name__)

from app.teacher.main import routes