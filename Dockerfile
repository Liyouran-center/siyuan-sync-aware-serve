FROM node:20-alpine

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

# 更改文件所有权
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 7777

CMD ["npm", "run", "start"]
