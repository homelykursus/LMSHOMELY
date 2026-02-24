'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, X } from 'lucide-react';

interface CurriculumItem {
  title: string;
  subtopics: string[];
}

interface CurriculumInputProps {
  value: CurriculumItem[];
  onChange: (value: CurriculumItem[]) => void;
}

export function CurriculumInput({ value, onChange }: CurriculumInputProps) {
  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];

  const addTopic = () => {
    onChange([...safeValue, { title: '', subtopics: [''] }]);
  };

  const removeTopic = (index: number) => {
    const newValue = safeValue.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const updateTopicTitle = (index: number, title: string) => {
    const newValue = [...safeValue];
    newValue[index].title = title;
    onChange(newValue);
  };

  const addSubtopic = (topicIndex: number) => {
    const newValue = [...safeValue];
    newValue[topicIndex].subtopics.push('');
    onChange(newValue);
  };

  const removeSubtopic = (topicIndex: number, subtopicIndex: number) => {
    const newValue = [...safeValue];
    newValue[topicIndex].subtopics = newValue[topicIndex].subtopics.filter((_, i) => i !== subtopicIndex);
    onChange(newValue);
  };

  const updateSubtopic = (topicIndex: number, subtopicIndex: number, text: string) => {
    const newValue = [...safeValue];
    newValue[topicIndex].subtopics[subtopicIndex] = text;
    onChange(newValue);
  };

  return (
    <div className="space-y-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold text-blue-900">📚 Kurikulum</Label>
        <Button type="button" size="sm" onClick={addTopic} className="flex items-center gap-1">
          <Plus className="w-4 h-4" />
          Tambah Topik
        </Button>
      </div>

      {safeValue.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">Belum ada topik. Klik "Tambah Topik" untuk menambahkan.</p>
      ) : (
        <div className="space-y-4">
          {safeValue.map((topic, topicIndex) => (
            <div key={topicIndex} className="p-4 bg-white rounded-lg border border-blue-200 space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Label className="text-sm font-medium">Judul Topik {topicIndex + 1}</Label>
                  <Input
                    value={topic.title}
                    onChange={(e) => updateTopicTitle(topicIndex, e.target.value)}
                    placeholder="Contoh: Pengenalan Microsoft Word"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => removeTopic(topicIndex)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-7"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 pl-4 border-l-2 border-blue-300">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">Sub-topik</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => addSubtopic(topicIndex)}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Tambah Sub-topik
                  </Button>
                </div>

                {topic.subtopics.map((subtopic, subtopicIndex) => (
                  <div key={subtopicIndex} className="flex items-center gap-2">
                    <Input
                      value={subtopic}
                      onChange={(e) => updateSubtopic(topicIndex, subtopicIndex, e.target.value)}
                      placeholder="Contoh: Membuat dokumen baru"
                      className="text-sm"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSubtopic(topicIndex, subtopicIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
