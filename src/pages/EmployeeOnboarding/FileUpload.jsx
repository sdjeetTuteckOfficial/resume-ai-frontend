import { useRef, useState } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
export default function FileUpload({ file, onFileChange, onRemoveFile }) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  if (file) {
    return (
      <div className='flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg'>
        <div className='flex items-center gap-2 overflow-hidden'>
          <FileText className='w-4 h-4 text-green-600' />
          <span className='text-xs font-bold text-green-800 truncate max-w-[150px]'>
            {file.name}
          </span>
        </div>
        <button
          onClick={onRemoveFile}
          className='text-gray-400 hover:text-red-500'
        >
          <X className='w-4 h-4' />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`cursor-pointer flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed transition-all duration-200 ${
        dragActive
          ? 'border-amber-400 bg-amber-50'
          : 'border-gray-200 bg-gray-50 hover:border-amber-300'
      }`}
    >
      <UploadCloud
        className={`w-6 h-6 mb-2 ${
          dragActive ? 'text-amber-500' : 'text-gray-400'
        }`}
      />
      <p className='text-[10px] text-gray-500 font-bold'>
        Drag & Drop or Click
      </p>
      <input
        ref={fileInputRef}
        type='file'
        className='hidden'
        accept='.pdf,.doc,.docx'
        onChange={handleFileInput}
      />
    </div>
  );
}
