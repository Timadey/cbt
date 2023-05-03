#!/usr/bin/python3
"""Authentication routes pertaining to teachers"""
from app.teacher.auth import bp
from app.models import Teacher
from app.teacher.auth.forms import LoginForm, RegisterForm
from flask import redirect, render_template, url_for, flash, Response
from flask_login import current_user, login_user, logout_user
from app import db
from typing import Union
Response_ = Union[str, Response]

@bp.route('/login', methods=['GET', 'POST'])
def login()-> Response_:
    """Authenticate a teacher"""
    if current_user.is_authenticated:
        return redirect(url_for('teacher.examination.all'))
    login_form = LoginForm()
    if login_form.validate_on_submit():
        teacher = Teacher.query.filter_by(email=login_form.email.data).first()
        if teacher is None or not teacher.is_password(login_form.password.data):
            flash('Invalid Login details', 'warning')
            redirect(url_for('teacher.auth.login'))
        else:
            login_user(teacher, remember=login_form.remember_me.data)
            flash('Login successful', 'success')
            return redirect(url_for('teacher.auth.login'))
    return render_template('teacher/auth/login.html', title='Sign in', form=login_form)


@bp.route('/register', methods=['GET', 'POST'])
def register() -> Response_:
    """Register new teacher"""
    if current_user.is_authenticated:
        return redirect(url_for('teacher.dashboard'))
    register_form = RegisterForm()
    if register_form.validate_on_submit():
        teacher = Teacher(
            name=register_form.name.data,
            email=register_form.email.data
        )
        teacher.set_password(register_form.password.data)
        db.session.add(teacher)
        db.session.commit()
        flash('Registration successful! Please login', 'success')
        return redirect(url_for('teacher.auth.login'))
    return render_template('teacher/auth/register.html',
                           form=register_form, title='Register')


@bp.route('/logout', methods=['GET'])
def logout() -> Response_:
    """Logout teacher"""
    logout_user()
    return redirect(url_for('teacher.auth.login'))
