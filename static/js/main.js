/* ============================
   Global Editor State
============================ */
let editorReady = false;

/* ============================
   Helper: Set Editor Content
============================ */
function setEditorData(html) {
  const editor = CKEDITOR.instances.editor;

  if (!editor) {
    console.error("❌ CKEditor instance not ready");
    return;
  }

  editor.setData(html);
}

/* ============================
   CKEditor Initialization
============================ */
window.addEventListener("load", function () {
  if (typeof CKEDITOR === "undefined") {
    console.error("❌ CKEditor not loaded");
    return;
  }

  CKEDITOR.replace("editor", {
    height: 400,
    removePlugins: "elementspath",
    resize_enabled: false,
    toolbar: [
      { name: "basicstyles", items: ["Bold", "Italic", "Underline"] },
      { name: "paragraph", items: ["NumberedList", "BulletedList", "Blockquote"] },
      { name: "links", items: ["Link", "Unlink"] },
      { name: "insert", items: ["Image", "Table"] },
      { name: "clipboard", items: ["Undo", "Redo"] },
      { name: "tools", items: ["Maximize"] }
    ]
  });

  CKEDITOR.on("instanceReady", function (evt) {
    if (evt.editor.name === "editor") {
      editorReady = true;
      console.log("✅ CKEditor is ready");
    }
  });
});


/* ============================
   Generate Blog
============================ */
async function generateBlog() {
  const prompt = document.getElementById("prompt").value;
  const tone = document.getElementById("tone").value;
  const language = document.getElementById("language").value;

  if (!prompt.trim()) {
    alert("Please enter a blog topic");
    return;
  }

  if (!editorReady) {
    alert("Editor is still loading. Please try again.");
    return;
  }

  setEditorData("<p>⏳ Generating blog… please wait.</p>");

  try {
    const response = await fetch("/api/generate-blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt,
        tone: tone,
        language: language
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to generate blog");
    }

    setEditorData(data.blog);

  } catch (error) {
    console.error(error);
    setEditorData("<p>❌ Error generating blog.</p>");
  }
}

/* ============================
   Fetch Images (Pexels Backend)
============================ */
async function fetchImages() {
  const topic = document.getElementById("prompt").value;
  const container = document.getElementById("imageResults");

  if (!topic.trim()) {
    alert("Enter a topic to fetch images");
    return;
  }

  container.innerHTML = "<p class='text-sm text-zinc-400'>Loading images…</p>";

  try {
    const res = await fetch(`/api/images?query=${encodeURIComponent(topic)}`);
    const data = await res.json();

    container.innerHTML = "";

    if (!data.images || data.images.length === 0) {
      container.innerHTML = "<p class='text-sm text-zinc-400'>No images found</p>";
      return;
    }

    data.images.forEach(img => {
      const imageEl = document.createElement("img");
      imageEl.src = img.thumbnail;
      imageEl.className = "cursor-pointer rounded hover:opacity-80";
      imageEl.title = "Click to insert image";

      imageEl.onclick = () => insertImageToEditor(img.original);

      container.appendChild(imageEl);
    });

  } catch (error) {
    console.error(error);
    container.innerHTML = "<p class='text-sm text-red-400'>Failed to load images</p>";
  }
}

/* ============================
   Insert Image into CKEditor
============================ */
function insertImageToEditor(imageUrl) {
  const editor = CKEDITOR.instances.editor;

  if (!editor) {
    console.error("❌ Editor not ready");
    return;
  }

  editor.insertHtml(`
    <figure>
      <img src="${imageUrl}" alt="Blog image" style="max-width:100%; height:auto;" />
    </figure>
  `);
}

function getSelectedText() {
  const editor = CKEDITOR.instances.editor;
  if (!editor) return "";

  const selection = editor.getSelection();
  if (!selection) return "";

  const ranges = selection.getRanges();
  if (!ranges || ranges.length === 0) return "";

  const fragment = ranges[0].cloneContents();

  // Convert fragment to HTML
  const container = new CKEDITOR.dom.element("div");
  container.append(fragment);

  return container.getText().trim();
}


function replaceSelectedText(newHtml) {
  const editor = CKEDITOR.instances.editor;
  if (!editor) return;

  editor.insertHtml(newHtml);
}


function showSelectionToolbar() {
  const editor = CKEDITOR.instances.editor;
  const toolbar = document.getElementById("selectionToolbar");

  if (!editor || !toolbar) return;

  const selectedText = getSelectedText();
  if (!selectedText) {
    toolbar.classList.add("hidden");
    return;
  }

  // Get editor container position
  const editorBox = editor.container.$.getBoundingClientRect();

  toolbar.style.top = editorBox.top + window.scrollY - 50 + "px";
  toolbar.style.left = editorBox.left + window.scrollX + 20 + "px";

  toolbar.classList.remove("hidden");
}

CKEDITOR.on("instanceReady", function (evt) {
  if (evt.editor.name === "editor") {
    editorReady = true;
    console.log("✅ CKEditor is ready");

    // 🔥 Listen to CKEditor selection changes
    evt.editor.on("selectionChange", function () {
      showSelectionToolbar();
    });

    evt.editor.on("blur", function () {
      document
        .getElementById("selectionToolbar")
        .classList.add("hidden");
    });
  }
});

async function regenerate(action) {
  const editor = CKEDITOR.instances.editor;
  if (!editor) return;

  console.log("🟢 Regenerate clicked:", action);

  const selection = editor.getSelection();
  if (!selection) return;

  const ranges = selection.getRanges();
  if (!ranges || ranges.length === 0) return;

  // ✅ SAVE selection
  savedRange = ranges[0];

  const selectedHtml = getSelectedHtml();
  if (!selectedHtml) return;

  // Temporary placeholder
  editor.insertHtml("<em>⏳ Regenerating...</em>");

  try {
    const res = await fetch("/api/regenerate-section", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: selectedHtml,
        action: action
      })
    });

    const data = await res.json();
    console.log("🟢 API response:", data);

    if (!res.ok) throw new Error(data.detail || "Failed");

    // ✅ RESTORE selection
    editor.getSelection().selectRanges([savedRange]);

    // ✅ Replace selection with AI output
    editor.insertHtml(data.result);

  } catch (err) {
    console.error(err);
    editor.insertHtml("<strong>❌ Failed</strong>");
  }
}

