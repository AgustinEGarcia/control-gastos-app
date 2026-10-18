# Spec 019 — Rediseño Estético Integral: Minimalismo Técnico (Estilo Linear / Vercel)
Estado: borrador

## Contexto, Usuarios e Historias (HU-1)
- **Contexto**: El usuario evaluó las 3 propuestas visuales en local y seleccionó la **Opción B: Minimalismo Técnico**, inspirada en interfaces como Linear y Vercel. Busca una experiencia visual sobria, ágil, sin distracciones, con máxima densidad de información, bordes de 1px precisos y tipografía de alto contraste.
- **Usuario**: Usuario de control de gastos personales y préstamos que valora la claridad numérica inmediata y la estética profesional moderna de herramientas de ingeniería de software.
- **Historia de Usuario (HU-1)**:
  - COMO usuario de la aplicación,
  - QUIERO que todas las pantallas (Dashboard, Gastos Fijos, Cuotas, Préstamos, Tarjetas y Deudores) compartan la estética de Minimalismo Técnico,
  - PARA disfrutar de una interfaz ultra-limpia, rápida y agradable a la vista con jerarquía tipográfica uniforme.

## Definiciones, Casos Límite y Fuera de Alcance
- **Definición de Minimalismo Técnico**:
  - Fondo negro puro (`bg-black`) o grafito profundo (`bg-zinc-950`).
  - Bordes estructurados de 1 píxel (`border-zinc-800/80`).
  - Botones de acción principales en blanco de alto contraste (`bg-white text-zinc-950 hover:bg-zinc-200`) y secundarios en superficie grafito (`bg-zinc-900 border border-zinc-800 text-zinc-200`).
  - Cifras financieras y balances formateados en tipografía monoespaciada tabular (`font-mono`).
- **Casos límite**:
  - Garantizar legibilidad y contraste accesible en textos pequeños (mínimo ratio WCAG AA).
  - Mantener diferenciación cromática funcional en estados críticos (verde para pagado/a cobrar, ámbar para pendiente, rojo para vencido o desvío negativo), pero con tonos desaturados y no estridentes.
- **Fuera de alcance**:
  - No se modifica la lógica de negocio ni las tablas de base de datos en Supabase.
  - No se agregan nuevas entidades funcionales.

## Requisitos No Funcionales y Calidad
- **Rendimiento**: Cero dependencias pesadas de estilos adicionales; uso de utilidades Tailwind CSS nativas ya presentes.
- **Responsividad**: Perfecto ajuste en resoluciones móviles, tablets y escritorio.
- **Pruebas**: Mantener 100% de las pruebas unitarias (Vitest) y E2E (Playwright) pasando en verde.

## Requisitos Funcionales (Formato EARS)
- **RF-1**: CUANDO el usuario navega por cualquier sección de la app, EL SISTEMA debe presentar una base visual consistente en negro/zinc-950 con bordes de 1px (`border-zinc-800/80`).
- **RF-2**: CUANDO el usuario visualiza métricas monetarias (saldos, facturas, cuotas, préstamos), EL SISTEMA debe renderizarlas con fuente monoespaciada (`font-mono`) y alineación visual limpia.
- **RF-3**: CUANDO el usuario interactúa con botones de acción principal, EL SISTEMA debe ofrecer botones con estilo de alto contraste minimalista (`bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg`).
- **RF-4**: CUANDO un gasto o cuota es marcado como pagado, EL SISTEMA debe aplicar badges o indicadores discretos sin degradados estridentes ni sombras pesadas.
- **RF-5**: CUANDO el usuario accede al Navbar, EL SISTEMA debe mostrar una barra superior sobria y compacta, retirando el acceso temporal de pruebas local `/estilos-demo`.
