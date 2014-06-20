var iodized = {};

iodized.init = function() {
    //iodized.switchery();
    //iodized.addNewFeature();
    iodized.changeFeatureSettingsVisibility();
}

iodized.switchery = function() {
    var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
    elems.forEach(function(elem) {
        var switchery = new Switchery(elem,
            {
                color          : '#2e507f',
                secondaryColor : '#d5dce5',
                className      : 'switchery',
                disabled       : false,
                disabledOpacity: 0.5,
                speed          : '0.3s'
            }
        );
        elem.onchange = function() {
            $elem = $(elem);
            $elem.closest('.feature--on, .feature--off').toggleClass('feature--on feature--off');
        };
    });
};

iodized.addNewFeature = function() {
    $('.new-feature__add').click(function (event) {
        event.preventDefault();
        var newFeature = $(this).closest('.new-feature')
        if (newFeature.is(".is-expanded, .is-collapsed")) {
            newFeature.toggleClass('is-expanded is-collapsed');
            newFeature.find("input:first-of-type").focus();
        } else {
            newFeature.addClass('is-expanded');
            newFeature.find("input:first-of-type").focus();
        }
    });

    $('.new-feature__close').click(function (event) {
        event.preventDefault();
        var newFeature = $(this).closest('.new-feature')
        newFeature.toggleClass('is-expanded is-collapsed');
    });

    $('.new-feature__submit').click(function (event) {
        event.preventDefault();
        var newFeature = $(this).closest('.new-feature')
        newFeature.toggleClass('is-expanded is-collapsed');
    });
}

iodized.changeFeatureSettingsVisibility = function() {
    $("#iodized").on( 'click', '.feature__view-edit-button', function(event) {
        event.preventDefault();
        $(this).closest('.feature--on, .feature--off').toggleClass('is-expanded is-collapsed');
    });
}


$(document).ready(function() {
    iodized.init();

//    var mydata = {
//        "definition": null,
//        "description": "this is an awesome new feature",
//        "master_switch_state": "dynamic",
//        "title": "some_feature"
//    };
//
//    $.ajax({
//        url: '/admin/api/features',
//        contentType: 'application/json',
//        type: 'POST',
//        data: JSON.stringify(mydata)
//    });

});

