#!/usr/bin/env pythons
"""Student routes for student to write examinations"""
from flask import flash, redirect, render_template, url_for, session, Response
from app.student import bp
from app.student.forms import TokenForm
from app.models import Result, QuestionPaper
from typing import Union

Response_ = Union[str, Response]


@bp.route('/', methods=['GET', 'POST'])
def start_examination() -> Response_:
    """Accept exam token from student and check eligibility
    if student is eligible, allow them to write exam. If the token is
    invalid, flash a nice warning message to the user. The examination
    token is stored in the current session for use later.

    An examination token is invalid if it has been used that is, the user has
    submitted and has been scored. It can also appear to be invalid if the
    examination is yet to begin.
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


@bp.route('/examination', methods=['GET'])
def write_examination() -> str:
    """Display question paper for student to write examination and
    submit question paper.oken is retrieved from the session and used
    to load the question paper.

    Raise 404 if the question paper is not found
    """
    token = session.get('examination_token')
    result = Result.query.join(QuestionPaper).where(
        Result.token == token).first_or_404()
    question_paper = result.question
    return render_template('student/write_examination.html',
                           question_paper=question_paper)
