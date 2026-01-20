/**
 * Mensagens de sucesso padrão para exibição ao usuário.
 * Use estas constantes em vez de strings hardcoded para manter consistência.
 */

// ============================================================================
// Mensagens Genéricas
// ============================================================================

export const GENERIC_SUCCESS_MESSAGES = {
    SUCCESS: 'Sucesso',
    SAVED: 'Salvo com sucesso!',
    CREATED: 'Criado com sucesso!',
    UPDATED: 'Atualizado com sucesso!',
    DELETED: 'Excluído com sucesso!',
    SENT: 'Enviado com sucesso!',
    PROCESSED: 'Solicitação processada com sucesso.',
    COPIED: 'Copiado com sucesso!',
} as const;

// ============================================================================
// Mensagens de Autenticação e Perfil
// ============================================================================

export const AUTH_SUCCESS_MESSAGES = {
    PASSWORD_CHANGED: 'Senha alterada com sucesso! Redirecionando para o login...',
    PROFILE_UPDATED: 'Perfil atualizado com sucesso!',
    PREFERENCES_UPDATED: 'Preferências atualizadas com sucesso!',
    PERSONAL_DATA_UPDATED: 'Dados pessoais atualizados com sucesso!',
    IMAGE_UPDATED: 'Imagem atualizada com sucesso!',
} as const;

// ============================================================================
// Mensagens de Funcionalidades Específicas
// ============================================================================

export const FEATURE_SUCCESS_MESSAGES = {
    // Páginas e Seções
    PAGE_SAVED: 'Página salva com sucesso!',
    PAGE_CREATED: 'Página criada com sucesso!',
    PAGE_UPDATED: 'Página atualizada com sucesso!',
    PAGE_DELETED: 'Página excluída com sucesso.',
    SECTION_CREATED: 'Seção criada com sucesso!',
    SECTION_SAVED: 'Seção salva e publicada com sucesso!',
    SECTION_UPDATED: 'Seção editada e vinculada com sucesso! 🎉',
    SECTION_SHARED: 'Sua ideia incrível foi compartilhada com sucesso! 🎉',
    VIDEO_REMOVED: 'Vídeo removido com sucesso!',
    IMAGES_SHARED: 'Imagens compartilhadas publicadas com sucesso!',
    IMAGES_CLUB_SHARED: 'Imagens do seu Clubinho compartilhadas com sucesso!',
    MEDITATION_SAVED: 'Meditação salva com sucesso!',

    // Feedback e Contato
    FEEDBACK_DELETED: 'Feedback excluído com sucesso',
    CONTACT_DELETED: 'Contato excluído com sucesso',
    MESSAGE_SENT: 'Mensagem enviada com sucesso!',
    COMMENT_SENT: '✅ Comentário enviado com sucesso! Ele será avaliado antes de ser publicado.',
    URL_COPIED: 'URL copiada com sucesso!',

    // Documentos
    DOCUMENT_CREATED: 'Documento criado com sucesso!',
    DOCUMENT_UPDATED: 'Documento atualizado com sucesso!',
    DOCUMENT_DELETED: 'Documento excluído com sucesso!',

    // Controle de Clubes
    EXCEPTION_CREATED: 'Exceção cadastrada com sucesso! A data não terá funcionamento para TODOS os clubinhos deste dia.',
    EXCEPTION_DELETED: 'Exceção excluída com sucesso! A data voltará a ser considerada como dia normal de funcionamento.',
    PERIOD_CREATED: 'Período letivo cadastrado com sucesso! Este período vale para TODOS os clubinhos.',
    PERIOD_UPDATED: 'Período atualizado com sucesso!',
    PERIOD_DELETED: 'Período excluído com sucesso!',
    COORDINATOR_ASSIGNED: 'Club atribuído ao coordenador com sucesso',
    COORDINATOR_REMOVED: 'Club removido do coordenador com sucesso',

    // Cadastro
    REGISTER_COMPLETED: 'Cadastro concluído com sucesso!',
} as const;

export type GenericSuccessMessage = typeof GENERIC_SUCCESS_MESSAGES[keyof typeof GENERIC_SUCCESS_MESSAGES];
export type AuthSuccessMessage = typeof AUTH_SUCCESS_MESSAGES[keyof typeof AUTH_SUCCESS_MESSAGES];
export type FeatureSuccessMessage = typeof FEATURE_SUCCESS_MESSAGES[keyof typeof FEATURE_SUCCESS_MESSAGES];
