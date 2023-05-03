#!/usr/bin/python3
"""Routes for Examination"""
import json
from datetime import datetime
from flask import render_template, flash, redirect, url_for,\
    request, jsonify, session, Response
from flask_login import login_required
from flask_cors import cross_origin
from app import db
from app.models import Examination, Student
from app.models import Subject, QuestionPaper, Result
from app.teacher.examination import bp
from app.teacher.examination.forms import ExaminationForm
from app.teacher.student.forms import StudentForm

from typing import Union

Response_ = Union[str, Response]


@bp.route('/', methods=['GET'])
@login_required
def all() -> str:
    """Get all examinations.
    """
    exams = Examination.query.order_by(Examination.start_date.desc()).all()
    form = ExaminationForm()
    all_subjects = Subject.query.all()
    form.subjects.choices = [(sub.id, sub.name) for sub in all_subjects]
    return render_template('teacher/examination/all.html',
                           examinations=exams, form=form)


@bp.route('/<string:id>', methods=['GET'])
@login_required
def one(id: str) -> str:
    """Get a specific examination. Raises 404 if the examination
    can not be found.
    """
    exam = Examination.query.join(QuestionPaper).where(
        Examination.id == id).one_or_404()
    return render_template('teacher/examination/one.html', examination=exam)


@bp.route('/create', methods=['POST'])
@login_required
def create() -> Response_:
    """Create a new examination period
    """
    form = ExaminationForm()
    all_subjects = Subject.query.all()
    form.subjects.choices = [(sub.id, sub.name) for sub in all_subjects]
    if form.validate_on_submit():
        exam = Examination()
        exam.name = form.name.data
        exam.start_date = form.start_date.data
        exam.end_date = form.end_date.data
        exam.subjects = [Subject.query.get(id) for id in form.subjects.data]
        db.session.add(exam)
        db.session.commit()
        flash(f'New Examination created: {exam.name}', 'info')
        return jsonify(message=f'New Examination created: {exam.name}')
    return jsonify(errors=form.errors)


@bp.route('/question/<int:id>', strict_slashes=True, methods=['GET', 'POST'])
@login_required
def question(id: int) -> str:
    """Get a particular question
    """
    question_paper = QuestionPaper.query.where(
        QuestionPaper.id == id).one_or_404()
    form = StudentForm()
    eligible_stu = question_paper.students
    all_students = Student.query.all()
    # filter out students that are not eligible for this examination
    ineligible_stu = list(
        filter(lambda stu: stu not in eligible_stu, all_students))
    return render_template('teacher/examination/question.html',
                           question_paper=question_paper, students=ineligible_stu,
                           form=form)


##############
# JSON ROUTES
##############

@bp.route('/make_eligible', methods=['POST'])
# @login_required
def make_eligible() -> Response:
    """Make a student eligible to write a question paper. It accepts a json
    containing the id of the question paper and that of the student.

    Raises 404 if the question paper or the student can't be found
    """
    data = request.json
    data['question_paper_id'] = int(data.get('question_paper_id'))
    question_paper = QuestionPaper.query.where(
        QuestionPaper.id == data.get('question_paper_id')).one_or_404()
    student = Student.query.where(
        Student.id == data.get('student_id')).one_or_404()
    if not student in question_paper.students:
        question_paper.students.append(student)
        db.session.add(question_paper)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Student made eligible successfully'})
    else:
        return jsonify({'success': False, 'message': 'Student is already eligible'})


@bp.route('/question/<int:id>/json', methods=['GET', 'POST'])
# @login_required
def question_json(id: int) -> Response:
    """Return a json question or save a json question"""
    question_paper = QuestionPaper.query.where(
        QuestionPaper.id == id).one_or_404()
    d = question_paper.questions_dict

    if request.method == 'GET':
        response = jsonify(d)
        return response
    else:
        que = request.json
        print(que)
        err = []
        for key, val in que.items():
            if val['question'] == '':
                err.push(f'Question {key} is empty')
            if len(val['options']) < 1:
                err.push(f'Add options to question {key}')
            if not val['correct_option']:
                err.push(f'Select correct option for question{key}')
        if len(err) != 0:
            return jsonify(request.json)
        question_paper.questions = json.dumps(request.json)
        db.session.add(question_paper)
        db.session.commit()
        return jsonify(status='OK')


@bp.route('/question_paper/<int:id>', strict_slashes=True, methods=['GET', 'POST'])
# @login_required
def question_paper(id: int) -> Response:
    """Return question paper without the correct options. The question paper
    is sent to student to select the options. When it is submitted, the score
    is calculated and the database updated accordingly
    """
    if request.args.get('tok') is not None:
        token = request.args.get('tok')
    else:
        token = session['examination_token']
    result = Result.query.join(QuestionPaper).where(
        QuestionPaper.id == id, Result.token == token).one_or_404()
    question_paper = result.question.questions_dict
    if request.method == 'GET':
        for val in question_paper.values():
            val['correct_option'] = ""
        return jsonify(question_paper)
    else:
        answer = request.json
        score = 0
        for num, que in answer.items():
            if question_paper[num].get('correct_option') == que.get('correct_option'):
                score += 1
        result.score = score
        result.time_submitted = datetime.now()
        db.session.add(result)
        db.session.commit()
        if session.get('examination_token') is not None:
            del session['examination_token']
        return jsonify({
            'score': score,
            'callback': url_for('student.start_examination')
        })
