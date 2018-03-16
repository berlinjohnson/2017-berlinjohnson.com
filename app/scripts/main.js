var Handlebars = require('handlebars');
var mdc = require('material-components-web/dist/material-components-web');
var $ = require('jquery');

mdc.autoInit();
var database = firebase.database();
var projectsRef = firebase.database().ref('projects/').orderByKey();

// ON READY ---------

$(function() {
  //PROJET CARDS TEMPLATE
  var projectCardSource   = $("#projectCard-template").html();
  var projectCardTemplate = Handlebars.compile(projectCardSource);
  //PROJECT DIALOG TEMPLATE
  var projectDialogSource   = $("#projectDialog-template").html();
  var projectDialogTemplate = Handlebars.compile(projectDialogSource);
  //PIECE DIALOG TEMPLATE
  var pieceDialogSource   = $("#pieceDialog-template").html();
  var pieceDialogTemplate = Handlebars.compile(pieceDialogSource);

  var portfolio = null;
  var projectID = null;
  var piecesList = [];
  var pieceID = null;

  // MATERIAL COMPONENTS
  var toolbar = mdc.toolbar.MDCToolbar.attachTo(document.querySelector('.mdc-toolbar'));
  toolbar.fixedAdjustElement = document.querySelector('.mdc-toolbar-fixed-adjust');

  var dialog = new mdc.dialog.MDCDialog(document.querySelector('#dialog'));
  dialog.listen('MDCDialog:cancel', function() {
    projectID = null;
    pieceID = null;
    piecesList = [];
  });

  // Override escape
  dialog.foundation_.documentKeydownHandler_ = function(evt) {
    if (evt.key && evt.key === 'Escape' || evt.keyCode === 27) {
      if (pieceID === null) {
        dialog.foundation_.cancel(true);
      } else {
        pieceID = null;
        showProjectGallery();
      }
    }
  };

  // NAV BAR
  var showSection = function(path) {
    // Switch tab highlighed
    $('.tabs button').removeClass('is-selected')
                     .blur();
    $('.tabs button[data-path="' + path + '"]').addClass('is-selected');

    // Switch section shown
    $('.navigation-section').addClass('is-hidden');
    $('.navigation-section[data-path="' + path + '"]').removeClass('is-hidden');
  };

  // Browser's back or forward action
  window.onpopstate = function(e) {
    showSection(location.pathname);
  };

  // First page load
  showSection(location.pathname);

  var navigateTo = function(e) {
    e.preventDefault;

    var path = $(this).data('path');
    if (location.pathname === path) {
      return;
    };

    history.pushState({}, '', path);
    showSection(path);
  };
  $('#portfolioNav').on('click', navigateTo);
  $('#resumeNav').on('click', navigateTo);
  $('#aboutNav').on('click', navigateTo);

  // GRABBING PROJECTS
  projectsRef.once('value', function(snapshot) {
    portfolio = snapshot.val();
    showProjectCards();
  });

  // CLICKING PROJECT
  $('#projects').on('click', '.project-card', function (e) {
    e.preventDefault;
    projectID = this.id;
    for (index in portfolio[projectID].pieces){
      piecesList.push(index)
    }

    showProjectGallery();

    dialog.lastFocusedTarget = e.target;
    dialog.show();
  });

  // CLICKING PIECE
  dialog.foundation_.adapter_.registerSurfaceInteractionHandler('click', function(e) {
    e.preventDefault;
    var $clicked = $(e.target);
    var isBackButton = $clicked.closest('.back-button').length;
    var isPiece = $clicked.closest('.mdc-grid-tile').length;
    var isNavButton = $clicked.closest('.button-nav').length;
    var isNavButtonLeft = $clicked.closest('.button-left').length;
    var isNavButtonRight = $clicked.closest('.button-right').length;

    if (isPiece) {
      pieceID = $clicked.closest('.mdc-grid-tile')[0].id;
      showPiece();
    }
    if (isBackButton) {
      showProjectGallery();
      pieceID = null;
    }
    if (isNavButton) {
      if (isNavButtonRight) {
        showNextPiece();
      }
      else if (isNavButtonLeft) {
        showPreviousPiece();
      }
    }
  });

  //Arrow keys to navigation pieces
  $(document).keyup(function(e) {
    if (pieceID){
      if (e.key == "ArrowRight") {
        showNextPiece();
      }
      else if (e.key == "ArrowLeft") {
        showPreviousPiece();
      }
    }
  });


  // FUNCTIONS ---------
  var nextPieceID = function(step) {
    var currentPosition = piecesList.indexOf(pieceID);
    var nextIndex = currentPosition + step;

    if (nextIndex < 0) {
      return piecesList[piecesList.length - 1];
    } else if (nextIndex < piecesList.length) {
      return piecesList[nextIndex];
    } else {
      return piecesList[0];
    }
  }

  var showNextPiece = function() {
    pieceID = nextPieceID(1);
    showPiece();
  }

  var showPreviousPiece = function() {
    pieceID = nextPieceID(-1);
    showPiece();
  }

  var showProjectCards = function() {
    $('#projects').html('');
    var projectCards = projectCardTemplate({"projects": portfolio});
    $('#projects').html(projectCards);
  }

  var showProjectGallery = function() {
    $('#dialogContent').html('');
    var gallery = portfolio[projectID];
    gallery["project"] = projectID;
    var dialogContent  = projectDialogTemplate(gallery);
    $('#dialogContent').append(dialogContent);
  }

  var showPiece = function() {
    var dialogContent = $('#dialogContent');
    dialogContent.html('');
    var currentPiece = portfolio[projectID].pieces[pieceID];
    currentPiece["project"] = projectID;
    currentPiece["neighborImages"] = [
      portfolio[projectID].pieces[nextPieceID(1)].img,
      portfolio[projectID].pieces[nextPieceID(-1)].img
    ];
    var content  = pieceDialogTemplate(currentPiece);
    dialogContent.append(content);
  }

});
