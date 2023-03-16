#!/usr/bin/python3
"""Routes for Examination"""
import json
from flask import render_template, flash, redirect, url_for, request
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


@bp.route('/question/<int:id>', methods=['GET', 'POST'])
@login_required
def question(id: int):
    """Get a particular question
    """
    # Get arguments
    # edit_num is the question number to edit in a question paper, if exist
    # subject_id = request.args.get('subject')
    edit_num = request.args.get('edit_num', type=str)
    # Get the question paper
    question_paper = QuestionPaper.query.where(
        QuestionPaper.id == id).one_or_404()

    # If edit_num is present in args, get the question to edit from
    # the dictionary of questions and initialise the question form with the
    # question. If the question does not exist in the dictionary of questions in a
    # question paper, return redirect to this endpoint without the edit_num arg
    if edit_num is not None:
        que_ = question_paper.questions_dict.get(edit_num)
        if que_ is None:
            return redirect(url_for('teacher.examination.question', id=id))
        que_['options'] = '\n'.join(que_['options'])
        question_form = QuestionForm(**que_)
    else:
        question_form = QuestionForm()
    # future: implement dynamic choices for correct option
    if question_form.validate_on_submit():
        if edit_num is not None:
            num = edit_num
        else:
            num = len(question_paper.questions_dict) + 1
        options = question_form.options.data.split('\n')
        # future: Check correct option on question paper edit
        correct_option = int(question_form.correct_option.data) - 1
        single_question = {
            num: {
                'question': question_form.question.data,
                # future: ensure to check for multiple line breaks in options
                # to ensure proper split
                'options': options,
                'correct_option': correct_option
            }
        }
        que = json.loads(question_paper.questions)
        que.update(single_question)
        question_paper.questions = json.dumps(que)
        db.session.add(question_paper)
        db.session.commit()
        flash(f'Question {num} added', 'success')
        return redirect(url_for('teacher.examination.question', id=id))
    return render_template('teacher/examination/question.html',
                           question_paper=question_paper,
                           question_form=question_form)


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

