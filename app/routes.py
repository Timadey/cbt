#!/usr/bin/python3
"""App Routes
"""

from flask import render_template, current_app

current_app.app_context.push()


@current_app.route('/')
def welcome():
    return render_template('index.html')


#####################################################
# Students or Teachers routes
#####################################################

# @app.route('/', methods=['GET', 'POST'])
# def start_examination():
#     form = StartExaminationForm()
#     if form.validate_on_submit():
#         exam_id = form.examination_id.data
#         subject_id = form.subject_id.data
#         # Get question paper for exam for the subject
#         paper = QuestionPaper.query.join(Examination).join(Subject).where(
#             Examination.id == exam_id, Subject.id == subject_id).first()
#         print(paper)
#         return redirect(url_for('write_examination', paper_id=paper.id))
#     return render_template('student/start_examination.html', form=form)


# @app.route('/<int:paper_id>', methods=['GET', 'POST'])
# def write_examination(paper_id):
#     paper = QuestionPaper.query.get_or_404(paper_id)
#     if request.method == 'POST':
#         submitted = {k: v for k, v in request.form.items()}
#         del submitted['submit']
#         # Mark submitted answers
#         paper = paper.questions_dict
#         score = 0
#         for que_num, answer in submitted.items():
#             if paper.get(que_num).get('correct_option') == int(answer):
#                 score += 1
#         flash(f'You scored {score}/{len(paper)}')
#         return render_template('student/base.html')
#     return render_template('student/write_examination.html', paper=paper.questions_dict, paper_id=paper_id)
