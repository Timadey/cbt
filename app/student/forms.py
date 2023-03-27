#!/usr/bin/python3
"""A module that defines all Examination forms
"""
from flask_wtf import FlaskForm
from wtforms import SubmitField,IntegerField
from wtforms.validators import InputRequired


class TokenForm(FlaskForm):
    """A form to take student examination token"""
    token = IntegerField('Enter token', validators=[
        InputRequired('Token is needed to write this exam')])
    start = SubmitField('Start')
