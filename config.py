#!/usr/bin/python3
"""Configuration module for app
"""
from os import getenv
from dotenv import load_dotenv
load_dotenv()


class Config():
    """Configuration class for app
    """
    CBT_MYSQL_USER = getenv('CBT_MYSQL_USER')
    CBT_MYSQL_PWD = getenv('CBT_MYSQL_PWD')
    CBT_MYSQL_HOST = getenv('CBT_MYSQL_HOST', 'localhost')
    CBT_MYSQL_DB = getenv('CBT_MYSQL_DB')

    SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{CBT_MYSQL_USER}:{CBT_MYSQL_PWD}@{CBT_MYSQL_HOST}/{CBT_MYSQL_DB}'
    SECRET_KEY = getenv('SECRET_KEY')

    BOOTSTRAP_USE_CDN = True
    BOOTSTRAP_CDN_BASEURL = "https: // cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist"