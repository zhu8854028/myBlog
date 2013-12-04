/**
 * Created by fancy on 13-12-2.
 */
var mongodb = require('./db');

function Post(user,title,post) {
    this.user = user;
    this.title = title;
    this.post = post;
}

module.exports = Post;

//保存文章
Post.prototype.save = function(callback) {
    var date = new Date();
    var time = {
        date : date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth()+1),
        day : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
    };
    //一篇文章
    var post = {
        user : this.user,    //用户
        time : time,         //发表时间
        title : this.title,  //标题
        pv : 0,              //浏览量
        post : this.post,    //文章内容
        comments:[]          //评论
    };

    //打开数据库
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.insert(post, {
                safe: true
            }, function(err, post) {
                mongodb.close();
                callback(err,post);
            });
        });
    });
};
//获取一个人的所有文章
Post.getAll = function(user, callback) {
    mongodb.open(function(err,db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function(err,collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (user) {
                query.user = user;
            }
            collection.find(query).sort({
                time : -1
            }).toArray(function(err,docs) {
                    mongodb.close();
                    if(err){
                        callback(err,null);
                    }
                    callback(null, docs);
                });
        });
    });
};
//获取一篇文章
Post.getOne = function(user, day, title, callback) {
    //打开数据库
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts',function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //获取文章
            collection.findOne({"user":user, "time.day":day, "title":title},function(err, doc) {
                mongodb.close();
                if (err) {
                    callback(err, null);
                }
                callback(null, doc);
            });
            //增加文章浏览量
            collection.update({"user":user, "time.day":day, "title":title},{$inc:{"pv":1}});
        });
    });
};
