var cqld = require('./cql.js');


module.exports = create_stat;


//
// mtime "Modified Time" - 文件上次被修改的时间。
//  会被 mknod(2), utimes(2), and write(2) 等系统调用改变。
// ctime "Change Time" - 文件状态上次改变的时间。 (inode data modification).
//  会被 chmod(2), chown(2), link(2), mknod(2), rename(2), unlink(2), utimes(2),
//  read(2), and write(2) 等系统调用改变。
//
function create_stat(inf, hdid) {
  var node = inf.node;
  var pobj = inf.path;
  var ret = {
    dev       : hdid,
    ino       : node.id,
    mode      : node.mode,
    nlink     : node.ref_pth ? node.ref_pth.length : 0,
    uid       : node.uid,
    gid       : node.gid,
    rdev      : hdid,
    size      : node.tsize,
    blksize   : node.blocksz,
    blocks    : parseInt(node.tsize / node.blocksz) + 1,
    atime     : node.atime && new Date(node.atime.toNumber()),
    mtime     : node.mtime && new Date(node.mtime.toNumber()),
    ctime     : node.ctime && new Date(node.ctime.toNumber()),
    birthtime : node.btime && new Date(node.btime.toNumber()),

    isFile            : is_fn(pobj.type == cqld.T_FILE),
    isDirectory       : is_fn(pobj.type == cqld.T_DIR),
    isBlockDevice     : is_fn(true),
    isCharacterDevice : is_fn(false),
    isSymbolicLink    : is_fn(pobj.type == cqld.T_SYM_LINK),
    isFIFO            : is_fn(false),
    isSocket          : is_fn(false),
  };


  return ret;


  function is_fn(attr) {
    return function() {
      return attr;
    };
  }
};