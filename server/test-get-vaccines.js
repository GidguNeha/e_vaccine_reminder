const testGetVaccines = async () => {
  try {
    // Login first
    const loginResponse = await fetch(
      "http://127.0.0.1:5000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: "neha@example.com",
          password: "Neha12345"
        })
      }
    );

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Get all vaccines
    const response = await fetch(
      "http://127.0.0.1:5000/api/vaccines",
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Vaccines:", data);

  } catch (error) {
    console.log("Error:", error);
  }
};

testGetVaccines();