import { ItemGridProps } from '../types';
import ItemCard from './ItemCard';

const ItemGrid: React.FC<ItemGridProps> = ({ items }) => {
  return (
    <div className='items-grid'>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};

export default ItemGrid;
