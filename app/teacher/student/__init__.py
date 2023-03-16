#!/usr/bin/python3
from flask import Blueprint

bp = Blueprint('student', __name__, url_prefix='/student')

from app.teacher.student import routes