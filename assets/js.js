
            const newListInput = document.getElementById('new-list-input');
            const addListBtn = document.getElementById('add-list-btn');
            const listTypeToggle = document.getElementById('list-type-toggle');
            const listsContainer = document.getElementById('lists-container');
            const themeToggle = document.getElementById('theme-toggle');
            const modal = document.getElementById('todo-modal');
            const editListModal = document.getElementById('edit-list-modal');
            const closeModalBtn = document.querySelectorAll('.close-modal');
            const modalListTitle = document.getElementById('modal-list-title');
            const modalTodoInput = document.getElementById('modal-todo-input');
            const modalAddTodoBtn = document.getElementById('modal-add-todo');
            const modalTodosContainer = document.getElementById('modal-todos-container');
            const editListInput = document.getElementById('edit-list-input');
            const saveListBtn = document.getElementById('save-list-btn');
            
            let currentListId = null;
            let currentEditListId = null;
            let listType = 'with-todos'; 
            
            // Tjek for gemt tema præference
            if (localStorage.getItem('darkMode') === 'enabled') {
                document.body.classList.add('dark-mode');
                themeToggle.checked = true;
            }
            
            // Tema skift funktionalitet
            themeToggle.addEventListener('change', function() {
                if (this.checked) {
                    document.body.classList.add('dark-mode');
                    localStorage.setItem('darkMode', 'enabled');
                } else {
                    document.body.classList.remove('dark-mode');
                    localStorage.setItem('darkMode', 'disabled');
                }
            });

                 // List type toggle functionality
            listTypeToggle.addEventListener('click', function() {
                if (listType === 'with-todos') {
                    listType = 'without-todos';
                    listTypeToggle.textContent = '📝';
                    listTypeToggle.title = 'Skift til lister med opgaver';
                } else {
                    listType = 'with-todos';
                    listTypeToggle.textContent = '📋';
                    listTypeToggle.title = 'Skift til lister uden opgaver';
                }
            });
            
            // Indlæs lister fra localStorage
            loadLists();
            
            // Event listeners
            addListBtn.addEventListener('click', addNewList);
            newListInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addNewList();
                }
            });
            
            closeModalBtn.forEach(btn => {
                btn.addEventListener('click', function() {
                    if (this.closest('.modal').id === 'todo-modal') {
                        closeModal();
                    } else if (this.closest('.modal').id === 'edit-list-modal') {
                        closeEditModal();
                    }
                });
            });
            
            modalAddTodoBtn.addEventListener('click', addTodoFromModal);
            modalTodoInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addTodoFromModal();
                }
            });
            
            saveListBtn.addEventListener('click', saveListEdit);
            editListInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    saveListEdit();
                }
            });
            
            // Luk modal når der klikkes udenfor
            window.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                } else if (e.target === editListModal) {
                    closeEditModal();
                }
            });
            
            function addNewList() {
                const listName = newListInput.value.trim();
                if (listName === '') {
                    alert('Indtast venligst et listenavn');
                    return;
                }
                
                // Opret nyt list objekt
                const newList = {
                    id: Date.now(),
                    name: listName,
                    todos: listType === 'with-todos' ? [] : null // Set todos to null for lists without todos
                };
                
                // Gem til localStorage
                saveList(newList);
                
                // Opret listeelement
                createListElement(newList);
                
                // Ryd input
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
                            <div class="empty-state-icon">📝</div>
                            <p>Du har ingen lister endnu!</p>
                            <p>Opret en ny liste for at komme i gang</p>
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
                // Fjern tom tilstand hvis den eksisterer
                const emptyState = document.querySelector('.empty-state');
                if (emptyState) {
                    emptyState.remove();
                }
                
                const listElement = document.createElement('div');
                listElement.className = 'list';
                listElement.dataset.id = list.id;
                
                let todoInfo = '';
                if (list.todos !== null) {
                    const completedCount = list.todos.filter(todo => todo.completed).length;
                    const totalCount = list.todos.length;
                    todoInfo = `<div class="todo-count">${completedCount} af ${totalCount} opgaver fuldført</div>`;
                } else {
                    todoInfo = `<div class="todo-count"></div>`;
                }
                
                listElement.innerHTML = `
                    <div class="list-header">
                        <div class="list-title">${list.name}</div>
                        <div class="list-actions">
                            <button class="edit-btn">Rediger</button>
                            <button class="delete-btn">Slet</button>
                        </div>
                    </div>
                    ${todoInfo}
                `;
                
                listsContainer.appendChild(listElement);
                
                // Tilføj event listeners til den nye liste
                listElement.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('edit-btn') && 
                        !e.target.classList.contains('delete-btn')) {
                        if (list.todos !== null) {
                            openModal(list.id);
                        }
                    }
                });
                
                const editBtn = listElement.querySelector('.edit-btn');
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEditModal(list.id);
                });
                
                const deleteBtn = listElement.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteList(list.id);
                });
            }
            
            function openModal(listId) {
                const lists = getStoredLists();
                const list = lists.find(list => list.id === listId);
                
                if (!list) return;
                
                currentListId = listId;
                modalListTitle.textContent = list.name;
                renderTodosInModal(list.todos);
                
                modal.style.display = 'block';
                modalTodoInput.focus();
            }
            
            function closeModal() {
                modal.style.display = 'none';
                currentListId = null;
                
                // Opdater listerne for at vise eventuelle ændringer
                loadLists();
            }
            
            function openEditModal(listId) {
                const lists = getStoredLists();
                const list = lists.find(list => list.id === listId);
                
                if (!list) return;
                
                currentEditListId = listId;
                editListInput.value = list.name;
                editListModal.style.display = 'block';
                editListInput.focus();
            }
            
            function closeEditModal() {
                editListModal.style.display = 'none';
                currentEditListId = null;
                editListInput.value = '';
            }
            
            function saveListEdit() {
                if (!currentEditListId) return;
                
                const newName = editListInput.value.trim();
                if (newName === '') {
                    alert('Indtast venligst et listenavn');
                    return;
                }
                
                const lists = getStoredLists();
                const listIndex = lists.findIndex(list => list.id === currentEditListId);
                
                if (listIndex === -1) return;
                
                lists[listIndex].name = newName;
                localStorage.setItem('todoLists', JSON.stringify(lists));
                
                // Opdater UI
                loadLists();
                
                // Hvis modal er åben for denne liste, opdater titel
                if (currentListId === currentEditListId) {
                    modalListTitle.textContent = newName;
                }
                
                closeEditModal();
            }
            
            function renderTodosInModal(todos) {
                if (todos.length === 0) {
                    modalTodosContainer.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon">✅</div>
                            <p>Ingen opgaver i denne liste endnu</p>
                            <p>Tilføj en opgave for at komme i gang</p>
                        </div>
                    `;
                    return;
                }
                
                modalTodosContainer.innerHTML = '';
                todos.forEach(todo => {
                    const todoItem = document.createElement('div');
                    todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                    todoItem.dataset.id = todo.id;
                    
                    todoItem.innerHTML = `
                        <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                        <span class="todo-text">${todo.text}</span>
                    `;
                    
                    modalTodosContainer.appendChild(todoItem);
                    
                    // Tilføj event listener til checkbox
                    const checkbox = todoItem.querySelector('.todo-checkbox');
                    checkbox.addEventListener('change', () => toggleTodoComplete(currentListId, todo.id));
                });
            }
            
            function addTodoFromModal() {
                if (!currentListId) return;
                
                const todoText = modalTodoInput.value.trim();
                if (todoText === '') {
                    alert('Indtast venligst en opgave');
                    return;
                }
                
                const newTodo = {
                    id: Date.now(),
                    text: todoText,
                    completed: false
                };
                
                // Opdater localStorage
                const lists = getStoredLists();
                const listIndex = lists.findIndex(list => list.id === currentListId);
                
                if (listIndex === -1) return;
                
                lists[listIndex].todos.push(newTodo);
                localStorage.setItem('todoLists', JSON.stringify(lists));
                
                // Opdater modal UI
                renderTodosInModal(lists[listIndex].todos);
                
                // Ryd input
                modalTodoInput.value = '';
                modalTodoInput.focus();
            }
            
            function toggleTodoComplete(listId, todoId) {
                const lists = getStoredLists();
                const listIndex = lists.findIndex(list => list.id === listId);
                
                if (listIndex === -1) return;
                
                const todoIndex = lists[listIndex].todos.findIndex(todo => todo.id === todoId);
                
                if (todoIndex === -1) return;
                
                lists[listIndex].todos[todoIndex].completed = !lists[listIndex].todos[todoIndex].completed;
                localStorage.setItem('todoLists', JSON.stringify(lists));
                
                // Opdater modal UI
                renderTodosInModal(lists[listIndex].todos);
            }
            
            function deleteList(listId) {
                if (!confirm('Er du sikker på, at du vil slette denne liste?')) {
                    return;
                }
                
                let lists = getStoredLists();
                lists = lists.filter(list => list.id !== listId);
                localStorage.setItem('todoLists', JSON.stringify(lists));
                
                // Fjern fra UI
                loadLists();
                
                // Hvis modal er åben for denne liste, luk den
                if (currentListId === listId) {
                    closeModal();
                }
                if (currentEditListId === listId) {
                    closeEditModal();
                }
            }