# Documentación del Proyecto GitTableHub

## Resumen
GitTableHub es una aplicación de programación de horarios para universidades, construida con Next.js 14 y Supabase.
La app gestiona universidades, carreras, semestres, cursos, profesores, salas y horarios.
Incluye un constructor de horarios consciente del semestre con arrastrar y soltar, y detección de conflictos para:
- profesores
- salas
- estudiantes dentro de una misma carrera

## Stack tecnológico
- Framework: Next.js 14 (App Router)
- Lenguaje: TypeScript
- Estilos: Tailwind CSS
- Base de datos: Supabase (PostgreSQL)
- Realtime: cambios de Postgres en Supabase y publicaciones Realtime
- Drag-and-drop: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- Validación: `zod`, `react-hook-form`, `@hookform/resolvers`

## Estructura del proyecto

### Raíz
- `package.json` - dependencias y scripts de la aplicación
- `next.config.ts` - configuración de Next.js
- `tsconfig.json` - configuración de TypeScript
- `README.md` - README inicial de Next.js
- `PROJECT_DOCUMENTATION.md` - este archivo de documentación

### Supabase
- `supabase/schema.sql` - esquema de base de datos, índices, publicación realtime y datos de ejemplo

### Frontend
- `app/` - páginas y layouts de la app Next.js
- `app/dashboard/` - área del dashboard con gestión de universidades, carreras, cursos y horarios
- `components/` - componentes reutilizables de UI y constructor
- `hooks/` - hooks de React personalizados para cargar y mutar datos desde Supabase
- `lib/` - utilidades compartidas, tipos y cliente de Supabase

## Esquema de base de datos (`supabase/schema.sql`)

### Tablas
- `universities`
  - `id`, `name`, `region`, `created_at`

- `careers`
  - `id`, `university_id`, `name`, `created_at`
  - clave foránea hacia `universities`

- `professors`
  - `id`, `university_id`, `name`, `email`, `max_hours`, `created_at`
  - restricción de carga de trabajo: `max_hours BETWEEN 1 AND 45`

- `classrooms`
  - `id`, `university_id`, `name`, `capacity`, `equipment`, `created_at`

- `courses`
  - `id`, `career_id`, `professor_id`, `name`, `code`, `hours_per_week`, `students_count`, `created_at`
  - referencias a `careers` y `professors`

- `semesters`
  - `id`, `career_id`, `name`, `created_at`
  - cada carrera puede tener múltiples semestres

- `course_semesters`
  - tabla intermedia entre `courses` y `semesters`
  - clave primaria `(course_id, semester_id)`

- `schedules`
  - `id`, `course_id`, `semester_id`, `classroom_id`, `day`, `start_time`, `end_time`, `created_at`
  - restricciones: `day` limitado a días hábiles y `start_time < end_time`
  - referencias a curso, semestre y sala

- `conflicts`
  - `id`, `schedule_id`, `type`, `message`, `created_at`
  - almacena conflictos asociados a filas de horario

### Índices
- `idx_careers_university`
- `idx_professors_university`
- `idx_classrooms_university`
- `idx_courses_career`
- `idx_courses_professor`
- `idx_course_semesters_semester`
- `idx_schedules_course`
- `idx_schedules_classroom`
- `idx_schedules_day_time`
- `idx_schedules_semester`

### Realtime
El archivo de esquema comprueba si existe la publicación `supabase_realtime` y añade:
- `schedules`
- `semesters`
- `course_semesters`

### Datos de ejemplo
Los datos de ejemplo incluyen:
- 1 universidad: Universidad de Tarapacá
- 2 carreras: Ingeniería en Informática, Administración de Empresas
- profesores y salas de ejemplo
- cursos para cada carrera
- semestres de ejemplo para cada carrera
- horarios de muestra asignados a `Semestre 1`
- mapeo `course_semesters` para `Semestre 1`

## Tipos compartidos (`lib/types.ts`)

### Tipos del dominio
- `University`
- `Career`
- `Professor`
- `Classroom`
- `Course`
- `Semester`
- `Schedule`
- `Conflict`
- `ConflictResult`

### Constantes adicionales
- `DAYS` - etiquetas de los días de la semana
- `TIME_SLOTS` - horarios de inicio disponibles para bloques de horario
- `TimeSlot` - tipo derivado de `TIME_SLOTS`

## Cliente de Supabase (`lib/supabase.ts`)

- Crea el cliente de Supabase usando `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Usa valores por defecto de placeholder si las variables de entorno vienen vacías o inválidas
- Desactiva persistencia de sesión y auto-refresh de token con `persistSession: false` y `autoRefreshToken: false`

## Utilidades (`lib/utils.ts`)

- `timeToMinutes(time)` - convierte un `HH:MM` a minutos
- `addMinutesToTime(time, minutes)` - suma minutos a una hora
- `timesOverlap(startA, endA, startB, endB)` - detecta solapamiento entre intervalos
- `getEndTimeForSlot(startTime)` - obtiene la hora de fin para un horario de inicio
- `hashColor(input)` - genera clases CSS de color determinísticas para bloques de horario
- `formatDay(day)` - devuelve la etiqueta del día de la semana
- `cn(...)` - helper para concatenar clases CSS

## Hooks

### `useSemesters` (`hooks/useSemesters.ts`)
- Carga semestres para una carrera dada
- Proporciona operaciones de crear/actualizar/eliminar semestres
- Mantiene el estado local sincronizado después de cada mutación
- Útil para gestionar la lista de semestres y mapear cursos/horarios a semestres

### `useCourses` (`hooks/useCourses.ts`)
- Carga cursos de una carrera
- Incluye metadata de profesor en la consulta
- Proporciona crear/actualizar/eliminar cursos

### `useCareers` (`hooks/useCareers.ts`)
- Carga carreras de una universidad
- Proporciona crear/actualizar/eliminar carreras
- Usa `university_id` para limitar las consultas a la universidad actual

### `useSchedules` (`hooks/useSchedules.ts`)
- Carga horarios filtrados por carrera y opcionalmente por semestre
- Si se pasa `semesterId`, consulta los horarios directamente por semestre
- Si no, usa los cursos de la carrera como filtro alternativo
- Soporta suscripción realtime en la tabla `schedules`
- Proporciona operaciones de crear/actualizar/eliminar horarios
- Selecciona datos relacionados de `courses`, `professors`, `classrooms` y `semesters`

### `useConflictChecker` (`hooks/useConflictChecker.ts`)
- Contiene las reglas de negocio para detección de conflictos
- Verifica tres dominios de conflicto:
  - disponibilidad del profesor
  - disponibilidad del aula
  - solapamientos entre cursos de la misma carrera
- Consulta horarios relacionados y devuelve un `ConflictResult`
- Usa `timesOverlap` para detectar tiempos superpuestos
- Genera mensajes de conflicto con metadatos:
  - nombre del profesor
  - nombre del curso
  - nombre de la carrera
  - nombre del semestre

## Constructor de horarios (`app/dashboard/components/ScheduleBuilder.tsx`)

### Propósito
El componente `ScheduleBuilder` es la interfaz principal para crear, editar y resolver conflictos de horarios por semestre.

### Funcionalidades clave
- Selección de semestre y estado controlado por URL
- Cuadrícula de horario por día de la semana y franja horaria
- Reubicación con arrastrar y soltar usando `@dnd-kit`
- Formulario para crear bloques de curso
- Verificación de conflictos antes de crear o actualizar
- Notificaciones tipo toast para éxito/error
- Sidebar de conflictos con lista de problemas activos
- Eliminación de bloques de horario

### Comportamiento
- Carga los semestres y selecciona uno automáticamente o usa el parámetro `semesterId` de la URL.
- Cuando se cargan los horarios, construye una cuadrícula usando `day` y `start_time`.
- Al arrastrar un bloque a otra celda, actualiza `day`, `start_time` y `end_time`.
- Realiza verificación de conflictos antes de actualizar o crear un horario.
- La UI aún mezcla etiquetas en español e inglés en algunos componentes.

## Componentes de UI del constructor de horarios

### `DroppableCell` (`app/dashboard/components/DroppableCell.tsx`)
- Una celda de tabla que acepta soltar bloques de horario
- Se resalta cuando un bloque se arrastra encima
- Renderiza `ScheduleBlock` cuando hay un horario presente

### `ScheduleBlock` (`app/dashboard/components/ScheduleBlock.tsx`)
- Una tarjeta arrastrable que representa una entrada de horario
- Muestra nombre del curso, profesor y sala
- Usa estilos de color generados por `hashColor`
- Puede mostrar estado de conflicto y control de eliminación

### `ConflictSidebar` (`app/dashboard/components/ConflictSidebar.tsx`)
- Muestra mensajes de conflicto activos
- Permite resaltar horarios con conflictos

## Flujo de universidades y carreras

### Navegación del dashboard
- La app tiene un dashboard para universidades y sus recursos asociados.
- Las páginas de carreras están anidadas en `/dashboard/universities/[id]/careers`
- La lista de carreras incluye botones de acción para cursos, semestres y acceso al constructor de horarios

### Gestión de semestres
- `SemesterManager` (`app/dashboard/components/SemesterManager.tsx`) proporciona CRUD de semestres
- Cada semestre pertenece a una carrera y puede crearse, renombrarse o eliminarse
- Eliminar un semestre borra también los horarios asociados, gracias a las claves foráneas de la base de datos

### Ruta al constructor de horarios
- La ruta del constructor de horarios es:
  `/dashboard/universities/[id]/careers/[careerId]/schedules`
- Acepta `semesterId` como parámetro de consulta para selección directa de semestre
- Los enlaces en la lista de carreras también generan URLs por semestre usando `SemesterLinks`

## Relaciones de datos y reglas de negocio

### Asociaciones principales
- `university` → `careers`, `professors`, `classrooms`
- `career` → `courses`, `semesters`
- `course` → `professor`, `career`
- `semester` → `career`, `course_semesters`, `schedules`
- `schedule` → `course`, `semester`, `classroom`

### Horarios con conciencia de semestre
- Los horarios se asignan a un semestre usando `semester_id`
- El constructor de horarios sólo carga y manipula los horarios del semestre seleccionado
- Los cursos se relacionan con semestres mediante `course_semesters`

### Reglas de conflicto
- Conflicto de profesor: un mismo profesor no puede dar clases solapadas
- Conflicto de sala: una misma sala no puede tener clases solapadas
- Conflicto de estudiante: los alumnos de la misma carrera no pueden tener cursos solapados

## Ejecución del proyecto

### Configuración
1. Copia `.env.example` a `.env.local`
2. Proporciona valores válidos de Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Desarrollo
- `npm run dev`
- Abre `http://localhost:3000`

### Compilación
- `npm run build`
- `npm run start`

### Lint
- `npm run lint`

## Notas

- La aplicación ya contiene un modelo de semestres funcional y almacenamiento de horarios por semestre.
- Algunos textos de la interfaz todavía están mezclados en español e inglés.
- Los datos de ejemplo en `supabase/schema.sql` son útiles para pruebas iniciales.
- La tabla `conflicts` existe, pero la detección de conflictos se realiza actualmente en los hooks del frontend, no se inserta automáticamente en la tabla.

## Mejoras recomendadas

- Homogeneizar todos los textos de la interfaz en un solo idioma.
- Mover la detección de conflictos a una función de backend o edge function de Supabase para mayor integridad de datos.
- Añadir selección de cursos según semestre para mostrar solo los cursos válidos para ese semestre.
- Agregar validación de horas del profesor y capacidad de aula al crear horarios.
- Implementar formularios remotos para profesores, aulas y cursos si aún no están disponibles.

## Resumen de archivos clave
- `supabase/schema.sql` - esquema de base de datos y datos de ejemplo
- `lib/supabase.ts` - configuración del cliente Supabase
- `lib/types.ts` - modelos de dominio y constantes compartidas
- `lib/utils.ts` - utilidades de tiempo, lógica de solapamiento y helpers de UI
- `hooks/useSemesters.ts` - CRUD de semestres
- `hooks/useSchedules.ts` - CRUD de horarios con filtrado por semestre
- `hooks/useConflictChecker.ts` - reglas de negocio para conflictos de horario
- `app/dashboard/components/ScheduleBuilder.tsx` - UI y flujo del constructor de horarios
- `app/dashboard/universities/[id]/careers/page.tsx` - lista de carreras y navegación por semestres
- `app/dashboard/universities/[id]/careers/[careerId]/schedules/page.tsx` - página que envuelve el constructor
- `app/dashboard/components/SemesterManager.tsx` - gestión de semestres por carrera

   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Development
- `npm run dev`
- Open `http://localhost:3000`

### Build
- `npm run build`
- `npm run start`

### Linting
- `npm run lint`

## Notes

- The app already contains a working semester model and semester-aware schedule storage.
- Some UI strings are still in Spanish; the schedule builder and semester manager contain bilingual labels.
- The seed data provided in `supabase/schema.sql` is useful for initial testing.
- `conflicts` table exists, but conflict detection currently runs in frontend hooks rather than being inserted automatically into the table.

## Recommended Improvements

- Normalize UI text into one language for consistency.
- Move conflict detection into a backend function or Supabase edge function for stronger data integrity.
- Add course-semester selection to ensure only semester-relevant courses are available when scheduling.
- Add validation for professor hours and classroom capacity in schedule creation.
- Implement remote forms for professors, classrooms, and courses if not already present.

## Key Files Summary
- `supabase/schema.sql` - DB schema + seed data
- `lib/supabase.ts` - Supabase client configuration
- `lib/types.ts` - shared domain models and constants
- `lib/utils.ts` - time helpers, overlap logic, UI utilities
- `hooks/useSemesters.ts` - semester CRUD
- `hooks/useSchedules.ts` - schedule CRUD with semester filtering
- `hooks/useConflictChecker.ts` - schedule conflict business rules
- `app/dashboard/components/ScheduleBuilder.tsx` - schedule builder UI and workflow
- `app/dashboard/universities/[id]/careers/page.tsx` - career list and semester navigation
- `app/dashboard/universities/[id]/careers/[careerId]/schedules/page.tsx` - builder page wrapper
- `app/dashboard/components/SemesterManager.tsx` - career semester management
