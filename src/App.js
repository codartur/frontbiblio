// Frontend - React App
import React, { useState, useEffect } from "react";

const URL = 'https://backbiblio.onrender.com/'

const App = () => {
  console.log("API URL:", URL);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [rentals, setRentals] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBooks, setSelectedBooks] = useState([]);

  useEffect(() => {
    // Load initial data
    fetch(`${URL}/users`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar usuários");
        return res.json();
      })
      .then(setUsers)
      .catch((err) => console.error(err));

    fetch(`${URL}/books`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar livros");
        return res.json();
      })
      .then(setBooks)
      .catch((err) => console.error(err));

    fetch(`${URL}/rentals`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar empréstimos");
        return res.json();
      })
      .then(setRentals)
      .catch((err) => console.error(err));
  }, []); // Remove a dependência de `URL` para evitar loops infinitos

  const handleRent = async () => {
    if (!selectedUser || selectedBooks.length === 0) {
      alert("Selecione um usuário e pelo menos um livro.");
      return;
    }
  
    const rental = {
      user: selectedUser,
      books: selectedBooks,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };
  
    try {
      const res = await fetch(`${URL}/rentals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rental),
      });
  
      if (!res.ok) {
        throw new Error("Erro ao registrar empréstimo");
      }
  
      const newRental = await res.json();
  
      // Atualizar a lista de empréstimos somente após o sucesso
      setRentals((prevRentals) => [...prevRentals, newRental]);
  
      // Limpar os campos selecionados
      setSelectedUser(null);
      setSelectedBooks([]);
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao registrar o empréstimo. Por favor, tente novamente.");
    }
  };

  return (
    <div>
      <h1>Sistema de Locação de Livros</h1>

      <h2>Usuários</h2>
      <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser || ""}>
        <option value="" disabled>
          Selecione um usuário
        </option>
        {users.map((user) => (
          <option key={user.id} value={user.name}>
            {user.name}
          </option>
        ))}
      </select>

      <h2>Livros</h2>
      {books.map((book) => (
        <label key={book.id}>
          <input
            type="checkbox"
            value={book.title}
            checked={selectedBooks.includes(book.title)}
            onChange={(e) => {
              const title = e.target.value;
              setSelectedBooks((prev) =>
                prev.includes(title) ? prev.filter((b) => b !== title) : [...prev, title]
              );
            }}
          />
          {book.title}
        </label>
      ))}

      <button onClick={handleRent}>Registrar Empréstimo</button>

      <h2>Empréstimos</h2>
      <ul>
        {rentals.map((rental, index) => (
          <li key={index}>
            <strong>{rental.user}</strong> alugou {rental.books.join(", ")} em {rental.date} (Devolução: {rental.dueDate})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
