# #!/usr/bin/python3

"""Provides basic functionalities of a user"""
from app import login_manager
from sqlalchemy import Column, String
from app.models import CbtModel
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash


class User(CbtModel, UserMixin):
    """Provides basic functionalities of a user
    Models that requires authentication should inherit this class.

    Inherits `models.CbtModel`

    Attributes:
        `name (str)`: Name of the user
        `email (str)`: Email of the user
    """
    # Map attributes to column
    name = Column(String(128), nullable=False)
    email = Column(String(128), nullable=True, unique=True)
    password = Column(String(128), nullable=False)

    def set_password(self, pwd):
        """Set password for user"""
        self.password = generate_password_hash(pwd)

    def is_password(self, pwd):
        """Check if `pwd` is user's password"""
        return check_password_hash(self.password, pwd)


@login_manager.user_loader
def load_teacher(teacher_id: str):
    from app.models import Teacher
    return Teacher.query.get(teacher_id)
