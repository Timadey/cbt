export function submit_form (form) {
  // Submit a form and show errors if exists
  form.submit(function (e) {
    e.preventDefault();
    const url = $(this).attr('action');
    const data = $(this).serialize();
    $("ul[name='errors']").html('');
    $.ajax({
      type: 'POST',
      url: url,
      data: data,
      success: function (response) {
        const data = response;
        if (data.errors) {
          for (let error in data.errors) {
            for (let err in data.errors[error]) {
              $(`#errors-${error}`).append(`<li>${data.errors[error][err]}</li`);
            }
          }
        }else {
          alert(data.message);
          window.location.reload();
        }
      }
    });
  });
}
