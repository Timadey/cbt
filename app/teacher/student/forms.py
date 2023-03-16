#!/usr/bin/python3
"""A module that defines all Examination forms
"""
from flask_wtf import FlaskForm
from wtforms import EmailField, StringField, SubmitField, PasswordField
from wtforms.validators import InputRequired

class StudentForm(FlaskForm):
    name = StringField('Student Name')
    email = EmailField('Student Email')
    password = PasswordField('Password', default='password')
    submit = SubmitField('Add Student')