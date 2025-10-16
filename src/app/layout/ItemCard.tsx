import Image from 'next/image';
import { ItemCardProps } from '../types';

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  return (
    <div className='item-card'>
      <div className='item-img-container'>
        <Image
          src={item.image}
          alt={item.title}
          width={500}
          height={300}
          className='item-img'
          placeholder='blur'
          blurDataURL='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R'
        />
      </div>
      <div className='item-info'>
        <h3 className='item-title'>{item.title}</h3>
        <p className='item-desc'>{item.description}</p>
      </div>
    </div>
  );
};

export default ItemCard;
