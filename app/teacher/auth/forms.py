#!/usr/bin/python3
"""Forms for teacher authentication"""
from flask_wtf import FlaskForm
from wtforms import SubmitField, StringField, EmailField, PasswordField, BooleanField
from wtforms.validators import InputRequired, DataRequired, EqualTo


class LoginForm(FlaskForm):
    """Teacher login form"""
    email = EmailField('Email', validators=[InputRequired(), DataRequired()])
    password = PasswordField('Password', validators=[
        InputRequired(), DataRequired()])
    remember_me = BooleanField('Remember me')
    login = SubmitField('Login')


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
