/** Conteudo do token que o verifyToken valida e anexa a requisicao. */
export interface Usuario {
    _id: number;
    // Vem do banco, onde a coluna guarda a string 'true'.
    admin: boolean | string;
}
