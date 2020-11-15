var counter=3;
$(function(){
$("#panel").click(function(){
    $("#hiden").slideToggle();
});
});



$(document).on('change', '.checkbox', function()  {
    $id="#"+this.id+'_content';
    

    if(this.checked)
    {
    $find_id="#c"+this.id;
    $($id).addClass("checked");
    $($find_id).submit();
    }
 else
 {
    $find_id="#u"+this.id;
 $($id).removeClass("checked");
 $($find_id).submit();
 }
});


$(function(){
$("#create_todo").click(function(){
    
if($('#input_text').val().length!=0){
    var new_append=$("<div class='input-group board added'><div class='input-group-text'><input class='checkbox' id='c"+ counter +"' type='checkbox' aria-label='Checkbox for following text input'></div><input id='c"+counter+"_content' class='form-control' type='text' placeholder='"+$('#input_text').val()+ "'readonly></div>").hide();
    $("#content_list").append(new_append);
    counter++;
    new_append.show('slow');
 $('#input_text').val('');
}
else
alert("Please enter Text!"); 
})
});

$(function(){
    $("#delete").click(function(){
        if(counter!=3){
        $(".added").slideUp('slow',function(){ $(".added").remove();});
    
        counter=3;
        }
    });
});
