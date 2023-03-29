#!/usr/bin/python3
"""A module that defines all forms used
"""
from flask_wtf import FlaskForm
from wtforms import SubmitField, StringField


class StartExaminationForm(FlaskForm):
    """Log student in to write an examination"""
    examination_id = StringField('Examination id')
    subject_id = StringField('Student Id')
    start_exam = SubmitField('Start Exam')

