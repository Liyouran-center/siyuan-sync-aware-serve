## 程序介绍 
> 自部署思源笔记同步感知节点

## 部署方法
### 服务器手动部署
> 下载到服务器上，然后在根目录运行`npm i`，然后`npm run start`，程序会运行在7777端口
> 你可以配置`nginx`转发到`7777`端口，然后就可以通过域名访问了

### Docker部署
> 使用docker镜像进行部署
> 参考仓库中的docker compose文件进行部署

### Cloudflare Worker 部署
> 使用Cloudflare Worker进行部署，此方法可能会出现同步延迟的情况
> 直接创建Worker并将文件cloudflare-d1.js中的内容覆盖原有的内容
> 创建D1数据库并使用别名DB绑定到此Woeker中
> 因为原有域名在中国访问困难，在中国使用可能需要绑定其他域名
