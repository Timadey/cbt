#!/usr/bin/python3
"""A module that defines all Examination forms
"""
from flask_wtf import FlaskForm
from wtforms import SubmitField, StringField, DateTimeLocalField,\
    SelectMultipleField
from wtforms.validators import InputRequired
from helpers.forms.validators import unique, date_less_than, date_greater_than,\
    date_greater_than_now


class ExaminationForm(FlaskForm):
    """A form for creating new examination
    """
    name = StringField('Examination Name', validators=[
        InputRequired('Name of examination is required'),
        unique('examinations', 'name', 'Already exists. Please use another examination name')])
    start_date = DateTimeLocalField('Start Date', format='%Y-%m-%dT%H:%M', validators=[
        InputRequired('Start is required'),
        date_less_than('end_date', 'Start date should be before end date'),
        date_greater_than_now('Examination start date must be greater than the current time')])
    end_date = DateTimeLocalField('End date', format='%Y-%m-%dT%H:%M', validators=[
        InputRequired('End date is required'),
        date_greater_than('end_date', 'End date should be before Start date'),
        date_greater_than_now('Examination end date must be greater than the current time')])
    subjects = SelectMultipleField('Add Subjects', validators=[
        InputRequired('At least a subject should be in an examination')])
    submit = SubmitField('Create')
