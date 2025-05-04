import { ImageGrid } from '../components/ImageGrid';

export function Home() {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-transparent">
      <div className="w-full max-w-[2000px] mx-auto">
        <ImageGrid />
      </div>
    </div>
  );
}