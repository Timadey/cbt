#!/usr/bin/python3
"""App Routes
"""
import json

from flask import flash, redirect, url_for, render_template, request
from app import app, db, Examination, Subject, Teacher, QuestionPaper
from app.forms import ExaminationForm, SubjectForm, QuestionForm, QuestionPaperForm


@app.route('/')
def dashboard():
    return 'CBT'


@app.route('/examinations', methods=['GET'])
def examinations():
    """Get all examinations
    """
    exams = Examination.query.order_by(Examination.start_date.desc()).all()
    return render_template('examinations.html', examinations=exams)


@app.route('/examination/<string:id>', methods=['GET'])
def examination(id: str):
    """Get a specific examination
    """
    exam = Examination.query.get_or_404(id)
    return render_template('examination.html', examination=exam)


@app.route('/examination/new', methods=['GET', 'POST'])
def new_examination():
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
        flash(f'New Examination created: {exam.name}')
        return redirect(url_for('examinations'))
    return render_template('new_examination.html', form=form)


@app.route('/subject/new', methods=['GET', 'POST'])
def new_subject():
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
        flash(f'New Subject added: {subject.name}')
        return redirect(url_for('new_subject'))
    return render_template('new_subject.html', form=form)


@app.route('/question/<int:id>', methods=['GET', 'POST'])
def question(id: int):
    """Get a particular question
    """
    subject_id = request.args.get('subject')
    edit_num = request.args.get('edit_num', type=str)
    question_paper = QuestionPaper.query.where(
        QuestionPaper.id == id, QuestionPaper.subject_id == subject_id).one_or_404()
    if edit_num is not None:
        que_ = question_paper.questions_dict.get(edit_num)
    question_form = QuestionForm(obj=que_)
    question_form.correct_option.choices = [('1', '9')]
    # question_paper_form = QuestionPaperForm()
    if question_form.validate_on_submit():
        #     question_paper_form.questions.append_entry(question_form)
        #     # return redirect(url_for('question', id=id, subject=subject_id))
        # if question_paper_form.validate_on_submit():
        #     # save question paper
        #     question_paper.question = question_paper_form.questions.object_data
        num = len(question_paper.questions_dict) + 1
        single_question = {
            num: {
                'question': question_form.question.data,
                # future: ensure to check to multiple line breaks in options
                'options': question_form.options.data.split('\n'),
                'correct_option': question_form.correct_option.data
            }
        }
        que = json.loads(question_paper.questions)
        que.update(single_question)
        question_paper.questions = json.dumps(que)
        db.session.add(question_paper)
        db.session.commit()
        return redirect(url_for('question', id=id, subject=subject_id))
    return render_template('question_paper.html', question_paper=question_paper, question_form=question_form)


# @app.route('/question/<int:id>', methods=['POST'])
# def add_question(id: int):
#     """"""
