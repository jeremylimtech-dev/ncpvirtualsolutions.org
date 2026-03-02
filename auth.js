/* ======================================================
   GLOBAL CONFIG
====================================================== */

const SCRIPT_URL =
  "YOUR_WEB_APP_URL_HERE"; // <-- replace with your deployed Apps Script URL

/* ======================================================
   AUTH CHECK (USE ON ALL PROTECTED PAGES)
====================================================== */

function requireAuth() {

  const token = localStorage.getItem("employeeToken");
  const employee = localStorage.getItem("employeeData");

  if (!token || !employee) {
    window.location.replace("employee-login.html");
    return false;
  }

  preventBackNavigation();
  preventPageCache();

  return true;
}

/* ======================================================
   LOGOUT
====================================================== */

function logoutEmployee() {

  localStorage.removeItem("employeeToken");
  localStorage.removeItem("employeeData");

  window.location.replace("employee-login.html");
}

/* ======================================================
   PREVENT BACK BUTTON
====================================================== */

function preventBackNavigation() {

  if (window.history && window.history.pushState) {
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };
  }
}

/* ======================================================
   PREVENT CACHED PAGES
====================================================== */

function preventPageCache() {

  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      window.location.reload();
    }
  });
}

/* ======================================================
   SECURE FETCH WRAPPER
====================================================== */

async function securePost(action, payload = {}) {

  const token = localStorage.getItem("employeeToken");

  if (!token) {
    logoutEmployee();
    return null;
  }

  try {

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action,
        idToken: token,
        ...payload
      })
    });

    const data = await response.json();

    if (!data.success) {
      if (data.message === "Invalid session") {
        logoutEmployee();
      }
    }

    return data;

  } catch (err) {
    console.error("SecurePost Error:", err);
    return { success: false };
  }
}

/* ======================================================
   GET EMPLOYEE DATA HELPER
====================================================== */

function getEmployee() {
  return JSON.parse(localStorage.getItem("employeeData") || "{}");
}

/* ======================================================
   AUTO INIT PROFILE HEADER
====================================================== */

function initEmployeeProfile() {

  const employee = getEmployee();
  if (!employee.name) return;

  const nameEl = document.getElementById("employeeName");
  const emailEl = document.getElementById("employeeEmail");
  const avatarEl = document.getElementById("profileInitials");

  if (nameEl) nameEl.innerText = employee.name;
  if (emailEl) emailEl.innerText = employee.email;

  if (avatarEl) {
    const initials = employee.name
      .split(" ")
      .map(w => w[0])
      .join("")
      .toUpperCase();

    avatarEl.innerText = initials;
  }
}