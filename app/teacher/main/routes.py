#!/usr/bin/python3
"""Teacher routes"""
from app.teacher.main import bp
from flask import render_template
from flask_login import login_required


@bp.route('/', methods=['GET'])
@login_required
def dashboard():
    return { 'man': 1}
    # return render_template('teacher/base.html')
