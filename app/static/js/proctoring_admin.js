$(function () {
    const proctoring_toggles = $("input[name='proctoring-toggle']");

    proctoring_toggles.on('change', function () {
        const id = $(this).attr('id');
        const is_enabled = $(this).is(':checked');

        $.ajax({
            url: `/teacher/examination/proctoring/toggle/${id}`,
            type: 'POST',
            contentType: 'application/json',
            success: function (res) {
                if (res.success) {
                    console.log(res.message);
                    const link = $(`#proctoring-link-${id}`);
                    if (res.proctoring_enabled) {
                        link.show();
                    } else {
                        link.hide();
                    }
                } else {
                    alert('Failed to toggle proctoring');
                    // Revert toggle state if failed
                    $(this).prop('checked', !is_enabled);
                }
            },
            error: function (err) {
                console.error('Error toggling proctoring:', err);
                alert('An error occurred while toggling proctoring');
                $(this).prop('checked', !is_enabled);
            }
        });
    });
});
