#!/usr/bin/python3
"""A Student"""
from app import db
from .user import User
from app.models import CbtModel
from sqlalchemy import Column, String, ForeignKey, DateTime, Integer
from sqlalchemy.orm import relationship


class Student(User, db.Model):
    """A model of student that writes and examination"""
    __tablename__ = 'students'
    # name = Column(String(128), nullable=False)
    # email = Column(String(128), nullable=True, unique=True)
    question_papers = relationship(
        'QuestionPaper', secondary='results', back_populates='students')
    results = relationship('Result', viewonly=True)
