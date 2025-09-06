    function showConfirm(message, onOk){
      $('#confirmMessage').text(message);
      const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
      modal.show();

      $('#confirmOkBtn').off('click').on('click', function(){
        modal.hide();
        if(typeof onOk === 'function') onOk();
      });
    }
    // Config & state
    const API = {
      users: 'https://jsonplaceholder.typicode.com/users',
      posts: 'https://jsonplaceholder.typicode.com/posts',
      comments: (postId) => `https://jsonplaceholder.typicode.com/comments?postId=${postId}`
    };

    const LS = {
      favUsers: 'favUsers_v1',
      postsLocal: 'localPosts_v1',
      usersLocal: 'localUsers_v1'
    };

    let users = [];
    let posts = [];
    let commentsCount = 0;
    let usersTable = null;

    toastr.options = { positionClass: 'toast-top-right' };

    // Utility
    function showLoader(show = true){
      if(show) $('#loader').show();
      else $('#loader').fadeOut(180);
    }

    function escapeHtml(s){
      return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
    }

    // Fetch all initial data
    function fetchAll(){
      showLoader(true);
      // we fetch all users, posts, and comments (comments only first page to get a count is fine, but JSONPlaceholder /comments returns all comments)
      return Promise.all([
        $.get(API.users),
        $.get(API.posts),
        $.get('https://jsonplaceholder.typicode.com/comments')
      ]).then(([u,p,c]) => {
        users = u;
        posts = p;
        commentsCount = c.length;

        // merge local posts (local first)
        const localPosts = JSON.parse(localStorage.getItem(LS.postsLocal) || '[]');
        posts = localPosts.concat(posts);

        // apply local user edits/deletes
        const usersLocal = JSON.parse(localStorage.getItem(LS.usersLocal) || '[]');
        if(usersLocal.length){
          usersLocal.forEach(lu => {
            const idx = users.findIndex(x => x.id == lu.id);
            if(idx === -1 && lu._deleted) return;
            if(lu._deleted){ users.splice(idx,1); }
            else if(idx > -1){ users[idx] = {...users[idx], ...lu}; }
          });
        }

        updateStats();
        initUsersTable();
        renderPosts();
        showLoader(false);
      }).catch(err => {
        showLoader(false);
        toastr.error('Failed to load API data');
        console.error(err);
      });
    }

    function updateStats(){
      $('#stat-users').text(users.length);
      $('#stat-posts').text(posts.length);
      $('#stat-comments').text(commentsCount);
    }

    // Users table init using DataTables (Bootstrap 5)
    function initUsersTable(){
      // if table exists - destroy
      if($.fn.DataTable.isDataTable('#usersTable')){
        usersTable.destroy();
        $('#usersTable tbody').empty();
      }

      const favs = JSON.parse(localStorage.getItem(LS.favUsers) || '[]');

      const rows = users.map(u => {
        const favHtml = `<button class="star-btn ${favs.includes(u.id)?'favorited':''}" data-id="${u.id}" title="Toggle favorite"><i class="fa-solid fa-star"></i></button>`;
        const actions = `
          <div class="d-flex gap-1 justify-content-center">
            <button class="btn btn-sm btn-outline-primary btn-view" data-id="${u.id}" title="View"><i class="fa-solid fa-eye"></i></button>
            <button class="btn btn-sm btn-outline-success btn-edit" data-id="${u.id}" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${u.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </div>
        `;
        return [
          favHtml,
          escapeHtml(u.name),
          escapeHtml(u.username || ''),
          escapeHtml(u.email),
          escapeHtml(u.phone || ''),
          escapeHtml(u.company?.name || ''),
          actions
        ];
      });

      usersTable = $('#usersTable').DataTable({
        data: rows,
        columns: [
          { title: 'Fav', orderable:false },
          { title: 'Name' },
          { title: 'Username' },
          { title: 'Email' },
          { title: 'Phone' },
          { title: 'Company' },
          { title: 'Actions', orderable:false }
        ],
        pageLength: 8,
        lengthMenu: [5,8,15,25],
        language: {
          emptyTable: "No users available",
          lengthMenu: "Show _MENU_ entries",
          info: "Showing _START_ to _END_ of _TOTAL_ entries",
          search: "Search:",
          paginate: { previous: "Prev", next: "Next" }
        },
        createdRow: function(row, data, dataIndex){
          $(row).addClass('animate__animated animate__fadeIn');
        }
      });
    }

    // Toggle favorite
    function toggleFav(id){
      let favs = JSON.parse(localStorage.getItem(LS.favUsers) || '[]');
      id = Number(id);
      if(favs.includes(id)){
        favs = favs.filter(x => x !== id);
        toastr.info('Removed from favorites');
      } else {
        favs.push(id);
        toastr.success('Added to favorites');
      }
      localStorage.setItem(LS.favUsers, JSON.stringify(favs));
      initUsersTable();
    }

    // Open edit user modal
    function openEditUser(id){
      const u = users.find(x => x.id == id);
      if(!u) return;
      $('#u-id').val(u.id);
      $('#u-name').val(u.name);
      $('#u-username').val(u.username || '');
      $('#u-email').val(u.email);
      $('#u-phone').val(u.phone || '');
      $('#u-company').val(u.company?.name || '');
      new bootstrap.Modal(document.getElementById('userModal')).show();
    }

    // ✅ New: Open Add User modal
    function openAddUser(){
      $('#u-id').val('');
      $('#u-name').val('');
      $('#u-username').val('');
      $('#u-email').val('');
      $('#u-phone').val('');
      $('#u-company').val('');
      new bootstrap.Modal(document.getElementById('userModal')).show();
    }

    // Save user edits (persist locally)
    function saveUserEdits(){
      const idVal = $('#u-id').val();
      const name = $('#u-name').val().trim();
      const username = $('#u-username').val().trim();
      const email = $('#u-email').val().trim();
      const phone = $('#u-phone').val().trim();
      const companyName = $('#u-company').val().trim();

      if(!name || !email){
        toastr.warning('Name and Email are required');
        return;
      }

      if(idVal){  
        // ✏️ تعديل يوزر موجود
        const id = Number(idVal);
        const idx = users.findIndex(x => x.id == id);
        if(idx > -1){
          users[idx] = {...users[idx], name, username, email, phone, company: { name: companyName }};
        }
        toastr.success('User updated');
      } else {
        // ➕ إضافة يوزر جديد
        const maxId = users.length ? Math.max(...users.map(u => Number(u.id) || 0)) : 0;
        const newId = maxId + 1;
        const newUser = { id: newId, name, username, email, phone, company: { name: companyName } };
        users.unshift(newUser);

        let usersLocal = JSON.parse(localStorage.getItem(LS.usersLocal) || '[]');
        usersLocal.push(newUser);
        localStorage.setItem(LS.usersLocal, JSON.stringify(usersLocal));

        toastr.success('New user added');
      }

      initUsersTable();
      updateStats();
      bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
    }


    // Delete user (mark deleted in local store)
    function deleteUser(id){
      showConfirm('Delete this user?', function(){
        const idx = users.findIndex(x => x.id == id);
        if(idx > -1) users.splice(idx, 1);

        let usersLocal = JSON.parse(localStorage.getItem(LS.usersLocal) || '[]');
        usersLocal = usersLocal.filter(x => x.id !== id);
        usersLocal.push({ id, _deleted: true });
        localStorage.setItem(LS.usersLocal, JSON.stringify(usersLocal));

        initUsersTable();
        updateStats();
        toastr.success('User deleted');
      });
    }

    // POSTS handling
    function renderPosts(filter = ''){
      const container = $('#posts-list').empty();
      const filtered = posts.filter(p => {
        if(!filter) return true;
        const q = filter.toLowerCase();
        return (p.title || '').toLowerCase().includes(q) || (p.body || '').toLowerCase().includes(q);
      });
      if(!filtered.length){
        container.append('<div class="col-12"><div class="card p-3">No posts found</div></div>');
        return;
      }
      filtered.forEach(p => {
        const card = $(`
          <div class="col-md-6">
            <div class="card p-3 shadow-sm animate__animated animate__fadeIn">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="mb-1">${escapeHtml(p.title)}</h6>
                  <div class="small-muted">Post ID: ${p.id} | User: ${p.userId || 'local'}</div>
                </div>
                <div class="btn-group">
                  <button class="btn btn-sm btn-outline-primary btn-comments" data-id="${p.id}" title="View comments"><i class="fa-solid fa-comments"></i></button>
                  <button class="btn btn-sm btn-outline-success btn-edit-post" data-id="${p.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                  <button class="btn btn-sm btn-outline-danger btn-delete-post" data-id="${p.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
              </div>
              <hr>
              <p class="mb-0">${escapeHtml(p.body || '').slice(0, 400)}</p>
            </div>
          </div>
        `);
        container.append(card);
      });
    }

    function openAddPost(){
      $('#p-id').val('');
      $('#p-title').val('');
      $('#p-body').val('');
      new bootstrap.Modal(document.getElementById('postModal')).show();
    }

    function openEditPost(id){
      const p = posts.find(x => x.id == id);
      if(!p) return;
      $('#p-id').val(p.id);
      $('#p-title').val(p.title);
      $('#p-body').val(p.body);
      new bootstrap.Modal(document.getElementById('postModal')).show();
    }

function savePost(){
  const idVal = $('#p-id').val();
  const title = $('#p-title').val().trim();
  const body = $('#p-body').val().trim();

  if(!title || !body){ 
    toastr.warning('Please complete fields'); 
    return; 
  }

  if(idVal){
    // ✏️ تعديل بوست موجود
    const id = Number(idVal);
    const idx = posts.findIndex(x => x.id == id);
    if(idx > -1){
      posts[idx] = {...posts[idx], title, body, _local: true};
      toastr.success('Post updated locally');
    }
  } else {
    // ➕ إضافة بوست جديد
    const maxId = posts.length ? Math.max(...posts.map(p => Number(p.id) || 0)) : 0;
    const newId = maxId + 1;

    // هنا خليه userId رقم (تقدر تعدله لو عندك user مختار)
    const newPost = { 
      userId: "me",   // 👈 ثابت دلوقتي، ممكن نخليه يتغير حسب الـ User المختار
      id: newId, 
      title, 
      body, 
      _local: true 
    };
    posts.unshift(newPost);
    toastr.success(`New post added with ID: ${newId}`);
  }

  // ✅ العمليات المهمة
  persistLocalPosts();  
  renderPosts($('#posts-search').val());  
  updateStats();  

  // ✅ قفل المودال
  bootstrap.Modal.getInstance(document.getElementById('postModal')).hide();
}


    function persistLocalPosts(){
      const localPosts = posts.filter(p => p._local);
      localStorage.setItem(LS.postsLocal, JSON.stringify(localPosts));
    }

    function deletePost(id){
      showConfirm('Delete this post?', function(){
        const idx = posts.findIndex(x => x.id == id);
        if(idx > -1) posts.splice(idx,1);
        persistLocalPosts();
        renderPosts($('#posts-search').val());
        updateStats();
        toastr.success('Post deleted');
      });
    }


    function viewComments(postId){
      $('#comments-body').html('<div class="text-center p-3">Loading comments...</div>');
      new bootstrap.Modal(document.getElementById('commentsModal')).show();
      $.get(API.comments(postId)).done(data => {
        if(!data.length) { $('#comments-body').html('<div class="p-3">No comments</div>'); return; }
        const html = data.map(c => `<div class="card mb-2 p-2"><b>${escapeHtml(c.name)}</b><div class="small-muted">${escapeHtml(c.email)}</div><p>${escapeHtml(c.body)}</p></div>`).join('');
        $('#comments-body').html(html);
      }).fail(() => {
        $('#comments-body').html('<div class="p-3">Failed to fetch comments</div>');
      });
    }

    // Export / Import (Navbar)
    function exportData(){
      const exportObj = {
        exportedAt: new Date().toISOString(),
        usersLocal: JSON.parse(localStorage.getItem(LS.usersLocal) || '[]'),
        favUsers: JSON.parse(localStorage.getItem(LS.favUsers) || '[]'),
        postsLocal: JSON.parse(localStorage.getItem(LS.postsLocal) || '[]')
      };
      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.getElementById('downloadLink');
      a.href = url;
      a.download = `dashboard-export-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toastr.success('Exported JSON');
    }

    function importData(file){
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const obj = JSON.parse(e.target.result);
          if(obj.usersLocal) localStorage.setItem(LS.usersLocal, JSON.stringify(obj.usersLocal));
          if(obj.favUsers) localStorage.setItem(LS.favUsers, JSON.stringify(obj.favUsers));
          if(obj.postsLocal) localStorage.setItem(LS.postsLocal, JSON.stringify(obj.postsLocal));
          // reload in-memory state
          fetchAll();
          toastr.success('Imported JSON and applied locally');
        } catch (err) {
          toastr.error('Invalid JSON file');
          console.error(err);
        }
      };
      reader.readAsText(file);
    }

    // UI bindings
    $(function(){
      // Navigation
      $('#nav-dashboard').on('click', () => showPage('dashboard'));
      $('#nav-users').on('click', () => showPage('users'));
      $('#nav-posts').on('click', () => showPage('posts'));

      // Dark mode toggle
      $('#toggle-mode').on('click', () => $('body').toggleClass('dark'));

      // Export/import wiring
      $('#exportData').on('click', exportData);
      $('#importDataBtn').on('click', () => $('#importInput').click());
      $('#importInput').on('change', function(e){
        const f = this.files && this.files[0];
        if(f) importData(f);
        this.value = '';
      });

      // Clear favorites
      $('#clear-favs').on('click', () => {
        showConfirm('Clear all favorites?', function(){
          localStorage.removeItem(LS.favUsers);
          toastr.info('Favorites cleared');
          initUsersTable();
        });
      });

      // Users table delegated events
      $('#usersTable tbody').on('click', '.star-btn', function(){ toggleFav($(this).data('id')); });
      $('#usersTable tbody').on('click', '.btn-edit', function(){ openEditUser($(this).data('id')); });
      $('#usersTable tbody').on('click', '.btn-delete', function(){ deleteUser($(this).data('id')); });
      $('#usersTable tbody').on('click', '.btn-view', function(){
        const id = $(this).data('id');
        const u = users.find(x => x.id == id);
        if(u) {
          const html = `
            <p><b>Name:</b> ${escapeHtml(u.name)}</p>
            <p><b>Username:</b> ${escapeHtml(u.username || '')}</p>
            <p><b>Email:</b> ${escapeHtml(u.email)}</p>
            <p><b>Phone:</b> ${escapeHtml(u.phone || '')}</p>
            <p><b>Company:</b> ${escapeHtml(u.company?.name || '')}</p>
          `;
          $('#userViewBody').html(html);
          new bootstrap.Modal(document.getElementById('userViewModal')).show();
        }
      });

      // Save user
      $('#save-user').on('click', saveUserEdits);

      // Posts buttons
      $('#addPostBtn').on('click', openAddPost);
      $('#addUserBtn').on('click', openAddUser);
      $('#posts-list').on('click', '.btn-edit-post', function(){ openEditPost($(this).data('id')); });
      $('#posts-list').on('click', '.btn-delete-post', function(){ deletePost($(this).data('id')); });
      $('#posts-list').on('click', '.btn-comments', function(){ viewComments($(this).data('id')); });
      $('#save-post').on('click', savePost);

      // Posts search live
      $('#posts-search').on('input', function(){ renderPosts($(this).val()); });

      // initial page
      showPage('dashboard');

      // fetch data
      fetchAll();
    });

    function showPage(page){
      $('#page-dashboard,#page-users,#page-posts').hide();
      if(page === 'dashboard') $('#page-dashboard').show();
      if(page === 'users') $('#page-users').show();
      if(page === 'posts') $('#page-posts').show();
    }