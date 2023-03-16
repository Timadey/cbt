#!/usr/bin/python3

"""Provides basic functionalities for a subject

Attributes:
    `Paper (sqlalchemy.Table)`: A paper consist of several questions.
    It belongs to subject and written in an examination
"""
from app import db
import json
from typing import List
from datetime import datetime
from sqlalchemy.orm import relationship
from .cbt_model import CbtModel
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Integer


class QuestionPaper(CbtModel, db.Model):
    """Table Paper: A paper consist of several questions
    It belongs to subject and written in an examination
    """
    __tablename__ = 'question_papers'
    id = Column(Integer(), primary_key=True, unique=True, autoincrement=True)
    subject_id = Column(String(60), ForeignKey('subjects.id'), nullable=False)
    examination_id = Column(String(60), ForeignKey(
        'examinations.id'), nullable=True)
    questions = Column('questions', JSON, nullable=True,
                       default=json.dumps({}))
    start_date = Column('start_date', DateTime,
                        default=datetime.utcnow(), nullable=True)
    end_date = Column('end_date', DateTime,
                      default=datetime.utcnow(), nullable=True)
    students = relationship(
        'Student', secondary='results', back_populates='question_papers')

    @property
    def questions_dict(self) -> List[dict]:
        """Loads the json format of the questions as a python dictionary"""
        questions = json.loads(self.questions)
        return questions

    @property
    def total_questions(self) -> int:
        return len(self.questions_dict)

    @property
    def examination(self):
        """Return the examination of this question paper"""
        from app import Examination
        return Examination.query.get(self.examination_id)

    @property
    def subject(self):
        """Return the subject of this question paper"""
        from app import Subject
        return Subject.query.get(self.subject_id)


class Subject(CbtModel, db.Model):
    """A subject is mostly assigned to a teacher,
    exists in several examinations and contains several questions

    Attributes:
        `name (str)`: Name of the Subject
        `teacher (models.Teacher)`: The teacher assigned to this subject
    """

    # Map attributes to columns in the table
    __tablename__ = 'subjects'
    name = Column(String(128), nullable=False)
    teacher_id = Column(String(60), ForeignKey('teachers.id'), nullable=False)
    examinations = relationship(
        'Examination', secondary='question_papers', back_populates='subjects')
    questions = relationship('QuestionPaper', viewonly=True)

    def exam_question(self, exam_id: str = None):
        """Return a list of question paper for this subject or just one for an exam
        """
        from sqlalchemy import select
        if exam_id is not None:
            stmt = select(QuestionPaper).where(
                QuestionPaper.subject_id == self.id, QuestionPaper.examination_id == exam_id)
        else:
            stmt = select(QuestionPaper).where(
                QuestionPaper.subject_id == self.id)
        questions = db.session.execute(stmt).all()
        que = [q[0] for q in questions]
        return que
