// Serviço EXTERNO (Nominatim / OpenStreetMap) — não tem relação com a
// API do LembreMed. Sem token, sem API_URL do backend, propositalmente
// separado de api.ts (que é só para o nosso próprio servidor).
//
// Nominatim pede, por política de uso, um identificador de aplicação no
// header User-Agent/Referer — o navegador já envia o Referer sozinho,
// então nenhum header extra é necessário aqui para uso básico e pontual
// como este.
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

export async function obterEnderecoPorCoordenadas(
  latitude: number,
  longitude: number
): Promise<string> {
  const parametros = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: 'json',
  });

  const resposta = await fetch(`${NOMINATIM_URL}?${parametros.toString()}`);

  if (!resposta.ok) {
    throw new Error('Não foi possível obter o endereço.');
  }

  const dados = await resposta.json();

  // Nominatim retorna "display_name" com o endereço completo formatado.
  if (typeof dados?.display_name === 'string') {
    return dados.display_name;
  }

  throw new Error('Endereço não encontrado para essas coordenadas.');
}
