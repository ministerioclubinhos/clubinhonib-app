# TeacherArea - Estrutura Reorganizada

## 📁 Estrutura de Pastas

```
src/pages/TeacherArea/
├── components/
│   ├── Banners/           # Todos os banners
│   │   ├── IdeasSharingBanner.tsx
│   │   ├── SpecialFamilyCallout.tsx
│   │   ├── TeacherWeekBanner.tsx
│   │   ├── TeacherMeditationBanner.tsx
│   │   ├── InformativeBanner.tsx
│   │   └── index.ts
│   ├── Sections/          # Seções de conteúdo
│   │   ├── BannerSection.tsx
│   │   ├── MotivationSection.tsx
│   │   ├── TeacherContent.tsx
│   │   ├── CommentsSection.tsx
│   │   ├── DocumentsSection.tsx
│   │   ├── IdeasGallerySection.tsx
│   │   ├── TrainingVideosSection.tsx
│   │   ├── WeekMaterialsList.tsx
│   │   └── index.ts
│   ├── Buttons/           # Componentes de botão
│   │   ├── FofinhoButton.tsx
│   │   └── index.ts
│   ├── Forms/             # Formulários
│   │   ├── SiteFeedbackForm.tsx
│   │   └── index.ts
│   ├── Modals/            # Modais e componentes modais
│   │   ├── AddImageModal.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── NotificationModal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── index.ts
│   └── index.ts           # Export principal
├── constants/
│   └── index.ts           # Constantes e estilos
├── hooks/
│   ├── useTeacherArea.ts
│   └── index.ts
├── types/
│   └── index.ts           # Interfaces TypeScript
├── IdeasSection/          # Seção de ideias
│   └── IdeasSectionPage.tsx
├── ImageSection/          # Seção de imagens
│   ├── ImageSectionEditor.tsx
│   └── ImageSectionPage.tsx
└── TeacherArea.tsx        # Componente principal
```

## 🎯 Organização por Categoria

### Banners

- **IdeasSharingBanner**: Banner para compartilhar ideias
- **SpecialFamilyCallout**: Banner para eventos especiais da família
- **TeacherWeekBanner**: Banner dos materiais da semana
- **TeacherMeditationBanner**: Banner de meditação diária
- **InformativeBanner**: Banner informativo geral

### Sections

- **BannerSection**: Gerencia a exibição dos banners
- **MotivationSection**: Seção de texto motivacional
- **TeacherContent**: Conteúdo principal para professores logados
- **CommentsSection**: Seção de comentários
- **DocumentsSection**: Seção de documentos
- **IdeasGallerySection**: Galeria de ideias
- **TrainingVideosSection**: Seção de vídeos de treinamento
- **WeekMaterialsList**: Lista de materiais da semana

### Buttons

- **FofinhoButton**: Botão principal de navegação

### Forms

- **SiteFeedbackForm**: Formulário de feedback do site

### Modals

- **AddImageModal**: Modal para adicionar imagens
- **ConfirmModal**: Modal de confirmação
- **NotificationModal**: Modal de notificações
- **LoadingSpinner**: Spinner de carregamento

## 🔄 Imports

Todos os componentes são exportados através de seus respectivos `index.ts` e podem ser importados assim:

```typescript
// Importar componentes específicos
import { IdeasSharingBanner, TeacherWeekBanner } from './components';

// Importar de categorias específicas
import { IdeasSharingBanner } from './components/Banners';
import { DocumentsSection } from './components/Sections';
```

## 📝 Benefícios da Reorganização

1. **Melhor Organização**: Componentes agrupados por função
2. **Facilita Manutenção**: Estrutura clara e previsível
3. **Imports Limpos**: Exports centralizados em cada pasta
4. **Escalabilidade**: Fácil adicionar novos componentes nas categorias corretas
5. **Separação de Responsabilidades**: Cada pasta tem uma responsabilidade específica
