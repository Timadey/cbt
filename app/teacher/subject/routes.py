#!/usr/bin/python3
"""Routes for Subject"""
from flask import render_template, flash, jsonify
from flask_login import login_required
from app import db
from app.models import Teacher
from app.models import Subject
from app.teacher.subject import bp
from app.teacher.subject.forms import SubjectForm


@bp.route('/', methods=['GET'])
@login_required
def all():
    """Get all subjects
    """
    subjects = Subject.query.join(Teacher).order_by(
        Subject.created_at.desc()).all()
    teachers = Teacher.query.all()
    form = SubjectForm()
    form.teacher.choices = [(t.id, t.name) for t in teachers]
    return render_template('teacher/subject/all.html',
                           subjects=subjects,
                           form=form)


@bp.route('/create', methods=['POST'])
@login_required
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
        return jsonify(message="Subject Added Sucessfully")
    return jsonify(errors=form.errors)
