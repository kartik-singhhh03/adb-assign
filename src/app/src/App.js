import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8000/todos/";

function App() {
  const [todos, setTodos] = useState([]);
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTodos = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to load todos");
      }

      const data = await response.json();
      setTodos(data);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditingDescription(todo.description);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditingDescription("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setError("Please enter a todo description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: trimmedDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save todo");
      }

      setDescription("");
      await fetchTodos();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (todoId) => {
    const trimmedDescription = editingDescription.trim();
    if (!trimmedDescription) {
      setError("Please enter a todo description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: todoId,
          description: trimmedDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      cancelEdit();
      await fetchTodos();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (todoId) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: todoId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      if (editingId === todoId) {
        cancelEdit();
      }

      await fetchTodos();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <main className="todo-card">
        <h1>List of TODOs</h1>

        {loading && <p className="status-text">Loading...</p>}
        {error && <p className="status-text error-text">{error}</p>}

        <section className="todo-list-section">
          <ul className="todo-list">
            {todos.length === 0 && !loading ? (
              <li className="todo-item empty-item">No todos yet</li>
            ) : (
              todos.map((todo) => (
                <li key={todo.id} className="todo-item">
                  <div className="todo-row">
                    {editingId === todo.id ? (
                      <input
                        className="todo-edit-input"
                        type="text"
                        value={editingDescription}
                        onChange={(event) => setEditingDescription(event.target.value)}
                        disabled={loading}
                      />
                    ) : (
                      <span className="todo-text">{todo.description}</span>
                    )}

                    <div className="todo-actions">
                      {editingId === todo.id ? (
                        <>
                          <button
                            type="button"
                            className="todo-button primary"
                            onClick={() => handleSave(todo.id)}
                            disabled={loading}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="todo-button secondary"
                            onClick={cancelEdit}
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="todo-button secondary"
                            onClick={() => startEdit(todo)}
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="todo-button danger"
                            onClick={() => handleDelete(todo.id)}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="todo-form-section">
          <h2>Create a TODO</h2>

          <form onSubmit={handleSubmit} className="todo-form">
            <label htmlFor="todo">ToDo:</label>
            <div className="todo-input-row">
              <input
                id="todo"
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={loading}
                placeholder="Write a todo"
              />

              <button type="submit" className="todo-button primary" disabled={loading}>
                Add ToDo!
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default App;
