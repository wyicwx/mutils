var assert = require("assert");
var utils = require("../utils.js");

describe('Connect', function() {

	it('工厂化', function(done) {
		var newconnect = new utils.connect();
		var connect = utils.connect();

		assert.equal(newconnect instanceof utils.Connect, true);
		assert.equal(connect instanceof utils.Connect, true);
		done();
	});

	it('next参数往下传递', function(done) {
		var connect = utils.connect();

		connect.use(function(data, next, d) {
			next(0);
		});

		[1,2,3,4,5,6,7,8,9,10].forEach(function(value) {
			connect.use(function(data, next, d) {
				next(data + value);
			});
		});

		connect.fire(function(data) {
			assert.equal(data, 55);
			done();
		});
	});

	it('添加函数应该在链式上都有被执行', function(done) {
		var connect = utils.connect();
		var count = 0;

		for(var i = 0; i < 10; i++) {
			connect.use(function(data, next, d) {
				count++;
				next(count);
			});
		}

		connect.fire(function(data) {
			assert.equal(data, 10);
			done();
		});
	});

	it('调用done后会跳过链后面的函数', function(done) {
		var connect = utils.connect();

		connect.use(function(data, next, d) {
			next();
		});

		connect.use(function(data, next, d) {
			d();
		});

		connect.use(function() {
			assert.doesNotThrow(function() {
				throw new Error('这里不应该被执行');
			}, '这里不应该被执行');
		});

		connect.use(function() {
			assert.doesNotThrow(function() {
				throw new Error('这里不应该被执行');
			}, '这里不应该被执行');
		});

		connect.fire(function() {
			done();
		});
	});

	it('next传递的数据应该不会被改变', function(done) {
		var connect = utils.connect();

		connect.use(function(data, next, d) {
			next(1);
		});

		connect.use(function(data, next, d) {
			next(data);
		});

		connect.use(function(data, next, d) {
			next(data);
		});

		connect.use(function(data, next, d) {
			next(data);
		});

		connect.use(function(data, next, d) {
			next(data);
		});

		connect.fire(function(data) {
			assert.equal(data, 1);
			done();
		});
	});

	it('done传递的数据应该不会被改变', function(done) {
		var connect = utils.connect();

		connect.use(function(data, next, d) {
			next(1);
		});

		connect.use(function(data, next, d) {
			d(data);
		});

		connect.use(function(data, next, d) {
			next(2);
		});

		connect.fire(function(data) {
			assert.equal(data, 1);
			done();
		});
	});

	it('第一个链函数的data应该是undefined', function(done) {
		var connect = utils.connect();

		connect.use(function(data, next, d) {
			assert.equal(data, undefined);
			next(data);
		});

		connect.fire(function(data, next, d) {
			assert.equal(data, undefined);
			done();
		});
	});

});

describe('Do', function() {

	it('工厂化', function(done) {
		var newdo = new utils.do();
		var mdo = utils.do();

		assert.equal(newdo instanceof utils.Do, true);
		assert.equal(mdo instanceof utils.Do, true);
		done();
	});

	it('do参数传递', function(done) {
		var app = utils.do();

		app.do(function(done) {
			done(1);
		});

		app.do(function(done) {
			done(2);
		});

		app.done(function(a, b) {
			assert.equal(a, 1);
			assert.equal(b, 2);
			done();
		});
	});

	it('1000个函数同时执行', function(done) {
		var app = utils.do();

		for(var i = 0; i < 1000; i++) {
			app.do(function(done) {
				done(true);
			});
		}

		app.done(function() {
			var args = Array.prototype.slice.call(arguments);

			assert.equal(args.length, 1000);
			done();
		});
	});

	it('do参数定义的函数是马上执行的', function(done) {
		var app = utils.do(),
			count = 0;

		for(var i = 0; i < 1000; i++) {
			app.do(function() {
				assert.equal(i, count);
				count++;
			});
		}

		done();
	});

	it('先定义done后再定义do的情况，done在满足全部执行的情况下会再次执行', function(done) {
		var app = utils.do();

		app.do(function(done) {
			done(false);
		});

		app.done(function(a, b) {
			if(b == true) {
				done();
			}
		});

		app.do(function(done) {
			done(true);
		});
	});

	it('传递给done定义函数的参数和定义do的先后有关，和函数执行的事件无关', function(done) {
		var app = utils.do();

		app.do(function(done) {
			setTimeout(function() {
				done(1);
			}, 200);
		});

		app.do(function(done) {
			setTimeout(function() {
				done(2);
			}, 100);
		});

		app.done(function(a, b) {
			if(a == 1 && b == 2) {
				done();
			}
		});
	});

});
