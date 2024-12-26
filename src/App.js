// Frontend - React App
import React, { useState, useEffect } from "react";
import "./App.css";

//const URL = "https://backbiblio.onrender.com";
const URL = "https://backbiblio.vercel.app";

const App = () => {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [rentals, setRentals] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch(`${URL}/users`)
      .then((res) => res.json())
      .then(setUsers)
      .catch((err) => console.error(err));

    fetch(`${URL}/books`)
      .then((res) => res.json())
      .then(setBooks)
      .catch((err) => console.error(err));

    fetch(`${URL}/rentals`)
      .then((res) => res.json())
      .then(setRentals)
      .catch((err) => console.error(err));
  }, []);

  const handleUserChange = (e) => {
    const userId = parseInt(e.target.value, 10);
    const user = users.find((u) => u.id === userId);

    if (user?.pendencias) {
      setErrorMessage("O usuário possui pendências ativas e não pode realizar empréstimos.");
      setSelectedUser(null);
    } else {
      setErrorMessage("");
      setSelectedUser(userId);
    }
  };

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

      if (!res.ok) throw new Error("Erro ao registrar empréstimo");

      const newRental = await res.json();
      setRentals((prevRentals) => [...prevRentals, newRental]);

      // Atualiza a lista de livros
      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          selectedBooks.includes(book.title) ? { ...book, status: false } : book
        )
      );

      setSelectedUser(null);
      setSelectedBooks([]);
    } catch (err) {
      console.error(err);
      alert("Erro ao registrar o empréstimo. Tente novamente.");
    }
  };

  return (
    <div>
      <h1>Sistema de Locação de Livros</h1>

      <h2>Usuários</h2>
      <select onChange={handleUserChange} value={selectedUser || ""}>
        <option value="" disabled>
          Selecione um usuário
        </option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}


      <h2>Livros</h2>
      <div className="books-grid">
  {books
    .filter((book) => book.status) // Filtra apenas livros disponíveis
    .map((book) => (
      <div key={book.id} className="book-card">
        {/* Imagem do livro */}
        <img src={book.imageUrl} alt={book.title} className="book-image" />

        {/* Informações do livro */}
        <div className="book-info">
          <label>
            {/* Checkbox para selecionar o livro */}
            <input
              type="checkbox"
              value={book.title}
              checked={selectedBooks.includes(book.title)}
              onChange={(e) => {
                const title = e.target.value;
                setSelectedBooks((prev) =>
                  prev.includes(title)
                    ? prev.filter((b) => b !== title)
                    : [...prev, title]
                );
              }}
            />
            {/* Título do livro */}
            {book.title}
          </label>
        </div>
      </div>
    ))}
</div>



      <button onClick={handleRent}>Registrar Empréstimo</button>

      <h2>Empréstimos</h2>
      <ul>
        {rentals.map((rental, index) => (
          <li key={index}>
            <strong>{users.find((u) => u.id === rental.user)?.name || "Usuário desconhecido"}</strong> alugou{" "}
            {rental.books.join(", ")} em {rental.date} (Devolução: {rental.dueDate})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
