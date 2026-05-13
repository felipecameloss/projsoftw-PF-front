import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { jwtDecode } from "jwt-decode";

const NAMESPACE = "https://social-insper.com/";

export default function App() {
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    isLoading,
    user,
    getAccessTokenSilently,
  } = useAuth0();

  const [products, setProducts] = useState([]);
  const [canCreate, setCanCreate] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    preco: "",
    status: "DISPONIVEL",
  });

  async function authedFetch(url, options = {}) {
    const token = await getAccessTokenSilently();

    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  }

  async function loadProducts() {
    const res = await authedFetch("/products");
    const data = await res.json();
    setProducts(data);
  }

  useEffect(() => {
    if (!isAuthenticated) return;

    async function setup() {
      const token = await getAccessTokenSilently();
      const decoded = jwtDecode(token);
      const roles = decoded[`${NAMESPACE}roles`] || [];

      const isAdmin = roles.includes("ADMIN");
      setCanCreate(isAdmin);
      setCanDelete(isAdmin);

      await loadProducts();
    }

    setup();
  }, [isAuthenticated, getAccessTokenSilently]);

  async function handleCreate(e) {
    e.preventDefault();

    await authedFetch("/products", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        preco: Number(form.preco),
      }),
    });

    setForm({ codigo: "", nome: "", preco: "", status: "DISPONIVEL" });
    loadProducts();
  }

  async function handleDelete(id) {
    await authedFetch(`/products/${id}`, {
      method: "DELETE",
    });

    loadProducts();
  }

  if (isLoading) return <p>Carregando...</p>;

  if (!isAuthenticated) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Produtos</h1>
        <button onClick={() => loginWithRedirect()}>Entrar com Auth0</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <h1>Produtos</h1>
        <button
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
        >
          Sair
        </button>
      </div>

      <p>Olá, {user?.name || user?.email}</p>

      {canCreate && (
        <form onSubmit={handleCreate} style={{ marginTop: 16, marginBottom: 24 }}>
          <input
            placeholder="Código"
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
          />
          <input
            placeholder="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          <input
            placeholder="Preço"
            type="number"
            value={form.preco}
            onChange={(e) => setForm({ ...form, preco: e.target.value })}
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="DISPONIVEL">DISPONIVEL</option>
            <option value="INDISPONIVEL">INDISPONIVEL</option>
          </select>
          <button type="submit">Cadastrar</button>
        </form>
      )}

      <ul>
        {products.map((p) => (
          <li key={p.id} style={{ marginBottom: 12 }}>
            {p.nome} - R$ {p.preco} - {p.status}
            {canDelete && (
              <button
                onClick={() => handleDelete(p.id)}
                style={{ marginLeft: 12 }}
              >
                Excluir
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}