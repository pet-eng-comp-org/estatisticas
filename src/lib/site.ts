// Endereço público do site: base dos links absolutos do sitemap, das prévias
// de compartilhamento e do endereço canônico de cada página.
export const URL_SITE = process.env.URL_SITE || "https://estatistica.pet.inf.ufes.br";

// Nome curto do site: o que o Google mostra acima do resultado da busca e o
// og:site_name das prévias de compartilhamento.
export const NOME_SITE = "Estatísticas PET Engenharia de Computação";

/**
 * Prévia de compartilhamento de uma página. A página que define a própria
 * substitui a do site inteiro, imagem junto; por isso a imagem vai aqui.
 */
export const previa = (title: string, description: string) => ({
  title,
  description,
  images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
});
