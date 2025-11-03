export async function loadfootbar() {
  try {
    const navbarContainer = document.getElementById("footbar");
    if (!navbarContainer) return;

    const response = await fetch("public/partials/footer.html");
    if (!response.ok) throw new Error("Failed to load footbar");

    const html = await response.text();
    navbarContainer.innerHTML = html;
  } catch (err) {
    console.error("footbar load error:", err);
  }
}
