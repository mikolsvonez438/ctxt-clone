document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const shortId = urlParams.get("id");

  if (!shortId) {
    showError("No paste ID provided");
    return;
  }

  const pasteTitle = document.getElementById("pasteTitle");
  const pasteDate = document.getElementById("pasteDate");
  const viewCount = document.getElementById("viewCount");
  const langBadge = document.getElementById("langBadge");
  const expiresBadge = document.getElementById("expiresBadge");
  const pasteContent = document.getElementById("pasteContent");
  const shareUrl = document.getElementById("shareUrl");
  const rawBtn = document.getElementById("rawBtn");
  const copyBtn = document.getElementById("copyBtn");
  const deleteBtn = document.getElementById("deleteBtn");

  let currentPaste = null;
  let isRaw = false;

  try {
    // Fetch paste
    const { data: paste, error } = await supabase
      .from("pastes")
      .select("*")
      .eq("short_id", shortId)
      .single();

    if (error || !paste) {
      showError("Paste not found or expired");
      return;
    }

    // Check expiration
    if (paste.expires_at && new Date(paste.expires_at) < new Date()) {
      await supabase.from("pastes").delete().eq("id", paste.id);
      showError("This paste has expired");
      return;
    }

    currentPaste = paste;

    // Update view count
    await supabase
      .from("pastes")
      .update({ view_count: (paste.view_count || 0) + 1 })
      .eq("id", paste.id);

    // Display
    pasteTitle.textContent = paste.title || "Untitled Paste";
    pasteDate.textContent = formatDate(paste.created_at);
    viewCount.textContent = (paste.view_count || 0) + 1;
    langBadge.textContent = paste.language;
    shareUrl.textContent = `${window.location.origin}/paste.html?id=${shortId}`;

    if (paste.expires_at) {
      expiresBadge.textContent = `Expires ${formatDate(paste.expires_at)}`;
    }

    renderContent();
  } catch (err) {
    showError("Failed to load paste");
  }

  function renderContent() {
    if (!currentPaste) return;

    const content = escapeHtml(currentPaste.content);

    if (isRaw) {
      pasteContent.innerHTML = `<pre class="raw">${content}</pre>`;
    } else if (currentPaste.language === "text") {
      pasteContent.innerHTML = `<pre>${content}</pre>`;
    } else {
      pasteContent.innerHTML = `<pre><code class="language-${currentPaste.language}">${content}</code></pre>`;
      Prism.highlightAll();
    }
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function showError(msg) {
    document.querySelector(".container").innerHTML = `
            <div class="text-center py-5">
                <div class="display-1 text-secondary mb-3">404</div>
                <h3>${msg}</h3>
                <a href="index.html" class="btn btn-light mt-3">Create New Paste</a>
            </div>
        `;
  }

  // Button handlers
  rawBtn.addEventListener("click", function () {
    isRaw = !isRaw;
    rawBtn.textContent = isRaw ? "Formatted" : "Raw";
    renderContent();
  });

  copyBtn.addEventListener("click", async function () {
    if (!currentPaste) return;
    await navigator.clipboard.writeText(currentPaste.content);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
  });

  deleteBtn.addEventListener("click", async function () {
    if (!currentPaste || !confirm("Delete this paste?")) return;

    const { error } = await supabase
      .from("pastes")
      .delete()
      .eq("id", currentPaste.id);

    if (!error) {
      window.location.href = "index.html";
    }
  });
});
