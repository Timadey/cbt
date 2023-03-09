#!usr/bin/python3
"""Examination module provides basic functionalities for an examination
"""

from app import db
from .cbt_model import CbtModel
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer


class Examination(CbtModel, db.Model):
    """An examination represents the whole period when the test occurs.
    It consists of several subject each with its own question papers

    Attributes:
        `name (str)`: Name of the examination e.g "2023/2024 CBT Examination - July"
        `start_date (datetime)`: Date and time the exam is starting
        `end_date (datetime)`: Date and time the exam is ending
        `subjects (List[models.Subject])`: Subjects to tested in the examination
        `question (List[models.QuestionPaper])`: All question papers in the examination
        `students`: List of students that took this examination
    """

    # Map attributes with database columns
    __tablename__ = 'examinations'
    name = Column(String(128), nullable=False, unique=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    subjects = relationship(
        'Subject', secondary='question_papers', back_populates='examinations')
    questions = relationship('QuestionPaper', viewonly=True)
    students = relationship(
        'Student', secondary='results', back_populates='examinations')
    results = relationship('Result', viewonly=True)


class Result(CbtModel, db.Model):
    """Result of an examination. A weak entity between students and examination"""
    __tablename__ = 'results'
    examination_id = Column(String(60), ForeignKey(
        'examinations.id'), nullable=False)
    student_id = Column(String(60), ForeignKey('students.id'), nullable=False)
    score = Column(Integer, nullable=True)
    time_submitted = Column(DateTime, nullable=True)
