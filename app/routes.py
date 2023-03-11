#!/usr/bin/python3
"""App Routes
"""
import json

from flask import flash, redirect, url_for, render_template, request
from flask_login import current_user, login_user, logout_user, login_required
from app import app, db, Examination, Subject, Teacher, QuestionPaper
from app.forms import PaperForm, WriteExamination, StartExaminationForm, ExaminationForm, SubjectForm, QuestionForm, LoginForm, RegisterForm
from app.models import Teacher

#####################################################
# ADMIN or Teachers routes
#####################################################


@app.route('/teacher')
def dashboard():
    return render_template('teacher/base.html')


@app.route('/teacher/login', methods=['GET', 'POST'])
def teacher_login():
    """Login Teacher"""
    if current_user.is_authenticated:
        return redirect(url_for('examination'))
    login_form = LoginForm()
    if login_form.validate_on_submit():
        teacher = Teacher.query.filter_by(email=login_form.email.data).first()
        if teacher is None or not teacher.is_password(login_form.password.data):
            flash('Invalid Login details', 'warning')
            redirect(url_for('teacher_login'))
        else:
            login_user(teacher, remember=login_form.remember_me.data)
            flash('Login successful', 'success')
            return redirect(url_for('teacher_login'))
    return render_template('teacher/login.html', title='Sign in', form=login_form)


@app.route('/teacher/register', methods=['GET', 'POST'])
def teacher_register():
    """Register new teacher"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
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
        return redirect(url_for('teacher_login'))
    return render_template('teacher/register.html',
                           form=register_form, title='Register')


@app.route('/teacher/logout', methods=['GET'])
def teacher_logout():
    """Logout teacher"""
    logout_user()
    return redirect(url_for('teacher_login'))


@app.route('/teacher/examination', methods=['GET'])
def examination():
    """Get all examinations
    """
    exams = Examination.query.order_by(Examination.start_date.desc()).all()
    return render_template('teacher/examinations.html', examinations=exams)


@app.route('/teacher/examination/<string:id>', methods=['GET'])
def examination_id(id: str):
    """Get a specific examination
    """
    exam = Examination.query.get_or_404(id)
    return render_template('teacher/examination.html', examination=exam)


@app.route('/teacher/examination/new', methods=['GET', 'POST'])
def examination_new():
    """Create a new examination period
    """
    form = ExaminationForm()
    all_subjects = Subject.query.all()
    form.subjects.choices = [(sub.id, sub.name) for sub in all_subjects]
    print ('start_date', form.start_date.data, 'end_date', form.end_date.data)
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
        return redirect(url_for('examination'))
    return render_template('teacher/new_examination.html', form=form)


@app.route('/teacher/subject', methods=['GET'])
def subject():
    """Get all subjects
    """
    subjects = Subject.query.join(Teacher).order_by(
        Subject.created_at.desc()).all()
    return render_template('teacher/subjects.html', subjects=subjects)


@app.route('/teacher/subject/new', methods=['GET', 'POST'])
def subject_new():
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
        return redirect(url_for('subject_new'))
    return render_template('teacher/new_subject.html', form=form)


@app.route('/teacher/examination/question/<string:exam_id>', methods=['GET', 'POST'])
@login_required
def examination_question(exam_id: str):
    """Get a particular question
    """
    # Get arguments
    # edit_num is the question number to edit in a question paper, if exist
    subject_id = request.args.get('subject')
    edit_num = request.args.get('edit_num', type=str)
    # Get the question paper
    question_paper = QuestionPaper.query.where(
        QuestionPaper.examination_id == exam_id, QuestionPaper.subject_id == subject_id).one_or_404()

    # If edit_num is present in args, get the question to edit from
    # the dictionary of questions and initialise the question form with the
    # question. If the question does not exist in the dictionary of questions in a
    # question paper, return redirect to this endpoint without the edit_num arg
    if edit_num is not None:
        que_ = question_paper.questions_dict.get(edit_num)
        if que_ is None:
            return redirect(url_for('examination_question', exam_id=exam_id, subject=subject_id))
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
        # future: Check correct option on question paperedit
        correct_option = options[int(question_form.correct_option.data) - 1]
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
        return redirect(url_for('examination_question', exam_id=exam_id, subject=subject_id))
    return render_template('teacher/question_paper.html', question_paper=question_paper, question_form=question_form)


#####################################################
# Students or Teachers routes
#####################################################

@app.route('/', methods=['GET', 'POST'])
def start_examination():
    form = StartExaminationForm()
    if form.validate_on_submit():
        exam_id = form.examination_id.data
        subject_id = form.subject_id.data
        # Get question paper for exam for the subject
        paper = QuestionPaper.query.join(Examination).join(Subject).where(Examination.id==exam_id, Subject.id==subject_id).first()
        print(paper)
        return redirect (url_for('write_examination', paper_id=paper.id))
    return render_template('student/start_examination.html', form=form)
    

@app.route('/<int:paper_id>', methods=['GET', 'POST'])
def write_examination(paper_id):
    paper = QuestionPaper.query.get_or_404(paper_id)
    
    write_form = WriteExaminationForm()
    for pap in paper:
        paper_form = PaperForm()
        paper_form.question.data = pap.questions_dict['question']
        choices = []
        for idx, option in enumerate(pap.question_dict['options']):
            choice = (idx,option)
            choices.append(choice)
        write_form.answers.append(paper)
    return render_template('student/write_examination.html', form=write_form)