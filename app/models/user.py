# #!/usr/bin/python3

# """Provides basic functionalities of a user"""

# from sqlalchemy import Column, String
# from app.models import CbtModel


# class User(CbtModel):
#     """Provides basic functionalities of a user
#     Models that requires authentication should inherit this class.

#     Inherits `models.CbtModel`

#     Attributes:
#         `name (str)`: Name of the user
#         `email (str)`: Email of the user
#     """
#     # __abstract__ = True
#     # Map attributes to column
#     name = Column(String(128), nullable=False)
#     email = Column(String(128), nullable=False, unique=True)

#     def __init__(self, **kwargs):
#         super().__init__(**kwargs)
