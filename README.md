# 博客平台项目

基于 Supabase 和 Netlify 构建的现代化博客平台，支持文章发布、用户认证、评论系统等功能。

## 🚀 技术栈

- **前端**: React 18 + Vite + React Router
- **后端**: Supabase (数据库 + 认证 + 实时功能)
- **部署**: Netlify
- **样式**: CSS3 (响应式设计)
- **Markdown**: react-markdown (文章内容渲染)

## 📋 功能特性

### 核心功能
- ✅ 用户注册和登录
- ✅ 文章创建、编辑、删除
- ✅ 文章分类管理
- ✅ 评论系统
- ✅ 响应式设计
- ✅ Markdown 支持

### 页面结构
1. **首页** (`/`) - 文章列表展示
2. **文章详情** (`/post/:id`) - 文章内容和评论
3. **创建文章** (`/create-post`) - 写作界面
4. **编辑文章** (`/edit-post/:id`) - 文章编辑
5. **分类页面** (`/categories`) - 所有分类
6. **分类详情** (`/category/:slug`) - 特定分类文章
7. **登录** (`/login`) - 用户登录
8. **注册** (`/register`) - 用户注册
9. **个人中心** (`/profile`) - 用户文章管理

### 数据库设计
- **posts** - 文章表
- **categories** - 分类表
- **comments** - 评论表
- **tags** - 标签表
- **user_profiles** - 用户资料表
- **post_likes** - 文章点赞表
- **post_tags** - 文章标签关联表

## 🛠️ 本地开发

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd supabase-blog-platform
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 Supabase 配置：
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000

### Supabase 数据库设置

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL 编辑器中执行 `database/schema.sql` 文件
3. 在 Authentication 设置中启用邮箱注册
4. 获取项目的 URL 和 anon key，填入环境变量

## 🚀 部署到 Netlify

### 自动部署
1. 将代码推送到 GitHub
2. 在 Netlify 中连接 GitHub 仓库
3. 配置环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 部署设置会自动读取 `netlify.toml` 配置

### 手动部署
1. **构建项目**
```bash
npm run build
```

2. **部署到 Netlify**
```bash
npx netlify deploy --prod --dir=dist
```

## 📁 项目结构

```
supabase-blog-platform/
├── public/                 # 静态资源
├── src/
│   ├── components/        # React 组件
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── contexts/          # React Context
│   │   ├── AuthContext.jsx
│   │   └── SupabaseContext.jsx
│   ├── lib/              # 工具函数
│   │   └── supabase.js
│   ├── pages/            # 页面组件
│   │   ├── Home.jsx
│   │   ├── PostDetail.jsx
│   │   ├── CreatePost.jsx
│   │   ├── EditPost.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Profile.jsx
│   │   ├── Categories.jsx
│   │   └── CategoryDetail.jsx
│   ├── App.jsx           # 主应用组件
│   ├── main.jsx          # 应用入口
│   └── index.css         # 全局样式
├── database/
│   └── schema.sql        # 数据库结构
├── .env.example          # 环境变量示例
├── .gitignore
├── index.html
├── netlify.toml          # Netlify 配置
├── package.json
└── vite.config.js
```

## 🎨 自定义配置

### 修改主题色彩
在 `src/index.css` 中修改 CSS 变量：
```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --background-color: #f8fafc;
  /* 更多颜色变量... */
}
```

### 添加新功能
1. 在 `src/pages/` 中创建新页面组件
2. 在 `src/App.jsx` 中添加路由
3. 在 `src/components/Navbar.jsx` 中添加导航链接

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 支持

如果你遇到问题或有建议，请：
1. 查看 [Issues](../../issues) 页面
2. 创建新的 Issue
3. 联系项目维护者

## 🌟 致谢

- [Supabase](https://supabase.com) - 提供后端服务
- [Netlify](https://netlify.com) - 提供部署服务
- [React](https://reactjs.org) - 前端框架
- [Vite](https://vitejs.dev) - 构建工具# homework
