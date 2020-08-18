$(document).ready(function(){
    $('.myform-register').submit(function(event) {
        event.preventDefault();
        var fullname = $('#FullName').val();
        var mobile = $('#Mobile').val();
        var email = $('#Email').val();
        var distributor = getUrlParameter('distributor');

        $.ajax({
            type: 'POST',
            url: 'http://103.1.239.26:3299/api/distributor/addPotentialDistributor',
            data: 'name=' + fullname + '&mobile=' + mobile + '&email=' + email + '&distributor=' + distributor,
            success: function(data){alert('success');}
        });
    });
    var getUrlParameter = function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
    
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
    
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };
});