import { submit_form } from './services.js';

$(function () {
  const student_form = $('#add-student-form');
  submit_form(student_form);
  const exam_form = $('#add-examination-form');
  submit_form(exam_form);
  const subject_form = $('#add-subject-form');
  submit_form(subject_form);
});
