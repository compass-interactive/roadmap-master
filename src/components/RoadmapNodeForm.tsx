import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { RoadmapNode, RoadmapNodeType } from '@/types/roadmap';

interface RoadmapNodeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (node: Omit<RoadmapNode, 'id' | 'position'> & { bgColor?: string; fontColor?: string }) => void;
  initialNode?: Partial<RoadmapNode>;
  disableCloseOnOutsideClick?: boolean;
}

const nodeTypes: RoadmapNodeType[] = ['video', 'article', 'quiz', 'other'];

const RoadmapNodeForm: React.FC<RoadmapNodeFormProps> = ({ open, onClose, onSubmit, initialNode, disableCloseOnOutsideClick }) => {
  const [title, setTitle] = useState(initialNode?.title || '');
  const [description, setDescription] = useState(initialNode?.description || '');
  const [type, setType] = useState<RoadmapNodeType>(initialNode?.type || 'article');
  const [resource, setResource] = useState(initialNode?.resource || '');
  const [bgColor, setBgColor] = useState(initialNode?.bgColor || '#ffffff');
  const [fontColor, setFontColor] = useState(initialNode?.fontColor || '#222222');

  useEffect(() => {
    setTitle(initialNode?.title || '');
    setDescription(initialNode?.description || '');
    setType(initialNode?.type || 'article');
    setResource(initialNode?.resource || '');
    setBgColor(initialNode?.bgColor || '#ffffff');
    setFontColor(initialNode?.fontColor || '#222222');
  }, [initialNode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, type, resource, bgColor, fontColor });
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v && !disableCloseOnOutsideClick) onClose(); }}>
      <DialogContent className="max-w-md" hideCloseButton={true}>
        <DialogTitle>{initialNode ? 'Edit Node' : 'Add Node'}</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Type</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={type}
              onChange={e => setType(e.target.value as RoadmapNodeType)}
            >
              {nodeTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Resource Link</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={resource}
              onChange={e => setResource(e.target.value)}
              type="url"
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <span className="text-sm">BG Color</span>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm">Font Color</span>
              <input type="color" value={fontColor} onChange={e => setFontColor(e.target.value)} />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">{initialNode ? 'Save' : 'Add'}</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoadmapNodeForm; 