#!usr/bin/python3
"""Examination module provides basic functionalities for an examination
"""

from app import db
from .cbt_model import CbtModel
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, DateTime


# """allowed_subject (Table)
# The list of subjects that are allowed in an examination
# This is neccessary so that the super teacher can set a list of subject that can be in an
# examination preventing other teachers from adding subjects and questions that shouldn't be
# in the exam
# """
# allowed_subjects = Table('allowed_subjects',
#                          Column('subject_id', String(60),
#                                 ForeignKey(Subject.id)),
#                          Column('examination_id', String(60),
#                                 ForeignKey('examinations.id')),
#                          Column('date_added', DateTime, default=datetime.utcnow()))


class Examination(CbtModel, db.Model):
    """An examination represents the whole period when the test occurs.
    It consists of several subject each with its own question papers

    Attributes:
        `name (str)`: Name of the examination e.g "2023/2024 CBT Examination - July"
        `start_date (datetime)`: Date and time the exam is starting
        `end_date (datetime)`: Date and time the exam is ending
        `subjects (List[models.Subject])`: Subjects to tested in the examination
        `papers (List[models.Paper])`: All question papers in the examination
    """

    # Map attributes with database columns
    __tablename__ = 'examinations'
    name = Column(String(128), nullable=False, unique=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    subjects = relationship(
        'Subject', secondary='question_papers', back_populates='examinations')
