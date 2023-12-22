
# Computer Based Test (CBT) Application
The application is live and accessible at: [cbtim.onrender.com](https://cbtim.inrender.com) 🎉
Check [USAGE.md](/USAGE.md) on how to use the system

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Deployment](#deployment)
- [Usage](#usage)

## About <a name = "about"></a>

CBT is a user-friendly Computer-Based Test (CBT) application designed specifically for academic institutions to seamlessly conduct exams in a digital format. This application streamlines the process of exam administration, empowering educators to create, manage, and assess examinations efficiently.

### Key Feature
- **Exam Creation**: Teachers can effortlessly create exams with detailed subject configurations.
- **Subject Management**: Easy association of subjects with question papers for better organization.
- **Student Enrollment**: Facilitates student profiles and eligibility settings for exam participation.
- **Token Generation**: Generates unique tokens for eligible students to take their exams securely.
- **Automated Result Generation**: Automatically generates exam results upon completion.


## Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them.

- [Python](https://www.python.org/) (>=3.6)
- [Pip](https://pip.pypa.io/en/stable/installation/)
- [Virtualenv (venv)](https://docs.python.org/3/library/venv.html)
- [Docker](https://www.docker.com/get-started)
- [MySQL](https://dev.mysql.com/downloads/)
- [Node.js and npm](https://nodejs.org/)


### Installing

A step by step series of examples that tell you how to get a development env running.

1. Clone the repository

```bash
git clone https://github.com/timadey/cbt.git
cd cbt
```

2. Create and activate virtual environment. See [deployment](#deployment) on how to use docker.

```bash
python3 -m venv myenv
source myenv/bin/activate
```

3. Install dependencies

```bash
pip install -r requirements.txt
cd app/static
npm install
cd ../..
```

4. Set up environment variable
Import [`cbt.sql`](/cbt.sql) at the root directory into your mysql database to easily setup the db with prefilled demo data. 
```bash
cp .env.example .env

```
Then edit `.env` with your database credentials

5. Start the application
```bash
flask run
```

6. Access the application on your local browser `http://localhost:5000`

```bash
 * Serving Flask app 'cbt.py'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
 * Restarting with stat
 * Debugger is active!
```

## Deployment  <a name = "deployment"></a>
The application is live and accessible at: [cbtim.onrender.com](https://cbtim.inrender.com) 🎉
Check [USAGE.md](/USAGE.md) on how to use the system

It is advisable to use Docker for deployment. The Dockerfile is availabe at the root dir. 
Ensure to replace `/etc/secrets/.env` with your original path to `.env`. 
To deploy this app to a live server, run the following commands on your server

```bash
cd cbt/
docker build -t cbt .
docker run -p 5000:5000 cbt
```

## Usage <a name = "usage"></a>
Check [USAGE.md](/USAGE.md) on how to use the system

## Contributions

Contributions are welcome! If you want to contribute to this project, please fork the repository, make your changes, and submit a pull request.

## Author

- **Timadey**
  - [LinkedIn](https://www.linkedin.com/in/timadey)