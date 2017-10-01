$(function(){

        var $medialist = $('#medialist');
        
        $medialist.delegate('.likebutton', 'click', function(){
            var that = $(this);
            var postID = $(this).attr('data-postid');
            $.ajax({
                type: 'PUT',
                url: '/like/' + postID,
                success: function(data){
                    console.log(data);
                    that.removeClass( "likebutton" ).addClass( "unlikebutton" );
                    that.html("Unlike");
                    that.next().html(data.likesCount);
                }
            });
        });

        $medialist.delegate('.unlikebutton', 'click', function(){
            var that = $(this);
            var postID = $(this).attr('data-postid');
            $.ajax({
                type: 'PUT',
                url: '/unlike/' + postID,
                success: function(data){
                    console.log(data);
                    that.removeClass( "unlikebutton" ).addClass( "likebutton" );
                    that.html("Like");
                    that.next().html(data.likesCount);
                }
            });
        });

        $medialist.delegate('.deletebutton', 'click', function(){
            var that = $(this);
            var postID = $(this).attr('data-postid');
            var $li = $(this).closest('li');
            $.ajax({
                type: 'DELETE',
                url: '/' + postID,
                success: function(data){
                    console.log(data);
                    $li.remove();
                }
            });
        });

    });