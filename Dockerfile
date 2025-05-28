# 使用Node.js官方镜像作为基础镜像
FROM node:18

# 设置工作目录
WORKDIR /app

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm
# 安装依赖
RUN pnpm install

# 复制项目文件
COPY . .

# 构建项目
RUN pnpm build || true

# 暴露端口
EXPOSE 7381

# 启动应用
CMD ["pnpm", "dev"]