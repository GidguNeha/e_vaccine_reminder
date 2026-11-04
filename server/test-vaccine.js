const testVaccine = async () => {
  try {
    // First, login to get the authentication token
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

    // Now add a vaccine
    const response = await fetch(
      "http://127.0.0.1:5000/api/vaccines",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          vaccineName: "Polio Vaccine",
          dueDate: "2026-11-10",
          doseNumber: 1,
          notes: "First dose"
        })
      }
    );

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Response:", data);

  } catch (error) {
    console.log("Error:", error);
  }
};

testVaccine();