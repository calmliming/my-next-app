export type Category = {
  id: string;
  name: string;
};

export type MenuItemInput = {
  name: string;
  price: number;
  categoryId: string;
  img: string;
  desc: string;
  isActive?: boolean;
};

export type MenuItem = MenuItemInput & {
  id: string; // MongoDB _id.toString()
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const categories: Category[] = [
  { id: 'stirfry', name: '湘味小炒' },
  { id: 'noodle', name: '嗦粉吃面' },
  { id: 'hotpot', name: '热辣火锅' },
  { id: 'bbq', name: '夜宵烧烤' },
  { id: 'snack', name: '特色小吃' },
  { id: 'drink', name: '解辣神器' },
];

export const seedMenuItems: MenuItemInput[] = [
  // --- 湘味小炒 ---
  {
    name: '辣椒炒肉',
    price: 38,
    categoryId: 'stirfry',
    img: 'https://images.unsplash.com/photo-1624386971932-d193f443a6d4?w=200&h=200&fit=crop',
    desc: '湘菜灵魂，螺丝椒炒土猪肉',
  },
  {
    name: '剁椒鱼头',
    price: 68,
    categoryId: 'stirfry',
    img: 'https://images.unsplash.com/photo-1624386971932-d193f443a6d4?w=200&h=200&fit=crop',
    desc: '鲜辣爽口，鱼肉嫩滑',
  },
  {
    name: '小炒黄牛肉',
    price: 48,
    categoryId: 'stirfry',
    img: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=200&h=200&fit=crop',
    desc: '野山椒爆炒，下饭神器',
  },
  {
    name: '大碗花菜',
    price: 26,
    categoryId: 'stirfry',
    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
    desc: '有机花菜，五花肉煸香',
  },

  // --- 嗦粉吃面 ---
  {
    name: '长沙肉丝粉',
    price: 16,
    categoryId: 'noodle',
    img: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=200&h=200&fit=crop',
    desc: '骨汤打底，手工宽粉',
  },
  {
    name: '酸豆角肉末粉',
    price: 18,
    categoryId: 'noodle',
    img: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=200&h=200&fit=crop',
    desc: '酸爽开胃，满满肉末',
  },

  // --- 热辣火锅 ---
  {
    name: '麻辣牛肉火锅',
    price: 128,
    categoryId: 'hotpot',
    img: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=200&h=200&fit=crop',
    desc: '牛骨慢炖，鲜切吊龙',
  },
  {
    name: '干锅肥肠',
    price: 58,
    categoryId: 'hotpot',
    img: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=200&h=200&fit=crop',
    desc: '处理干净，香辣Q弹',
  },

  // --- 夜宵烧烤 ---
  {
    name: '烤羊肉串(5串)',
    price: 25,
    categoryId: 'bbq',
    img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop',
    desc: '孜然飘香，肥瘦相间',
  },
  {
    name: '烤牛油(10串)',
    price: 20,
    categoryId: 'bbq',
    img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop',
    desc: '奶香十足，一口爆油',
  },

  // --- 特色小吃 ---
  {
    name: '长沙臭豆腐',
    price: 15,
    categoryId: 'snack',
    img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&h=200&fit=crop',
    desc: '闻着臭吃着香，外酥里嫩',
  },
  {
    name: '糖油粑粑',
    price: 12,
    categoryId: 'snack',
    img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&h=200&fit=crop',
    desc: '糯叽叽，甜而不腻',
  },

  // --- 解辣神器 ---
  {
    name: '冰镇豆浆',
    price: 6,
    categoryId: 'drink',
    img: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=200&h=200&fit=crop',
    desc: '现磨豆浆，解辣首选',
  },
  {
    name: '大桶柠檬茶',
    price: 18,
    categoryId: 'drink',
    img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&h=200&fit=crop',
    desc: '暴打柠檬，清爽解腻',
  },
];

export function getCategoryName(categoryId: string) {
  return categories.find((c) => c.id === categoryId)?.name ?? categoryId;
}

