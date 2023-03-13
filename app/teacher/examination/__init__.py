#!/usr/bin/python3
"""Blueprint for Teacher Examination Functionality"""
from flask import Blueprint

bp = Blueprint('examination', __name__, url_prefix='/examination')

from app.teacher.examination import routes