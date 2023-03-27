#!/usr/bin/python3
"""Routes for Examination"""
import json
from datetime import datetime
from flask import render_template, flash, redirect, url_for, request, jsonify, session
from flask_login import login_required
from app import db
from app.models import Examination, Student
from app.models import Subject, QuestionPaper, Result
from app.teacher.examination import bp
from app.teacher.examination.forms import ExaminationForm, QuestionForm, EligibleStudentForm


@bp.route('/', methods=['GET'])
@login_required
def all():
    """Get all examinations
    """
    exams = Examination.query.order_by(Examination.start_date.desc()).all()
    return render_template('teacher/examination/all.html', examinations=exams)


@bp.route('/<string:id>', methods=['GET'])
@login_required
def one(id: str):
    """Get a specific examination
    """
    exam = Examination.query.join(QuestionPaper).where(
        Examination.id == id).one()
    return render_template('teacher/examination/one.html', examination=exam)


@bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    """Create a new examination period
    """
    form = ExaminationForm()
    all_subjects = Subject.query.all()
    form.subjects.choices = [(sub.id, sub.name) for sub in all_subjects]
    print('start_date', form.start_date.data, 'end_date', form.end_date.data)
    if form.validate_on_submit():
        exam = Examination()
        exam.name = form.name.data
        # start and end date need extra parsing
        # bug: datetime not passed front client
        # print value in str to see
        exam.start_date = form.start_date.data
        exam.end_date = form.end_date.data
        exam.subjects = [Subject.query.get(id) for id in form.subjects.data]
        db.session.add(exam)
        db.session.commit()
        flash(f'New Examination created: {exam.name}', 'info')
        return redirect(url_for('teacher.examination.all'))
    return render_template('teacher/examination/new.html', form=form)


@bp.route('/question/<int:id>', strict_slashes=True, methods=['GET', 'POST'])
@login_required
def question(id: int):
    """Get a particular question
    """
    question_paper = QuestionPaper.query.where(
        QuestionPaper.id == id).one_or_404()
    eligible_stu = question_paper.students
    all_students = Student.query.all()
    # filter out students that are not eligible for this examination
    ineligible_stu = list(
        filter(lambda stu: stu not in eligible_stu, all_students))
    return render_template('teacher/examination/question.html',
                           question_paper=question_paper, students=ineligible_stu)



##############
# JSON ROUTES
##############

@bp.route('/make_eligible', methods=['POST'])
@login_required
def make_eligible():
    """Make a student eligible to write a question paper"""
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
        return jsonify({'message': 'Student made eligible successfully'})
    else:
        return jsonify({'message': 'Student is already eligible'})

@bp.route('/question/<int:id>/json', methods=['GET', 'POST'])
@login_required
def question_json(id: int):
    """Return a json question or save a jsn question"""
    question_paper = QuestionPaper.query.where(
        QuestionPaper.id == id).one_or_404()
    d = question_paper.questions_dict

    # return jsonify(question_paper.questions_dict)
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
@login_required
def question_paper(id):
    """Return question apaper without the correct options"""
    result = Result.query.join(QuestionPaper).where(
        QuestionPaper.id == id).one_or_404()
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
        del session['examination_token']
        return jsonify({
            'score': score,
            'callback': url_for('student.start_examination')
        })



# @bp.route('/question/<int:id>/eligible', methods=['GET', 'POST'])
# @login_required
# def eligible(id):
#     """Get all or add new students that are eligible to write this question"""
#     question_paper = QuestionPaper.query.join(
#         Result).where(QuestionPaper.id == 113).all()
#     students = Student.query.all()
#     students = filter((lambda st_id: st_id != rst.student_id for rst in results), students)
#     form = EligibleStudentForm()
#     form.students.choices = [(stu.id, stu.name) for stu in students]
#     if form.validate_on_submit():
#         for student in form.
