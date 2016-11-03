require('./test-base.js')(tfs_main);


function tfs_main(driver) {
  var hdfs    = require('fs')
  var fs, hdid;
  var gid_uid = parseInt(10 * Math.random()) + 1;
  var mode    = parseInt(0x777 * Math.random())+1;
  var now     = Date.now();

  var filecontent = hdfs.readFileSync('d:\\ImageDB.ddf');

  try {
    hdid = hdfs.readFileSync(__dirname + '/driver-id', {encoding:'UTF-8'});
  } catch(e) {
    throw new Error('Run "tdriver.js" first.');
  }

  return {

    open_fs: function(test) {
      driver.open_fs(hdid, function(err, _fs) {
        fs = _fs;
        test.assert(err);
        test.assert(_fs != null, 'cannot get fs');
        test.finish();
      });
    },

    mkdir1 : function(test) {
      test.wait('open_fs');
      fs.mkdir('/dir1', function(err) {
        if (err && err.code != 'EEXIST') test.assert(err);
        test.finish();
      });
    },

    mkdir2 : function(test) {
      test.wait('mkdir1')
      fs.mkdir('/dir2', function(err) {
        if (err && err.code != 'EEXIST') test.assert(err);
        test.finish();
      });
    },

    mkdir2a : function(test) {
      test.wait('mkdir2')
      fs.mkdir('/dir2/a', function(err) {
        if (err && err.code != 'EEXIST') test.assert(err);
        test.finish();
      });
    },

    mkdir3 : function(test) {
      test.wait('mkdir2')
      fs.mkdir('/dir1/a', function(err) {
        if (err && err.code != 'EEXIST') test.assert(err);
        test.finish();
      });
    },

    mkdir4 : function(test) {
      test.wait('mkdir3');
      fs.mkdir('/dir1/b', function(err) {
        if (err && err.code != 'EEXIST') test.assert(err);
        test.finish();
      });
    },

    list1: function(test) {
      test.wait('mkdir4');
      fs.readdir('/', function(err, list) {
        test.assert(err);
        test.log('/:', list);
        test.finish();
      });
    },

    list2: function(test) {
      test.wait('mkdir4');
      fs.readdir('/dir1', function(err, list) {
        test.assert(err);
        test.log('/dir1:', list);
        test.finish();
      });
    },

    list3: function(test) {
      test.wait('mkdir2a');
      fs.readdir('/dir2', function(err, list) {
        test.assert(err);
        test.log('/dir2:', list);
        test.finish();
      });
    },

    rm_dir_fail: function(test) {
      test.wait('list2', 'mkdir2a');
      fs.rmdir('/dir2', function(err) {
        test.assert(err != null, '非空文件夹不应该被删除');
        test.finish();
      });
    },

    rm_dir: function(test) {
      test.wait('list2', 'mkdir2a', 'rm_dir_fail');
      fs.rmdir('/dir2/a', function(err) {
        test.assert(err);
        test.retest('list3');
        test.finish();
      });
    },

    'update time': function(test) {
      test.wait('mkdir1');
      fs.utimes('/dir1', now, now, function(err) {
        // test.log(now);
        test.assert(err);
        test.finish();
      });
    },

    'change-owner': function(test) {
      test.wait('mkdir1');
      fs.chown('/dir1', gid_uid, gid_uid, function(err) {
        // test.log(gid_uid);
        test.assert(err);
        test.finish();
      });
    },

    'change-mode' : function(test) {
      test.wait('mkdir1');
      fs.chmod('/dir1', mode, function(err) {
        // test.log(mode);
        test.assert(err);
        test.finish();
      });
    },

    'link-state' : function(test) {
      test.wait('mkdir1', 'update time', 'change-owner', 'change-mode');
      fs.lstat('/dir1', function(err, stat) {
        test.assert(err);
        if (stat) {
          test.assert(stat.atime.getTime() == now, 'atime not change');
          test.assert(stat.mtime.getTime() == now, 'mtime not change');
          test.assert(stat.mode  == mode, 'mode not change');
          test.assert(stat.gid == gid_uid, 'gid not change');
          test.assert(stat.uid == gid_uid, 'uid not change');
          //test.log('/dir1', stat);
        }
        test.finish();
      });
    },

    'write-file': function(test) {
      test.wait('mkdir1');
      fs.writeFile('/dir1/t.txt', filecontent, function(err, size, buffer) {
        test.assert(buffer != null, 'cannot get buffer');
        test.assert(size != buffer.length, 'cannot write file');
        test.assert(err);
        test.finish();
      });
    },


    'read-file': function(test) {
      test.wait('write-file');
      fs.readFile('/dir1/t.txt', function(err, size, buffer) {
        if (!err) {
          test.assert(size != buffer.length, 'size fail.');
          test.assert(size != filecontent.length, 'size fail.');
          for (var i=0; i<size; ++i) {
            if (buffer[i] != filecontent[i]) {
              test.assert(fail, 'file content fail');
              break;
            }
          }
        }
        test.assert(err);
        test.finish();
      });
    },


    quit: function(test) {
      test.wait('change-mode', 'update time', 'list1', 'list2',
        'rm_dir', 'change-owner', 'link-state', 'write-file', 'read-file');

      fs.quit(function(err) {
        test.finish();
      });
    },
  };
}
