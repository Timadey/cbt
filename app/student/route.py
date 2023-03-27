#!/usr/bin/env pythons
"""Student routes for student to write examinations"""
from flask import flash, redirect, render_template, url_for, session
from app.student import bp
from app.student.forms import TokenForm
from app.models import Result, QuestionPaper


@bp.route('/', methods=['GET', 'POST'])
def start_examination():
    """Accept exam token from student and check eligibility
    if student is eligible, allow them to write exam
    """
    form = TokenForm()
    if form.validate_on_submit():
        token = form.token.data
        result = Result.query.join(QuestionPaper).where(
            Result.token == token
        ).first()  # future check that examination is happening today also
        if not result or result.score or result.time_submitted:
            flash('Invalid or used examination token', 'warning')
            return redirect(url_for('student.start_examination'))
        session['examination_token'] = token
        return redirect(url_for('student.write_examination'))
    return render_template('student/start_examination.html', form=form)


@bp.route('/examination', methods=['GET', 'POST'])
def write_examination():
    """Display question paper for student to write examination and
    submit question paper
    """
    token = session.get('examination_token')
    result = Result.query.join(QuestionPaper).where(
        Result.token == token).first()
    question_paper = result.question
    return render_template('student/write_examination.html',
                           question_paper=question_paper)
