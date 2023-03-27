import { set_question, QuestionLoader } from './add_question.js';
$(function () {
  function style_pagination (num) {
    $("li[name='question-btn']").removeAttr('style');
    $(`li[name='question-btn'][id='${num}']`).attr('style', 'background-color:black;color:white');
  }
  // Get a selectors needed
  const selectors = {
    question_display: $('#question-display'),
    option_list: $('#option-list'),
    option_list_item: $("li[name='option-list-item']"),
    question_indicator: $('#question-indicator'),
    question_pagination: $('#que-pagination'),
    next_question_btn: $('#next-btn'),
    prev_question_btn: $('#prev-btn'),
    submit_question_btn: $('#submit-btn'),
    question_number_btn: $("li[name='question-btn']")
  };
  const id = $("div[name='question-paper']").attr('id');
  const url = `http://localhost:5000/teacher/examination/question_paper/${id}`;
  const QueLoader = new QuestionLoader(url, selectors);

  // When Next Button is clicked
  selectors.next_question_btn.on('click', function () {
    QueLoader.save_question();
    let next_question_num = Number(QueLoader.curr_question_num) + 1;
    // console.log(next_question_num)
    if (next_question_num >= Object.keys(QueLoader.questions).length) {
      next_question_num = Object.keys(QueLoader.questions).length;
    }
    // console.log(next_question_num)
    QueLoader.curr_question_num = QueLoader.load_question(next_question_num);
    style_pagination(next_question_num);
  });

  // When Prev Button is clicked
  selectors.prev_question_btn.on('click', function () {
    QueLoader.save_question();
    let next_question_num = Number(QueLoader.curr_question_num) - 1;
    // console.log(next_question_num)
    if (next_question_num < 0) {
      next_question_num = 0;
    }
    // console.log(next_question_num)
    QueLoader.curr_question_num = QueLoader.load_question(next_question_num);
    style_pagination(next_question_num);
  });

  // When Submit Button is clicked
  selectors.submit_question_btn.on('click', function () {
    // console.log(QueLoader.questions)
    QueLoader.save_question();
    console.log(QueLoader.questions);
    QueLoader.submit_questions(url, (res) => {
      alert(`Your score is ${res.score}/${Object.keys(QueLoader.questions).length}`);
      window.location.replace(res.callback);
    });
  });

  // When Option list is clicked (Option is presumably changed)
  selectors.option_list.on('click', function () {
    if (selectors.option_list.children().length > 0) {
      QueLoader.set_correct_option();
      let class_attr = $(`li[name='question-btn'][id='${QueLoader.curr_question_num}']`).attr('class');
      class_attr = class_attr.replace('text-gray-500 bg-white', 'text-white bg-green-700');
      $(`li[name='question-btn'][id='${QueLoader.curr_question_num}']`).attr('class', class_attr);
    }
  });

  // When question Number is clicked
  $("li[name='question-btn']").on('click', function (e) {
    QueLoader.save_question();
    QueLoader.curr_question_num = QueLoader.load_question(e.target.id);
    style_pagination(e.target.id);
  });

  // Load first question
  let q = Object.keys(QueLoader.questions)[0];
  $('#spinner').hide(500, () => {
    QueLoader.load_question(q);});
});
