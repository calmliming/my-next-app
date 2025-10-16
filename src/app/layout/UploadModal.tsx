import { useState, ChangeEvent, FormEvent } from 'react';
import { UploadModalProps, FormData } from '../types';

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<FormData>({
    category: '岫玉',
    title: '',
    description: '',
    image: null,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (e.target instanceof HTMLInputElement && e.target.type === 'file') {
      const files = (e.target as HTMLInputElement).files;
      setFormData((prev) => ({
        ...prev,
        [name]: files ? files[0] : null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('请输入物品标题');
      return;
    }

    onSubmit(formData);
    setFormData({
      category: '岫玉',
      title: '',
      description: '',
      image: null,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='upload-modal'>
      <div className='upload-form'>
        <h3 className='form-title'>添加新物品</h3>
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='itemCategory'>分类</label>
            <select
              id='itemCategory'
              name='category'
              value={formData.category}
              onChange={handleChange}
            >
              <option value='岫玉'>岫玉</option>
              <option value='线材'>线材</option>
              <option value='汉服'>汉服</option>
              <option value='衣服'>衣服</option>
              <option value='首饰'>首饰</option>
              <option value='其他'>其他</option>
            </select>
          </div>
          <div className='form-group'>
            <label htmlFor='itemTitle'>标题</label>
            <input
              type='text'
              id='itemTitle'
              name='title'
              value={formData.title}
              onChange={handleChange}
              placeholder='请输入物品标题'
            />
          </div>
          <div className='form-group'>
            <label htmlFor='itemDesc'>描述</label>
            <textarea
              id='itemDesc'
              name='description'
              value={formData.description}
              onChange={handleChange}
              placeholder='请输入物品描述'
            ></textarea>
          </div>
          <div className='form-group'>
            <label htmlFor='itemImage'>上传图片</label>
            <input
              type='file'
              id='itemImage'
              name='image'
              onChange={handleChange}
              accept='image/*'
            />
          </div>
          <div className='form-buttons'>
            <button type='button' className='btn btn-cancel' onClick={onClose}>
              取消
            </button>
            <button type='submit' className='btn btn-submit'>
              发布
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
