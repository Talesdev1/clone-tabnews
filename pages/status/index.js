import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <StatusInfo />
    </>
  );
}

function StatusInfo() {
  const { data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  function Show(p) {
    let loadingText = "Carregando...";
    return p || loadingText;
  }

  return (
    <>
      <h2>Dependencias</h2>
      <h3>Database: </h3>
      <p>Versão: {Show(data && data.dependencies.database.version)}</p>
      <p>
        Máximo de coneções aceitas:{" "}
        {Show(data && data.dependencies.database.max_connections)}
      </p>
      <p>
        Conexões abertas:{" "}
        {Show(data && data.dependencies.database.opened_connections)}
      </p>
      <p>
        Última atualização:{" "}
        {Show(data && new Date(data.updated_at).toLocaleString("pt-br"))}
      </p>
    </>
  );
}
