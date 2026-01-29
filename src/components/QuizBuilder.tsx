import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, Save } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

interface QuizBuilderProps {
  initialData: QuizQuestion[] | null;
  onSave: (data: QuizQuestion[]) => void;
}

export default function QuizBuilder({ initialData, onSave }: QuizBuilderProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialData || []);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        question: '',
        options: ['', '', ''], // 3 варианта по умолчанию
        correctIndex: 0, // Первый правильный по умолчанию
      },
    ]);
  };

  const updateQuestion = (index: number, text: string) => {
    const newQ = [...questions];
    newQ[index].question = text;
    setQuestions(newQ);
  };

  const updateOption = (qIndex: number, oIndex: number, text: string) => {
    const newQ = [...questions];
    newQ[qIndex].options[oIndex] = text;
    setQuestions(newQ);
  };

  const setCorrectOption = (qIndex: number, oIndex: number) => {
    const newQ = [...questions];
    newQ[qIndex].correctIndex = oIndex;
    setQuestions(newQ);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addOption = (qIndex: number) => {
    const newQ = [...questions];
    newQ[qIndex].options.push('');
    setQuestions(newQ);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
      const newQ = [...questions];
      newQ[qIndex].options = newQ[qIndex].options.filter((_, i) => i !== oIndex);
      // Если удалили правильный ответ, сбрасываем на 0
      if (newQ[qIndex].correctIndex === oIndex) newQ[qIndex].correctIndex = 0;
      else if (newQ[qIndex].correctIndex > oIndex) newQ[qIndex].correctIndex--;
      setQuestions(newQ);
  };

  return (
    <div className="space-y-6">
      {questions.map((q, qIndex) => (
        <div key={q.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <div className="w-full mr-4">
                <label className="block text-xs font-bold text-gray-500 mb-1">Вопрос {qIndex + 1}</label>
                <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-sky-500 outline-none"
                    placeholder="Например: Формула силы?"
                    value={q.question}
                    onChange={(e) => updateQuestion(qIndex, e.target.value)}
                />
            </div>
            <button onClick={() => deleteQuestion(qIndex)} className="text-red-400 hover:text-red-600 mt-5">
              <Trash2 size={20} />
            </button>
          </div>

          <div className="space-y-2 pl-4 border-l-2 border-gray-200">
            {q.options.map((opt, oIndex) => (
              <div key={oIndex} className="flex items-center gap-2">
                <button
                  onClick={() => setCorrectOption(qIndex, oIndex)}
                  className={`p-1 rounded-full ${
                    q.correctIndex === oIndex ? 'text-green-600 bg-green-100' : 'text-gray-300 hover:text-gray-400'
                  }`}
                  title="Отметить как правильный"
                >
                  <CheckCircle size={20} />
                </button>
                <input
                  type="text"
                  className={`flex-1 p-2 text-sm border rounded outline-none ${q.correctIndex === oIndex ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-300'}`}
                  placeholder={`Вариант ${oIndex + 1}`}
                  value={opt}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                />
                {q.options.length > 2 && (
                    <button onClick={() => removeOption(qIndex, oIndex)} className="text-gray-400 hover:text-red-500">
                        <X size={16}/> {/* Импорт X добавь сам или замени на Trash2 */}
                    </button>
                )}
              </div>
            ))}
            <button onClick={() => addOption(qIndex)} className="text-xs text-sky-600 hover:underline mt-2 font-medium">
                + Добавить вариант
            </button>
          </div>
        </div>
      ))}

      <div className="flex gap-4">
        <button
            onClick={addQuestion}
            className="flex-1 py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-sky-500 hover:text-sky-600 transition flex items-center justify-center gap-2 font-medium"
        >
            <Plus size={20} /> Добавить вопрос
        </button>
        <button
            onClick={() => onSave(questions)}
            className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-bold shadow-lg"
        >
            <Save size={20} /> Сохранить тест
        </button>
      </div>
    </div>
  );
}

// Вспомогательная иконка (если нет в импорте)
import { X } from 'lucide-react';