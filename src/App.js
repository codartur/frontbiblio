// Frontend - React App
import React, { useState, useEffect } from "react";

const App = () => {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [rentals, setRentals] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBooks, setSelectedBooks] = useState([]);

  // Define a URL base a partir da variável de ambiente
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Load initial data
    fetch(`${apiUrl}/users`)
      .then((res) => res.json())
      .then(setUsers);

    fetch(`${apiUrl}/books`)
      .then((res) => res.json())
      .then(setBooks);

    fetch(`${apiUrl}/rentals`)
      .then((res) => res.json())
      .then(setRentals);
  }, [apiUrl]);

  const handleRent = () => {
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

    fetch(`${apiUrl}/rentals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rental),
    })
      .then((res) => res.json())
      .then((newRental) => setRentals([...rentals, newRental]));

    setSelectedUser(null);
    setSelectedBooks([]);
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
