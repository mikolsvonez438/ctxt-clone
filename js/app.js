document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("pasteForm");
  const content = document.getElementById("content");
  const charCount = document.getElementById("charCount");
  const errorMsg = document.getElementById("errorMsg");
  const submitBtn = document.getElementById("submitBtn");
  const spinner = document.getElementById("spinner");
  const btnText = document.getElementById("btnText");

  // Character counter
  content.addEventListener("input", function () {
    charCount.textContent = `${this.value.length} characters`;
    errorMsg.textContent = "";
  });

  // Form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const contentValue = content.value.trim();
    if (!contentValue) {
      errorMsg.textContent = "Please enter some content";
      return;
    }

    if (contentValue.length > 100000) {
      errorMsg.textContent = "Content too large (max 100KB)";
      return;
    }

    // Loading state
    submitBtn.disabled = true;
    spinner.classList.remove("d-none");
    btnText.textContent = "Creating...";

    try {
      const shortId = generateShortId();
      const expiresAt = getExpirationDate(
        document.getElementById("expiration").value,
      );

      const { error } = await supabase.from("pastes").insert({
        short_id: shortId,
        content: contentValue,
        title: document.getElementById("title").value.trim() || null,
        language: document.getElementById("language").value,
        expires_at: expiresAt ? expiresAt.toISOString() : null,
      });

      if (error) throw error;

      // Redirect to new paste
      window.location.href = `paste.html?id=${shortId}`;
    } catch (err) {
      errorMsg.textContent = err.message || "Failed to create paste";
      submitBtn.disabled = false;
      spinner.classList.add("d-none");
      btnText.textContent = "Create Paste";
    }
  });
});
