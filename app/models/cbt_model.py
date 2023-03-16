#!/usr/bin/python3
"""Contains the foundations of all CBT models

classes:
    CbtModel: `Object` : This model is inherited by all other CBT model
    It sets the attributes `id`, `created_at` and `modified_at`. It also
    contains fundamental methods required by all models.
"""

from uuid import uuid4
from datetime import datetime
from sqlalchemy import Column, String, DateTime

from app import db
class CbtModel():
    """
    A model that sets foundational attributes and methods for other models. All models
    must inherits this model

    Attributes:
        `id (str)`: a uniquely generated id
        `created_at (datetime)`: the date this model was created
        `modified_at (datetime)`: the date this model was modified
    """
    # Map attributes to table columns
    id = Column(String(60), nullable=False, unique=True,
                primary_key=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now())
    modified_at = Column(DateTime, nullable=False, default=datetime.now())

    def __init__(self, **kwargs):
        """Initializes the model
        """
        if not kwargs:
            self.id = str(uuid4())
            self.created_at = datetime.now()
            self.modified_at = self.created_at
        else:
            if "id" not in kwargs.keys():
                setattr(self, 'id', str(uuid4()))
            if 'created_at' not in kwargs.keys():
                setattr(self, 'created_at', datetime.now())
            if 'modified_at' not in kwargs.keys():
                setattr(self, 'modified_at', datetime.now())

            for key, value in kwargs.items():
                if key == 'created_at' or key == 'modified_at':
                    value = datetime.strptime(value, "%Y-%m-%dT%H:%M:%S.%f")
                if key != '__class__':
                    setattr(self, key, value)

    def __str__(self):
        """Return a string representation of the model
        """
        return f"<{type(self).__name__}> ({self.id})"

    def __repr__(self):
        """Return official representation of model"""
        return self.__str__()

    def to_dict(self):
        """Return dictionary representation of the model
        """
        model_dict = self.__dict__.copy()
        model_dict['created_at'] = model_dict['created_at'].isoformat()
        model_dict['modified_at'] = model_dict['modified_at'].isoformat()
        model_dict['__class__'] = type(self).__name__
        if '_sa_instance_state' in model_dict.keys():
            model_dict.pop('_sa_instance_state', None)
        return model_dict

    def save(self):
        """Save the current model to the database
        """
        db.session.add(self)
        db.session.commit()

    # def all(self):
    #     """Get all of this model from database
    #     """
    #     return storage.all(self)

    # @classmethod
    # def get(cls, id: str):
    #     """Return the object with `id` from database if it exists
    #     """
    #     return storage.get(cls, id)
