#!/usr/bin/python3
"""A module that defines all forms used
"""
import datetime
from flask_wtf import FlaskForm
from wtforms import FieldList, FormField, SubmitField, RadioField, StringField, DateTimeLocalField, DateTimeField,\
    SelectMultipleField, SelectField, TextAreaField, EmailField, PasswordField, BooleanField, ValidationError
from wtforms.validators import InputRequired, DataRequired, Email, EqualTo
from wtforms.widgets import DateTimeInput, Select, DateTimeLocalInput
from app import db
from sqlalchemy import text


class ExaminationForm(FlaskForm):
    """A form for creating new examination
    """
    name = StringField('Examination Name', validators=[
        InputRequired('Name of examination is required')])
    start_date = DateTimeLocalField('Start Date', format='%Y-%m-%dT%H:%M', validators=[
        InputRequired('Start is required')])
    end_date = DateTimeLocalField('End Date', format='%Y-%m-%d %H:%M:%S', validators=[
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


class QuestionForm(FlaskForm):
    """A single Question form"""
    question = StringField('Question')
    options = TextAreaField(
        'Option',
        description='''Options separated by new lines. Enter each option on a different line.
        No double lines''')
    correct_option = StringField(
        'Correct Options', description='''Example: 1 if first option is the correct option.
        2 if the second option is correct instead''')
    add_or_save = SubmitField('Add or Save Edit')


# class LoginForm(FlaskForm):
#     """Teacher login form"""
#     email = EmailField('Email', validators=[InputRequired(), DataRequired()])
#     password = PasswordField('Password', validators=[
#                              InputRequired(), DataRequired()])
#     remember_me = BooleanField('Remember me')
#     login = SubmitField('Login')


class RegisterForm(FlaskForm):
    """Teacher Register form"""
    name = StringField('Name', validators=[
        InputRequired()])
    email = EmailField('Email', validators=[InputRequired(), DataRequired()])
    password = PasswordField('Password', validators=[
        InputRequired(), DataRequired()])
    password_again = PasswordField('Retype Password', validators=[
        InputRequired(), DataRequired(), EqualTo('password', 'Password does not match')])
    login = SubmitField('Register')

    def validate_email(self, email):
        stmt = db.session.execute(
            text(f"select email from users where email='{email.data}'"))
        res = [row[0] for row in stmt]
        if len(res) > 0:
            raise ValidationError('Email is already in use')


class StartExaminationForm(FlaskForm):
    """Log student in to write an examination"""
    examination_id = StringField('Examination id')
    subject_id = StringField('Student Id')
    start_exam = SubmitField('Start Exam')


def readOnlyWidget(field, **kwargs):
    return kwargs.get('values', field._value())


class PaperForm(FlaskForm):
    question_num = ('Question Number')
    question = TextAreaField('Question', widget=readOnlyWidget)
    answer = RadioField('Options')


class WriteExaminationForm(FlaskForm):
    answers = FieldList(FormField(PaperForm))
    submit = SubmitField('Submit')
