function renderWorkData ( obj, root_images ) {

    if ( Array.isArray( obj ) ) {
        var works = [];
        
        obj.forEach(function ( item, index ) {
            var work = structWorkData(item, root_images);

            works.push(work);
        })
        return works;
    }
    else {
        var work = structWorkData( obj, root_images );
        return work;
    }
}
function structWorkData ( item, root_images ) {
    var obj = {};
    var src = root_images+item.user.avatar;
    var score = item.total_score.split('.');
    var score_integer = score[0];
    var score_decimal = score[1];
    var labels = [];
    var comments = [];
    var photos = [];

    item.tags.forEach(function ( item ) {
        labels.push(item.text);
    });
    item.comments.forEach(function ( item ) {
        var obj = {};
        obj.nickname = item.user.nickname;
        obj.content = item.content;
        obj.id = +item.id;
        obj.works_id = +item.works_id;
        comments.push(obj);
    });
    item.details.forEach(function ( item ) {
        var src = root_images + item.src;
        var scale = item.w/item.h;

        photos.push({
            src: src,
            scale: scale
        });
    });
    
    obj.src = src;
    obj.photos = photos;
    obj.id = item.id;
    obj.is_auth = item.user.is_ident == 0 ? false : true;
    obj.activity_id = item.activity_id;
    obj.nickname = item.user.nickname;
    obj.date = item.create_time;
    obj.score_integer = score_integer;
    obj.score_decimal = score_decimal;
    obj.score_count = item.score_count;
    obj.labels = labels;
    obj.location = item.location;
    obj.des = item.subject;
    obj.comments_num = item.comment_count;
    obj.comments = comments;
    obj.is_scroll_x = true;
    obj.is_score = item.is_score;
    obj.uid = item.uid;
    
    return obj;
}

export default renderWorkData
