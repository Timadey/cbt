#!/usr/bin/python3
"""A module that defines all Subject forms
"""
from flask_wtf import FlaskForm
from wtforms import SubmitField, StringField, SelectField
from wtforms.validators import InputRequired, Length


class SubjectForm(FlaskForm):
    """A forrm for creating new subjects
    """
    name = StringField('Subject Name', validators=[
        InputRequired('Name of examination is required'), Length(3, 128)])
    teacher = SelectField('Teacher')
    submit = SubmitField('Create Subject')
