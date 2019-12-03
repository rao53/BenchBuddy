
$('#signUp').on('click',function(){
    $('.modal-body').load('BenchBuddySignup.html',function(){
        $('#myModal').modal({show:true});
    });
});

function myfunc(){
	  $('.modal-body').load('BenchBuddySignup.html',function(){
        $('#myModal').modal({show:true});
    });
}
