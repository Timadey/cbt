#!/usr/bin/python3
"""A module that defines all Examination forms
"""
from flask_wtf import FlaskForm
from wtforms import EmailField, StringField, SubmitField, PasswordField
from wtforms.validators import InputRequired, Length, DataRequired, Email
from wtforms.widgets import HiddenInput
from helpers.forms.validators import unique

class StudentForm(FlaskForm):
    """Form for creating a new student"""
    name = StringField('Student Name', validators=[
        InputRequired(), Length(3, 128)])
    email = EmailField('Student Email', validators=[
        InputRequired(), DataRequired(), Email(),
        unique('users', 'email', 'Email already exist')])
    password = PasswordField('', widget=HiddenInput())
    submit = SubmitField('Add Student')