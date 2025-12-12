import { useEffect, useMemo, useState } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  deadline?: string;
};

const STORAGE_KEY = "todo-app/items";

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const remainingCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos],
  );

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: Todo[] = JSON.parse(stored);
        // Eski todolar için createdAt ekle (migration)
        const migrated = parsed.map((todo) => ({
          ...todo,
          createdAt: todo.createdAt || new Date().toISOString(),
        }));
        setTodos(migrated);
      } catch (error) {
        console.error("Failed to parse todos from storage", error);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: trimmed,
      completed: false,
      createdAt: new Date().toISOString(),
      deadline: deadline || undefined,
    };
    setTodos((prev) => [newTodo, ...prev]);
    setText("");
    setDeadline("");
  };

  const handleToggle = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleAdd();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    const hoursLeft = diff / (1000 * 60 * 60);

    if (diff < 0) return "overdue"; // Geçmiş
    if (hoursLeft <= 24) return "urgent"; // 24 saat içinde
    if (hoursLeft <= 72) return "soon"; // 3 gün içinde
    return "normal";
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] pixel-bg">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8">
        <header className="flex flex-col gap-2 border-4 border-[#0f3460] bg-[#16213e] p-4 pixel-shadow">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-pixel text-[#e94560] pixel-text">
              TODO APP
            </h1>
            <span className="border-2 border-[#0f3460] bg-[#0f3460] px-3 py-1 text-xs font-pixel text-white pixel-button">
              {remainingCount} LEFT
            </span>
          </div>
          <p className="text-xs font-pixel text-[#a0a0a0]">
            ADD TASKS, MARK THEM DONE, SAVED LOCALLY
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 border-4 border-[#0f3460] bg-[#16213e] p-4 pixel-shadow"
        >
          <label className="text-xs font-pixel text-[#e94560]" htmlFor="todo">
            NEW TODO
          </label>
          <div className="flex flex-col gap-3">
            <input
              id="todo"
              className="w-full border-4 border-[#0f3460] bg-[#1a1a2e] px-3 py-2 text-sm font-pixel text-white outline-none focus:border-[#e94560] pixel-input"
              placeholder="E.G. SHIP THE NEW UI"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <label
                className="text-[10px] font-pixel text-[#a0a0a0] flex items-center gap-2"
                htmlFor="deadline"
              >
                <span>DEADLINE:</span>
                <input
                  id="deadline"
                  type="datetime-local"
                  className="flex-1 border-4 border-[#0f3460] bg-[#1a1a2e] px-3 py-2 text-[10px] font-pixel text-white outline-none focus:border-[#e94560] pixel-input"
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                />
              </label>
              <button
                type="submit"
                className="border-4 border-[#0f3460] bg-[#0f3460] px-4 py-2 text-xs font-pixel text-white transition hover:bg-[#e94560] hover:border-[#e94560] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed pixel-button"
                disabled={!text.trim()}
              >
                ADD TODO
              </button>
            </div>
          </div>
        </form>

        <section className="border-4 border-[#0f3460] bg-[#16213e] pixel-shadow">
          <div className="flex items-center justify-between border-b-4 border-[#0f3460] px-4 py-3">
            <h2 className="text-base font-pixel text-[#e94560]">YOUR LIST</h2>
            <span className="text-xs font-pixel text-[#a0a0a0]">
              {todos.length} TOTAL
            </span>
          </div>
          {todos.length === 0 ? (
            <p className="px-4 py-6 text-xs font-pixel text-[#a0a0a0]">
              NO TODOS YET. ADD ONE TO GET STARTED!
            </p>
          ) : (
            <ul className="divide-y-2 divide-[#0f3460]">
              {todos.map((todo) => {
                const deadlineStatus = getDeadlineStatus(todo.deadline);
                return (
                  <li
                    key={todo.id}
                    className={`flex flex-col gap-2 px-4 py-3 transition hover:bg-[#1a1a2e] sm:flex-row sm:items-center ${
                      deadlineStatus === "overdue" && !todo.completed
                        ? "bg-[#2a1a1a] border-l-4 border-[#e94560]"
                        : deadlineStatus === "urgent" && !todo.completed
                        ? "bg-[#2a2a1a] border-l-4 border-[#ffaa00]"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        id={`todo-${todo.id}`}
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggle(todo.id)}
                        className="h-5 w-5 border-4 border-[#0f3460] bg-[#1a1a2e] cursor-pointer pixel-checkbox"
                      />
                      <label
                        htmlFor={`todo-${todo.id}`}
                        className={`flex-1 text-xs sm:text-sm font-pixel cursor-pointer ${
                          todo.completed
                            ? "text-[#666] line-through"
                            : "text-white"
                        }`}
                      >
                        {todo.text}
                      </label>
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                        <span className="text-[10px] font-pixel text-[#a0a0a0]">
                          CREATED: {formatDate(todo.createdAt)}
                        </span>
                        {todo.deadline && (
                          <span
                            className={`text-[10px] font-pixel ${
                              deadlineStatus === "overdue" && !todo.completed
                                ? "text-[#e94560]"
                                : deadlineStatus === "urgent" && !todo.completed
                                ? "text-[#ffaa00]"
                                : deadlineStatus === "soon" && !todo.completed
                                ? "text-[#ffdd00]"
                                : "text-[#a0a0a0]"
                            }`}
                          >
                            DEADLINE: {formatDeadline(todo.deadline)}
                            {deadlineStatus === "overdue" && !todo.completed
                              ? " (OVERDUE!)"
                              : deadlineStatus === "urgent" && !todo.completed
                              ? " (URGENT!)"
                              : ""}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(todo.id)}
                        className="border-2 border-[#e94560] bg-[#e94560] px-3 py-1 text-[10px] font-pixel text-white transition hover:bg-[#c73650] hover:border-[#c73650] focus:outline-none pixel-button"
                      >
                        DELETE
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}







