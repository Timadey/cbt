#!/usr/bin/python3
"""A module that defines all forms used
"""
import datetime
from flask_wtf import FlaskForm
from wtforms import SubmitField, StringField, DateTimeLocalField, DateTimeField, SelectMultipleField, SelectField
from wtforms.validators import InputRequired, DataRequired
from wtforms.widgets import DateTimeInput, Select, DateTimeLocalInput


class ExaminationForm(FlaskForm):
    """A form for creating new examination
    """
    name = StringField('Examination Name', validators=[
        InputRequired('Name of examination is required')])
    start_date = DateTimeField('Start Date', validators=[
        InputRequired('Start is required')])
    end_date = DateTimeField('End Date', format='%Y-%m-%d %H:%M:%S', validators=[
        InputRequired('End date is required')])
    subjects = SelectMultipleField('Add Subjects', validators=[
        InputRequired('At least a subject should be in an examination')])
    submit = SubmitField('Create')


class SubjectForm(FlaskForm):
    """A forrm for creating new subjects
    """
    name = StringField('Subject Name', validators=[
        InputRequired('Name of examination is required')])
    teacher = SelectField('Teacher')
    submit = SubmitField('Create Subject')
