import { HeaderProps } from '../types';
import { useState, useRef, useEffect } from 'react';

const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  const categories: string[] = [
    '全部',
    '岫玉',
    '线材',
    '汉服',
    '衣服',
    '首饰',
    '书籍',
    '手办',
    '陶瓷',
    '木艺',
    '金属工艺',
    '绘画',
    '摄影器材',
    '古董收藏',
  ];

  const [isExpanded, setIsExpanded] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 检查是否需要显示滚动按钮
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowScrollButtons(scrollWidth > clientWidth);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  // 滚动函数
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'right' ? scrollAmount : -scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  // 切换展开/收起状态
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <header className='header'>
      <div className='search-bar'>
        <i className='fas fa-search'></i>
        <input type='text' placeholder='搜索我的物品' />
      </div>

      <div className='category-container'>
        <div
          className={`category-nav ${isExpanded ? 'expanded' : ''}`}
          ref={scrollContainerRef}
        >
          {categories.map((category) => (
            <div
              key={category}
              className={`category-item ${
                activeCategory === category ? 'active' : ''
              }`}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </div>
          ))}
        </div>

        {/* 滚动按钮 - 只在需要时显示 */}
        {showScrollButtons && (
          <div className='scroll-buttons'>
            <button
              className='scroll-btn scroll-left'
              onClick={() => scroll('left')}
              aria-label='向左滚动'
            >
              <i className='fas fa-chevron-left'></i>
            </button>
            <button
              className='scroll-btn scroll-right'
              onClick={() => scroll('right')}
              aria-label='向右滚动'
            >
              <i className='fas fa-chevron-right'></i>
            </button>
          </div>
        )}

        {/* 展开/收起按钮 - 在移动端显示 */}
        <button
          className='expand-toggle'
          onClick={toggleExpand}
          aria-label={isExpanded ? '收起分类' : '展开分类'}
        >
          <i
            className={`fas ${
              isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'
            }`}
          ></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
