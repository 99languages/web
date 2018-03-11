$(document).ready(function() {
  // jQuery for page scrolling feature - requires jQuery Easing plugin.
  $(function() {
    $('a.page-scroll').bind('click', function(event) {
      var $anchor = $(this);
      $('html, body').stop().animate({
        scrollTop: $($anchor.attr('href')).offset().top
      }, 1500, 'easeInOutExpo');
      event.preventDefault();
    });
  });

  // Highlight the top nav as scrolling occurs.
  $('body').scrollspy({
    target: '.navbar-fixed-top'
  });

  // Closes the responsive menu on menu item click.
  $('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
  });

  // Contact submission.
  $('#contact input,textarea').jqBootstrapValidation({
    preventSubmit: true,

    submitError: function($form, event, errors) {
    },

    submitSuccess: function($form, event) {
      event.preventDefault();

      var name = $('#contact input#name').val();
      var email = $('#contact input#email').val();
      var phone = $('#contact input#phone').val();
      var message = $('#contact textarea#message').val();

      $.ajax({
        url: 'https://script.google.com/macros/s/AKfycbx9yGLVg80etLvlPrgRRasRDTK-_Hok507SC6vC6LdkBz_Qc_9d/exec',
        type: 'GET',
        data: {
          name: name,
          phone: phone,
          email: email,
          message: message
        },
        dataType: 'json',
        cache: false,
        success: function() {
          $('#contact #success').html("<div class='alert alert-success'>");
          $('#contact #success > .alert-success')
            .html('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;')
            .append('</button>');
          $('#contact #success > .alert-success')
            .append('<i class="fa fa-info-circle"></i> ' + $('#contact form').data('success-message'));
          $('#contact #success > .alert-success')
            .append('</div>');
          $('#contact #contact-form').trigger('reset');
        },
        error: function() {
          $('#contact #success').html("<div class='alert alert-danger'>");
          $('#contact #success > .alert-danger')
            .html('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;')
            .append('</button>');
          $('#contact #success > .alert-danger')
            .append('<i class="fa fa-exclamation-triangle"></i> ' + $('#contact form').data('error-message'));
          $('#contact #success > .alert-danger').append('</div>');
          $('#contact #contact-form').trigger('reset');
        },
      });
    },

    filter: function() {
      return $(this).is(':visible');
    },
  });

  $('#contact a[data-toggle="tab"]').click(function(e) {
    e.preventDefault();
    $(this).tab('show');
  });

  $('#contact #name').focus(function() {
    $('#success').html('');
  });
});
