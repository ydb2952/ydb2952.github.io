// Supabase 客户端实例
let supabaseClient = null;

// 初始化
async function init() {
  supabaseClient = window.supabaseClient;
  if (!supabaseClient) {
    throw new Error('Supabase 客户端未初始化，请刷新页面');
  }
}

// ========== 工具函数 ==========

// Blob 转 Base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ========== 菜品操作 ==========

async function addDish(dish) {
  try {
    let imageData = dish.image;
    // 如果有图片（Blob），转换为 base64
    if (dish.image instanceof Blob) {
      imageData = await blobToBase64(dish.image);
    }
    const dishData = {
      ...dish,
      image: imageData,
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabaseClient
      .from('dishes')
      .insert(dishData);
    if (error) throw error;
    return dish.id;
  } catch (error) {
    console.error('添加菜品失败:', error);
    throw error;
  }
}

async function updateDish(dish) {
  try {
    let imageData = dish.image;
    // 如果有图片（Blob），转换为 base64
    if (dish.image instanceof Blob) {
      imageData = await blobToBase64(dish.image);
    }
    const dishData = {
      ...dish,
      image: imageData
    };
    const { data, error } = await supabaseClient
      .from('dishes')
      .update(dishData)
      .eq('id', dish.id);
    if (error) throw error;
    return dish.id;
  } catch (error) {
    console.error('更新菜品失败:', error);
    throw error;
  }
}

async function deleteDish(id) {
  try {
    const { error } = await supabaseClient
      .from('dishes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('删除菜品失败:', error);
    throw error;
  }
}

async function getDishes(category = null) {
  try {
    let query = supabaseClient.from('dishes').select('*');
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('获取菜品失败:', error);
    throw error;
  }
}

async function getDish(id) {
  try {
    const { data, error } = await supabaseClient
      .from('dishes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('获取菜品失败:', error);
    throw error;
  }
}

// ========== 分类操作 ==========

async function getCategories() {
  try {
    const { data, error } = await supabaseClient
      .from('categories')
      .select('*')
      .order('order', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('获取分类失败:', error);
    throw error;
  }
}

async function addCategory(category) {
  try {
    const { error } = await supabaseClient
      .from('categories')
      .insert(category);
    if (error) throw error;
    return category.id;
  } catch (error) {
    console.error('添加分类失败:', error);
    throw error;
  }
}

async function updateCategory(category) {
  try {
    const { error } = await supabaseClient
      .from('categories')
      .update(category)
      .eq('id', category.id);
    if (error) throw error;
    return category.id;
  } catch (error) {
    console.error('更新分类失败:', error);
    throw error;
  }
}

async function deleteCategory(id) {
  try {
    // 将该分类下的菜品移到默认分类
    const { data: dishes, error: getDishesError } = await supabaseClient
      .from('dishes')
      .update({ category: 'all' })
      .eq('category', id);
    if (getDishesError) throw getDishesError;

    const { error } = await supabaseClient
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('删除分类失败:', error);
    throw error;
  }
}

async function getCategory(id) {
  try {
    const { data, error } = await supabaseClient
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('获取分类失败:', error);
    throw error;
  }
}

// ========== 订单操作 ==========

async function addOrder(order) {
  try {
    const orderData = {
      ...order,
      created_at: new Date().toISOString()
    };
    const { error } = await supabaseClient
      .from('orders')
      .insert(orderData);
    if (error) throw error;
    return order.id;
  } catch (error) {
    console.error('添加订单失败:', error);
    throw error;
  }
}

async function getOrders() {
  try {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('获取订单失败:', error);
    throw error;
  }
}

async function getOrder(id) {
  try {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('获取订单失败:', error);
    throw error;
  }
}

// ========== 初始化 ==========

// 初始化默认分类（如果不存在）
async function initDefaultCategories() {
  const defaults = [
    { id: 'all', name: '全部', order: 0 },
    { id: 'main', name: '主食', order: 1 },
    { id: 'soup', name: '汤品', order: 2 },
    { id: 'dessert', name: '甜点', order: 3 }
  ];

  for (const cat of defaults) {
    const existing = await getCategory(cat.id);
    if (!existing) {
      await addCategory(cat);
    }
  }
}

// 导出 db 对象供外部使用
const db = {
  init,
  getDishes,
  getDish,
  addDish,
  updateDish,
  deleteDish,
  getCategories,
  getCategory,
  addCategory,
  updateCategory,
  deleteCategory,
  getOrders,
  getOrder,
  addOrder
};
