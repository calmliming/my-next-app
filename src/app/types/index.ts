export interface Item {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
}

export interface FormData {
  category: string;
  title: string;
  description: string;
  image: File | null;
}

export interface HeaderProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export interface ItemCardProps {
  item: Item;
}

export interface ItemGridProps {
  items: Item[];
}

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}