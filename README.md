## 程序介绍 
> 自部署思源笔记同步感知节点

## 部署方法
### 服务器手动部署
> 下载到服务器上，然后在根目录运行`npm i`，然后`npm run start`，程序会运行在7777端口
> 你可以配置`nginx`转发到`7777`端口，然后就可以通过域名访问了

### Docker部署
> 使用docker镜像进行部署

### Cloudflare Worker 部署
> 使用Cloudflare Worker进行部署，此方法可能会出现同步延迟的情况
