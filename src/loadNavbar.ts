export async function loadNavbar() {
  try {
    const navbarContainer = document.getElementById("navbar");
    if (!navbarContainer) return;

    const response = await fetch("/partials/navbar.html");
    if (!response.ok) throw new Error("Failed to load navbar");

    const html = await response.text();
    navbarContainer.innerHTML = html;
  } catch (err) {
    console.error("Navbar load error:", err);
  }
}

