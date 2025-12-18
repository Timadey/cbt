from flask import Blueprint

bp = Blueprint('proctoring', __name__)

from app.proctoring import routes
