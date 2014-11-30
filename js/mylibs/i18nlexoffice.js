$(document).ready(function() {
i18n.init({ fallbackLng: 'en-US'
 });

i18n.init(function(t) {
  // translate nav
  $(".nav").i18n();
  $(".document-wrapper").i18n();

});

});

