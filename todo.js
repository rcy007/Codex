(function () {
  const STORAGE_KEY = 'simple-todo-items';

  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const emptyState = document.getElementById('empty-state');
  const clearCompletedButton = document.getElementById('clear-completed');

  let todos = loadTodos();
  render();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      return;
    }

    todos.push(createTodo(text));
    input.value = '';
    persist();
    render();
  });

  list.addEventListener('click', (event) => {
    const target = event.target;
    const item = target.closest('li');
    if (!item) return;
    const todoId = item.dataset.id;

    if (target.matches('input[type="checkbox"]')) {
      toggleTodo(todoId, target.checked);
    }

    if (target.matches('button[data-action="delete"]')) {
      deleteTodo(todoId);
    }
  });

  clearCompletedButton.addEventListener('click', () => {
    const beforeLength = todos.length;
    todos = todos.filter((todo) => !todo.completed);
    if (todos.length !== beforeLength) {
      persist();
      render();
    }
  });

  function createTodo(text) {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      text,
      completed: false,
      createdAt: Date.now(),
    };
  }

  function toggleTodo(id, completed) {
    const todo = todos.find((item) => item.id === id);
    if (todo) {
      todo.completed = completed;
      persist();
      render();
    }
  }

  function deleteTodo(id) {
    const nextTodos = todos.filter((item) => item.id !== id);
    if (nextTodos.length !== todos.length) {
      todos = nextTodos;
      persist();
      render();
    }
  }

  function render() {
    list.innerHTML = '';
    if (todos.length === 0) {
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;
    const sorted = [...todos].sort((a, b) => a.createdAt - b.createdAt);
    const fragment = document.createDocumentFragment();

    for (const todo of sorted) {
      fragment.appendChild(createTodoElement(todo));
    }

    list.appendChild(fragment);
  }

  function createTodoElement(todo) {
    const item = document.createElement('li');
    item.dataset.id = todo.id;
    if (todo.completed) {
      item.classList.add('completed');
    }

    const main = document.createElement('div');
    main.className = 'todo-main';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'completed'}`);

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    main.append(checkbox, text);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.dataset.action = 'delete';
    deleteButton.textContent = 'Delete';

    actions.appendChild(deleteButton);

    item.append(main, actions);
    return item;
  }

  function loadTodos() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item) => typeof item === 'object' && item !== null && 'id' in item && 'text' in item)
        .map((item) => ({
          id: String(item.id),
          text: String(item.text),
          completed: Boolean(item.completed),
          createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
        }));
    } catch (error) {
      console.warn('Failed to load todos from storage', error);
      return [];
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.warn('Failed to save todos to storage', error);
    }
  }
})();
