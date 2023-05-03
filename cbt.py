#!/usr/bin/python3
"""Main Flask App
"""
import flask
from app import create_app

cbt = create_app()

if __name__ == "__main__":
    flask.run(create_app())
