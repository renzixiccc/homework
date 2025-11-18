-- ============================================
-- Supabase 数据库初始化和 RLS 配置脚本
-- ============================================
-- 执行步骤：
-- 1. 打开 Supabase 控制台 → SQL Editor
-- 2. 复制下面的 SQL 粘贴到编辑器
-- 3. 点击 Run 执行
-- ============================================

-- 1. 创建 user_profiles 表（如果不存在）
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email varchar NOT NULL,
  username varchar,
  full_name varchar,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);

-- 2. 修复 posts 表中缺失的列
-- ============================================
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS excerpt text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';

-- 3. 修复 comments 表中缺失的列
-- ============================================
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- 4. 启用 RLS 并创建安全策略
-- ============================================

-- ===== posts 表的 RLS 策略 =====
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 删除旧的策略（如果存在）
DROP POLICY IF EXISTS "View published or own posts" ON public.posts;
DROP POLICY IF EXISTS "View published posts for anon" ON public.posts;
DROP POLICY IF EXISTS "Insert own posts" ON public.posts;
DROP POLICY IF EXISTS "Update own posts" ON public.posts;
DROP POLICY IF EXISTS "Delete own posts" ON public.posts;

-- 允许已认证用户查看已发布的文章和自己的草稿/已发布文章
CREATE POLICY "View published or own posts" 
ON public.posts
FOR SELECT
TO authenticated
USING (status = 'published' OR author_id = auth.uid());

-- 允许匿名用户查看已发布文章
CREATE POLICY "View published posts for anon"
ON public.posts
FOR SELECT
TO anon
USING (status = 'published');

-- 允许已认证用户插入自己的文章
CREATE POLICY "Insert own posts"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (author_id = auth.uid());

-- 允许已认证用户更新自己的文章
CREATE POLICY "Update own posts"
ON public.posts
FOR UPDATE
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

-- 允许已认证用户删除自己的文章
CREATE POLICY "Delete own posts"
ON public.posts
FOR DELETE
TO authenticated
USING (author_id = auth.uid());

-- ===== user_profiles 表的 RLS 策略 =====
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Create own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "View all profiles" ON public.user_profiles;

-- 允许已认证用户查看所有公开 profile
CREATE POLICY "View all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (true);

-- 允许已认证用户创建自己的 profile
CREATE POLICY "Create own profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- 允许已认证用户更新自己的 profile
CREATE POLICY "Update own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ===== categories 表的 RLS 策略 =====
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View all categories" ON public.categories;
DROP POLICY IF EXISTS "Create categories" ON public.categories;
DROP POLICY IF EXISTS "Update categories" ON public.categories;
DROP POLICY IF EXISTS "Delete categories" ON public.categories;

-- 允许所有用户（包括匿名）查看分类
CREATE POLICY "View all categories"
ON public.categories
FOR SELECT
USING (true);

-- 允许已认证用户创建分类（可选，根据需要调整）
CREATE POLICY "Create categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 允许已认证用户更新分类
CREATE POLICY "Update categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (true);

-- 允许已认证用户删除分类
CREATE POLICY "Delete categories"
ON public.categories
FOR DELETE
TO authenticated
USING (true);

-- ===== comments 表的 RLS 策略 =====
-- 注意：comments 表使用 user_id 而不是 author_id
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View approved comments" ON public.comments;
DROP POLICY IF EXISTS "Insert own comments" ON public.comments;
DROP POLICY IF EXISTS "Delete own comments" ON public.comments;

-- 允许所有用户查看已批准的评论
CREATE POLICY "View approved comments"
ON public.comments
FOR SELECT
USING (status = 'approved');

-- 允许已认证用户插入自己的评论
CREATE POLICY "Insert own comments"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 允许已认证用户删除自己的评论
CREATE POLICY "Delete own comments"
ON public.comments
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- 5. 修复外键约束
-- ============================================
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE public.posts 
ADD CONSTRAINT posts_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- 执行完毕！现在系统既安全又完整
-- ============================================

