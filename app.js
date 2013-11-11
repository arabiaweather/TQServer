
var fq = require("./lib/fileQueue.js");
var restify = require("restify");

var config = require('konphyg')('./config');
var serverConfigs = config("main");
console.log(serverConfigs);

var ips = serverConfigs.ips; 


function pushQ(req, res, next)
{
	if(!(req.params.data === undefined))
	{	
		fq.push(req.params.data);
		res.send(201);
	}
	else
	{
		res.send(406,"Data Json Object must be spesified");
	}
	return next;
}

function popQ(req, res, next)
{


	fq.pop(function(data){
                if(data == null)
                {
                        res.send(204);
                }
                else
                {
                        res.send(200,data);
                }
        });
        return next;
}

function tPopQ(req, res, next)
{
	fq.tpop(function(data){
		if(data == null)
		{
			res.send(204);
		}
		else
		{
			res.send(200,data);
		}
	});
	return next;
}

function commitKey(req, res, next)
{
	fq.commit(req.params.key, function(err){
		if(err == false)
		{
			res.send(200);
		}
		else if (err = -1)
		{
			res.send(404,"Key Not Found");
		}
		else
		{
			res.send(500, "Key was not commited, error occured, " + err.toString());
		}
	});
return next;
}

function rollBack(req, res, next)
{
	fq.rollback(req.params.key, function(err){
		if(err == false)
                {
                        res.send(200);
                }
                else if (err = -1)
                {
                        res.send(404,"Key Not Found");
                }
                else
                {
                        res.send(500, "Key was not commited, error occured, " + err.toString());
                }

	});	
}

function rollBackAll(req, res, next)
{
	//TODO: Implementation needed In Lib
}

function commitAll(req, res, next)
{
	//TODO: Implementation needed in Lib
}

function clearAll(req, res, next)
{
	//TODO: Implement from Lib, already there, needs to be executed and blocks all requests until done
}

var server = restify.createServer();

server.use(restify.bodyParser())


//Block ips that are not allowed
server.pre(function(req, res, next) {
	if((ips.indexOf(req.connection.remoteAddress)) == -1)
	{
		res.send(403,"Remote Address not allowed");

	}
	return next();
});


server.use(restify.jsonp());
server.use(restify.gzipResponse());

server.post('/push', pushQ);
server.get('/pop', popQ);
server.get('/tpop', tPopQ);
server.get('/commit/:key',commitKey);
server.get('/rollback/:key', rollBack);
fq.init(function(){
	server.listen(serverConfigs.port, function() {
		console.log('%s listening at %s', server.name, server.url);
	});
});



