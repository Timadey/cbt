#!/bin/bash
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn
cd "app/static/" || exit
npm install
