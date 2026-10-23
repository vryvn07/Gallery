import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Crop as CropIcon,
  Sparkles,
  Undo2,
  Redo2,
  Eye,
  RotateCcw as ResetIcon,
} from 'lucide-react';
import { useGallery } from '../../context/GalleryContext';
import {
  DEFAULT_ADJUSTMENTS,
  renderEditedImageToCanvas,
  exportCanvasToBlob,
} from '../../services/editor/imageEditor';
import { indexMediaFile } from '../../services/media/mediaScanner';
import type { EditAdjustments, MediaItem } from '../../types/media';

type EditorTab = 'crop' | 'adjust' | 'filters';

const FILTER_PRESETS: { id: EditAdjustments['filter']; label: string }[] = [
  { id: 'none', label: 'Original' },
  { id: 'vivid', label: 'Vivid' },
  { id: 'warm', label: 'Warm' },
  { id: 'cool', label: 'Cool' },
  { id: 'dramatic', label: 'Dramatic' },
  { id: 'grayscale', label: 'Mono' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'vintage', label: 'Vintage' },
];

export const PhotoEditorModal: React.FC = () => {
  const { editingItem, closeEditor, showToast } = useGallery();

  const [activeTab, setActiveTab] = useState<EditorTab>('adjust');
  const [adjustments, setAdjustments] = useState<EditAdjustments>({ ...DEFAULT_ADJUSTMENTS });
  const [history, setHistory] = useState<EditAdjustments[]>([{ ...DEFAULT_ADJUSTMENTS }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isComparing, setIsComparing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImgRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Load source image
  useEffect(() => {
    if (!editingItem) return;

    const blobToUse = editingItem.blob || editingItem.thumbnailBlob;
    if (!blobToUse) return;

    const url = URL.createObjectURL(blobToUse);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      sourceImgRef.current = img;
      setImgLoaded(true);
      setAdjustments({ ...DEFAULT_ADJUSTMENTS });
      setHistory([{ ...DEFAULT_ADJUSTMENTS }]);
      setHistoryIndex(0);
    };

    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [editingItem]);

  // Re-render canvas whenever adjustments change or when holding compare
  useEffect(() => {
    if (!imgLoaded || !sourceImgRef.current || !canvasRef.current) return;

    const adjToRender = isComparing ? DEFAULT_ADJUSTMENTS : adjustments;
    renderEditedImageToCanvas(sourceImgRef.current, canvasRef.current, adjToRender);
  }, [adjustments, isComparing, imgLoaded]);

  if (!editingItem) return null;

  // History tracking
  const pushAdjustmentChange = (newAdj: EditAdjustments) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newAdj);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setAdjustments(newAdj);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setAdjustments(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setAdjustments(history[historyIndex + 1]);
    }
  };

  const handleReset = () => {
    pushAdjustmentChange({ ...DEFAULT_ADJUSTMENTS });
  };

  // Rotation & Flipping
  const rotateCw = () => {
    const nextRot = (adjustments.rotation + 90) % 360;
    pushAdjustmentChange({ ...adjustments, rotation: nextRot });
  };

  const rotateCcw = () => {
    const nextRot = (adjustments.rotation + 270) % 360;
    pushAdjustmentChange({ ...adjustments, rotation: nextRot });
  };

  const flipHorizontal = () => {
    pushAdjustmentChange({ ...adjustments, flipH: !adjustments.flipH });
  };

  const flipVertical = () => {
    pushAdjustmentChange({ ...adjustments, flipV: !adjustments.flipV });
  };

  // Slider changes
  const updateAdjustmentField = (field: keyof EditAdjustments, value: number) => {
    setAdjustments((prev) => ({ ...prev, [field]: value }));
  };

  const commitSliderChange = () => {
    pushAdjustmentChange(adjustments);
  };

  // Crop aspect ratios
  const applyCropRatio = (ratio: number | null) => {
    if (!ratio) {
      pushAdjustmentChange({ ...adjustments, cropRect: undefined });
      return;
    }

    if (!sourceImgRef.current) return;
    const w = sourceImgRef.current.naturalWidth;
    const h = sourceImgRef.current.naturalHeight;
    const currentRatio = w / h;

    let cropW = 1;
    let cropH = 1;
    let cropX = 0;
    let cropY = 0;

    if (currentRatio > ratio) {
      // Image is wider than crop ratio
      cropW = (h * ratio) / w;
      cropX = (1 - cropW) / 2;
    } else {
      // Image is taller than crop ratio
      cropH = w / (h * ratio);
      cropY = (1 - cropH) / 2;
    }

    pushAdjustmentChange({
      ...adjustments,
      cropRect: { x: cropX, y: cropY, width: cropW, height: cropH },
    });
  };

  // Save Copy action
  const handleSaveCopy = async () => {
    if (!canvasRef.current || isSaving) return;
    setIsSaving(true);

    try {
      const blob = await exportCanvasToBlob(canvasRef.current);
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
      const newName = `IMG_${timestamp}_edit.jpg`;
      const file = new File([blob], newName, { type: 'image/jpeg' });

      await indexMediaFile(file, {
        storageMode: 'imported',
        folderName: 'Edited Photos',
      });

      showToast(`Saved "${newName}" to Gallery`, 'success');
      closeEditor();
    } catch (err: any) {
      showToast(err.message || 'Failed to save edited photo', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f1117] text-white flex flex-col justify-between select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-slate-800 pt-safe">
        <button
          onClick={closeEditor}
          className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          aria-label="Cancel editing"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 disabled:opacity-30 transition-colors"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 disabled:opacity-30 transition-colors"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onMouseDown={() => setIsComparing(true)}
            onMouseUp={() => setIsComparing(false)}
            onTouchStart={() => setIsComparing(true)}
            onTouchEnd={() => setIsComparing(false)}
            className={`p-2 rounded-full transition-colors ${
              isComparing ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
            }`}
            title="Hold to compare with original"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Reset all adjustments"
          >
            <ResetIcon className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleSaveCopy}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors disabled:opacity-50"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>{isSaving ? 'Saving...' : 'Save copy'}</span>
        </button>
      </header>

      {/* Main Canvas View Area */}
      <div className="flex-1 flex items-center justify-center p-3 relative overflow-hidden bg-black/40">
        <canvas
          ref={canvasRef}
          className="max-h-full max-w-full object-contain shadow-2xl rounded-sm"
        />
        {isComparing && (
          <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white text-xs font-medium">
            Original
          </div>
        )}
      </div>

      {/* Adjustment Tool Controls */}
      <div className="bg-[#181a24] border-t border-slate-800 pb-safe">
        {/* Controls based on active tab */}
        <div className="p-4 max-w-md mx-auto min-h-[120px] flex flex-col justify-center">
          {activeTab === 'crop' && (
            <div className="flex flex-col gap-3">
              {/* Rotate & Flip toolbar */}
              <div className="flex items-center justify-center gap-4 pb-2 border-b border-slate-800">
                <button
                  onClick={rotateCcw}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                  title="Rotate -90°"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={rotateCw}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                  title="Rotate +90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={flipHorizontal}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
                <button
                  onClick={flipVertical}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Crop Ratio Presets */}
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
                <button
                  onClick={() => applyCropRatio(null)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    !adjustments.cropRect ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => applyCropRatio(1)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    adjustments.cropRect?.width === adjustments.cropRect?.height
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  1:1
                </button>
                <button
                  onClick={() => applyCropRatio(4 / 3)}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  4:3
                </button>
                <button
                  onClick={() => applyCropRatio(16 / 9)}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  16:9
                </button>
                <button
                  onClick={() => applyCropRatio(9 / 16)}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  9:16
                </button>
              </div>
            </div>
          )}

          {activeTab === 'adjust' && (
            <div className="space-y-2.5">
              {/* Brightness */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Brightness</span>
                <span className="font-mono text-slate-200">{adjustments.brightness}</span>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                value={adjustments.brightness}
                onChange={(e) => updateAdjustmentField('brightness', parseInt(e.target.value))}
                onMouseUp={commitSliderChange}
                onTouchEnd={commitSliderChange}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />

              {/* Contrast */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Contrast</span>
                <span className="font-mono text-slate-200">{adjustments.contrast}</span>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                value={adjustments.contrast}
                onChange={(e) => updateAdjustmentField('contrast', parseInt(e.target.value))}
                onMouseUp={commitSliderChange}
                onTouchEnd={commitSliderChange}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />

              {/* Saturation */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Saturation</span>
                <span className="font-mono text-slate-200">{adjustments.saturation}</span>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                value={adjustments.saturation}
                onChange={(e) => updateAdjustmentField('saturation', parseInt(e.target.value))}
                onMouseUp={commitSliderChange}
                onTouchEnd={commitSliderChange}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />

              {/* Warmth (Temperature) */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Warmth</span>
                <span className="font-mono text-slate-200">{adjustments.temperature}</span>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                value={adjustments.temperature}
                onChange={(e) => updateAdjustmentField('temperature', parseInt(e.target.value))}
                onMouseUp={commitSliderChange}
                onTouchEnd={commitSliderChange}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          )}

          {activeTab === 'filters' && (
            <div className="flex items-center gap-3 overflow-x-auto py-2 px-1">
              {FILTER_PRESETS.map((p) => {
                const isActive = adjustments.filter === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => pushAdjustmentChange({ ...adjustments, filter: p.id })}
                    className={`flex flex-col items-center gap-1.5 shrink-0 px-3 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-600/30 border border-blue-500 text-blue-400'
                        : 'bg-slate-800 border border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="text-[11px] font-medium">{p.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tab Selector Footer */}
        <div className="flex items-center justify-around border-t border-slate-800/80 h-14">
          <button
            onClick={() => setActiveTab('adjust')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'adjust' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Adjust</span>
          </button>

          <button
            onClick={() => setActiveTab('filters')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'filters' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Filters</span>
          </button>

          <button
            onClick={() => setActiveTab('crop')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'crop' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CropIcon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Transform</span>
          </button>
        </div>
      </div>
    </div>
  );
};
