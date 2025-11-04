const API_BASE = "https://event-online-hub.vercel.app/";

// DOM elements
const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");
const otpSection = document.getElementById("otpSection");
const eventsSection = document.getElementById("eventsSectionA");
const createEventSection = document.getElementById("createEventSection");
const organizerEventsSection = document.getElementById("organizerEventsSection");
const adminPanelSection = document.getElementById("adminPanelSection");
const attendeePanelSection = document.getElementById("attendeePanelSection");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Toggle Login/Register
loginBtn.addEventListener("click", () => {
  loginSection.classList.remove("hidden");
  registerSection.classList.add("hidden");
});
registerBtn.addEventListener("click", () => {
  registerSection.classList.remove("hidden");
  loginSection.classList.add("hidden");
});

// Show sections based on role
function showSectionsByRole(role) {
  const roleLower = role.toLowerCase();
  loginSection.classList.add("hidden");
  registerSection.classList.add("hidden");
  otpSection.classList.add("hidden");
  logoutBtn.classList.remove("hidden");

  if (role) {
    loginBtn.classList.add("hidden");
    registerBtn.classList.add("hidden");
  }

  // Hide all panels first
  createEventSection.classList.add("hidden");
  organizerEventsSection.classList.add("hidden");
  adminPanelSection.classList.add("hidden");
  attendeePanelSection.classList.add("hidden");

  if (roleLower === "admin") {
    // Admin sees all panels but not the create form automatically
    adminPanelSection.classList.remove("hidden");
    organizerEventsSection.classList.add("hidden");
    attendeePanelSection.classList.add("hidden");
    // createEventSection stays hidden until clicked
  } else if (roleLower === "organizer") {
    organizerEventsSection.classList.remove("hidden");
  } else if (roleLower === "attendee") {
    attendeePanelSection.classList.remove("hidden");
  }
}



// Check if already logged in
let token = localStorage.getItem("token");
let user = JSON.parse(localStorage.getItem("user"));
if (token && user) {
  showSectionsByRole(user.role);
}

// LOGIN
document.getElementById("submitLogin").addEventListener("click", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const messageBox = document.getElementById("loginMessage");

  // 1️⃣ Validate before sending to backend
  if (!username && !password) {
    messageBox.textContent = "⚠️ Please enter your username and password.";
    messageBox.style.color = "red";
    return;
  }
  if (!username) {
    messageBox.textContent = "⚠️ Please enter your username.";
    messageBox.style.color = "red";
    return;
  }
  if (!password) {
    messageBox.textContent = "⚠️ Please enter your password.";
    messageBox.style.color = "red";
    return;
  }

  // 2️⃣ Send login request
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();


    // 3️⃣ Handle responses
    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      const userRole = data.user.role.toLowerCase();
      showSectionsByRole(userRole);
      messageBox.textContent = "✅ Login successful!";
      messageBox.style.color = "green";
      setTimeout(async () => {
        if (userRole === "organizer" || userRole === "admin" || userRole === "attendee") {
          const token = localStorage.getItem("token");
          await fetch(`${API_BASE}/users/${userRole}/events`, {
            headers: { Authorization: `Bearer ${token}` },
          });

        }
      }, 500);
    } else {
      // Check for backend error messages
      if (data.message?.toLowerCase().includes("password")) {
        messageBox.textContent = "❌ Incorrect password. Please try again.";
      } else if (data.message?.toLowerCase().includes("username")) {
        messageBox.textContent = "❌ Username not found. Please check your spelling or register first.";
      } else {
        messageBox.textContent = data.message || "❌ Login failed. Please try again.";
      }
      messageBox.style.color = "red";
    }
  } catch (error) {
    // 4️⃣ Handle network or unexpected errors
    console.error("Login error:", error);
    messageBox.textContent = "⚠️ Something went wrong. Please check your internet connection and try again.";
    messageBox.style.color = "red";
  }
});


// REGISTER + OTP
document.getElementById("submitRegister").addEventListener("click", async () => {
  const username = document.getElementById("regUsername").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const role = document.getElementById("regRole").value;

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, role }),
  });

  const data = await res.json();
  const msg = document.getElementById("registerMessage");
  if (res.ok) {
    msg.textContent = "✅ Registration successful! OTP sent to your email.";
    msg.style.color = "green";
    registerSection.classList.add("hidden");
    otpSection.classList.remove("hidden");
    localStorage.setItem("email", username);
  } else {
    msg.textContent = data.message || "❌ Registration failed.";
    msg.style.color = "red";
  }
});

// VERIFY OTP
document.getElementById("verifyOtpBtn").addEventListener("click", async () => {
  const otp = document.getElementById("otp").value.trim();
  const username = localStorage.getItem("email");

  if (!otp) return alert("Please enter OTP");

  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, otp }),
  });

  const data = await res.json();
  if (res.ok) {
    alert("✅ OTP verified! You can now login.");
    otpSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
    localStorage.removeItem("email");
  } else {
    alert(data.message || "❌ Invalid OTP");
  }
});

// Frontend logout button
document.getElementById("logoutBtn").addEventListener("click", async () => {
  const token = localStorage.getItem("token");

  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (err) {
    console.error("Logout request failed:", err);
  }

  // ✅ Always remove token client-side
  localStorage.removeItem("token");
  window.location.reload();
});




// SHOW CREATE EVENT FORM (Organizer)
document.getElementById("showCreateEventBtn")?.addEventListener("click", () => {
  createEventSection.classList.toggle("hidden");
});

// CREATE EVENT
document.getElementById("createEventBtn")?.addEventListener("click", async () => {
  const token = localStorage.getItem("token"); // ✅ always get latest token

  if (!token) {
    document.getElementById("eventMessage").textContent =
      "❌ Unauthorized. Please log in again.";
    return;
  }

  const eventData = {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    date: document.getElementById("date").value.trim(),
    location: document.getElementById("location").value.trim(),
    category: document.getElementById("category").value.trim(),
    capacity: document.getElementById("capacity").value.trim(),
  };

  // 🧠 Validate fields before sending
  if (
    !eventData.title ||
    !eventData.description ||
    !eventData.date ||
    !eventData.location ||
    !eventData.category ||
    !eventData.capacity
  ) {
    document.getElementById("eventMessage").textContent =
      "⚠️ Please fill in all fields before creating the event.";
    document.getElementById("eventMessage").style.color = "red";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/organizer/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });

    const data = await res.json();

    if (res.status === 401) {
      document.getElementById("eventMessage").textContent =
        "❌ Session expired. Please log in again.";
      document.getElementById("eventMessage").style.color = "red";
      localStorage.removeItem("token");
      setTimeout(() => location.reload(), 2000);
    } else if (res.ok) {
      document.getElementById("eventMessage").textContent =
        "✅ Event created successfully!";
      document.getElementById("eventMessage").style.color = "green";

      // Clear form after success
      document.querySelectorAll("#createEventSection input").forEach((input) => {
        input.value = "";
      });
    } else {
      document.getElementById("eventMessage").textContent =
        data.message || "❌ Failed to create event.";
      document.getElementById("eventMessage").style.color = "red";
    }
  } catch (error) {
    document.getElementById("eventMessage").textContent =
      "⚠️ Something went wrong. Please try again.";
    document.getElementById("eventMessage").style.color = "red";
  }
});




// ✅ ADMIN: GET ALL EVENTS
document.getElementById("AllEventsBtn")?.addEventListener("click", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("⚠️ Please log in first.");
    return;
  }

  try {
    console.log("📡 Sending request with token:", token);

    const res = await fetch(`${API_BASE}/users/admin/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("📩 Response status:", res.status);

    const data = await res.json();
    console.log("🧾 Full response:", data);


    // ✅ Make sure the container exists BEFORE using it
    const eventsList = document.getElementById("eventList");
    if (!eventsList) {
      alert("Cannot find element with id='eventList' in your HTML.");
      return;
    }

    eventsList.innerHTML = "";

    // ✅ Handle errors gracefully
    if (!res.ok) {
      eventsList.innerHTML = `<p>❌ ${data.message || "Failed to fetch events."}</p>`;
      return;
    }

    // ✅ Normalize the event data
    const events = data.data;

    if (Array.isArray(events) && events.length > 0) {
      events.map(ev => {
        const div = document.createElement("div");
        div.innerHTML = `
          <strong>${ev.title}</strong><br>
          📍 ${ev.location || "Unknown location"}<br>
          🗓️ ${ev.date || "No date"}<br><hr>
        `;
        eventList.appendChild(div);
      });
    } else {
      eventList.innerHTML = `<p>${data.message || "No events found."}</p>`;
    }

  } catch (err) {
    console.error("💥 Network error:", err);
    alert("Network error while fetching events.");
  }
});





// ADMIN: GET ALL USERS
document.getElementById("getAllUsersBtn")?.addEventListener("click", async () => {
  const token = localStorage.getItem("token"); // ✅ make sure you always get token fresh

  if (!token) {
    alert("⚠️ Please log in first.");
    return;
  }

  try {
    console.log("📡 Sending request with token:", token);

    const res = await fetch(`${API_BASE}/users/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("📩 Response status:", res.status);

    const data = await res.json();
    console.log("🧾 Full response:", data);


    const users = data.data
    const usersList = document.getElementById("getUsersList");
    usersList.innerHTML = "";

    if (!res.ok) {
      usersList.innerHTML = `<p>❌ ${data.message || "Failed to fetch users."}</p>`;
      return;
    }

    if (Array.isArray(users) && users.length > 0) {
      console.log("✅ Users fetched:", users);
      users.map(user => {
        const div = document.createElement("div");
        div.innerHTML = `${user.username} (${user.role})`;
        usersList.appendChild(div);
      });
      document.getElementById("usersSection").classList.remove("hidden");
    } else {
      usersList.innerHTML = `<p>${data.message || "No users found."}</p>`;
    }

  } catch (err) {
    console.error("💥 Network error:", err);
    alert("Network error while fetching users.");
  }
});


/// 🟢 ATTENDEE: VIEW ALL EVENTS
document.getElementById("getAttendeeEventsBtn")?.addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Unauthorized: Please log in again.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/attendee/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert(errorData.message || "Failed to fetch events. Please try again.");
      return;
    }

    const data = await res.json();
    const list = document.getElementById("attendeeEventList");
    list.innerHTML = "";

    if (Array.isArray(data.events) && data.events.length > 0) {
      data.events.forEach(ev => {
        const div = document.createElement("div");
        div.innerHTML = `
          <strong>${ev.title}</strong><br>
          ${ev.location} | ${ev.date}
          <button class="registerBtn" data-id="${ev.title}">Register</button>
          <button class="cancelBtn" data-id="${ev.title}">Cancel</button>
        `;
        list.appendChild(div);
      });

      // 🟢 Add one-time event listener for register/cancel actions
      list.onclick = async (e) => {
        const registerBtn = e.target.closest(".registerBtn");
        const cancelBtn = e.target.closest(".cancelBtn");
        const token = localStorage.getItem("token");

        if (!token) {
          alert("Please login first.");
          return;
        }

        try {
          if (registerBtn) {
            const eventTitle = registerBtn.getAttribute("data-id");
            console.log("Registering for event:", eventTitle);

            const res = await fetch(`${API_BASE}/users/attendee/events/${encodeURIComponent(eventTitle)}/register`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (res.ok) {
              alert(data.message || "✅ Registered successfully!");
              registerBtn.disabled = true;
              registerBtn.textContent = "Registered";
            } else {
              alert(data.message || "❌ Failed to register.");
            }
          }

          if (cancelBtn) {
            const eventTitle = cancelBtn.getAttribute("data-id");
            console.log("Cancelling registration for:", eventTitle);

            const res = await fetch(`${API_BASE}/users/attendee/events/${encodeURIComponent(eventTitle)}/cancel`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (res.ok) {
              alert(data.message || "✅ Registration cancelled!");
              cancelBtn.disabled = true;
              cancelBtn.textContent = "Cancelled";
            } else {
              alert(data.message || "❌ Failed to cancel.");
            }
          }
        } catch (err) {
          console.error("Register/cancel error:", err);
          alert("Network error while processing request.");
        }
      };
    } else {
      list.innerHTML = "<p>No events found.</p>";
    }

  } catch (err) {
    console.error("Error fetching events:", err);
    alert("Network error while loading events.");
  }
});



// 🟢 ATTENDEE: VIEW MY ENROLLED EVENTS
document.getElementById("getEnrolledEventsBtn")?.addEventListener("click", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("⚠️ Please log in first.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/attendee/myevents`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store", // prevent stale data
    });

    console.log("📡 Response status:", res.status);

    if (!res.ok) {
      const errData = await res.json();
      console.error("❌ Error response:", errData);
      alert(errData.message || "Failed to load events.");
      return;
    }

    const data = await res.json();
    console.log("✅ My Events:", data);

    const list = document.getElementById("attendeeEventList");
    list.innerHTML = "";

    if (Array.isArray(data.events) && data.events.length > 0) {
      data.events.forEach(ev => {
        const div = document.createElement("div");
        div.innerHTML = `
          <strong>${ev.title}</strong><br>
          ${ev.location} | ${ev.date}
        `;
        list.appendChild(div);
      });
    } else {
      list.innerHTML = "<p>No enrolled events found.</p>";
    }

  } catch (err) {
    console.error("💥 Network error:", err);
    alert("Network error while fetching your events.");
  }
});







// ORGANIZER: GET MY EVENTS (with Update/Delete)
document.getElementById("getOrganizerEventsBtn")?.addEventListener("click", async () => {
  const token = localStorage.getItem("token"); // ✅ Get the latest token each time
  if (!token) {
    alert("Unauthorized: Please log in again.");
    return;
  }

  const res = await fetch(`${API_BASE}/users/organizer/events`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  const list = document.getElementById("organizerEventList");
  list.innerHTML = "";

  if (Array.isArray(data.events) && data.events.length > 0) {
    data.events.forEach(ev => {
      const div = document.createElement("div");
      div.innerHTML = `
        <strong>${ev.title}</strong><br>
        ${ev.location} | ${ev.date}<br>
        <button class="updateEventBtn" data-id="${ev.title}">Update</button>
        <button class="deleteEventBtn" data-title="${ev.title}">Delete</button>
      `;
      list.appendChild(div);
    });



    // Delete Event
    document.querySelectorAll(".deleteEventBtn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const eventTitle = btn.getAttribute("data-title");

        if (!eventTitle) {
          alert("Error: missing event title — cannot delete.");
          return;
        }

        if (!confirm(`Are you sure you want to delete the event "${eventTitle}"?`)) return;

        try {
          const res = await fetch(`${API_BASE}/users/organizer/events/${encodeURIComponent(eventTitle)}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = await res.json();

          if (res.ok) {
            alert(data.message || `Event "${eventTitle}" deleted successfully.`);
            btn.parentElement.remove();
          } else {
            alert(data.message || "Failed to delete the event. Please try again.");
          }
        } catch (err) {
          console.error("Error deleting event:", err);
          alert("Something went wrong while deleting the event. Please check the console for details.");
        }
      });
    });


    // Update Event
    document.querySelectorAll(".updateEventBtn").forEach(btn => {
      btn.addEventListener("click", () => {
        const eventTitle = btn.getAttribute("data-id");
        const event = data.events.find(e => e.title === eventTitle);
        const oldTitle = event.title; // ✅ Save the old title for the backend route

        const originalEvent = { ...event }; // clone event object

        // Prefill form
        createEventSection.classList.remove("hidden");
        document.getElementById("title").value = event.title;
        document.getElementById("description").value = event.description;
        document.getElementById("date").value = event.date;
        document.getElementById("location").value = event.location;
        document.getElementById("category").value = event.category;
        document.getElementById("capacity").value = event.capacity;

        const createBtn = document.getElementById("createEventBtn");
        createBtn.textContent = "Update Event";

        // inside your update click handler (replace existing newHandler)
        const newHandler = async (ev) => {
          ev.preventDefault();

          const token = localStorage.getItem("token");
          if (!token) {
            alert("Unauthorized: please login again.");
            return;
          }

          // Collect updated fields
          const updatedEvent = {
            description: document.getElementById("description").value,
            date: document.getElementById("date").value,
            location: document.getElementById("location").value,
            category: document.getElementById("category").value,
            capacity: document.getElementById("capacity").value,
          };

          // Simple validation
          const noChanges =
            updatedEvent.description === originalEvent.description &&
            updatedEvent.date === originalEvent.date &&
            updatedEvent.location === originalEvent.location &&
            updatedEvent.category === originalEvent.category &&
            updatedEvent.capacity == originalEvent.capacity; // == to handle number/string diff

          if (noChanges) {
            alert("You haven’t changed anything. Please update at least one field before saving.");
            return;
          }

          try {
            console.log("Updating event (oldTitle):", oldTitle);

            const url = `${API_BASE}/users/organizer/events/${encodeURIComponent(oldTitle)}`;
            console.log("PUT url:", url);

            const res = await fetch(url, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(updatedEvent),
            });

            // ✅ Read body only once
            const text = await res.text();
            let data;
            try {
              data = JSON.parse(text);
            } catch {
              data = { message: "Invalid or non-JSON response", raw: text };
            }

            console.log("Response status:", res.status);
            console.log("Response body:", data);

            if (res.ok) {
              alert(data.message || "Event updated successfully.");
              createBtn.textContent = "Create Event";
              createEventSection.classList.add("hidden");

              // refresh events list
              document.getElementById("getOrganizerEventsBtn").click();
            } else {
              if (res.status === 400) {
                alert(data.message || "Bad request.");
              } else if (res.status === 401) {
                alert("Unauthorized — session expired. Please log in again.");
                localStorage.removeItem("token");
                setTimeout(() => location.reload(), 1000);
              } else if (res.status === 404) {
                alert(data.message || "Event not found or you don't have permission.");
              } else {
                alert(
                  data.message ||
                  `Update failed (status ${res.status}). Check console for details.`
                );
              }
            }
          } catch (err) {
            console.error("Network or unexpected error while updating event:", err);
            alert("Something went wrong while updating the event. Check the console for details.");
          } finally {
            // remove handler after done
            createBtn.removeEventListener("click", newHandler);
          }
        };

        // Remove old click listeners to prevent multiple calls
        const newBtn = createBtn.cloneNode(true);
        createBtn.parentNode.replaceChild(newBtn, createBtn);
        newBtn.addEventListener("click", newHandler);
      });
    });

  } else {
    list.innerHTML = `<p>${data.message || "No events found."}</p>`;
  }
});


// 🔄 Auto-login & reload saved session
window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token) return;

  try {
    showSectionsByRole(user.role);
  } catch (err) {
    console.error("Error restoring session:", err);
    localStorage.removeItem("token");
  }

});
