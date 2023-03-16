$(document).ready(function () {
  const questions = {};
  let question = '';
  let options = [];
  let correct_option = '';
  let que_num = 0;
  let option_num = 0;
  let edited = false;

  // Get questions from server
  const url = window.location.pathname.split('/');
  id = url[url.length - 1];
  $.ajax({
    type: 'GET',
    url: `http://teacher.localhost:5000/examination/question/${id}/json`,
    dataType: 'text',
    async: false,
    success: function (response) {
      questions = JSON.parse(response);
      console.log(response);
    }
  });
  load_question(0);

  function get_input () {
    inp = $('#question-input').val();
    inp = inp.trim();
    return inp;
  }

  function clear_input () {
    $('#question-input').val('');
  }

  function html_append_option (option_num, option) {
    $('#option-list').append(`<li class='w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600'> \
                <div class='flex items-center pl-3'> \
                    <input id='${option_num}' type='radio' value='${option}' name='option' \
                        class='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 \
                         dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500'> \
                    <label for='${option_num}' name='option-label' \
                        class='w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>${option}</label> \
                </div> \
            </li>`);
  }

  function validate_question () {
    errors = [];
    if (question === '') {
      errors.push('Add a new question first');
    }
    if (options.length === 0) {
      errors.push('Add one or more options');
    }
    correct_option = $("input[name='option']:checked").attr('id');
    if (!correct_option || correct_option == '') {
      errors.push('Select the correct option');
    }
    if (errors.length > 0) {
      return { exist: true, errors: errors };
    }
    else return { exist: false };
  }

  function save_question () {
    if (edited === true) {
      errors = validate_question();
      if (errors.exist)
        return errors.errors;
      questions[que_num] = {
        question: question,
        options: options,
        correct_option: correct_option
      };
    }
    edited = false;
  }

  function load_question (num) {
    //   Load a question. If the index `num` passed is greater than
    // list of `questions`. Initiate a new question
    //  else load the question using the index provided into view.
    l = Object.keys(questions).length;
    if (l === 0)
      return $('#question-display').html('<i> ...No question yet. Add some by using the box below</i>');
    if (num < 0) {
      num = 0;
    }
    if (num >= l) {
      num = l;
      question = '';
      options = [];
      correct_option = '';
      option_num = 0;
    //   edited = true
    //   console.log(num)
    } else {
      question = questions[num].question;

      options = questions[num].options;
      correct_option = questions[num].correct_option;
      option_num = options.length;
      edited = false;
    }
    //   Question Indicator
    $('#question-indicator').text(`Question ${num + 1} of ${l}`);

    // Display question
    $('#question-display').text(question);
    // Display options
    $("input[name='option'], label[name='option-label']").remove();
    options.forEach((opt, idx) => {
      html_append_option(idx, opt);
    });
    // console.log(correct_option)
    // Check correct option
    $(`input[id = ${correct_option}]`).prop('checked', true);
    return num;
  }

  //   Add Question button clicked
  $('#add-question-btn').click(function () {
    question = get_input();
    if (question !== '') {
      $('#question-display').text(question);
    }else {
      alert('Use the text box to write your question or option first!');
    }
    clear_input();
    edited = true;
  });

  // Add option button clicked
  $('#add-option-btn').click(function () {
    const option = get_input();
    if (option !== '') {
      html_append_option(option_num, option);
      options.push(option);
      option_num += 1;
    }else {
      alert('Use the text box to write your question or option first!');
    }
    clear_input();
    edited = true;
  });
  // Next Button
  $('#next-question-btn').click(function () {
    errors = save_question();
    if (errors) {
      msg = '';
      for (err of errors) {
        msg += `${err}\n`;
      }
      return alert(msg);
    }
    que_num = load_question(que_num + 1);
  });

  // Prev Button
  $('#prev-question-btn').click(function () {
    errors = save_question();
    if (errors) {
      msg = '';
      for (err of errors) {
        msg += `${err}\n`;
      }
      return alert(msg);
    }
    que_num = load_question(que_num - 1);
  });
});
