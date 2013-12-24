var assert = require("assert");
var utils = require("../utils.js");

describe('connect', function() {

	it('new connect和直接执行connect返回的对象必须是相同的', function(done) {
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