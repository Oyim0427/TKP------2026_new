import { motion, AnimatePresence } from 'framer-motion';

interface ImageZoomModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function ImageZoomModal({ imageUrl, onClose }: ImageZoomModalProps) {
  if (!imageUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-8 cursor-pointer backdrop-blur-md"
        onClick={onClose}
      >
        <motion.img
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.4 }}
          src={imageUrl}
          alt="Zoomed"
          className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_100px_rgba(255,255,255,0.2)]"
          onClick={(e) => e.stopPropagation()}
        />
        
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-2xl font-bold transition-colors"
        >
          閉じる
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
