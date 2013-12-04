/**
 * Created by fancy on 13-12-2.
 */
var mongodb = require('./db');

//评论model
function Comment(user, day, title, comment) {
    this.user = user;
    this.day = day;
    this.title = title;
    this.comment = comment;
}
module.exports = Comment;

//保存评论
Comment.prototype.save = function(callback) {
    var user = this.user;
    var day = this.day;
    var title = this.title;
    var comment = this.comment;

    //打开数据库
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.findAndModify({"user":user,"time.day":day,"title":title}
                , [['time',-1]]
                , {$push:{"comments":comment}}
                , {new: true}
                , function (err,comment) {
                    mongodb.close();
                    callback(err,comment);
                });
        });
    });
};