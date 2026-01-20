export const GENERIC_ERROR_MESSAGES = {
    UNEXPECTED: 'Ocorreu um erro inesperado.',
    INTERNAL_SERVER: 'Erro interno do servidor.',
    SERVICE_UNAVAILABLE: 'Serviço indisponível temporariamente.',
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
    TIMEOUT: 'A requisição demorou muito. Tente novamente.',
    TRY_AGAIN: 'Erro ao processar sua solicitação. Tente novamente mais tarde.',
    SAVE_ERROR: 'Erro ao salvar as alterações.',
} as const;

export const AUTH_ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Email ou senha incorretos.',
    USER_INACTIVE: 'Usuário inativo. Entre em contato com o administrador.',
    USER_NOT_VALIDATED: 'Usuário não validado, entre em contato com (92) 99127-4881 ou (92) 98155-3139',
    GOOGLE_LOGIN_ERROR: 'Erro ao fazer login com Google. Tente novamente.',
    SESSION_EXPIRED: 'Sua sessão expirou. Por favor, faça login novamente.',
    INVALID_FORM: 'Por favor, insira um email válido e uma senha com pelo menos 6 caracteres.',
} as const;

export const PASSWORD_RECOVERY_MESSAGES = {
    VERIFICATION_NEEDED: 'Seu email ainda não foi verificado. Um novo email de verificação foi enviado.',
    RESET_LINK_SENT: 'As instruções de recuperação foram enviadas para o seu email.',
    SUCCESS_GENERIC: 'Solicitação processada. Verifique seu email.',
    EMAIL_NOT_FOUND: 'Email não encontrado em nosso cadastro.',
    LINK_EXPIRED: 'O link de recuperação expirou. Por favor, solicite um novo.',
    LINK_INVALID: 'O link de recuperação é inválido. Por favor, solicite um novo.',
    PASSWORD_CHANGED: 'Senha alterada com sucesso! Redirecionando para o login...',
    PASSWORD_SAME_AS_CURRENT: 'A nova senha deve ser diferente da senha atual.',
} as const;

export const FORM_VALIDATION_MESSAGES = {
    PASSWORDS_DONT_MATCH: 'As senhas não coincidem.',
    PASSWORD_TOO_SHORT: 'A senha deve ter no mínimo 6 caracteres.',
    INVALID_EMAIL: 'Email inválido.',
    REQUIRED_FIELD: 'Este campo é obrigatório.',
    REQUIRED_GENERIC: 'Preencha todos os campos obrigatórios.',
    INVALID_PHONE: 'Telefone inválido',
    INVALID_CPF: 'CPF inválido',
    INVALID_DOCUMENT: 'Documento inválido',
    INVALID_DATE: 'Data inválida',
    INVALID_URL: 'URL inválida',
    INVALID_NUMBER: 'Número inválido',
    TITLE_REQUIRED: 'O título é obrigatório.',
    DESCRIPTION_REQUIRED: 'A descrição é obrigatória.',
    MEDIA_REQUIRED: 'Adicione pelo menos uma imagem.',
    VIDEO_REQUIRED: 'Adicione pelo menos um vídeo.',
    URL_INVALID_PLATFORM: 'URL inválida para a plataforma selecionada.',
    MEDITATION_DATE_MONDAY: 'A data de início deve ser uma segunda-feira.',
    MEDITATION_DATE_FRIDAY: 'A data de término deve ser uma sexta-feira.',
    MEDITATION_DAYS_COUNT: 'Adicione exatamente 5 dias de meditação.',
    MEDITATION_MEDIA_REQUIRED: 'Informe um link válido ou envie um arquivo.',
    SECTION_REQUIRED: 'Adicione pelo menos uma seção.',
    SECTION_TITLE_REQUIRED: 'A seção precisa de um título.',
    SECTION_DESCRIPTION_REQUIRED: 'A seção precisa de uma descrição.',
    SECTION_MEDIA_REQUIRED: 'A seção precisa conter pelo menos uma mídia.',
    SELECT_DESTINATION_PAGE: 'Selecione uma página de destino para vincular a seção.',
    SECTION_NOT_FOUND: 'Seção não encontrada para edição.',
    SECTION_ID_NOT_FOUND: 'ID da seção não encontrado',
    SHARED_GALLERY_TITLE_REQUIRED: 'O título da galeria compartilhada é obrigatório.',
    SHARED_GALLERY_DESCRIPTION_REQUIRED: 'A descrição das atividades do Clubinho é obrigatória.',
    SHARED_GALLERY_MEDIA_REQUIRED: 'É necessário ter pelo menos uma imagem para publicar.',
    COMMENT_FETCH_ERROR: 'Erro ao buscar comentários',
    COMMENT_PUBLISH_ERROR: 'Erro ao publicar comentário',
    COMMENT_DELETE_ERROR: 'Erro ao deletar comentário',
    COMMENT_SAVE_ERROR: 'Erro ao salvar comentário',
} as const;

export const PERMISSION_ERROR_MESSAGES = {
    ACCESS_DENIED: 'Você não tem permissão para acessar este recurso.',
    INSUFFICIENT_PERMISSIONS: 'Permissões insuficientes para esta operação.',
    FEATURE_DISABLED: 'Esta funcionalidade está temporariamente desabilitada.',
} as const;

export type GenericErrorMessage = typeof GENERIC_ERROR_MESSAGES[keyof typeof GENERIC_ERROR_MESSAGES];
export type AuthErrorMessage = typeof AUTH_ERROR_MESSAGES[keyof typeof AUTH_ERROR_MESSAGES];
export type PasswordRecoveryMessage = typeof PASSWORD_RECOVERY_MESSAGES[keyof typeof PASSWORD_RECOVERY_MESSAGES];
export type FormValidationMessage = typeof FORM_VALIDATION_MESSAGES[keyof typeof FORM_VALIDATION_MESSAGES];
export type PermissionErrorMessage = typeof PERMISSION_ERROR_MESSAGES[keyof typeof PERMISSION_ERROR_MESSAGES];
