        document.addEventListener('DOMContentLoaded', function() {
            const newListInput = document.getElementById('new-list-input');
            const addListBtn = document.getElementById('add-list-btn');
            const listsContainer = document.getElementById('lists-container');
            
            // Load lister fra localStorage
            loadLists();
            
            addListBtn.addEventListener('click', addNewList);
            newListInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addNewList();
                }
            });
            
            function addNewList() {
                const listName = newListInput.value.trim();
                if (listName === '') {
                    alert('Please enter a list name');
                    return;
                }
                
                // Ny liste objekt
                const newList = {
                    id: Date.now(),
                    name: listName,
                    todos: []
                };
                
                saveList(newList);

                createListElement(newList);
                
                newListInput.value = '';
                newListInput.focus();
            }
            
            function saveList(list) {
                const lists = getStoredLists();
                lists.push(list);
                localStorage.setItem('todoLists', JSON.stringify(lists));
            }
            
            function getStoredLists() {
                const listsJSON = localStorage.getItem('todoLists');
                return listsJSON ? JSON.parse(listsJSON) : [];
            }
            
            function loadLists() {
                const lists = getStoredLists();
                
                if (lists.length === 0) {
                    listsContainer.innerHTML = `
                        <div class="empty-state">
                            <p>Du har lige nu ikke nogen lister!</p>
                            <p>Lav en liste for at se dine lister!</p>
                        </div>
                    `;
                    return;
                }
                
                listsContainer.innerHTML = '';
                lists.forEach(list => {
                    createListElement(list);
                });
            }
            

            function createListElement(list) {

                const emptyState = document.querySelector('.empty-state');
                if (emptyState) {
                    emptyState.remove();
                }
                
                const listElement = document.createElement('div');
                listElement.className = 'list';
                listElement.dataset.id = list.id;
                
                listElement.innerHTML = `
                    <div class="list-header">
                        <div class="list-title">${list.name}</div>
                        <div class="list-actions">
                            <button class="edit-btn">Rediger</button>
                            <button class="delete-btn">Slet</button>
                        </div>
                    </div>
                    <div class="todo-input-section">
                        <input type="text" class="todo-input" placeholder="Lav ny todo...">
                        <button class="add-todo-btn">Add</button>
                    </div>
                    <div class="todos-container">
                        ${renderTodos(list.todos)}
                    </div>
                `;
                
                listsContainer.appendChild(listElement);
                
                // Laver nye event listeners for nye lister
                const listTitle = listElement.querySelector('.list-title');
                listTitle.addEventListener('click', toggleListExpansion);
                
                const editBtn = listElement.querySelector('.edit-btn');
                editBtn.addEventListener('click', () => editList(list.id));
                
                const deleteBtn = listElement.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', () => deleteList(list.id));
                
                const addTodoBtn = listElement.querySelector('.add-todo-btn');
                addTodoBtn.addEventListener('click', () => addTodoToList(list.id));
                
                const todoInput = listElement.querySelector('.todo-input');
                todoInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        addTodoToList(list.id);
                    }
                });
            }
            
            // Render todos for en liste
            function renderTodos(todos) {
                if (todos.length === 0) {
                    return '<div class="empty-todos">Ingen ting at lave... Lav en ny liste</div>';
                }
                
                return todos.map(todo => `
                    <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                        <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                        <span class="todo-text">${todo.text}</span>
                    </div>
                `).join('');
            }
            
            // List expansions
            function toggleListExpansion(e) {
                const listElement = e.target.closest('.list');
                listElement.classList.toggle('expanded');
            }
            
            // Rediger en liste
            function editList(listId) {
                const lists = getStoredLists();
                const listIndex = lists.findIndex(list => list.id === listId);
                
                if (listIndex === -1) return;
                
                const newName = prompt('Enter new list name:', lists[listIndex].name);
                
                if (newName !== null && newName.trim() !== '') {
                    lists[listIndex].name = newName.trim();
                    localStorage.setItem('todoLists', JSON.stringify(lists));
                    
                    // Opdatere ui
                    const listElement = document.querySelector(`.list[data-id="${listId}"]`);
                    listElement.querySelector('.list-title').textContent = newName.trim();
                }
            }
            
            // Slet en liste
            function deleteList(listId) {
                if (!confirm('Are you sure you want to delete this list?')) {
                    return;
                }
                
                let lists = getStoredLists();
                lists = lists.filter(list => list.id !== listId);
                localStorage.setItem('todoLists', JSON.stringify(lists));
                
                // Slet fra ui
                const listElement = document.querySelector(`.list[data-id="${listId}"]`);
                listElement.remove();
                
                // hvis ingen lister hvis tom
                if (lists.length === 0) {
                    listsContainer.innerHTML = `
                        <div class="empty-state">
                            <p>Du har lige nu ikke nogen lister!</p>
                            <p>Lav en liste for at se dine lister!</p>
                        </div>
                    `;
                }
            }
            
            // Add todo til en liste
            function addTodoToList(listId) {
                const listElement = document.querySelector(`.list[data-id="${listId}"]`);
                const todoInput = listElement.querySelector('.todo-input');
                const todoText = todoInput.value.trim();
                
                if (todoText === '') {
                    alert('Skriv en todo!');
                    return;
                }
                
                const newTodo = {
                    id: Date.now(),
                    text: todoText,
                    completed: false
                };
                
                // Opdater localStorage
                const lists = getStoredLists();
                const listIndex = lists.findIndex(list => list.id === listId);
                
                if (listIndex === -1) return;
                
                lists[listIndex].todos.push(newTodo);
                localStorage.setItem('todoLists', JSON.stringify(lists));
                
             
                const todosContainer = listElement.querySelector('.todos-container');
                if (todosContainer.querySelector('.empty-todos')) {
                    todosContainer.innerHTML = '';
                }
                
                const todoItem = document.createElement('div');
                todoItem.className = 'todo-item';
                todoItem.dataset.id = newTodo.id;
                todoItem.innerHTML = `
                    <input type="checkbox" class="todo-checkbox">
                    <span class="todo-text">${newTodo.text}</span>
                `;
                
                todosContainer.appendChild(todoItem);
                
            
                const checkbox = todoItem.querySelector('.todo-checkbox');
                checkbox.addEventListener('change', () => toggleTodoComplete(listId, newTodo.id));
                
      
                todoInput.value = '';
                todoInput.focus();
            }
            
 
            function toggleTodoComplete(listId, todoId) {
                const lists = getStoredLists();
                const listIndex = lists.findIndex(list => list.id === listId);
                
                if (listIndex === -1) return;
                
                const todoIndex = lists[listIndex].todos.findIndex(todo => todo.id === todoId);
                
                if (todoIndex === -1) return;
                
                lists[listIndex].todos[todoIndex].completed = !lists[listIndex].todos[todoIndex].completed;
                localStorage.setItem('todoLists', JSON.stringify(lists));
                
                // Opdatere ui
                const todoItem = document.querySelector(`.list[data-id="${listId}"] .todo-item[data-id="${todoId}"]`);
                todoItem.classList.toggle('completed');
            }
        });