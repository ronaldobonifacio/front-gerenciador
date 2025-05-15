
import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import axios from "axios";
import { ref, push } from "firebase/database";
import type { User } from "firebase/auth";


interface Compra {
  estabelecimento: string;
  local: string;
  parcela: string;
  valor: string;
  data: string;
  obs: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [comprasConfirmadas, setComprasConfirmadas] = useState<Compra[]>([]);
  const [novaCompra, setNovaCompra] = useState<Compra>({
    estabelecimento: "",
    local: "",
    parcela: "",
    valor: "",
    data: "",
    obs: "",
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log("Auth mudou:", u);
      setUser(u);
    });
    return unsub;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const formData = new FormData();
    files.forEach((img) => formData.append("images", img));
    if (!user) {
      return <h1>Por favor, faça login</h1>;
    }
    formData.append("uid", user.uid);
    const { data } = await axios.post("http://localhost:3000/import", formData);
    setCompras(data.compras);
  };

  const confirmarCompra = (index: number) => {
    setComprasConfirmadas([...comprasConfirmadas, compras[index]]);
    setCompras(compras.filter((_, i) => i !== index));
  };

  const salvarCompras = async () => {
    if (!user) {
      return <h1>Por favor, faça login</h1>;
    }
    await axios.post("http://localhost:3000/salvar", {
      uid: user.uid,
      compras: comprasConfirmadas,
    });
    setComprasConfirmadas([]);
    alert("Compras salvas com sucesso!");
  };

  const salvarNovaCompra = () => {
    if (!user) {
      return <h1>Por favor, faça login</h1>;
    }
    const refNova = ref(db, `usuarios/${user.uid}/compras`);
    push(refNova, {
      ...novaCompra,
      valorNumerico: parseFloat(novaCompra.valor.replace(/\D/g, "").replace(",", ".")),
      timestamp: new Date(novaCompra.data).getTime(),
      categoria: "outras",
    });
    setNovaCompra({ estabelecimento: "", local: "", parcela: "", valor: "", data: "", obs: "" });
  };

  if (!user) {
    return (
      <div className="flex h-screen justify-center items-center">
        <h1>Por favor, faça login</h1>;
      <button
  onClick={login}
  className="
    px-6 py-3
    bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500
    text-white
    font-semibold
    rounded-lg
    shadow-lg
    hover:brightness-110
    transition
    duration-300
    ease-in-out
    focus:outline-none
    focus:ring-4
    focus:ring-purple-300
  "
>
  Login com Google
</button>


      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bem-vindo, {user.displayName}</h1>
        <button onClick={logout} className="text-sm text-red-500">
          Sair
        </button>
      </div>

      <div>
        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="mb-4" />
      </div>

      <div>
        <h2 className="text-xl font-semibold">Compras Extraídas</h2>
        <ul className="space-y-2">
          {compras.map((c, i) => (
            <li key={i} className="border rounded-lg p-3 bg-gray-100">
              <input
                type="text"
                value={c.estabelecimento}
                onChange={(e) => {
                  const copia = [...compras];
                  copia[i].estabelecimento = e.target.value;
                  setCompras(copia);
                }}
                className="block mb-1 w-full"
              />
              <input
                type="text"
                value={c.local}
                onChange={(e) => {
                  const copia = [...compras];
                  copia[i].local = e.target.value;
                  setCompras(copia);
                }}
                className="block mb-1 w-full"
              />
              <input
                type="text"
                value={c.parcela}
                onChange={(e) => {
                  const copia = [...compras];
                  copia[i].parcela = e.target.value;
                  setCompras(copia);
                }}
                className="block mb-1 w-full"
              />
              <input
                type="text"
                value={c.valor}
                onChange={(e) => {
                  const copia = [...compras];
                  copia[i].valor = e.target.value;
                  setCompras(copia);
                }}
                className="block mb-1 w-full"
              />
              <input
                type="date"
                value={c.data}
                onChange={(e) => {
                  const copia = [...compras];
                  copia[i].data = e.target.value;
                  setCompras(copia);
                }}
                className="block mb-1 w-full"
              />
              <input
                type="text"
                value={c.obs}
                onChange={(e) => {
                  const copia = [...compras];
                  copia[i].obs = e.target.value;
                  setCompras(copia);
                }}
                className="block mb-2 w-full"
              />
              <button onClick={() => confirmarCompra(i)} className="bg-green-500 text-white px-4 py-1 rounded">
                Confirmar
              </button>
            </li>
          ))}
        </ul>
      </div>

      {comprasConfirmadas.length > 0 && (
        <button onClick={salvarCompras} className="bg-blue-600 text-white px-4 py-2 rounded">
          Salvar Compras Confirmadas
        </button>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Adicionar Nova Compra</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            placeholder="Estabelecimento"
            value={novaCompra.estabelecimento}
            onChange={(e) => setNovaCompra({ ...novaCompra, estabelecimento: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            placeholder="Local"
            value={novaCompra.local}
            onChange={(e) => setNovaCompra({ ...novaCompra, local: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            placeholder="Parcela"
            value={novaCompra.parcela}
            onChange={(e) => setNovaCompra({ ...novaCompra, parcela: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            placeholder="Valor"
            value={novaCompra.valor}
            onChange={(e) => setNovaCompra({ ...novaCompra, valor: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="date"
            placeholder="Data"
            value={novaCompra.data}
            onChange={(e) => setNovaCompra({ ...novaCompra, data: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            placeholder="Observações"
            value={novaCompra.obs}
            onChange={(e) => setNovaCompra({ ...novaCompra, obs: e.target.value })}
            className="border p-2 rounded"
          />
        </div>
        <button onClick={salvarNovaCompra} className="mt-3 bg-purple-600 text-white px-4 py-2 rounded">
          Salvar Nova Compra
        </button>
      </div>
    </div>
  );
}
