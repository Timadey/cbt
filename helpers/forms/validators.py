#!/usr/bin/env python3
"""Module for custom wtf form validators"""
from datetime import datetime
from app import db
from sqlalchemy import text
from typing import NoReturn, Callable
from wtforms import Field
from flask_wtf import FlaskForm
from wtforms.validators import ValidationError

Validator = Callable[[FlaskForm, Field], NoReturn]


def unique(table: str, column: str,
           msg: str = "This already exist") -> Validator:
    """Validate the email does not exist in the database"""
    def validate(form: FlaskForm, field: Field) -> NoReturn:
        stmt = text(f'SELECT {column} FROM {table} WHERE {column}=:x')
        res = db.session.execute(stmt, {'x': "{field.data}"}).fetchall()
        if len(res) != 0:
            raise ValidationError(msg)
    return validate


def date_less_than(date: str, msg: str) -> Validator:
    """Validate that the field is less than the `date`"""
    def validate(form: FlaskForm, field: Field) -> NoReturn:
        if field.data > form.__getattribute__(date).data:
            raise ValidationError(msg)
    return validate


def date_greater_than(date: str, msg: str) -> Validator:
    """Validate that the field is less than the `date`"""
    def validate(form: FlaskForm, field: Field) -> NoReturn:
        if field.data < form.__getattribute__(date).data:
            raise ValidationError(msg)
    return validate


def date_greater_than_now(msg: str) -> Validator:
    """Validate that the field is greater than the `datetime`"""
    def validate(form: FlaskForm, field: Field) -> NoReturn:
        if field.data < datetime.now():
            raise ValidationError(msg)
    return validate
