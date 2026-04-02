-- ===============================================
-- Supabase Schema for 小🍐 专属点餐台
-- ===============================================
-- Run this in Supabase SQL Editor:
-- https://app.supabase.com/project/slbmodvdaqglyreqrike/sql
-- ===============================================

-- 1. 分类表
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "order" INTEGER DEFAULT 0
);

-- 2. 菜品表
CREATE TABLE IF NOT EXISTS dishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT DEFAULT 'all',
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 订单表
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  items JSONB NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 初始化默认分类
-- ===============================================
INSERT INTO categories (id, name, "order")
VALUES
  ('all', '全部', 0),
  ('main', '主食', 1),
  ('soup', '汤品', 2),
  ('dessert', '甜点', 3)
ON CONFLICT (id) DO NOTHING;
