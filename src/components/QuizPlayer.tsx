import React, { useState } from 'react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti'; // Установим: npm install canvas-confetti --save-dev @types/canvas-confetti

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

interface QuizPlayerProps {
  questions: QuizQuestion[];
  onComplete: () => void;
}

export default function QuizPlayer({ questions, onComplete }: QuizPlayerProps) {
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const selectOption = (qIndex: number, oIndex: number) => {
    if (submitted) return;
    const newAns = [...answers];
    newAns[qIndex] = oIndex;
    setAnswers(newAns);
  };

  const submitQuiz = () => {
    // Проверка, все ли отвечены
    if (answers.includes(-1)) {
        alert('Ответьте на все вопросы!');
        return;
    }

    let correctCount = 0;
    questions.forEach((q, i) => {
        if (q.correctIndex === answers[i]) correctCount++;
    });

    setScore(correctCount);
    setSubmitted(true);

    if (correctCount === questions.length) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    
    // Если набрал > 50%, считаем урок пройденным
    if (correctCount >= questions.length / 2) {
        onComplete();
    }
  };

  const retry = () => {
      setAnswers(new Array(questions.length).fill(-1));
      setSubmitted(false);
      setScore(0);
  };

  if (questions.length === 0) return <div>Тест пуст</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {submitted && (
          <div className={`mb-6 p-6 rounded-xl text-center border-2 ${score === questions.length ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
              <div className="text-3xl font-bold mb-2">{score} / {questions.length}</div>
              <p className="text-gray-600">
                  {score === questions.length ? 'Отличный результат! 🏆' : 'Можно лучше! Попробуй еще раз.'}
              </p>
              <button onClick={retry} className="mt-4 flex items-center justify-center gap-2 mx-auto text-sm text-gray-500 hover:text-black">
                  <RefreshCw size={14}/> Пройти заново
              </button>
          </div>
      )}

      <div className="space-y-8">
        {questions.map((q, i) => {
            const isCorrect = submitted && answers[i] === q.correctIndex;
            const isWrong = submitted && answers[i] !== q.correctIndex;

            return (
                <div key={i} className="bg-white rounded-lg">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex gap-2">
                        <span className="text-gray-400">{i + 1}.</span> {q.question}
                    </h3>
                    <div className="space-y-2">
                        {q.options.map((opt, oIndex) => {
                            let style = "border-gray-200 hover:bg-gray-50";
                            
                            if (submitted) {
                                if (oIndex === q.correctIndex) style = "bg-green-100 border-green-500 text-green-800"; // Правильный ответ всегда зеленый
                                else if (oIndex === answers[i] && oIndex !== q.correctIndex) style = "bg-red-100 border-red-500 text-red-800"; // Твой неправильный выбор
                                else style = "border-gray-100 opacity-50"; // Остальные
                            } else {
                                if (answers[i] === oIndex) style = "border-sky-500 bg-sky-50 ring-1 ring-sky-500";
                            }

                            return (
                                <button
                                    key={oIndex}
                                    onClick={() => selectOption(i, oIndex)}
                                    disabled={submitted}
                                    className={`w-full text-left p-3 rounded-lg border transition ${style}`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        })}
      </div>

      {!submitted && (
          <div className="mt-8 text-center">
              <button 
                onClick={submitQuiz}
                className="bg-sky-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-sky-700 hover:-translate-y-1 transition"
              >
                  Завершить тест
              </button>
          </div>
      )}
    </div>
  );
}