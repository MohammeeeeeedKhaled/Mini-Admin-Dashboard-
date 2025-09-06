🌟 Mini Admin Dashboard

A lightweight Admin Dashboard built with HTML, CSS, Bootstrap 5, jQuery, DataTables, and Toastr, showcasing Users and Posts from the JSONPlaceholder API with local CRUD and favorite functionality.

🚀 Features

📊 Dashboard Overview:

Shows total number of Users, Posts, and Comments.

Combines API data with locally added/edited data.

👤 Users Management:

Display users in a DataTable with Bootstrap styling.

➕ Add / ✏️ Edit / 🗑 Delete users locally.

Mark users as ⭐ Favorites stored in LocalStorage.

🔍 View user details in a modal.

📝 Posts Management:

Display posts fetched from API + local posts.

➕ Add / ✏️ Edit / 🗑 Delete posts locally.

Live 🔎 search on post title/body.

View 💬 comments for each post fetched from API.

💾 Export / Import:

Export local data (users, favorites, posts) as JSON.

Import previously exported JSON to restore data.

🌙 Dark / Light Mode toggle for comfortable viewing.

🔔 Notifications using Toastr for actions like add, edit, delete, favorite, and errors.

✨ Animations with Animate.css for smooth transitions.

📚 Libraries / Dependencies

Bootstrap 5 – Responsive layout, cards, buttons, modals, navbars, tables.

jQuery – DOM manipulation, event handling, AJAX requests.

DataTables (Bootstrap 5 integration) – Interactive tables for Users.

Toastr – Toast notifications for success, warning, and error messages.

Animate.css – Smooth animations for page elements (fadeIn, zoomIn, slideInDown, etc.).

FontAwesome – Icons for buttons (edit, delete, view, star, etc.).

📂 File Structure
project/
│
├─ index.html         # Main HTML dashboard
├─ css/
│   └─ style.css      # Custom styling including dark mode
├─ JS/
│   └─ main.js        # Dashboard logic, API calls, local storage handling
├─ README.md          # Documentation

⚡ Getting Started

Clone / Download the project.

Open index.html in any modern browser (Chrome, Edge, Firefox).
No server setup is required because data is fetched from JSONPlaceholder and local storage.

Interacting with Dashboard:

🧭 Navigation: Use the navbar to switch between Dashboard, Users, and Posts.

👤 Users: Add / Edit / Delete users locally. Toggle ⭐ Favorites.

📝 Posts: Add / Edit / Delete posts locally. Live search with 🔎 input.

💾 Export / Import your local data using navbar buttons.

🌙 Dark / Light mode toggle with the moon icon.

📝 Notes

All local changes (added users/posts, favorites) are stored in LocalStorage.

The app is fully client-side and does not require a backend.

JSONPlaceholder API provides dummy data for Users, Posts, and Comments.

🖼 Screenshots
<img width="1366" height="651" alt="1" src="https://github.com/user-attachments/assets/786d31cf-7bcb-4661-a9e1-7f7594c1080e" />

<img width="1358" height="655" alt="2" src="https://github.com/user-attachments/assets/18bc0322-a1f4-44f4-be1d-850b6f24a5fb" />

<img width="1361" height="655" alt="3" src="https://github.com/user-attachments/assets/2b50ae25-493b-4817-a736-659bbd62cfda" />

<img width="1360" height="655" alt="4_1" src="https://github.com/user-attachments/assets/92981290-5f00-4184-b600-841f80f99fd0" />

<img width="1359" height="649" alt="5" src="https://github.com/user-attachments/assets/b98ff406-4a3b-4e17-9d30-cb8207a2a3af" />

<img width="1348" height="648" alt="6" src="https://github.com/user-attachments/assets/3a684a98-827a-4f9e-bb3c-81641907564c" />
<img width="1359" height="645" alt="7" src="https://github.com/user-attachments/assets/f98b2d7e-b656-4b09-8ef7-b6e535c461d6" />


📜 License

Open-source and free to use for learning or demo purposes.
