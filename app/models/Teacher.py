#!/usr/bin/python3
"""A teacher is able to create questions for the subjects assigned to him
"""
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from models import User, Subject


class Teacher(User):
    """Teacher creates questions for subjects assigned

    Inherits `models.User`
    """

    # Map attributes to models
    __tablename__ = 'teachers'
    name = Column(String(128), nullable=False)
    email = Column(String(128), nullable=False, unique=True)
    subjects = relationship(Subject, backref='teacher',
                            cascade='all, delete-orphan')
