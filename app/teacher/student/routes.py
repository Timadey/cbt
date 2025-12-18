#!/usr/bin/python3
"""Admin view to perform operations on students"""
from flask import redirect, url_for, render_template, flash, jsonify
from flask_login import login_required
from app.teacher.student import bp
from app.teacher.student.forms import StudentForm
from app.models import Student


@bp.route('/', methods=['GET'])
@login_required
def all() -> str:
    """Get all students"""
    students = Student.query.order_by(Student.created_at.desc()).all()
    form = StudentForm()
    return render_template('teacher/student/all.html',
                           students=students, form=form)


@bp.route('/create', methods=['POST'])
@login_required
def create():
    """Create a new student"""
    form = StudentForm()
    if form.validate_on_submit():
        student = Student()
        student.name = form.name.data
        student.email = form.email.data
        student.set_password('password')
        student.save()
        flash('Student added successfully!', 'success')
        return jsonify(message="Student Added Sucessfully")
    return jsonify(errors=form.errors)
    
@bp.route('/enroll/<student_id>', methods=['GET'])
@login_required
def enroll_face(student_id):
    """Render the enrollment page for a specific student"""
    student = Student.query.get_or_404(student_id)
    return render_template('teacher/student/enroll_face.html', student=student)
