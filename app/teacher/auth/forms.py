#!/usr/bin/python3
"""Forms for teacher authentication"""
from flask_wtf import FlaskForm
from wtforms import SubmitField, StringField, EmailField, \
    PasswordField, BooleanField, Field
from wtforms.validators import InputRequired, DataRequired, \
    EqualTo, Email, Length, ValidationError
from helpers.forms.validators import unique

class LoginForm(FlaskForm):
    """Teacher login form"""
    email = EmailField('Email', validators=[
        InputRequired(), DataRequired(), Email()])
    password = PasswordField('Password', validators=[
        InputRequired(), DataRequired()])
    remember_me = BooleanField('Remember me')
    login = SubmitField('Login')


class RegisterForm(FlaskForm):
    """Teacher Register form"""
    name = StringField('Name', validators=[
        InputRequired(), Length(3, 128)])
    email = EmailField('Email', validators=[
        InputRequired(), DataRequired(), Email(),
        unique('teachers', 'email', 'Email already exist')])
    password = PasswordField('Password', validators=[
        InputRequired(), DataRequired()])
    password_again = PasswordField('Retype Password', validators=[
        InputRequired(), DataRequired(), EqualTo('password', 'Password does not match')])
    login = SubmitField('Register')
