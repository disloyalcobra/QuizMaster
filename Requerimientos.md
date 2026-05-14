

| QuizMaster Pro Especificaciones y Requerimientos de Software *Plataforma de Quizzes Interactivos con IA — Versión 1.0* |
| :---: |

| Fecha 2025 | Versión 1.0 — Inicial | Estado Borrador Aprobado |
| :---: | :---: | :---: |

# **1\. Visión General del Proyecto**

QuizMaster Pro es una aplicación web para la creación, gestión y distribución de quizzes interactivos. Está dirigida a educadores y creadores de contenido que desean generar cuestionarios — manual o automáticamente con IA — y compartirlos con estudiantes mediante un enlace URL. Cada estudiante accede individualmente, ingresa su nombre completo, contesta el quiz y recibe sus resultados al finalizar.

| Objetivo principal Proveer una plataforma completa para crear, distribuir y analizar quizzes individuales. El creador gestiona su contenido desde un dashboard; el estudiante accede sin necesidad de registro, solo con su nombre. |
| :---- |

## **1.1 Alcance del sistema**

* Generación de quizzes con IA local (Ollama)

* Creación manual con editor visual

* Acceso por URL pública — sin registro para el estudiante

* Dos modos: quiz normal y modo estudio (flashcards)

* Dashboard del creador con analytics por quiz y por estudiante

* Exportación de resultados en CSV y PDF

## **1.2 Tipos de usuario**

| Tipo | Descripción | Acceso requerido |
| :---- | :---- | :---- |
| **Administrador** | Gestión total del sistema y usuarios | Panel admin completo |
| **Creador** | Crea y gestiona sus quizzes, grupos y etiquetas | Login obligatorio |
| **Estudiante** | Accede al quiz por URL y lo contesta individualmente | Sin registro — solo nombre completo |

# **2\. Requerimientos Funcionales**

## **2.1 Autenticación y usuarios (creadores)**

* Registro con nombre, email y contraseña (hash bcrypt).

* Login con JWT y refresh token.

* Recuperación de contraseña por email.

* Perfil editable: nombre y avatar.

* Roles: admin y creador. Los estudiantes no tienen cuenta.

## **2.2 Generación de quizzes con IA (Ollama)**

* Subida de archivos PDF o TXT desde el editor.

* Campo de instrucciones en texto libre para guiar al modelo.

* Selección de modelo: LLaMA 3, Qwen 2.5, Mistral, Gemma 2\.

* Configuración: número de preguntas, dificultad e idioma.

* El modelo responde en JSON estructurado (ver sección 5).

* Las preguntas generadas se importan al editor para revisión antes de guardar.

* Historial de generaciones por quiz.

| Integración Ollama El backend se comunica con la API REST de Ollama (localhost:11434 o servidor configurado). Las solicitudes son asíncronas con streaming para mostrar progreso. Si el modelo no está disponible se muestra un error descriptivo. |
| :---- |

## **2.3 Editor de quizzes (creación manual)**

* Crear quiz con: título, descripción, grupo, etiquetas, visibilidad (pública/privada), música (URL) e imagen de portada.

* Tipos de pregunta: opción múltiple (1 correcta), selección múltiple (varias correctas), verdadero/falso, respuesta abierta.

* Campos por pregunta: texto, tipo, orden, tiempo límite, puntos, imagen, video, explicación.

* Opciones de respuesta con orden y color de botón configurables.

* Vista previa del quiz antes de publicar.

* Duplicar quiz existente.

## **2.4 Gestión de grupos y etiquetas**

* Crear grupos con nombre, descripción, color e ícono.

* Asignar quizzes a grupos para organizarlos en el dashboard.

* Crear etiquetas temáticas (ej. "Matemáticas", "Biología") para filtros avanzados.

* Asignar múltiples etiquetas a un quiz.

## **2.5 Acceso del estudiante (vista pública)**

* El estudiante accede al quiz mediante una URL única (public\_url).

* Antes de iniciar debe ingresar su nombre completo — obligatorio.

* Selecciona el modo: quiz normal o modo estudio.

* No requiere cuenta ni registro.

* Puede repetir el quiz múltiples veces (cada intento se guarda por separado).

## **2.6 Modo quiz normal**

* Cronómetro visible por pregunta con animación de cuenta regresiva.

* Música de fondo personalizable por quiz (si el creador configuró una URL).

* Retroalimentación inmediata tras responder: correcto o incorrecto.

* Puntaje calculado por corrección y velocidad de respuesta.

* Al finalizar: pantalla de resultados con puntaje, aciertos/errores y detalle por pregunta.

## **2.7 Modo estudio**

* Flashcards de repaso: el estudiante ve la pregunta, reflexiona y luego revela la respuesta correcta.

* Al terminar las flashcards puede iniciar el quiz sin presión de tiempo.

* Muestra explicación (si existe) tras cada respuesta.

* Permite repetir todas las veces que quiera.

## **2.8 Dashboard del creador**

* Vista global: total de quizzes, intentos, estudiantes únicos, puntaje promedio.

* Dashboard por quiz: intentos totales, puntaje promedio, tasa de aciertos por pregunta (gráfica de barras), lista de estudiantes con sus puntajes.

* Filtros: por fecha (rango), por grupo, por etiqueta, por quiz específico.

* Identificación de preguntas con mayor tasa de error.

* Exportación de resultados por quiz en CSV y PDF.

# **3\. Pantallas Principales**

| Pantalla | Descripción | Acceso |
| :---- | :---- | :---- |
| **Landing page** | Presentación del producto, características, CTA de registro/login | Público |
| **Login / Registro** | Acceso para creadores. Recuperación de contraseña. | Creadores |
| **Dashboard global** | Estadísticas globales, quizzes recientes, grupos y etiquetas | Creadores |
| **Mis quizzes** | Lista con búsqueda, filtros por grupo/etiqueta/estado, acciones rápidas | Creadores |
| **Editor de quiz** | Crear/editar preguntas manual o con IA. Vista previa integrada. | Creadores |
| **Dashboard del quiz** | Intentos, puntajes por estudiante, gráfica de aciertos por pregunta, exportación | Creadores |
| **Vista pública (lobby)** | Ingreso de nombre completo y selección de modo antes de jugar | Público (URL) |
| **Modo quiz normal** | Cronómetro, pregunta, opciones, música, retroalimentación | Estudiantes |
| **Modo estudio** | Flashcards de repaso \+ quiz sin presión de tiempo | Estudiantes |
| **Resultados** | Puntaje final, detalle por pregunta, aciertos/errores, opción de repetir | Estudiantes |
| **Perfil del creador** | Datos personales, avatar, configuración de cuenta | Creadores |

# **4\. Diseño de Base de Datos**

El esquema está normalizado y optimizado para consultas analíticas. El detalle de respuestas se almacena en una tabla separada (respuestas\_intento) en lugar de JSON, lo que permite filtros y agregaciones eficientes en el dashboard.

### **4.1 usuarios**

| Campo | Tipo | Restricción | Descripción |
| :---- | :---- | :---- | :---- |
| **id** | UUID | PK | Identificador único |
| nombre | VARCHAR(100) | NOT NULL | Nombre visible del usuario |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email de acceso |
| password\_hash | VARCHAR(255) | NOT NULL | Hash bcrypt |
| rol | ENUM | DEFAULT creador | admin | creador |
| email\_verificado | BOOLEAN | DEFAULT false | Estado de verificación del email |
| creado\_en | TIMESTAMP | DEFAULT NOW() | Fecha de registro |
| ultimo\_acceso | TIMESTAMP | NULLABLE | Último login registrado |

### **4.2 grupos**

| Campo | Tipo | Restricción | Descripción |
| :---- | :---- | :---- | :---- |
| **id** | UUID | PK | Identificador único |
| nombre | VARCHAR(150) | NOT NULL | Nombre del grupo |
| descripcion | TEXT | NULLABLE | Descripción del grupo |
| creador\_id | UUID | FK → usuarios | Usuario propietario del grupo |
| color\_hex | VARCHAR(7) | NULLABLE | Color identificador (\#RRGGBB) |
| icono | VARCHAR(50) | NULLABLE | Emoji o nombre de ícono |
| creado\_en | TIMESTAMP | DEFAULT NOW() | Fecha de creación |

### **4.3 quizzes**

| Campo | Tipo | Restricción | Descripción |
| :---- | :---- | :---- | :---- |
| **id** | UUID | PK | Identificador único |
| titulo | VARCHAR(200) | NOT NULL | Título del quiz |
| descripcion | TEXT | NULLABLE | Descripción o resumen |
| autor\_id | UUID | FK → usuarios | Creador del quiz |
| grupo\_id | UUID | FK → grupos, NULL | Grupo al que pertenece |
| public\_url | VARCHAR(100) | UNIQUE, NOT NULL | Slug único para URL pública |
| is\_public | BOOLEAN | DEFAULT false | Visibilidad pública o privada |
| estado | ENUM | NOT NULL | borrador | publicado | archivado |
| musica\_url | VARCHAR(500) | NULLABLE | URL de música de fondo |
| imagen\_portada | VARCHAR(500) | NULLABLE | Imagen de portada del quiz |
| creado\_en | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| actualizado\_en | TIMESTAMP | ON UPDATE | Última modificación |

### **4.4 etiquetas**

| Campo | Tipo | Restricción | Descripción |
| :---- | :---- | :---- | :---- |
| **id** | UUID | PK | Identificador único |
| nombre | VARCHAR(50) | UNIQUE, NOT NULL | Ej. Matemáticas, Biología |
| color\_hex | VARCHAR(7) | NULLABLE | Color del tag (\#RRGGBB) |

### **4.5 quiz\_etiquetas (tabla pivot)**

| Campo | Tipo | Restricción | Descripción |
| :---- | :---- | :---- | :---- |
| quiz\_id | UUID | FK → quizzes | Quiz etiquetado |
| etiqueta\_id | UUID | FK → etiquetas | Etiqueta aplicada |

### **4.6 preguntas**

| Campo | Tipo | Restricción | Descripción |
| :---- | :---- | :---- | :---- |
| **id** | UUID | PK | Identificador único |
| quiz\_id | UUID | FK → quizzes | Quiz al que pertenece |
| texto | TEXT | NOT NULL | Enunciado de la pregunta |
| tipo\_pregunta | ENUM | NOT NULL | multiple | multi\_select | verdadero\_falso | abierta |
| orden | SMALLINT | NOT NULL | Posición en el quiz (1, 2, 3…) |
| tiempo\_limite | SMALLINT | DEFAULT 20 | Segundos para responder |
| puntos\_valor | SMALLINT | DEFAULT 100 | Puntos máximos por respuesta correcta |
| imagen\_url | VARCHAR(500) | NULLABLE | Imagen adjunta a la pregunta |
| video\_url | VARCHAR(500) | NULLABLE | Video adjunto (embed de YouTube) |
| explicacion | TEXT | NULLABLE | Explicación mostrada tras responder en modo estudio |

### **4.7 respuestas (opciones de pregunta)**

| Campo | Tipo | Restricción | Descripción |
| :---- | :---- | :---- | :---- |
| **id** | UUID | PK | Identificador único |
| pregunta\_id | UUID | FK → preguntas | Pregunta a la que pertenece |
| texto | TEXT | NOT NULL | Texto de la opción de respuesta |
| es\_correcta | BOOLEAN | DEFAULT false | Si es la respuesta correcta (o una de ellas) |
| orden | SMALLINT | NOT NULL | Posición de la opción (A, B, C, D…) |
| color | VARCHAR(7) | NULLABLE | Color del botón en modo juego (\#RRGGBB) |

### **4.8 intentos**

| Campo | Tipo | Restricción | Descripción |
| :---- | :---- | :---- | :---- |
| **id** | UUID | PK | Identificador único |
| quiz\_id | UUID | FK → quizzes | Quiz completado |
| usuario\_id | UUID | FK → usuarios, NULL | Usuario con cuenta (nullable) |
| nombre\_completo | VARCHAR(150) | NOT NULL | Nombre del estudiante — siempre obligatorio |
| puntaje\_total | INTEGER | DEFAULT 0 | Puntaje final acumulado |
| numero\_intento | SMALLINT | DEFAULT 1 | N.º de intento del mismo estudiante en ese quiz |
| modo | ENUM | NOT NULL | normal | estudio |
| tiempo\_total\_seg | INTEGER | NULLABLE | Segundos totales empleados en el quiz |
| completado | BOOLEAN | DEFAULT false | Si el estudiante terminó todas las preguntas |
| fecha | TIMESTAMP | DEFAULT NOW() | Momento en que se realizó el intento |

### **4.9 respuestas\_intento**

| Campo | Tipo | Restricción | Descripción |
| :---- | :---- | :---- | :---- |
| **id** | UUID | PK | Identificador único |
| intento\_id | UUID | FK → intentos | Intento al que pertenece esta respuesta |
| pregunta\_id | UUID | FK → preguntas | Pregunta respondida |
| respuesta\_id | UUID | FK → respuestas, NULL | Opción elegida (NULL si tipo abierta) |
| texto\_abierta | TEXT | NULLABLE | Respuesta libre para preguntas tipo abierta |
| es\_correcta | BOOLEAN | NOT NULL | Si la respuesta fue correcta |
| tiempo\_respuesta\_ms | INTEGER | NULLABLE | Milisegundos empleados en responder |
| puntos\_obtenidos | INTEGER | DEFAULT 0 | Puntos ganados en esta respuesta |

# **5\. Esquema JSON — Salida del Modelo IA**

El modelo Ollama debe responder únicamente con JSON válido siguiendo esta estructura. El backend valida el esquema antes de importar las preguntas al editor.

| {   "quiz": {     "titulo": "string",     "descripcion": "string",     "preguntas": \[       {         "texto": "¿Cuál es la capital de México?",         "tipo": "multiple",         "tiempo\_limite": 20,         "puntos\_valor": 100,         "explicacion": "Ciudad de México es la capital federal.",         "respuestas": \[           { "texto": "Ciudad de México", "es\_correcta": true,  "orden": 1 },           { "texto": "Guadalajara",       "es\_correcta": false, "orden": 2 },           { "texto": "Monterrey",         "es\_correcta": false, "orden": 3 },           { "texto": "Puebla",            "es\_correcta": false, "orden": 4 }         \]       }     \]   } } |
| :---- |

| Tipos de pregunta soportados por la IA El campo "tipo" acepta: multiple (una correcta), multi\_select (varias correctas), verdadero\_falso (respuestas: Verdadero / Falso), abierta (sin puntaje automático, no requiere campo respuestas). |
| :---- |

# **6\. Arquitectura Técnica Recomendada**

## **6.1 Stack tecnológico**

| Capa | Tecnología recomendada | Alternativas |
| :---- | :---- | :---- |
| **Frontend** | Next.js 14 \+ TypeScript \+ Tailwind CSS | Nuxt 3, SvelteKit |
| **Backend / API** | NestJS \+ TypeScript | Fastify, Express |
| **Base de datos** | Supabase (PostgreSQL serverless) | PostgreSQL 16, PlanetScale |
| **ORM** | Prisma ORM | Drizzle ORM, TypeORM |
| **IA local** | Ollama API REST (localhost:11434) | LM Studio, vLLM |
| **Autenticación** | JWT \+ Refresh Tokens | NextAuth.js, Auth0 |
| **Almacenamiento de archivos** | S3 / MinIO (self-hosted) | Cloudinary, Supabase Storage |
| **Exportación PDF** | Puppeteer o @react-pdf/renderer | WeasyPrint, wkhtmltopdf |
| **Despliegue** | Vercel (frontend) \+ Render/Railway (backend) | Fly.io, Kubernetes |

## **6.2 Flujo de un intento (estudiante)**

* El estudiante visita la URL pública del quiz (public\_url).

* Ingresa su nombre completo y selecciona el modo (normal o estudio).

* El frontend crea un registro en intentos con completado \= false.

* Por cada pregunta respondida se inserta una fila en respuestas\_intento con el tiempo de respuesta y los puntos obtenidos.

* Al finalizar se actualiza el intento: completado \= true, puntaje\_total y tiempo\_total\_seg.

* Se muestra la pantalla de resultados con el desglose completo.

## **6.3 Stack definitivo**

* **Frontend: Next.js** → para la interfaz de usuario, landing page, dashboards, modo juego y modo estudio.

* **Backend: NestJS** → para la lógica del servidor, APIs REST/GraphQL, integración con Ollama y Supabase.

* **Base de datos: Supabase (Postgres serverless)** → para manejar usuarios, quizzes, preguntas, respuestas, intentos y grupos.

* **Hosting: Vercel (frontend) \+ Render/Railway (backend)** → ambos con planes gratuitos y dominio incluido.

## **6.4 Diseño visual**

* La interfaz debe ser colorida y llamativa, con un diseño tipo juego para motivar a los estudiantes.

* Cada botón de respuesta múltiple debe tener un color diferente (ej. rojo, azul, verde, amarillo) para dar dinamismo y claridad.

* Ranking y puntajes deben mostrarse con barras de progreso o medallas para reforzar la gamificación.

* Música personalizada por quiz para ambientar la experiencia.

* Modo estudio con flashcards visuales y colores suaves para diferenciarlo del modo competitivo.

# **7\. Requerimientos No Funcionales**

| Categoría | Requerimiento | Métrica / Criterio |
| :---- | :---- | :---- |
| **Rendimiento** | Carga inicial de la aplicación | \< 2 segundos (LCP) |
| **Rendimiento** | Respuesta de la API en operaciones normales | \< 300 ms p95 |
| **Seguridad** | Autenticación y autorización | JWT RS256 \+ HTTPS obligatorio |
| **Seguridad** | Protección contra inyección SQL y XSS | ORM \+ sanitización de inputs |
| **Disponibilidad** | Uptime del servicio | ≥ 99.5% mensual |
| **Usabilidad** | Compatibilidad de navegadores | Chrome, Firefox, Safari, Edge (últimas 2 versiones) |
| **Usabilidad** | Diseño responsive mobile-first | Funcional desde 375px de ancho |
| **Accesibilidad** | Estándar mínimo de accesibilidad web | WCAG 2.1 nivel AA |
| **Internacionalización** | Soporte inicial de idiomas | Español e inglés (i18n desde el inicio) |

# **8\. Plan de Desarrollo por Fases**

| Fase | Nombre | Duración est. | Entregables clave |
| ----- | :---- | :---- | :---- |
| **1** | **Fundación y auth** | 2 semanas | Schema BD, API auth, Login/Registro, estructura frontend |
| **2** | **Editor y CRUD** | 3 semanas | Editor de quiz completo, gestión de preguntas, grupos y etiquetas |
| **3** | **Flujo del estudiante** | 2 semanas | Vista pública, ingreso de nombre, modo quiz normal, resultados |
| **4** | **IA \+ modo estudio** | 2 semanas | Integración Ollama, generación de quizzes, flashcards |
| **5** | **Analytics y extras** | 2 semanas | Dashboard con gráficas, exportación CSV/PDF, música de fondo |
| **6** | **QA y lanzamiento** | 1 semana | Testing E2E, optimización de rendimiento, documentación, deploy |

| QuizMaster Pro — v1.0 Documento de especificaciones finalizado · Listo para desarrollo |
| :---: |

