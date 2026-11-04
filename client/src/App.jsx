
import { useState, useEffect } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [page, setPage] = useState("home");

  // User details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [password, setPassword] = useState("");

  // Messages
  const [message, setMessage] = useState("");

  // Vaccine form details
  const [vaccineName, setVaccineName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [doseNumber, setDoseNumber] = useState("1");
  const [notes, setNotes] = useState("");

  // Vaccine list
  const [vaccines, setVaccines] = useState([]);
  const [loadingVaccines, setLoadingVaccines] = useState(false);
  const [profilePhone, setProfilePhone] = useState("");
  const [profileWhatsAppOptIn, setProfileWhatsAppOptIn] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [whatsappTestSending, setWhatsappTestSending] = useState(false);

  // Editing vaccine ID
  const [editingId, setEditingId] = useState(null);
  
// Dashboard statistics
const today = new Date();
today.setHours(0, 0, 0, 0);

const upcomingVaccines = vaccines.filter((vaccine) => {
  const date = new Date(vaccine.dueDate);
  date.setHours(0, 0, 0, 0);

  const daysLeft = Math.ceil(
    (date - today) / (1000 * 60 * 60 * 24)
  );

  return daysLeft >= 0 && daysLeft <= 7;
});

const overdueVaccines = vaccines.filter((vaccine) => {
  const date = new Date(vaccine.dueDate);
  date.setHours(0, 0, 0, 0);

  return date < today;
});


  // LOGIN AND REGISTRATION
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Please wait...");

    const endpoint =
      page === "register" ? "register" : "login";

    const body =
      page === "register"
        ? { name, email, password, phone, whatsappOptIn }
        : { email, password };

    try {
      const response = await fetch(
        `${API_URL}/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Something went wrong.");
        return;
      }

      if (page === "login") {
        localStorage.setItem("token", data.token);
        setMessage("");
        setPage("dashboard");
      } else {
        setMessage("Registration successful! Please log in.");
        setPage("login");
      }
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to server.");
    }
  };

  // LOAD VACCINES
  const fetchVaccines = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    setLoadingVaccines(true);

    try {
      const response = await fetch(
        `${API_URL}/api/vaccines`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not load vaccines.");
        return;
      }

      setVaccines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to load vaccines.");
    } finally {
      setLoadingVaccines(false);
    }
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) {
        setProfileMessage(data.message || "Could not load your profile.");
        return;
      }

      setProfilePhone(data.phone || "");
      setProfileWhatsAppOptIn(Boolean(data.whatsappOptIn));
    } catch (error) {
      console.error(error);
      setProfileMessage("Could not connect to load your profile.");
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: profilePhone,
          whatsappOptIn: profileWhatsAppOptIn
        })
      });
      const data = await response.json();

      if (!response.ok) {
        setProfileMessage(data.message || "Could not save your profile.");
        return;
      }

      setProfilePhone(data.phone || "");
      setProfileWhatsAppOptIn(Boolean(data.whatsappOptIn));
      setProfileMessage("WhatsApp reminder settings saved.");
    } catch (error) {
      console.error(error);
      setProfileMessage("Could not connect to save your profile.");
    }
  };

  const handleWhatsAppTest = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setProfileMessage("Please log in again.");
      setPage("login");
      return;
    }

    setWhatsappTestSending(true);
    setProfileMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/reminders/test-whatsapp`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setProfileMessage(
        data.message ||
          (response.ok
            ? "WhatsApp test reminder sent."
            : "Could not send WhatsApp test reminder.")
      );
    } catch (error) {
      console.error(error);
      setProfileMessage("Could not connect to send a WhatsApp test.");
    } finally {
      setWhatsappTestSending(false);
    }
  };

  // LOAD VACCINES WHEN DASHBOARD OPENS
  useEffect(() => {
    if (page === "dashboard") {
      fetchVaccines();
      fetchProfile();
    }
  }, [page]);

  // ADD OR UPDATE VACCINE
  const handleAddVaccine = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please log in again.");
      setPage("login");
      return;
    }

    setMessage(
      editingId ? "Updating vaccine..." : "Saving vaccine..."
    );

    try {
      const url = editingId
        ? `${API_URL}/api/vaccines/${editingId}`
        : `${API_URL}/api/vaccines`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          vaccineName,
          dueDate,
          doseNumber: Number(doseNumber),
          notes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not save vaccine.");
        return;
      }

      setMessage(
        editingId
          ? "Vaccine updated successfully!"
          : "Vaccine added successfully!"
      );

      clearForm();
      await fetchVaccines();

    } catch (error) {
      console.error(error);
      setMessage("Could not connect to server.");
    }
  };

  // CLEAR VACCINE FORM
  const clearForm = () => {
    setVaccineName("");
    setDueDate("");
    setDoseNumber("1");
    setNotes("");
    setEditingId(null);
  };

  // EDIT VACCINE
  const handleEdit = (vaccine) => {
    setEditingId(vaccine._id);
    setVaccineName(vaccine.vaccineName);
    setDueDate(
      new Date(vaccine.dueDate).toISOString().split("T")[0]
    );
    setDoseNumber(String(vaccine.doseNumber));
    setNotes(vaccine.notes || "");

    setMessage("Edit the details and click Update Vaccine.");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // DELETE VACCINE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this vaccine?"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/api/vaccines/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not delete vaccine.");
        return;
      }

      setMessage("Vaccine deleted successfully!");

      if (editingId === id) {
        clearForm();
      }

      await fetchVaccines();

    } catch (error) {
      console.error(error);
      setMessage("Could not connect to server.");
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    setVaccines([]);
    clearForm();
    setMessage("");
    setPage("home");
  };

  return (
    <div className="app">

      {/* NAVIGATION */}
      <nav className="navbar">
        <h2>💉 E-Vaccine Reminder</h2>

        <div>
          <button onClick={() => setPage("home")}>
            Home
          </button>

          {!localStorage.getItem("token") && (
            <>
              <button onClick={() => {
                setMessage("");
                setPage("login");
              }}>
                Login
              </button>

              <button onClick={() => {
                setMessage("");
                setPage("register");
              }}>
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      {/* HOME PAGE */}
      {page === "home" && (
        <>
          <section className="hero">
            <h1>Protect Your Family, Stay Vaccinated!</h1>

            <p>
              Keep track of vaccination dates and never miss an
              important vaccine with our E-Vaccine Reminder system.
            </p>

            <button onClick={() => setPage("register")}>
              Get Started
            </button>
          </section>

          <section className="features">
            <h2>Our Features</h2>

            <div className="feature-list">

              <div className="feature-card">
                <h3>📅 Vaccine Tracking</h3>
                <p>Manage vaccination schedules in one place.</p>
              </div>

              <div className="feature-card">
                <h3>📧 Email Reminders</h3>
                <p>Receive reminders before vaccine due dates.</p>
              </div>

              <div className="feature-card">
                <h3>📱 WhatsApp Alerts</h3>
                <p>Get timely vaccination notifications.</p>
              </div>

            </div>
          </section>
        </>
      )}

      {/* LOGIN AND REGISTRATION */}
      {(page === "login" || page === "register") && (
        <section className="login">

          <h2>
            {page === "login"
              ? "Welcome Back!"
              : "Create Account"}
          </h2>

          <form onSubmit={handleSubmit}>

            {page === "register" && (
              <>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <input
                  type="tel"
                  placeholder="WhatsApp number (with country code)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required={whatsappOptIn}
                />
                <label className="consent-option">
                  <input
                    type="checkbox"
                    checked={whatsappOptIn}
                    onChange={(e) => setWhatsappOptIn(e.target.checked)}
                  />
                  I agree to receive vaccine reminders on WhatsApp.
                </label>
              </>
            )}

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">
              {page === "login" ? "Login" : "Register"}
            </button>

          </form>

          <p>{message}</p>

          <p>
            {page === "login"
              ? "Don't have an account?"
              : "Already have an account?"}

            <button onClick={() => {
              setMessage("");
              setPage(
                page === "login" ? "register" : "login"
              );
            }}>
              {page === "login" ? " Register" : " Login"}
            </button>
          </p>

        </section>
      )}

      {/* DASHBOARD */}
      {page === "dashboard" && (
        <section className="features dashboard">

          <h1>Welcome to Your Dashboard!</h1>

          <p>Manage your vaccination schedule here.</p>

          <div className="feature-card reminder-settings">
            <h2>WhatsApp Reminder Settings</h2>
            <p>
              Enter your number in international format, for example +14155552671.
              Reminders are sent 3 days and 2 days before a vaccine is due.
            </p>
            <form onSubmit={handleProfileSave}>
              <label htmlFor="profile-phone">WhatsApp phone number</label>
              <input
                id="profile-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+14155552671"
                value={profilePhone}
                onChange={(event) => setProfilePhone(event.target.value)}
                required={profileWhatsAppOptIn}
              />
              <label className="consent-option">
                <input
                  type="checkbox"
                  checked={profileWhatsAppOptIn}
                  onChange={(event) =>
                    setProfileWhatsAppOptIn(event.target.checked)
                  }
                />
                I agree to receive vaccine reminders on WhatsApp.
              </label>
              <button type="submit">Save reminder settings</button>
            </form>
            <button
              type="button"
              onClick={handleWhatsAppTest}
              disabled={whatsappTestSending}
            >
              {whatsappTestSending ? "Sending test..." : "Send WhatsApp test"}
            </button>
            <p className="status-message" role="status" aria-live="polite">
              {profileMessage}
            </p>
          </div>
          
{/* DASHBOARD STATISTICS */}
<div className="feature-list">

  <div className="feature-card">
    <h2>📋 Total Vaccines</h2>
    <h1>{vaccines.length}</h1>
  </div>

  <div className="feature-card">
    <h2>📅 Upcoming Vaccines</h2>
    <h1>{upcomingVaccines.length}</h1>
  </div>

  <div className="feature-card">
    <h2>⚠️ Overdue Vaccines</h2>
    <h1>{overdueVaccines.length}</h1>
  </div>

</div>


          {/* ADD OR EDIT VACCINE FORM */}
          <div className="feature-card">

            <h2>
              {editingId ? "✏️ Edit Vaccine" : "➕ Add New Vaccine"}
            </h2>

            <form onSubmit={handleAddVaccine}>

              <input
                type="text"
                placeholder="Enter vaccine name"
                value={vaccineName}
                onChange={(e) => setVaccineName(e.target.value)}
                required
              />

              <label>Vaccine Due Date</label>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />

              <label>Dose Number</label>

              <input
                type="number"
                min="1"
                value={doseNumber}
                onChange={(e) => setDoseNumber(e.target.value)}
                required
              />

              <textarea
                placeholder="Enter notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <button type="submit">
                {editingId ? "Update Vaccine" : "Save Vaccine"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    clearForm();
                    setMessage("");
                  }}
                >
                  Cancel Edit
                </button>
              )}

            </form>
          </div>

          <p>{message}</p>

          {/* DISPLAY VACCINES */}
          <div className="feature-card">

            <h2>📋 My Vaccines</h2>
            
{/* UPCOMING VACCINES */}
<div className="feature-card">

  <h2>🔔 Upcoming Vaccines (Next 7 Days)</h2>

  {upcomingVaccines.length === 0 ? (
    <p>No upcoming vaccines in the next 7 days.</p>
  ) : (
    upcomingVaccines.map((vaccine) => (
      <div key={vaccine._id}>
        <h3>{vaccine.vaccineName}</h3>
        <p>
          Due Date:{" "}
          {new Date(vaccine.dueDate).toLocaleDateString()}
        </p>
      </div>
    ))
  )}

</div>

{/* OVERDUE VACCINES */}
<div className="feature-card">

  <h2>⚠️ Overdue Vaccines</h2>

  {overdueVaccines.length === 0 ? (
    <p>No overdue vaccines.</p>
  ) : (
    overdueVaccines.map((vaccine) => (
      <div key={vaccine._id}>
        <h3>{vaccine.vaccineName}</h3>
        <p>
          Due Date:{" "}
          {new Date(vaccine.dueDate).toLocaleDateString()}
        </p>
      </div>
    ))
  )}

</div>



            {loadingVaccines ? (
              <p>Loading vaccines...</p>
            ) : vaccines.length === 0 ? (
              <p>
                No vaccines added yet. Add your first vaccine above!
              </p>
            ) : (
              <div>

                {vaccines.map((vaccine) => (
                  <div
                    className="feature-card"
                    key={vaccine._id}
                  >

                    <h3>{vaccine.vaccineName}</h3>

                    <p>
                      <strong>Due Date:</strong>{" "}
                      {new Date(
                        vaccine.dueDate
                      ).toLocaleDateString()}
                    </p>

                    <p>
                      <strong>Dose Number:</strong>{" "}
                      {vaccine.doseNumber}
                    </p>

                    <p>
                      <strong>Notes:</strong>{" "}
                      {vaccine.notes || "No notes"}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleEdit(vaccine)}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(vaccine._id)}
                    >
                      🗑️ Delete
                    </button>

                  </div>
                ))}

              </div>
            )}

          </div>

          <button onClick={handleLogout}>
            Logout
          </button>

        </section>
      )}

      {/* FOOTER */}
      <footer>
        <p>
          © 2026 E-Vaccine Reminder | Stay Healthy, Stay Safe
        </p>
      </footer>

    </div>
  );
}

export default App;
