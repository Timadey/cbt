#!/usr/bin/python3

"""Provides basic functionalities for a subject

Attributes:
    `Paper (sqlalchemy.Table)`: A paper consist of several questions.
    It belongs to subject and written in an examination
"""
from sqlalchemy import Column, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from models import CbtModel, Teacher


"""Table Paper: A paper consist of several questions
It belongs to subject and written in an examination
"""
Paper = Table('papers')


class Subject(CbtModel):
    """A subject is mostly assigned to a teacher,
    exists in several examinations and contains several questions

    Attributes:
        `name (str)`: Name of the Subject
        `teacher (models.Teacher)`: The teacher assigned to this subject
    """

    # Map attributes to columns in the table
    __tablename__ = 'subjects'
    name = Column(String(128), nullable=False)
    teacher_id = relationship(Teacher, ForeignKey(Teacher.id), nullable=False)

    @property
    def teacher(self) -> Teacher:
        """The teacher assigned to this subject"""
        # return Teacher.get(self.teacher_id)
