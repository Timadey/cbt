async function set_question(url, cls) {
   $.ajax({
      type: 'GET',
      url: url,
      dataType: 'text',
      async: true,
      success: function (response) {
        cls.questions = JSON.parse(response);
      }
    });
}

class QuestionLoader {

  questions;
  curr_question = "";
  curr_options = [];
  curr_correct_option = "";
  curr_question_num = 0;
  curr_option_num = 0;
  edited = false;

  constructor(url, selectors) {
    this.questions = set_question(url, this);
    this.selectors = selectors;
  }

  // Submit questions
  submit_questions(url) {
    const que = JSON.stringify(this.questions);
    // console.log(que);
    $.ajax({
      type: "POST",
      url: url,
      data: que,
      contentType: 'application/json',
      success: function () {
        alert('Question uploaded successfully!');
      }
    });
  }

  // load questions
  load_question(num = 0) {
    const que_length = Object.keys(this.questions).length;
    if (que_length === 0) {
      this.selectors.question_display.html('<i> ...No question yet. \
      Add some by using the box below</i>');
      return 0;
    }
    if (num === que_length) {
      // num = que_length;
      this.curr_question = "";
      this.curr_options = [];
      this.curr_correct_option = "";
      this.curr_option_num = 0;
      // this.edited = false;

    } else {
      const que = this.questions[num];
      this.curr_question = que.question;
      this.curr_options = que.options;
      this.curr_correct_option = que.correct_option;
      this.curr_option_num = this.curr_options.length;
      this.edited = false;
    }
    // Start displaying current question and options
    this.selectors.question_indicator.text(`Question ${Number(num) + 1} of ${que_length}`);

    // Display the current question
    this.selectors.question_display.text(this.curr_question);

    // Display the current options
    // thselectors.is.option_list_item.remove();
    $("li[name='option-list-item']").remove();
    this.curr_options.forEach((opt, idx) => {
      this.html_append_option(opt, idx);
    });
    // Check correct option radio
    if (this.curr_correct_option) {
      $(`input[id=${this.curr_correct_option}]`).prop('checked', true);
    }
    // Style pagiation button
    $("li[name='question-number-btn']").removeAttr('style');
    $(`li[name='question-number-btn'][id='${num}']`).attr('style', 'background-color:black;color:white');

    return num;
  }

  // Set correct option
  set_correct_option() {
    this.edited = true;
    return this.curr_correct_option = $("input[name='option']:checked").attr('id');
  }

  // Validate current question
  validate_question(question = this.curr_question) {
    const errors = [];
    if (question === '') {
      errors.push('Add a new question first');
    }
    if (this.curr_options.length === 0) {
      errors.push('Add one or more options');
    }
    if (!this.curr_correct_option || this.curr_correct_option == '') {
      errors.push('Select the correct option');
    }
    if (errors.length > 0) {
      return { exist: true, errors: errors };
    }
    else return { exist: false };
  }

  // Save current question
  save_question(que_num = this.curr_question_num) {
    if (this.edited === true) {
      let errors = this.validate_question();
      if (errors.exist) {
        return errors.errors;
      }
      // console.log(que_num);
      this.questions[que_num] = {
        question: this.curr_question,
        options: this.curr_options,
        correct_option: this.curr_correct_option,
      };
      // console.log(this.questions);
      this.html_insert_pagination();
      this.edited = false;
    }

  }

  // Get current input from the textbox
  get_input() {
    return this.selectors.question_input.val().trim();
  }

  // Clear the current input from the textbox
  clear_input() {
    return this.selectors.question_input.val("");
  }

  // Option list appender
  html_append_option(option, option_num = this.curr_option_num) {
    return this.selectors.option_list.append(
      `<li name='option-list-item' \
      class='w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600'> \
      <div class='flex items-center pl-3'> \
      <input id='${option_num}' type='radio' value='${option}' name='option' \
      class='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 \
      focus:ring-blue-500 dark:focus:ring-blue-600 \
      dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 \
      dark:bg-gray-600 dark:border-gray-500'> \
      <label for='${option_num}' name='option-label' \
      class='w-full py-3 ml-2 text-sm font-medium text-gray-900 \
      dark:text-gray-300'>${option}\
      </label> \
      </div> \
      </li>`
    );
  }

  // Pagination Appender
  html_insert_pagination() {
    // console.log('pagination' + this.curr_question_num);
    // console.log($(`li[name='question-number-btn'][id='${this.curr_question_num}']`).length);
    if ($(`li[name='question-number-btn'][id='${this.curr_question_num}']`).length <= 0) {
      $(`li[name='question-number-btn'][id='${Number(this.curr_question_num) - 1 }']`).after(
        `<li id='${this.curr_question_num }' name='question-number-btn'
              class='px-3 py-2 leading-tight text-gray-500 bg-white border \
              border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'>\
              ${Number(this.curr_question_num) + 1}
      </li>`
      );
    }
  }
}

$(document).ready(function () {
  $("#spinner").hide();

  // Get a selectors needed
  const selectors = {
    question_display: $("#question-display"),
    question_input: $("#question-input"),
    add_option_btn: $("#add-option-btn"),
    add_question_btn: $('#add-question-btn'),
    option_list: $("#option-list"),
    option_list_item: $("li[name='option-list-item']"),
    question_indicator: $("#question-indicator"),
    question_pagination: $('#question-pagination'),
    next_question_btn: $("#next-question-btn"),
    prev_question_btn: $("#prev-question-btn"),
    submit_question_btn: $("#submit-question-btn"),
    question_number_btn: $("li[name='question-number-btn']")
  };

  // Set URL to get question from server
  const url_ = window.location.pathname.split('/');
  const id = url_[url_.length - 1];
  const url = `http://teacher.localhost:5000/examination/question/${id}/json`;

  // Initiate Question Loader
  const QueLoader = new QuestionLoader(url, selectors)

  // Bind Event Handlers

  // When Add Question Button is clicked
  selectors.add_question_btn.on('click', function () {
    // Get the input from textbox
    const question = QueLoader.get_input();
    // Display the question
    if (question !== '') {
      selectors.question_display.text(question);
      QueLoader.curr_question = question;
      QueLoader.clear_input();
      QueLoader.edited = true;
      alert('Question edited!');
    } else {
      alert('Use the text box to write your question or option first!');
    }
  });

  // When Add Option Button is clicked
  selectors.add_option_btn.on('click', function () {
    const option = QueLoader.get_input();
    if (option !== '') {
      QueLoader.html_append_option(option);
      QueLoader.curr_options.push(option);
      QueLoader.curr_option_num += 1;
      QueLoader.clear_input();
      QueLoader.edited = true;
    } else {
      alert('Use the text box to write your question or option first!');
    }
  });

  // When Next Button is clicked
  selectors.next_question_btn.on('click', function () {
    const errors = QueLoader.save_question();
    if (errors) {
      let msg = '';
      for (err of errors) {
        msg += `${err}\n`;
      }
      return alert(msg);
    }
    let next_question_num = Number(QueLoader.curr_question_num) + 1;
    // console.log(next_question_num);
    if (next_question_num >= Object.keys(QueLoader.questions).length) {
      next_question_num = Object.keys(QueLoader.questions).length;
    }
    // console.log(next_question_num);
    QueLoader.curr_question_num = QueLoader.load_question(next_question_num);
  });

  // When Prev Button is clicked
  selectors.prev_question_btn.on('click', function () {
    const errors = QueLoader.save_question();
    if (errors) {
      let msg = '';
      for (err of errors) {
        msg += `${err}\n`;
      }
      return alert(msg);
    }
    let next_question_num = Number(QueLoader.curr_question_num) - 1;
    // console.log(next_question_num);
    if (next_question_num < 0) {
      next_question_num = 0;
    }
    // console.log(next_question_num);
    QueLoader.curr_question_num = QueLoader.load_question(next_question_num);
  });

  // When Submit Button is clicked
  selectors.submit_question_btn.on('click', function () {
    // console.log(QueLoader.questions);
    const errors = QueLoader.save_question();
    if (errors) {
      let msg = '';
      for (err of errors) {
        msg += `${err}\n`;
      }
      return alert(msg);
    }
    QueLoader.submit_questions(url);
  })

  // When Option list is clicked (Option is presumably changed)
  selectors.option_list.on('click', function () {
    if (selectors.option_list.children().length > 0) {
      // console.log(QueLoader.set_correct_option());
    }
  })

  // When question Number is clicked
  $("#question-pagination").on('click', $("li[name='question-number-btn']"), function (e) {
    const errors = QueLoader.save_question();
    if (errors) {
      let msg = '';
      for (err of errors) {
        msg += `${err}\n`;
      }
      return alert(msg);
    }
    QueLoader.curr_question_num = QueLoader.load_question(e.target.id);
  })


  // Load first question
  let q = Object.keys(QueLoader.questions)[0];
  $("#spinner").show(500, () => { QueLoader.load_question(q); })
  $("#spinner").hide();

});
