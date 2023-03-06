#!usr/bin/python3
"""Examination module provides basic functionalities for an examination
"""
from sqlalchemy import Column, String, DateTime
from models import CbtModel


class Examination(CbtModel):
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
