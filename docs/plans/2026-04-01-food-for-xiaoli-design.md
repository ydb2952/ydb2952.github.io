# 小🍐 专属点餐台 - 设计文档

## 概述

纯前端点餐系统，使用 HTML + CSS + JavaScript 构建，数据存储在 IndexedDB 中，适配安卓手机端，适用于家庭内部使用。

---

## 系统架构

单页应用（SPA）分为两个主要模块：点餐端和管理端。

点餐端是主界面，采用响应式设计，优先适配安卓手机端。管理端通过独立的入口（页面右上角的设置图标或底部导航）进入，两者共享同一个 IndexedDB 数据库。

技术栈：原生 JavaScript（ES6+），不依赖任何框架。CSS 使用 Flexbox 和 Grid 布局，配合媒体查询实现响应式设计。

---

## 界面设计

### 点餐端主界面
- **顶部栏**：显示系统名称"小🍐 专属点餐台"，右侧有设置图标（管理入口）、订单记录入口
- **分类导航**：横向滚动的分类标签栏，如"全部"、"主食"、"汤品"、"甜点"
- **菜品列表**：网格布局展示菜品卡片，每张卡片包含图片、菜名、价格、"加入购物袋"按钮
- **底部栏**：固定在底部，显示购物袋图标和数量，点击展开购物袋

### 购物袋界面
- 以底部弹窗形式出现，展示已选菜品列表
- 可增减数量或删除菜品
- 显示总金额
- 底部有"去结算"和"清空"按钮
- 可选：备注输入框（如少辣、免葱）

### 订单记录界面
- 按时间倒序展示历史订单
- 每条订单显示：日期、菜品列表（摘要）、总价、备注
- 点击可查看完整订单详情

---

## 数据模型

使用 IndexedDB 存储以下数据结构：

```javascript
// 菜品表 (dishes)
{
  id: string (UUID),
  name: string,
  price: number,
  category: string,
  image: Blob (图片文件),
  createdAt: timestamp
}

// 分类表 (categories)
{
  id: string,
  name: string,
  order: number (排序)
}

// 订单表 (orders)
{
  id: string (UUID),
  items: [{
    dishId: string,
    dishName: string,
    quantity: number,
    price: number
  }],
  totalAmount: number,
  note: string (备注),
  createdAt: timestamp
}
```

IndexedDB 数据库名称：`foodForXiaoLi`
- `dishes` 存储区：以 id 为索引
- `categories` 存储区：以 order 为索引
- `orders` 存储区：以 createdAt 为索引

---

## 管理端功能

### 菜品管理
- 添加菜品：输入菜名、价格、选择分类、上传图片，支持预览
- 编辑菜品：点击菜品进入编辑模式
- 删除菜品：确认后删除菜品
- 分类管理：添加/编辑/删除分类，可调整排序

### 管理界面布局
- 菜品列表：网格布局，每张卡片有"编辑"和"删除"按钮
- 分类管理：弹窗页面，支持增删改和拖拽排序
- 图片上传：支持从相册选择，自动压缩（500KB 以内）

### 管理入口
在点餐端顶部栏的设置图标中，点击后显示菜单：
- 菜品管理
- 分类管理
- 订单记录

---

## 技术实现

### 文件结构
```
foodForXiaoLi/
├── index.html          # 主入口（点餐端）
├── admin.html          # 管理端
├── css/
│   └── style.css       # 全局样式
├── js/
│   ├── db.js           # IndexedDB 封装
│   ├── app.js          # 点餐端逻辑
│   ├── admin.js        # 管理端逻辑
│   └── utils.js        # 工具函数（图片压缩、UUID 等）
└── images/             # 默认菜品图片（可选）
```

### 核心功能
- 图片处理：Canvas API 压缩图片，最大尺寸 800x800
- 购物袋：localStorage 临时存储，结算时写入 IndexedDB
- 响应式：viewport meta 标签，适配 360px-768px 屏幕宽度
- 分类切换：过滤菜品列表并平滑滚动

### 样式设计
- 主色调：温暖橙色系 (#ff6b35)
- 圆角卡片设计
- 按钮触控区域最小 44x44px

---

## 错误处理与交互

### 错误处理
- IndexedDB 异常：提示"数据保存失败，请重试"
- 图片上传失败：提示"图片格式不支持或文件过大"
- 购物车为空：提示"请先选择菜品"

### 交互反馈
- 加入购物袋：按钮变色 + 购物袋数量动画
- 删除/编辑：确认对话框
- 保存成功：Toast 提示，2秒后消失
- 加载状态：骨架屏或加载动画

### 浏览器兼容性
- 支持：Chrome 70+、Firefox 65+、Safari 12+、Android WebView
- IndexedDB 不支持时提示用户

---

*设计日期：2026-04-01*
