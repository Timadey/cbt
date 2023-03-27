#!/usr/bin/env python3
"""Create blueprint for students functionalities"""
from flask import Blueprint

bp = Blueprint('student', __name__)

from app.student import route
