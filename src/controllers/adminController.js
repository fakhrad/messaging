var User = require('../models/adminuser'); 
var async = require('async');
var Space = require('../models/space');

var findById = function(req, cb)
{
    async.parallel(
        {
            "user" : function(callback) {User.findById(req.body.id).exec(callback)},
            "spaces" : function(callback) {Space.find({owner : req.body.id}).exec(callback)}
        }, (err, results)=>{
            var result = {success : false, data : null, error : null };
            if (err)
            {
                result.success = false;
                result.data =  undefined;
                result.error = err;
                cb(result);       
                return; 
            }
            else
            {
                if (results.user)
                {
                    result.success = true;
                    result.error = undefined;
                    var output = results.user.viewModel();
                    output.spaces = [];
                    console.log(results.spaces);
                    if (results.spaces)
                    {
                        results.spaces.forEach(space => {
                            output.spaces.push(space.viewModel());
                        });
                    }
                    result.data = output;
                    cb(result);
                    return;
                }
                else
                {
                    result.success = false;
                    result.data =  undefined;
                    result.error = "User not found";
                    cb(result);       
                    return; 
                }
            }
        }
    )
};

var logout = function(req, cb)
{
     User.findById(req.body.id).exec(function(err, user){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (user)
        {
            user.access_token = undefined;
            user.save(function(err){
                if(err)
                {
                    result.success = false;
                    result.data =  undefined;
                    result.error = err;
                    cb(result);       
                    return; 
                }
                //Successfull. 
            });
            return;
        }
        else
        {
            result.success = false;
            result.data =  undefined;
            result.error = undefined;
            cb(result);       
            return; 
        }
    });
};

var savetoken = function(req, cb)
{
    console.log(req);
     User.findById(req.body.id).exec(function(err, user){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (user)
        {
            user.access_token = req.body.access_token;
            Object.assign(user, req.body);
            user.save(function(err){
                if(err)
                {
                    result.success = false;
                    result.data =  undefined;
                    result.error = err;
                    cb(result);       
                    return; 
                }
                //Successfull. 
            });
            return;
        }
        else
        {
            result.success = false;
            result.data =  undefined;
            result.error = undefined;
            cb(result);       
            return; 
        }
    });
};
var findByUserName = function(req, cb)
{
    console.log(req.body.username);
    User.findOne({'username' : req.body.username}).exec(function(err, user){
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        if (user)
        {
            result.success = true;
            result.error = undefined;
            result.data =  user;
            cb(result); 
        }
        else
        {
            result.success = false;
            result.data =  undefined;
            result.error = undefined;
            cb(result);       
            return; 
        }
    });
};
var registerUser = function(req, cb)
{
    console.log('Importing admin user');
    console.log(req.body);
    User.insertMany([req.body], (err, docs)=>{
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        //Successfull. 
        console.log('User imported successfully');
        result.success = false;
        result.data =  docs;
        result.error = err;
        cb(result);
    });
};

//Export functions
exports.findbyId = findById;
exports.findbyemail = findByUserName;
exports.registeruser = registerUser;
exports.logout = logout;
exports.savetoken = savetoken;