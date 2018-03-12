(function(window, document, undefined) {
  $(document).ready(function() {
    // jQuery for page scrolling feature - requires jQuery Easing plugin.
    $('a.page-scroll').bind('click', function(event) {
      var $anchor = $(this);
      $('html, body').stop().animate({
        scrollTop: $($anchor.attr('href')).offset().top
      }, 1500, 'easeInOutExpo');
      event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs.
    $('body').scrollspy({
      target: '.navbar-fixed-top'
    });

    // Closes the responsive menu on menu item click.
    $('.navbar-collapse ul li a').click(function() {
      $('.navbar-toggle:visible').click();
    });

    // Contact form.
    $(function() {
      function strip_filename(name) {
        return name.replace(/\\/g, '/').replace(/.*\//, '');
      }

      function toogle_spinner(form) {
        $('button[type=submit]', form).toggleClass('disabled');
        $('button[type=submit] i', form).toggleClass('hidden');
      }

      function subbmission_success(form) {
        toogle_spinner(form);
        var contact = $('#contact');
        $('#success', contact).html("<div class='alert alert-success'>");
        $('#success > .alert-success', contact)
          .html('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;')
          .append('</button>');
        $('#success > .alert-success', contact)
          .append('<i class="fa fa-info-circle"></i> ' + $('form', contact).data('success-message'));
        $('#success > .alert-success', contact)
          .append('</div>');
        $('#contact-form', contact).trigger('reset');
      }

      function subbmission_error(form) {
        toogle_spinner(form);
        var contact = $('#contact');
        $('#success', contact).html("<div class='alert alert-danger'>");
        $('#success > .alert-danger', contact)
          .html('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;')
          .append('</button>');
        $('#success > .alert-danger', contact)
          .append('<i class="fa fa-exclamation-triangle"></i> ' + $('form', contact).data('error-message'));
        $('#success > .alert-danger', contact).append('</div>');
        $('#contact-form', contact).trigger('reset');
      }

      var form = $('#contact form');

      if (window.FormData === undefined || window.FileReader === undefined) {
        $(form).hide();
      } else {
        $('input,textarea', form).jqBootstrapValidation({
          preventSubmit: true,

          submitError: function(form, event, errors) {
          },

          submitSuccess: function(form, event) {
            event.preventDefault();

            toogle_spinner(form);

            function submit(data) {
              $.ajax({
                url: 'https://script.google.com/macros/s/AKfycbx9yGLVg80etLvlPrgRRasRDTK-_Hok507SC6vC6LdkBz_Qc_9d/exec',
                type: 'POST',
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                success: function(response) {
                  if (response.result == 'success') {
                    subbmission_success(form);
                  } else {
                    subbmission_error(form);
                  }
                },
                error: function(response) {
                  subbmission_error(form);
                },
              });
            }

            var data = new FormData();
            data.append('name', $('input#name', form).val());
            data.append('email', $('input#email', form).val());
            data.append('phone', $('input#phone', form).val());
            data.append('message', $('textarea#message', form).val());

            var input = $('input#file', form);
            if (input[0].files.length > 0) {
              var reader = new FileReader();
              reader.onload = function () {
                  var base64 = reader.result.replace(/^[^,]*,/, '');
                  data.append('file', base64);
                  data.append('filename', strip_filename(input[0].files[0].name));
                  submit(data);
              };
              reader.readAsDataURL(input[0].files[0]);
            } else {
              submit(data);
            }
          },

          filter: function() {
            return $(this).is(':visible');
          },
        });

        $('a[data-toggle="tab"]', form).click(function(e) {
          e.preventDefault();
          $(this).tab('show');
        });

        $('#name', form).focus(function() {
          $('#success').html('');
        });

        $(document).on('change', ':file', function() {
          var input1 = $(this);
          var input2 = $(this).parents('.input-group').find(':text');
          if (input1[0].files.length > 0) {
            if (input1[0].files[0].size > 10 * 1024 * 1024) {
              input1.val('');
              input2.val('');
            } else {
              input2.val(strip_filename(input1[0].files[0].name));
            }
          } else {
            input2.val('');
          }
        });
      }
    });
  });
})(window, document);
