#!/usr/bin/python3
"""App Routes
"""

from flask import render_template, current_app

current_app.app_context.push()


@current_app.route('/')
def welcome():
    return render_template('index.html')
