'use client';
import { useState } from 'react';
import Header from '@/app/layout/Header';
import ItemGrid from '@/app/layout/ItemGrid';
import BottomNav from '@/app/layout/BottomNav';
import UploadModal from '@/app/layout/UploadModal';
import { Item, FormData } from '@/app/types';

const Home: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [items, setItems] = useState<Item[]>([
    {
      id: 1,
      title: '天然岫玉手镯',
      description: '淡绿色天然岫玉，质地温润，尺寸56mm，适合日常佩戴。',
      image:
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: '岫玉',
    },
    {
      id: 2,
      title: '唐风齐胸襦裙',
      description: '淡粉色齐胸襦裙，绣花精美，适合春季出游穿着。',
      image:
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: '汉服',
    },
    {
      id: 3,
      title: '刺绣专用丝线',
      description: '48色丝线套装，颜色鲜艳，适合苏绣、湘绣等传统刺绣工艺。',
      image:
        'https://images.unsplash.com/photo-1506629905607-e9de2a6bb646?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: '线材',
    },
    {
      id: 4,
      title: '棉麻中式上衣',
      description: '天然棉麻材质，盘扣设计，舒适透气，M码。',
      image:
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: '衣服',
    },
    {
      id: 5,
      title: '岫玉平安扣',
      description: '天然岫玉平安扣，直径30mm，寓意平安吉祥。',
      image:
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: '岫玉',
    },
    {
      id: 6,
      title: '古风发簪',
      description: '铜镀金发簪，镶嵌仿玉和珍珠，适合搭配汉服。',
      image:
        'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: '首饰',
    },
  ]);

  const filteredItems: Item[] =
    activeCategory === '全部'
      ? items
      : items.filter((item) => item.category === activeCategory);

  const handleAddItem = (newItem: FormData): void => {
    const newItemWithId: Item = {
      ...newItem,
      id: items.length + 1,
      // 在实际应用中，这里应该处理图片上传并获取URL
      image: newItem.image
        ? URL.createObjectURL(newItem.image)
        : 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    };

    setItems((prevItems) => [...prevItems, newItemWithId]);
  };

  return (
    <div>
      <Header
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <div className='container'>
        <ItemGrid items={filteredItems} />
      </div>

      <div className='upload-btn' onClick={() => setIsUploadModalOpen(true)}>
        <i className='fas fa-plus'></i>
      </div>

      <BottomNav />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleAddItem}
      />
    </div>
  );
};

export default Home;
