const testLogin = async () => {
  try {
    const response = await fetch(
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

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Response:", data);

  } catch (error) {
    console.log("Error:", error);
  }
};

testLogin();