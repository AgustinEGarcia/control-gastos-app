---
name: frontend-design
description: Guía de diseño de interfaces web modernas, estéticas y de alta calidad para frontend en Next.js, React y CSS. Úsala para crear interfaces no genéricas, con identidad visual premium, micro-animaciones y jerarquía clara.
---

# Frontend Design Skill

Esta skill define los principios para crear interfaces de usuario de nivel profesional y diseño de autor, evitando interfaces genéricas o plantillas por defecto.

## 1. Principios Fundamentales
1. **Intencionalidad Visual**: Cada elemento (fuente, borde, radio, color, espacio) tiene un propósito. No usar estilos genéricos de frameworks sin refinar.
2. **Jerarquía Tipográfica Robusta**: Contraste claro entre títulos primarios (`font-bold text-white`), texto de soporte (`text-zinc-400 text-xs`) y valores cuantitativos/monetarios con fuentes monoespaciadas legibles (`font-mono tracking-tight`).
3. **Profundidad y Capas (Layering)**:
   - Capa 0: Fondo base (`bg-zinc-950` o gradiente mesh sutil).
   - Capa 1: Superficies y tarjetas (`bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-md`).
   - Capa 2: Elementos interactivos destacados (hover con elevación, bordes iluminados de 1px).
4. **Micro-interacciones y Feedback**:
   - Transiciones suaves (`transition-all duration-200 ease-out`).
   - Efecto de presión en botones (`active:scale-[0.98]`).
   - Estados de hover con cambio de borde o resplandor de fondo sutil.

## 2. Arquetipos de Diseño Fintech

### Arquetipo A: Neo-Glass Fintech (Revolut / Mercury)
- **Fondo**: `zinc-950` con paneles de cristal ahumado (`backdrop-blur-md bg-zinc-900/60`).
- **Bordes**: `border-zinc-800/80 hover:border-emerald-500/40`.
- **Acentos**: Esmeralda vibrante (`emerald-400`), cian y acentos dorados para tarjetas.
- **Tarjetas**: Bordes curvos grandes (`rounded-2xl`), sombras suaves `shadow-xl shadow-black/40`.

### Arquetipo B: Minimalismo Técnico (Linear / Vercel)
- **Fondo**: `black` o `zinc-950` puro.
- **Bordes**: 1px ultra-preciso (`border-zinc-800/60`).
- **Tipografía**: Altos contrastes blanco/gris carbón, números tabulares monoespaciados.
- **Estilo**: Máxima densidad y velocidad visual, sin sombras excesivas ni brillos.

### Arquetipo C: Ambient Mesh & Glow (Raycast / Arc)
- **Fondo**: Luces ambientales difuminadas (`blur-3xl opacity-20` en colores esmeralda, violeta o índigo).
- **Badges**: Píldoras con bordes de luz interior (`bg-emerald-500/10 border-emerald-500/30 text-emerald-300`).
- **Botones**: Gradientes de alta gama con relieves sutiles.

## 3. Lista de Verificación en Cada Componente
- [ ] ¿Los montos y números usan `font-mono` para alineación tabular perfecta?
- [ ] ¿Los botones tienen estados `:hover`, `:active` y `:disabled` visibles y estilizados?
- [ ] ¿Los bordes tienen suficiente contraste pero sin ser agresivos?
- [ ] ¿Se evita el aspecto genérico de Tailwind básico?
