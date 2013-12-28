/**
 * 继承underscore
 */
(function(e) {
	var underscore = require('underscore');

	underscore.extend(e, underscore);
})(exports);
/**
 * 并发处理函数
 * @example
 * 		var app = do();
 * 			app.do(function(done) {
 * 				//do something
 *     			done(1);
 * 			});
 * 			app.do(function() {
 * 				//do something
 *     			done(2);
 * 			});
 * 			app.done(function(result1, result2) {
 * 				console.log(arguments);
 * 				//[1,2]
 * 			});
 */
(function(e) {
	var _gid = 0;
	function _done(id, self) {
		return function(data) {
			var args; 
			if(arguments.length > 1) {
				args = Array.prototype.slice.call(arguments);
			} else if(arguments.length == 1) {
				args = data;
			}
			self.doned[id] = true;
			self.doneArgs[id] = args;
			self.done();
		};
	}

	function _checkDone(self) {
		for(var i in self.doned) {
			if(!self.doned[i]) return false;
		}
		return true;
	}

	function Do() {
		this.doned = {};
		this.doneArgs = {};
	}

	Do.prototype.do = function(fn) {
		var id = ++_gid;

		this.doned[id] = false;

		fn(_done(id, this));

		return this;
	};
	Do.prototype.done = function(fn) {
		if(!fn) return;
		this.done = function() {
			if(_checkDone(this)) {
				var args = [];
				for(var i in this.doned) {
					args.push(this.doneArgs[i]);
				}
				fn.apply(null, args);
			}
		};
		this.done();
	};
	e.do = function(fn) {
		var d = new Do();
		if(fn) {
			return d.do(fn);
		} else {
			return d;
		}
	};
})(exports);
/**
 * 职责链对象
 * @example
 * 		var c = connect();
 * 			c.use(function(data, next, done) {
 * 				//coding
 * 			 	next(data); //传递给下一个链函数处理 
 * 			});
 * 			c.use(function(data, next, done) {
 * 				//coding2
 * 				done(data); //跳过后面的链函数直接调用fire
 * 			})
 * 			c.fire();
 */
(function(e) {
	function _next(stack, callback) {
		var count = 0;
		function done(arg) {
			callback && callback(arg);
		}
		function next(arg) {
			var fn = stack[count++];
			if(fn) {
				fn.handler(arg, next, done);
			} else {
				done(arg);
			}
		}
		next();
	}
	
	function connect() {
		this.stack = [];
	}

	connect.prototype.use = function(fn) {
		this.stack.push({handler : fn});
		return this;
	};

	connect.prototype.fire = function(callback) {
		_next(this.stack, callback);
	};

	e.Connect = connect;
	e.connect = function() {
		return new connect();
	};
})(exports);

/**
 * 函数队列
 * 保证前一个函数执行后后一个函数才会开始执行，参数done函数标识函数执行成功
 * @example
 * 		var fq = fnQueue();
 * 			fq.add(function(done) {
 * 				//do something
 * 				done();
 * 			});
 * 			fq.add(function(done) {
 * 				//do something
 * 				done();
 * 			});
 */
(function(e) {
	function _emit(self) {
		if(!self.queue.length || self.isRun) {
			return;
		}
		self.isRun = true;
		var fn = self.queue.shift();
		fn(function() {
			self.isRun = false;
			_emit(self);
		});
	};

	function _FnQueue() {
		this.queue = [];
		this.isRun = false;
	};

	_FnQueue.prototype.add = function(fn) {
		this.queue.push(fn);
		_emit(this);
	}

	e.fnQueue = function() {
		return new _FnQueue();
	};
})(exports);

/**
 * 控制台模拟
 */
(function(e) {
	function _read(prompt, callback) {
		process.stdout.write(prompt + ':');
		process.stdin.resume();
		process.stdin.setEncoding('utf-8');
		process.stdin.on('data', function(chunk) {
			process.stdin.pause();
			// 去除换行
			chunk = chunk.replace(/(\n|\r)*$/, '');
			callback(chunk);
		});
	}

	e.read = _read;
})(exports);
/** 
 * 辅助函数
 */
(function(e) {
	function _fill(str, length, ch, left) {
		ch == undefined ? (ch = '') : ch;
		if(str.length < length) {
			var array = new Array(length - str.length);
			if(left == 'center') {
				var l = array.splice((length - str.length)/2);
				array = array.concat([str]);
				array = array.concat(l);
			} else if(left) {
				array.unshift(str);
			} else {
				array.push(str);
			}
			str = array.join(ch);
		}
		return str;
	}

	e.fill = _fill;
})(exports);

/**
 * buffer helper
 */
(function(e) {
	function _BufferHelper(buffer) {
		var self = this;
		this._buffer = new Buffer(0);
		this.length = 0;
		this.sliced = 0;
		if(buffer) {
			if(e.isArray(buffer)) {
				e.each(buffer, function(data) {
					self.concat(data);
				});
			} else {
				this.concat(buffer);
			}
		}
	}

	_BufferHelper.prototype = {
		/**
		 * 拼接string or buffer
		 * @param {Buffer|String} buffer 拼接的字符串 or buffer
		 */
		concat: function(buffer) {
			if(e.utils.isString(buffer)) {
				buffer = new Buffer(buffer);
			}
			this.length = this.length + buffer.length;
			this._buffer = Buffer.concat([this._buffer, buffer], this.legnth);
			return this;
		},
		/**
		 * buffer切片
		 * @param  {Number} size    切片大小，若endSize存在则为切片起始位置
		 * @param  {Number} endSize 切片结束为止，可选
		 * @return {Buffer}
		 */
		slice: function(size, endSize) {
			if(e.utils.isNumber(endSize)) {
				return this._buffer.slice(size, endSize);
			} else {
				var oldSize = this.sliced,
					newSize = oldSize + size;

				newSize = newSize > this.length ? this.length : newSize;
				this.sliced = newSize;
				return this._buffer.slice(oldSize, newSize);
			}
		},
		valueOf: function() {
			return this.toString();
		},
		toString: function() {
			return this._buffer.toString();
		},
		toBuffer: function() {
			return this._buffer;
		}
	}

	e.BufferHelper = _BufferHelper;
})(exports);
