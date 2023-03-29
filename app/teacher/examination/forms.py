#!/usr/bin/python3
"""A module that defines all Examination forms
"""
from flask_wtf import FlaskForm
from wtforms import SubmitField, StringField, DateTimeLocalField,\
    SelectMultipleField, TextAreaField, Field
from wtforms.validators import InputRequired, ValidationError
from helpers.forms.validators import unique, date_less_than


class ExaminationForm(FlaskForm):
    """A form for creating new examination
    """
    name = StringField('Examination Name', validators=[
        InputRequired('Name of examination is required'),
        unique('examinations', 'name', 'Already exists. Please use another examination name')])
    start_date = DateTimeLocalField('Start Date', format='%Y-%m-%dT%H:%M', validators=[
        InputRequired('Start is required'), date_less_than('end_date')])
    end_date = DateTimeLocalField('End Date', format='%Y-%m-%dT%H:%M', validators=[
        InputRequired('End date is required')])
    subjects = SelectMultipleField('Add Subjects', validators=[
        InputRequired('At least a subject should be in an examination')])
    submit = SubmitField('Create')

# class EligibleStudentForm(FlaskForm):
#     """A form to make student eligible to write a question paper"""
#     student = SelectMultipleField('Select Students', validators=[
#         InputRequired('At least a student should be selected')])
#     make_eligible = SubmitField('Make Eligible')

# class QuestionForm(FlaskForm):
#     """A single Question form"""
#     question = StringField('Question')
#     options = TextAreaField(
#         'Option',
#         description='''Options separated by new lines. Enter each option on a different line.
#         No double lines''')
#     correct_option = StringField(
#         'Correct Options', description='''Example: 1 if first option is the correct option.
#         2 if the second option is correct instead''')
#     add_or_save = SubmitField('Add or Save Edit')


