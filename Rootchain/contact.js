document.getElementById("contact-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const fullname = document.getElementById("fullname").value;
    const email = document.getElementById("email").value;
    const mobileNumber = document.getElementById("mobileNumber").value;
    const emailSubject = document.getElementById("emailSubject").value;
    const message = document.getElementById("message").value;

    try {
        const response = await fetch("http://localhost:3000/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullname, email, mobileNumber, emailSubject, message })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Message sent successfully!");
            document.getElementById("contact-form").reset();
        } else {
            alert(data.error || "Failed to send message.");
        }
    } catch (error) {
        console.error("Error submitting contact form:", error);
        alert("An error occurred. Please try again.");
    }
});
