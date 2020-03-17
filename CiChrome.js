"use strict";

var num = 20;   //CiPai Num

window.onload = function() {
    $.get('http://sou-yun.com/QueryCiTune.aspx').success(function(data){
        var indcont  = $('<div></div>');
        indcont.html(data);
        //Prepare JSON:
        var word_list = [
       ];
        //var ciArr = indcont.find('#ShowIndexInfo td a');
        var ciArr = indcont.find('.introduction .inline1 a');
        ciArr = shuffle(ciArr);
        ciArr = ciArr.slice(0, num);

        $.each(ciArr,function(i){
            var curCi = ciArr.eq(i);
            //word_list.push({text:curCi.text(), weight:i,link:"http://sou-yun.com/"+curCi.attr('href')});
            word_list.push({
                text:curCi.text(), 
                weight:i,
                html:{
                    class:'cipai ind-'+i,
                    index:i,
                    ind:curCi.attr('href')
                },
                afterWordRender: function(){
                    //Load the Ci into default usage!
                    if(i==19){
                        shuffleCi(19);
                        $('.ind-19').addClass('active');
                    }
                    if(document.body.clientWidth < 960) {
                            $('#CiIndex .cipai').hide();
                            $('#CiIndex').css('border','0px');
                            $('#CiContent').css('width',"90%");
                            $('#CiContent').css('font-size',"20px");
                   }
                    this.bind('click',function(){
                        shuffleCi($(this).attr('index')); 
                        $('.active').removeClass('active');
                        $(this).addClass('active');
                    });

                }
          });
        });

        $('#CiIndex').jQCloud(word_list);


     });
    var fontpath = chrome.extension.getURL('/font');
    var fontstr =  "@font-face {font-family: 'Kesong';src: url('"+ fontpath +"/font.otf') format('truetype');}";
    $('body').append('<style>'+fontstr+'</style>');



};




$( window ).resize(function() {
   location.reload(); 
});


// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}


// Shuffle the array
function shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

function shuffleCi(ind){
    $('#CiBanner').css('opacity', '0.2');
    $('#CiContent').css('opacity', '0.2');
    var detailPage = "http://sou-yun.com/"+$('.ind-'+ind).attr('ind');
    $.get(detailPage).success(function(data){
        var cont = $('<div></div>'); //Global Container
        cont.html(data);
        //Get the existed list
        // To Recursively get the list
        var exlinks = cont.find('.list1 a[href*=QueryCiTune]');
        exlinks = exlinks.slice(0, exlinks.length);

        //Define the Recursive Func
        function recGetList(lks, cl, func) {
            console.log(" Try to Fetch Further Page, Total "+ lks.length +" !");
            var nc = [];
            $.each(cl, function(i, v){
                nc.push(v);
            });
            if(lks.length==0){
                //return cl;
                func(nc);
            } else {
                console.info("http://sou-yun.com/"+lks.eq(0).attr('href'));
                $.get("http://sou-yun.com/"+lks.eq(0).attr('href')).success(function(d){
                    var ct = $('<div></div>');
                    ct.html(d);
                    var clst = ct.find('.list1 a[href^=java]');
                    $.each(clst, function(i, v){
                        nc.push(v);
                        cont.find('.list1').append(v);
                    });


                    var newitems = ct.find('div[id^=item_]'); 
                    console.info('Before Update Item: ' + cont.find('div[id^=item_]').length);
                    cont.append("<div class='newitems'></div>");
                    $.each(newitems, function(i){
                        cont.find('.newitems:last').append(newitems.eq(i).clone());
                    });
                    console.info('Updated Item: ' + cont.find('div[id^=item_]').length);
                    lks= lks.slice(1, lks.length);
                    recGetList(lks, nc, func);
                });
            }
        }

        //Do the iteration
        var clist = cont.find('.list1 a[href^=java]');
        recGetList(exlinks, clist, function(cclst){
            //console.log(cclst);
            //var citem = cclst.eq(getRandomInt(0,cclst.length-1));
            var citem = cclst[getRandomInt(0,cclst.length-1)];
            var id = citem.href.match(/.?(\d+).*/);
            console.log('#item_'+id[1]);
            var curi = cont.find('#item_'+id[1]);
            //console.log(curi.html());
            var curlink ="http://sou-yun.com/" + curi.find('a').attr('href') 
            curi.find('a:contains("自动")').remove();
            // Random Take
            var sel = getRandomInt(0, curi.find('.content').length-1);
            $('#CiContent').html(curi.find('.content').eq(sel).html());
    
            $('#CiBanner').empty();
            $('#CiBanner').append('<a class="a-link" href="'+curlink+'"><img src="/images/home.png"></img></a><div class="title"></div>');
            $('#CiBanner .title').html(curi.find('.title').eq(sel).text().replace(/押.*韵/,''));
            $('#CiBanner .title').attr('index',ind);
            $('#CiBanner .title').attr('title',curi.find('.title').eq(sel).text().replace(/押.*韵/,''));
            //=> To replace title
            $('title').html($('#CiBanner .title').text());

    //        $('#CiBanner ').append('<a class="sourcelink" href="http://sou-yun.com/'+curi.find('.title').eq(sel).find('a').eq(0).attr('href')+'" target="_blank" style="text-decoration:none;color:white;"> 源 </a>');
    
            $('#CiBanner .title img').unbind('click').bind('click',function(){
                
            });
            $('#CiBanner .title').unbind('click').bind('click',function(){
                $('#CiBanner .title').html('载入中');
                shuffleCi($(this).attr('index'));
            });
        });
        $('#CiBanner').css('opacity', '1');
        $('#CiContent').css('opacity', '1');

    });
}
