import { memo, useMemo, useRef, useEffect, useState } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import OptimizedImage from './OptimizedImage';
import type { Image } from '../types/image';

interface VirtualGalleryProps {
  images: Image[];
  onImageClick: (index: number) => void;
  itemsPerRow?: number;
  itemHeight?: number;
  className?: string;
}

interface RowData {
  images: Image[];
  itemsPerRow: number;
  onImageClick: (index: number) => void;
}

const Row = memo(({ index, style, data }: ListChildComponentProps<RowData>) => {
  const { images, itemsPerRow, onImageClick } = data;
  const startIndex = index * itemsPerRow;
  const endIndex = Math.min(startIndex + itemsPerRow, images.length);
  const rowImages = images.slice(startIndex, endIndex);

  return (
    <div style={style} className="flex gap-4 px-4">
      {rowImages.map((image, colIndex) => {
        const imageIndex = startIndex + colIndex;
        return (          <div
            key={image.id}
            className="flex-1 group relative bg-mono-900 rounded-xl overflow-hidden shadow-lg transition-all duration-300 cursor-zoom-in hover:shadow-xl hover:-translate-y-1"
            onClick={() => onImageClick(imageIndex)}
          >
            <div className="relative overflow-hidden">
              <OptimizedImage
                src={image.url}
                alt={image.titulo}
                className="w-full h-auto object-cover transition-all duration-300 group-hover:scale-105"
                quality="medium"
                lazy={true}
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-mono-950 via-mono-900/80 to-transparent p-3 transform opacity-0 group-hover:opacity-100 transition-all duration-300">
              <h3 className="text-mono-100 text-sm font-medium truncate">
                {image.titulo}
              </h3>
            </div>
          </div>
        );
      })}
      {/* Fill remaining slots if the last row is incomplete */}
      {Array.from({ length: itemsPerRow - rowImages.length }).map((_, index) => (
        <div key={`empty-${index}`} className="flex-1" />
      ))}
    </div>
  );
});

Row.displayName = 'VirtualGalleryRow';

export const VirtualGallery = memo<VirtualGalleryProps>(({
  images,
  onImageClick,
  itemsPerRow = 4,
  itemHeight = 300,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Calculate responsive items per row based on container width
  const responsiveItemsPerRow = useMemo(() => {
    if (containerWidth < 640) return 1; // sm
    if (containerWidth < 1024) return 2; // lg
    if (containerWidth < 1536) return 3; // 2xl
    return itemsPerRow;
  }, [containerWidth, itemsPerRow]);

  // Calculate total number of rows
  const rowCount = Math.ceil(images.length / responsiveItemsPerRow);

  // Resize observer to track container width
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const itemData: RowData = useMemo(
    () => ({
      images,
      itemsPerRow: responsiveItemsPerRow,
      onImageClick
    }),
    [images, responsiveItemsPerRow, onImageClick]
  );

  if (images.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-mono-400">
        <svg
          className="w-24 h-24 mb-6 opacity-30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-2xl font-medium text-mono-300">No hay imágenes</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`h-[80vh] ${className}`}>      {containerWidth > 0 && (
        <List
          height={Math.min(800, window.innerHeight * 0.8)}
          width={containerWidth}
          itemCount={rowCount}
          itemSize={itemHeight + 16} // Add gap
          itemData={itemData}
          overscanCount={2} // Render 2 extra rows for smooth scrolling
        >
          {Row}
        </List>
      )}
    </div>
  );
});

VirtualGallery.displayName = 'VirtualGallery';

export default VirtualGallery;
