#!/usr/bin/env python3
"""Create blueprint for teachers functionalities"""
from flask import Blueprint
from app.teacher.main import bp as teacher_main_bp
from app.teacher.auth import bp as teacher_auth_bp
from app.teacher.examination import bp as teacher_examination_bp
from app.teacher.subject import bp as teacher_subject_bp
from app.teacher.student import bp as teacher_student_bp

bp = Blueprint('teacher', __name__, url_prefix='/teacher')
bp.register_blueprint(teacher_main_bp)
bp.register_blueprint(teacher_auth_bp)
bp.register_blueprint(teacher_examination_bp)
bp.register_blueprint(teacher_subject_bp)
bp.register_blueprint(teacher_student_bp)
