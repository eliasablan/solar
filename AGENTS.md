# Gemini Project Guide: Solar System Gravity Simulator

Este documento sirve como contexto instruccional para Gemini CLI al trabajar en este proyecto.

## Descripción del Proyecto
Un simulador de gravedad N-body interactivo en 3D del sistema solar. Los usuarios pueden lanzar asteroides, observar colisiones con fragmentación de escombros y visualizar la curvatura del espacio-tiempo a través de una rejilla dinámica.

## Stack Tecnológico
- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript (Strict Mode)
- **3D:** React Three Fiber (R3F) + Three.js 0.160.0
- **Estilos:** Tailwind CSS v4
- **Físicas:** Motor de integración Verlet personalizado (N-body)

## Arquitectura de Archivos Principal
- `src/lib/physics/`: Motor lógico de la simulación.
  - `engine.ts`: Integración de Verlet y cálculo de aceleraciones.
  - `collisions.ts`: Detección de impactos y fragmentación.
  - `constants.ts`: Constantes físicas (G=10) y definiciones iniciales.
- `src/hooks/usePhysics.ts`: Hook central que orquesta el loop de física y el estado de React.
- `src/components/`: Capa de visualización.
  - `SolarSimulator.tsx`: Componente raíz y controlador de UI.
  - `Scene3D.tsx`: Canvas de Three.js y configuración de escena.
  - `PlanetMesh.tsx`: Renderizado de astros con texturas y rotación axial realista.
  - `GravityGrid.tsx`: Visualización de la deformación espacio-temporal (Shader).
  - `ui/Card.tsx`: Primitiva estandarizada para todos los paneles de la interfaz.

## Convenciones de Desarrollo
- **Físicas:** No usar librerías externas; mantener la lógica en `src/lib/physics`.
- **Tiempo:** La escala de tiempo está anclada a la Tierra (1 Año = 0.8104 seg sim). Cualquier ajuste de velocidad debe respetar este ratio.
- **UI:** Todas las tarjetas de control deben usar el componente `Card` y soportar el colapso mediante clics en la cabecera.
- **Rendimiento:**
  - Usar `React.memo` para componentes de mesh que se actualizan frecuentemente.
  - El recolector de basura elimina cuerpos automáticametne fuera de un radio de 2000 unidades.
  - Las deformaciones de la rejilla deben ocurrir en la GPU (Shader).

## Comandos Útiles
- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Genera el build de producción (valida tipos y estructura).
- `npx tsc --noEmit`: Comprobación rápida de errores de TypeScript.

## Notas sobre Texturas
Las texturas se cargan de forma asíncrona mediante `<Suspense>` y el hook `useTexture` de Drei. En caso de fallo de red, el sistema vuelve automáticamente a un color sólido configurado en `constants.ts`.
