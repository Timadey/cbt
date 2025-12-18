#!/usr/bin/env pythons
"""Student routes for student to write examinations"""
from flask import flash, redirect, render_template, url_for, session, Response, current_app, jsonify, request
from app.student import bp
from app.student.forms import TokenForm
from app.models import Result, QuestionPaper
from typing import Union
from datetime import datetime
from app import db

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
    if not token:
        return redirect(url_for('student.start_examination'))

    result = Result.query.join(QuestionPaper).where(
        Result.token == token).first_or_404()
    
    # Set start time if not already set
    if result.time_started is None:
        result.time_started = datetime.utcnow()
        db.session.commit()

    question_paper = result.question
    return render_template('student/write_examination.html',
                           question_paper=question_paper, token=token,
                           livekit_url=current_app.config.get('LIVEKIT_URL'),
                           student_name=result.student.name,
                           time_started=result.time_started.isoformat() + 'Z',
                           duration_minutes=question_paper.duration_minutes)


@bp.route('/api/examination', methods=['GET'])
def get_examination_json():
    """Returns examination data in JSON format for React frontend"""
    token = session.get('examination_token')
    if not token:
        return jsonify({"error": "No examination token found"}), 401

    result = Result.query.join(QuestionPaper).where(
        Result.token == token).first_or_404()
    
    if result.time_started is None:
        result.time_started = datetime.utcnow()
        db.session.commit()

    question_paper = result.question
    
    return jsonify({
        "token": token,
        "student_name": result.student.name,
        "time_started": result.time_started.isoformat() + 'Z',
        "livekit_url": current_app.config.get('LIVEKIT_URL'),
        "question_paper": {
            "id": question_paper.id,
            "subject_name": question_paper.subject.name,
            "total_questions": question_paper.total_questions,
            "duration_minutes": question_paper.duration_minutes,
            "proctoring_enabled": question_paper.proctoring_enabled,
            "questions": question_paper.questions_dict
        }
    })


@bp.route('/api/submit', methods=['POST'])
def submit_examination_json():
    """Handle examination submission and calculate score"""
    token = session.get('examination_token')
    if not token:
        return jsonify({"error": "No examination token found"}), 401

    data = request.get_json()
    if not data or 'answers' not in data:
        return jsonify({"error": "Invalid submission data"}), 400

    answers = data['answers']
    result = Result.query.join(QuestionPaper).where(
        Result.token == token).first_or_404()

    if result.time_submitted:
        return jsonify({"error": "Examination already submitted"}), 400

    question_paper = result.question
    questions = question_paper.questions_dict
    
    score = 0
    for q_id, q_data in questions.items():
        correct_option = str(q_data.get('correct_option'))
        student_answer = str(answers.get(str(q_id)))
        if student_answer == correct_option:
            score += 1

    result.score = score
    result.time_submitted = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "status": "success",
        "score": score,
        "total": len(questions),
        "callback": url_for('student.score')
    })
