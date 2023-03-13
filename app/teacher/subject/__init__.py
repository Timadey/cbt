#!/usr/bin/python3
"""Blueprint for Teacher Subject Functionality"""
from flask import Blueprint

bp = Blueprint('subject', __name__, url_prefix='/subject')

from app.teacher.subject import routes
