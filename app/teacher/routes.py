#!/usr/bin/python3
from app.teacher import bp
from flask import render_template


@bp.route('/')
def dashboard():
    return render_template('teacher/base.html')
