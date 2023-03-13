#!/usr/bin/python3
"""Authentication for teachers"""
from flask import Blueprint
bp = Blueprint('auth', __name__)

from app.teacher.auth import routes
