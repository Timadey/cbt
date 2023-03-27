#!/usr/bin/python3
"""Admin view to perform operations on students"""
from flask import redirect, url_for, render_template
from flask_login import login_required
from app.teacher.student import bp
from app.teacher.student.forms import StudentForm
from app.models import Student


@bp.route('/', methods=['GET'])
@login_required
def all():
    """Get all students"""
    students = Student.query.all()
    return render_template('teacher/student/all.html', students=students)


@bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    """Create a new student"""
    form = StudentForm()
    if form.validate_on_submit():
        student = Student()
        student.name = form.name.data
        student.email = form.email.data
        student.set_password(form.password.data)
        student.save()
        return redirect(url_for('teacher.student.all'))
    return render_template('teacher/student/create.html', form=form)
