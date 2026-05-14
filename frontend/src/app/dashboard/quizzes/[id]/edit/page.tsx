"use client";

import { useParams } from "next/navigation";
import { QuizEditor } from "../../new/page";

/**
 * Página de edición de quiz.
 * Extrae el ID de la URL y se lo pasa al QuizEditor,
 * que detecta el ID y carga todos los datos del quiz desde la API.
 */
export default function EditQuizPage() {
  const params = useParams();
  const id = params?.id as string;

  return <QuizEditor quizId={id} />;
}
