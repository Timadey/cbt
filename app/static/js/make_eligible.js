$(function () {
  const url = `http://localhost:5000/teacher/examination/make_eligible`;
  const question_paper_id = $("div[name='question-paper']").attr('id');
    const student_id = $("tr[name='student']").attr('id');
    console.log(student_id)

    $('#make-eligible').on('click', function () {
        console.log('make eligible clicked');
    submit_eligibility(url, question_paper_id, student_id);
  });

    async function submit_eligibility(url, question_paper_id, student_id) {
    const data = JSON.stringify({
        question_paper_id, student_id
    });
        console.log(data);
    $.ajax({
        type: "POST",
        url: url,
        data: data,
        contentType: 'application/json',
        success: function (response) {
            alert(response.message);
        }
    });
    }
});
