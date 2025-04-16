document.addEventListener("DOMContentLoaded", function () {
    const userType = localStorage.getItem("user_type");
    const sessionId = localStorage.getItem("session_id");

    const tradeLink = document.querySelector('a[href="./Trade/Trade.html"]') || document.querySelector('a[href="../Trade/Trade.html"]');
    const uploadLink = document.querySelector('a[href="./Upload/Upload.html"]');
   
    if (!sessionId) {
      if (tradeLink) tradeLink.style.display = "none";
      if (uploadLink) uploadLink.style.display = "none";
      return;
    }

    if (userType === "seller") {
      if (tradeLink) tradeLink.style.display = "none";
    } else if (userType === "buyer") {
      if (uploadLink) uploadLink.style.display = "none";
    }
  });