#!/usr/bin/python3
"""A module that defines all Subject forms
"""
from flask_wtf import FlaskForm
from wtforms import SubmitField, StringField, SelectField
from wtforms.validators import InputRequired, Length
from helpers.forms.validators import unique


class SubjectForm(FlaskForm):
    """A forrm for creating new subjects
    """
    name = StringField('Subject Name', validators=[
        InputRequired('Name of examination is required'), Length(3, 128),
        unique('subjects', 'name', 'Already Exist. Please use another name')])
    teacher = SelectField('Teacher')
    submit = SubmitField('Create Subject')
