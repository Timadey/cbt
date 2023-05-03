#!/bin/bash
pip install -r requirements.txt
pip install gunicorn
cd "static/" || exit
npm install
