"use client";

import { QuizEditor } from "@/components/editor/QuizEditor";

/**
 * Página para crear un nuevo quiz.
 * Utiliza el componente maestro QuizEditor sin pasarle un ID inicial.
 */
export default function NewQuizPage() {
  return <QuizEditor />;
}
