#!/usr/bin/python3
"""Routes for Subject"""
from flask import render_template, flash, redirect, url_for
from app import db
from app.models import Teacher
from app.models import Subject
from app.teacher.subject import bp
from app.teacher.subject.forms import SubjectForm


@bp.route('/', methods=['GET'])
def all():
    """Get all subjects
    """
    subjects = Subject.query.join(Teacher).order_by(
        Subject.created_at.desc()).all()
    return render_template('teacher/subjects.html', subjects=subjects)


@bp.route('/create', methods=['GET', 'POST'])
def create():
    """Create a new Subject
    """
    form = SubjectForm()
    teachers = Teacher.query.all()
    form.teacher.choices = [(t.id, t.name) for t in teachers]
    if form.validate_on_submit():
        subject = Subject()
        subject.name = form.name.data
        subject.teacher_id = form.teacher.data
        db.session.add(subject)
        db.session.commit()
        flash(f'New Subject added: {subject.name}', 'success')
        return redirect(url_for('teacher.subject.all'))
    return render_template('teacher/new_subject.html', form=form)
