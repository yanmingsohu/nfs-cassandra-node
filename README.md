# Net file system (fs) api

fs api doc version on nodejs <=0.12.x

每个 cassandra 的 keyspace 可以保存多个 driver; 把 driver 想象成硬盘,  
每个硬盘都格式化成 ext4 格式, 可以在硬盘上打开文件系统(fs)进行操作.
应该给 fs 一个独立的 keyspace.

由于 NFS 可以有多个用户同时修改文件, 读取文件状态后进行操作是不安全的,
由于没有文件锁, 文件内容和长度随时可以改变, cassandra 操作有延迟, 写入
后立即读取未必是最新的状态.

0.2.x 实现不支持用户权限/组权限.
0.1.x 实现不支持用户权限/组权限, 不支持(软/硬)符号链接.

* 使用 localhost 连接服务器导致初次连接速度缓慢


# install

`npm install fs-cassandra-lib --save`


# Usage

所有带有 Sync 结尾的同步式函数都不支持, 调用时会抛出异常.
修改 config/config.js 保证可以连接 cassandra/redis, 集群中的节点应该联入
正确的 cassandra/redis 集群以实现正确的文件系统和消息通知.

```js
fs_cass.open_driver(function(err, driver) {
  driver.open_fs('driver-id', function(err, fs) {
    // 与 nodejs 的 fs 对象相同
    fs.quit();
  });
});

```

# Console

启动命令行模式, `help` 显示可用命令.

`npm start`


# Api

## var fs_cass = require('fs-cassandra-lib')

  导入库

## fs_cass.open_driver([config, ] (err, driver) => {})

  打开一个驱动, 参数是已经链接的 cassandra 客户端, 之后所有操作都是基于这个连接的.
  config => { cassandra_client, watch_impl : WatchImplements }

## driver.create(note, cb)

  使用驱动创建一块硬盘, 如果成功将返回驱动 id, note 是对硬盘的描述字符串,
  cb => (err, info), info = { hd_id -- 硬盘id }

## driver.delete(hd_id, cb)

  删除一块硬盘, 如果硬盘已经被打开, 这些操作将会出错.

## driver.state(hd_id, cb)

  查询硬盘数据, cb => (err, info),
  info = { note, open_cnt -- 已经链接到硬盘的数量 }

## driver.list(cb)

  列出所有硬盘的 id, cb => (err, hd_array)

## driver.open_fs(hd_id, cb)

  在硬盘上打开文件系统api进行操作, 打开成功后 open_cnt+1; cb => (err, fs)

## driver.init_db(cb)

  初始化数据库表, 在空的数据库上进行操作.

## fs.quit(cb); dirver.close_fs(fs);

  fs 扩展, 关闭打开的 fs, open_cnt-1, 即使在 cb 中发生错误, fs 也无法使用.


# Class WatchImplements

  文件监听器实现

## Function watch(hdid, filename, options)

  监听文件的修改, 返回一个 `Events` 对象, 当 filename 文件有改动时,
  返回的 `Events` 对象发出 'change' 事件.

## Function change(hdid, filename, type)

  当文件被改变, 该方法被调用, 实现应该发送消息到某处.

## Function end()

  关闭监听器, 内存被释放.


# About

* [nodejs fs api](https://nodejs.org/dist/latest-v0.12.x/docs/api/fs.html)
* [cql docs](http://cassandra.apache.org/doc/latest/cql/index.html)
* [JS Type](http://datastax.github.io/nodejs-driver/features/datatypes/)
