
/*
 * GET home page.
 */
var User = require('../models/user.js');
var crypto = require('crypto');
var Post = require("../models/post.js");
var Comment = require("../models/comment.js");

module.exports = function(app) {
    //访问主页
	app.get('/',function(req,res){
        Post.getAll(null,function(err, posts){
            if (err) {
                posts = [];
            }
            res.render('index', {
                title : '主页',
                user : req.session.user,
                posts : posts ,
                success : req.flash('success').toString()
            });
        })

	});
    //注册
    app.get('/register',function(req,res) {
        res.render('register', {
            title : '注册',
            user : req.session.user,
            success : req.flash('success').toString(),
            error : req.flash('error').toString()
        });
    });
    app.post('/register', function(req,res) {
        if (req.body['comfirm_pwd'] != req.body['password']) {
            req.flash('error','两次输入的口令不一致');
            return res.redirect('/register');
        }
        var newUser = new User({
            name : req.body.username,
            password : req.body.password
        });
        User.get(newUser.name,function(err,user) {
            //判断用户是否存在
            if (user) {
                err = '用户已存在';
            }
            //当err不为空时
            if (err) {
                req.flash('error',err);
                return res.redirect('/register');
            }
            //插入新用户
            newUser.save(function(err) {
                if (err) {
                    req.flash('error',err);
                    return res.redirect('/register');
                }
                req.session.user = newUser;
                req.flash('success','注册成功');
                res.redirect('/');
            })
        })
    });
    //登录
    app.get('/login',function(req,res) {
        res.render('login',{
            title : '登录',
            user : req.session.user,
            success : req.flash('success').toString(),
            error : req.flash('error').toString()
        });
    });
    app.post('/login',function(req,res) {
        User.get(req.body.username, function(err,user) {
            if (!user) {
                req.flash('error','用户不存在');
                return res.redirect('/login');
            }
            if (user.password != req.body.password) {
                req.flash('error','密码错误');
                return res.redirect('/login');
            }
            req.session.user = user;
            req.flash('success','登录成功');
            res.redirect('/');
        });
    });
    app.get('/logout',function(req,res) {
    });
    //发表文章
    app.get('/post', checkLogin);
    app.get('/post',function(req,res) {
        res.render('post',{
            title : '发表',
            user : req.session.user,
            success : req.flash('success').toString(),
            error : req.flash('error').toString()
        });
    });
    app.post('/post', checkLogin);
    app.post('/post',function(req,res) {
        var currentUser = req.session.user;
        var post = new Post(currentUser.name, req.body.title, req.body.post);
        post.save(function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', '发布成功!');
            res.redirect('/');
        });
    });
    //查看一篇文章
    app.get('/:user/:time/:title', function(req, res) {
        User.get(req.params.user, function(err, user) {
            Post.getOne(req.params.user, req.params.time, req.params.title, function(err, post) {
                if (err) {
                    req.flash('err', err);
                    return res.redirect('/');
                }
                res.render('article', {
                    title : req.params.title,
                    post : post,
                    user : req.session.user,
                    success : req.flash('success').toString(),
                    error : req.flash('error').toString()
                });
            });
        });
    });
    //评论
    app.post('/:user/:time/:title', checkLogin);
    app.post('/:user/:time/:title', function(req, res) {
        var comment = null;
        var date = new Date();
        var time = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
        if (req.session.user) {
            var name=req.session.user.name;
            comment = {"name":name, "time":time, "content":req.body.content}
        } else {
            comment = {"name":req.body.name, "time":time, "content":req.body.content}
        }
        var oneComment = new Comment(req.params.user, req.params.time, req.params.title, comment);
        oneComment.save(function(err){
            if(err){
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', '评论成功!');
            res.redirect('back');//返回到被评论文章
        });
    });
    //作者页面（显示该作者的所有文章）
    app.get('/:user', function(req, res){
        User.get(req.params.user, function(err, user) {
            if(!user){
                return res.redirect('/');
            }

            Post.getAll(req.params.user, function(err, posts) {
                if (err) {
                    req.flash('err',err);
                    return res.redirect('/');
                }
                res.render('user', {
                    title: req.params.user,
                    posts: posts,
                    user: req.session.user,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
        });
    });

    //检验是否登录
    function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', '请登录');
            return res.redirect('/login');
        }
        next();
    }
};